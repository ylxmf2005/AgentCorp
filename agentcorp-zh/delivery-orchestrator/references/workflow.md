# 本地 AutoDev 工作流

在协调工作时逐步参考本文。它是 Delivery Orchestrator 的本地工作流契约，不依赖任何外部运行时目录。

## 运作理念

路由之前先定义「完成」: 什么必须能跑通、什么绝对不能坏、什么在范围之外。改动之前先理解: 为所选 phase 攒够代码、测试、需求、issue 或设计上下文。开工前先亮出 phase 顺序 —— 这就是 pipeline 的承诺。坚持作者/评审者分离: 一个产物的作者不能审批自己的产物。把每个结果都当证据 —— 命令跑通了只有在它能证明被改动的那部分行为时才有意义。达到成功标准就停，别把周边 scope 吞进本轮。每个 phase 只写其负责人该写的部分，引用上游而不是重复它，只在改变决策或避免实现/验证歧义时才补充细节。所有 assignment、receipt、manifest 和 phase 产物都是带 YAML frontmatter 的 Markdown 文件。

## 工作流模式

每个任务在 phase 执行开始前选定一种模式。三种模式按**委托程度**排序; phase 词汇、产物路径和质量 gate 在所有模式下保持一致 —— 变化的是每个 phase 的执行者和评审的裁决人:

| 模式 | 默认? | 运作方式 | 适用场景 |
| --- | --- | --- | --- |
| `direct` | 否 | 不委托给任何 subagent。Delivery Orchestrator 亲自执行每个 phase; 对于 review 类 phase，它从对应评审视角产出一份**草案**结论，最终审批落在该 phase 的人工 gate 上 —— sponsor 就是评审者。 | 改动小、风险低，sponsor 想走快车道，或 host 环境没有 subagent 能力。 |
| `partial-delegation` | 是 | Delivery Orchestrator 直接执行非 review phase; review、review-research 和 fix 委托给独立角色。 | 日常任务、小到中改动，或单个 agent 能保住足够上下文的工作。 |
| `full-delegation` | 否 | 所有可委托的 phase 都通过 assignment/receipt 文件交给对应阶段负责人，每个返回的产物都要验证。 | Sponsor 明确要求、L/XL 级别工作、并行实现，或 phase 需要评审之外的独立作者身份。 |

默认是 `partial-delegation`。切到 `full-delegation` 需要 sponsor 明确拍板，或有书面的编排理由: 复杂度高、多个相互独立的并行模块、专用执行环境，或对作者分离有强需求。切到 `direct` 必须是 sponsor 明确选择或确认 —— 它用 sponsor 亲自裁决替代独立评审角色，sponsor 必须知情并愿意充当评审者; 绝不要悄悄降级到 `direct`。

### Sponsor 协作路径菜单

模式是内部台账术语; 对 sponsor 先讲协作节奏，再映射到模式:

| Sponsor 看到的路径 | 内部模式 | 推荐时机 |
| --- | --- | --- |
| 快速小改动 | `direct` | 任务极小且风险低，sponsor 明确愿意亲自裁决 review gate; 你必须说明 review 只是草案，审批权在 sponsor。 |
| 标准交付 | `partial-delegation` | 默认推荐。适合大多数后端修复、增强和小到中等需求; 保持 review/research/fix 独立。 |
| 深度编排 | `full-delegation` | 大改动、高风险、需要并行作者身份、跨多个模块，或 sponsor 要求全角色编排。 |

不要在一开始就对所有人机械展示三条路径。如果信号明确，直接说「我推荐标准交付」，再提供 1-2 个备选; 如果任务极小，问一句要不要走快速小改动通道; 如果任务明显复杂，推荐深度编排。当用户已给出明确模式时，直接采纳并重申后果。

启动任务时的对话骨架:

```text
我先按 <paradigm> 处理。成功标准是 <1-3 条>，主要风险是 <1-3 条>。
我推荐走 <path> 路线（内部模式: <mode>），因为 <原因>。
接下来我会执行: <phase 顺序的 plain-language 摘要>。
您可以:
1. 按推荐继续
2. 切换到 <另一条合适路径>
3. 先补充/修改成功标准
```

只在信心 LOW、优先级/scope/风险接受度不明、或路径选择会影响评审者独立性时才停下来等 sponsor 拍板; 否则宣布推荐路线并继续执行。

### Subagent 调用参数

调用 subagent 时，默认继承当前 host/调用方自己的运行时配置。Claude 自己 spawn Claude subagent 时，用 Claude 的当前默认; Codex 自己 spawn Codex subagent/CLI/skill 时，用 Codex 的当前默认。AgentCorp 的角色路由只决定「派给谁、给什么上下文、输出放哪」，不负责硬编码模型、推理强度、权限或其他运行时参数。

只有三种情况允许显式传参: sponsor 明确要求; assignment/manifest 里已有 documented override 值; 目标工具的 schema 要求传。即使需要 override，也只传最小必要参数，并在 assignment 或 manifest 里记录原因。

### 运行时路由

角色拆在两个运行时层，都按上述运行时继承原则调用，不额外指定模型参数:

- **Claude（决策层）**: Delivery Orchestrator、Test Planner、Test Plan Reviewer、Solution Architect、Implementation Planner、Plan Review Lead、Code Review Lead、Test Leader、Review Researcher、Acceptance Review Lead、Adversarial Reviewer、Parallel Researcher、Simplicity Reviewer、Project Steward Reviewer —— 走当前 Claude 环境的原生 subagent/Agent 能力。
- **Codex（执行层）**: Implementation Engineer、Review Fixer、Correctness Reviewer、Security Reviewer、Performance Reviewer、Reliability Reviewer、Standards Reviewer、API Contract Reviewer、API Contract Tester、E2E Tester、Regression Tester —— 走当前 Codex 环境的原生 subagent/CLI/skill 能力; 当 host 里没有 Codex 通道时，降级为本地 subagent 调用同名 skill，协议不变。

三种模式都不能牺牲 review 独立性; 变的只是裁决人: 在 `partial-delegation`/`full-delegation` 下，`test-plan-review`、`plan-review`、`code-review` 和 `acceptance-review` 始终交给各自的 review owner; 在 `direct` 下，这些 phase 由 Delivery Orchestrator 自己产出草案结论，但**草案不是审批** —— 每个 review phase 的人工 gate 必须保持活跃，由 sponsor 裁决，这些 gate 在 `direct` 下也不能跳过。任何模式下，Delivery Orchestrator 都不能审批自己的产物或证据。

处理 code-review findings 的两个 phase，`review-research` 和 `fix`，在 `partial-delegation`/`full-delegation` 下都**委托**出去; Delivery Orchestrator 自己不验证也不写 fix 代码（在 `direct` 下它自己干，但保持同样的顺序和产物: 先 research，产出每 issue 的 verdict，然后 sponsor 的人工 gate，再 landing fix）。分工如下:

- `review-research` 整体委托给 `review-researcher`: 对每个 finding 独立做对抗性复核，干掉 false positive，产出 `review/research/`（verdict + fix 推荐 + 逐 issue 解释）。这是阻断错误传播的 circuit breaker，必须独立且彻底地完成。
- `fix` 由 Delivery Orchestrator**并行编排**: Orchestrator 自己不写 fix 代码，而是**按文件归属把 confirmed/partially-valid 的 fix item 切成互不重叠的组**，每组派一个 `review-fixer` 单 worker 并行 landing（确保两组不碰同一个文件），全部返回后做一次 merge validation，再聚合进 `review/fix-result.md`。一个 `review-fixer` 是单 fix worker，自己不负责切分或派发。详见 Parallel Execution Protocol。

两者有**顺序依赖**: `fix` 必须在 `review-research` 之后; `review-fixer` 只消费已验证的 `review/research/`，找不到就停 —— 它自己不验证原始 finding。这保持了「独立验证」与「忠实 landing」之间的作者分离。

在 `partial-delegation` 下，保持同样的 phase 词汇和产物路径: Delivery Orchestrator 直接写非 review 产物，并在 `manifest.md` 里记录自己为 owner，这些 phase 可以省略 assignment/receipt 文件; 委托的 review phase 仍保留 assignment/receipt。在 `full-delegation` 下，每个委托的 phase 都走完整的 handoff 规范。在 `direct` 下完全没有 assignment/receipt: 所有 phase 产物和 manifest 条目仍要，review 类产物在 manifest 里记录 owner 为 delivery-orchestrator 并标记为 draft，gate 结果记录 sponsor 的裁决。

## 任务分类

| 信号 | Paradigm |
| --- | --- |
| 全新项目/系统、新的重要子系统，或没有现有代码库 | `dev/architecture-first` |
| 缺陷、回归、行为错误、崩溃、数据丢失或安全漏洞 | `bugfix/hypothesis-driven` |
| 单个函数/组件/接口、1-2 个模块，不改现有接口 | `addition/simple` |
| 现有产品的增强、行为扩展，或接口/数据流变更 | `enhancement/delta-design` |

不确定时选 `enhancement/delta-design`。如果某个 phase 的质量 gate 暴露了分类错配，先重新分类再继续。

## Human Gate 策略

Human gate 是 sponsor 的检查点，不是 phase 的质量 gate。跳过 human gate 只是去掉 sponsor 的停顿，不会削弱继续推进所需的证据。

默认 human gate: Requirements、TestPlan、Design 或 diagnosis、Implementation Story Spec、阻塞性或高风险的 review/verification 决策、review-research verdict 与 fix 推荐（在 `fix` landing 之前）、Final delivery。

`review-research` 之后、`fix` 之前是 sponsor 的天然检查点: 这里 sponsor 可以确认哪些 finding 是真问题、哪些是 false positive、拟定的 fix 是否可以接受，然后再放行 `fix`。对于小且低风险的改动，你可以征询 sponsor 是否跳过这个 gate，但跳过不改变「`fix` 必须消费已验证的 `review/research/`」这一依赖。

每个 human gate 允许的结论:

| 结论 | 含义 |
| --- | --- |
| `approved` | Sponsor 批准或表示继续。 |
| `skipped` | Sponsor 明确跳过此 gate。 |
| `revised` | Sponsor 要求修改; 重跑或修改对应 phase 后再继续。 |
| `blocked` | 需要 sponsor 提供输入、凭证、环境或风险接受度。 |

### Gate 导航菜单

进入 human gate 时不要只问「批准吗?」先给 sponsor 足够的摘要供其判断，再给简短选项。默认格式:

```text
当前进度: <phase/gate> 已到达 human gate; 这一步决定 <下游影响>。
证据: <产物路径 + 关键结论/缺口，不超过 4 条>。
我推荐: <approved/skipped/revised/blocked> 之一，因为 <一句话原因>。
选项:
1. 批准，进入 <下一 phase>
2. 按 <具体方向> 修改后我再回来
3. 补充信息 / 风险接受
4. 跳过此 human gate（仅当该 gate 允许跳过; 注意质量 gate 不会放松）
```

根据上下文裁剪选项: 在 `direct` 下，review 类 gate 不提供「跳过」; 当信心 LOW 或缺少凭证时，默认推荐必须是 `blocked`; 当 review owner 返回 `request_changes` 或 `needs_more_evidence` 时，默认推荐必须是 revise/supply-evidence，而不是 approve。当 sponsor 用自然语言回答时，映射为 `approved`、`skipped`、`revised` 或 `blocked` 并记录; 只有映射不清时才追问一次。

对于小且低风险的改动，征询 sponsor 是否可以跳过后续某些 gate —— 点名具体 gate，并保持 review 独立。例如: 「这是个小而孤立的改动; TestPlan 和 Design 的 human gate 要不要跳过，保留 Code Review，到 Final delivery 再汇报?」

绝不要悄悄跳过 human gate。已跳过的 gate 要记录在 `task.md` 的 Gate History 和 `manifest.md` 中。

无人值守时（sponsor 不在场 —— 自动化触发、定时任务、被另一个进程调用），任何 agent 都不能代答 human gate。Sponsor 可以在运行开始前预批准指定 gate（记录在 `task.md` 的 Gate History 中，视为 `approved`）; 当到达未预批准的 gate 时，把待决问题和当前产物路径写入 `task.md`，停在该处并结束本轮，等 sponsor 回来裁决 —— 「sponsor 大概会同意」不是继续的理由。

即使 gate 被跳过或需要全自动，以下情况仍必须暂停: 需求信心 LOW 或成功标准不清; 优先级、scope 或风险接受度不清; review owner 返回 `request_changes` 或 `needs_more_evidence`; verification 失败或缺少必要证据; 凭证、环境或权限缺失; Final delivery 状态需要汇报。

## Paradigms

### `dev/architecture-first`

1. `validate-requirements`
2. `test-plan`
3. `test-plan-review`
4. `architecture`
5. `interface-contract` —— 除非复杂度为 S、单个子模块且无公共/共享接口风险
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `review-research` —— 当 code-review 产生需要处理的 findings 时; 验证真伪，给出 fix 推荐，逐 issue 解释
11. `fix` —— landing `review-research` 判定为 confirmed/partially-valid 的 fix; 必须跟在 `review-research` 之后
12. `verify`
13. `acceptance-review`
14. `deliver`

### `enhancement/delta-design`

1. `validate-requirements`
2. `test-plan`
3. `test-plan-review`
4. `impact-analysis` —— 描述对现有代码的 delta; 当结构决策也需要单独描述时，额外产出 `architecture`。
5. `interface-contract` —— 当需要稳定公共/共享 API、schema、protocol、跨模块边界或并行实现契约时产出; 可与 `architecture` 或 `impact-analysis` 合并。
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `review-research` —— 当 code-review 产生需要处理的 findings 时; 验证真伪，给出 fix 推荐，逐 issue 解释
11. `fix` —— landing `review-research` 判定为 confirmed/partially-valid 的 fix; 必须跟在 `review-research` 之后
12. `verify`
13. `acceptance-review`
14. `deliver`

设计产物由 Solution Architect 持有。

### `bugfix/hypothesis-driven`

1. `validate-requirements` —— 基于 bug report 和 reproduction 信心
2. `diagnose`
   - 当 fix 跨多个模块、改变现有行为或需要显式 landing spot/保留行为时，追加 `impact-analysis`。
   - 当 fix 涉及公共/共享 API、schema、protocol 或跨模块契约时，追加 `interface-contract`。
3. `implementation-plan`
4. `plan-review` —— 除非 fix 被明确限定为极小且低风险
5. `implement`
6. `code-review`
7. `review-research` —— 当 code-review 产生需要处理的 findings 时; 验证真伪，给出 fix 推荐，逐 issue 解释
8. `fix` —— landing `review-research` 判定为 confirmed/partially-valid 的 fix; 必须跟在 `review-research` 之后
9. `verify`
10. `acceptance-review`
11. `deliver`

Diagnosis 定义正确性和回归标准。如果 bug 无法复现或边界无法钉死，阻塞并索要更多信息，而不是瞎猜。

### `addition/simple`

1. `validate-requirements`
2. `test-plan` —— 带功能级验收标准
3. `test-plan-review`
4. `impact-analysis` —— 仅当目标模块、约束或需保留的行为不明显时
5. `interface-contract` —— 仅当需要稳定某些公共/共享 API、schema、protocol 或跨模块边界时
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `review-research` —— 当 code-review 产生需要处理的 findings 时; 验证真伪，给出 fix 推荐，逐 issue 解释
11. `fix` —— landing `review-research` 判定为 confirmed/partially-valid 的 fix; 必须跟在 `review-research` 之后
12. `verify`
13. `acceptance-review`
14. `deliver`

当影响超过 3 个模块，或必须变更现有接口时，升级到 `enhancement/delta-design`。

## Phase 目录

| Phase | Owner | Inputs | Outputs | Quality gate |
| --- | --- | --- | --- | --- |
| `validate-requirements` | Delivery Orchestrator（亲自撰写，见 `references/validate-requirements.md`） | 任务描述、issue 或需求草案 | 经确认的需求（含信心度、用户旅程和约束），以及能澄清意图的流程图 | 信心 MEDIUM/HIGH; 无阻塞问题; inputs/outputs/constraints/success criteria 已理解; 用户旅程可观察; 若曾存在多个合理方案路径，sponsor 已选择路径或授权混合方案; 任何能让旅程、scope、状态或前后行为更易理解的图都要附，数量不限，语法和可读性需验证 |
| `test-plan` | Test Planner | 已确认的需求或诊断标准，项目测试上下文（`teamspace/testing-context.md`，缺失时先补齐） | TestPlan 文件集: 整体策略（按风险排序的检查项、所需层次、环境需求、显式缺口）加 API/E2E/Regression playbook | Must Have 可观察; forbidden zone 具体; 无未解释的覆盖缺口; playbook 照写就能跑（E2E 执行形态明确，用户输入逐字给出） |
| `test-plan-review` | Test Plan Reviewer | 已确认的需求、TestPlan 文件集、项目约束 | `approve`、`request_changes` 或 `needs_more_evidence` | 测试计划可执行，覆盖需求/风险面，没有 test theater |
| `architecture` | Solution Architect | 已确认的需求和已批准的 TestPlan | 面向读者的设计: 上下文、目标、关键决策、模块边界、接口、数据/状态流、兼容性、权衡、风险、验证相关约束 | 所需决策明确; 设计足够详尽清晰，sponsor 和 Implementation Planner 都能据此开工; 任何能让结构、顺序、归属、数据/状态流或前后变更更易检视的图都要附，数量不限，需验证; 每步说明 action/output/boundary，而不只是函数名 |
| `impact-analysis` | Solution Architect | 已确认的需求、已批准的 TestPlan、现有代码上下文 | Delta 记录: 受影响模块、接口/数据变更、需保留的行为、风险、复杂度，加上有用的 delta 图或流程描述 | 受影响模块和接口变更明确; 当前与目标行为可理解; 风险评估到位; 一张图或精确的流程描述让 delta 可检视; 只在直接解释变更时才用 before/after 对比; 复杂度 S/M 或已升级 |
| `diagnose` | Solution Architect | Bug report、复现步骤、观察到的故障 | 诊断结果: 已验证的假设、证据、根因、建议 fix、受影响文件、回归标准，加上有用的故障/fix 图或流程描述 | 根因的因果链有证据; 不瞎猜; 复现状态已记录; 故障路径和修正行为可理解; 图是完整的，不是占位符 |
| `interface-contract` | Solution Architect | Architecture 或 impact 文档，加公共/共享接口需求 | Markdown 格式的接口契约产物: 公共/共享接口、请求/响应 schema、鉴权/错误语义、兼容性行为、验证钩子 | 每个公共/共享/跨模块接口都有契约，含签名、schema、protocol 形态、归属、兼容性和鉴权/错误语义; 共享类型集中; API Contract Reviewer/Tester 不用猜就能验证 |
| `implementation-plan` | Implementation Planner | 已确认的需求、已批准的 TestPlan、设计产物/契约 | Implementation Story Spec: 目标、限定范围的 AC、有序任务、目标模块、约束、通过引用给出的验证预期 | 第一个任务无歧义; 目标路径/模块已命名; 没有改变实现方向的开放问题 |
| `plan-review` | Plan Review Lead | Implementation Story Spec 加需求、TestPlan、设计产物/契约 | `approve`、`request_changes` 或 `needs_more_evidence` | Story Spec 给 Implementation Engineer 的上下文足够，不需要他自己去脑补架构 |
| `implement` | Implementation Engineer | 已批准的 Implementation Story Spec 和 Plan Review Lead 的决策 | 可工作的代码、聚焦的测试、记录变更文件/命令/偏差/阻塞的实现结果 | 与已批准的 Story Spec/契约一致; 聚焦的测试/检查已跑或阻塞已记录 |
| `code-review` | Code Review Lead | Diff、变更文件、Story Spec、需求、TestPlan、设计/诊断、本地标准 | 评审结论加分级 findings | 评审完整; 已考虑正确性、标准、简洁性、change hygiene 和 project stewardship; must-fix 项通过 `review-research`/`fix` 处理，或判定为 request_changes |
| `review-research` | Review Researcher（finding 很多时，Delivery Orchestrator 按代码域并行编排并聚合 index） | Code-review findings（必需）、diff、设计原则/规范 | `review/research/`: **每个 finding 一份 per-issue 文件**（verdict + 根因级 fix 推荐 + 面向不熟悉者的可读解释）+ `00-index.md` | 每个 finding 都有基于证据的 verdict，落在真实代码上，逐 item 撰写（不打包）; false-positive/partially-valid 项解释原因; confirmed/partially-valid 项给出优雅的 fix 推荐; 缺少的 out-of-repo 上下文标记为需人工确认，而非强行下结论 |
| `fix` | Delivery Orchestrator 协调并行的 Review Fixer worker | `review/research/`（必需，含 verdict 和 fix 推荐）+ 人工评论; 变更文件列表 | 每组的 `review/fix-records/<group>.md` + 聚合产物 `review/fix-result.md` + 后端代码变更（留在工作区） | 找到并消费了 `review/research/`（若缺失，停止并要求先执行 `review-research`）; confirmed/partially-valid 项按文件归属切成互不重叠的组，并行 worker 去 landing，同一文件不并发; 每个 worker 忠实 landing，修根因而不是打补丁; 跑一次 merge validation 并通过; 不 commit，不动前端 |
| `verify` | Test Leader 协调 tester | 实现产物、TestPlan 或诊断标准、环境规格 | 按 capability/integration/E2E/regression 给出的验证结果 | 所需检查通过; 需要时跑 E2E; 缺口显式; 不编造或假设成功 |
| `acceptance-review` | Acceptance Review Lead | 需求、TestPlan、Story Spec、实现备注、code review 决策、验证证据、残余风险 | `accept`、`reject` 或 `needs_more_evidence` | 证据支持每个 Must Have 和限定范围内的风险; 残余风险可接受 |
| `deliver` | Delivery Orchestrator | 已接受的实现和证据 | 交付报告 | 报告包含文件/产物、测试、偏差、跟进项和残余风险 |

### Phase 完成提示

每个 phase 通过其 quality gate 后，只向 sponsor 汇报有助于其判断下一步的信息:

- `做了什么`: phase 名称 + 通俗解释。
- `证据在哪`: 产物路径、关键测试/检查、receipt 或评审决策。
- `下一步`: 下一 phase 及 owner; 如果有活跃的 human gate，切换到 Gate Navigation Menu。
- `可选重定向`: 只有在新证据暴露出 scope、风险或分类变化时才提供; 否则不要重列完整菜单。

打回 phase 时也要给导航: 说明打回原因、重派前会改什么、是否需要 sponsor 输入。同一 phase 连续被打回两次后，默认停下来重新评估切分或计划，并向 sponsor 提供可选路线。

## 阶段负责人

- Delivery Orchestrator 在所有三种模式下持有分类、模式选择、gatekeeping 和最终交付。
- Delivery Orchestrator 直接持有 `validate-requirements` 并亲自撰写产物 —— 进入该 phase 时加载 `references/validate-requirements.md`（信心度、何时阻塞、sponsor 裁决的 gate; 形态参照 demo，门槛参照 Phase 目录）。
- 在 `partial-delegation` 下，Delivery Orchestrator 还亲自撰写 `test-plan`、需要时的设计/诊断/契约、`implementation-plan`、`implement` 和 `verify` 产物。
- 在 `direct` 下，Delivery Orchestrator 亲自执行每个 phase; 对于 review 类 phase，它从对应评审视角产出草案，审批权落在 sponsor 的 human gate。
- 在 `full-delegation` 下，Test Planner 持有 `test-plan`; Solution Architect 持有设计/分析产物; Implementation Planner 持有 Implementation Story Spec; Implementation Engineer 持有 `implement`; Test Leader 持有验证协调; API Contract Tester、E2E Tester 和 Regression Tester 执行各自分配的验证。
- `test-plan-review` 归 Test Plan Reviewer，`plan-review` 归 Plan Review Lead，`code-review` 归 Code Review Lead，`acceptance-review` 归 Acceptance Review Lead —— 这在 `partial-delegation` 和 `full-delegation` 下都成立; 在 `direct` 下，这些 review 的审批权归 sponsor 的 human gate。
- `review-research` 委托给 Review Researcher。Finding 很多时，Delivery Orchestrator 按代码域去重聚类，并行派发多个 Review Researcher，每个为其 cluster 写**逐 issue** 文件，然后 Orchestrator 聚合 `00-index.md`; worker 不写打包文件，也不自己 fan out。`fix` 同样由 Delivery Orchestrator 并行编排: 把文件切成组，并行派发多个 Review Fixer 单 worker，跑 merge validation，聚合 `fix-result.md`; 一个 Review Fixer 只 landing 被分配的组，不自己切分或派发。这在 `partial-delegation` 和 `full-delegation` 下都成立，以保持「独立验证」与「忠实 landing」之间的作者分离; 在 `direct` 下，Orchestrator 自己按顺序做 research 和 fix，作者分离通过让 research verdict 先过 sponsor 的 human gate 来实现。`fix` 永远在 `review-research` 之后，且只消费已验证的 `review/research/`。

## 产物组织

没有现有任务时，将 `task_id` 设为 `<YYYYMMDD-HHMMSS>-<desc-slug>`（时间戳在前，按目录名列名可浏览时间顺序），将 `task_root` 设为 `workdir` 相对的 `teamspace/tasks/<task_id>/`，然后按 demo 创建 `task.md` 和 `manifest.md`。

任务产出持久化笔记、设计、prompt、截图、日志、review、验证证据或 handoff 时，先确定产物的位置再写。所有持久化协作文物放在 `<workdir>/teamspace/` 下; 当存在独立的 `code_worktree`/`code_location` 时，必须同步到 `<code_worktree>/teamspace/` 下的相同相对路径 —— 创建或更新产物时先写当前侧，报告完成前把相同相对路径拷到另一侧。产物路径记为相对于 `workdir`; 不要把 `<workdir>` 写成机器相关的 Location 路径。默认的任务运行时布局:

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
    test-plan.md                    # 整体策略; 执行 playbook 按需放在旁边
    api-test-plan.md
    e2e-test-plan.md
    regression-test-plan.md
    test-plan-review.md
  design/                         # 按需合并; 多个产物可以共存
    architecture.md
    impact-analysis.md
    diagnosis.md
    interface-contract.md
  implementation/
    implementation-story.md
    implementation-result.md
  review/
    plan-review.md
    code-review.md
    specialist-findings/
    research/
      00-index.md
      <number>-<slug>.md
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

只用任务需要的文件/子目录。保持产物和 handoff 内部的路径为相对路径。在任务目录外，`teamspace/testing-context.md` 是项目级测试上下文（test-plan phase 的基础，跨任务复用并增量维护），`teamspace/learnings/` 是经验沉淀层。`teamspace/` 是本地协调状态: 如果它出现在 git status 中，给该本地 repo 或 worktree 的 `.git/info/exclude` 加上 `teamspace/`; 绝不要 stage 或 commit 它。

## Orchestrator 产物模板

用本地 demo 而不是重复形态:

- `references/templates/task-record.demo.md` 对应 `task.md`
- `references/templates/task-manifest.demo.md` 对应 `manifest.md`
- `references/templates/phase-assignment.demo.md` 对应委托 phase 的 assignment
- `references/templates/phase-receipt.demo.md` 对应委托 phase 的 receipt
- `references/templates/acceptance-package.demo.md` 对应 `acceptance/acceptance-package.md`

复制形态，然后把示例值替换为当前任务的 phase、owner、status 和路径。

`artifact_type` 值: Orchestrator 产出的是 `TaskRecord`、`TaskManifest`、`PhaseAssignment` 或 `AcceptancePackage`，`author_agent: delivery-orchestrator`; 委托 phase 的 receipt 由其 owner 写回，`from_agent` 为该 owner，`phase` 为 assignment 的 phase。最终交付时写 `delivery/delivery-report.md`，涵盖 Status、Code/Artifact Location、交付了什么、验证结果、缺口、跟进项和关键产物路径。

## Phase Handoff 规范

对于委托 phase，Delivery Orchestrator 在 phase 开始前写 assignment 文件。每个委托 assignment 携带一个 `task_root`（相对于 `workdir` 的 `teamspace/tasks/<task_id>/`）和一个相对于该 task root 的 `output_path`; 当 Location 和 Workspace 不同时，同一 task root 也必须存在于 `<code_worktree>/teamspace/tasks/<task_id>/`。委托 owner 在 assignment 的 `output_path` 写 phase 产物，并写回一份 Markdown receipt，指明产物路径和 status。

收到每份 receipt 后，Delivery Orchestrator 先做机械验证，再做质量判断 —— 两者分离:

- **机械验证（信封一致性）**: 运行 `scripts/validate-handoff.py --pair <assignment> <receipt> --task-root <task_root>`（或批处理后运行 `--sweep --task-root <task_root>`）。检查 receipt 的 `artifact_path` 是否真实存在、是否匹配 assignment 的 `output_path`、`from_agent`/`phase`/`task_id` 是否与 assignment 对齐、产物的 `author_agent` 是否匹配 owner、status 是否非空。这一步堵住自由文本契约最容易漏的问题 —— 「receipt 上说做完了但产物不在 / 产物不对 / 字段缺失」（receipt 措辞 ≠ 实际产物）。**非零验证退出码视为 handoff 未完成**: 打回给 owner 作为 `needs_more_evidence`，不进入下一步，也不算 gate 通过。
- **质量判断（phase gate）**: 机械验证通过后才由 Orchestrator 判断 status 是否满足该 phase 的 quality gate、证据是否足够。机械验证通过不代表 gate 通过。当 receipt 附带偏差、顾虑或阻塞的备注时，做 gate 判断前先读备注; 不要只看 status 字段。

打回不是原样重试。Phase 被打回后（机械验证失败、`request_changes`、`needs_more_evidence` 或 owner 报告 blocked），重派前必须改点什么: 补上它指名的缺失上下文、缩窄或拆分任务、切换执行通道、或升级到 sponsor —— 什么都不改就重派只会再拿同样的失败。同一 phase 连续被打回两次后，停下来重新评估是切分错了还是计划本身错了，而不是第三次重试。

验证通过后，把 assignment、产物、receipt、human gate 结果和 phase 质量结果记入 `manifest.md`，然后在 Workspace 和 Location 之间同步更新后的产物集。Delivery Orchestrator 在活跃的 human gate 处停下来，直到 sponsor 明确批准、跳过或重定向。

在 `partial-delegation` 下，Delivery Orchestrator 亲自写的 phase 可以省略 assignment/receipt 文件，但 phase 产物和 manifest 条目仍要; review phase 仍用 assignment/receipt，因为它们仍是委托的。在 `full-delegation` 下，委托的 phase 必须有 assignment/receipt。在 `direct` 下完全没有 assignment/receipt，所有 phase 产物和 manifest 条目仍要。任何模式下，已确认的需求产物都由 Delivery Orchestrator 亲自撰写（见 `references/validate-requirements.md`）。委托验证期间，Test Leader 可以在 `verification/assignments/` 下写 tester assignment，tester 在 `verification/test-results/` 下写结果文件，Test Leader 写最终的 `verification/verification-report.md`。

### Handoff 中的两种上下文保真（耦合 vs 独立）

「上游产物的名称和路径就够了，引用而非重述」这条默认原则只适用于某一种 handoff，而非全部。写 assignment 决定给多少上下文时，先识别是哪一种:

- **independent（独立/review 型）**: `test-plan-review`、`plan-review`、`code-review`、专项 review、`review-research`、`acceptance-review`、各类验证。下游需要的是**独立判断**，看到太多上游结论反而会带偏（从众）。这里坚持默认原则: 传**指针/路径**，让下游自己读自己判; 下游返回的是**提炼后的结论**（findings/决策），而不是把原始上下文重新注入。这保持独立性并节省上下文。

- **coupled（耦合/延续型）**: `implement`、`fix`、`code-review → review-research → fix` 这条修复脊柱，以及任何「下游基于上游决策继续推进，一旦搞错就级联」的 handoff。这里**反过来**: assignment 必须携带**完整的上游产物和先前决策**（不是摘要，不是指针），因为行动携带隐式决策，隐式决策没传下去就会产生冲突和返工。典型必带项: `fix` 必须带 `review-research` 对该 issue 的**完整 verdict + 根因 + fix 推荐**（不能是一句「见 review/research/」）; `implement` 必须带已批准 Story Spec 和相关契约的全文，不能只是一个路径。

一句话准则: **下游是「独立再判一遍」还是「基于上游结论继续推进」** —— 前者传指针保独立，后者喂全文保连贯。不确定时按耦合处理（多喂比漏掉决策强）。

## 验证层级

1. Capability: 每个模块的 Must Have 和故障/边界情况都直接检查。
2. Integration/API: 每个跨模块或公共契约流都有成功和错误传播检查。
3. E2E: 每个面向用户的功能至少出现在一个完整用户目标中，包含 happy path 和 error path。
4. 当变更涉及 UI 时，做前端视觉/交互检查。

下层必需检查还没通过时，不要推进到更高层。某个场景跑不起来时，记录原因并视为缺口，除非已被显式接受。

## 并行执行协议

并行实现是 `implement` phase 内部的一种协议，不是独立 phase。只有在以下全部满足时才并行化: 复杂度为 M/L/XL; 至少两个子模块可以独立构建; 子模块共享接口但不共享实现; architecture 或 impact 文档已存在; 涉及公共/共享 API、schema、protocol 或跨模块契约时 `interface-contract` 已完成; Implementation Story Spec 按契约切分任务，每个子模块只保留它所需的集成上下文; TestPlan 按子模块限定 Must Have、Need Have、Failure/Edge Cases 和 Forbidden Zone。

每个并行实现会话精确接收以下输入:

1. `STORY_SPEC_PATH`: 已批准的 Implementation Story Spec 的相对路径。
2. `DESIGN_DOC_PATH`: Architecture、impact、diagnosis 或接口契约的相对路径。
3. `OWN_CONTRACT`: 本会话实现的契约 stub。
4. `DEP_CONTRACTS`: 本会话调用但不修改的只读契约。
5. `TESTPLAN_SCOPE`: 该子模块的 capability、边界、Must Have、Need Have、Failure/Edge Cases。
6. `FORBIDDEN_ZONE`: 该子模块的显式红线。
7. `COMPLETION_SIGNAL`: 协调器期望的精确完成信号。
8. `INTEGRATION_CONTEXT`: 涉及该子模块的集成测试和跨边界预期。

### 并行化 `review-research`（按代码域去重切分，输出仍逐 item 写）

Finding 很多时，`review-research` 也由 Delivery Orchestrator 并行编排。这里必须守住一个区分: **调查单元可以聚类，但输出单元永远是逐 item。** 聚类只为了让「同一批代码不被反复读」，绝不能把输出粒度塌成 cluster 文件。

1. **拿 findings**: 从 code-review findings 中拿所有待验证的 finding。
2. **按代码域去重合并成 cluster**: 当多个 reviewer 的 finding 指向同一文件 / 同一调用链时，归为一个 cluster（例如「convert polling」、「asset clone lock」、「batch status contract」）。Cluster 的存在是为了让一个 worker 只读一次该共享代码批就能覆盖多个 finding，而不是 33 个 finding 各 spawn 一个 agent 重复读同一批文件。
3. **并行派发 `review-researcher`**: 每个 cluster 一个 assignment，给 `FINDINGS`（该 cluster 中每个 finding 的全文 + reviewer 证据，仅作线索）、`CODE_SCOPE`（该 cluster 的相关代码范围）、`DESIGN_PRINCIPLES`（文档化的设计原则）、独立对抗性复核的纪律，以及 `OUTPUT_DIR=review/research/`。**在 assignment 里写死约束: worker 为 cluster 中每个 finding 写一份 per-issue 文件 `review/research/<number>-<slug>.md`，不允许写 bundle/cluster 文件。** 尊重 harness 并发限制; 不支持并行时走串行，协议不变。
4. **聚合 index**: 每个 worker 为其少量 findings 写好 per-issue 文件并返回 receipt。全部返回后，**Orchestrator 从所有 per-issue 文件聚合 `review/research/00-index.md`**（按 `templates`/research-skeleton 的 index 形态: 按 P0→P1→P2 列出每项 + verdict + 链接）。Orchestrator 不造合并的 `SUMMARY.md`，也不给 index 指派自定义 `artifact_type` —— index 就是 `00-index.md`。
5. **只在 human-review gate 后再进 fix**: 默认在 review-research human gate 停下来，让 sponsor 确认 verdict 和 fix，然后再进 `fix`; 不要从 research 直接链到 fix。

收 receipt 时照例用 `scripts/validate-handoff.py` 验证（worker receipt 的 `artifact_path` 指向它产出的某份 per-issue 文件或 `review/research/`），index 聚合后再跑一遍完整的 `--sweep`。

### 并行化 `fix`（同一协议，按文件归属切分）

`fix` 也是由 Delivery Orchestrator 并行编排的协议，不是单独 phase 之外的特例。前置条件: `review-research` 已产出 `review/research/`，其中存在被判定为 **confirmed/partially-valid** 的 fix item。Orchestrator 执行以下步骤:

1. **拿待 fix 的 items**: 从 `review/research/` 中拿所有 confirmed/partially-valid 的 items 及其 fix 推荐（叠加上人工评论; false positive 和「需人工确认」的不 fix）。如果找不到 `review/research/`，停下来先跑 `review-research`。
2. **按文件归属切成互不重叠的组**: 列出每项要改的主文件（及可预见的溢出文件）; **碰同一文件的 items 进同一组**，由同一个 worker 串行处理。两组之间的文件占用集必须不相交。
3. **并行派发 `review-fixer` 单 worker**: 每组一个 assignment，精确给以下输入 —— `GROUP_SLUG`、`FIX_ITEMS`（该组的 confirmed/partially-valid items 及 research 的 fix 推荐）、`OWNED_FILES`（该组被授权编辑且其他组不会碰的文件集）、`REPO_CONVENTIONS`、`FOCUSED_VALIDATION`（该组应跑的聚焦检查）、`OUTPUT_PATH`（`review/fix-records/<group-slug>.md`）。尊重 harness 并发限制: 超限时排队，有空位就填; harness 不支持并行时走串行，协议不变。
4. **收集 + merge validation**: 每个 worker 写好自己的 `fix-records/<group>.md` 并返回 receipt。全部返回后，Orchestrator **跑一次**全仓库验证（语法/导入/类型/相关测试）以捕捉跨组交互。落在变更文件上的失败 → 把相关组打回重做，或升级处理; 只落在未变更文件上的失败 → 记为 pre-existing failure。
5. **聚合**: Orchestrator 写 `review/fix-result.md`: 按 P0→P1→P2 聚合每组的处置（landed/打回为 needs-research/needs-human/false-positive reference）、merge validation 结果和残余风险。这份聚合属于 Orchestrator，不属于任何单个 worker。

Worker 不会撞文件，因为它们的占用集不相交; 如果某个 worker 的 fix 溢出到 `OWNED_FILES` 之外，必须停下来报告，而不是越界，Orchestrator 重新切分或串行重跑。

## 经验沉淀

Pipeline 在 `deliver` 终止，但教训跨任务存活于 `teamspace/learnings/` —— 这是 Delivery Orchestrator 的内置能力，不是 phase，没有 gate，也不改变 Phase 目录。两个动作: 在 `intake`/`validate-requirements` 开始时，**按任务关键词搜索**过往教训，把相关条目按路径喂进下游 assignment; 在交付收尾或任务中途出现值得记下的教训时（意外根因、反复返工、仓库陷阱），**捕获**它。门槛、形态、去重和回流规则见 `references/learnings.md`。

## 收尾导航

`deliver` 不只是宣布完成。最终回复和 `delivery/delivery-report.md` 都必须让 sponsor 知道任务能不能结、证据在哪、有哪些自然跟进项。默认结构:

1. Status: delivered / delivered-with-risk / blocked / rejected。
2. 交付了什么: 代码位置、关键产物路径、关键验证。
3. 偏差和残余风险: 没有就写无; 有的话给 owner 或接受条件。
4. 推荐的下一步: 一条清晰建议。
5. 可选跟进项: 按需列 2-4 条，例如关闭任务、创建跟进项、跑 `change-detailed-walker`、再做一轮验证、捕获/审阅经验、回 gate 修改。

如果 acceptance 没通过或证据不足，推荐的下一步不能是「结掉」; 必须指向补充证据、修改、重审或 sponsor 风险接受。
