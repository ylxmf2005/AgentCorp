---
artifact_type: PhaseAssignment
task_id: example-task-20260603-120000
task_root: teamspace/tasks/example-task-20260603-120000/
from_agent: delivery-orchestrator
to_agent: review-researcher
phase: review-research
status: assigned
output_path: review/research/
---

# 指派：review-research

## 目标

把本轮 code review 的每个 finding 研究透：核验真伪、判定确认/误报/部分成立/待人确认，对成立的给出优雅修法建议，并写成让人完全看懂的逐 issue 解释 + 索引。

## 输入

- review/code-review.md（必需）
- review/specialist-findings/（如有）
- 真实 diff / 改动文件清单（如有）
- 记录在案的设计原则（CLAUDE.md / auto memory / 设计记忆）（如有）

## 来源产物

- review/code-review.md

## 约束

- zh-CN，面向不熟悉这块代码的人写；涉及代码要贴关键片段并解释。
- 判定必须落到真实代码上、有据；读码不足/缺仓库外上下文就标待人确认，别硬下结论。
- 只给修法建议，不改产品代码、不做验收判断。
- 研究/解释文档是 *.md，绝不纳入提交。

## 必需输出

- 在 `output_path` 文件夹下写 `00-index.md`（含每条判定）和每个 issue 一份研究文件。
- 返回一份匹配 `templates/phase-receipt.demo.md` 的 receipt，`artifact_path` 指向 `00-index.md`。

## 停止条件

- 缺少 code review findings，或无法读取关键代码/diff 以致无法诚实核验。
