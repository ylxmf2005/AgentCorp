---
artifact_type: PhaseAssignment
task_id: 20260611-120000-example-task
from_agent: delivery-orchestrator
to_agent: change-hygiene-reviewer
phase: code-review
status: assigned
task_root: teamspace/tasks/20260611-120000-example-task
output_path: review/specialist-findings/change-hygiene-reviewer.md
output_language: zh-CN
effort: high
---

# 任务分配

## 目标

审查此 MR/PR 差异是否干净、可追溯，且属于本次变更；覆盖差异噪音和范围残留两方面。

## 输入

- 差异：
- 任务/Story Spec/需求：
- API 契约 / 诊断 / 审查发现：
- 本地格式化/ linter 结果：

## 约束

- 仅审查变更卫生；不审查正确性/安全性/性能/可靠性。
- 每条发现都必须给出可操作的推荐：回退、拆分、保留并解释，或请求发起人确认。
