---
artifact_type: FixRecordSet
task_id: example-task-20260603-120000
author_agent: review-fixer
status: completed
group_slug: <this group's short English slug, usually derived from the owned file set>
source_artifacts:
  - review/research/00-index.md
---

# Fix record, item by item: <group_slug>

This group's owned file set (OWNED_FILES): path/to/service.py, path/to/helper.py

## Item by item

### Record 1

- fix_item_id: <ID, e.g. P0-1>
- severity: <P0 | P1 | P2>
- verdict: fixed-as-suggested
- files_changed: path/to/service.py
- regression_check: Added <test/check>; under <trigger condition> it fails before the fix and passes after it.
- notes: Drift check passed; landed at the root per research's fix approach, not downgraded to a patch.

### Record 2

- fix_item_id: <ID, e.g. P1-5>
- severity: <P0 | P1 | P2>
- verdict: needs-research
- files_changed: none
- regression_check: not applicable
- escalation: Research's suggestion does not match the current code — <where the mismatch is: code changed / not applicable / conflicts with existing code>. Did not patch my own alternative on top; sent back to review-researcher for re-check.
