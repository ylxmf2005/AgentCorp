---
artifact_type: PhaseAssignment
task_id: example-task-20260603-120000
task_root: teamspace/tasks/example-task-20260603-120000/
from_agent: delivery-orchestrator
to_agent: example-agent
phase: example-phase
status: assigned
output_path: review/example-output.md
---

# 任务分配: example-phase

## 目标

说明本 phase 的目标。

## 输入

- 所需的输入 artifact 或证据。

## 来源 artifact

- requirements/validated-requirements.md

## 约束

- 语言、范围、环境和风险方面的约束。

## 所需输出

- 将 phase artifact 写入 `output_path`。
- 返回一份与 `templates/phase-receipt.demo.md` 匹配的 receipt。

## 终止条件

- 缺少必需的输入、目标不明确、环境不可用或风险不可控。
