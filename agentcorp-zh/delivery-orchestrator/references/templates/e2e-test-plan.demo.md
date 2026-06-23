---
artifact_type: TestPlan
component: e2e
task_id: 20260603-120000-example-task
author_agent: test-planner
parent: test/test-plan.md
---

# E2E 测试手册：示例标题

## 执行模式

- Default：browser 操作是核心验证手段（真实浏览器、已登录会话）；截图和页面状态是主要证据，API/DB/logs 仅作辅助。
- Degraded：仅当此处明确声明时才启用；需说明降级后无法再验证的内容。

## 前置条件

- 入口 URL、登录方式（仅引用凭据）、测试数据准备（精确到对象 ID；上下文中未覆盖的内容在此补充）。

## FLOW-1 (P1)：用户目标名称

- 角色：Power user。覆盖范围：FR-x / AC-y。

| # | 页面/位置 | 操作（字面输入） | 预期行为 | 证据 |
|---|---|---|---|---|
| 1 | 任务列表页面 `<URL>` | 点击 \"New Task\" | 创建对话框弹出 | 截图 |
| 2 | 创建对话框 | 在 prompt 输入框中输入：`Translate the README into English for me` | 提交后跳转至任务详情页 | 截图，记录 task_id |
| 3 | 任务详情页 | 等待执行结束 | status 变为 success，artifact 可下载 | 截图；辅助证据 `GET /api/task/<id>` |

- 异常路径（同样逐步写出）：

| # | 页面/位置 | 操作 | 预期行为 | 证据 |
|---|---|---|---|---|
| 1 | 创建对话框 | 提交空的 prompt | 行内报错，不发送请求 | 截图，Network 面板 |

- Blocked 条件：环境/路由/数据缺失时，将此流程标记为 Blocked，并注明缺失项。
