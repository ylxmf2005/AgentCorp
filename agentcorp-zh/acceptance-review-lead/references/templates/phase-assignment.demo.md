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

# 任务指派: example-phase

## 目标

明确本 phase 的目标。

## 输入

- 所需的输入 artifact 或证据。

## 来源 Artifacts

- requirements/validated-requirements.md

## 约束

- 语言、scope、环境及风险约束。

## 所需输出

- 将 phase artifact 写入 `output_path`。
- 返回一份与 `templates/phase-receipt.demo.md` 匹配的 receipt。

## 终止条件

- 缺少必需输入、目标不清晰、环境不可用，或风险不安全。
