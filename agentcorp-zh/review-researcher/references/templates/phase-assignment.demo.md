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

# 任务派发: review-research

## 目标

本轮 code review 的每个 finding 都要追根究底：验证是否属实，给出 confirmed/false-positive/partial/needs-human 的 verdict；对成立的给出优雅的 fix 建议；为每个 issue 写出完整可读的说明，并建立索引。

## 输入

- review/code-review.md（必需）
- review/specialist-findings/（如有）
- 实际 diff / 变更文件列表（如有）
- 已文档化的设计原则（CLAUDE.md / auto memory / design memory）（如有）

## 源文件

- review/code-review.md

## 约束

- 简体中文，写给不熟悉这段代码的人；涉及代码时，贴出关键 snippet 并加以解释。
- Verdict 必须锚定在真实代码上，且有证据支撑；若仅凭读代码不够或缺少 repo 外上下文，则标 needs-human，不强下结论。
- 只给出 fix 建议；不修改产品代码，也不做 acceptance 判定。
- Research / 说明文档为 *.md，且永远不会进入 commit。

## 必需产出

- 在 `output_path` 目录下，写入 `00-index.md`（包含所有 verdict）以及每个 issue 一份 research 文件。
- 返回一份符合 `templates/phase-receipt.demo.md` 格式的 receipt，`artifact_path` 指向 `00-index.md`。

## 终止条件

- Code review findings 缺失，或关键代码 / diff 无法读取，导致无法进行诚实的 verification。
