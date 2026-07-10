---
artifact_type: VerificationReport
task_id: 20260603-120000-example-task
author_agent: test-leader
status: approve
source_artifacts:
  - verification/test-results/e2e-tester.md
---

# Verification Report Example

## Decision

approve | request_changes | needs_more_evidence | blocked

## Dimension Scorecard

| Dimension | Status | Basis |
| --- | --- | --- |
| Completeness | complete | Every required check accounted for; cite result paths. |
| Correctness | supported | Direct evidence for the claimed behavior and failure paths. |
| Coherence | aligned | Requirements, design, plan, implementation, and observations agree. |

## What This Verification Proved

- The claims that now have direct evidence, each citing its result file by path.

## Failures and Blocked Checks

- Write "None" when there are none.

## Skipped Checks and Why

- Every skipped check or unavailable dimension, with the reason and the evidence claim it weakens; write "None" when there are none.

## Result File Index

- `verification/test-results/<tester-slug>.md` — one line per assignee: status plus the strongest evidence handle. Every listed file exists at its path, was opened, and its handle resolves; every assignment behind it set `task_root`, `output_path`, and (when the TestPlan has one) its playbook path.

## Evidence Gaps and Unverified Areas

- Checks marked `status=unverified` (missing environment, credential, service, or data) and areas never exercised; write "None" when there are none.

## Residual Risk

- Accepted risks, if any.

## Next Owner

- The agent or human responsible for the next action.
