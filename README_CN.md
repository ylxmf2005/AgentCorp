# AgentCorp

**面向软件交付的 Loop Engineering：可控、可理解、可验证。**

[English](README.md) · 简体中文

[快速上手](#快速上手) · [技能一览](#技能一览) · [产物一览](#产物一览)

---

AI 生成代码的速度越来越快，但验证代码是否正确的成本，始终在你身上。当你拿到一堆「看起来没问题」的代码，判断其对错的责任全落在你肩上——而你对 AI 的依赖越深，这种判断能力反而越迟钝。

更棘手的是恶性循环：Agent 的工作过程如同黑箱，你无法理解它的推理逻辑；看不懂，就只能跳过 Review；跳过 Review，认知债务便会累积；债务越深，你越离不开它，也越难在它出错时及时纠正。最终，重要的任务你不敢完全交给它。

AgentCorp 要解决的正是这个问题。用最近流行的
[Loop Engineering](https://addyosmani.com/blog/loop-engineering/) 说法，它将
Agent 的工作流程从一条不可控、不可读、无法回溯的黑箱链条，转变为一条**可控、可理解、可验证**的交付循环。它由 **31 项技能**组成，全部来自企业级软件交付实践，覆盖编排、规划、实现、评审、验证、验收、浏览器工作流、白话解释和代码注释治理。全面适配 **Claude Code** 与 **Codex**。

- **可控**——流程按任务规模自动裁剪，改一行代码不必承担架构评审的负担，从零搭建新系统则一个环节都不会少；关卡真正具备拦截能力，验证不通过就停止，两次失败就重新规划；你可以随时介入，也可以完全放手。
- **可理解**——每个阶段都留下结构清晰的产物，并记录「谁在什么证据下做出了什么决策」；评审提出的每个问题都解释到「即使你没读过这段代码，也能判断该不该改」；交付时自动把最终 diff 转化为函数级别的「为什么这么改」注释。
- **可验证**——没有任何角色能为自己的产出放行；测试在写代码之前就已经确定，并经过独立审查；评审发现由另一个角色当作误报去证伪，只有被证实的结论才会进入修复环节。

## 为什么这是 Loop Engineering

Loop Engineering 的核心不是一轮轮手写 prompt，而是设计一套能替你提示、检查、记录并推进 Agent 工作的系统。AgentCorp 把这套循环落在软件交付上：

- **目标与状态**放在 `task.md`、`manifest.md` 和 `teamspace/` 中，循环可以跨上下文恢复，而不是依赖单次对话记忆。
- **可复用技能**沉淀交付实践、门禁和项目习惯，避免 Agent 每一轮都从零猜测。
- **作者/检查者分离**让实现、评审、复核、修复、验证、验收分别由不同责任边界承担。
- **产物与门禁**让「完成」变成可审计的主张：每个阶段留下证据，门禁通过后才进入下一步。
- **并行工作与交接**让大任务可以拆给多个 Agent，同时保留 owner、回执和追踪链。

## 快速上手

### 安装

**Claude Code：**

```
/plugin marketplace add ylxmf2005/AgentCorp
/plugin install agentcorp@agentcorp
```

随后 `/reload-plugins`（或重启）。技能带命名空间，例如 `/agentcorp:delivery-orchestrator`。

**Codex：**

```
codex plugin marketplace add ylxmf2005/AgentCorp
```

启动 Codex，在 `/plugins` 菜单启用 **AgentCorp** 并重启。单独安装某个技能：`use skill-installer to install the skill at repo ylxmf2005/AgentCorp path agentcorp/delivery-orchestrator`。

### 第一次使用

安装完成后，直接描述你的需求，或调用 `/agentcorp:delivery-orchestrator`。它会先与你确认成功标准、推荐执行路线，然后按阶段推进，在每个关卡停下汇报。

需要真实浏览器或登录态验证时，它会使用独立的浏览器配置打开页面，请你手动登录一次，之后在页面内自动执行检查——不会触碰你的本地 Cookie。任务结束后，你将获得一份交付报告，以及一份可回溯每个决策的审计记录。

## 技能一览

31 项技能按职能分组如下。每个技能的具体行为定义在 `agentcorp/<skill>/SKILL.md` 中，也会出现在 Claude Code 和 Codex 的技能选择器里。它们共同覆盖交付循环，以及真实项目里运行这套循环所需的支撑行为。

- **编排** — `delivery-orchestrator`
- **规划与设计** — `solution-architect`、`implementation-planner`、`test-planner`、`parallel-researcher`
- **实现** — `implementation-engineer`、`review-fixer`
- **计划与测试计划评审** — `plan-review-lead`、`test-plan-reviewer`、`adversarial-reviewer`
- **代码评审** — `code-review-lead` + `correctness-reviewer`、`security-reviewer`、`performance-reviewer`、`reliability-reviewer`、`simplicity-reviewer`、`change-hygiene-reviewer`、`standards-reviewer`、`project-steward-reviewer`、`api-contract-reviewer`
- **验证** — `test-leader`、`e2e-tester`、`api-contract-tester`、`regression-tester`
- **复核与验收** — `review-researcher`、`acceptance-review-lead`
- **支撑** — `change-detailed-walker`、`brainstorm`、`authenticated-browser-session`、`plain-explain`、`concise-code-comments`

## 产物一览

每个阶段都会留下结构清晰的产物，全部带 frontmatter（`artifact_type` / `author_agent` / `phase` / `status` / `source_artifacts`），可审计、可回溯。不是每个任务都会生成下面每一个文件；这里展示的是完整运行时布局，AgentCorp 会按任务实际需要创建对应阶段、评审、测试、研究包和交接记录。

```
teamspace/
├── testing-context.md                    # 跨任务运行时事实：入口、登录、页面、可观测面、测试数据约定
├── learnings/                            # 跨任务经验沉淀：每条一文件，写前先去重
│   └── invite-token-reuse-trap.md        #   触发情境 -> 根因 -> 怎么做 -> 下次如何更快
├── knowledge/                            # 可复用研究快照：从任务研究中筛选出值得跨任务保留的材料
│   └── <technology>/INDEX.md
└── tasks/20260622-invite-members/        # 本次任务根目录
    ├── task.md                           # 任务记录：请求、成功标准、阶段序列、门禁历史、决策日志
    ├── manifest.md                       # 审计台账：阶段、Owner、状态、人工门、质量门、分派单、产物、回执
    │
    ├── handoffs/                         # 委派阶段的分派单/回执闭环
    │   ├── 001-validate-requirements.md
    │   ├── 001-validate-requirements-receipt.md
    │   ├── 002-test-plan.md
    │   ├── 002-test-plan-receipt.md
    │   └── ...
    │
    ├── requirements/
    │   └── validated-requirements.md     # 意图、用户、旅程、FR/AC、非目标、约束、假设、开放问题
    │
    ├── design/                           # 按需生成；多个设计产物可以并存
    │   ├── architecture.md               # 新系统/子系统架构：组件、数据/状态流、接口、取舍
    │   ├── impact-analysis.md            # 增量设计：受影响模块、当前/目标行为、风险、需保留行为
    │   ├── diagnosis.md                  # Bug 诊断：复现、假设、根因、建议修复、回归标准
    │   └── api-contract.md               # 公共/共享契约：schema、认证、错误、兼容性、验证钩子
    │
    ├── test/
    │   ├── test-plan.md                  # 风险排序的总策略、必测层级、显式缺口、禁区
    │   ├── api-test-plan.md              # API/集成手册：字面请求、预期响应、证据处理
    │   ├── e2e-test-plan.md              # E2E 手册：浏览器步骤、字面输入、截图/URL 证据
    │   ├── regression-test-plan.md       # 回归手册：爆炸半径、既有套件、修前失败/修后通过检查
    │   ├── test-plan-review.md           # 测试计划独立评审：approve / request_changes / needs_more_evidence
    │   └── exploration/                  # 补全 testing-context.md 的工作文件；确认事实回写上下文
    │       ├── charters.md               # 探索章程与状态
    │       ├── frontier.md               # 待探索入口点及来源
    │       └── journal.md                # 逐步操作、观察、截图、阻塞
    │
    ├── implementation/
    │   ├── implementation-story.md       # 实现故事：范围 AC、任务顺序、目标模块、约束、验证期望
    │   └── implementation-result.md      # 实际实现结果：改动文件、命令、偏差、阻塞、移交评审
    │
    ├── review/
    │   ├── plan-review.md                # Plan Review Lead 对 Story Spec 的决策
    │   ├── code-review.md                # Code Review Lead 汇总决策
    │   ├── specialist-findings/          # 专项评审发现；只有被调用的 reviewer 会写文件
    │   │   ├── correctness-reviewer.md
    │   │   ├── security-reviewer.md
    │   │   ├── performance-reviewer.md
    │   │   ├── reliability-reviewer.md
    │   │   ├── simplicity-reviewer.md
    │   │   ├── change-hygiene-reviewer.md
    │   │   ├── standards-reviewer.md
    │   │   ├── project-steward-reviewer.md
    │   │   ├── api-contract-reviewer.md
    │   │   ├── adversarial-reviewer.md
    │   │   └── parallel-researcher.md    # desk/source-verified 研究作为专项证据时使用
    │   ├── research/                     # 评审复核：每个 finding 都当作可能误报重新验证
    │   │   ├── 00-index.md               # 汇总所有 per-issue research 文件的索引
    │   │   ├── 001-confirmed-...md       # 每问题一文件：verdict、证据、根因、修复建议
    │   │   └── 002-false-positive-...md  # 误报或需要人工确认的记录
    │   ├── fix-records/                  # 每个互不重叠文件组一份 Review Fixer 记录
    │   │   └── invite-service.md         # item 处置、改动文件、验证、漂移检查
    │   └── fix-result.md                 # Orchestrator 汇总所有修复组和合并验证
    │
    ├── research/                         # 动手研究包：需要实验或资料快照时生成
    │   └── invite-email-provider/
    │       ├── 00-report.md
    │       ├── env/
    │       ├── sources/
    │       └── experiments/
    │
    ├── verification/
    │   ├── assignments/                  # Test Leader 在委派验证时写给各 tester 的分派单
    │   │   ├── e2e-tester.md
    │   │   ├── api-contract-tester.md
    │   │   └── regression-tester.md
    │   ├── test-results/                 # 真实执行证据，不臆造成功
    │   │   ├── e2e-tester.md             # 状态、已检查流程、命令、截图/URL 证据
    │   │   ├── api-contract-tester.md    # 请求/响应、通过/失败、schema/contract 证据
    │   │   └── regression-tester.md      # 前后对比、命令、退出码
    │   └── verification-report.md        # Test Leader 总裁决，引用 result 文件和剩余缺口
    │
    ├── acceptance/
    │   ├── acceptance-package.md         # Orchestrator 验收包：成功标准、产物索引、直接证据、缺口
    │   └── acceptance-decision.md        # Acceptance Review Lead 裁决：accept / reject / needs_more_evidence
    │
    └── delivery/
        └── delivery-report.md            # 最终交付报告：状态、代码/产物位置、测试、风险、后续项
```

---

AgentCorp 让工作能够复利增长——同时将可控、可理解、可验证焊入结构本身，而非留给操作者自行保证。
