# Local Handoff Protocol

This protocol is the `project-steward-reviewer` skill's own reference. The shapes of the assignment, the receipt, and this role's artifact are all taken from the `templates/` demos in this directory.

Protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields keep their original values; human-readable prose uses zh-CN.

## Reading the Assignment

- When dispatched by the Delivery Orchestrator, treat the assignment file as your task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and use its parent directory as the task root.
- Write this phase's main durable artifact at `output_path`; do not scatter extra artifacts unless this role specifies that a sub-result must be created.
- Return a receipt; the receipt's `artifact_path` must match the main artifact path.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
