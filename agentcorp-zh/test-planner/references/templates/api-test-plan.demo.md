---
artifact_type: TestPlan
component: api
task_id: example-task-20260603-120000
author_agent: test-planner
parent: test/test-plan.md
---

# API 测试手册：示例标题

每条检查都要写成可直接跑的形式：request/SQL 原文、预期结果、evidence、失败处理。

## API-1 (P0): 检查名称

- Purpose：要验证的 contract 行为，对应 FR-x / AC-y。
- Environment and preconditions：在哪跑、需要什么数据。
- Execute：

  ```bash
  curl -sS -X POST 'https://example.local/api/items' -H 'Content-Type: application/json' -d '{\"name\": \"demo\"}'
  ```

- Expected：status、response shape、关键 assertions。
- Evidence：保留什么（request/response 摘要、log 位置、artifact 路径）。
- Failure handling：停止 / 标 blocked / 继续并记录。

## 数据与迁移检查

- DATA-1 (P0)：verification SQL 原文、前后对比、rollback 或重入条件、evidence。
