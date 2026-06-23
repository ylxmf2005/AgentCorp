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

明确本 phase 的目标。

## 输入

- 必须提供的输入 artifact 或证据。

## 来源 Artifact

- requirements/validated-requirements.md

## 约束

- 语言、scope、环境与风险方面的约束。

## 交付物

- 在 `output_path` 写入 phase artifact。
- 返回一份与 `templates/phase-receipt.demo.md` 格式一致的 receipt。

## 终止条件

- 缺少必要输入、目标不清晰、环境不可用或风险过高。
