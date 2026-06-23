---
artifact_type: ValidatedRequirements
task_id: 20260603-120000-example-task
author_agent: delivery-orchestrator
status: ready_for_review
source_artifacts:
  - sponsor request
confidence: HIGH
---

# Validated Requirements: 示例标题

## 发起人意图

- 产品层面的意图；保留发起人原话中的重要措辞。

## 问题

- 当前用户或系统面临的问题，不预设任何实现方案。

## 目标用户

- 主要用户或系统 actor，以及待完成的工作。

## 用户旅程

### UJ-1: 示例旅程

- 用户画像与上下文：
- 初始状态：
- 路径：
- 成功条件：
- 边界情况：

```mermaid
flowchart LR
  subgraph Before[\"Before: current behavior or gap\"]
    BActor[\"Primary user or system actor\"] --> BEntry[\"Entry state\"]
    BEntry --> BProblem[\"Problem, missing capability, or failure mode\"]
    BProblem --> BOutcome[\"Current blocked or degraded outcome\"]
  end
  subgraph After[\"After: required behavior\"]
    AActor[\"Primary user or system actor\"] --> AEntry[\"Same or new entry state\"]
    AEntry --> ACapability[\"Required observable capability\"]
    ACapability --> ASuccess[\"Success outcome and acceptance signal\"]
  end
  BProblem -. \"validated change\" .-> ACapability
```

```mermaid
flowchart TD
  Sponsor[\"Sponsor intent\"] --> Journey[\"Validated user journey\"]
  Journey --> Requirement[\"Functional requirement\"]
  Requirement --> Criteria[\"Acceptance criteria\"]
  Criteria --> Scope[\"In scope and non-goals\"]
  Criteria --> Handoff[\"Test and architecture handoffs\"]
```

## 术语表

- **Term** - 在下游环节中统一使用的定义。

## 功能需求

### FR-1: 能力名称

系统必须提供一项可观测的能力。

验收标准：

- AC-1: 可观测的条件。

来源：sponsor request 或 source artifact。

## 非目标

- 明确排除的行为或范围。

## MVP 范围

- 范围内：
- 范围外：

## 约束

- 由发起人提供的约束。

## 成功标准

- 证明需求已达成的条件。

## 假设

- 需要在下游环节确认或验证的假设。

## 待解决问题

- Q-1: 如果没有就写 "None"。

## Handoff 给 Test Planner

- 必须验证的行为：
- 需要 E2E 覆盖的用户旅程：
- 需要重点测试的风险区域：

## Handoff 给 Solution Architect

- 必须保留的产品约束：
- 架构必须继承的术语与边界：
- 需求提出的技术问题：

## Mermaid 校验

- 包含哪些图表及其原因：
- 已检查的声明：
- 已检查的任务专属标签：
- 已替换的示例占位符：
- journey/scope/state 标签是否描述了可观测行为：
- 已检查的 Edge 语法：
- 已检查的人类可读性：
