---
artifact_type: TestPlan
task_id: example-task-20260603-120000
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

## Requirements Covered

- FR-1 / AC-1: covered by the checks below.

## Must-Have Checks

- MH-1 (P0): the behavior to prove, the verification level, and the evidence.

## Forbidden Zones

- Areas that must never change.

## Risk Ranking and Execution Order

- Which P0 is the gate and which checks are immediately blocked if it fails; the order in which checks run.

## Capability Checks

- CAP-1 (P1): scenario, command to run, expected result.

## Failure and Edge Cases

- EDGE-1: a failure mode spanning manuals and its decision rule.

## Audit and Logging

- Required logging/audit signals, and the sensitive information that must not be emitted.

## Security and Token Constraints

- Auth, permission, sandbox, token, or rate-limit checks.

## Coverage Summary

- requirement/capability: check id, verification level, the plan file it lives in, and the E2E target (when a user-facing capability has no E2E target, state the omission reason in this column).

## Environment Notes

- Environment type, workdir, commands, URL, port, credential references, and blockers.

## Testing Context

- The `teamspace/testing-context.md` state it relies on (date/version); what this plan adds to it; and the reason for omitting any execution manual.

## Recommended Testers and Assignment

- API Contract Tester → `test/api-test-plan.md`; E2E Tester → `test/e2e-test-plan.md`; Regression Tester → `test/regression-test-plan.md`; add specialist roles as needed.

## Residual Risks

- Write "None" if there are none.

## Open Questions

- Write "None" if there are none.
