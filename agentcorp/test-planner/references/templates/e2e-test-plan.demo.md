---
artifact_type: TestPlan
component: e2e
task_id: example-task-20260603-120000
author_agent: test-planner
parent: test/test-plan.md
---

# E2E Test Manual: Example Title

## Execution form

- Default: browser operation as primary evidence (real browser, logged-in session); screenshots and page state are the primary evidence, API/DB/logs are supporting.
- Downgrade: only when explicitly declared here; state what the downgrade can no longer prove.

## Preconditions

- Entry URL, login method (credentials by reference only), test-data preparation (down to object IDs; fill in here anything not found in the context document).

## FLOW-1 (P1): user goal name

- Persona: Power user. Covers: FR-x / AC-y.

| # | Page/location | Action (input given literally) | Expected behavior | Evidence |
|---|---|---|---|---|
| 1 | Task list page `<URL>` | Click "New Task" | Create dialog pops up | Screenshot |
| 2 | Create dialog | In the prompt input, enter: `Help me translate the README into English` | After submit, jump to the task detail page | Screenshot, record task_id |
| 3 | Task detail page | Wait for execution to finish | Status turns success, artifact is downloadable | Screenshot; supporting evidence `GET /api/task/<id>` |

- Error path (written step by step too):

| # | Page/location | Action | Expected behavior | Evidence |
|---|---|---|---|---|
| 1 | Create dialog | Submit with the prompt left empty | Inline error, no request sent | Screenshot, network panel |

- Blocked condition: when the environment/routing/data is missing something, mark this flow blocked and state the gap.
