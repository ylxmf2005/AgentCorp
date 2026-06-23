# Proposal Paths

仅在模式 2：多方案提案中加载本 reference。

下面的 proposal lenses 不是新的 AgentCorp 角色。它们是从 AgentCorp 现有职责、phase gate 和 artifact 要求中提炼出的需求塑形视角。不要把它们说成可以 dispatch 的 agent。它们只用于生成 sponsor 可以选择的需求路径。

## AgentCorp Proposal Lenses

按当前模糊点选择 2-4 个 lens。

- **最小变更 lens** —— 塑造能满足 sponsor intent 的最小安全需求集，同时尽量保留现有行为。来源于 AgentCorp 的 scope control 和 change-hygiene 纪律。
- **已验证旅程 lens** —— 优先明确目标用户/系统 actor、可观察旅程、成功标准和非目标。来源于 `validate-requirements`。
- **文档/Onboarding lens** —— 判断 sponsor 目标是否可以先通过文档、示例、模板、可发现性或 handoff 清晰度达成，而不是立刻改产品/代码。只有它确实是候选路径时才使用，不要凑数。
- **设计边界 lens** —— 只有在局部行为变更站不住时，才提出调整边界、契约、数据/状态流或架构。来源于 Solution Architect 职责。
- **验证风险 lens** —— 倾向选择证明路径最清楚、隐藏回归风险最低的方案。来源于 Test Planner、Test Leader 和 acceptance evidence 要求。
- **先研究 lens** —— 当外部事实、已有实践、客户行为或代码未知项决定需求时，先推迟承诺。来源于 Parallel Researcher 和 Review Researcher 的证据纪律。
- **交付范围 lens** —— 围绕 AgentCorp 在本任务中能干净交付什么来塑形：phase 数量、artifact 负担、review gate 和残余风险。来源于 Delivery Orchestrator ownership。

如果某个 lens 对当前任务没有带来实质不同，不要使用。两个只差措辞的路径其实是同一个路径。

## 每个路径必须包含

每个 proposed path 必须包含：

- **名称** —— 短且具体；不要用角色名，除非它是在命名 lens。
- **使用的 lens** —— 使用上面的 AgentCorp proposal lens。
- **变化是什么** —— 可观察的用户/系统行为，不写实现机制。
- **目标 actor 和旅程** —— 谁经历这个变化，以及怎样达到成功。
- **Must-haves** —— 如果选择此路径，会写进 validated requirements 的需求。
- **MVP 边界 / 非目标** —— 此路径有意排除什么。
- **验收信号** —— 什么证据能证明此路径成功。
- **主要风险或取舍** —— 成本、损失的收益、模糊点或验证风险。
- **为什么选择它** —— 什么情况下 sponsor 应该选这条路。

## 推荐规则

展示路径后，推荐一个。允许 hybrid，但必须满足：

- hybrid 只使用已经在 proposed paths 中展示过的部分
- sponsor 能看懂组合了什么、放弃了什么
- hybrid 仍然有清楚的 MVP 边界和验收信号

Sponsor 选择一个路径或明确授权 hybrid 之前，不要从多个路径混写 validated requirements。
