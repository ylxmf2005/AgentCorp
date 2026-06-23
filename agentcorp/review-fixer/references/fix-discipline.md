# Single-group landing: execution details

This file is the local reference for `review-fixer`: as a single fix worker, how to land the **one group** of verified fix items assigned to you. Slicing, parallelism, merge checks, and the cross-group rollup are not here — those belong to the Delivery Orchestrator.

## Your boundary

- Handle only the `FIX_ITEMS` the assignment gives you, and edit only `OWNED_FILES`. `OWNED_FILES` is the contract the Orchestrator uses to guarantee that "two parallel workers never touch the same file": editing out of bounds breaks that guarantee, so when you need to spill over, **stop and escalate**; do not unilaterally edit other files.
- Fix only items whose verdict is **confirmed / partial**. False positives and items pending human confirmation should not be assigned to you; if one slips in, mark it `not-applicable` and do not fix it.

## Steps for each item

1. **Drift check (not re-verification)**: read the relevant code in `OWNED_FILES` and confirm that research's fix approach still matches the current code.
   - Matches → proceed to implementation.
   - Code has changed / suggestion is not applicable in the current context / would conflict with existing code → **do not patch your own alternative on top**: send it back as `needs-research` for `review-researcher` to re-check, or escalate as `needs-human`.
   - Note: this step only checks "whether the suggestion can still be landed"; it does **not** re-judge the bug's validity — research has already verified validity independently.
2. **Land faithfully**: change the root cause per the fix approach, stay focused, and follow the repo's conventions.
   - **Do not** downgrade the suggestion into a local patch, do not add defensive code or fallbacks it did not ask for, do not refactor the neighbors along the way, do not revert other people's changes.
   - For partial items, change per research's **corrected** fix approach, not per the original finding's description.
3. **Add a regression check**: when behavior/contract/data/auth/public interfaces change, add a check that "fails before the fix, passes after it."
4. **Run the focused validation**: run the focused validation specified by the assignment (specific test files/cases, syntax or type checks) to confirm your group's changes; pure documentation/comment items may skip it. **Do not** run the full suite — the Orchestrator runs that once after all groups return.
5. Process the group's items serially, then roll them up into this group's record.

## Return contract

Write `review/fix-records/<group-slug>.md`, recording item by item. For each:

- `verdict`: `fixed-as-suggested` (landed faithfully per research's fix approach) | `needs-research` (suggestion does not match the current code, please re-check) | `needs-human` (spilled out of `OWNED_FILES` / needs a decision / could not fix after three tries) | `not-applicable` (a misassigned false positive or item pending human confirmation)
- `fix_item_id`, `severity`
- `files_changed`: the files this item changed (all should be within `OWNED_FILES`)
- `regression_check`: what "fails before the fix" check you added (if none, explain why)
- `notes`: the drift-check conclusion + which suggestion you followed + any deviation and why
- `escalation`: only for needs-research / needs-human — state where the mismatch is, or who needs to decide what

Hand this record back to the Orchestrator; once it has collected all groups, it runs the merge check and rolls them up into `review/fix-result.md`.
