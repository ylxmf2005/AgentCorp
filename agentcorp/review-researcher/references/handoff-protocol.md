# Local Handoff Protocol

This protocol is `review-researcher`'s own reference. Take the forms of the assignment and receipt from the demo files under this directory's `templates/`; the skeleton for the research folder is in `research-doc-template.md`.

Keep protocol fields, `artifact_type`, the `status` enum, the `verdict` enum, paths, and code identifiers at their original values; human-readable explanatory prose uses zh-CN.

## Reading the Assignment

- When dispatched by the Delivery Orchestrator, treat the assignment file as your task input.
- Resolve `output_path` relative to `task_root`; `output_path` points to the research folder (or the `00-index.md` within it).
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent as the task root.
- Under the research folder, write `00-index.md` and one file per issue; do not scatter additional artifacts beyond this.
- Return a receipt; the receipt's `artifact_path` points to `00-index.md`.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `research-doc-template.md` (the skeleton for the index and the single-issue files)
