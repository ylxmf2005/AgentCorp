---
artifact_type: TestPlan
component: api
task_id: 20260603-120000-example-task
author_agent: test-planner
parent: test/test-plan.md
---

# API 测试手册：示例标题

每个检查项都要写成可直接执行的形式：给出具体请求/SQL、预期结果、留存证据，以及失败时的处理策略。

## API-1 (P0): 检查名称

- Purpose: 需验证的契约行为，对应到 FR-x / AC-y。
- Environment and preconditions: 执行环境及前置条件，包括在哪跑、需要什么数据。
- Execution:

  ```bash
  curl -sS -X POST 'https://example.local/api/items' -H 'Content-Type: application/json' -d '{\"name\": \"demo\"}'
  ```

- Expected: 状态码、响应结构、关键断言。
- Evidence: 需保留的内容（请求/响应摘要、日志位置、artifact 路径）。
- Failure handling: 停止 / 标记阻塞 / 继续执行并记录。

## 数据与迁移检查

- DATA-1 (P0): 具体的验证 SQL、前后对比、回滚或可重入标准，以及证据。
