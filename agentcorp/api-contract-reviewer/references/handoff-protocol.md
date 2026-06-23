# Local Handoff Protocol

This protocol is the `api-contract-reviewer` skill's own reference. The shape of the assignment, the receipt, and this role's artifact are all taken from the `templates/` demos in this directory.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields at their original values; write human-facing explanatory prose in zh-CN.

## Reading the Assignment

- When dispatched by the Delivery Orchestrator, treat the assignment file as your task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent as the task root.
- Write this phase's primary durable artifact at `output_path`; do not scatter extra artifacts unless this role's instructions call for creating a tester assignment, sub-result, or acceptance package.
- Return a receipt; the receipt's `artifact_path` must match the primary artifact path, or point to the final aggregating artifact when this role explicitly produces more than one.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
