---
artifact_type: TestPlan
component: api
task_id: 20260603-120000-example-task
author_agent: test-planner
parent: test/test-plan.md
---

# API Test Manual: Example Title

Write each check so it is directly executable: the literal request/SQL, the expectation, the evidence, and how to handle failure.

## API-1 (P0): Check Name

- Purpose: the contract behavior to prove, mapped to FR-x / AC-y.
- Environment and preconditions: where to run it, what data is needed.
- Execution:

  ```bash
  curl -sS -X POST 'https://example.local/api/items' -H 'Content-Type: application/json' -d '{"name": "demo"}'
  ```

- Expected: status, response shape, key assertions.
- Evidence: what to retain (request/response summary, log location, artifact path).
- Failure handling: stop / mark blocked / continue and record.

## Data and Migration Checks

- DATA-1 (P0): the literal verification SQL, before/after comparison, rollback or re-entrancy criteria, and evidence.
