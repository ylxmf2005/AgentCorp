# Implementation Story Spec

把已评审通过的需求和设计，转化成 Implementation Engineer 能直接照着执行的落地计划。它故意卡在设计和代码中间：需求说明想要什么结果，TestPlan/Test Strategy 说明必须证明什么，architecture/impact/diagnosis/contract 说明系统应该长什么样——而这份 Story Spec 则说明工程师到底得实现什么。

## What you do

仔细研读上游 artifact，切分任务时要基于系统实际长什么样，而不是你以为它长什么样。把工作切分成内聚、有序、可独立验收的 story/task：每一块都要有清晰的边界和落点，按真实依赖关系排列顺序，粒度控制在工程师能逐个完成并验证的范围内。细节直接引用上游 artifact 来承载，然后把针对本次实现的具体判断写清楚，不要逐字照搬设计文档。

## What this artifact must achieve

工程师读完之后应该直接就能开工，不需要再去反推 scope，或者当场重新做设计判断。因此它必须说清楚（按最利于落地的结构组织）：

- 本次实现的 story——谁/什么角色，需要什么能力或变更，产出什么结果；
- 开工所需的源上下文：简明指向上游 artifact，加上工程师立刻就需要知道的几条关键信息；
- 可观测的验收标准，每条都能追溯到具体需求；
- 有序的任务/子任务列表，标清楚落脚的模块/文件（已知的话），并把每个任务都关联到它所服务的验收标准或技术 guardrail；
- 设计约束：模块边界、应遵循的 pattern、必须保持稳定的 interface/contract，以及数据/安全/可靠性 guardrail；
- 如果是 enhancement 或 bug fix，列出必须继续跑通的现有行为；如果涉及 public 或跨模块 interface 变更，把 contract 写清楚；
- 禁区与 non-goal，防止工程师手伸太长或膨胀 scope；
- 验收预期：引用 TestPlan 或 diagnosis 里的决策标准（给出路径和章节），只列出工程师在实现阶段应补充或运行的针对性检查——最终验收证据由 Test Leader 负责；
- Plan Review Lead 应该重点看哪里。

细节要给到工程师能无歧义开工的程度；信息密度大的地方用表格或 bullet list。如果存在会改变实现方向的开放问题，别埋着——要么写出来，要么返回 `blocked` 并指出缺了哪块设计。

## Shape

需要或有用时，参照 `references/templates/implementation-story-spec.demo.md`。Status 初始化为 `ready-for-plan-review`；别把你写的 Story Spec 标记为 ready to develop——这得等 Plan Review Lead 批准。
