---
artifact_type: PhaseAssignment
task_id: 20260603-120000-example-task
task_root: teamspace/tasks/20260603-120000-example-task/
from_agent: delivery-orchestrator
to_agent: example-agent
phase: example-phase
status: assigned
output_path: review/example-output.md
---

# Assignment: example-phase

## Goal

说明本 phase 的目标。

## Inputs

- 所需的输入 artifact 或证据。

## Source Artifacts

- requirements/validated-requirements.md

## Constraints

- 语言、scope、环境及风险约束。

## Required Outputs

- 将本 phase 的 artifact 写入 `output_path`。
- 返回一份与 `templates/phase-receipt.demo.md` 格式一致的 receipt。

## Stop Conditions

- 缺少必需的输入、目标不明确、环境不可用或风险不可控。
