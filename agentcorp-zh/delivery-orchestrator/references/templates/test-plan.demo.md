---
artifact_type: TestPlan
task_id: example-task-20260603-120000
author_agent: test-planner
status: ready_for_review
source_artifacts:
  - requirements/validated-requirements.md
  - teamspace/testing-context.md
plan_files:
  - test/api-test-plan.md
  - test/e2e-test-plan.md
  - test/regression-test-plan.md
confidence: HIGH
---

# Test Plan: 示例标题

## 需求覆盖范围

- FR-1 / AC-1: 由下方 check 覆盖。

## Must-Have Check

- MH-1 (P0): 需验证的行为、verification level 与证据。

## 禁区

- 绝不可改动的区域。

## 风险分级与执行顺序

- 哪个 P0 作为 gate，一旦失败会立即 block 哪些 check；check 的执行顺序。

## Capability Check

- CAP-1 (P1): 场景、执行命令与预期结果。

## 失败与边界场景

- EDGE-1: 跨越多份手册的 failure mode，以及对应的判定规则。

## 审计与日志

- 必需的 logging/audit 信号，以及绝不可输出的敏感信息。

## 安全与 Token 约束

- Auth、permission、sandbox、token 或 rate-limit 相关的 check。

## 覆盖摘要

- requirement/capability：check id、verification level、所在 plan file 以及 E2E target（当面向用户的 capability 没有 E2E target 时，须在本列说明遗漏原因）。

## 环境说明

- 环境类型、workdir、commands、URL、port、credential 引用及 blockers。

## 测试上下文

- 所依赖的 `teamspace/testing-context.md` 状态（日期/版本）；本 plan 对其补充的内容；以及遗漏任何执行手册的原因。

## 推荐 Tester 与分工

- API Contract Tester → `test/api-test-plan.md`；E2E Tester → `test/e2e-test-plan.md`；Regression Tester → `test/regression-test-plan.md`；按需补充 specialist 角色。

## 残余风险

- 若无则写 "None"。

## 遗留问题

- 若无则写 "None"。
