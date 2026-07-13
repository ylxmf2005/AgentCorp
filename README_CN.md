<div align="center">

# AgentCorp

### 38 个 markdown 文件，装下一整个软件交付组织

编排者、规划者、工程师、**12 条专项评审车道**、测试者、验收关卡——以纯 markdown 的
Agent Skills 形式，同时运行在 **Claude Code** 与 **Codex** 上。没有任何角色能为自己的工作放行。

[![GitHub stars](https://img.shields.io/github/stars/ylxmf2005/AgentCorp?style=flat&logo=github&color=6366f1)](https://github.com/ylxmf2005/AgentCorp/stargazers)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-d97757)](#快速上手)
[![Codex](https://img.shields.io/badge/Codex-plugin-1f2328)](docs/codex-setup_CN.md)
[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-open%20standard-6366f1)](#快速上手)

[English](README.md) · 简体中文

[快速上手](#快速上手) · [一次交付如何运转](#一次交付如何运转) · [信任架构](#信任架构) · [技能一览](#37-项技能) · [诚实的局限](#诚实的局限)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/pipeline-dark.svg">
  <img src="docs/assets/pipeline-light.svg" alt="AgentCorp 交付流水线：你把任务交给编排者，它把每个阶段路由给对应角色——规划、实现、12 条车道评审并由熔断器杀掉误报、用可打开的证据验证、验收、交付——在人工门禁处停下，留下经机械校验的书面痕迹，并把每单任务的教训沉淀回系统。" width="100%">
</picture>

</div>

## 为什么会有这个项目

AI 生成代码的速度每个月都在变快，但验证代码是否正确的成本，始终在你身上。比代码更棘手的是随之而来的恶性循环：Agent 的工作过程如同黑箱，你只能跳过 review；认知债务不断累积；最终，重要的任务你不敢交给它。

AgentCorp 是为打破这个循环而生的 [Loop Engineering](https://addyosmani.com/blog/loop-engineering/) 系统。与其说是提示词合集，不如说是**一张带契约的组织架构图**——谁产出什么、谁有权放行、工作向前推进之前必须存在什么证据：

- **可控**——流程按任务规模自动裁剪：一行改动走微任务车道，从零搭建则一个关键环节都不少；重复失败会强制重新规划，而不是第三次原样重试。
- **可理解**——每个阶段都留下结构化产物，记录「谁在什么证据下做了什么决策」，并解释到「即使你没读过这段代码，也能判断该不该改」。
- **可验证**——没有任何角色能为自己的产出放行；测试在写代码之前就已确定；每个评审发现在被独立重证之前，都被当作可能的误报。

## 快速上手

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

在 `/plugins` 菜单启用 **AgentCorp** 并重启——同一份 skill 本体服务两个运行时（开放的 Agent Skills 标准）。生命周期 hook 在 Codex 侧挂载方式不同：见 [docs/codex-setup_CN.md](docs/codex-setup_CN.md)。

**然后把任务交给它。** 交付编排器会先与你确认成功标准、推荐执行路线，然后驱动整条流水线——在每个关卡停下汇报。参数可以按任务自由组合：

```text
/agentcorp:delivery-orchestrator mode:direct pace:guided effort:low 修复空值判断
/agentcorp:delivery-orchestrator mode:partial pace:continuous effort:high 给 API 加限流
/agentcorp:delivery-orchestrator mode:full effort:max lang:zh-CN 迁移支付回调
```

不写某个参数时，交付编排器会替你推荐。只需要其中一项能力时，也可以直接调用单个技能：

```text
/agentcorp:code-review-lead depth:full 评审当前 diff
/agentcorp:parallel-researcher scope:both depth:source-verified 比较工作流引擎
/agentcorp:probe output:inline 摸清认证模块
/agentcorp:walkthrough format:html quiz:on 讲懂当前分支
/agentcorp:replay session:last focus:friction output:inline 找出反复卡点
```

需要登录态浏览器时，AgentCorp 使用独立的浏览器 Profile——你手动登录一次，它不会触碰你的本地 Cookie。每单任务结束后，你将获得一份交付报告，以及一份可回溯每个决策的审计记录。

## 一次交付如何运转

编排者替 sponsor（这条流水线对之负责的人——也就是你）先分类工作、选定范式（从零搭建/增强/修缺陷/简单新增）、把阶段序列作为承诺宣布出来，然后驱动整条流水线——在每个人工门禁停下，给你一份可导航的摘要（*进行到哪 → 我看到什么 → 我的建议 → 你的选项*），而不是一句干巴巴的「批不批？」。阶段之间靠**带 YAML 契约的 assignment/receipt 文件**流转，并被机械校验：receipt 声称的 artifact 不存在、交付物是空壳、没人认识的 phase 名——`validate-handoff.py` 在任何人读到一个字之前就拦下。

四个正交旋钮按任务调节协作方式：

| 旋钮 | 取值 | 决定 |
| --- | --- | --- |
| `mode:` | `direct` \| `partial` \| `full` | 你亲自当评审 / 编排者执行、评审委派 / 每个阶段都委派 |
| `pace:` | `continuous` \| `guided` | 持续推进、到检查点汇报 / 一次一个产物、边做边教 |
| `effort:` | `low` \| `medium` \| `high` \| `max` | 这单任务买多少冗余和可选覆盖 |
| `lang:` | 任意 | 所有人读产物用什么语言写 |

`effort:low` 用*冗余*换速度——但从不拿诚实做交换：任何档位都无权伪造证据、自批自审或跳过原始失败输入的重跑；安全/权限/数据丢失面会自动把相关环节升到 max 并明说。单个技能同样接受参数：`/agentcorp:probe output:inline`、`/agentcorp:explain reader:newcomer`。

对账单要诚实：多评审委派的流水线消耗真实的 token 和时钟，而这正是 `effort` 定价的东西——`low` 接近单 agent 会话，`max` 为每条车道买一个独立会话。把钱花在错误代价高的地方。

## 信任架构

下面每条机制，都是因为它的朴素版本在真实场景里翻过车：

- **没有角色能为自己的产出放行。**作者/评审分离在每种模式下都成立——即使单人 `direct` 模式，评审关卡也保留，由知情且明确愿意的*你*来当评审。
- **评审发现是假设，不是事实。**多 agent 协作里最贵的失败，是一条自信但错误的发现被下游当成真理。`review-researcher` 是熔断器：以「误报」为零假设对每条发现对抗性重查，用点名的证据杀掉假问题——只有被证实且在本单范围内的项才进 `fix`。
- **结论必须有据可开。**「测试通过」只有配上你能打开的东西——路径、日志、渲染截图——才算数。只能在本机没有的环境里验证的行为标记 `unverified` 且不过任何门；口头确认不是证据；原始证据日志只增不删。
- **人工门禁只说封闭词表。**人工门禁只落 `approved / skipped / revised / blocked` 四种结果——有记录，绝不静默通过。sponsor 的回复没有回答问题就映射为*无结果*：流水线里没有任何环节可以发明「默认批准约定」。
- **高危改动要过跨模型家族第二意见。**碰到安全边界、公共契约、不可逆发布，verdict 归属者在下结论前，从*另一个*模型家族取一份独立冷读（Codex 查 Claude 家族的活，反之亦然）——两个家族更不容易共享同一个盲区。
- **机械层本身被 fuzz 测过。**`validate-handoff.py` 的已知盲区靠 fuzz 找出，并由随仓发布的回归套件（`tools/test-validate-handoff.py`）钉死，保证不复发。

## 它会自我进化——但有人工门禁

AgentCorp 把自己的技能也当作被测系统：

- **捕获 → 呈现 → 落地。**会话结束的 hook 从轨迹里挖掘技能改进信号（持久化之前先隐私脱敏）；`skill-evolution` 起草编辑——只有对具体 diff 的一句明确同意才落地。
- **`compound`（沉淀）是一个 phase，不是一条笔记。**交付之前，本轮的教训变成资产：修过的 bug 变成回归测试，踩过的坑变成 `CLAUDE.md` 规则，被证实的漏检变成给漏掉它的 reviewer 的提案。
- **`replay` 回放会话本身。**确定性提取器把 runtime 自己的记录解析成 turns、时钟、token 开销和卡壳点——每个论断锚定到轨迹条目。
- **改动需要失败轨迹。**拒绝纯措辞润色：一次技能修改必须引用一条具体的失败运行、断在哪道门。

而且这套纪律本身有回归实测：`scenarios/` 随仓发布用来演化系统的**黄金回归集**——九个埋了陷阱的交付任务，取材于真实的 agent 失败模式（一个自信地指错修复位置的 issue、一套改断言就是最省力绿灯的测试、一条藏在文档里而目标状态恰好靠违反它达成的政策、一个只有真实浏览器才能验证的缺陷），外加 24 条路由探针和 validator 的 fuzz 套件。任何技能修改都要重放它的目标场景和关联技能。

## 38 项技能

| 阶段 | 技能 |
| --- | --- |
| **编排** | `delivery-orchestrator` |
| **规划与设计** | `solution-architect` · `implementation-planner` · `plan-review-lead` · `test-planner` · `test-plan-reviewer` · `parallel-researcher` |
| **实现** | `implementation-engineer` |
| **代码评审** | `code-review-lead` + 12 条车道：`correctness` · `security` · `performance` · `reliability` · `adversarial` · `simplicity` · `taste` · `change-hygiene` · `standards` · `comment-optimizer` · `project-steward` · `api-contract`，以及 `review-researcher`（熔断器）· `review-fixer` |
| **验证** | `test-leader` · `e2e-tester` · `api-contract-tester` · `regression-tester` |
| **验收** | `acceptance-review-lead` |
| **配套** | `probe` · `brainstorm` · `grill` · `replay` · `explain` · `walkthrough` · `authenticated-browser-session` · `precommit-setup` · `skill-evolution` · `semantic-core-translation` |

每个技能的一句话说明：[docs/skills_CN.md](docs/skills_CN.md)。

每个阶段都写下带 frontmatter 的结构化产物——任务记录、审计台账、交接单、评审发现、证据日志、交付报告——工作因此可审计、可回溯。完整运行时布局：[docs/artifacts_CN.md](docs/artifacts_CN.md)。

## 诚实的局限

流水线要求的纪律，同样适用于它自己：

- markdown 契约**约束**模型行为、让违规可见；它们无法让违规不可能发生。机械校验器查的是信封和存在性，不是真伪——真伪由评审/验证角色和你的门禁把守。
- 陷阱场景集是维护者自己写的回归护栏，不是第三方基准成绩；这里不声称任何 SWE-bench 分数。
- 刻意没有前端角色、没有 merge/push 归属者：前端改动需要 sponsor 显式豁免，把代码落到分支上的动作始终在你手里。
- 环境要求：支持 plugin/skill 的 Claude Code 或 Codex CLI；校验器与轨迹提取器只依赖 Python 3.9+ 标准库。

---

<div align="center">

AgentCorp 把可控、可理解、可验证焊进结构本身——并且每交付一单，系统都比接单时更强一点。

</div>
