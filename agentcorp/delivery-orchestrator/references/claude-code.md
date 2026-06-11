# Claude Code 落地

宿主是 Claude Code 时，用其原生机制落地编排语义。协议本身（assignment/receipt、产物形态、gate 语义）不因宿主而变，变的只是落地手段。

- **委派 = Agent tool。** 每份 assignment 对应一次 Agent 调用。subagent 看不到你的对话，prompt 必须自包含：审查类（independent）handoff 给产物路径与判断纪律；承接类（coupled）handoff 把上游完整决策粘进 prompt，而非只给路径。要求 subagent 把产物写到 assignment 的 `output_path` 并写回 receipt。
- **并行 = 单消息多 Agent 调用。** 互不依赖的 worker（fix 分组、review-research 簇、专项 reviewer）在同一条消息里一次性派出。并发超限当反压：排队等空位，不当失败。
- **human gate = AskUserQuestion。** 在 gate 处用 AskUserQuestion 向发起人提问，选项即 gate 结果：`approved` / `skipped` / `revised` / `blocked`。绝不用「不回复就默认通过」的措辞绕过暂停。无人值守（自动化触发、发起人不在场）时 AskUserQuestion 无人应答——按 workflow.md 的无人值守条款：未预批的 gate 停下结束本轮，不代答。
- **phase 追踪 = TaskCreate/TaskUpdate（或 TodoWrite）。** 宣布 phase 序列时为每个 phase 建一条 task，进入时置 in_progress、gate 通过后置 completed，让发起人随时看到流水线走到哪一格。这是会话内进度，不替代 `manifest.md` 账本。
- **长时执行 = 后台运行。** 长跑的验证、构建放 run_in_background，等完成通知，不轮询。
- **Codex 执行层 = Codex 通道。** 宿主里有 Codex 插件/CLI 时，按 workflow.md 的运行时路由把执行层角色派给它；没有时降级为 Agent tool 调用同一 skill，协议不变。
