# 逐 hunk 评论写作规则

本文定义 `comments.jsonl` 中每条评论怎么写。评论数据字段、分类枚举、写作质量与追溯纪律均以本文为准。

## 评论行 schema

`comments.jsonl` 是 UTF-8 JSON Lines，每行一个 object。五个基础字段必填，`code_refs` 可选：

| 字段 | 规则 |
| --- | --- |
| `id` | 锚定 `diff.json` 中某个 hunk id，或无 hunk 文件的 file id。 |
| `file` | 展示路径；deleted 取 `old_path`，其他情况取 `new_path`。 |
| `classification` | 六值枚举：`core`、`supporting`、`mechanical`、`suspect-refactor`、`suspect-residue`、`untraceable`。 |
| `why` | 非空 zh-CN markdown，回答「为什么改」。 |
| `trace` | 字符串数组，可为空；写上游产物、commit 或关联 hunk id。 |
| `code_refs` | 可选数组；每项含 `path`、`side: old|new`、`start_line`、`end_line`，可含 `label`。 |

示例：

```json
{"id":"h-3f2a9c1d8e4b","file":"src/helpers/db_helper.py","classification":"supporting","why":"`get_project_files` 原来只按 project_id 查询；本 hunk 给查询加上 `asset_flag` 过滤，是 asset 主流程（见 trace）牵连的取数口径调整。","trace":["requirements/validated-requirements.md FR-1","target-repo 1a2b3c4 feat: asset flow"]}
```

## 四条原则的逐 hunk 落点

### 读者没读过这片代码

每条评论先用一句话交代该 hunk 触及的代码原职责，再解释这次为什么改。文件内第一个相关 hunk 要介绍该文件或模块的职责；同文件后续 hunk 可引用前文，但不能假设读者已经知道调用图。

### 忠于 diff

评论必须点名该 hunk 实际出现的标识符、字段、分支、调用或结构变化。自检标准：把这条评论换到另一个 hunk 下面会明显不成立；如果换 hunk 仍成立，它就太泛。

### 区分 churn 与语义

`classification` 使用六值枚举：

| 分类 | 判法 | 示例 |
| --- | --- | --- |
| `core` | 直接承载本次主体能力或主要修复 | 新增入口校验、核心服务分支、主流程数据写入 |
| `supporting` | 为主体能力提供必要支撑 | 调用点透传字段、测试 fixture、辅助查询调整 |
| `mechanical` | 机械 churn，行为意图很弱或无行为变化 | import 重排、格式化、批量 rename、生成代码同步 |
| `suspect-refactor` | 看起来像顺手重构，授权链不清 | 抽 helper、改命名、重排控制流但与需求关系弱 |
| `suspect-residue` | 疑似早期方案残留或需求外语义 | 未被调用的新分支、临时开关、无入口字段 |
| `untraceable` | 读不到可信授权或意图证据 | diff 存在，但需求、设计、commit、邻近代码都解释不了 |

`mechanical` 可以简短，但必须说清是哪类机械变化；不能用 `mechanical` 掩盖行为改动。

### 阅读顺序靠 trace 串联

单文档时代的重排阅读路径在这里改为：页面按文件组织、hunk 按 diff 自然序呈现，跨 hunk 的因果通过 `trace` 与评论正文互相指认。需要连接上下文时，写清「配合 `h-...` 的字段新增」或「由 `requirements/... FR-2` 授权」。

如果分支没有需求、设计或评审文档，trace 可以只做 commit 追溯，格式写 `<repo 代称> <短sha> <commit 主题关键词>`，例如 `target-repo 1a2b3c4 fix clone default title`；不要为凑 trace 编造不存在的上游产物。

### 代码引用靠 code_refs 定位

`trace` 回答「这个改动的授权从哪来」，取产物、commit 或 hunk 级线索；`code_refs` 回答「去看哪段代码」，取结构化代码坐标。两者互不替代。

评论引用 hunk 之外的支撑代码、或讲跨文件因果时，写结构化 `code_refs`，不要只在 `why` 里写裸路径或行号；前端不会解析裸路径。`[[ref:N]]` 只是把第 N 个 `code_refs` 内联到正文的辅助写法，评论卡片底部的完整相关代码列表才是基线。

## 写作层规则

- 评论使用 zh-CN；代码标识符、路径、字段名、命令保持原样。
- `why` 回答「为什么这里要改」，不是复述「这里改了什么」。
- `core` 与 `supporting` 至少一条 `trace`；没有 trace 就不能标成这两类。
- `untraceable` 不许编造引用；`trace` 可以为空，但 `why` 要说明已尝试过哪些证据仍无法追溯。
- `suspect-refactor` 与 `suspect-residue` 要写出可疑点，不要只贴标签。
- 评论新增 util/helper 类 hunk 时，核对仓库是否已有同职责工具；疑似重复造轮按 `suspect-refactor` 写明可疑点。
- 评论测试类 hunk 时，指出其覆盖是否只有 happy path；这只是提示，不替代测试负责人裁决。
- 超大 hunk 可以用列表分点，但每点仍要落到该 hunk 的实际标识符或结构变化。
- `file` 字段取展示路径：删除用 `old_path`，其他情况用 `new_path`。
- 同一 id 需要修订时可追加新行，后行生效；不要删除历史行来假装没有修订过程。
