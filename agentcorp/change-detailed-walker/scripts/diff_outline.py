#!/usr/bin/env python3
"""输出 base..head 的 diff 大纲,带每条改动行的真实新/旧文件行号。

walker 据此精确锚定评论(new_position/old_position),不必自己数行(易 off-by-one)。
每个 hunk 还给出改动行数,便于按密度规划"大 hunk 拆几条"。目标仓库只读。

输出 JSON:
  {"files":[{"path","status","hunks":[
      {"header","new_lo","new_hi","old_lo","old_hi","changed",
       "lines":[{"op":"+|-| ","new":<int|null>,"old":<int|null>,"text":...}]}]}]}
"""
import argparse
import json
import re
import subprocess
import sys

HUNK_RE = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@(.*)")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True)
    ap.add_argument("--merge-base", required=True)
    ap.add_argument("--head", required=True)
    ap.add_argument("--context", type=int, default=3)
    args = ap.parse_args()

    rng = "HEAD" if args.head == "WORKTREE" else f"{args.merge_base}..{args.head}"
    diff = subprocess.run(
        ["git", "-C", args.repo, "diff", "--no-color", "--no-renames", f"-U{args.context}", rng],
        capture_output=True, text=True, check=True).stdout

    files = []
    cur_file = None
    cur_hunk = None
    new_path = old_path = None
    new_n = old_n = 0
    for line in diff.splitlines():
        if line.startswith("diff --git"):
            new_path = old_path = None
            cur_file = None
            cur_hunk = None
        elif line.startswith("--- "):
            p = line[4:].strip()
            old_path = None if p == "/dev/null" else (p[2:] if p.startswith("a/") else p)
        elif line.startswith("+++ "):
            p = line[4:].strip()
            new_path = None if p == "/dev/null" else (p[2:] if p.startswith("b/") else p)
            status = "added" if old_path is None else "deleted" if new_path is None else "modified"
            cur_file = {"path": new_path or old_path, "status": status, "hunks": []}
            files.append(cur_file)
        elif line.startswith("@@"):
            m = HUNK_RE.match(line)
            if not m or cur_file is None:
                continue
            old_s = int(m.group(1)); old_c = int(m.group(2) or "1")
            new_s = int(m.group(3)); new_c = int(m.group(4) or "1")
            cur_hunk = {"header": line[:80], "new_lo": new_s, "new_hi": new_s + max(new_c - 1, 0),
                        "old_lo": old_s, "old_hi": old_s + max(old_c - 1, 0),
                        "changed": 0, "lines": []}
            cur_file["hunks"].append(cur_hunk)
            new_n = new_s
            old_n = old_s
        elif cur_hunk is not None and line and line[0] in "+- " and not line.startswith(("+++", "---")):
            op = line[0]
            text = line[1:]
            rec = {"op": op, "text": text}
            if op == "+":
                rec["new"] = new_n; rec["old"] = None; new_n += 1; cur_hunk["changed"] += 1
            elif op == "-":
                rec["new"] = None; rec["old"] = old_n; old_n += 1; cur_hunk["changed"] += 1
            else:
                rec["new"] = new_n; rec["old"] = old_n; new_n += 1; old_n += 1
            cur_hunk["lines"].append(rec)

    print(json.dumps({"files": files}, ensure_ascii=False))


if __name__ == "__main__":
    sys.exit(main())
