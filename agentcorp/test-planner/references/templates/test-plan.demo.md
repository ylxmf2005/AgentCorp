---
artifact_type: TestPlan
task_id: 20260603-120000-example-task
author_agent: test-planner
status: ready_for_review
source_artifacts:
  - requirements/validated-requirements.md
  - teamspace/testing-context.md
plan_files:
  - test/api-test-plan.md
  - test/e2e-test-plan.md
  - test/regression-test-plan.md
confidence: HIGH
---

# Test Plan: Example Title

## Requirements covered

- FR-1 / AC-1: covered by the checks below.

## Must-Have checks

- MH-1 (P0): the behavior to prove, the verification layer, and the evidence.

## Forbidden zones

- The areas that must never be changed.

## Risk ranking and execution order

- Which P0 is a gate and which checks become directly blocked if it fails; the execution order of the checks.

## Capability checks

- CAP-1 (P1): scenario, execution command, expected result.

## Failure and edge cases

- EDGE-1: cross-manual failure modes and decision rules.

## Audit and logging

- The required log/audit signals, and the sensitive information forbidden from output.

## Security and token constraints

- Auth, permission, sandbox, token, or rate-limit checks.

## Coverage summary

- requirement/capability: check id, verification layer, the plan file it lives in, the E2E goal (when a user-facing capability has no E2E goal, write the omission reason in this column).

## Environment notes

- Environment type, workdir, commands, URLs, ports, credential references, and blockers.

## Testing context

- The state of `teamspace/testing-context.md` relied upon (date/version); what was added to it this time; the reason for omitting any execution manual, stated here.

## Recommended testers and assignment

- API Contract Tester → `test/api-test-plan.md`; E2E Tester → `test/e2e-test-plan.md`; Regression Tester → `test/regression-test-plan.md`; add specialist roles when needed.

## Residual risk

- Write "none" when there is none.

## Open questions

- Write "none" when there is none.
