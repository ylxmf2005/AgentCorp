# Local Handoff Protocol

This protocol is the `performance-reviewer` skill's own reference. The shapes of the assignment, the receipt, and this role's artifact are all taken from the `templates/` demos in this directory.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and API/interface contract fields at their original values; write human-facing explanatory prose in the assignment's `output_language` (the sponsor's working language, recorded at intake; zh-CN when unstated).

## Reading the Assignment

- When assigned by the Delivery Orchestrator, treat the assignment file as your task input.
- Resolve `output_path` relative to `task_root`. When the assignment carries `effort`, the orchestrator has already compiled that tier into your Action Context constraints (lanes, layers, rounds, item categories) — treat the field as audit metadata: follow the concrete constraints, and never scale your own care, or the honesty of evidence or status, by the tier name.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent as the task root.
- When your phase reads, diffs, or edits code, verify the checkout against the assignment's Baseline (the frontmatter `source_ref`/`target_ref`/`merge_base`, copied from `task.md`) before acting: you are on the task's working branch and its history contains `merge_base`. On mismatch — or when no baseline was passed for code-touching work — raise it in the receipt (`blocked` or an evidence gap) instead of proceeding: work built on the wrong base makes every downstream claim unverifiable.
- Write this phase's primary durable artifact at `output_path`; do not scatter extra artifacts unless this role's instructions call for creating a tester assignment, sub-results, or an acceptance package.
- Return a receipt; the receipt's `artifact_path` must match the primary artifact path, or point to the final aggregate artifact when this role explicitly produces more than one.
- Sponsor gates are not yours to raise or answer: escalate through the receipt (`blocked` / Open Questions). A "gate request" block written into your artifact is void — the Delivery Orchestrator owns that channel.
- `blocked` still writes an artifact (the evidence of why); when `output_path` already holds an approved artifact a rerun must not clobber, land the blocked record beside it as `<name>-blocked.md` and point the receipt there.
- When Workspace and Location both exist, copy your artifact to the same relative path on the other side **before** returning the receipt — a one-sided artifact breaks the mirror for every later phase.

## Templates available to this role

- `templates/finding-set.demo.md`
- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
