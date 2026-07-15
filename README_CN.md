<div align="center">

# AgentCorp

### 让编程 Agent 为自己的工作拿出证据。

**一套运行于 Claude Code 与 Codex 的软件交付系统。**

AgentCorp 把一个任务组织成经过规划、独立评审和验证的交付，让你在接受结果之前，
就能亲自打开证据判断它是否可靠。

[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-d97757)](#claude-code) [![Codex](https://img.shields.io/badge/Codex-plugin-1f2328)](#codex) [![Agent Skills](https://img.shields.io/badge/Agent%20Skills-open%20standard-6366f1)](docs/skills_CN.md)

[English](README.md) · 简体中文

[快速开始](#快速开始) · [为什么选择 AgentCorp](#为什么选择-agentcorp) · [如何运转](#如何运转) · [38 项技能](docs/skills_CN.md)

</div>

## 快速开始

### Claude Code

```text
/plugin marketplace add ylxmf2005/AgentCorp
/plugin install agentcorp@agentcorp
```

运行 `/reload-plugins` 或重启 Claude Code。

### Codex

```text
codex plugin marketplace add ylxmf2005/AgentCorp
codex plugin add agentcorp@agentcorp
```

新建一个 Codex task 即可开始。添加 marketplace 后，也可以从 `/plugins` 菜单安装
**AgentCorp**。生命周期 hook 还需要一步设置，详见 [Codex 配置说明](docs/codex-setup_CN.md)。

### 交给它一个任务

在 Claude Code 中：

```text
/agentcorp:delivery-orchestrator 修复 webhook 重复投递，并证明这个回归已经关闭
```

在 Codex 中：

```text
使用 $agentcorp:delivery-orchestrator 修复 webhook 重复投递，并证明这个回归已经关闭。
```

改代码之前，编排器会先定义怎样才算完成，推荐一条工作路径，并展示准备执行的阶段。
省略参数时由它替你推荐；需要明确控制时，再加上 `mode:`、`pace:`、`effort:` 或 `lang:`。

## 为什么选择 AgentCorp

编程 Agent 写代码很快，难的是判断它的结果是否真的值得交付。一次普通对话往往把作者、
评审者和测试者折叠进同一个上下文，自信的结论很容易被当成证据。

AgentCorp 拆开这些职责，并让交接过程可以检查：

| 常见的 Agent 工作方式 | AgentCorp |
| --- | --- |
| Agent 写完改动，再评价自己的工作 | 工作流把作者与批准者分开 |
| 一条评审发现直接变成修复 | 工作流要求 `review-researcher` 先把它当作可能的误报重新证实 |
| 「测试通过」就是故事的结尾 | 每个结论都指向可打开的路径、日志、响应或截图 |
| 空值检查与系统迁移走同一套流程 | mode 与 effort 按风险伸缩整个组织 |
| 会话结束，教训也随之消失 | `compound` 把教训变成测试、仓库规则或 reviewer 提案 |

因此它不是另一套提示词合集，而是一套带契约的组织：谁产出每份材料、谁有权批准，
以及工作继续推进前必须先存在哪些证据。

## 最终会留下什么

经过编排的任务按设计会留下可导航的记录。一次典型交付包括：

```text
teamspace/tasks/<task>/
├── task.md                              # 成功标准、路径、决策和门禁历史
├── requirements/validated-requirements.md
├── implementation/implementation-result.md
├── review/code-review.md
├── verification/verification-report.md
├── acceptance/acceptance-decision.md
└── delivery/delivery-report.md
```

AgentCorp 只创建当前任务需要的阶段。阶段产物都带结构化 frontmatter；任何委派交接的声明，
在进入审计记录前都会先经过机械校验。完整结构见[运行时产物说明](docs/artifacts_CN.md)。

## 如何运转

[![AgentCorp 交付流程](docs/assets/delivery-workflow.png)](docs/assets/delivery-workflow.excalidraw)

1. **先把工作说清楚。** 确认成功标准，决定必须验证什么，并在实现前完成设计或诊断。
2. **实现，然后挑战它。** 按批准的 Story 实现，运行独立评审车道；任何被路由下来的发现，
   都要先重新证实，才能进入修复。
3. **证明、沉淀、交付。** 执行所需验证，为验收组装证据，把可复用的教训沉淀下来，
   最后给出交付报告。

属于你的决策会停在人工门禁前。门禁结果只使用一套封闭词表
（`approved`、`skipped`、`revised`、`blocked`），每次结果都会被记录，不靠静默推断。

## 按风险调节流程

四个相互独立的旋钮控制一次交付：

| 旋钮 | 取值 | 控制什么 |
| --- | --- | --- |
| `mode:` | `direct` \| `partial` \| `full` | 谁执行各阶段、谁负责评审 |
| `pace:` | `continuous` \| `guided` | 到检查点再汇报，还是一次一份产物、边做边讲 |
| `effort:` | `low` \| `medium` \| `high` \| `max` | 召集多少独立覆盖与冗余 |
| `lang:` | 任意语言 | 所有面向人的产物使用什么语言 |

低 effort 用冗余换速度，但绝不拿证据换方便。遇到安全、权限、公开契约和数据丢失风险时，
工作流要求相关阶段接受更深的审查。每一档和每个技能的准确行为见[参数目录](docs/parameters_CN.md)。

## 单独调用某个技能

交付编排器负责端到端任务，但每一项能力也可以单独调用。

Claude Code：

```text
/agentcorp:code-review-lead depth:full 评审这份 diff
/agentcorp:parallel-researcher scope:both depth:source-verified 比较几个工作流引擎
/agentcorp:probe output:inline 改动前先摸清认证模块
```

Codex：

```text
使用 $agentcorp:code-review-lead 以 depth:full 评审这份 diff。
使用 $agentcorp:parallel-researcher 以 scope:both、depth:source-verified 比较几个工作流引擎。
使用 $agentcorp:probe 在改动前摸清认证模块，并采用 output:inline。
```

查看全部 [38 项技能](docs/skills_CN.md)：从规划、实现、12 条专项评审车道，到验证、验收、
研究、解释、登录态浏览器测试和技能演化。

## 这套系统本身也可检查

- 同一套 38 项 Agent Skill 定义同时服务 Claude Code 与 Codex，并由少量辅助脚本负责校验、
  回放、登录态浏览器会话与 hook。
- `validate-handoff.py` 检查交接信封中的产物缺失、owner 或 phase 不一致及其他一致性错误。
- 9 个埋有陷阱的交付场景模拟错误的 issue 诊断、通过改测试走捷径、隐藏的政策约束，
  以及只能用真实浏览器验证的缺陷等失败模式。
- 24 条路由探针守住相似技能之间的边界；一套包含 23 项预期的回归脚本覆盖 validator 边界情况。

这些场景与检查都随仓库发布；项目不会要求你相信一张基准测试截图。

## 诚实的局限

- Markdown 契约可以约束模型行为、让违规显形，但无法让错误行为变得不可能。
- 场景套件由本项目自行维护，并非独立基准；AgentCorp 不声称任何 SWE-bench 分数。
- 独立评审会消耗真实的 token 和时间。用 `effort:` 把成本花在犯错代价高昂的地方。
- AgentCorp 有意不设前端角色，也不负责 merge/push。前端工作需要明确豁免，
  分支是否落地仍由你控制。
- 校验器与轨迹提取器需要 Python 3.9+，且只使用标准库。

## 文档

- [全部 38 项技能](docs/skills_CN.md)
- [参数与 effort 档位](docs/parameters_CN.md)
- [运行时产物](docs/artifacts_CN.md)
- [Codex 配置](docs/codex-setup_CN.md)

问题与缺陷请提交到 [GitHub Issues](https://github.com/ylxmf2005/AgentCorp/issues)。
