---
artifact_type: TestingContext
project: example-project
maintained_by: test-planner
updated: 2026-06-03
---

# Example Project Testing Context

## Entry Points and Access

- pre environment: `https://example.local/app`; login method: logged-in Chrome session (record only a reference to credentials, never the secret itself).

## Page Map

- Task list page `/app/tasks` — the product's main entry point; core actions: create task, search, open detail.
  - Task list page --click "New"--> create dialog
  - Task list page --click task row--> task detail page `/app/tasks/<id>`
- Task detail page — view execution status and artifacts; core actions: download artifact, rerun.

## Core User Flows

- FLOW: Create a task from scratch and obtain its artifact (`walked`, 2026-06-03)
  - Precondition: logged in; no preexisting data required.
  - Steps: on the task list page click "New" → enter a prompt in the dialog → submit and jump to the detail page → wait for status to turn success → download the artifact.
  - Gotcha: when the prompt is empty the submit button is disabled, so automation must first assert it is clickable.

## Observable Surfaces

- API: the `/api/tasks` family; responses share a uniform BaseResponse (trace_id/code/message/data).
- DB: MDB read-only; query the `tasks` table by task_id.
- Logs: search CLS by trace_id.

## Test Data Conventions

- When <a test task needs to be created> → create it with the title prefix `e2e-` → because the cleanup script reclaims by that prefix.
- Never touch: data under the demo account demo@example.

## Known Limitations

- When the test-pool routing has not been switched, execution-chain evidence reaches only the Manager layer.

## Gaps to Fill

- The settings page is unexplored (blocked by a permission wall last round).

## Deprecated

- (Move expired entries here, noting the reason for deprecation and the date, rather than deleting them outright.)
