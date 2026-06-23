# Local Handoff Protocol

This protocol is the `reliability-reviewer` skill's own reference. The shape of the assignment, the receipt, and this role's artifacts is taken from the `templates/` demos in this directory.

Protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields keep their original values; human-facing explanatory prose uses zh-CN.

## Reading the Assignment

- When assigned by the Delivery Orchestrator, treat the assignment file as the task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent directory as the task root.
- Write this phase's primary durable artifact at `output_path`; do not scatter additional artifacts unless this role specifies creating a tester assignment, sub-result, or acceptance package.
- Return a receipt; the receipt's `artifact_path` must match the primary artifact path, or point to the final summary artifact when this role explicitly produces multiple artifacts.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
