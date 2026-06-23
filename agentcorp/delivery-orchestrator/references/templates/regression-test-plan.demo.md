---
artifact_type: TestPlan
component: regression
task_id: 20260603-120000-example-task
author_agent: test-planner
parent: test/test-plan.md
---

# Regression Test Manual: Example Title

## Blast radius

- Which modules and contracts this change affects, and why.

## Existing suites to run

- Verbatim commands and pass criteria:

  ```bash
  pytest tests/example -k "affected_area"
  ```

## Adjacent checks

- REG-1 (P1): existing behavior selected from an affected module, why it was selected, how to run it, and the pass criteria.

## New regression checks

- Ideally shaped as "fails before the change, passes after"; state how to construct it and where to run it.

## Evidence

- Output, exit code, artifact paths.
