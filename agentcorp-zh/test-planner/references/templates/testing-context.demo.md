---
artifact_type: TestingContext
project: example-project
maintained_by: test-planner
updated: 2026-06-03
---

# Example Project 测试上下文

## 入口与访问方式

- pre 环境：`https://example.local/app`；登录方式：复用已登录的 Chrome 会话（仅引用凭据，不涉及 secret）。

## 页面地图

- 任务列表页 `/app/tasks` —— 产品主入口；核心操作：创建任务、搜索、打开详情。
  - 任务列表页 --点击 \"New\"--> 创建弹窗
  - 任务列表页 --点击任务行--> 任务详情页 `/app/tasks/<id>`
- 任务详情页 —— 查看执行状态和产物；核心操作：下载 artifact、重新运行。

## 核心用户流程

- FLOW：从零创建一个任务并获取 artifact（`actually walked`，2026-06-03）
  - 前置条件：已登录；无需准备现有数据。
  - 步骤：在任务列表页点击 \"New\" → 在弹窗中输入 prompt → 提交并跳转到详情页 → 等待状态变为 success → 下载 artifact。
  - 踩坑点：prompt 为空时提交按钮会置灰，因此自动化必须先断言按钮可点击。

## 可观测面

- API：`/api/tasks` 系列接口；响应统一为 BaseResponse（trace_id/code/message/data）。
- DB：MDB 只读查询；通过 task_id 查 `tasks` 表。
- Logs：通过 trace_id 检索 CLS。

## 测试数据约定

- 需要创建测试任务时 → 标题前缀用 `e2e-` → 因为清理脚本按该前缀回收。
- 严禁触碰：demo 账号 demo@example 下的数据。

## 已知限制

- 若 test-pool 路由未切换，执行链证据只能追溯到 Manager 层。

## 待填补的空白

- Settings 页尚未探索（上一轮被权限墙挡住）。

## 已废弃

-（将过时条目移至此，注明废弃原因和日期；不要直接删除。）
