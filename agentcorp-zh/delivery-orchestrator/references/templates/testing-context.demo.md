---
artifact_type: TestingContext
project: example-project
maintained_by: test-planner
updated: 2026-06-03
---

# Example Project 测试上下文

## 入口与访问方式

- pre 环境: `https://example.local/app`；登录方式: 已登录的 Chrome session（只记录凭证引用，绝不记录 secret 本身）。

## 页面地图

- Task list 页面 `/app/tasks` —— 产品的主入口；核心操作: 创建 task、搜索、打开详情。
  - Task list 页面 --点击 \"New\"--> 创建对话框
  - Task list 页面 --点击 task 行--> task detail 页面 `/app/tasks/<id>`
- Task detail 页面 —— 查看执行状态和 artifact；核心操作: 下载 artifact、重新运行。

## 核心用户流程

- FLOW: 从零创建一个 task 并获取其 artifact（`walked`，2026-06-03）
  - Precondition: 已登录；不需要预先存在的数据。
  - Steps: 在 task list 页面点击 \"New\" → 在对话框中输入 prompt → 提交并跳转到 detail 页面 → 等待状态变为 success → 下载 artifact。
  - Gotcha: prompt 为空时 submit 按钮会被禁用，因此自动化必须先 assert 它是可点击的。

## 可观测面

- API: `/api/tasks` 系列接口；响应统一使用 BaseResponse（trace_id/code/message/data）。
- DB: MDB 只读；通过 task_id 查询 `tasks` 表。
- Logs: 通过 trace_id 在 CLS 中检索日志。

## 测试数据约定

- 当 <需要创建一个测试 task> → 用 `e2e-` 前缀作为标题创建 → 因为清理脚本按该前缀回收。
- 绝对不要碰: demo 账号 demo@example 下的数据。

## 已知限制

- 当 test-pool 路由尚未切换时，执行链证据只能到达 Manager 层。

## 待补齐的空白

- settings 页面尚未探索（上一轮被 permission wall 挡住）。

## 已废弃

-（将过期的条目移到这里，注明废弃原因和日期，不要直接删除。）
