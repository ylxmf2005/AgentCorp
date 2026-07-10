---
artifact_type: TestExecutionResult
task_id: 20260603-120000-example-task
author_agent: example-tester
status: passed
source_artifacts:
  - verification/assignments/example-tester.md
---

# Test result

## Status

passed | failed | blocked | partial

## Checks run

- Scenario, expected vs actual behavior, and pass/fail. Every entry traces to a request or command under "Commands run" executed in this session against the real target — nothing inferred, nothing from a stub.

## Commands run

- Command, environment, the real target it ran against, and result.

## Evidence

- Example handle (replace with a real one): the run log at `verification/test-results/run.log`, or a fenced output excerpt below.
- Logs, request/response excerpts, or artifact paths. Every handle must resolve; no secret appears anywhere.

## Failures

- Write "None" when there are none.

## Blocked checks

- Every unrun or unrunnable check, with exactly what is missing. Write "None" when there are none.

## Sightings and plan corrections

- Real problems observed outside the assigned checks, and places where the plan or docs did not match the territory (missing endpoint, unbuildable request) — one line each. Write "None" when there are none.

## Residual risk

- Write "None" when there are none.

Evidence-log integrity: raw run logs cited above are **verbatim and append-only** — a failed or invalid attempt stays in place with an annotation; excising or rewriting any segment forfeits the log's status as raw evidence (annotate, never sanitize).
