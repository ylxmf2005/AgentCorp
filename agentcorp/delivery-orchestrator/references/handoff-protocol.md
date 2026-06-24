# Local Handoff Protocol

This protocol is the `delivery-orchestrator` skill's own reference. The shape of assignments, receipts, and this role's artifacts is taken from the demos in this directory's `templates/`.

Keep protocol fields, `artifact_type`, the `status` enum, paths, code identifiers, and interface contract fields at their original values; use zh-CN for the human-readable explanatory prose.

## Reading an Assignment

- When the Delivery Orchestrator assigns you, treat the assignment file as the task input.
- Resolve `output_path` relative to `task_root`.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the enclosing `handoffs/` directory and take its parent as the task root.
- Write this phase's primary persistent artifact at `output_path`; don't scatter extra artifacts unless this role's instructions call for creating a tester assignment, sub-results, or an acceptance package.
- Return a receipt; the receipt's `artifact_path` must match the primary artifact path, or point to the final aggregate artifact when this role explicitly produces multiple artifacts.

## Validating the Receipt (mechanical, before the quality judgment)

After receiving each receipt, run `scripts/validate-handoff.py` for envelope-consistency validation, then make the phase quality judgment:

- Single pair: `python3 scripts/validate-handoff.py --pair <assignment> <receipt> --task-root <task_root>`
- Whole task: `python3 scripts/validate-handoff.py --sweep --task-root <task_root>`

It verifies that `artifact_path` truly exists, matches the assignment's `output_path`, that `from_agent`/`phase`/`task_id` line up, that the artifact's `author_agent` matches the owner, and that status is non-empty. **A non-zero exit = the handoff is not complete**: send it back as `needs_more_evidence`, and don't count it toward the gate. Passing the mechanical check ≠ passing the quality gate.

## Templates Available to This Role

- `templates/acceptance-package.demo.md`
- `templates/interface-contract.demo.md`
- `templates/decision-artifact.demo.md`
- `templates/design-artifact.demo.md`
- `templates/finding-set.demo.md`
- `templates/implementation-result.demo.md`
- `templates/implementation-story-spec.demo.md`
- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/review-decision.demo.md`
- `templates/task-manifest.demo.md`
- `templates/task-record.demo.md`
- `templates/test-plan.demo.md`
- `templates/test-result.demo.md`
- `templates/validated-requirements.demo.md`
- `templates/work-item.demo.md`
