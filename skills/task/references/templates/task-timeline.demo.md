# Task Timeline 生成视图 Demo

`timeline.md` 由 Task Runtime 从 `.runtime/state.json` 生成。下面用于理解固定事件形状和信息分工，不能复制后手工维护；Agent 的事件必须通过 Longrein MCP 产生。

```markdown
# Task Timeline: 20260721-example-task

这里记录会帮助用户或下一位理解任务如何推进的事件：工作单元、决定、发现、产物、验证和状态变化。普通工具调用不进入 Timeline。

## EVT-0001 · 2026-07-21T08:00:00.000Z · task_created

创建 Runtime Task，等待 Shape 建立可信 Context。

- Actor: user
- Revisions: context r1, scope r1

## EVT-0002 · 2026-07-21T08:30:00.000Z · artifact_updated

Shape 已建立当前需求、设计和计划，首批 Owner 可以继续执行。

- Actor: shape
- Revisions: context r2, scope r1
- Evidence: `shape/requirements.md`, `shape/design.md`, `plan.md`

这条事件的详细说明只记录结果、变化原因、supersedes 关系或交接信息，不罗列工具调用过程。
```

每条事件由 Runtime 分配不复用的 `EVT-####`，并固定记录时间、类型、摘要、actor 和当时的 revisions；只有存在时才增加 Evidence 与详细说明。当前有效状态仍以 `task.md` 和所属专业产物为准。
