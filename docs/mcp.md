# Longrein MCP

Longrein MCP 是 Codex 与 Claude Code 访问 Task Runtime 的唯一 Agent 协议。它把底层文件操作收敛为六个有 schema、权限提示和明确失败语义的任务意图。

## 生命周期

Longrein 使用 stdio transport。宿主在会话开始时启动一次 `longrein mcp`，同一会话内的后续调用复用这个 Node 进程。

- 不启动共享 daemon；
- 不监听 HTTP 端口；
- 不需要 access token；
- 不依赖 Dashboard 是否运行；
- 宿主会话结束时，相应 MCP 进程随之结束。

启动成本只发生在宿主建立 MCP 会话时。实际 mutation 的主要成本来自 Runtime 文件写入、产物 hash 与 Git 快照，不来自 MCP transport。

## 安装与状态

`longrein install` 和 `longrein update` 会维护 Codex 与 Claude Code 的 MCP 配置。单独管理时使用：

```bash
longrein mcp install
longrein mcp status
longrein mcp uninstall

longrein mcp install codex
longrein mcp install claude
```

不带子命令的 `longrein mcp` 是给宿主启动的 stdio server，不是人工交互式命令。

Longrein 只更新能够确认由 Longrein 管理的同名条目。如果 `longrein` 已指向别的 MCP，状态为 `foreign`，安装会停止且不覆盖。

## 工具面

| Tool | 输入意图 | 核心结果 |
| --- | --- | --- |
| `longrein_task_read` | `list`、`show`、`doctor` | 目录、紧凑 Task 投影或健康问题 |
| `longrein_task_create` | workspace、task id、原始请求与可选 Git refs | 新建并注册 Runtime Task |
| `longrein_task_context` | Goal、Scope、Non-goals、完成证据、Now / Next 等 | 建立或修订权威 Task Context |
| `longrein_work_start` | 当前工作、下一步与证据 | 建立可恢复工作单元并保存仓库基线 |
| `longrein_checkpoint` | findings、artifacts、verification、finish 或 block | 保存一个语义检查点 |
| `longrein_task_close` | complete、abandon 或 supersede | 以明确终态关闭 Task |

`longrein_task_read show` 返回 Agent 当前判断需要的紧凑投影，不包含完整 Timeline events 或计数器。完整历史由生成的 `timeline.md` 和 Dashboard 展示，避免每次读取都污染模型上下文。

## 调用纪律

Agent 在修改 Runtime 前先读取当前 Task。登记的是可恢复、可审查的语义变化，不是工具调用日志：

- 开始一段需要恢复或交接的工作时使用 `longrein_work_start`；
- 发现改变后续判断的事实、发布产物、更新完成证据或结束工作单元时使用 `longrein_checkpoint`；
- 局部编辑、普通搜索和连续实现细节不需要逐条登记；
- 改变既有用户承诺时，通过 `longrein_task_context` 提供新的 `UD-*` 决定依据；
- Task 达到真实终态后使用 `longrein_task_close`。

MCP 不可用或调用失败时，Agent 停止依赖该状态写入的工作并报告阻塞。不能改用 shell，也不能直接编辑 `.runtime/state.json`、`.runtime/summary.json`、`task.md` 或 `timeline.md`。

## Checkpoint 失败与重试

`longrein_checkpoint` 按固定类别执行：finding、artifact、verification，最后 finish 或 block。任一步失败后立即停止，并返回 `completed_steps`。

相同请求只在当前 MCP 进程内进行 10 秒短期去重，防止即时传输重试重复写入。它不是跨进程事务，也不提供进程重启后的持久幂等。

部分失败后的正确恢复方式：

1. 使用 `longrein_task_read show` 重新读取当前 Task；
2. 对照 `completed_steps` 确认已经持久化的部分；
3. 只提交仍然需要的语义更新。

不要原样盲目重放失败请求。

## 工具元数据

MCP 工具声明了 input/output schema，以及 `readOnlyHint`、`destructiveHint`、`idempotentHint` 和 `openWorldHint`。其中：

- `longrein_task_read` 是只读且幂等的；
- mutation 工具不是通用幂等操作；
- `longrein_task_close` 被标记为 destructive，因为它产生终态；
- 全部工具只操作本地 Longrein Task 世界，不访问开放网络。

这些元数据帮助宿主选择审批和调用策略，但不能替代 Runtime 自身的门禁。
