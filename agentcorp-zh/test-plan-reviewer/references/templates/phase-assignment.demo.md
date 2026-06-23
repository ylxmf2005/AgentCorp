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

# Assignment: example-phase

## Objective

说明本 phase 的目标。

## Inputs

- 所需的输入 artifact 或证据。

## Source artifacts

- requirements/validated-requirements.md

## Constraints

- 语言、范围、环境和风险方面的约束。

## Required outputs

- 将 phase artifact 写入 `output_path`。
- 返回一份与 `templates/phase-receipt.demo.md` 一致的 receipt。

## Stop conditions

- 缺少必需的输入、目标不明确、环境不可用，或风险不安全。
