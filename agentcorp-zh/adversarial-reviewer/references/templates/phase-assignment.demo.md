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

# 任务指派：example-phase

## 目标

阐述本阶段的目标。

## 输入

- 所需的输入工件或证据。

## 源工件

- requirements/validated-requirements.md

## 约束

- 语言、范围、环境与风险约束。

## 所需输出

- 将阶段工件写入 `output_path`。
- 返回与 `templates/phase-receipt.demo.md` 匹配的回执。

## 终止条件

- 缺少必需的输入、目标不清、环境不可用或风险不安全。