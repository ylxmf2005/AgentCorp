# Local Handoff Protocol

This protocol is the `performance-reviewer` skill's own reference. The shapes of the assignment, the receipt, and this persona's artifact are all taken from the `templates/` demos in this directory.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields at their original values; write the human-facing explanatory body in zh-CN.

## Reading the Assignment

- When assigned by the Delivery Orchestrator, treat the assignment file as the task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent directory as the task root.
- Write this phase's primary persistent artifact to `output_path`; do not scatter extra artifacts unless this persona specifies creating a tester assignment, a sub-result, or an acceptance package.
- Return a receipt; the receipt's `artifact_path` must match the primary artifact path, or point to the final consolidated artifact when this persona explicitly produces multiple artifacts.

## Templates available to this persona

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
