# AgentCorp

**面向软件交付的 Loop Engineering：可控、可理解、可验证。**

[English](README.md) · 简体中文

[快速上手](#快速上手) · [技能一览](#技能一览) · [产物一览](#产物一览)

---

AI 生成代码的速度越来越快，但验证代码是否正确的成本，始终在你身上。当你拿到一堆「看起来没问题」的代码，判断其对错的责任全落在你肩上——而你对 AI 的依赖越深，这种判断能力反而越迟钝。

更棘手的是恶性循环：Agent 的工作过程如同黑箱，你无法理解它的推理逻辑；看不懂，就只能跳过 Review；跳过 Review，认知债务便会累积；债务越深，你越离不开它，也越难在它出错时及时纠正。最终，重要的任务你不敢完全交给它。

AgentCorp 要解决的正是这个问题。它是一套面向软件交付的
[Loop Engineering](https://addyosmani.com/blog/loop-engineering/) 系统，将
Agent 的工作流程从一条不可控、不可读、无法回溯的黑箱链条，转变为一条**可控、可理解、可验证**的交付循环。它由 **33 项技能**组成，全部来自企业级软件交付实践，覆盖完整交付循环及其支撑实践。全面适配 **Claude Code** 与 **Codex**。

- **可控**——流程按任务规模自动裁剪，改一行代码不必承担架构评审的负担，从零搭建新系统则一个环节都不会少；关卡真正具备拦截能力，验证不通过就停止，两次失败就重新规划；你可以随时介入，也可以完全放手。
- **可理解**——每个阶段都留下结构清晰的产物，并记录「谁在什么证据下做出了什么决策」；评审提出的每个问题都解释到「即使你没读过这段代码，也能判断该不该改」；交付时自动把最终 diff 转化为函数级别的「为什么这么改」注释。
- **可验证**——没有任何角色能为自己的产出放行；测试在写代码之前就已经确定，并经过独立审查；评审发现由另一个角色当作误报去证伪，只有被证实的结论才会进入修复环节。

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

### 调用技能

主入口是交付编排器（Delivery Orchestrator）。把任务交给它，它会带着任务走完整条流水线——
分类、把每个阶段路由给对应角色、按证据卡关：

```
/agentcorp:delivery-orchestrator 给公开 API 加限流，并在压测下验证
```

只需要其中某一步时，也可以直接调用单个技能：

```
/agentcorp:code-review-lead 合并前对当前 diff 做一次代码评审
```

### 第一次使用

安装完成后，直接描述你的需求，或调用 `/agentcorp:delivery-orchestrator`。它会先与你确认成功标准、推荐执行路线，然后按阶段推进，在每个关卡停下汇报。

需要真实浏览器或登录态验证时，它会使用独立的浏览器配置打开页面，请你手动登录一次，之后在页面内自动执行检查——不会触碰你的本地 Cookie。任务结束后，你将获得一份交付报告，以及一份可回溯每个决策的审计记录。

## 技能一览

33 项技能按交付阶段分组如下（同一阶段里，规划者、评审者、实现者放在一起）。每个技能的具体行为定义在 `agentcorp/<skill>/SKILL.md` 中，也会出现在 Claude Code 和 Codex 的技能选择器里。它们共同覆盖交付循环，以及真实项目里运行这套循环所需的配套行为。

- **编排**
  - `delivery-orchestrator` — 掌控整条交付流水线：给任务分级、把每个阶段派给对应角色、判断证据是否足以推进到下一关
- **规划与设计**
  - `solution-architect` — 动手写代码前敲定结构性决策，按住变更放大、认知负担和未知的未知带来的复杂度
  - `implementation-planner` — 把定稿的设计切成有序、环环相扣、可独立验证的实现故事，工程师拿到即可开工
  - `plan-review-lead` — 判断实现故事规范是否成熟到工程师能直接开工，不必自己补缺失的架构、范围或未批准的依赖
  - `test-planner` — 在实现之前就定好验证策略：测什么、为什么测，覆盖面跟着风险走而非平均铺开
  - `test-plan-reviewer` — 在实现启动前，判断测试计划的覆盖面是否对得上需求与风险
  - `parallel-researcher` — 把问题拆成多条独立调研线并行求证，确认外部、内部和本地代码里到底有哪些证据，对抗锚定与确认偏误
- **实现**
  - `implementation-engineer` — 把批准的故事规范实现成干净、能跑的代码，贴合项目现有的架构、模式与约定
- **代码评审**
  - `code-review-lead` — 协调各专项评审、汇总他们的发现，按证据而非人数把「过不过」一锤定音
  - `correctness-reviewer` — 专盯功能性缺陷：边界错误、状态写坏、空值蔓延、竞态，这些会让代码在真实输入下给出错误结果
  - `security-reviewer` — 从攻击者视角排查能击穿信任边界的漏洞：注入、越权、硬编码密钥、SSRF
  - `performance-reviewer` — 抓会在规模上拖慢系统或耗尽资源的性能退化：N+1 查询、无界增长、缺分页、阻塞 I/O
  - `reliability-reviewer` — 找依赖出故障时让系统崩溃或卡死的隐患：缺超时、吞错误、重试风暴、资源泄漏、级联故障
  - `adversarial-reviewer` — 先假设它已经坏了再去证明，专攻组合、时序、滥用引发的、单轴评审各自都看不到的涌现型故障
  - `simplicity-reviewer` — 挖出不值当的复杂度：多余的抽象、过早泛化、死代码，以及配不上其成本的结构选择
  - `taste-reviewer` — 先把 hack 当缺陷，哪怕它能跑；顶着管线偏向最小 diff 的惯性，坚持治本的形态（改 schema、重构、打破逼出丑陋的惯例）
  - `change-hygiene-reviewer` — 核查 diff 里每处改动是否都能追溯到批准的需求，挡掉越界改动、历史残留和格式噪音
  - `standards-reviewer` — 核对代码与产物是否遵循项目自己的约定：frontmatter、命名、格式、引用方式，而非通用最佳实践
  - `comment-reviewer` — 评判一个改动新增的注释配不配留：砍掉复述代码、AI 腔的废话，标出维护者真正需要却缺失的 why/边界/历史
  - `project-steward-reviewer` — 从长期维护成本、模块边界、对外承诺和项目走向，判断一处变更值不值得写进项目历史
  - `api-contract-reviewer` — 守住 API 边界：schema、路由、类型、状态码、错误语义保持向后兼容，不在无迁移路径下悄悄弄坏调用方
  - `review-researcher` — 独立查证每条评审发现的真伪与根因，作为落地修复前的断路器，再给出正确利落的修法
  - `review-fixer` — 在授权的文件范围内，按复核给出的修法从根上落地一组已验证的修复，并补上回归检查
- **验证**
  - `test-leader` — 统筹一次变更的整体验证，派出各专项测试者，把证据汇成一个判断，守住交付前那道验证关
  - `e2e-tester` — 以真实用户的身份从外部把系统端到端跑一遍完整流程，如实记录到底发生了什么
  - `api-contract-tester` — 动手写测试并真跑，验证 API 是否兑现其结构、状态码、权限边界和错误语义
  - `regression-tester` — 确认变更之后原本好用的行为仍然好用，逮住那些悄无声息坏掉的回归
- **验收与交付**
  - `acceptance-review-lead` — 守交付前最后一关，判断完整证据是否足以证明所有需求达成、风险可接受
  - `change-detailed-walker` — 把一次变更镜像成本地 forge 上的 PR，逐函数写下「为什么这么改」的评论，让评审在原生 diff 界面里读
- **配套**
  - `brainstorm` — 用一次一问的追问把模糊诉求逼成经发起人确认、可测试的需求
  - `authenticated-browser-session` — 用独立浏览器配置维持真实登录态来验证需登录的流程，不读 Cookie 也不要用户贴 token
  - `explain` — 把 bug、测试进展、评审发现和交付状态翻译成零上下文的话，让没读过代码的发起人也看得懂
  - `precommit-setup` — 给仓库配提交前防线：默认跑快速确定性检查，AI 评审按需开启，不拖慢每次提交

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
    │   └── interface-contract.md         # 公共/共享契约：schema、认证、错误、兼容性、验证钩子
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
    │   │   ├── taste-reviewer.md
    │   │   ├── change-hygiene-reviewer.md
    │   │   ├── standards-reviewer.md
    │   │   ├── comment-reviewer.md
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
    ├── explain/                          # 按需落库的白话解释，方便 sponsor 逐项阅读
    │   └── review-summary/
    │       ├── 00-index.md
    │       └── 001-finding-context.md
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
