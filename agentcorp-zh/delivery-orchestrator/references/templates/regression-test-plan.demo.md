---
artifact_type: TestPlan
component: regression
task_id: 20260603-120000-example-task
author_agent: test-planner
parent: test/test-plan.md
---

# Regression Test Manual: 示例标题

## Blast radius

- 本次 change 波及哪些模块与契约，以及原因。

## Existing suites to run

- 直接可用的命令与通过标准：

  ```bash
  pytest tests/example -k \"affected_area\"
  ```

## Adjacent checks

- REG-1 (P1): 从受影响模块中选出的已有行为，说明挑选理由、运行方式与通过标准。

## New regression checks

- 最好做到"改动前失败、改动后通过"；说明构造方法与运行位置。

## Evidence

- 输出、exit code、artifact 路径。
