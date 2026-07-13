# Local handoff protocol

This protocol is the `test-leader` skill's own reference. The shape of the assignment, receipt, and this role's artifacts is taken from the `templates/` demos in this directory.

The demos show shape, not values: keep the protocol field names, the `status` enums, and the frontmatter keys exactly as the templates define them, and replace every `example-*` placeholder with this task's real values; write the human-facing explanatory body in the assignment's `output_language` (the sponsor's working language, recorded at intake; zh-CN when unstated).

## Reading the Assignment

- When assigned by the Delivery Orchestrator, treat the assignment file as your task input.
- Resolve `output_path` relative to `task_root`.
- When the assignment carries `effort`, the orchestrator has already compiled that tier into your Action Context constraints — treat the field as audit metadata: follow the concrete constraints, and never scale your own care, or the honesty of evidence or status, by the tier name.
- If the assignment has no `task_root`, derive it from the assignment file's location: find the parent `handoffs/` directory and take its parent directory as the task root.
- Write this phase's primary durable artifact at `output_path`; unless this role's instructions say to create tester assignments, sub-results, or an acceptance package, do not scatter extra artifacts.
- Return a receipt; the receipt's `artifact_path` must match the primary artifact path, or, when this role explicitly produces multiple artifacts, point to the final summary artifact.

## Writing tester assignments

- Copy `templates/phase-assignment.demo.md` and set `from_agent: test-leader`, `to_agent: <tester-slug>`, `phase: verify`, `status: assigned`, and this task's real `task_id`.
- Always set `task_root` explicitly. A tester cannot derive it from `verification/assignments/` — the fallback derivation expects a parent `handoffs/` directory, which this path does not have.
- Set `output_path: verification/test-results/<tester-slug>.md`, and name the matching execution playbook path in Inputs.
- Specialist reviewers assigned during verify get the same shape; their own skills default their output under `review/specialist-findings/`, so the assignment must set `output_path` explicitly.

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/verification-report.demo.md`
- `templates/test-result.demo.md`
