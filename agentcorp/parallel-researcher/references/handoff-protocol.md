# Local Handoff Protocol

This protocol is `parallel-researcher`'s own reference. The shape of the assignment, the receipt, and this role's artifacts is taken from the `templates/` demos in this directory.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface-contract fields at their original values; write human-readable explanatory prose in zh-CN.

## Reading the Assignment

- When assigned by the Delivery Orchestrator, treat the assignment file as the task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent directory as the task root.
- Write this phase's primary persistent artifact at `output_path`; do not scatter extra artifacts unless this role's instructions call for creating a tester assignment, sub-results, or an acceptance package.
- The `hands-on` tier is an exception: the artifact is the research-package folder `research/<topic-slug>/` (shape in `../research-package.md`), `output_path`/`artifact_path` points at the `00-report.md` inside it, and the folder as a whole is this phase's artifact.
- Return a receipt; the receipt's `artifact_path` must match the primary artifact path, or point at the final summary artifact when this role explicitly produces multiple artifacts.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/decision-artifact.demo.md`
