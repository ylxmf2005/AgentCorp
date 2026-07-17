# Task Context

Task Context 是一个任务跨 Skill、阶段和分支共享的权威状态。它只保存会改变后续判断的承诺与事实，不复制调查日志、设计细节或用户画像。

## 使用方式

需要持久 Task Context 时，用本模板写入 `<task-workspace>/task.md`；简单任务继续在对话中维护等价状态。

## 最小形态

```markdown
---
artifact_type: TaskContext
task_id: <stable-id>
status: shaping | ready | active | needs_revision | complete
context_revision: 1
scope_revision: 1
source_ref: null
working_branch: null
target_ref: null
---

# Task Context

## Goal

## Scope

## Non-goals

## Completion Evidence

## Must Preserve

## Task Operating Envelope

| Dimension | Normal range | Credible edge | Explicit exclusion | Evidence |
| --- | --- | --- | --- | --- |

## Assumptions And Evidence Gaps

## Context Change Ledger

| Context revision | Scope revision | Kind | Source | Change | Approval | Invalidated work |
| --- | --- | --- | --- | --- | --- | --- |
```

只保留相关 dimensions：使用者与 actor、并发/顺序、规模/增长、信任/滥用、失败/恢复、数据生命周期、兼容/部署。没有证据的 worst case 不能进入 Task Operating Envelope；与项目现实冲突的用户直觉也不能被当作已确认事实。

## Git 字段

- `source_ref`：工作线从什么 ref 长出；stacked task 可以指向父任务分支。
- `working_branch`：任务预期工作的分支。
- `target_ref`：交付最终合入的 ref。

字段可以为空，但要区分 `not-applicable` 与 `unresolved`；空值不授权从当前 checkout 反推意图。相对 source 的 fork point、target 实际会收到的 delivery diff、inspected revision 和交付状态属于代码相关 Skill 按常驻 Context 协议取得的现场证据，不写成用户维护的参数。

## 修订

- 会改变下游判断的观察事实、证据缺口、实际 checkout/merge-base、Task Operating Envelope 证据或任务状态发生变化：增加 `context_revision`，标记受影响产物。
- 用户明确改变目标、scope、non-goals、完成证据、must-preserve、source/working/target 意图、Task Operating Envelope 或风险接受：同时增加 `context_revision` 与 `scope_revision`，记录批准并标记受影响产物。
- Agent 发现更大、更小或不同路线：先作为提案标价；用户同意前不改变承诺。
- 新证据修正事实：立即修正事实模型并增加 `context_revision`；若它要求改变任务承诺、refs、Task Operating Envelope 或验收，重新进入 Shape 并取得用户决定。
- 可以独立继续的工作不因局部修订全部停止；只暂停依赖失效 Context 的路径。

更新后检查哪些设计、实现、review 与 test 结论基于旧 revision，不能只改 `task.md` 后让旧产物继续冒充有效。
