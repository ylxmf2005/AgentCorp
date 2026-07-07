---
artifact_type: TestPlan
task_id: 20260603-120000-example-task
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

# Test Plan：示例标题

## 覆盖的 requirement

- FR-1 / AC-1：由下方的 check 覆盖。

## Must-Have 检查

- MH-1 (P0)：要证明的行为、验证层，以及证据。

## 禁区

- 绝对不允许改动的区域。

## Risk 排序与执行顺序

- 哪个 P0 是 gate、它失败会直接 block 哪些 check；各 check 的执行顺序。

## Capability 检查

- CAP-1 (P1)：场景、执行命令、预期结果。

## 失败与边界 case

- EDGE-1：跨 manual 的失败模式与决策规则。

## 审计与日志

- 必需的 log/audit 信号，以及禁止输出的敏感信息。

## 安全与 token 约束

- Auth、permission、sandbox、token 或 rate-limit 相关的 check。

## 覆盖摘要

- requirement/capability：check id、验证层、所在的 plan 文件、E2E 目标（当某个面向用户的 capability 没有 E2E 目标时，在本列写明省略原因）。

## 环境说明

- 环境类型、工作目录、命令、URL、端口、凭证引用方式，以及 blocker。

## 测试上下文

- 所依赖的 `teamspace/testing-context.md` 状态（日期/版本）；本次向其新增了什么；省略任何 execution manual 的原因写在这里。

## 建议的 tester 与 assignment

- API Contract Tester → `test/api-test-plan.md`；E2E Tester → `test/e2e-test-plan.md`；Regression Tester → `test/regression-test-plan.md`；需要时增加专项角色。

## 残余风险

- 没有就写 "none"。

## 遗留问题

- 没有就写 "none"。
