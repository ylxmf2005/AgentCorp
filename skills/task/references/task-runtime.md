# Task Runtime

Task Runtime 是 Active Task 核心状态的唯一写入者。它不依赖 Hook，也不观察每次工具调用；它通过明确的工作单元边界、仓库快照、产物 hash 和完成门禁，让 `.runtime/summary.json`、`task.md`、`timeline.md` 与真实工作保持可检查的一致。

## 文件所有权

```text
<task-workspace>/
├── task.md              # Runtime 生成的当前用户视图
├── timeline.md          # Runtime 生成的任务历史
├── .runtime/
│   ├── state.json       # 核心机器状态与事件；只有 Runtime 修改
│   └── summary.json     # Runtime 生成的轻量机器投影
└── <专业产物>            # Shape、Dev、Review、Test 等各自拥有
```

`.runtime/state.json` 是核心状态源。`.runtime/summary.json`、`task.md` 和 `timeline.md` 是它的投影，不能直接编辑。`summary.json` 只保存目录和 UI 首屏需要的计数、状态与当前工作，不拥有任何独立事实。人工维护使用的 `longrein task doctor --fix` 只会重新生成三个投影并修复 Registry 指针；它不会把手工编辑、未知代码变化或产物漂移自动承认为有效状态。

每个 schema v2 Task 同时拥有全局唯一的 `taskUid` 和供人阅读的 `taskId`。`taskId` 可以重名；按 id 查找时只有唯一匹配才可继续。Runtime 在 `${LONGREIN_HOME:-~/.longrein}/registry/tasks/<taskUid>.json` 保存 Task workspace、状态文件和摘要文件的绝对位置。Registry 是入口目录，不复制当前状态；聚合时仍读取 Task 自己的状态或生成摘要。

专业产物不是 Runtime 生成物。对应 Skill 先修订自己拥有的代码或产物，再通过 Longrein MCP 登记产物状态、发现、工作结果或验证证据。

Runtime 不迁移旧 schema 或旧式 Task。目录缺少当前 schema 的 `.runtime/state.json` 时不能 resume；如果目标仍需继续，创建新的 Runtime Task 并重新建立可信 Context。

`task create` 也不会覆盖目录中已经存在的 `task.md`、`timeline.md`、`.runtime/state.json` 或 `.runtime/summary.json`，因此新 Task 必须使用新的 workspace。Task workspace 的绝对位置属于状态契约；直接移动目录会被 Registry 报告为 missing，不能靠改指针掩盖。

## Registry 与目录

MCP 创建 Task 时自动注册；人工恢复与诊断命令接受 workspace 路径、Task UID 或唯一 task id。Registry 只负责发现：

```bash
longrein task list [--json]
longrein task register <task-path>
longrein task unregister <task-ref>
longrein task registry doctor [--json]
```

`unregister` 只删除全局入口，不删除 Task workspace。Registry 缺失或损坏时，由人使用 Task 路径运行 `longrein task doctor --fix` 或 `longrein task register` 重建。Task 状态已经成功更新、但 Registry 写入失败时，以 `state.json` 为准并公开同步失败，再从路径修复；Agent 不改用 CLI，也不要手工修改 Registry 或 Runtime 文件。

## 为什么不用 Hook

Longrein 不要求安装或信任生命周期 Hook。更新协议只依赖显式边界：

1. 工作开始前登记 Now，并保存当前仓库快照；
2. 工作完成或阻塞时登记结果，并与开始快照比较；
3. 专业产物发布时保存内容 hash；
4. 交接和完成前运行 doctor；
5. 有未解释的仓库变化、产物漂移、生成投影漂移或未通过的完成证据时，完成门禁拒绝关闭 Task。

这不承诺实时捕获 Agent 没有表达的内部想法，也不把普通读文件、搜索和命令写入 Timeline。它保证的是：Task 在明确交接或完成边界上不能把未同步变化包装成可信状态。

## 交互协议

Codex 与 Claude Code 通过 Longrein MCP 使用 Task Runtime。一个宿主会话只启动一次 stdio server，后续调用复用同一 Node
进程。MCP 工具按任务意图组织：

```text
longrein_task_read       list | show | doctor
longrein_task_create     创建并注册 Task
longrein_task_context    建立或修订 Context
longrein_work_start      开始工作单元
longrein_checkpoint      finding、artifact、verification、finish | block
longrein_task_close      complete | abandon | supersede
```

每个工具都有显式 input/output schema 和准确的读写、破坏性、幂等、开放世界提示。工具只返回当前判断
所需的紧凑结构；需要完整状态时显式使用 `longrein_task_read show`。`checkpoint` 按输入顺序的固定类别
执行，任一步失败后停止并返回 `completed_steps`。相同请求仅在当前 MCP 进程内短期去重；进程重启后的
重试可能再次产生 Timeline 事件，因此部分失败后必须先读取 Task，不能把传输重试当成持久事务。

登记粒度跟随可恢复、可审查的语义变化，而不是工具调用次数。连续实现细节可以留在同一工作单元并在检查点汇总；已经改变后续判断、Task Context、产物状态或完成证据的结果，应在最近的有意义检查点登记，不能把整个 Phase 中形成的变化都推迟到最后回忆。

MCP 是 Agent 唯一的 Runtime 接口。它不可用时停止依赖状态写入的工作并报告阻塞，不改用 shell 或直接修改 Runtime 文件。

## 状态与专业能力分离

Task 生命周期使用：

```text
shaping → ready → working → verifying → complete
                    ↘ waiting | blocked
```

`abandoned` 和 `superseded` 是保留终态。Shape、Dev、Review、Test 等是当前工作单元使用的专业能力，不是 Task 生命周期；Runtime 不要求所有 Task 经过固定 Skill 阶段。

## 本地 Dashboard API

`longrein dashboard` 启动只绑定 `127.0.0.1` 的本地 HTTP 服务。API v1 提供：

```text
GET /api/v1/meta
GET /api/v1/tasks
GET /api/v1/tasks/:taskUid
GET /api/v1/tasks/:taskUid/health
GET /api/v1/tasks/:taskUid/artifacts/:artifactId/content
POST /api/v1/tasks/:taskUid/open?target=workspace|repository&application=finder|vscode|terminal
POST /api/v1/tasks/:taskUid/reveal?path=<relative>&application=vscode|finder[&line=<number>]
```

Artifact 预览只读取已经登记的文件；文本上限为 2 MiB，二进制和超限文件只返回状态与元数据。Task 数据保持只读，语义变化继续通过 Longrein MCP 完成。`open` 只接受已注册 Task 的 workspace 或 repository；`reveal` 只接受仍位于 Task repository 或 workspace 内的文件。两者目前只在 macOS 本机打开 Finder、VS Code 或终端，不接受任意路径。

## 漂移与恢复

`longrein_task_read doctor` 检查：

- `.runtime/state.json` 是否可读且属于当前 workspace；
- `latest_event` 是否指向最后一个 Timeline 事件；
- `.runtime/summary.json`、`task.md` 与 `timeline.md` 是否和 Runtime 状态一致；
- Task 是否存在匹配当前 UID 和 workspace 的 Registry 入口；
- active、ready、verified 产物是否存在且 hash 未漂移；
- 配置了 repository 时，Git 工作树是否可读，且是否在最近一次工作单元边界后出现未解释变化；
- 已完成 Task 是否仍满足完成证据。

只有生成投影漂移或 Registry 入口缺失、损坏、不匹配时使用 `doctor --fix`。产物或仓库漂移必须回到真实对象，完成修改后重新登记对应工作单元和产物。

## 完成门禁

`longrein_task_close` 的 `complete` 至少检查：

- Task 已建立包含 Goal、Scope 和 Completion Evidence 的可信 Context；
- 当前状态是 `ready` 或 `verifying`，没有活动、waiting 或 blocked 工作单元；
- 至少有一项 Completion Evidence，且每一项都是 `passed`；
- `.runtime/summary.json`、`task.md` 和 `timeline.md` 与 Runtime 状态一致；
- active、ready、verified 产物存在且 hash 没有漂移；
- 配置了 repository 时，Git 工作树可读，且最近一次已登记工作单元之后没有新的未解释变化。

门禁失败时，修订真正的专业产物或补充缺失的 MCP 登记。不要用人工 `doctor --fix` 掩盖语义、代码或证据缺口。
