---
name: brainstorm
description: "当 AgentCorp 需要通用头脑风暴能力来澄清、拷问或重塑需求时使用，尤其是在 Delivery Orchestrator 的 validate-requirements 阶段，如果 sponsor 意图、成功标准、范围、用户旅程或方案方向还不清楚，就使用它。"
---

# Brainstorm

这是 AgentCorp 的通用思考能力，不是交付 phase，也不是带独立 gate 的角色。它的地位类似 `authenticated-browser-session`：任何角色在需要这种行为时都可以加载，但主要使用场景是 `delivery-orchestrator` 的 `validate-requirements`。

目标是把不清楚的 request 变成经 sponsor 确认、可观察、可验证的需求。Brainstorm 期间不要实现、不要做架构计划、不要写下游 artifact。结果应回填到所属 phase 的 artifact，通常是 `requirements/validated-requirements.md`。

## 运行原则

- **先验证意图，再确定形状。** 保留 sponsor 的关键原话，但要挖出背后的问题、目标用户、成功信号和非目标。
- **缺信息时逐个问，方向未定时比较方案。** 缺事实就用聚焦追问；多种方向都合理时，就给完整备选方案。
- **事实判断要落地。** 如果答案依赖 repo 行为、产品文档、历史任务或 clone 下来的参考项目，先看证据再下结论。
- **温和但认真地 grill。** 压力测试问题真实性、用户价值、范围、风险和更简单的方案，但不要把 sponsor 变成被审讯对象。
- **提出的每个选项都必须可用。** 只要把某个选项摆给 sponsor，就要让它具体到可以选择、修改或拒绝。
- **保持需求和实现边界。** Brainstorm 产品行为、旅程、成功标准和范围。表、模块、API、算法留给设计阶段，除非本次 brainstorm 明确就是技术选择。

## 选择一种模式

### 模式 1：逐个追问

当方向大体清楚，但缺一两个关键信息会让需求 confidence 从 LOW 变成 MEDIUM/HIGH 时使用。

每轮只问一个最关键的问题。优先问能解锁 validated requirements 的问题：

- 谁是主要用户或系统 actor？
- 成功时必须能观察到什么？
- 哪些明确不在范围内？
- 我们要替换当前什么行为、workaround 或失败模式？
- Sponsor 愿意接受哪种风险或取舍？
- 什么情况会让这件事不值得做？

每得到一个回答，就更新内部需求图景。当剩余不确定性可以作为 assumption/open question 记录、且不会改变方向时停止追问。如果下一个缺口仍会阻塞设计或测试计划，就继续问一个问题，或返回 `blocked`。

### 模式 2：多方案提案

当 sponsor 的 request 指向了目标但没有给出形状，或多个合理形状会导向不同 validated requirements 时使用。此模式下，提出 2-4 个完整路径，并让 sponsor 选择一个。

详细规则加载 `references/proposal-paths.md`。简版：使用 AgentCorp proposal lenses，不要发明新角色。每个路径都必须完整到 sponsor 可以选择、修改或拒绝；最终推荐只能使用已经在路径中展示过的材料。

## Grounding

强事实判断前，先看最小必要证据：

- 本地标准和上下文：`AGENTS.md`、`README*`、`STRATEGY.md`、`CONCEPTS.md`
- AgentCorp 历史 artifact：`teamspace/tasks/`、`teamspace/learnings/`、历史 requirements、plans、reviews
- 当有无某个能力会改变需求时，阅读相关产品文档或代码
- 只有 sponsor 要求，或决策依赖当前/第三方事实时，才查外部资料

研究外部仓库时，clone 到 `/tmp` 等临时位置，只作为证据阅读；除非 sponsor 明确授权，否则不要运行对方仓库里的脚本或 setup 命令。

## Grill 镜头

只用适合当前问题的镜头，不要把整张清单甩给 sponsor。需要更深入压力测试时，加载 `references/grill-lenses.md`。

## 回填到 AgentCorp

向所属 phase 返回简洁 synthesis：

- 已选方向或路径
- 使用 sponsor 语言表达的 sponsor intent
- 目标用户 / actor
- 可观察的旅程和成功标准
- must-have requirements
- 非目标和 MVP 边界
- assumptions 与 open questions
- 已查看的证据

对 `validate-requirements` 来说，这份 synthesis 不是单独 gate。Delivery Orchestrator 要把它写进 validated requirements artifact，并且仍然需要 sponsor 的 human confirmation，requirements gate 才能通过。

## 角色集成

- **Delivery Orchestrator**：在 `validate-requirements` 中，confidence 为 LOW 或仍有多个形状时使用。缺事实用模式 1；方向未定用模式 2。
- **Solution Architect**：只用它澄清产品意图，再进入设计；不能用它绕过 validated requirements。
- **Test Planner / Test Leader**：只有当成功标准或用户旅程模糊到无法测试时使用；澄清结果要回写到需求 artifact。
- **Review roles**：评审阶段不要重新打开需求，除非 artifact 模糊到阻塞评审；这种情况报告为 `needs_more_evidence`。
