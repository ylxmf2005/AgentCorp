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

# 指派：example-phase

## 目标

说明这个 phase 的目标。

## 输入

- 必需的输入产物或证据。

## 来源产物

- requirements/validated-requirements.md

## 约束

- 语言、范围、环境和风险约束。

## 必需输出

- 在 `output_path` 写入 phase 产物。
- 返回一份匹配 `templates/phase-receipt.demo.md` 的 receipt。

## 停止条件

- 缺少必需输入、目标不清、环境不可用，或风险不安全。
