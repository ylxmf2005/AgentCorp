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

- One execution record per scenario at human-tester granularity, per the checklist in `references/user-flow-testing.md` — background, exact actions and verbatim inputs, requests/responses, what was personally observed, cleanup with read-back proof, evidence boundary — never a verdict-only line.

## Commands run

- Commands, environment, and results.

## Evidence

- Example handle (replace with a real one): the run log at `verification/test-results/run.log`, or a fenced output excerpt below.
- Logs, screenshots, request/response excerpts, or artifact paths. Every handle must resolve.

## Failures

- The failing step and the input that triggered it. Write "None" if there are none.

## Blocked checks

- Every assigned flow not driven to a verdict, with exactly what is missing; checks marked `needs_more_evidence` go here too, with the missing observation named. Write "None" if there are none.

## Sightings and plan corrections

- Regressions or defects observed outside the assigned flows, and places where the manual did not match the territory (missing page, unspecified precondition, impossible step) — one line each. Write "None" if there are none.

## Residual risks

- Write "None" if there are none.

Evidence-log integrity: raw run logs cited above are **verbatim and append-only** — a failed or invalid attempt stays in place with an annotation; excising or rewriting any segment forfeits the log's status as raw evidence (annotate, never sanitize).
