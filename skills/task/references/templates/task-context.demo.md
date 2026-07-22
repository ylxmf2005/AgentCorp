# Task Context 生成视图示例

`task.md` 由 Task Runtime 从 `.runtime/state.json` 生成。下面只用于理解固定章节和信息分工，不能复制后手工维护；Agent 的字段或状态变化必须通过 Longrein MCP 完成。

```markdown
---
artifact_type: TaskContext
schema_version: 2
task_uid: "9fbe36b4-1f6f-45aa-b36e-3eb806f35968"
task_id: "20260721-example-task"
status: ready
context_revision: 3
scope_revision: 1
latest_event: "EVT-0007"
workspace: "/workspace/app/studio/tasks/20260721-example-task"
repository: "/workspace/app"
source_ref: "origin/main"
working_branch: "fix/example-task"
target_ref: "main"
updated_at: "2026-07-21T08:00:00.000Z"
---

# Task Context: 20260721-example-task

## Original Request

修复示例行为，并让后续 Session 可以直接了解当前状态。

## Goal

- [UD-001] 写出用户最终能够观察到的结果，不写实现动作。

## Scope

- [UD-002] 列出本次任务负责的行为、对象或边界。

## Non-goals

- [UD-003] 列出容易被顺手做掉、但本次明确不负责的内容。

## Completion Evidence

- [ ] [CE-001] 每一项都是可以检查的完成证据，而不是“代码已完成”。
- [x] [CE-002] 需要评审或真实测试时，记录对应证据和通过结果 — 测试报告已通过

## Must Preserve

- [UD-004] 用户明确要求保留的行为或资产。

## Task Operating Envelope

| Dimension | Normal range | Credible edge | Explicit exclusion | Evidence |
| --- | --- | --- | --- | --- |
| 使用者与入口 | 已确认的正常调用者和入口 | 平台重试、多个 worker 等真实可达边界 | 没有可达路径的理论情况 | 代码、配置、运行记录或用户确认 |

## Assumptions And Evidence Gaps

- 写出会影响后续判断但尚未确认的事实，以及准备从哪里取得证据。

## Current Work

- Now: none
- Next: 由 dev 实现已确认路线
- Waiting on: none
- Active work unit: none

## Confirmed Findings

- [FND-001] 当前状态由旧文件的手工约定维护，交接时可能漂移 — `shape/evidence/state-audit.md`

## Artifact Map

| Artifact | Type | Status | What it establishes | Next consumer |
| --- | --- | --- | --- | --- |
| `task.md` | task.context | active | 当前任务承诺、状态和产物入口 | all |
| `timeline.md` | task.timeline | active | 工作单元与语义变化的任务历史 | all |
| `plan.md` | shape.plan | active | 全部 Phase、Owner、依赖、当前状态、结果和证据 | shape, dev, review, test |
| `shape/requirements.md` | shape.requirements | ready | 可追溯的详细需求、行为边界和可观察结果 | shape, dev, review, test |
| `shape/design.md` | shape.design | ready | 当前与目标系统模型、契约和关键专业决定 | shape, dev, review |
| `dev/report.md` | dev.report | ready | 已交付行为、变化传播、源产物修订、阶段审查和聚焦验证 | review, test, owner |

## Timeline

完整任务历史见 [`timeline.md`](timeline.md)。最新事件：EVT-0007。
```

新 Task 在 `status: shaping` 时，Goal、Scope 或完成条件可以显示为 `unresolved`。用户决定使用 `UD-###`；Completion Evidence 的稳定编号由 Runtime 分配为 `CE-###`；Confirmed Findings 和 Artifact Map 也由相应 MCP 操作生成，不直接编辑表格。
