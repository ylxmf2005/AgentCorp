---
artifact_type: TestPlan
task_id: example-task-20260603-120000
author_agent: test-planner
status: ready_for_review
source_artifacts:
  - requirements/validated-requirements.md
confidence: HIGH
---

# 测试计划：Example Title

## 覆盖的需求

- FR-1 / AC-1：由下列检查覆盖。

## Must-Have 检查

- MH-1：要证明的行为、验证层级和证据。

## 禁区

- 绝对不能改变的区域。

## Capability 检查

- Capability 场景和预期结果。

## Integration/API 检查

- Contract 或跨模块流程、成功路径和错误路径。

## E2E 用户流程

- 完整用户目标，覆盖 happy path 和 error path。

## 回归检查

- Bugfix 或必须保留的既有行为检查。

## 数据与迁移检查

- 持久化、迁移、回滚、隐私或留存检查。

## 失败与边界情况

- Failure mode 和预期行为。

## 审计与日志

- 必需的日志/审计信号，以及禁止输出的敏感信息。

## 安全与 Token 约束

- Auth、permission、sandbox、token 或 rate-limit 检查。

## 覆盖度汇总

- requirement/capability：check id 和验证层级。

## 环境说明

- 环境类型、workdir、命令、URL、端口、凭据引用和 blockers。

## 推荐 Tester 角色

- API Contract Tester, E2E Tester, Regression Tester, or specialist role.

## 残余风险

- 没有时写“无”。

## 开放问题

- 没有时写“无”。
