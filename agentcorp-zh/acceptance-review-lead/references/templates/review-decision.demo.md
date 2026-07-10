---
artifact_type: AcceptanceDecision
task_id: 20260603-120000-example-task
author_agent: acceptance-review-lead
status: accept
source_artifacts:
  - path/to/source.md
---

# 审查决定

## 决定

accept | reject | needs_more_evidence | blocked

## 依据

- 支撑本决定的直接证据——你打开过的文件，每份都带有可核查的凭据（命令+输出、日志路径、截图）。每个 Must Have 必须在此或 Evidence Gaps 中体现，不得沉默遗漏。
- 对于缺陷类任务：记录原始失败输入已被重跑，以及其结果。

## 验证维度审计

- Completeness：已打开底层证据；缺失/skipped 检查及其影响。
- Correctness：行为和失败路径证据的直接程度。
- Coherence：需求、设计、计划、实现和观察行为是否一致。

## Must Fix

- 没有时填写“无”。

## Should Fix

- 没有时填写“无”。

## Evidence Gaps

- 没有时填写“无”。

## 剩余风险

- 没有时填写“无”。

## 下一责任人

- 负责下一步行动的 Agent 或人员。
