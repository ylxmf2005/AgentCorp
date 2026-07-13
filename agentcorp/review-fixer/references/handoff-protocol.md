# Local handoff protocol

This protocol is the `review-fixer` skill's own reference. The shapes of the assignment, the receipt, and this role's artifact are all drawn from the `templates/` demos in this directory.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields at their original values; the human-facing explanatory prose uses the assignment's `output_language` (the sponsor's working language, recorded at intake; zh-CN when unstated).

## Reading the Assignment

- When dispatched by the Delivery Orchestrator, treat the assignment file as your task input. The assignment gives you **one group** of fix items (`FIX_ITEMS`) and your authorized file set (`OWNED_FILES`).
- Resolve `output_path` relative to `task_root`; `output_path` points to this group's fix record `review/fix-records/<group-slug>.md`.
- When the assignment carries `effort`, the orchestrator has already compiled that tier into your Action Context constraints — treat the field as audit metadata: follow the concrete constraints, and never scale your own care, or the honesty of evidence or status, by the tier name.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent directory as the task root.
- Write this group's fix record at `output_path`; edit only the product code within `OWNED_FILES`; do not scatter any other artifacts beyond that.
- Before editing, verify the checkout against the assignment's Baseline (the frontmatter `source_ref`/`target_ref`/`merge_base`, copied from `task.md`): you are on the task's working branch and its history contains `merge_base`. On mismatch, return `status: blocked` naming the drift — fixes landed on the wrong base corrupt every group's merge.
- Return a receipt; the receipt's `artifact_path` points to this group's fix record path.
- If a stop condition fires (missing research conclusions, an unavoidable out-of-bounds edit), return the receipt with `status: blocked` and name the blocker; per-item escalations (`needs-research` / `needs-human`) do not block the group — record them in the fix record and return `status: completed`.
- The cross-group merge check and the `review/fix-result.md` rollup are done by the Delivery Orchestrator, not written by you.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/fix-record.demo.md`
