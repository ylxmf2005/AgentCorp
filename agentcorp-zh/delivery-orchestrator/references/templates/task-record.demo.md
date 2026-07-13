---
artifact_type: TaskRecord
task_id: 20260603-120000-example-task
author_agent: delivery-orchestrator
status: active
current_phase: validate-requirements
workflow_mode: partial-delegation
interaction_pace: continuous
effort: high
output_language: zh-CN
source_ref: origin/main
target_ref: origin/main
merge_base: 0123abcdef0123abcdef0123abcdef0123abcd
---

# 任务：示例任务

## 请求者需求

- 原始请求或问题链接。

## 成功标准

- 可观察的完成条件。

## 范围外

- 明确的非目标。

## Baseline

- 机器可读副本在 frontmatter（`source_ref` / `target_ref` / `merge_base`）——`validate-handoff.py` 会用它核对每一份携带 refs 的 assignment。
- source_ref：工作分支从哪切出、对着谁核实；堆叠任务在这里写父任务的分支，且只在父任务合入后才落地。
- target_ref：本次交付要合入哪里——通常是仓库默认分支，即使堆叠时也是；只有父任务尚未合入时它才与 source_ref 不同。
- 工作分支：feat/example-task
- 两个 ref 都是 intake 时确认的发起人意图，绝不从当前检出推断。当 source_ref != target_ref 时，工作没有对齐到 target_ref 之前交付不算完成。

## 选定范式

- enhancement/delta-design

## 工作流模式

- partial-delegation（从以下选项中选一：direct | partial-delegation | full-delegation）

## 交互 Pace

- continuous（从以下选项中选一：continuous | guided）

## Effort

- high（从以下选项中选一：low | medium | high | max）

## 阶段序列

- validate-requirements -> test-plan -> test-plan-review -> impact-analysis -> implementation-plan -> plan-review -> implement -> code-review -> review-research -> fix -> verify -> acceptance-review -> compound -> deliver

## 关卡历史

- 需求关卡：approved | skipped | revised | blocked
- 发起人持续偏好：无 | 不为常规审批暂停 | <具体指令>

## 当前约束

- 被阻塞的阶段跃迁：无。
- 原因：无。
- 可继续工作：当前 gate 允许的全部工作。
- 需要发起人决定：无。

## 交付物一致性

- 状态：coherent | needs_revision
- 触发修订：无。
- 受影响交付物：无。
- 下一位 Owner：无。

## 执行进度

| 工作单元 | 状态 | Owner | 证据或 blocker |
| --- | --- | --- | --- |
| 示例 | pending | example-agent | 无。 |

## 决策日志

- 关键编排决策及其理由。
