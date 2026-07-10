---
artifact_type: PhaseAssignment
task_id: 20260611-120000-example-task
from_agent: delivery-orchestrator
to_agent: change-hygiene-reviewer
phase: code-review
status: assigned
task_root: teamspace/tasks/20260611-120000-example-task
output_path: review/specialist-findings/change-hygiene-reviewer.md
output_language: zh-CN
effort: high
---

# Assignment

## Goal

Review whether this MR/PR diff is clean, traceable, and belongs in this change; cover both diff noise and scope residue.

## Input

- Diff:
- Task/Story Spec/requirements:
- API contract / diagnosis / review finding:
- Local formatter/linter results:

## Constraints

- Review change hygiene only; no correctness/security/performance/reliability review.
- Every finding must give an actionable recommendation: revert, split, keep-with-explanation, or originator confirmation.
