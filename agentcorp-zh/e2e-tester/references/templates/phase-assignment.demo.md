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

## 目标

明确本 phase 要达成的目标。

## 输入

- 必需的输入 artifact 或 evidence。

## 来源 artifact

- requirements/validated-requirements.md

## 约束

- 语言、范围、环境及风险约束。

## 所需输出

- 将 phase artifact 写入 `output_path`。
- 返回的 receipt 需与 `templates/phase-receipt.demo.md` 一致。

## 停止条件

- 缺少必需输入、目标不清、环境不可用或风险不可控。
