#!/usr/bin/env python3
"""把 walker 产出的函数级评论批量灌进 forge PR(一次 POST 建一个 review)。

输入评论文件(JSON):
  {
    "body": "<可选总评>",
    "comments": [
      {"path": "<file>", "body": "<why,zh-CN>", "new_position": <新文件行号>},
      {"path": "<file>", "body": "...", "old_position": <旧文件行号>}
    ]
  }
new_position 锚新增/上下文行(+),old_position 锚删除行(-)。一条评论二选一给行号。
分批:Gitea 单次 review 可带整批 comments;评论极多时按 --chunk 分多个 review。
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from forge_common import load_config, api  # noqa: E402


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--repo", required=True, help="forge repo 名")
    ap.add_argument("--index", required=True, type=int, help="PR number")
    ap.add_argument("--comments", required=True, help="评论 JSON 文件,或 - 读 stdin")
    ap.add_argument("--chunk", type=int, default=200, help="每个 review 最多评论数")
    args = ap.parse_args()

    cfg = load_config()
    owner = cfg["user"]
    raw = sys.stdin.read() if args.comments == "-" else Path(args.comments).read_text()
    data = json.loads(raw)
    overall = data.get("body", "")
    comments = data.get("comments", [])
    if not comments:
        print(json.dumps({"status": "error", "msg": "无评论"}), file=sys.stderr)
        return 1

    # 规范化:每条必须有 path + body + (new_position 或 old_position)
    norm = []
    for c in comments:
        if not c.get("path") or not c.get("body"):
            continue
        item = {"path": c["path"], "body": c["body"]}
        if c.get("new_position") is not None:
            item["new_position"] = int(c["new_position"])
        if c.get("old_position") is not None:
            item["old_position"] = int(c["old_position"])
        if "new_position" not in item and "old_position" not in item:
            continue
        norm.append(item)

    review_ids = []
    for i in range(0, len(norm), args.chunk):
        batch = norm[i:i + args.chunk]
        body = {"event": "COMMENT", "body": overall if i == 0 else "", "comments": batch}
        r = api(cfg, "POST", f"/repos/{owner}/{args.repo}/pulls/{args.index}/reviews", body=body)
        j = r.get("json")
        if not (isinstance(j, dict) and j.get("id")):
            print(json.dumps({"status": "error", "batch": i, "resp": r}), file=sys.stderr)
            return 1
        review_ids.append(j["id"])

    print(json.dumps({"status": "ok", "review_ids": review_ids,
                      "posted": len(norm), "skipped": len(comments) - len(norm)}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
