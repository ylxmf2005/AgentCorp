---
artifact_type: TestPlan
component: regression
task_id: example-task-20260603-120000
author_agent: test-planner
parent: test/test-plan.md
---

# 回归测试手册：示例标题

## 影响范围

- 本次改动涉及哪些 module 和 contract，以及原因。

## 需要运行的现有测试套件

- 命令及通过标准：

  ```bash
  pytest tests/example -k "affected_area"
  ```

## 相邻检查

- REG-1 (P1)：从受影响 module 中选取的已有行为——纳入理由、运行方式及通过标准。

## 新增回归检查

- 理想形式为"改动前失败、改动后通过"；说明构造方式及运行位置。

## 验证证据

- 输出、exit code、产物路径。
