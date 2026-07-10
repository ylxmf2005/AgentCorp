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

# 指派：example-phase

## 目标

说明本阶段的目标。

## 输入

- 所需的输入产物或证据。

## 源产物

- requirements/validated-requirements.md

## Action Context

- Source of truth：观察行为以点名的运行环境为准；预期行为以所列任务交付物为准。
- 待读 context file：具体 TestPlan/playbook、实现与评审路径。
- 允许写入的根目录：被分配的结果路径，以及明确授权的测试数据。
- 只读上下文：产品代码；除非 assignment 明确授权 fixture 或测试编辑。
- Artifact rules：执行约束；不要抄进结果。

## 约束

- 语言、范围、环境和风险约束。

## 所需输出

- 在 `output_path` 写入阶段产物。
- 返回与 `templates/phase-receipt.demo.md` 匹配的回执。

## 停止条件

- 所需输入缺失、目标不清晰、环境不可用或风险不安全。
