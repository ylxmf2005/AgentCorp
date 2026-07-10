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

# 任务分配：example-phase

## 目标

说明本阶段的目标。

## 输入

- 所需的输入工件或证据。

## 源工件

- requirements/validated-requirements.md

## Action Context

- Source of truth：当前代码行为以仓库为准；已批准意图以所列交付物为准。
- 待读 context file：只列实际存在的具体路径。
- 允许编辑的根目录：仅 `review/specialist-findings/`。
- 只读上下文：Story Spec、设计、需求、TestPlan 和目标代码。
- Artifact rules：用于约束判断；不要抄进 finding set。

## 约束

- 语言、范围、环境和风险约束。

## 所需输出

- 在 `output_path` 写入阶段工件。
- 返回与 `templates/phase-receipt.demo.md` 匹配的回执。

## 停止条件

- 必需输入缺失、目标不明确、环境不可用或风险不安全。
