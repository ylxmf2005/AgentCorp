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

描述当前 phase 的目标。

## Input

- 必须提供的输入 artifact 或相关证据。

## Source artifacts

- requirements/validated-requirements.md

## Constraints

- 对语言、范围、环境及风险的约束条件。

## Required output

- 将 phase artifact 写入 `output_path`。
- 返回的 receipt 须与 `templates/phase-receipt.demo.md` 保持一致。

## Stop conditions

- 缺少必要输入、目标不清晰、环境不可用或风险不可接受。
