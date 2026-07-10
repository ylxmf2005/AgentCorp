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

## 已运行检查

- 场景及结果，对每个已修复缺陷或处于风险中的行为的检查附带变更前后观察——在变更前代码上失败、在变更后代码上通过，或将例外记录在 Residual risk 下。

## 已运行命令

- 命令、环境及结果——可按所写重放。

## 证据

- 示例句柄（替换为真实句柄）：运行日志位于 `verification/test-results/run.log`，或下方代码块输出摘录。
- 日志、截图、请求/响应摘录或工件路径。每个句柄必须可解析。不稳定或环境依赖的结果附带如实观察到的重试历史。

## 失败

- 检查、输入及变更前后观察。无则写 "None"。

## 被阻塞的检查

- 每个无法运行的分配检查，及确切缺了什么。无则写 "None"。

## 观察与计划修正

- 分配检查之外观察到的损坏，以及分配与领土不匹配的地方（不可执行的复现、已消失流程、错误的基准提交）——每行一条。无则写 "None"。

## 残余风险

- 每个变更前状态例外，及原因。无则写 "None"。

证据日志完整性：以上引用的原始运行日志必须**逐字保留、只追加**——失败或无效的尝试原样留在原地、加个注即可；删除或改写任何片段，都会让这份日志丧失原始证据的资格（只能加注，绝不能"洗干净"）。
