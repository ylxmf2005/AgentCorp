#!/usr/bin/env python3
"""把目标仓库的 base..head 比较镜像成本地 forge 的一个 PR。

做法:不推目标仓库的真实历史(可能几百 MB),而是只把**改动到的文件**抽成两个
快照提交(base 快照 / head 快照)推上去——forge 仓库只装这次的 diff,推送极小,
PR 的 base..head diff 与 `git diff --no-renames <merge_base>..<head>` 逐行一致。

目标仓库严格只读:只用 `git show` / `git diff` 读取,从不写回(连 .git 也不写)。
覆盖率闸与 diff_outline 同样用 --no-renames 的真实 diff,行号与此 PR 一致。
"""
import argparse
import json
import subprocess
import sys
import tempfile
import time
from pathlib import Path
from urllib.parse import quote, urlsplit, urlunsplit

sys.path.insert(0, str(Path(__file__).resolve().parent))
from forge_common import load_config, api  # noqa: E402


def git(repo, *args, check=True, binary=False):
    return subprocess.run(["git", "-C", repo, *args], check=check,
                          capture_output=True, text=not binary)


def changed_files(repo, merge_base, head):
    rng = "HEAD" if head == "WORKTREE" else f"{merge_base}..{head}"
    out = git(repo, "diff", "--no-renames", "--name-status", rng).stdout
    base_files, head_files = [], []
    for line in out.splitlines():
        if not line.strip():
            continue
        parts = line.split("\t")
        st, path = parts[0][0], parts[-1]
        if st in ("M", "D"):
            base_files.append(path)
        if st in ("M", "A"):
            head_files.append(path)
    return base_files, head_files


def write_snapshot(repo, ref, paths, dest: Path):
    """ref 为 commit 时用 git show；ref=="WORKTREE" 时从工作区磁盘读当前文件。"""
    for rel in paths:
        if ref == "WORKTREE":
            src = Path(repo) / rel
            if not src.exists():
                continue
            blob = src.read_bytes()
        else:
            blob = git(repo, "show", f"{ref}:{rel}", binary=True).stdout
        fp = dest / rel
        fp.parent.mkdir(parents=True, exist_ok=True)
        fp.write_bytes(blob)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True, help="目标本地 git 仓库路径(只读)")
    ap.add_argument("--base", required=True, help="base ref,如 origin/main；worktree 模式下忽略,base 取 HEAD")
    ap.add_argument("--head", required=True, help="head ref/sha；传 WORKTREE 表示对比工作区未提交改动")
    ap.add_argument("--name", required=True, help="forge 上的 repo 名")
    ap.add_argument("--title", default=None)
    ap.add_argument("--base-branch", default="base")
    ap.add_argument("--head-branch", default="head")
    args = ap.parse_args()

    cfg = load_config()
    if not cfg.get("url") or not cfg.get("token"):
        print(json.dumps({"status": "error", "msg": "forge 未配置,先跑 setup_forge.py"}), file=sys.stderr)
        return 1
    owner = cfg["user"]

    wt = (args.head == "WORKTREE")
    if wt:
        head_sha = "WORKTREE"
        merge_base = git(args.repo, "rev-parse", "HEAD").stdout.strip()
    else:
        head_sha = git(args.repo, "rev-parse", args.head).stdout.strip()
        merge_base = git(args.repo, "merge-base", args.base, args.head).stdout.strip()
    if not merge_base:
        print(json.dumps({"status": "error", "msg": "无法解析 base/head"}), file=sys.stderr)
        return 1

    base_files, head_files = changed_files(args.repo, merge_base, head_sha)

    # 在临时仓库构造 base/head 两个快照提交(只含改动文件)
    tmp = Path(tempfile.mkdtemp(prefix="walker-mirror-"))
    git(str(tmp), "init", "-q")
    git(str(tmp), "config", "user.email", "walker@local")
    git(str(tmp), "config", "user.name", "walker")
    git(str(tmp), "checkout", "-q", "-b", args.base_branch)
    write_snapshot(args.repo, merge_base, base_files, tmp)
    git(str(tmp), "add", "-A")
    git(str(tmp), "commit", "-q", "--allow-empty", "-m", f"base snapshot @ {merge_base[:12]}")
    # head 快照:清掉工作树已跟踪文件,写 head 版本
    for rel in base_files:
        fp = tmp / rel
        if fp.exists():
            fp.unlink()
    write_snapshot(args.repo, head_sha, head_files, tmp)
    git(str(tmp), "checkout", "-q", "-b", args.head_branch)
    git(str(tmp), "add", "-A")
    git(str(tmp), "commit", "-q", "--allow-empty", "-m", f"head snapshot @ {head_sha[:12]}")

    # 确保 forge repo 存在
    r = api(cfg, "GET", f"/repos/{owner}/{args.name}")
    if r.get("code") == 404:
        api(cfg, "POST", "/user/repos", body={"name": args.name, "private": True, "auto_init": False})

    sp = urlsplit(cfg["url"])
    netloc = f"{quote(owner)}:{quote(cfg['token'])}@{sp.netloc}"
    push_url = urlunsplit((sp.scheme, netloc, f"/{owner}/{args.name}.git", "", ""))
    git(str(tmp), "push", "-f", push_url, f"{args.base_branch}:refs/heads/{args.base_branch}")
    git(str(tmp), "push", "-f", push_url, f"{args.head_branch}:refs/heads/{args.head_branch}")

    # 开 PR(紧跟 push 分支可能未索引,重试)
    title = args.title or f"walkthrough {args.head_branch} vs {args.base_branch}"
    index = None
    last = None
    for _ in range(6):
        pr = api(cfg, "POST", f"/repos/{owner}/{args.name}/pulls",
                 body={"head": args.head_branch, "base": args.base_branch, "title": title})
        last = pr
        j = pr.get("json")
        if isinstance(j, dict) and j.get("number"):
            index = j["number"]
            break
        if isinstance(j, dict) and "exist" in str(j.get("message", "")).lower():
            ex = api(cfg, "GET", f"/repos/{owner}/{args.name}/pulls?state=open")
            arr = ex.get("json") or []
            if arr:
                index = arr[0]["number"]
                break
        time.sleep(2)

    # 清理临时仓库
    subprocess.run(["rm", "-rf", str(tmp)], check=False)

    if not index:
        print(json.dumps({"status": "error", "msg": "PR 创建失败", "resp": last}), file=sys.stderr)
        return 1

    out = {
        "status": "ok", "owner": owner, "repo": args.name, "index": index,
        "base_branch": args.base_branch, "head_branch": args.head_branch,
        "merge_base": merge_base, "head_sha": head_sha,
        "changed_files": len(set(base_files) | set(head_files)),
        "files_url": f"{cfg['url']}/{owner}/{args.name}/pulls/{index}/files",
    }
    print(json.dumps(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
