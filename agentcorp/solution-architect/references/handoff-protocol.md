# Local Handoff Protocol

This protocol is the `solution-architect` skill's own reference. The shape of the assignment, the receipt, and this role's artifacts are all taken from the `templates/` demos in this directory.

Keep the protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and interface contract fields at their original values; write the human-facing explanatory body in zh-CN.

## Reading the Assignment

- When the Delivery Orchestrator assigns you, treat the assignment file as the task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent as the task root.
- Write this phase's artifact at `output_path`. If this design needs multiple artifacts, the assignment's `output_path` should point at the `design/` directory; under it, create `architecture.md`, `impact-analysis.md`, `diagnosis.md`, `interface-contract.md` as needed.
- Return a receipt; the receipt's `artifact_path` must match the assignment's `output_path`, or, when `output_path` is a directory, point at one actual design artifact under it. If multiple design artifacts are produced, list every path in the receipt body's "Notes" section.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/design-artifact.demo.md`
- `templates/interface-contract.demo.md`
