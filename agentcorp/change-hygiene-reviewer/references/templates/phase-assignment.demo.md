---
artifact_type: PhaseAssignment
task_id: example-task-20260611-120000
from_agent: delivery-orchestrator
to_agent: change-hygiene-reviewer
phase: code-review
status: assigned
task_root: teamspace/tasks/example-task-20260611-120000
output_path: review/specialist-findings/change-hygiene-reviewer.md
---

# Assignment

## 目标

审查本次 MR/PR diff 是否干净、可追溯、应属于本次改动；同时覆盖 diff noise 和 scope residue。

## 输入

- Diff:
- 任务/Story Spec/requirements:
- API contract / diagnosis / review finding:
- 本地 formatter/linter 结果:

## 约束

- 只审 change hygiene，不做 correctness/security/performance/reliability review。
- 每条 finding 必须给出可执行的回退、拆分、保留解释或发起人确认建议。
