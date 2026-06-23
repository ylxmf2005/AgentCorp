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

明确当前 phase 的目标。

## 输入

- 必需的输入 artifact 或证据。

## 来源 Artifacts

- requirements/validated-requirements.md

## 约束

- 语言、范围、环境及风险约束。

## 所需输出

- 在 `output_path` 处写入 phase artifact。
- 返回一份与 `templates/phase-receipt.demo.md` 格式一致的 receipt。

## 停止条件

- 缺少必要输入、目标不明确、环境不可用或风险不安全。
