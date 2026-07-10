---
artifact_type: PhaseAssignment
task_id: example-task-20260603-120000
task_root: teamspace/tasks/example-task-20260603-120000/
from_agent: delivery-orchestrator
to_agent: example-agent
phase: example-phase
status: assigned
output_path: review/example-output.md
output_language: zh-CN
effort: high
---

# Assignment: example-phase

## Goal

阐明本 phase 的目标。

## Inputs

- 所需的输入 artifact 或证据。

## Source artifacts

- requirements/validated-requirements.md

## Constraints

- 语言、范围、环境和风险约束。

## Required outputs

- 将 phase artifact 写入 `output_path`。
- 返回一份与 `templates/phase-receipt.demo.md` 匹配的 receipt。

## Stop conditions

- 所需输入缺失、目标不清晰、环境不可用或风险不安全。
