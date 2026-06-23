# AgentCorp

**一套多智能体编程流水线——可控、可理解、可验证。**

[English](README.md) · 简体中文

[快速上手](#快速上手) · [技能一览](#技能一览) · [产物一览](#产物一览)

---

AI 生成代码的速度越来越快，但验证代码是否正确的成本，始终在你身上。当你拿到一堆「看起来没问题」的代码，判断其对错的责任全落在你肩上——而你对 AI 的依赖越深，这种判断能力反而越迟钝。

更棘手的是恶性循环：Agent 的工作过程如同黑箱，你无法理解它的推理逻辑；看不懂，就只能跳过 Review；跳过 Review，认知债务便会累积；债务越深，你越离不开它，也越难在它出错时及时纠正。最终，重要的任务你不敢完全交给它。

AgentCorp 要解决的正是这个问题。它将 Agent 的工作流程从一条不可控、不可读、无法回溯的黑箱链条，转变为一条**可控、可理解、可验证**的流水线。它由 **29 项技能**组成——其中 27 项源自企业级交付实践，覆盖完整开发流程的专职角色；另有 2 项通用能力，供任何角色随时调用。全面适配 **Claude Code** 与 **Codex**。

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

### 第一次使用

安装完成后，直接描述你的需求，或调用 `/agentcorp:delivery-orchestrator`。它会先与你确认成功标准、推荐执行路线，然后按阶段推进，在每个关卡停下汇报。

需要真实浏览器或登录态验证时，它会使用独立的浏览器配置打开页面，请你手动登录一次，之后在页面内自动执行检查——不会触碰你的本地 Cookie。任务结束后，你将获得一份交付报告，以及一份可回溯每个决策的审计记录。

## 技能一览

29 项技能按职能分组如下。每个技能的具体行为定义在 `agentcorp/<skill>/SKILL.md` 中，也会出现在 Claude Code 和 Codex 的技能选择器里。其中 27 项为交付专职角色，标注 ¹ 的为任何角色都可调用的通用能力。

- **编排** — `delivery-orchestrator`
- **规划与设计** — `solution-architect`、`implementation-planner`、`test-planner`、`parallel-researcher`
- **实现** — `implementation-engineer`、`review-fixer`
- **计划与测试计划评审** — `plan-review-lead`、`test-plan-reviewer`、`adversarial-reviewer`
- **代码评审** — `code-review-lead` + `correctness-reviewer`、`security-reviewer`、`performance-reviewer`、`reliability-reviewer`、`simplicity-reviewer`、`change-hygiene-reviewer`、`standards-reviewer`、`project-steward-reviewer`、`api-contract-reviewer`
- **验证** — `test-leader`、`e2e-tester`、`api-contract-tester`、`regression-tester`
- **复核与验收** — `review-researcher`、`acceptance-review-lead`
- **支撑** — `change-detailed-walker`、`brainstorm`¹、`authenticated-browser-session`¹

¹ `brainstorm`（通用思考能力，主要用于需求澄清）与 `authenticated-browser-session`（持久化登录态浏览器）为通用行为能力，不是带独立 Gate 的交付角色，任何角色需要时都可加载。

## 产物一览

每个阶段都会留下结构清晰的产物，全部带 frontmatter（`artifact_type` / `author_agent` / `phase` / `status` / `source_artifacts`），可审计、可回溯。以「给 Web 应用新增邀请成员功能」为例，一次完整交付会在 `teamspace/` 下产生这样的产物树：

```
teamspace/
├── testing-context.md                   # 跨任务测试上下文：页面地图、可观测面、测试数据约定
├── learnings/                           # 跨任务经验沉淀（每条一文件，写前先 grep 去重）
│   └── invite-token-reuse-trap.md       #   触发情境 → 根因 → 怎么做 → 下次如何更快
└── tasks/20260622-invite-members/       # 本次任务根目录
    ├── task.md                          # 任务记录：成功标准、阶段流转、门禁历史、决策日志
    ├── manifest.md                      # 审计台账：每阶段 Owner/状态/人工门/质量门/产物/回执
    │
    ├── requirements/
    │   └── validated-requirements.md    # 已验证需求：用户旅程、FR/AC、非目标、交接给架构与测试
    │
    ├── design/
    │   ├── architecture.md              # 架构设计：组件、数据模型、Mermaid 图、实现约束
    │   └── api-contract.md              # API 契约：POST /invites、兼容性、迁移说明、验证钩子
    │
    ├── test/
    │   ├── test-plan.md                 # 测试总计划：风险分级、Must-Have、禁区、覆盖总结
    │   ├── api-test-plan.md             # API 手册：字面 curl 请求、预期、证据、失败处理
    │   ├── e2e-test-plan.md             # E2E 手册：浏览器步骤、字面输入、截图为主证据
    │   ├── regression-test-plan.md      # 回归手册：爆炸半径、既有套件、新增「改前失败」检查
    │   ├── test-plan-review.md          # 测试计划评审决策（approve / request_changes）
    │   └── exploration/                 # 探索性测试工作文件（留在任务目录，确认结论回写 testing-context）
    │       ├── charters.md              # 探索章程：C-1/C-2/C-3 各自目标与状态
    │       ├── frontier.md              # 探索待办：待探入口点及来源
    │       └── journal.md               # 探索日志：每轮操作、观察、截图
    │
    ├── implementation/
    │   ├── implementation-story.md      # 实现故事：AC、任务树（指向文件）、约束、验证期望
    │   └── implementation-result.md     # 实现结果：改动文件、命令、偏差、阻塞、移交评审
    │
    ├── review/
    │   ├── plan-review.md               # 计划评审决策：必改/建议改/证据缺口/残余风险/下一任
    │   ├── code-review.md               # 代码评审总决策：汇聚各专项，approve / request_changes
    │   ├── specialist-findings/         # 各专项评审发现（每条带 严重度/置信度/证据/影响/建议）
    │   │   ├── correctness-reviewer.md
    │   │   ├── security-reviewer.md
    │   │   ├── performance-reviewer.md
    │   │   ├── reliability-reviewer.md
    │   │   ├── simplicity-reviewer.md
    │   │   ├── change-hygiene-reviewer.md
    │   │   ├── standards-reviewer.md
    │   │   ├── project-steward-reviewer.md
    │   │   ├── api-contract-reviewer.md
    │   │   └── adversarial-reviewer.md  # 对抗性：假设违背、组合失败、级联、滥用场景
    │   ├── research/                    # 评审复核：逐条当作误报去证伪
    │   │   ├── 00-index.md              # 索引：7 列表，confirmed 在前 → false-positive 在底
    │   │   ├── F-01-confirmed-...md     # 每问题一文件：背景、代码上下文、根因、修复建议
    │   │   └── F-02-false-positive-...md#   含 Human decision 骨架，留空给人类勾选
    │   ├── fix-records/                 # 修复记录（按文件组分区并行）
    │   │   └── invite-service.md        # 每条：verdict、改动文件、回归检查（修前失败修后通过）
    │   └── fix-result.md                # 修复汇总
    │
    ├── verification/
    │   ├── verification-report.md       # 验证总裁决：approve / request_changes，引用各测试结果
    │   └── test-results/                # 测试执行结果（基于真实证据，不臆造）
    │       ├── e2e-tester.md            # 状态、检查、命令、截图/URL 证据
    │       ├── api-contract-tester.md   # 请求/响应、通过/失败
    │       └── regression-tester.md     # 前后对比、退出码
    │
    ├── acceptance/
    │   ├── acceptance-package.md        # 验收包：汇聚所有产物索引 + 成功标准与直接证据
    │   └── acceptance-decision.md       # 最终验收裁决：accept / reject / needs_more_evidence
    │
    └── _handoffs/                       # 阶段委托-回报闭环（每个委派阶段各一对）
        ├── to-solution-architect.md     # 分派单：目标、输入、约束、停止条件、output_path
        ├── from-solution-architect.md   # 回执：产物路径、完成说明、阻塞项
        └── ...                          # test-planner / implementation-engineer 等各一对
```

---

AgentCorp 让工作能够复利增长——同时将可控、可理解、可验证焊入结构本身，而非留给操作者自行保证。
