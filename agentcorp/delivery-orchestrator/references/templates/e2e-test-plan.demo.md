---
artifact_type: TestPlan
component: e2e
task_id: 20260603-120000-example-task
author_agent: test-planner
parent: test/test-plan.md
---

# E2E Test Manual: Example Title

## Execution Mode

- Default: browser actions are the primary proof (real browser, logged-in session); screenshots and page state are the primary evidence, with API/DB/logs as supporting evidence.
- Degraded: only when explicitly declared here; state what can no longer be proven once degraded.

## Preconditions

- Entry URL, login method (reference the credentials only), test data setup (down to the object ID; add anything the context docs do not cover here).

## FLOW-1 (P1): User Goal Name

- Persona: Power user. Covers: FR-x / AC-y.

| # | Page/Location | Action (literal input) | Expected Behavior | Evidence |
|---|---|---|---|---|
| 1 | Task list page `<URL>` | Click "New Task" | Create dialog opens | Screenshot |
| 2 | Create dialog | In the prompt field, enter: `Translate the README into English for me` | Submitting redirects to the task detail page | Screenshot, record task_id |
| 3 | Task detail page | Wait for execution to finish | Status turns to success, artifact is downloadable | Screenshot; supporting evidence `GET /api/task/<id>` |

- Error path (write it step by step too):

| # | Page/Location | Action | Expected Behavior | Evidence |
|---|---|---|---|---|
| 1 | Create dialog | Submit with an empty prompt | Inline error, no request sent | Screenshot, network panel |

- Blocked condition: when the environment/routing/data is missing something, mark this flow blocked and state the gap.
