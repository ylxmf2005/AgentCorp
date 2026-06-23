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

## Goal

阐明本 phase 的目标。

## Inputs

- 所需的 input artifact 或证据。

## Source Artifacts

- requirements/validated-requirements.md

## Constraints

- 语言、范围、环境及风险约束。

## Required Output

- 将 phase artifact 写入 `output_path`。
- 返回一份与 `templates/phase-receipt.demo.md` 匹配的 receipt。

## Stop Conditions

- 缺少必需的 input、目标不明确、环境不可用或风险不可控。
