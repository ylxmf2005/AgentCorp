# Implementation Story Spec 评审参考

评审一份准备进入实现的 Implementation Story Spec 时用这份参考。它要让你能信任：工程师拿到它就能动手，而不必去倒推任何缺失的决策。

判断它是否成立，看这些方面：

- 它该有的部分都在并且言之有物——Story、Source Context、Acceptance Criteria、Tasks / Subtasks、Implementation Constraints、Verification Expectations、Review Focus、Status。
- 每条 acceptance criterion 都可观察，并能追溯到需求或设计/测试上下文。
- 每个 task/subtask 都绑定到验收标准，或在有用之处绑定到明确的技术护栏。
- 目标模块/文件具体到足以支撑第一遍实现。
- Implementation Constraints 涵盖架构/设计约束、既有代码上下文、接口/契约、forbidden zone，以及实现所需的引用。
- 增强/缺陷类 story 写明了必须保留的既有行为。
- 公共接口、数据 schema、auth/authz、可靠性、性能、安全等风险，在相关时被显式抛给专项评审。
- Verification Expectations 要么可由 Implementation Engineer 执行，要么清晰地委派给 Test Leader/tester。
- 这份计划不会逼着 Implementation Engineer 去推断缺失的架构、臆造 scope，或选择未经批准的依赖。

据此下判断：task 含糊、缺验收标准、缺设计约束、目标模糊、接口改动未经评审、缺陷修复缺回归判据，或验证要求既无法执行也无法委派——这些都该 `request_changes`。当需求、TestPlan、diagnosis 证据、代码上下文或专项评审缺失、但一旦补上就能验证这份 Story Spec 时，用 `needs_more_evidence`。
