<div align="center">

# AgentCorp

### 38 个 markdown 文件，装下一整个软件交付组织

编排者、规划者、工程师、**12 条专项评审车道**、测试者，外加一道验收关卡——全部以纯
markdown 的 Agent Skills 形式，同时运行在 **Claude Code** 与 **Codex** 上。没有任何角色能为自己的工作放行。

[![GitHub stars](https://img.shields.io/github/stars/ylxmf2005/AgentCorp?style=flat&logo=github&color=6366f1)](https://github.com/ylxmf2005/AgentCorp/stargazers)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-d97757)](#快速上手)
[![Codex](https://img.shields.io/badge/Codex-plugin-1f2328)](docs/codex-setup_CN.md)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-open%20standard-6366f1)](#快速上手)

[English](README.md) · 简体中文

[快速上手](#快速上手) · [一次交付如何运转](#一次交付如何运转) · [信任架构](#信任架构) · [技能一览](#38-项技能) · [诚实的局限](#诚实的局限)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/pipeline-dark.svg">
  <img src="docs/assets/pipeline-light.svg" alt="AgentCorp 交付流水线：你把任务交给编排者，它把每个阶段路由给对应角色——规划、实现、经 12 条专项车道评审并由熔断器杀掉误报、用可打开的证据验证、验收、交付——在人工门禁处停下，留下一份经机械校验的书面痕迹，并把每单任务的教训沉淀回系统。" width="100%">
</picture>

</div>

## 为什么会有这个项目

AI 生成代码的速度每个月都在变快，但验证这些代码是否可靠的成本，仍然落在你身上。而随之而来的循环比代码本身更棘手：Agent 的工作过程是个黑箱，于是你跳过 review；认知债务越积越多；到最后，凡是要紧的任务你都不敢再交给它。

AgentCorp 是一套为打破这个循环而生的 [loop-engineering](https://addyosmani.com/blog/loop-engineering/) 系统。与其说是一份提示词合集，不如说是**一张带契约的组织架构图**——谁产出什么、谁有权放行、工作向前推进之前必须先有哪些证据：

- **可控**——流程会自己按规模伸缩：一行改动走微型车道，从零起步的新系统则一个关键阶段都不落；反复失败会强制重新规划，而不是原样重试第三遍。
- **可理解**——每个阶段都留下一份结构化产物，记录谁依据什么证据做了什么决定，并讲解到你没读过代码也能判断的程度。
- **可验证**——没有任何角色能为自己的产出放行，测试在动手实现之前就已定好，每一条评审发现在被独立重新证实之前，都当作可能的误报对待。

## 快速上手

**Claude Code：**

```
/plugin marketplace add ylxmf2005/AgentCorp
/plugin install agentcorp@agentcorp
```

随后运行 `/reload-plugins` 或重启。技能带命名空间，例如 `/agentcorp:delivery-orchestrator`。

**Codex：**

```
codex plugin marketplace add ylxmf2005/AgentCorp
```

在 `/plugins` 菜单里启用 **AgentCorp** 并重启——同一份 skill 本体服务两个运行时（开放的 Agent Skills 标准）。生命周期 hook 在 Codex 上的挂载方式不同：见 [docs/codex-setup_CN.md](docs/codex-setup_CN.md)。

**然后把一个任务交给它。** 交付编排器会先与你确认成功标准、推荐一条路线，再驱动整条流水线——每到一道关卡就停下汇报。参数可以自由组合以贴合任务：

```text
/agentcorp:delivery-orchestrator mode:direct pace:guided effort:low 修复一处空值检查
/agentcorp:delivery-orchestrator mode:partial pace:continuous effort:high 给某个 API 加限流
/agentcorp:delivery-orchestrator mode:full effort:max lang:en-US 迁移 webhooks
```

省略某个参数，就让编排器替你推荐。只需要其中某一项能力时，也可以直接调用单个技能：

```text
/agentcorp:code-review-lead depth:full 评审这份 diff
/agentcorp:parallel-researcher scope:both depth:source-verified 比较几个工作流引擎
/agentcorp:probe output:inline 摸清认证模块
/agentcorp:walkthrough format:html quiz:on 把这条分支讲给我听
/agentcorp:compound session:last focus:friction output:inline 找出反复出现的卡点
```

任务需要一个已登录的浏览器时，AgentCorp 会用一个隔离的 profile——你手动登录一次即可，它绝不碰你本地的 Cookie。每单任务都以一份交付报告收尾，外加一份能追溯每个决定的审计记录。

## 一次交付如何运转

编排者替 sponsor（这条流水线对之负责的人——也就是你）把工作分类，选定一种范式（从零搭建 / 增强 / 修缺陷 / 简单新增），把阶段序列作为一项承诺宣布出来，然后驱动它——每到人工门禁就停下，给你一份可导航的摘要（*进行到哪 → 我看到了什么 → 我建议什么 → 你有哪些选项*），而不是干巴巴一句「批准吗？」。阶段之间，工作靠**带 YAML 契约的 assignment/receipt 文件**流转，并经过机械校验：receipt 声称的 artifact 并不存在、交付物是空的、出现谁都不认识的 phase 名——这些都会被 `validate-handoff.py` 在任何人读到一个字之前拦下。

四个正交的旋钮按任务调节这次协作：

| 旋钮 | 取值 | 决定 |
| --- | --- | --- |
| `mode:` | `direct` \| `partial` \| `full` | 你亲自当评审 / 编排者执行、评审外包 / 每个阶段都外包 |
| `pace:` | `continuous` \| `guided` | 持续推进、到检查点再汇报 / 一次一份产物、边做边讲 |
| `effort:` | `low` \| `medium` \| `high` \| `max` | 这单任务愿意买多少冗余和可选覆盖 |
| `lang:` | 任意 | 一切面向人的产物用什么语言书写 |

`effort:low` 用*冗余*换速度——但绝不拿诚实来换：任何档位都不能伪造证据、不能为自己的产出放行、也不能跳过对原始失败输入的重跑；而一旦触及安全 / 权限 / 数据丢失面，相关阶段会自动升到 max，并且明说出来。单个技能也以同样方式接受参数：`/agentcorp:probe output:inline`、`/agentcorp:explain reader:newcomer`。 完整目录——每个技能的参数、每档 effort 买到什么——见 [docs/parameters_CN.md](docs/parameters_CN.md)。

对账单要诚实：一条外包给多位评审者的流水线，消耗的是真实的 token 和真实的时钟时间。而这正是 `effort` 在定价的东西——`low` 接近一次单 agent 会话，`max` 为每条车道各买一个独立会话。把钱花在犯错代价高昂的地方。

## 信任架构

下面每一条机制，都是因为它的朴素版本曾在某个真实场景里翻过车：

- **没有角色能为自己的产出放行。** 作者与评审分离在每种模式下都成立——即便单人的 `direct` 模式也保留评审门禁，并把你——一个知情且明确自愿的你——变成那个评审。
- **评审发现是假设，不是事实。** 多 agent 协作里最昂贵的失败，就是一条自信却错误的发现被下游当成真相接走。`review-researcher` 就是那个熔断器：它以「误报」为零假设，对抗性地把每条发现重走一遍，用点名的证据杀掉假问题——只有被证实且落在本单范围内的项，才进得了 `fix`。
- **结论需要抓手。**「测试通过」只有配上一样你能打开的东西才算数——一个路径、一份日志、一张渲染出来的截图。凡是机器无法在本地验证的行为，都标为 `unverified`，过不了任何门；口头确认不算证据；原始证据日志逐字保存、只增不改。
- **门禁只讲一套封闭词表。** 人工门禁的结果只会落到 `approved / skipped / revised / blocked`——一律记录，绝不静默放过。sponsor 的回复若没有回答那个问题，就映射不到任何结果：流水线里的任何环节都不得凭空发明一条「默认即批准」的约定。
- **高风险改动要拿另一个模型家族的第二意见。** 碰到安全边界、对外契约或不可逆的发布，下结论的那位在定论前，会从*另一个*运行时家族取一份独立的冷读（Codex 查 Claude 家族的活，反之亦然）——两个家族很少共享同一个盲区。
- **机械层本身经过 fuzz 测试。** `validate-handoff.py` 已知的盲区是靠 fuzzing 找出来的，并由一套随仓库发布的回归套件（`tools/test-validate-handoff.py`）钉死，让它们保持关闭。

## 它会自我改进——但有一道人工门禁

AgentCorp 把自己的技能也当作一套被测系统：

- **捕获 → 呈现 → 落地。** 一个会话结束的 hook 会从对话记录里挖掘技能改进的信号（先做隐私脱敏）；`skill-evolution` 起草那处编辑，而它只有在人对着具体那份 diff 明确说「是」时才落地。
- **`compound`（沉淀）既是 phase 也是 skill。** 交付之前，本轮的教训会变成资产：修好的一个 bug 变成一条回归测试，踩过的一个坑变成一条 `CLAUDE.md` 规则，一次被证实的漏检变成一份替当初漏掉它的那位 reviewer 存档的提案。同一个技能也接得住一句「复盘」：一个确定性的提取器把运行时自己的录制解析成一轮轮对话、时钟耗时、token 账目和卡壳点——每一个论断都锚定到对话记录里的一条条目。
- **编辑需要一条失败轨迹。** 不做纯措辞润色：一处技能改动必须援引一次具体的失败运行，以及它是在哪道门上断掉的。

而且这套纪律本身也做了回归测试：`scenarios/` 随仓库发布着那套用来演化系统的**黄金集**——九个埋了陷阱的交付任务，仿照真实的 agent 失败模式建成（一个自信地点名错误修法的 issue，一套「改断言」就是最省力那抹绿的测试，一条藏在文档里、而目标状态恰恰违反了它的政策，一个只有真实浏览器才能验证的缺陷），外加 26 条路由探针和 validator 的 fuzz 套件。任何一处技能编辑，都会重放它对应的场景以及与它相连的伙伴。

## 38 项技能

| 阶段 | 技能 |
| --- | --- |
| **编排** | `delivery-orchestrator` |
| **规划与设计** | `solution-architect` · `implementation-planner` · `plan-review-lead` · `test-planner` · `test-plan-reviewer` · `parallel-researcher` |
| **实现** | `implementation-engineer` |
| **代码评审** | `code-review-lead` + 12 条车道：`correctness` · `security` · `performance` · `reliability` · `adversarial` · `simplicity` · `taste` · `change-hygiene` · `standards` · `comment-optimizer` · `project-steward` · `api-contract`，然后是 `review-researcher`（熔断器）· `review-fixer` |
| **验证** | `test-leader` · `e2e-tester` · `api-contract-tester` · `regression-tester` |
| **验收** | `acceptance-review-lead` |
| **配套** | `probe` · `brainstorm` · `grill` · `compound` · `explain` · `walkthrough` · `authenticated-browser-session` · `precommit-setup` · `skill-evolution` · `semantic-core-translation` |

每个技能的一句话说明：[docs/skills_CN.md](docs/skills_CN.md)。

每个阶段都写下一份带 frontmatter 的结构化产物——任务记录、审计台账、交接单、评审发现、证据日志、交付报告——工作因此可审计、可追溯。完整运行时布局：[docs/artifacts_CN.md](docs/artifacts_CN.md)。

## 诚实的局限

流水线要求于人的那套纪律，同样施加于它自己：

- markdown 契约**约束**模型行为、让违规显形；它们无法让违规变得不可能。机械校验器查的是信封和存在性，不是真伪——真伪要靠评审 / 验证角色和你的门禁来把守。
- 那套陷阱场景集是维护者写的一道回归护栏，不是第三方基准的成绩；这里不声称任何 SWE-bench 分数。
- 有意不设前端角色、也不设 merge/push 的归属者：前端改动需要 sponsor 明确豁免，而把代码落到某条分支上这件事，始终握在你手里。
- 环境要求：支持 plugin/skill 的 Claude Code 或 Codex CLI；几个校验器和轨迹提取器都只依赖 Python 3.9+ 标准库。

---

<div align="center">

AgentCorp 把可控、可理解、可验证焊进结构本身——而每交付一单，系统都会比它接手时更强一点。

</div>
