---
artifact_type: TestingContext
project: example-project
maintained_by: test-planner
updated: 2026-06-03
---

# Example Project Testing Context

## Entry and access

- pre environment: `https://example.local/app`; login method: already-logged-in Chrome session (credentials by reference only, no secrets).

## Page map

- Task list page `/app/tasks` — the product's main entry point; core operations: create task, search, open detail.
  - Task list page --click "New"--> create dialog
  - Task list page --click task row--> task detail page `/app/tasks/<id>`
- Task detail page — view execution status and artifacts; core operations: download artifact, re-run.

## Core user flows

- FLOW: create a task from scratch and obtain an artifact (`actually walked`, 2026-06-03)
  - Precondition: logged in; no existing data needed.
  - Steps: on the task list page click "New" → enter the prompt in the dialog → submit and jump to the detail page → wait for status to turn success → download the artifact.
  - Pitfall: when the prompt is empty the submit button is greyed out, so automation must first assert it is clickable.

## Observable surface

- API: the `/api/tasks` family; responses are a uniform BaseResponse (trace_id/code/message/data).
- DB: MDB read-only; query the `tasks` table by task_id.
- Logs: search CLS by trace_id.

## Test-data conventions

- In <need to create a test task> → create with the title prefix `e2e-` → because the cleanup script reclaims by that prefix.
- Never touch: the data under the demo account demo@example.

## Known limitations

- When the test-pool routing is not switched, execution-chain evidence only reaches the Manager layer.

## Gaps to fill

- The Settings page is unexplored (blocked by a permission wall last round).

## Deprecated

- (Move stale entries here, noting the deprecation reason and date; do not delete them outright.)
