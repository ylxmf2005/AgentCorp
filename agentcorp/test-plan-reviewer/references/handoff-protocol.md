# Local Handoff protocol

This protocol is the `test-plan-reviewer` skill's own reference. The forms of the assignment, the receipt, and this role's artifacts all come from the `templates/` demos in this directory.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields at their original values; write human-facing explanatory body text in zh-CN.

## Reading the Assignment

- When assigned by the Delivery Orchestrator, treat the assignment file as your task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent as the task root.
- Write this phase's primary durable artifact at `output_path`; unless this role's instructions call for creating a tester assignment, sub-results, or an acceptance package, do not scatter extra artifacts.
- Return a receipt; the receipt's `artifact_path` must match the primary artifact path, or, when this role explicitly produces multiple artifacts, point to the final summary artifact.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/review-decision.demo.md`
