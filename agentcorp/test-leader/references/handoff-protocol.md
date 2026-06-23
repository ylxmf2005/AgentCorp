# Local Handoff protocol

This protocol is the `test-leader` skill's own reference. The shape of the assignment, receipt, and this role's artifacts is taken from the `templates/` demos in this directory.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields at their original values; write the human-facing explanatory body in zh-CN.

## Reading the Assignment

- When assigned by the Delivery Orchestrator, treat the assignment file as your task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent directory as the task root.
- Write this phase's primary durable artifact at `output_path`; unless this role's instructions say to create tester assignments, sub-results, or an acceptance package, do not scatter extra artifacts.
- Return a receipt; the receipt's `artifact_path` must match the primary artifact path, or, when this role explicitly produces multiple artifacts, point to the final summary artifact.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/decision-artifact.demo.md`
- `templates/test-result.demo.md`
