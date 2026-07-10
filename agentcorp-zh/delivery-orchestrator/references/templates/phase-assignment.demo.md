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

# 分配：example-phase

## 目标

陈述此阶段的目标。

## 输入

- 所需的输入制品或证据。

## 来源制品

- requirements/validated-requirements.md

## Action Context

- Source of truth：当前代码行为以仓库为准；已批准意图以已批准任务交付物为准。
- 动手前必须读取的 context file：只列实际存在的具体路径；把每个必需文件逐一列出。
- 允许编辑的根目录：列出精确的仓库或 task-root 路径。
- 只读上下文：列出可读但不可编辑的路径。
- 输出路径：使用 frontmatter 中的 `output_path`。
- Artifact rules：用于约束被分配者的行为；不要把它们抄进输出交付物。

## 约束

- 语言、范围、环境和风险约束。

## 要求输出

- 将阶段制品写入 `output_path`。
- 返回符合 `templates/phase-receipt.demo.md` 的回执。

## 停止条件

- 必需 context file 缺失或已过期、来源交付物互相矛盾、目标不明确、环境不可用或风险不安全。点名受影响的阶段跃迁，以及仍可继续的独立工作。
