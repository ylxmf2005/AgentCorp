#!/usr/bin/env python3
"""覆盖率机器闸:确保 PR 的每个改动 hunk 都有函数级评论,大 hunk 评论密度达标。

这是本工具不可替代的价值——把"每个改动都讲到、大段不能一条糊弄"变成退出码,
而不是一句嘱咐。数据源是 forge 读回的 review 评论(position/original_position),
对账对象是 `git diff <merge_base>..<head>` 的 hunk。

判定:
- 每个 hunk(@@ 块)至少要有 1 条评论,其锚点行落在该 hunk 的新侧或旧侧行区间内。
- 大 hunk(改动行 > --big,默认 20):评论数须 >= ceil(改动行 / --density,默认 40),
  逼着大段按函数拆多条,而不是一条扫过。
- 任一 hunk 不达标 → 列出缺口,非 0 退出。

目标仓库只读。
"""
import argparse
import json
import math
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from forge_common import load_config, api  # noqa: E402

HUNK_RE = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@")


def git_diff(repo, merge_base, head):
    rng = "HEAD" if head == "WORKTREE" else f"{merge_base}..{head}"
    r = subprocess.run(["git", "-C", repo, "diff", "--no-color", "--no-renames", "-U3", rng],
                       capture_output=True, text=True, check=True)
    return r.stdout


def parse_hunks(diff_text):
    """解析 unified diff → 每个 hunk 的 {path, new/old 行区间, changed 行数}。"""
    hunks = []
    new_path = old_path = None
    cur = None
    for line in diff_text.splitlines():
        if line.startswith("diff --git"):
            new_path = old_path = None
            cur = None
        elif line.startswith("--- "):
            p = line[4:].strip()
            old_path = None if p == "/dev/null" else (p[2:] if p.startswith("a/") else p)
        elif line.startswith("+++ "):
            p = line[4:].strip()
            new_path = None if p == "/dev/null" else (p[2:] if p.startswith("b/") else p)
        elif line.startswith("@@"):
            m = HUNK_RE.match(line)
            if not m:
                continue
            old_s = int(m.group(1)); old_c = int(m.group(2) or "1")
            new_s = int(m.group(3)); new_c = int(m.group(4) or "1")
            cur = {"path": new_path or old_path,
                   "new_lo": new_s, "new_hi": new_s + max(new_c - 1, 0),
                   "old_lo": old_s, "old_hi": old_s + max(old_c - 1, 0), "changed": 0}
            hunks.append(cur)
        elif cur is not None and line and line[0] in "+-" and not line.startswith(("+++", "---")):
            cur["changed"] += 1
    return [h for h in hunks if h["path"]]


def fetch_comments(cfg, owner, repo, index):
    out = []
    rv = api(cfg, "GET", f"/repos/{owner}/{repo}/pulls/{index}/reviews")
    for r in (rv.get("json") or []):
        rid = r.get("id")
        cm = api(cfg, "GET", f"/repos/{owner}/{repo}/pulls/{index}/reviews/{rid}/comments")
        for c in (cm.get("json") or []):
            out.append({"path": c.get("path"),
                        "new": c.get("position") or 0,
                        "old": c.get("original_position") or 0})
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True, help="目标本地 git 仓库(只读)")
    ap.add_argument("--merge-base", required=True)
    ap.add_argument("--head", required=True)
    ap.add_argument("--forge-repo", required=True)
    ap.add_argument("--index", required=True, type=int)
    ap.add_argument("--big", type=int, default=20, help="大 hunk 改动行阈值")
    ap.add_argument("--density", type=int, default=40, help="大 hunk 每多少改动行至少一条评论")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    cfg = load_config()
    owner = cfg["user"]
    diff = git_diff(args.repo, args.merge_base, args.head)
    hunks = parse_hunks(diff)
    comments = fetch_comments(cfg, owner, args.forge_repo, args.index)

    # 按文件聚合评论锚点
    by_path = {}
    for c in comments:
        by_path.setdefault(c["path"], []).append(c)

    gaps = []
    for h in hunks:
        cs = by_path.get(h["path"], [])
        hits = [c for c in cs
                if (c["new"] and h["new_lo"] <= c["new"] <= h["new_hi"])
                or (c["old"] and h["old_lo"] <= c["old"] <= h["old_hi"])]
        need = 1
        if h["changed"] > args.big:
            need = max(1, math.ceil(h["changed"] / args.density))
        if len(hits) < need:
            gaps.append({"path": h["path"], "new_lo": h["new_lo"], "new_hi": h["new_hi"],
                         "changed": h["changed"], "have": len(hits), "need": need})

    result = {"hunks": len(hunks), "comments": len(comments),
              "gaps": gaps, "passed": not gaps}
    if args.json:
        print(json.dumps(result))
    else:
        print(f"hunks={len(hunks)} comments={len(comments)} gaps={len(gaps)}")
        for g in gaps:
            print(f"  GAP {g['path']} new:{g['new_lo']}-{g['new_hi']} "
                  f"changed={g['changed']} have={g['have']} need={g['need']}")
        print("COVERAGE OK" if not gaps else "COVERAGE FAIL")
    return 0 if not gaps else 1


if __name__ == "__main__":
    sys.exit(main())
