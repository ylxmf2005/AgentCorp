<div align="center">

# AgentCorp

AgentCorp 是一套运行于 Claude Code 与 Codex 的角色化软件交付系统。它把需求、规划、实现、
独立评审、验证和验收交给职责不同的角色，并在需要方向、取舍与风险判断时让人参与。

AgentCorp 不只交付最终结果，也保留结果形成的过程：任务目标、关键决定、阶段负责人、
实际检查和未解决的问题。

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

直接把工作交给对应技能。端到端任务由 Delivery Orchestrator 自己判断工作流参数；
单独评审时，由 Code Review Lead 根据 diff 和风险自己判断深度：

```text
/agentcorp:delivery-orchestrator <your prompt>
/agentcorp:code-review-lead <your prompt>
```

只有在你需要明确控制时才要写参数；默认让技能根据任务、仓库与风险面自行判断。

## 为什么选择 AgentCorp

编程 Agent 写代码很快，难的是判断它的结果是否真的值得交付。一次普通对话往往把作者、
评审者和测试者折叠进同一个上下文，自信的结论很容易被当成证据。

AgentCorp 拆开这些职责，并让交接过程可以检查：

| 常见的 Agent 工作方式 | AgentCorp |
| --- | --- |
| Agent 写完改动，再评价自己的工作 | 工作流把作者与批准者分开 |
| 人只在最后看到一份答案 | 发起人参与塑造意图、可在已记录门禁改道，并保留范围与残余风险的决定权 |
| 一条评审发现直接变成修复 | 工作流要求 `review-researcher` 先把它当作可能的误报重新证实 |
| 「测试通过」就是故事的结尾 | 每个结论都指向可打开的路径、日志、响应或截图 |
| 空值检查与系统迁移走同一套流程 | 简单改动走精简流程；高风险任务增加独立角色、评审与验证 |
| 会话结束，教训也随之消失 | `compound` 把教训变成测试、仓库规则或 reviewer 提案 |

AgentCorp 不是新的 coding model、Agent runtime 或提示词合集，而是一套带契约的交付组织：
谁产出每份材料、谁有权批准，以及工作继续推进前必须先存在哪些证据。

## 最终会留下什么

经过编排的任务按设计会留下可导航的记录。完整布局把跨任务知识与每项任务的决策、
证据放在一起：

```text
teamspace/
├── testing-context.md                   # 跨任务运行与测试事实
├── compound/                            # 历史任务沉淀的可复用经验
│   └── <lesson>.md
├── knowledge/                           # 可复用研究快照
│   └── <technology>/INDEX.md
├── probes/                              # 独立的领域探查报告
│   └── <date>-<topic>.md
├── walkthroughs/                        # 独立的教学产物
│   └── <change>.html
└── tasks/<task>/
    ├── task.md                          # 成功标准、路径、决策和门禁历史
    ├── manifest.md                      # 阶段、owner、质量门、产物、receipt
    ├── probe/
    │   └── 00-probe.md                  # 未知项与被纠正的假设
    ├── handoffs/                        # 委派任务与回执
    │   ├── <phase>.md
    │   └── <phase>-receipt.md
    ├── requirements/
    │   └── validated-requirements.md
    ├── design/
    │   ├── architecture.md
    │   ├── impact-analysis.md
    │   ├── diagnosis.md
    │   └── interface-contract.md
    ├── test/
    │   ├── test-plan.md
    │   ├── api-test-plan.md
    │   ├── e2e-test-plan.md
    │   ├── regression-test-plan.md
    │   ├── test-plan-review.md
    │   └── exploration/
    │       ├── charters.md
    │       ├── frontier.md
    │       └── journal.md
    ├── implementation/
    │   ├── implementation-story.md
    │   └── implementation-result.md
    ├── review/
    │   ├── plan-review.md
    │   ├── plan-review-findings/
    │   ├── code-review.md
    │   ├── specialist-findings/
    │   │   └── <reviewer>.md
    │   ├── research/
    │   │   ├── 00-index.md              # 每条发现都会被重新核实
    │   │   ├── 001-confirmed-....md
    │   │   └── 002-false-positive-....md
    │   ├── fix-records/
    │   │   └── <file-group>.md
    │   └── fix-result.md
    ├── research/<topic>/                # 需要动手验证的研究包
    │   ├── 00-report.md
    │   ├── env/
    │   ├── sources/
    │   └── experiments/
    ├── explain/                         # 持久化的决策解释
    │   └── <topic>/
    │       ├── 00-index.md
    │       └── 001-context.md
    ├── walkthrough/
    │   └── <change>.html                # 背景、直觉、故事、测验
    ├── verification/
    │   ├── assignments/
    │   │   └── <tester>.md
    │   ├── test-results/
    │   │   └── <tester>.md
    │   └── verification-report.md
    ├── acceptance/
    │   ├── acceptance-package.md
    │   └── acceptance-decision.md
    ├── compound/
    │   └── compound-result.md
    └── delivery/
        └── delivery-report.md
```

不是每项任务都会创建所有可选文件，但每个实际运行的阶段都有明确归属。阶段产物带结构化
frontmatter；委派交接的声明在进入审计记录前先经过机械校验。完整结构见
[运行时产物说明](docs/artifacts_CN.md)。

## 如何运转

[![AgentCorp 交付流程](docs/assets/delivery-workflow.png)](docs/assets/delivery-workflow.excalidraw)

给 AgentCorp 一个任务后，Delivery Orchestrator 不会立即把它交给 coding agent，而是先确认
要解决什么、怎样算完成，以及哪里最容易出错。面对陌生领域，`probe` 会调查真实代码、
测试和已有约束，找出尚未暴露的盲区；方向还没有确定时，`brainstorm` 会提出几条具体路径，
由你比较和选择。

方向确定后，Test Planner、Solution Architect 和 Implementation Engineer 分别推进测试规划、
设计与实现。实现完成后，Code Review Lead 会根据改动涉及的风险召集相应的专项 reviewer，
而不是让实现者评价自己的工作。

评审发现也不会直接变成修复任务。Review Researcher 会重新检查每项发现，区分真实缺陷、
部分成立、误报和需要人判断的问题；只有经过确认并决定在当前任务处理的项目，才会交给
Review Fixer。修复完成后还要重新评审，避免“修复了评审意见”被直接等同于“问题已经解决”。

最后，Test Leader 根据任务风险组织 API、E2E、回归或其他必要验证，Acceptance Review Lead 再把
实际证据对应回最初目标。整个过程中，你可以在需求方向、设计取舍、评审争议和剩余风险等节点
参与决定，也可以通过 `explain` 或 `walkthrough` 先理解改动再作判断。

任务结束后，AgentCorp 会保留任务目标、关键决定、阶段负责人、评审结论、实际检查和未解决的问题，
让最终结果不仅可以使用，也能被检查、追溯和继续接手。

## 按风险调节流程

四个相互独立的旋钮控制一次交付：

| 旋钮 | 取值 | 控制什么 |
| --- | --- | --- |
| `mode:` | `direct` \| `partial` \| `full` | 谁执行各阶段、谁负责评审 |
| `interaction:` | `auto` \| `gate` | 跳过可选人工暂停，或在每道人工门禁停下 |
| `effort:` | `low` \| `medium` \| `high` \| `max` | 召集多少独立覆盖与冗余 |
| `lang:` | 任意语言 | 所有面向人的产物使用什么语言 |

低 effort 用冗余换速度，但绝不拿证据换方便。遇到安全、权限、公开契约和数据丢失风险时，
工作流要求相关阶段接受更深的审查。每一档和每个技能的准确行为见[参数目录](docs/parameters_CN.md)。

## 文档

- [全部 38 项技能](docs/skills_CN.md)
- [参数与 effort 档位](docs/parameters_CN.md)
- [运行时产物](docs/artifacts_CN.md)
- [Codex 配置](docs/codex-setup_CN.md)

问题与缺陷请提交到 [GitHub Issues](https://github.com/ylxmf2005/AgentCorp/issues)。
