# AgentCorp

[English](README.md) | **中文**

AgentCorp 是一套以 **Agent Skills** 形式打包的多 agent 软件交付流水线。一个 Delivery
Orchestrator(交付编排者)对任务分类,并把每个 phase 路由给专门的角色——规划、实现、
多个**独立**的代码评审、以及分层验证——phase 之间设有明确的 gate。

整套 skill 采用 [Agent Skills](https://agentskills.io) 的 `SKILL.md` 标准,因此同一份
skill 可以从这一个仓库同时安装到 **Claude Code** 和 **Codex**。

## 工作流

AgentCorp 建模的是一个交付*组织*,而不是单条 prompt。Delivery Orchestrator 把每个任务
分到四种范式之一——`dev/architecture-first`、`enhancement/delta-design`、
`bugfix/hypothesis-driven`、`addition/simple`——再按分阶段的生命周期推进,其中**产物的
作者绝不审批自己的产物**。

### 1. 交付生命周期

每种范式都跑同一组 phase 的一个子集。评审 phase(红色)和人工 gate(黄色)夹在工作
phase 之间;`要求修改` / `驳回` 会回退。

![交付生命周期](docs/diagrams/01-lifecycle.png)

### 2. 角色

每个 phase 由专门的 skill 负责。评审角色与它评判的工作保持独立;编排者不审批自己的产出。

![角色](docs/diagrams/02-roles.png)

### 3. review → research → fix 主脊

AgentCorp 的招牌:code-review 的 findings 绝不盲目修。一个独立的 `review-researcher`
先逐条复核每个 finding——一个掐掉误报的断路器——确认后才落地修复。修复再按文件归属并行
切分,两个 worker 不会碰同一个文件。

![review 到 research 到 fix 主脊](docs/diagrams/03-review-research-fix.png)

### 4. Handoff 与 gate

被委派的 phase 通过 assignment/receipt 文件流转。每份 receipt 先做*机械校验*(产物是否
存在、路径 / author / phase 是否对得上),通过后才按该 phase 的*质量 gate* 判断——两者分开。

![Handoff 与 gate](docs/diagrams/04-handoff.png)

### Workflow modes

| Mode | 默认 | 如何运作 | 何时 |
|------|------|---------|------|
| `single-agent` | 是 | 编排者亲自跑非 review phase;review 仍委派 | 常规 / 中小任务——也是 Codex 上唯一的 mode |
| `subagents` | 否 | 每个 phase 都经 assignment/receipt 委派给 owner | 大型或可并行的工作,或需要独立 authorship 时(仅 Claude Code) |

## 安装 — Claude Code

```
/plugin marketplace add ylxmf2005/AgentCorp
/plugin install agentcorp@agentcorp
```

然后 `/reload-plugins`(或重启 Claude Code)。skill 在插件下带命名空间,例如
`/agentcorp:delivery-orchestrator`、`/agentcorp:code-review-lead`。

## 安装 — Codex

**整套(插件):**

```
codex plugin marketplace add ylxmf2005/AgentCorp
```

然后启动 Codex,在 `/plugins` 菜单里启用 **AgentCorp**,重启以加载 skill。

**单个 skill(更轻,不走插件):** 在 Codex 里让内置 installer 装,例如

```
use skill-installer to install the skill at repo ylxmf2005/AgentCorp path agentcorp/delivery-orchestrator
```

这会把 skill 装到 `~/.codex/skills/`。

### Codex 说明:单 agent workflow

Codex 没有 subagent。编排者**默认走 single-agent workflow**——它亲自跑每个非 review
phase,同时仍把评审委派给独立的 review 角色——所以这套 skill 在 Codex 上开箱即用。
**subagents workflow**(并行 fan-out 到被派的 agent)是 Claude Code 专属增强,在 Codex
上不可用。

## 包含哪些 skill

覆盖完整流水线的 26 个 skill:

- **编排** — `delivery-orchestrator`
- **规划与设计** — `solution-architect`、`implementation-planner`、`test-planner`、`sota-researcher`
- **实现** — `implementation-engineer`、`review-fixer`
- **计划 / 测试计划评审** — `plan-review-lead`、`test-plan-reviewer`、`adversarial-reviewer`
- **代码评审** — `code-review-lead`,以及专项 reviewer:`correctness-reviewer`、`security-reviewer`、`performance-reviewer`、`reliability-reviewer`、`simplicity-reviewer`、`standards-reviewer`、`api-contract-reviewer`
- **验证** — `test-leader`、`e2e-tester`、`api-contract-tester`、`regression-tester`
- **评审研究与验收** — `review-researcher`、`acceptance-review-lead`
- **支撑** — `change-detailed-walker`、`fresh-start-handoff`

每个 skill 的完整描述见各自的 `agentcorp/<skill>/SKILL.md`,也会显示在 Claude Code /
Codex 的 skill 选择器里。

## 目录结构与维护

| 路径 | 作用 |
|------|------|
| `agentcorp/<skill>/SKILL.md` | skill 本体——**单一源**,两个工具共用 |
| `.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json` | Claude Code 清单——**canonical 元数据** |
| `.codex-plugin/plugin.json`、`.agents/plugins/marketplace.json` | Codex 清单——**自动生成** |
| `tools/codex-interface.json` | Codex 专属品牌/policy(Claude 无对应) |
| `tools/sync-codex.py` | 从 Claude 清单重新生成 Codex 清单 |

两个生态都把各自的 `skills` 字段指向同一个 `./agentcorp` 目录并自动发现 skill 文件夹——
没有重复的 skill 内容。要改元数据:编辑 Claude 清单(以及 Codex 品牌用的
`tools/codex-interface.json`),然后运行:

```
python3 tools/sync-codex.py
```
