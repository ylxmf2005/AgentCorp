---
artifact_type: PhaseAssignment
task_id: 20260603-120000-example-task
task_root: teamspace/tasks/20260603-120000-example-task/
from_agent: delivery-orchestrator
to_agent: review-researcher
phase: review-research
status: assigned
output_path: review/research/
output_language: zh-CN
effort: high
---

# 任务分配：review-research

## 目标

将本轮代码审查的每条发现研究到底：验证是否属实，给出 confirmed/false-positive/partial/needs-human 裁决，对成立的给出优雅的修复建议，并写出人类可完全理解的逐 issue 解释 + 索引。

## 输入

- review/code-review.md（必需）
- review/specialist-findings/（如有）
- 真实 diff / 变更文件列表（如有）
- 已记录的设计原则（CLAUDE.md / auto memory / design memory）（如有）

## 源产出

- review/code-review.md

## 约束

- zh-CN，写给不熟悉这段代码的人；涉及代码时，粘贴关键片段并解释。
- 裁决必须落在真实代码上并有证据支撑；仅当裁决依赖于仓库外的上下文（外部系统 / 运行时配置 / 产品意图）时标记 needs-human。阅读不足意味着继续阅读，而不是 needs-human——也不要强行下结论。
- 只给修复建议；不要修改产品代码，也不要做验收判断。
- 研究/解释文档是 *.md，从不纳入提交。

## 必需产出

- 在 `output_path` 文件夹下撰写 `00-index.md`（包含所有裁决）以及每 issue 一份研究文件。
- 返回与 `templates/phase-receipt.demo.md` 匹配的回执，`artifact_path` 指向 `00-index.md`。

## 终止条件

- 代码审查发现缺失，或关键代码/diff 无法读取，导致无法进行诚实的验证。
