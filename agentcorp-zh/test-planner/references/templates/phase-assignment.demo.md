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

# 指派：example-phase

## 目标

说明本阶段的目标。

## 输入

- 所需输入产物或证据。

## 源产物

- requirements/validated-requirements.md

## 约束

- 语言、范围、环境和风险约束。

## 所需输出

- 在 `output_path` 写入阶段产物。
- 返回与 `templates/phase-receipt.demo.md` 匹配的回执。

## 停止条件

- 所需输入缺失、目标不清晰、环境不可用或继续不安全。