# Claude Code Landing

当 host 是 Claude Code 时，使用它的原生机制来落地编排语义。协议本身（assignment/receipt、artifact shape、gate semantics）不因 host 而变，变的只是承载它的方式。

- **Delegation = the Agent tool。** 每个 assignment 对应一次 Agent 调用。subagent 看不到你的对话上下文，所以 prompt 必须自包含：review 类型（独立）的 handoff 只交接 artifact 路径和评审标准；coupled handoff 则把上游完整决策贴进 prompt，而不只是路径。要求 subagent 把 artifact 写到 assignment 的 `output_path`，并回写一份 receipt。
- **Parallelism = multiple Agent calls in one message。** 互相独立的 worker（fix groups、review-research cluster、specialist reviewers）全部在同一个消息里一次性发出。把并发上限当成 backpressure：排队等空位，不要当成失败。
- **Human gate = AskUserQuestion。** 在 gate 处，用 AskUserQuestion 询问 sponsor，选项就是 gate 的几种结果：`approved` / `skipped` / `revised` / `blocked`。绝不允许用"未回复即视为通过"之类的措辞跳过暂停。无人值守时（比如 automation 触发、sponsor 不在场），AskUserQuestion 根本找不到人回答——按 workflow.md 里的 unattended 条款处理：如果 gate 没有预先 approved，就停下来并结束本轮；不要替 sponsor 回答。
- **Phase tracking = TaskCreate/TaskUpdate（或 TodoWrite）。** 公布 phase 顺序时，每个 phase 建一个 task；进入时设为 in_progress，gate 通过后设为 completed，这样 sponsor 随时都能看到 pipeline 已经跑到了哪一格。这只是对话内的进度跟踪，不能替代 `manifest.md` 账本。
- **Long-running execution = run in background。** 把耗时的 verification 和 build 放进 run_in_background，等完成通知，不要轮询。
- **Codex execution layer = the Codex channel。** 如果 host 里存在 Codex plugin/CLI，按照 workflow.md 里的 runtime routing，把 execution-layer 的角色转发给它；如果不存在，则降级为同一个 skill 的 Agent-tool 调用，protocol 保持不变。
