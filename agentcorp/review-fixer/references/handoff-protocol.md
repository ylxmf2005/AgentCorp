# Local handoff protocol

This protocol is the `review-fixer` skill's own reference. The shapes of the assignment, the receipt, and this role's artifact are all drawn from the `templates/` demos in this directory.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields at their original values; the human-facing explanatory prose uses zh-CN.

## Reading the assignment

- When dispatched by the Delivery Orchestrator, treat the assignment file as your task input. The assignment gives you **one group** of fix items (`FIX_ITEMS`) and your authorized file set (`OWNED_FILES`).
- Resolve `output_path` relative to `task_root`; `output_path` points to this group's fix record `review/fix-records/<group-slug>.md`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent directory as the task root.
- Write this group's fix record at `output_path`; edit only the backend code within `OWNED_FILES`; do not scatter any other artifacts beyond that.
- Return a receipt; the receipt's `artifact_path` points to this group's fix record path.
- The cross-group merge check and the `review/fix-result.md` rollup are done by the Delivery Orchestrator, not written by you.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/fix-record.demo.md`
