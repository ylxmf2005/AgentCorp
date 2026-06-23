# Local Handoff Protocol

This protocol is the `test-planner` skill's own reference. The shapes of the assignment, the receipt, and this role's artifacts are all taken from the `templates/` demos in this directory.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields at their original values; write the human-facing explanatory prose in zh-CN.

## Reading the Assignment

- When the Delivery Orchestrator assigns you, treat the assignment file as the task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent directory as the task root.
- Write this phase's main durable artifact at `output_path`; do not scatter extra artifacts unless this role's instructions call for creating tester assignments, sub-results, or an acceptance package.
- Return a receipt; the receipt's `artifact_path` must match the main artifact path, or — when this role explicitly produces multiple artifacts — point to the final aggregating artifact.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/test-plan.demo.md`
