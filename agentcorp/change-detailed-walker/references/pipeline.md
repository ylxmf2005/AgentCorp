# 逐 hunk 走查管线

本文定义 change-detailed-walker 的运行管线。命令签名、数据面与退出码语义以本文为准，评论行字段与枚举见 `references/hunk-comment.md`。

## 三条命令

抽取 diff：

```bash
python3 <skill>/scripts/extract_diff.py --repo <path> --base <ref> [--head <ref>] --out <dir> [--include-worktree] [--no-fulltext]
```

校验覆盖：

```bash
python3 <skill>/scripts/validate_coverage.py --data <dir> [--comments <file>]
```

启动 viewer：

```bash
python3 <skill>/scripts/serve.py --data <dir> [--port 8123]
```

## 输出目录

编排默认输出目录为 `<task_root>/walkthrough/`，也可由 assignment 指定。输出目录必须在目标仓库外，目录内有三个数据面：

```text
<OUT_DIR>/
├── diff.json
├── comments.jsonl
└── contents/
```

`diff.json` 只由抽取端写；`comments.jsonl` 只由讲解 agent 写；`contents/` 默认由抽取端写入完整文件内容，`--no-fulltext` 时可不存在。讲解 agent 对 `diff.json` 与 `contents/` 都只有读取权。

## 批次策略

- 默认一文件一批。
- 单文件超过 20 个 hunk 时，拆成连续 hunk 段。
- 超大单 hunk 单独成批。
- 批次是上下文窗口管理单位，不是必须并行的单位；默认顺序写最稳。

## 上下文阶梯

每批按从便宜到贵的顺序取上下文，够用即停：

1. `diff.json` 中该批 hunk 的逐行内容。
2. `git -C <repo> show HEAD:<path>` 查看文件完整现状。
3. `git -C <repo> log --oneline <merge-base>..HEAD -- <path>` 查看该文件相关 commit。
4. assignment 授权清单中的需求、设计、计划、评审、验证原文。

所有目标仓库操作都是只读；绝不 checkout、stash、写临时文件或修改目标仓库。

## 并行分片

如 assignment 明确允许并行，worker 不直接共同写 `comments.jsonl`。每个分片写独立文件：

```text
comments.part-NN.jsonl
```

walker 收尾时按分片顺序合并为 `comments.jsonl`，再运行校验器。合并前要确认每个分片都是 JSONL，空行可保留，坏行必须修掉或让校验器报出后修掉。

分片编号必须保持 `comments.part-NN.jsonl` 的两位零填充。标准合并和预检命令原文：

```bash
cat <dir>/comments.part-*.jsonl > <dir>/comments.jsonl
python3 <skill>/scripts/validate_coverage.py --data <dir>
```

## 校验回路

每批或全部批次完成后运行：

```bash
python3 <skill>/scripts/validate_coverage.py --data <dir> [--comments <file>]
```

`COVERAGE OK: n/n` 且退出 0 才表示讲解阶段完成。退出 1 表示评论侧违例：出现 `MISSING` 就补写缺失 id，出现 `UNKNOWN` 就修正过期或写错的 id，出现 `BAD_LINE` 就修 JSONL 行。退出 2 表示数据源问题：`diff.json` 缺失、损坏或覆盖单元 id 重复；`DUPLICATE_ID` 属抽取端 bug，不是评论问题。`contents/` 与 `fulltext` 不参与覆盖率对账。receipt 必须附校验器输出原文。

## serve 使用

校验通过后运行：

```bash
python3 <skill>/scripts/serve.py --data <dir> [--port 8123]
```

服务只绑定 `127.0.0.1`。启动成功后把打印出的 URL 写进交付说明；端口被占时换 `--port`，不要改 viewer 或复制数据文件。

## 最小自检

维护 `scripts/` 或 `assets/viewer/` 后，至少在目标仓库外用 `/tmp` 产物跑以下检查；运行 Python 命令时带 `PYTHONPYCACHEPREFIX=/tmp/agentcorp-pycache`，避免在 skill 目录生成 `__pycache__/`：

```bash
PYTHONPYCACHEPREFIX=/tmp/agentcorp-pycache python3 <skill>/scripts/extract_diff.py --repo <repo> --base <ref> --out /tmp/cdw-selfcheck-1
jq '[.files[].hunks | length] | add // 0' /tmp/cdw-selfcheck-1/diff.json
git -C <repo> diff <ref>...HEAD | grep -c '^@@'
```

两条计数应相等。同一 HEAD 跑两次到不同目录，`cmp run1/diff.json run2/diff.json` 应无输出。已有全覆盖 `comments.jsonl` 时，`validate_coverage.py --data <dir>` 应输出 `COVERAGE OK` 且退出 0；删掉一条唯一 id 的评论副本应列出该 id 的 `MISSING` 且退出 1；挪走 `diff.json` 应退出 2。负路径抽查：`--include-worktree` 与显式 `--head` 同时给出应退出 2，`--out` 指向 repo 内应退出 2。

skill 文本自检：

```bash
python3 tools/validate-skills.py
# 这里故意拼接 grep pattern，避免自检源码含旧文档名字面量而被自身扫描命中。
old_walkthrough='walkthrough'
grep -rn "${old_walkthrough}-doc\\|change-detailed-${old_walkthrough}" agentcorp/ tools/ hooks/
```

后一条 grep 应无输出。
