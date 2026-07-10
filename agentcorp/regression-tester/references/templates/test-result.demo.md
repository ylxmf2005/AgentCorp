---
artifact_type: TestExecutionResult
task_id: 20260603-120000-example-task
author_agent: example-tester
status: passed
source_artifacts:
  - verification/assignments/example-tester.md
---

# Test Result

## Status

passed | failed | blocked | partial

## Checks run

- Scenario and result, with the before/after observation for every fixed-bug or at-risk-behavior check — fails on the pre-change code, passes on the post-change code, or the exception recorded under Residual risk.

## Commands run

- Command, environment, and result — replayable as written.

## Evidence

- Example handle (replace with a real one): the run log at `verification/test-results/run.log`, or a fenced output excerpt below.
- Logs, screenshots, request/response excerpts, or artifact paths. Every handle must resolve. Flaky or environment-dependent results carry their rerun history as observed.

## Failures

- The check, the input, and the before/after observation. Write "None" when there are none.

## Blocked checks

- Every assigned check that could not run, with exactly what is missing. Write "None" when there are none.

## Sightings and plan corrections

- Breakage observed outside the assigned checks, and places where the assignment did not match the territory (unexecutable repro, vanished flow, wrong base commit) — one line each. Write "None" when there are none.

## Residual risk

- Every pre-change-state exception, with the reason. Write "None" when there are none.

Evidence-log integrity: raw run logs cited above are **verbatim and append-only** — a failed or invalid attempt stays in place with an annotation; excising or rewriting any segment forfeits the log's status as raw evidence (annotate, never sanitize).
