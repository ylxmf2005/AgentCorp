---
artifact_type: TestPlan
component: api
task_id: example-task-20260603-120000
author_agent: test-planner
parent: test/test-plan.md
---

# API Test Manual: Example Title

Write each check so it is directly executable: the request/SQL verbatim, the expected result, the evidence, and failure handling.

## API-1 (P0): check name

- Purpose: the contract behavior to prove, corresponding to FR-x / AC-y.
- Environment and preconditions: where to run it, what data is needed.
- Execute:

  ```bash
  curl -sS -X POST 'https://example.local/api/items' -H 'Content-Type: application/json' -d '{"name": "demo"}'
  ```

- Expected: status, response shape, key assertions.
- Evidence: what to retain (request/response summary, log location, artifact path).
- Failure handling: stop / mark blocked / continue and record.

## Data and migration checks

- DATA-1 (P0): the verification SQL verbatim, before/after comparison, rollback or re-entry criteria, evidence.
