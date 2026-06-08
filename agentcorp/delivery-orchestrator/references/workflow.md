# 本地 AutoDev Workflow

协调工作时渐进地用这份引用。它是 Delivery Orchestrator 的本地 workflow 契约，不依赖任何外部运行时目录。

## 运作哲学

路由前先定义「完成」：什么必须能工作、什么绝对不能破坏、什么不在范围内。改动前先理解：为所选 phase 准备足够的代码、测试、需求、issue 或设计上下文。开工前先呈现 phase 序列，这就是流水线承诺。守住 author/reviewer 分离：产物的作者不审批自己的产物。把每个结果都当证据看——一条命令通过，只有当它证明了被改的行为时才有用。达到成功标准就停，不要把相邻范围吞进当前这一轮。每个 phase 只写它 owner 负责的部分，引用上游而非复述，只有当它改变某个决策或能避免实现/验证歧义时才加细节。所有 assignment、receipt、manifest 和 phase 产物都用带 YAML frontmatter 的 Markdown 文件。

## Workflow Modes

每个任务在 phase 执行开始前选定一种 mode：

| Mode | 默认？ | 如何运作 | 何时使用 |
| --- | --- | --- | --- |
| `single-agent` | 是 | Delivery Orchestrator 在当前 workflow 里直接执行非 review phase；review phase 仍交给独立的 review 角色。 | 常规任务、中小改动，或单个 agent 能保住足够上下文的工作。 |
| `subagents` | 否 | Delivery Orchestrator 通过 assignment/receipt 文件把 phase 产物委派给各 stage owner，并校验每份返回的产物。 | 发起人要求 subagents、L/XL 工作、并行实现，或 review 之外还需独立 authorship 的 phase。 |

默认 `single-agent`。切换到 `subagents` 需要发起人明确选择，或一条记录在案的编排理由：高复杂度、相互独立的并行模块、专门的执行环境，或 review 之外强烈需要 author 分离。

两种 mode 下 review 独立性都是强制的：`test-plan-review`、`plan-review`、`code-review`、`acceptance-review` 永远派给它们的 review owner；Delivery Orchestrator 不审批自己的产物或证据。

`single-agent` 下保持相同的 phase 词汇和产物路径：Delivery Orchestrator 直接写非 review 产物、在 `manifest.md` 里把自己记为 owner，这些 phase 可省略 assignment/receipt 文件；被委派的 review phase 仍保留 assignment/receipt。`subagents` 下，每个被委派的 phase 都走完整的 handoff 纪律。

## Task Classification

| 信号 | Paradigm |
| --- | --- |
| 新项目/系统、新的重要子系统，或没有现成代码库 | `dev/architecture-first` |
| 缺陷、回归、行为不正确、崩溃、数据丢失或安全 bug | `bugfix/hypothesis-driven` |
| 单个函数/组件/endpoint，1-2 个模块，不改现有接口 | `addition/simple` |
| 现有产品增强、行为扩展，或接口/数据流改动 | `enhancement/delta-design` |

不确定时选 `enhancement/delta-design`。若某个 phase 的 quality gate 暴露出分类不符，先 reclassify 再继续。

## Human Gate 策略

Human gate 是发起人的检查点，不是 phase 的 quality gate。跳过 human gate 只是去掉发起人的暂停，并不削弱继续往下所需的证据。

默认 human gate：Requirements、TestPlan、Design 或 diagnosis、Implementation Story Spec、blocking 或有风险的 review/verification 决策、Final delivery。

每个 human gate 允许的结果：

| 结果 | 含义 |
| --- | --- |
| `approved` | 发起人批准或说继续。 |
| `skipped` | 发起人明确跳过此 gate。 |
| `revised` | 发起人要求改动；继续前重跑或修订对应的 phase。 |
| `blocked` | 需要发起人输入、凭据、环境或风险接受。 |

对小而低风险的改动，征询发起人要不要跳过即将到来的某些 gate——点名具体哪几个 gate，并保持 review 独立。例如：「这是个小而孤立的改动；要不要跳过 TestPlan 和 Design 的 human gate、保留 Code Review，并在 Final delivery 时汇报？」

绝不静默跳过 human gate。把跳过的 gate 记进 `task.md` 的 Gate History 和 `manifest.md`。

即使 gate 被跳过或要求全自动，下列情况仍必须暂停：requirements 置信度为 LOW 或成功标准不清；priority、范围或风险接受不清；某个 review owner 返回 `request_changes` 或 `needs_more_evidence`；verification 失败或缺必要证据；缺凭据、环境或权限；需要汇报 Final delivery 状态。

## Paradigms

### `dev/architecture-first`

1. `validate-requirements`
2. `test-plan`
3. `test-plan-review`
4. `architecture`
5. `api-contract`——除非是 S 复杂度、单一子模块、且无 public/shared 接口风险
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `verify`
11. `acceptance-review`
12. `deliver`

### `enhancement/delta-design`

1. `validate-requirements`
2. `test-plan`
3. `test-plan-review`
4. `impact-analysis`（默认）。当结构性决策占主导时改用 `architecture`；只有 L/XL 工作、或编排者明确需要分开的结构设计与 delta 影响记录时，才两者都产出。
5. `api-contract`——仅 L/XL 工作、有 2 个以上相互独立的受影响模块，或有 public/shared 接口改动时
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `verify`
11. `acceptance-review`
12. `deliver`

设计产物归 Solution Architect 拥有。

### `bugfix/hypothesis-driven`

1. `validate-requirements`——基于 bug 报告和复现置信度
2. `diagnose`
3. `implementation-plan`
4. `plan-review`——除非修复被明确收为极小且低风险
5. `implement`
6. `code-review`
7. `verify`
8. `acceptance-review`
9. `deliver`

Diagnosis 定义正确性与回归标准。若 bug 无法复现或无法圈定边界，就 block 去要更多信息，而不是猜。

### `addition/simple`

1. `validate-requirements`
2. `test-plan`——带 feature 级验收标准
3. `test-plan-review`
4. `impact-analysis`——仅当目标模块、约束或需保留的行为不明显时
5. `api-contract`——仅当某个 public/shared API、schema、protocol 或跨模块边界必须被稳定下来时
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `verify`
11. `acceptance-review`
12. `deliver`

当影响到 3 个以上模块、或现有接口必须改动时，升级为 `enhancement/delta-design`。

## Phase Catalog

| Phase | Owner | Inputs | Outputs | Quality gate |
| --- | --- | --- | --- | --- |
| `validate-requirements` | Delivery Orchestrator（`validate-requirements` skill） | 任务描述、issue 或需求草稿 | 带置信度、user journeys、约束的 validated requirements，能澄清意图时附流程图 | 置信度 MEDIUM/HIGH；无 blocker 问题；inputs/outputs/约束/成功标准已理解；user journeys 可观察；图在能让 journey、范围、状态或前后行为更易理解时纳入，数量不限，并校验语法与可读性 |
| `test-plan` | Test Planner | validated requirements 或 diagnosis 标准 | 带风险排序检查、所需层级、环境需求和显式缺口的 test strategy | Must Haves 可观察；forbidden zones 具体；coverage 无无理由的缺口 |
| `test-plan-review` | Test Plan Reviewer | validated requirements、TestPlan/Test Strategy、项目约束 | `approve`、`request_changes` 或 `needs_more_evidence` | test plan 可执行，覆盖需求/风险面且无 test theater |
| `architecture` | Solution Architect | validated requirements 和已批准的 TestPlan | 面向读者的设计：背景、目标、关键决策、模块边界、接口、数据/状态流、兼容性、权衡、风险、与验证相关的约束 | 必需决策显式；设计详尽、易懂，足以让发起人和 Implementation Planner 据此工作；图在能让结构、时序、归属、数据/状态流或前后变化更易检视时纳入，数量不限并校验；每一步说清动作/产出/边界而非只点函数名 |
| `impact-analysis` | Solution Architect | validated requirements、已批准的 TestPlan、现有代码上下文 | delta 记录：受影响模块、接口/数据改动、需保留行为、风险、复杂度，以及有用的 delta 图或流程说明 | 受影响模块和接口改动显式；当前与目标行为可理解；有风险评估；图或精确流程说明让 delta 可检视；前后对比仅在直接解释改动时推荐；复杂度 S/M 或已升级 |
| `diagnose` | Solution Architect | bug 报告、复现步骤、观测到的失败 | 诊断：已验证的假设、证据、root cause、拟议修复、受影响文件、回归标准，以及有用的失败/修复图或流程说明 | root cause 因果链有证据；不猜；复现状态有记录；失败路径与修正后行为可理解；图为完整而非占位 |
| `api-contract` | Solution Architect | 架构或影响文档加 API/接口需求 | Markdown API contract 产物：public/shared 接口、请求/响应 schema、auth/error 语义、兼容性行为、验证钩子 | 每个 public/shared/跨模块接口都有 contract，含签名、schema、protocol 形态、归属、兼容性、auth/error 语义；共享类型集中；API Contract Reviewer/Tester 无需猜即可验证 |
| `implementation-plan` | Implementation Planner | validated requirements、已批准的 TestPlan、设计产物/contracts | Implementation Story Spec：目标、限定范围的 AC、有序任务、目标模块、约束、以引用方式给出的验证期望 | 第一个任务无歧义；目标路径/模块点名；无改变实现走向的悬而未决问题 |
| `plan-review` | Plan Review Lead | Implementation Story Spec 加 requirements、TestPlan、设计产物/contracts | `approve`、`request_changes` 或 `needs_more_evidence` | Story Spec 给 Implementation Engineer 足够上下文，无需自行发明架构 |
| `implement` | Implementation Engineer | 已批准的 Implementation Story Spec 和 Plan Review Lead 决策 | 可工作的代码、聚焦的测试、记录改动文件/命令/偏差/blocker 的 implementation result | 与已批准的 Story Spec/contracts 一致；聚焦的测试/检查已跑或 blocker 有记录 |
| `code-review` | Code Review Lead | diff、改动文件、Story Spec、requirements、TestPlan、设计/诊断、本地规范 | 一个 review 决策加分级的 findings | review 完成；must-fix 已处理或决策为 request_changes |
| `verify` | Test Leader 协调 testers | implementation、TestPlan 或诊断标准、环境规格 | 按 capability/integration/E2E/regression 给出的验证结果 | 必需检查通过；需要时已跑 E2E；缺口显式；无伪造或臆测的成功 |
| `acceptance-review` | Acceptance Review Lead | requirements、TestPlan、Story Spec、实现说明、code review 决策、验证证据、残余风险 | `accept`、`reject` 或 `needs_more_evidence` | 证据支撑每个 Must Have 与限定范围的风险；残余风险可接受 |
| `deliver` | Delivery Orchestrator | 已验收的实现和证据 | delivery report | 报告含文件/产物、测试、偏差、后续事项和残余风险 |

## Stage Owners

- Delivery Orchestrator 两种 mode 下都拥有分类、mode 选择、gatekeeping 和最终交付。
- Delivery Orchestrator 直接拥有 `validate-requirements`，经按需加载的 `validate-requirements` skill。
- `single-agent` 下，Delivery Orchestrator 还亲自写 `test-plan`、需要时的设计/诊断/contracts、`implementation-plan`、`implement` 和 `verify` 产物。
- `subagents` 下，Test Planner 拥有 `test-plan`；Solution Architect 拥有设计/分析产物；Implementation Planner 拥有 Implementation Story Spec；Implementation Engineer 拥有 `implement`；Test Leader 拥有验证协调；API Contract Tester、E2E Tester、Regression Tester 执行被指派的验证。
- `test-plan-review` 归 Test Plan Reviewer、`plan-review` 归 Plan Review Lead、`code-review` 归 Code Review Lead、`acceptance-review` 归 Acceptance Review Lead——两种 mode 下都如此。

## Artifact Organization

任务产生可持久的笔记、设计、prompts、screenshots、logs、reviews、验证证据或 handoff 时，写之前先定位产物位置。所有可持久的协作产物都在 `<workdir>/teamspace/` 下；当存在独立的 `code_worktree`/`code_location` 时，必须同步到 `<code_worktree>/teamspace/` 的同一相对路径。产物路径相对 `workdir` 记录。默认任务运行布局：

```text
teamspace/tasks/<task_id>/
  task.md
  manifest.md
  handoffs/
    001-validate-requirements.md
    001-validate-requirements-receipt.md
  requirements/
    validated-requirements.md
  test/
    test-plan.md
    test-plan-review.md
  design/
    architecture.md | impact-analysis.md | diagnosis.md | api-contract.md
  implementation/
    implementation-story.md
    implementation-result.md
  review/
    plan-review.md
    code-review.md
    specialist-findings/
  verification/
    assignments/
    verification-report.md
    test-results/
  acceptance/
    acceptance-package.md
    acceptance-decision.md
  delivery/
    delivery-report.md
```

只用任务需要的文件/子目录。产物和 handoff 内部的路径保持相对。`teamspace/` 是本地协调状态：若它出现在 git status 里，就为该本地仓库或 worktree 把 `teamspace/` 加进 `.git/info/exclude`；绝不要 stage 或 commit 它。

## Orchestrator 产物 demo

用本地 demo，而不是复述形态：

- `references/templates/task-record.demo.md` 对应 `task.md`
- `references/templates/task-manifest.demo.md` 对应 `manifest.md`
- `references/templates/phase-assignment.demo.md` 对应委派 phase 的 assignment
- `references/templates/phase-receipt.demo.md` 对应委派 phase 的 receipt
- `references/templates/acceptance-package.demo.md` 对应 `acceptance/acceptance-package.md`

照搬形态，再把示例值替换成当前任务的 phase、owner、status 和路径。

## Phase Handoff 纪律

委派的 phase，Delivery Orchestrator 在 phase 开始前先写 assignment 文件。每份委派 assignment 都带 `task_root`（相对 `workdir` 的 `teamspace/tasks/<task_id>/`）和相对该 task root 的 `output_path`；Location 与 Workspace 不同时，同一 task root 也必须存在于 `<code_worktree>/teamspace/tasks/<task_id>/`。被委派的 owner 在 assignment 的 `output_path` 写 phase 产物，并写回一份命名了产物路径和 status 的 Markdown receipt。

Delivery Orchestrator 校验：被委派产物的路径与 assignment 一致、frontmatter 的 `author_agent` 与 owner 一致、status 满足该 phase 的 gate；然后把 assignment、产物、receipt、human gate 结果和 phase quality 结果记进 `manifest.md`，再在 Workspace 与 Location 之间同步更新后的产物集。Delivery Orchestrator 在 active human gate 处停下，直到发起人明确批准、跳过或改向。

`single-agent` 下，由 Delivery Orchestrator 亲自写的 phase 可省略 assignment/receipt 文件，但 phase 产物和 manifest 条目仍是必需的；review phase 仍用 assignment/receipt，因为它们仍是委派出去的。`subagents` 下，被委派的 phase 必须有 assignment/receipt。两种 mode 下，validated requirements 产物都由 Delivery Orchestrator 经 `validate-requirements` skill 亲自写。委派验证期间，Test Leader 可在 `verification/assignments/` 下写 tester assignment，testers 在 `verification/test-results/` 下写结果文件，Test Leader 写最终的 `verification/verification-report.md`。

## Verification Hierarchy

1. Capability：每个 per-module Must Have 和失败/边界情况都被直接检查。
2. Integration/API：每条跨模块或 public contract 流程都有成功与错误传播检查。
3. E2E：每个面向用户的能力都至少出现在一条完整的用户目标里，含 happy 与 error path。
4. 涉及 UI 改动时做前端视觉/交互检查。

在必需的低层检查仍失败时，不要推进到更高层。某个场景无法运行时，记录原因并当作缺口，除非被明确接受。

## Parallel Execution Protocol

并行实现是 `implement` phase 的一种协议，不是单独的 phase。仅当下列全部成立时才并行：复杂度为 M/L/XL；至少两个子模块能独立构建；子模块共享接口但不共享实现；架构或影响文档已存在；涉及 public/shared API、schema、protocol 或跨模块 contract 时 `api-contract` 已完成；Implementation Story Spec 按 contract 切分任务、只保留各子模块所需的集成上下文；TestPlan 按子模块限定 Must Haves、Need Haves、Failure/Edge Cases 和 Forbidden Zones。

每个并行实现 session 恰好收到这些输入：

1. `STORY_SPEC_PATH`：已批准的 Implementation Story Spec 的相对路径。
2. `DESIGN_DOC_PATH`：架构、影响、诊断或 API contract 的相对路径。
3. `OWN_CONTRACT`：本 session 实现的 contract stub。
4. `DEP_CONTRACTS`：本 session 调用但不修改的只读 contract。
5. `TESTPLAN_SCOPE`：本子模块的 capability、边界、Must Have、Need Have、Failure/Edge Cases。
6. `FORBIDDEN_ZONE`：本子模块的明确红线。
7. `COMPLETION_SIGNAL`：协调者期望的确切完成信号。
8. `INTEGRATION_CONTEXT`：涉及本子模块的集成测试和跨边界期望。
