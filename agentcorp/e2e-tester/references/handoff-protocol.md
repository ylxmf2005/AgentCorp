# Local Handoff Protocol

This protocol is the `e2e-tester` skill's own reference. The shape of the assignment, receipt, and this role's artifacts are all taken from the `templates/` demos in this directory.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields at their original values; the human-readable explanatory body uses zh-CN.

## Reading the Assignment

- When assigned by the Delivery Orchestrator, treat the assignment file as your task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent as the task root.
- Write this phase's main persistent artifact at `output_path`; do not scatter extra artifacts unless this role's instructions call for creating a tester assignment, a sub-result, or an acceptance package.
- Return a receipt; the receipt's `artifact_path` must match the main artifact path, or point to the final summary artifact when this role explicitly produces multiple artifacts.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/test-result.demo.md`
