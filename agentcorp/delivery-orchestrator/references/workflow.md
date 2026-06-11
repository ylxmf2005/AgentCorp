# 本地 AutoDev Workflow

协调工作时渐进地用这份引用。它是 Delivery Orchestrator 的本地 workflow 契约，不依赖任何外部运行时目录。

## 运作哲学

路由前先定义「完成」：什么必须能工作、什么绝对不能破坏、什么不在范围内。改动前先理解：为所选 phase 准备足够的代码、测试、需求、issue 或设计上下文。开工前先呈现 phase 序列，这就是流水线承诺。守住 author/reviewer 分离：产物的作者不审批自己的产物。把每个结果都当证据看——一条命令通过，只有当它证明了被改的行为时才有用。达到成功标准就停，不要把相邻范围吞进当前这一轮。每个 phase 只写它 owner 负责的部分，引用上游而非复述，只有当它改变某个决策或能避免实现/验证歧义时才加细节。所有 assignment、receipt、manifest 和 phase 产物都用带 YAML frontmatter 的 Markdown 文件。

## Workflow Modes

每个任务在 phase 执行开始前选定一种 mode。三种 mode 按**委派程度**排列；phase 词汇、产物路径和 quality gate 在三种 mode 下都不变，变的只是每个 phase 的执行者和 review 的裁决者：

| Mode | 默认？ | 如何运作 | 何时使用 |
| --- | --- | --- | --- |
| `direct` | 否 | 不派任何 subagent。Delivery Orchestrator 亲自执行所有 phase；review 类 phase 由它按对应 review 视角产出 **draft** 结论，批准权在该 phase 的 human gate——发起人就是 reviewer。 | 小而低风险的改动、发起人要求快速通道，或宿主环境没有 subagent 能力。 |
| `partial-delegation` | 是 | Delivery Orchestrator 直接执行非 review phase；review、review-research、fix 委派给独立角色。 | 常规任务、中小改动，或单个 agent 能保住足够上下文的工作。 |
| `full-delegation` | 否 | 所有可委派的 phase 都通过 assignment/receipt 文件委派给各 stage owner，并校验每份返回的产物。 | 发起人要求、L/XL 工作、并行实现，或 review 之外还需独立 authorship 的 phase。 |

默认 `partial-delegation`。切换到 `full-delegation` 需要发起人明确选择，或一条记录在案的编排理由：高复杂度、相互独立的并行模块、专门的执行环境，或 review 之外强烈需要 author 分离。切换到 `direct` 必须由发起人明确选择或确认——它把独立 review 角色换成了发起人亲自裁决，发起人必须知情并愿意做 reviewer；绝不静默降级到 `direct`。

### 发起人工作路径菜单

mode 是内部账本词；对发起人先用协作节奏表达，再映射到 mode：

| 发起人看到的路径 | 内部 mode | 何时推荐 |
| --- | --- | --- |
| 快速小改 | `direct` | 任务极小、低风险、发起人明确愿意亲自裁决 review gate；必须点明 review 只是 draft，批准权在发起人。 |
| 标准交付 | `partial-delegation` | 默认推荐。适合大多数后端修复、增强和中小需求；保留独立 review/research/fix。 |
| 深度编排 | `full-delegation` | 大改、高风险、需要并行 authorship、跨多个模块或发起人要求全角色编排。 |

入口不要把三种路径机械展示给所有人。若信号清楚，直接说“我建议走标准交付”，并给 1-2 个可改选项；若任务很小，询问是否走快速小改；若任务明显复杂，推荐深度编排。用户已经给出明确模式时，直接采用并复述后果。

启动任务时的对话骨架：

```text
我先把这当作 <paradigm> 处理。成功标准是 <1-3 条>，主要风险是 <1-3 条>。
推荐走 <路径>（内部 mode: <mode>），因为 <理由>。
接下来我会跑：<phase sequence 的人话摘要>。
你可以：
1. 按推荐继续
2. 改成 <另一个合适路径>
3. 先补充/修改成功标准
```

只有当 LOW confidence、priority/范围/风险接受不清，或路径选择会改变 reviewer 独立性时，才停下等发起人选择；否则宣布推荐路线后继续执行。

### Subagent 调用参数

调用 subagent 时默认沿用当前宿主/调用者自己的运行配置。Claude 自己发起 Claude subagent 时就用 Claude 当前默认；Codex 自己发起 Codex subagent/CLI/skill 时就用 Codex 当前默认。AgentCorp 的角色路由只决定「派给谁、给什么上下文、产出放哪里」，不负责把模型、推理强度、权限或其他运行参数写死。

只有三种情况允许显式传参：发起人明确要求；assignment/manifest 里已有记录在案的覆盖值；目标工具 schema 要求必填。即便需要覆盖，也只传最小必要参数，并把原因记进 assignment 或 manifest。

### 运行时路由

按角色分两层运行时，两层都按上面的运行时继承原则调用、不额外指定模型参数：

- **Claude（决策层）**：Delivery Orchestrator、Test Planner、Test Plan Reviewer、Solution Architect、Implementation Planner、Plan Review Lead、Code Review Lead、Test Leader、Review Researcher、Acceptance Review Lead、Adversarial Reviewer、SOTA Researcher、Simplicity Reviewer、Project Steward Reviewer——走当前 Claude 环境的原生 subagent/Agent 能力。
- **Codex（执行层）**：Implementation Engineer、Review Fixer、Correctness Reviewer、Security Reviewer、Performance Reviewer、Reliability Reviewer、Standards Reviewer、API Contract Reviewer、API Contract Tester、E2E Tester、Regression Tester——走当前 Codex 环境的原生 subagent/CLI/skill 能力；宿主里没有 Codex 通道时，降级为本地 subagent 调用同一 skill，协议不变。

review 独立性在三种 mode 下都不可让步，变的只是裁决者：`partial-delegation`/`full-delegation` 下，`test-plan-review`、`plan-review`、`code-review`、`acceptance-review` 永远派给它们的 review owner；`direct` 下这些 phase 由 Delivery Orchestrator 亲自产出 draft 结论，但 **draft 不等于批准**——每个 review phase 的 human gate 必须保持 active、由发起人裁决，且这些 gate 在 `direct` 下不可跳过。任何 mode 下，Delivery Orchestrator 都不审批自己的产物或证据。

`review-research` 和 `fix` 这两个处理 code-review findings 的 phase，`partial-delegation`/`full-delegation` 下都**委派**出去，不由 Delivery Orchestrator 亲自核验或亲自写修复代码（`direct` 下由它亲自做，但保持同样的顺序与产物：先 research 产出逐 issue 判定、过发起人的 human gate、再 fix 落地）。分工：

- `review-research` 整段委派给 `review-researcher`：它带对抗性地独立重查每条 finding，掐掉误报，产出 `review/research/`（判定 + 修法建议 + 逐 issue 解释）。这是错误传播的断路器，必须独立做透。
- `fix` 由 **Delivery Orchestrator 编排并行**：Orchestrator 自己不写修复代码，而是把确认/部分成立的修复项**按文件归属切成互不重叠的组**，每组派一个 `review-fixer` 单 worker 并行落地（保证两组不碰同一文件），所有组返回后由 Orchestrator 跑一次合并校验、汇总成 `review/fix-result.md`。`review-fixer` 是单个修复 worker，不自己切分或派发。详见 Parallel Execution Protocol。

两者有**顺序依赖**：`fix` 必须在 `review-research` 之后；`review-fixer` 只消费已核验的 `review/research/`，找不到就停、不在原始 findings 上自行核验。这保住了「独立核验」与「忠实落地」的作者分离。

`partial-delegation` 下保持相同的 phase 词汇和产物路径：Delivery Orchestrator 直接写非 review 产物、在 `manifest.md` 里把自己记为 owner，这些 phase 可省略 assignment/receipt 文件；被委派的 review phase 仍保留 assignment/receipt。`full-delegation` 下，每个被委派的 phase 都走完整的 handoff 纪律。`direct` 下没有任何 assignment/receipt：全部 phase 产物与 manifest 条目仍必需，review 类产物在 manifest 里记 owner 为 delivery-orchestrator 并标注 draft，gate 结果记发起人的裁决。

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

默认 human gate：Requirements、TestPlan、Design 或 diagnosis、Implementation Story Spec、blocking 或有风险的 review/verification 决策、review-research 的判定与修法建议（`fix` 落地前）、Final delivery。

`review-research` 之后、`fix` 之前是一个自然的发起人检查点：发起人可以在这里确认哪些 finding 是真问题、哪些是误报、以及建议的修法是否可接受，再放行 `fix` 落地。小而低风险的改动可以征询发起人跳过这个 gate，但跳过不改变「`fix` 必须消费已核验的 `review/research/`」这条依赖。

每个 human gate 允许的结果：

| 结果 | 含义 |
| --- | --- |
| `approved` | 发起人批准或说继续。 |
| `skipped` | 发起人明确跳过此 gate。 |
| `revised` | 发起人要求改动；继续前重跑或修订对应的 phase。 |
| `blocked` | 需要发起人输入、凭据、环境或风险接受。 |

### Gate 导航菜单

进入 human gate 时，不要只问“approved 吗”。先给发起人足够判断的摘要，再给短选项。默认格式：

```text
当前位置：<phase/gate> 已到 human gate；这一步决定 <后续影响>。
证据：<产物路径 + 关键结论/缺口，不超过 4 条>。
我建议：<approved/skipped/revised/blocked 之一>，因为 <一句理由>。
可选：
1. 批准，进入 <下一 phase>
2. 要我按 <具体方向> 修订后再回来
3. 补充信息/风险接受
4. 跳过这个 human gate（仅当本 gate 允许跳过；说明 quality gate 不会放松）
```

选项要随上下文裁剪：`direct` 下 review 类 gate 不给“跳过”；LOW confidence 或缺凭据时默认建议必须是 `blocked`；review owner 返回 `request_changes` 或 `needs_more_evidence` 时默认建议必须是修订/补证，而不是批准。发起人用自然语言回答时，映射到 `approved`、`skipped`、`revised`、`blocked` 并记账；映射不清才追问一句。

对小而低风险的改动，征询发起人要不要跳过即将到来的某些 gate——点名具体哪几个 gate，并保持 review 独立。例如：「这是个小而孤立的改动；要不要跳过 TestPlan 和 Design 的 human gate、保留 Code Review，并在 Final delivery 时汇报？」

绝不静默跳过 human gate。把跳过的 gate 记进 `task.md` 的 Gate History 和 `manifest.md`。

无人值守（发起人不在场——自动化触发、定时任务、被其他流程调用）时，human gate 不能由任何 agent 代答。发起人可以在开跑前预批点名的 gate（记进 `task.md` 的 Gate History，视同 `approved`）；走到未预批的 gate 时，把待决问题和当前产物路径写进 `task.md`，停在那里结束本轮，等发起人回来裁决——「发起人大概会同意」不是继续的理由。

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
10. `review-research`——当 code-review 产出需处理的 findings 时；核验真伪、给修法建议、逐 issue 解释
11. `fix`——落地 `review-research` 判定为确认/部分成立的修法；必跟在 `review-research` 之后
12. `verify`
13. `acceptance-review`
14. `deliver`

### `enhancement/delta-design`

1. `validate-requirements`
2. `test-plan`
3. `test-plan-review`
4. `impact-analysis`——用于说明现有代码 delta；当结构性决策也需要单独说明时，同时产出 `architecture`。
5. `api-contract`——当 public/shared API、schema、protocol、跨模块边界或并行实现契约必须稳定下来时产出；它可与 `architecture` 或 `impact-analysis` 组合。
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `review-research`——当 code-review 产出需处理的 findings 时；核验真伪、给修法建议、逐 issue 解释
11. `fix`——落地 `review-research` 判定为确认/部分成立的修法；必跟在 `review-research` 之后
12. `verify`
13. `acceptance-review`
14. `deliver`

设计产物归 Solution Architect 拥有。

### `bugfix/hypothesis-driven`

1. `validate-requirements`——基于 bug 报告和复现置信度
2. `diagnose`
   - 当修复跨多个模块、改变现有行为或需要明确落点/保留行为时，附加 `impact-analysis`。
   - 当修复涉及 public/shared API、schema、protocol 或跨模块契约时，附加 `api-contract`。
3. `implementation-plan`
4. `plan-review`——除非修复被明确收为极小且低风险
5. `implement`
6. `code-review`
7. `review-research`——当 code-review 产出需处理的 findings 时；核验真伪、给修法建议、逐 issue 解释
8. `fix`——落地 `review-research` 判定为确认/部分成立的修法；必跟在 `review-research` 之后
9. `verify`
10. `acceptance-review`
11. `deliver`

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
10. `review-research`——当 code-review 产出需处理的 findings 时；核验真伪、给修法建议、逐 issue 解释
11. `fix`——落地 `review-research` 判定为确认/部分成立的修法；必跟在 `review-research` 之后
12. `verify`
13. `acceptance-review`
14. `deliver`

当影响到 3 个以上模块、或现有接口必须改动时，升级为 `enhancement/delta-design`。

## Phase Catalog

| Phase | Owner | Inputs | Outputs | Quality gate |
| --- | --- | --- | --- | --- |
| `validate-requirements` | Delivery Orchestrator（亲自写，见 `references/validate-requirements.md`） | 任务描述、issue 或需求草稿 | 带置信度、user journeys、约束的 validated requirements，能澄清意图时附流程图 | 置信度 MEDIUM/HIGH；无 blocker 问题；inputs/outputs/约束/成功标准已理解；user journeys 可观察；图在能让 journey、范围、状态或前后行为更易理解时纳入，数量不限，并校验语法与可读性 |
| `test-plan` | Test Planner | validated requirements 或 diagnosis 标准 | 带风险排序检查、所需层级、环境需求和显式缺口的 test strategy | Must Haves 可观察；forbidden zones 具体；coverage 无无理由的缺口 |
| `test-plan-review` | Test Plan Reviewer | validated requirements、TestPlan/Test Strategy、项目约束 | `approve`、`request_changes` 或 `needs_more_evidence` | test plan 可执行，覆盖需求/风险面且无 test theater |
| `architecture` | Solution Architect | validated requirements 和已批准的 TestPlan | 面向读者的设计：背景、目标、关键决策、模块边界、接口、数据/状态流、兼容性、权衡、风险、与验证相关的约束 | 必需决策显式；设计详尽、易懂，足以让发起人和 Implementation Planner 据此工作；图在能让结构、时序、归属、数据/状态流或前后变化更易检视时纳入，数量不限并校验；每一步说清动作/产出/边界而非只点函数名 |
| `impact-analysis` | Solution Architect | validated requirements、已批准的 TestPlan、现有代码上下文 | delta 记录：受影响模块、接口/数据改动、需保留行为、风险、复杂度，以及有用的 delta 图或流程说明 | 受影响模块和接口改动显式；当前与目标行为可理解；有风险评估；图或精确流程说明让 delta 可检视；仅当前后对比能直接解释改动时才用；复杂度 S/M 或已升级 |
| `diagnose` | Solution Architect | bug 报告、复现步骤、观测到的失败 | 诊断：已验证的假设、证据、root cause、拟议修复、受影响文件、回归标准，以及有用的失败/修复图或流程说明 | root cause 因果链有证据；不猜；复现状态有记录；失败路径与修正后行为可理解；图为完整而非占位 |
| `api-contract` | Solution Architect | 架构或影响文档加 API/接口需求 | Markdown API contract 产物：public/shared 接口、请求/响应 schema、auth/error 语义、兼容性行为、验证钩子 | 每个 public/shared/跨模块接口都有 contract，含签名、schema、protocol 形态、归属、兼容性、auth/error 语义；共享类型集中；API Contract Reviewer/Tester 无需猜即可验证 |
| `implementation-plan` | Implementation Planner | validated requirements、已批准的 TestPlan、设计产物/contracts | Implementation Story Spec：目标、限定范围的 AC、有序任务、目标模块、约束、以引用方式给出的验证期望 | 第一个任务无歧义；目标路径/模块点名；无改变实现走向的悬而未决问题 |
| `plan-review` | Plan Review Lead | Implementation Story Spec 加 requirements、TestPlan、设计产物/contracts | `approve`、`request_changes` 或 `needs_more_evidence` | Story Spec 给 Implementation Engineer 足够上下文，无需自行发明架构 |
| `implement` | Implementation Engineer | 已批准的 Implementation Story Spec 和 Plan Review Lead 决策 | 可工作的代码、聚焦的测试、记录改动文件/命令/偏差/blocker 的 implementation result | 与已批准的 Story Spec/contracts 一致；聚焦的测试/检查已跑或 blocker 有记录 |
| `code-review` | Code Review Lead | diff、改动文件、Story Spec、requirements、TestPlan、设计/诊断、本地规范 | 一个 review 决策加分级的 findings | review 完成；正确性、标准、简洁性、change hygiene 与 project stewardship 已被考虑；must-fix 经 `review-research`/`fix` 处理或决策为 request_changes |
| `review-research` | Review Researcher（finding 多时 Delivery Orchestrator 按代码域并行编排、汇总索引） | code-review findings（必需）、diff、设计原则/约定 | `review/research/`：**每条 finding 一份** per-issue 文件（判定 + 根因级修法建议 + 面向不熟悉者的人类可读解释）+ `00-index.md` | 每条 finding 落到真实代码上有据判定、逐条成文（不 bundle）、含背景；误报/部分成立讲清原因；确认/部分成立给出优雅修法建议；缺仓库外上下文标待人确认而非硬下结论 |
| `fix` | Delivery Orchestrator 协调并行 Review Fixer workers | `review/research/`（必需，含判定与修法建议）+ human 评论；改动文件清单 | 各组 `review/fix-records/<group>.md` + 汇总 `review/fix-result.md` + 后端代码改动（留工作区） | 找到并消费了 `review/research/`（缺则停并要求先跑 `review-research`）；确认/部分成立项按文件归属切成互不重叠的组、并行派 worker 落地、同文件不并发；各 worker 忠实落地、治本不打补丁；合并校验跑一次且通过；不提交、不碰前端 |
| `verify` | Test Leader 协调 testers | implementation、TestPlan 或诊断标准、环境规格 | 按 capability/integration/E2E/regression 给出的验证结果 | 必需检查通过；需要时已跑 E2E；缺口显式；无伪造或臆测的成功 |
| `acceptance-review` | Acceptance Review Lead | requirements、TestPlan、Story Spec、实现说明、code review 决策、验证证据、残余风险 | `accept`、`reject` 或 `needs_more_evidence` | 证据支撑每个 Must Have 与限定范围的风险；残余风险可接受 |
| `deliver` | Delivery Orchestrator | 已验收的实现和证据 | delivery report | 报告含文件/产物、测试、偏差、后续事项和残余风险 |

### Phase 完成提示

每个 phase 通过 quality gate 后，面向发起人只报会帮助其判断下一步的信息：

- `完成了什么`：phase 名 + 人话含义。
- `证据在哪里`：产物路径、关键测试/校验、receipt 或 review 决定。
- `下一步`：下一个 phase 和 owner；若有 active human gate，转入 Gate 导航菜单。
- `可选改向`：仅当新证据暴露出范围、风险或分类变化时提供；否则不要重复列全菜单。

退回 phase 时同样给导航：说明退回原因、你会改变什么再重派、是否需要发起人补输入。连续两次退回同一 phase 后，默认停下来重新评估切分或计划，并把可选路线交给发起人。

## Stage Owners

- Delivery Orchestrator 三种 mode 下都拥有分类、mode 选择、gatekeeping 和最终交付。
- Delivery Orchestrator 直接拥有 `validate-requirements`，亲自写产物——进入该 phase 时加载 `references/validate-requirements.md`（置信度、何时 block、gate 由发起人裁决；形态见 demo，门槛见 Phase Catalog）。
- `partial-delegation` 下，Delivery Orchestrator 还亲自写 `test-plan`、需要时的设计/诊断/contracts、`implementation-plan`、`implement` 和 `verify` 产物。
- `direct` 下，Delivery Orchestrator 亲自执行所有 phase；review 类 phase 它按对应 review 视角产出 draft，批准权在发起人的 human gate。
- `full-delegation` 下，Test Planner 拥有 `test-plan`；Solution Architect 拥有设计/分析产物；Implementation Planner 拥有 Implementation Story Spec；Implementation Engineer 拥有 `implement`；Test Leader 拥有验证协调；API Contract Tester、E2E Tester、Regression Tester 执行被指派的验证。
- `test-plan-review` 归 Test Plan Reviewer、`plan-review` 归 Plan Review Lead、`code-review` 归 Code Review Lead、`acceptance-review` 归 Acceptance Review Lead——`partial-delegation`/`full-delegation` 下都如此；`direct` 下这些 review 的批准权归发起人的 human gate。
- `review-research` 委派给 Review Researcher。finding 多时 Delivery Orchestrator 按代码域去重切簇、并行派多个 Review Researcher，每个对它那簇**逐条**写 per-issue 文件，Orchestrator 再汇总 `00-index.md`；worker 不写 bundle 文件、不自己 fan out。`fix` 同理由 Delivery Orchestrator 编排并行：切分文件分组、并行派多个 Review Fixer 单 worker、跑合并校验、汇总 `fix-result.md`；Review Fixer 只落地分到的那一组，不自己切分或派发。`partial-delegation`/`full-delegation` 下都如此，以保住「独立核验」与「忠实落地」的作者分离；`direct` 下 research 与 fix 由 Orchestrator 亲自串行完成，作者分离由 research 判定先过发起人 human gate 来保证。`fix` 永远排在 `review-research` 之后，且只消费已核验的 `review/research/`。

## Artifact Organization

没有现成任务时，把 `task_id` 定为 `<desc-slug>-<YYYYMMDD-HHMMSS>`，`task_root` 定为相对 `workdir` 的 `teamspace/tasks/<task_id>/`，再据 demo 创建 `task.md` 和 `manifest.md`。

任务产生可持久的笔记、设计、prompts、screenshots、logs、reviews、验证证据或 handoff 时，写之前先定位产物位置。所有可持久的协作产物都在 `<workdir>/teamspace/` 下；当存在独立的 `code_worktree`/`code_location` 时，必须同步到 `<code_worktree>/teamspace/` 的同一相对路径——创建或更新某个产物时先写当前这一侧，报告完成前把同一相对路径复制到另一侧。产物路径相对 `workdir` 记录，不要把 `<workdir>` 改写成机器相关的 Location 路径。默认任务运行布局：

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
  design/                         # combine as needed; multiple artifacts may coexist
    architecture.md
    impact-analysis.md
    diagnosis.md
    api-contract.md
  implementation/
    implementation-story.md
    implementation-result.md
  review/
    plan-review.md
    code-review.md
    specialist-findings/
    research/
      00-index.md
      <编号>-<slug>.md
    fix-result.md
    fix-records/
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

`artifact_type` 取值：Orchestrator 产出的为 `TaskRecord`、`TaskManifest`、`PhaseAssignment`、`AcceptancePackage`，`author_agent: delivery-orchestrator`；委派 phase 的 receipt 由其 owner 写回，`from_agent` 为该 owner、`phase` 为 assignment 的 phase。最终交付时写 `delivery/delivery-report.md`，讲清 Status、Code/Artifact Location、交付了什么、验证结果、缺口、后续事项，以及关键产物路径。

## Phase Handoff 纪律

委派的 phase，Delivery Orchestrator 在 phase 开始前先写 assignment 文件。每份委派 assignment 都带 `task_root`（相对 `workdir` 的 `teamspace/tasks/<task_id>/`）和相对该 task root 的 `output_path`；Location 与 Workspace 不同时，同一 task root 也必须存在于 `<code_worktree>/teamspace/tasks/<task_id>/`。被委派的 owner 在 assignment 的 `output_path` 写 phase 产物，并写回一份命名了产物路径和 status 的 Markdown receipt。

每收到一份 receipt，Delivery Orchestrator 先跑机械校验，再做质量判断——两者分开：

- **机械校验（envelope 一致性）**：跑 `scripts/validate-handoff.py --pair <assignment> <receipt> --task-root <task_root>`（或处理完一批后 `--sweep --task-root <task_root>`）。它检查 receipt 的 `artifact_path` 真的存在、与 assignment 的 `output_path` 一致、`from_agent`/`phase`/`task_id` 与 assignment 对得上、产物的 `author_agent` 与 owner 一致、status 非空。这一步堵的是「receipt 说做完了但产物不在 / 张冠李戴 / 字段缺失」这类自由文本契约最容易放过的失败（receipt 措辞 ≠ 实际产物）。**校验非 0 退出就当作 handoff 未完成**，按 `needs_more_evidence` 退回 owner，不进入下一步，也不计入 gate 通过。
- **质量判断（phase gate）**：机械校验过了之后，Orchestrator 才判断 status 是否满足该 phase 的 quality gate、证据是否够强。机械校验过不代表 gate 过。receipt 里带偏差、concern 或 blocker 说明时，先把说明读完再做 gate 判断，不要只看 status 字段。

退回不是原样重试。一个 phase 被退回（机械校验失败、`request_changes`、`needs_more_evidence` 或 owner 报 blocked）后重派时，必须先改变某样东西：补齐它点名缺失的上下文、缩小或拆分任务、换执行通道，或上报发起人——什么都不变就重派，只会拿到同样的失败。同一 phase 连续两次退回，停下来重新评估切分或计划本身是不是错了，而不是第三次重试。

校验通过后，把 assignment、产物、receipt、human gate 结果和 phase quality 结果记进 `manifest.md`，再在 Workspace 与 Location 之间同步更新后的产物集。Delivery Orchestrator 在 active human gate 处停下，直到发起人明确批准、跳过或改向。

`partial-delegation` 下，由 Delivery Orchestrator 亲自写的 phase 可省略 assignment/receipt 文件，但 phase 产物和 manifest 条目仍是必需的；review phase 仍用 assignment/receipt，因为它们仍是委派出去的。`full-delegation` 下，被委派的 phase 必须有 assignment/receipt。`direct` 下没有 assignment/receipt，全部 phase 产物与 manifest 条目仍必需。任何 mode 下，validated requirements 产物都由 Delivery Orchestrator 亲自写（见 `references/validate-requirements.md`）。委派验证期间，Test Leader 可在 `verification/assignments/` 下写 tester assignment，testers 在 `verification/test-results/` 下写结果文件，Test Leader 写最终的 `verification/verification-report.md`。

### Handoff 的两类上下文保真（coupled vs independent）

「上游产物名字和路径即视为足够、引用而非复述」这条默认原则，只适用于一类 handoff，不能一刀切。写 assignment、决定喂多少上下文时，先分清这是哪一类：

- **independent（独立/审查类）**：`test-plan-review`、`plan-review`、`code-review`、各专项 review、`review-research`、`acceptance-review`、验证类。下游要的是**独立判断**，看到上游过多的结论反而会被带偏（conformity）。这里坚持默认原则：传**指针/路径**，让下游自己去读、自己判断；下游回传**蒸馏后的结论**（findings/decision），不回灌原始上下文。这保住了独立性，也省 context。

- **coupled（耦合/承接类）**：`implement`、`fix`、`code-review → review-research → fix` 这条修复脊柱、以及任何「下游要在上游决策之上继续做、做错就连锁错」的 handoff。这里**反过来**：assignment 必须带上**完整的上游产物与既往决策**（不是摘要、不是指针），因为 action 携带隐含决策，隐含决策不随手传递就会产生冲突和返工。典型必带项：`fix` 要带 `review-research` 对该 issue 的**完整判定 + 根因 + 修法建议**(而非「见 review/research/」一句带过)；`implement` 要带已批准的 Story Spec 全文与相关 contract，而非只给路径。

判断准则一句话：**下游是要「独立地另判一次」还是「在上游结论之上接着做」**——前者传指针保独立，后者喂全文保连贯。拿不准时按 coupled 处理（宁可多喂，不可丢决策）。

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

### `review-research` 的并行（按代码域去重切分，输出仍逐条成文）

`review-research` 在 finding 多时也由 Delivery Orchestrator 并行编排。这里有个必须守住的区分：**调查单元可以聚类，输出单元永远是逐条。** 聚类只为「同一批代码不被重复读」，绝不能让产出粒度塌成 cluster 文件。

1. **取 finding**：从 code-review 的 findings 取全部待核验 finding。
2. **按代码域去重归并成簇**：多条跨 reviewer 指向同一文件 / 同一调用链的，归到一簇（如「convert 轮询」「asset clone 锁」「batch status 契约」）。簇是为了让一个 worker 把那批共享代码读一遍就覆盖多条，而不是 33 条各开一个 agent 重复读同一批文件。
3. **并行派 `review-researcher`**：每簇一个 assignment，给 `FINDINGS`（本簇每条 finding 的全文 + reviewer 证据，仅作线索）、`CODE_SCOPE`（本簇相关代码范围）、`DESIGN_PRINCIPLES`（记录在案的设计原则）、独立对抗式重查的纪律，以及 `OUTPUT_DIR=review/research/`。**硬约束写进 assignment：worker 对它那簇里的每条 finding 各写一份 per-issue 文件 `review/research/<编号>-<slug>.md`，不许写 bundle/cluster 文件。** 遵守 harness 并发上限；不支持并行就串行，协议不变。
4. **汇总索引**：各 worker 写完自己那几条的 per-issue 文件并回 receipt。全部返回后，**Orchestrator 从所有 per-issue 文件汇总写 `review/research/00-index.md`**（照 `templates`/研究骨架的索引形态：按 P0→P1→P2 列出每条 + 判定 + 链接）。Orchestrator 不自造合并式 `SUMMARY.md`，也不给索引安自定义 `artifact_type`——索引就是 `00-index.md`。
5. **人审 gate 后才进 fix**：默认停在 review-research 的 human gate，让发起人确认判定与修法，再进 `fix`；不要从 research 直接链到 fix。

收 receipt 时照常 `scripts/validate-handoff.py` 校验（worker receipt 的 `artifact_path` 指向其产出的某份 per-issue 文件或 `review/research/`），index 汇总后再 `--sweep` 全量过一遍。

### `fix` 的并行（同一协议，按文件归属切分）

`fix` 也是由 Delivery Orchestrator 编排的并行协议，不是单独 phase 之外的特例。前置：`review-research` 已产出 `review/research/`，其中有判定为**确认/部分成立**的修复项。Orchestrator 按下面做：

1. **取待修项**：从 `review/research/` 取出所有确认/部分成立项及其修法建议（叠加 human 评论；误报、待人确认不修）。找不到 `review/research/` 就停，先跑 `review-research`。
2. **按文件归属切分互不重叠的组**：把每个待修项的主改文件（及可预见的外溢文件）列出来；**涉及同一文件的项归进同一组**，由同一个 worker 串行处理。两组的文件占用集必须不相交。
3. **并行派 `review-fixer` 单 worker**：每组一个 assignment，恰好给这些输入——`GROUP_SLUG`、`FIX_ITEMS`（本组确认/部分成立项及 research 修法建议）、`OWNED_FILES`（本组授权编辑、其他组不会碰的文件集）、`REPO_CONVENTIONS`、`FOCUSED_VALIDATION`（本组该跑的聚焦校验）、`OUTPUT_PATH`（`review/fix-records/<group-slug>.md`）。遵守 harness 并发上限：超限就排队、有空位再补；harness 不支持并行就串行，协议不变。
4. **回收 + 合并校验**：各 worker 写本组 `fix-records/<group>.md` 并回 receipt。全部返回后，Orchestrator 对合并后的改动**跑一次**仓库全量校验（语法/import/类型/相关测试），抓跨组相互影响。失败且落在改过的文件 → 退回相关组重做或升级；失败只落在没人改的文件 → 记为既有失败。
5. **汇总**：Orchestrator 写 `review/fix-result.md`：按 P0→P1→P2 汇总各组处置（落地/needs-research 退回/needs-human/误报引用）、合并校验结果、残余风险。这份汇总归 Orchestrator，不归任何单个 worker。

worker 之间因占用集不相交而不会撞文件；万一某 worker 的修复外溢出 `OWNED_FILES`，它必须停下来上报而不是越界，由 Orchestrator 重新分组或串行重跑。

## 学习沉淀（Learnings）

流水线在 `deliver` 终止，但教训跨任务存活于 `teamspace/learnings/`——这是 Delivery Orchestrator 的内置能力，不是 phase、不设 gate、不改 Phase Catalog。两个动作：`intake`/`validate-requirements` 开始时按任务关键词**检索**既往教训、把相关条目以路径喂进下游 assignment；deliver 收尾或任务中途出现过门槛的教训（意外根因、反复返工、仓库陷阱）时**沉淀**。门槛、形态、查重与回流规则见 `references/learnings.md`。

## 收尾导航

`deliver` 不是只宣布完成。最终回复和 `delivery/delivery-report.md` 都要让发起人知道任务能否收口、证据在哪里、还有哪些自然后续。默认结构：

1. 状态：delivered / delivered-with-risk / blocked / rejected。
2. 交付内容：代码位置、关键产物路径、关键验证。
3. 偏差与残余风险：没有就写无；有则给 owner 或接受条件。
4. 推荐下一步：一个明确建议。
5. 可选后续：按需列出 2-4 项，例如结束任务、创建 follow-up、运行 `change-detailed-walker`、补一轮验证、沉淀/查看 learnings、回到某个 gate 修订。

如果验收未通过或证据不足，推荐下一步不能是“结束”；必须指向补证、修订、重新 review 或发起人风险接受。
