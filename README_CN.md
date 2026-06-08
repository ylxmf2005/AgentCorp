# AgentCorp

[English](README.md) | **简体中文**

AgentCorp 是一套以 **Agent Skills** 形式打包的多 agent 软件交付流水线。Delivery
Orchestrator(交付编排者)对每个任务分类,把各阶段路由给专门的角色——规划、实现、独立的
代码评审、分层验证,并在阶段之间设置明确的 gate。

基于 [Agent Skills](https://agentskills.io) 的 `SKILL.md` 标准,因此同一套 skill 可从
这一个仓库同时安装到 **Claude Code** 与 **Codex**。

## 特性

- 26 个专职 skill 覆盖完整交付流程:需求、测试计划、设计、实现、代码评审、验证、验收、交付。
- 作者与评审分离:产物的作者不评审、不审批自己的产物。
- 独立复核:代码评审的 finding 在修复前由独立角色逐条复核,排除误报。
- 并行修复:修复按文件归属切分,互不重叠地并行执行。
- 结构化产物:每个阶段输出带 YAML frontmatter 的 Markdown,形成可追溯的记录。
- 一套源码、双工具安装:基于 Agent Skills 标准,同时支持 Claude Code 与 Codex,且不重复内容。

## 工作流程

编排者把每个任务归类为四种范式之一——`dev/architecture-first`、`enhancement/delta-design`、
`bugfix/hypothesis-driven`、`addition/simple`——并按分阶段的生命周期推进;产物的作者不
审批自己的产物。

### 1. 交付生命周期

每种范式运行同一组阶段的一个子集。评审阶段(红色)与人工 gate(黄色)位于工作阶段之间;
`要求修改` 与 `驳回` 会把工作退回前序阶段。

![交付生命周期](docs/diagrams/01-lifecycle.png)

### 2. 角色

每个阶段由专门的 skill 负责。评审角色与其评判的工作相互独立,编排者不审批自己的产物。

![角色](docs/diagrams/02-roles.png)

### 3. 评审 → 复核 → 修复

代码评审的 finding 不会被直接修复。先由独立的 `review-researcher` 逐条复核,排除误报;
确认成立的问题再进入修复。修复按文件归属切分并行执行,不会有两个 worker 改动同一文件。

![评审、复核与修复](docs/diagrams/03-review-research-fix.png)

### 4. Handoff 与 gate

被委派的阶段通过 assignment/receipt 文件流转。每份 receipt 先做机械校验(产物是否存在,
路径、author、phase 是否一致),通过后再按该阶段的 quality gate 判断——两项检查相互独立。

![Handoff 与 gate](docs/diagrams/04-handoff.png)

### 运行模式

| 模式 | 默认 | 运作方式 | 适用场景 |
|------|------|---------|---------|
| `single-agent` | 是 | 编排者亲自执行非评审阶段,评审仍委派出去 | 常规的中小型任务 |
| `subagents` | 否 | 每个阶段都通过 assignment/receipt 委派给对应 owner | 大型或可并行的工作,或需要独立 authorship 时 |

## 运行产物

每个阶段都会把一份带 YAML frontmatter 的 Markdown 产物写到固定路径,因此一个完成的任务
会留下可追溯、可复查的完整记录。被委派的阶段使用 **assignment → receipt** 成对流转;每份
receipt 先经机械校验(`validate-handoff.py`——产物是否存在,路径、author、phase 是否一致)
再过 quality gate,`manifest.md` 记录每个阶段、owner、gate 结果与产物路径。

所有产物都位于工作目录下的 `teamspace/`。它是本地协调状态,不会被提交(若出现在 git
status 中,可加入 `.git/info/exclude`);只创建任务需要的子目录。

```text
teamspace/tasks/<task_id>/
├── task.md                       # 目标、任务分类、gate 历史
├── manifest.md                   # 索引:phase · owner · gate · 产物路径
├── handoffs/                     # assignment + receipt 成对(委派的阶段)
│   ├── 001-validate-requirements.md
│   └── 001-validate-requirements-receipt.md
├── requirements/
│   └── validated-requirements.md
├── test/
│   ├── test-plan.md
│   └── test-plan-review.md
├── design/                       # 按范式四选一
│   └── architecture.md | impact-analysis.md | diagnosis.md | api-contract.md
├── implementation/
│   ├── implementation-story.md
│   └── implementation-result.md
├── review/
│   ├── plan-review.md
│   ├── code-review.md
│   ├── specialist-findings/
│   ├── research/                 # review-researcher:逐条 finding 一文件 + 索引
│   │   ├── 00-index.md
│   │   └── <编号>-<slug>.md
│   ├── fix-result.md
│   └── fix-records/              # 每个并行 review-fixer 组一份
├── verification/
│   ├── assignments/
│   ├── test-results/
│   └── verification-report.md
├── acceptance/
│   ├── acceptance-package.md
│   └── acceptance-decision.md
└── delivery/
    └── delivery-report.md
```

## 安装 — Claude Code

```
/plugin marketplace add ylxmf2005/AgentCorp
/plugin install agentcorp@agentcorp
```

随后运行 `/reload-plugins`(或重启 Claude Code)。skill 在插件下带命名空间,例如
`/agentcorp:delivery-orchestrator`、`/agentcorp:code-review-lead`。

## 安装 — Codex

整套(插件):

```
codex plugin marketplace add ylxmf2005/AgentCorp
```

随后启动 Codex,在 `/plugins` 菜单中启用 **AgentCorp** 并重启以加载 skill。

单个 skill(不使用插件)——在 Codex 中调用内置 installer:

```
use skill-installer to install the skill at repo ylxmf2005/AgentCorp path agentcorp/delivery-orchestrator
```

这会把 skill 安装到 `~/.codex/skills/`。

## 技能列表

完整流水线包含 26 个 skill:

- **编排** — `delivery-orchestrator`
- **规划与设计** — `solution-architect`、`implementation-planner`、`test-planner`、`sota-researcher`
- **实现** — `implementation-engineer`、`review-fixer`
- **计划与测试计划评审** — `plan-review-lead`、`test-plan-reviewer`、`adversarial-reviewer`
- **代码评审** — `code-review-lead`,以及专项 reviewer `correctness-reviewer`、`security-reviewer`、`performance-reviewer`、`reliability-reviewer`、`simplicity-reviewer`、`standards-reviewer`、`api-contract-reviewer`
- **验证** — `test-leader`、`e2e-tester`、`api-contract-tester`、`regression-tester`
- **复核与验收** — `review-researcher`、`acceptance-review-lead`
- **支撑** — `change-detailed-walker`、`fresh-start-handoff`

每个 skill 的完整描述见各自的 `agentcorp/<skill>/SKILL.md`,也会显示在 Claude Code 与
Codex 的 skill 选择器中。

## 目录结构

| 路径 | 作用 |
|------|------|
| `agentcorp/<skill>/SKILL.md` | skill 本体——单一源,两个工具共用 |
| `.claude-plugin/plugin.json`、`.claude-plugin/marketplace.json` | Claude Code 清单(canonical 元数据) |
| `.codex-plugin/plugin.json`、`.agents/plugins/marketplace.json` | Codex 清单(自动生成) |
| `tools/codex-interface.json` | Codex 专属的展示与 policy 元数据 |
| `tools/sync-codex.py` | 从 Claude 清单重新生成 Codex 清单 |
| `docs/diagrams/` | 工作流程图(`.drawio` 源文件与 `.png` 导出) |

两个工具都把各自的 `skills` 字段指向 `./agentcorp` 并自动发现 skill 文件夹,因此不存在
重复内容。如需修改元数据,编辑 Claude 清单(以及用于 Codex 展示的
`tools/codex-interface.json`),然后运行:

```
python3 tools/sync-codex.py
```
