"用户要求将一段英文 Markdown 翻译成自然、地道的简体中文，并给出了非常具体的约束条件。

关键约束：
1. 保留英文技术术语原文：agent、skill、gate、phase、handoff、review、PR、hunk、commit 等
2. 保留全部代码标识符
3. YAML frontmatter 的 key 与标识符值原样不动
4. 反引号内容、代码块、markdown 结构（标题/表格/列表/链接）、文件路径全部原样不动
5. description 翻成自然中文
6. 只输出翻译后的完整 markdown，不要任何解释，不要加代码围栏

让我逐段翻译：

YAML frontmatter 部分：
- artifact_type: TestPlan -> 保留
- task_id: example-task-20260603-120000 -> 保留
- author_agent: test-planner -> 保留
- status: ready_for_review -> 保留
- source_artifacts: -> 保留
  - requirements/validated-requirements.md -> 保留
  - teamspace/testing-context.md -> 保留
- plan_files: -> 保留
  - test/api-test-plan.md -> 保留
  - test/e2e-test-plan.md -> 保留
  - test/regression-test-plan.md -> 保留
- confidence: HIGH -> 保留

正文部分：
# Test Plan: Example Title -> # Test Plan: Example Title (标题中的 Example Title 应该翻译吗？根据规则，description 翻译成中文，但标题呢？让我再看看规则... "description 翻成自然中文"，标题应该也算描述性内容，可以翻译。但"Test Plan"是技术术语吗？用户没有明确列出，但通常这类标题可以保留英文或翻译。为了自然，我把"Example Title"翻译了，但保留"Test Plan"作为文档类型标识。等等，用户说"保留英文技术术语原文"，Test Plan 算不算？我觉得算，但 Example Title 只是占位符，应该翻译。)

让我重新考虑：用户说"description 翻成自然中文"，而标题"# Test Plan: Example Title"可以视为描述性内容。但"Test Plan"本身也是一个术语。为了保险，我保留"Test Plan"不翻译，只翻译"Example Title"。

等等，再看用户的例子，这看起来是一个模板/示例文档。我应该尽量让翻译后的文档看起来像中国工程师写的模板。

让我逐段翻译：

## Requirements covered
- FR-1 / AC-1: covered by the checks below.
-> ## Requirements covered
-> - FR-1 / AC-1: 由以下 check 覆盖。

## Must-Have checks
- MH-1 (P0): the behavior to prove, the verification layer, and the evidence.
-> ## Must-Have checks
-> - MH-1 (P0): 待验证的行为、验证层与证据。

## Forbidden zones
- The areas that must never be changed.
-> ## Forbidden zones
-> - 绝不可触碰的区域。

## Risk ranking and execution order
- Which P0 is a gate and which checks become directly blocked if it fails; the execution order of the checks.
-> ## Risk ranking and execution order
-> - 哪些 P0 是 gate，以及它失败后会直接 block 哪些 check；check 的执行顺序。

## Capability checks
- CAP-1 (P1): scenario, execution command, expected result.
-> ## Capability checks
-> - CAP-1 (P1): 场景、执行命令、预期结果。

## Failure and edge cases
- EDGE-1: cross-manual failure modes and decision rules.
-> ## Failure and edge cases
-> - EDGE-1: 跨 manual 的故障模式与决策规则。

## Audit and logging
- The required log/audit signals, and the sensitive information forbidden from output.
-> ## Audit and logging
-> - 必需的 log/audit 信号，以及禁止输出的敏感信息。

## Security and token constraints
- Auth, permission, sandbox, token, or rate-limit checks.
-> ## Security and token constraints
-> - Auth、permission、sandbox、token 或 rate-limit 相关的 check。

## Coverage summary
- requirement/capability: check id, verification layer, the plan file it lives in, the E2E goal (when a user-facing capability has no E2E goal, write the omission reason in this column).
-> ## Coverage summary
-> - requirement/capability：check id、验证层、所在的 plan file、E2E goal（当某个面向用户的 capability 没有 E2E goal 时，在本列写明遗漏原因）。

## Environment notes
- Environment type, workdir, commands, URLs, ports, credential references, and blockers.
-> ## Environment notes
-> - Environment type、workdir、commands、URLs、ports、credential references 以及 blockers。

## Testing context
- The state of `teamspace/testing-context.md` relied upon (date/version); what was added to it this time; the reason for omitting any execution manual, stated here.
-> ## Testing context
-> - 所依赖的 `teamspace/testing-context.md` 的状态（date/version）；本次新增的内容；此处写明遗漏任何 execution manual 的原因。

## Recommended testers and assignment
- API Contract Tester → `test/api-test-plan.md`; E2E Tester → `test/e2e-test-plan.md`; Regression Tester → `test/regression-test-plan.md`; add specialist roles when needed.
-> ## Recommended testers and assignment
-> - API Contract Tester → `test/api-test-plan.md`；E2E Tester → `test/e2e-test-plan.md`；Regression Tester → `test/regression-test-plan.md`；按需补充 specialist 角色。

## Residual risk
- Write \"none\" when there is none.
-> ## Residual risk
-> - 没有就写 \"none\"。

## Open questions
- Write \"none\" when there is none.
-> ## Open questions
-> - 没有就写 \"none\"。"</think>---
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

## Requirements covered

- FR-1 / AC-1: 由以下 check 覆盖。

## Must-Have checks

- MH-1 (P0): 待验证的行为、验证层与证据。

## Forbidden zones

- 绝不可触碰的区域。

## Risk ranking and execution order

- 哪些 P0 是 gate，以及它失败后会直接 block 哪些 check；check 的执行顺序。

## Capability checks

- CAP-1 (P1): 场景、执行命令、预期结果。

## Failure and edge cases

- EDGE-1: 跨 manual 的故障模式与决策规则。

## Audit and logging

- 必需的 log/audit 信号，以及禁止输出的敏感信息。

## Security and token constraints

- Auth、permission、sandbox、token 或 rate-limit 相关的 check。

## Coverage summary

- requirement/capability：check id、验证层、所在的 plan file、E2E goal（当某个面向用户的 capability 没有 E2E goal 时，在本列写明遗漏原因）。

## Environment notes

- Environment type、workdir、commands、URLs、ports、credential references 以及 blockers。

## Testing context

- 所依赖的 `teamspace/testing-context.md` 的状态（date/version）；本次新增的内容；此处写明遗漏任何 execution manual 的原因。

## Recommended testers and assignment

- API Contract Tester → `test/api-test-plan.md`；E2E Tester → `test/e2e-test-plan.md`；Regression Tester → `test/regression-test-plan.md`；按需补充 specialist 角色。

## Residual risk

- 没有就写 "none"。

## Open questions

- 没有就写 "none"。
