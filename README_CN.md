<div align="center">

# AgentCorp

### 38 份 markdown，一整个软件交付组织

总控、规划者、工程师、**12 条专项 review lane**、测试者，外加一道验收关卡——全部以纯 markdown Agent Skill 写成，**Claude Code** 和 **Codex** 上都能跑。没有角色能放行自己的产出。

[![GitHub stars](https://img.shields.io/github/stars/ylxmf2005/AgentCorp?style=flat&logo=github&color=6366f1)](https://github.com/ylxmf2005/AgentCorp/stargazers)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-d97757)](#快速上手)
[![Codex](https://img.shields.io/badge/Codex-plugin-1f2328)](docs/codex-setup_CN.md)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-open%20standard-6366f1)](#快速上手)

[English](README.md) · 简体中文

[快速上手](#快速上手) · [一次交付如何运转](#一次交付如何运转) · [信任架构](#信任架构) · [技能一览](#38-项技能) · [诚实的局限](#诚实的局限)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/pipeline-dark.svg">
  <img src="docs/assets/pipeline-light.svg" alt="AgentCorp 交付流水线：你把任务交给总控，总控把每个 phase 路由到对应角色——规划、实现、12 条专项 lane 评审并由熔断器杀掉误报、用可打开的证据做验证、验收、交付——在人工门禁处停下，留下经过机械校验的完整记录，并把每单任务的经验沉淀回系统。" width="100%">
</picture>

</div>

## 为什么会有这个项目

AI 写代码越来越快，但验证代码是否可靠，成本始终压在你身上。更麻烦的是随之而来的恶性循环：agent 干的活像个黑箱，你于是不看；不看就攒一堆糊涂账；攒多了，真正要紧的任务你再也不敢交出去。

AgentCorp 是一套 [loop-engineering](https://addyosmani.com/blog/loop-engineering/) 系统，专门打断这个循环。它不是一份提示词合集，而是一套写了规矩的分工制度——谁产出、谁放行、工作往前推之前得先拿出什么证据：

- **可控**——流程按规模自动伸缩：一行改动走快速通道，全新系统则一个关键 phase 都不跳；反复失败触发重新规划，不会照原样再试第三遍。
- **可理解**——每个 phase 留下一份结构化 artifact，记录谁基于什么证据做了什么决定，写到不读代码也能做判断的程度。
- **可验证**——没有角色能放行自己的产出，测试方案在动手写代码之前就定好，每条 review 发现在被独立验证之前一律视为疑似误报。

## 快速上手

**Claude Code：**

```
/plugin marketplace add ylxmf2005/AgentCorp
/plugin install agentcorp@agentcorp
```

然后跑 `/reload-plugins` 或重启。技能带命名空间，例如 `/agentcorp:delivery-orchestrator`。

**Codex：**

```
codex plugin marketplace add ylxmf2005/AgentCorp
```

在 `/plugins` 菜单里启用 **AgentCorp** 后重启——同一份 skill 本体服务两个运行时（开放的 Agent Skills 标准）。生命周期 hook 在 Codex 上的挂载方式不同：见 [docs/codex-setup_CN.md](docs/codex-setup_CN.md)。

**接下来把任务交给它。** 总控会先跟你确认成功标准、推荐路线，然后驱动整条流水线——每到 gate 就停下汇报。参数可以自由组合：

```text
/agentcorp:delivery-orchestrator mode:direct pace:guided effort:low 修复一处空值检查
/agentcorp:delivery-orchestrator mode:partial pace:continuous effort:high 给某个 API 加限流
/agentcorp:delivery-orchestrator mode:full effort:max lang:en-US 迁移 webhooks
```

省略某个参数，总控就替你推荐。只需要单项能力时也可以直接调用：

```text
/agentcorp:code-review-lead depth:full 评审这份 diff
/agentcorp:parallel-researcher scope:both depth:source-verified 比较几个工作流引擎
/agentcorp:probe output:inline 摸清认证模块
/agentcorp:walkthrough format:html quiz:on 把这条分支讲给我听
/agentcorp:compound session:last focus:friction output:inline 找出反复出现的卡点
```

任务需要登录态的浏览器时，AgentCorp 会启用一个隔离 profile——你手动登录一次就行，它绝不碰你本地的 cookie。每单任务都以一份交付报告和一份可追溯每个决定的审计记录收尾。

## 一次交付如何运转

总控先替发起人（这条流水线向谁交账——就是你）做分类、选范式（从零搭建 / 增强 / 修缺陷 / 简单新增），把 phase 序列作为承诺公开，然后一路驱动——每到人工门禁就停下来，给你一份能导航的摘要（*走到哪了 → 看到了什么 → 建议怎么办 → 你有哪些选项*），不是一句光秃秃的"批准吗？"。phase 之间，工作靠**带 YAML 契约的 assignment/receipt 文件**流转，全部经过机械校验：receipt 声称的 artifact 实际不存在、交付物是空的、出现了谁都不认的 phase 名——`validate-handoff.py` 会在任何人读到之前拦下来。

四个正交旋钮按任务调节协作方式：

| 旋钮 | 取值 | 决定 |
| --- | --- | --- |
| `mode:` | `direct` \| `partial` \| `full` | 你亲自当 reviewer / 总控执行、review 委派 / 全部委派 |
| `pace:` | `continuous` \| `guided` | 一路推进、到检查点再汇报 / 一次一份 artifact、边做边讲 |
| `effort:` | `low` \| `medium` \| `high` \| `max` | 这单任务买多少冗余和可选覆盖 |
| `lang:` | 任意 | 面向人的 artifact 用什么语言写 |

`effort:low` 用*冗余*换速度，但绝不拿诚实来换：任何档位都不能伪造证据、不能放行自己的产出、不能跳过原始失败输入的重跑；一旦触及安全 / 权限 / 数据丢失面，相关 phase 自动升到 max 并明确告知。单个技能同样接受参数：`/agentcorp:probe output:inline`、`/agentcorp:explain reader:newcomer`。完整目录——每个技能的参数、每档 effort 买到什么——见 [docs/parameters_CN.md](docs/parameters_CN.md)。

账要算清楚：一条委派给多位 reviewer 的流水线消耗的是真实的 token 和真实的时钟。`effort` 定价的就是这个——`low` 接近一次单 agent 会话，`max` 给每条 lane 各开一个独立会话。把钱花在出错代价高的地方。

## 信任架构

下面每条机制都是因为它的朴素版本在真实场景里翻过车：

- **没有角色能放行自己的产出。** 作者与 reviewer 分离在每种 mode 下都成立——哪怕 `direct` 模式也保留 review gate，让你做那个知情且明确自愿的 reviewer。
- **review 发现是假设，不是事实。** 多 agent 协作里最贵的翻车，是一条看着很有把握实则有误的发现被下游当真相接走。`review-researcher` 就是熔断器：它对每条发现做对抗性重走（零假设：这是误报），用具名证据杀掉不成立的，只有确认属实且在本单范围内的条目才能进 `fix`。
- **结论得有凭据。**"测试通过"只有配上你能打开的东西才算——一条路径、一份日志、一张渲染出来的截图。机器在本地无法验证的行为一律标 `unverified`，过不了任何 gate；口头说法不算证据；原始证据日志逐字保留、只增不改。
- **gate 只讲封闭词表。** 人工门禁的结果只落到 `approved / skipped / revised / blocked`——都有记录，绝不静默放行。发起人的回复如果没回答那个问题，就映射不到任何结果：流水线里的任何环节都不得发明"默认即批准"的约定。
- **高风险改动要取另一个模型家族的独立意见。** 碰到安全边界、对外契约或不可逆发布，负责下结论的角色会先从*另一个*运行时家族拿一份冷读（Codex 查 Claude 家族的活，反之亦然）——两个家族很少共享同一个盲区。
- **机械层本身做过 fuzz 测试。** `validate-handoff.py` 的已知盲区由 fuzzing 发现，并用一套随仓发布的回归套件（`tools/test-validate-handoff.py`）钉死。

## 它会自我改进——但有一道人工门禁

AgentCorp 把自己的技能也当作被测系统：

- **捕获 → 呈现 → 落地。** 会话结束时一个 hook 从对话记录里提取技能改进信号（先做隐私脱敏）；`skill-evolution` 起草编辑，只有你对着那份具体的 diff 说了"行"，才真正落地。
- **`compound`（沉淀）既是 phase 也是 skill。** 交付前，这一轮的教训变成资产：修好的 bug 变回归测试，踩过的坑变 `CLAUDE.md` 规则，一次证实的漏检变成给当初漏掉它的那位 reviewer 的归档提案。同一个 skill 也接得住直接的复盘请求：一个确定性提取器把运行时自身的录制解析成逐轮对话、时钟耗时、token 账目和卡壳点——每个论断都锚定到 transcript 里的具体条目。
- **改技能必须拿出失败轨迹。** 不接受纯措辞润色：一处 skill 改动必须援引一次具体失败的运行，以及它在哪道 gate 上断掉的。

这套纪律本身也做了回归测试：`scenarios/` 随仓发布着用来演化系统的**黄金集**——九个埋了陷阱的交付任务，仿照真实 agent 失败模式设计（一个自信地指名错误修法的 issue；一套改断言就能最省力变绿的测试；一条藏在文档里、目标状态恰好违反了它的策略；一个只有真实浏览器才能验证的缺陷），外加 26 条路由探针和 validator 的 fuzz 套件。任何 skill 编辑都会重放它对应的场景和关联的伙伴。

## 38 项技能

| 阶段 | 技能 |
| --- | --- |
| **编排** | `delivery-orchestrator` |
| **规划与设计** | `solution-architect` · `implementation-planner` · `plan-review-lead` · `test-planner` · `test-plan-reviewer` · `parallel-researcher` |
| **实现** | `implementation-engineer` |
| **代码 review** | `code-review-lead` + 12 条 lane：`correctness` · `security` · `performance` · `reliability` · `adversarial` · `simplicity` · `taste` · `change-hygiene` · `standards` · `comment-optimizer` · `project-steward` · `api-contract`，然后是 `review-researcher`（熔断器）· `review-fixer` |
| **验证** | `test-leader` · `e2e-tester` · `api-contract-tester` · `regression-tester` |
| **验收** | `acceptance-review-lead` |
| **配套** | `probe` · `brainstorm` · `grill` · `compound` · `explain` · `walkthrough` · `authenticated-browser-session` · `precommit-setup` · `skill-evolution` · `semantic-core-translation` |

每个技能的一句话说明：[docs/skills_CN.md](docs/skills_CN.md)。

每个 phase 都写出一份带 frontmatter 的结构化 artifact——任务记录、审计台账、handoff 文件、review 发现、证据日志、交付报告——工作因此可审计、可追溯。完整运行时布局：[docs/artifacts_CN.md](docs/artifacts_CN.md)。

## 诚实的局限

流水线对自身施加的纪律，和它要求于人的一样：

- markdown 契约能**约束**模型行为、让违规显形，但无法让违规变得不可能。机械校验器检查的是信封和存在性，不是真伪——真伪要靠 review/verify 角色和你的 gate 来把关。
- 陷阱场景集是维护者写的回归护栏，不是第三方评测成绩；不声称任何 SWE-bench 分数。
- 有意不设前端角色，也不设 merge/push 的归属者：前端改动需要发起人明确豁免，把代码落到分支上这件事始终握在你手里。
- 环境要求：支持 plugin/skill 的 Claude Code 或 Codex CLI；校验器和轨迹提取器仅依赖 Python 3.9+ 标准库。

---

<div align="center">

AgentCorp 把可控、可理解、可验证焊进结构本身——每交付一单，系统都比接手时更强。

</div>
