---
artifact_type: PhaseAssignment
task_id: 20260603-120000-example-task
task_root: teamspace/tasks/20260603-120000-example-task/
from_agent: delivery-orchestrator
to_agent: example-agent
phase: example-phase
status: assigned
output_path: review/example-output.md
output_language: zh-CN
effort: high
---

# 任务分配：example-phase

## 目标

说明本阶段的目标。

## 输入

- 所需的输入产出或证据。

## 源产出

- requirements/validated-requirements.md

## 约束

- 语言、范围、环境与风险约束。

## 必需产出

- 在 `output_path` 撰写阶段产出。
- 返回与 `templates/phase-receipt.demo.md` 匹配的回执。

## 终止条件

- 必需的输入缺失、目标不清晰、环境不可用或风险不安全。
