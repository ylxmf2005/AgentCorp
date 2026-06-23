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

## Goal

Review 这个 MR/PR 的 diff 是否干净、可追溯、且确实属于本次变更；需要覆盖 diff noise 和 scope residue 两方面。

## Input

- Diff:
- Task/Story Spec/requirements:
- API contract / diagnosis / review finding:
- Local formatter/linter results:

## Constraints

- 只 review change hygiene，不涉及 correctness/security/performance/reliability。
- 每条 finding 都必须给出可落地的建议：revert、split、keep-with-explanation，或者找 originator 确认。
