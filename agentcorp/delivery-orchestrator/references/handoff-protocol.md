# Local Handoff Protocol

This protocol is the `delivery-orchestrator` skill's own reference. The shape of assignments, receipts, and this role's artifacts is taken from the demos in this directory's `templates/`.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and interface contract fields at their original values; use zh-CN for the human-readable explanatory prose.

## What the Assignee Does with Your Assignment

Every delegated owner treats your assignment file as its task input and resolves it by these rules — write assignments so they hold:

- The owner treats the assignment file as the task input.
- The owner reads every concrete path listed under Source Artifacts and Action Context before acting. An unresolved glob, conventional filename, or summary is not a substitute for a required file.
- The assignment's source of truth, allowed edit roots, and read-only context are hard action boundaries. Constraints guide behavior but are not content to copy into the output artifact.
- If a required context file is missing, stale, or contradictory, the owner names the affected artifact or transition and returns the mismatch instead of guessing; independent work outside that dependency may continue.
- The owner resolves `output_path` relative to `task_root`.
- If the assignment has no `task_root`, the owner derives it from the assignment file's location: it finds the enclosing `handoffs/` directory and takes its parent as the task root.
- The owner writes the phase's primary persistent artifact at `output_path`, and doesn't scatter extra artifacts unless its role's instructions call for creating a tester assignment, sub-results, or an acceptance package.
- The owner returns a receipt; the receipt's `artifact_path` must match the primary artifact path, or point to the final aggregate artifact when that role explicitly produces multiple artifacts.

## Validating the Receipt (mechanical, before the quality judgment)

After receiving each receipt, run `scripts/validate-handoff.py` for envelope-consistency validation, then make the phase quality judgment:

- Single pair: `python3 scripts/validate-handoff.py --pair <assignment> <receipt> --task-root <task_root>`
- Whole task: `python3 scripts/validate-handoff.py --sweep --task-root <task_root>`

It verifies that `artifact_path` truly exists, matches the assignment's `output_path`, that `from_agent`/`phase`/`task_id` line up, that the artifact's `author_agent` matches the owner, and that status is non-empty. **A non-zero exit = the handoff is not complete**: send it back as `needs_more_evidence`, and don't count it toward the gate. Passing the mechanical check ≠ passing the quality gate.

## Templates Available to This Role

This list is complete — every demo shipped in `templates/` appears here. Take artifact shape from these demos; don't invent your own.

- `templates/acceptance-package.demo.md`
- `templates/interface-contract.demo.md`
- `templates/decision-artifact.demo.md` — generic decision shape for other decisions, e.g. `acceptance-decision` (`AcceptanceDecision`, status `accept|reject|needs_more_evidence|blocked`)
- `templates/design-artifact.demo.md`
- `templates/finding-set.demo.md`
- `templates/implementation-result.demo.md`
- `templates/implementation-story-spec.demo.md`
- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/review-decision.demo.md` — backs `code-review` (`CodeReviewDecision`); use the same shape with `PlanReviewDecision` / `TestPlanReviewDecision` for `plan-review` and `test-plan-review`
- `templates/task-manifest.demo.md`
- `templates/task-record.demo.md`
- `templates/test-plan.demo.md`
- `templates/api-test-plan.demo.md`, `templates/e2e-test-plan.demo.md`, `templates/regression-test-plan.demo.md` — the TestPlan playbooks, children of `test/test-plan.md`
- `templates/testing-context.demo.md` — the project-level `teamspace/testing-context.md`
- `templates/test-result.demo.md`
- `templates/validated-requirements.demo.md`
- `templates/work-item.demo.md`
- `templates/exploration-frontier.demo.md`, `templates/exploration-charters.demo.md`, `templates/exploration-journal.demo.md` — exploration working notes for filling testing-context; deliberately no YAML frontmatter, never named in a receipt, so `validate-handoff.py` never sees them
