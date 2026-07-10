---
artifact_type: TestExecutionResult
task_id: 20260603-120000-example-task
author_agent: example-tester
status: passed
source_artifacts:
  - verification/assignments/example-tester.md
---

# 测试结果

## 状态

passed | failed | blocked | partial

## 已执行的检查

- 每个场景按人工测试粒度写一条执行记录，遵循 `references/user-flow-testing.md` 中的检查清单——背景、精确操作与逐字输入、请求/响应、个人亲自观察到的内容、清理及回读证明、证据边界——绝不采用只有结论的单行写法。

## 已运行的命令

- 命令、环境及结果。

## 证据

- 示例句柄（替换为真实的）：运行日志在 `verification/test-results/run.log`，或在下方提供围栏输出摘录。
- 日志、截图、请求/响应摘录或成果物路径。每个句柄都必须可解析。

## 失败项

- 失败步骤及触发它的输入。如果没有，写 "None"。

## 被阻塞的检查

- 每一条未驱动到结论的已指派流程，附带具体缺少了什么；标记为 `needs_more_evidence` 的检查项也放在这里，并命名缺失的观察项。如果没有，写 "None"。

## 现场发现与计划修正

- 在指派流程之外观察到的回归或缺陷，以及手册与实地不匹配的地方（缺失页面、未指定前置条件、不可能执行的步骤）——每行一条。如果没有，写 "None"。

## 残余风险

- 如果没有，写 "None"。

证据日志完整性：以上引用的原始运行日志必须**逐字保留、只追加**——失败或无效的尝试原样留在原地、加个注即可；删除或改写任何片段，都会让这份日志丧失原始证据的资格（只能加注，绝不能"洗干净"）。
