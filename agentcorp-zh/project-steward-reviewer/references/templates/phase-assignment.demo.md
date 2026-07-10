---
artifact_type: PhaseAssignment
task_id: 20260603-120000-example-task
task_root: teamspace/tasks/20260603-120000-example-task/
from_agent: delivery-orchestrator
to_agent: project-steward-reviewer
phase: code-review
status: assigned
output_path: review/specialist-findings/project-steward-reviewer.md
output_language: zh-CN
effort: high
---

# 任务分配：code-review

## 目标

从项目管家 / 维护者视角，评审这项计划、设计或 diff 是否值得被纳入项目的长期历史。

## 输入

- implementation/implementation-story.md
- implementation/implementation-result.md
- review/code-review.md
- git diff 或变更文件列表

## 源工件

- requirements/validated-requirements.md

## 约束

- 人类可读输出使用 zh-CN。
- 仅报告具有长期维护影响、可定位且可执行的问题。
- 不要将个人风格偏好伪装成阻塞项。

## 所需输出

- 在 `output_path` 写入阶段工件。
- 返回与 `templates/phase-receipt.demo.md` 匹配的回执。

## 停止条件

- 必需输入缺失、目标不明确，或评审范围无法确定。
