---
artifact_type: PhaseAssignment
task_id: example-task-20260603-120000
task_root: teamspace/tasks/example-task-20260603-120000/
from_agent: delivery-orchestrator
to_agent: review-fixer
phase: fix
status: assigned
group_slug: <this group's short English slug>
output_path: review/fix-records/<group-slug>.md
---

# Assignment: fix (single group)

## Goal

Faithfully land this group's verified fix items (a file set that does not overlap any other group's). This assignment is just one group in this round of parallel fixing; slicing and the cross-group merge are the Delivery Orchestrator's responsibility.

## FIX_ITEMS (the items this group must land)

- P0-1: verdict confirmed; root cause …; fix approach …; involves path/to/service.py
- P2-2: verdict partial; corrected fix approach …; involves path/to/service.py
(Each item references the verdict and fix approach in the corresponding issue file under review/research/; only confirmed/partial items are included.)

## OWNED_FILES (the file set this group may edit)

- path/to/service.py
- path/to/helper.py
(Must not edit backend files outside the set; if you need to spill over, escalate as needs-human.)

## Inputs

- The verdict and fix approach for each of this group's issues under review/research/ (required)
- Human comments (if any, highest priority)
- The focused validation hints this group should run

## Constraints

- Do not re-verify: validity/root cause/fix approach follow research; this role only lands.
- Land that elegant fix faithfully, at the root rather than as a patch job; keep changes focused and aligned with existing conventions.
- Edit only the backend code within OWNED_FILES and leave it in the working tree; do not commit, do not push; do not touch the frontend.
- Run only the focused validation, not the full suite (the Orchestrator runs the full suite after the merge).
- If a suggestion does not match the current code, send it back for re-check (needs-research); do not patch your own alternative on top.

## Required outputs

- Write this group's fix record at `output_path` (shape of `templates/fix-record.demo.md`).
- Return a receipt matching `templates/phase-receipt.demo.md`, with `artifact_path` pointing to this group's record.

## Stop conditions

- The research conclusions referenced by FIX_ITEMS are missing, a file outside OWNED_FILES must be edited, or the fix would touch the frontend / requires an unapproved dependency.
