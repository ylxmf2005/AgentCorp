# Implementation Story Spec review 参考

在 review 一份即将进入 implementation phase 的 Implementation Story Spec 时，使用本文档。它必须能让你确信，engineer 可以直接基于它开始构建，而无需去反推任何缺失的决策。

要判断它是否站得住脚，可以从以下几个方面来看：

- 应包含的组成部分必须齐全且内容充实 — Story、Source Context、Acceptance Criteria、Tasks / Subtasks、Implementation Constraints、Verification Expectations、Review Focus、Status。
- 每条 Acceptance Criterion 都必须是可观察的，并且能追溯到某个 requirement 或 design / test 上下文。
- 每个 Task / Subtask 都必须绑定到一条 Acceptance Criterion，或在必要时绑定到明确的技术 guardrail。
- 目标 module / file 必须足够具体，能支撑第一轮的 implementation pass。
- Implementation Constraints 必须涵盖 architecture / design constraint、existing-code 上下文、interface / contract、forbidden zone，以及 implementation 所需的参考资料。
- Enhancement / defect story 必须明确写出必须保留的现有行为。
- 涉及 public interface、data schema、auth / authz、reliability、performance 和 security 的风险，必须在相关场景下明确 handoff 给 specialist review。
- Verification Expectations 必须要么可由 Implementation Engineer 执行，要么明确 delegate 给 Test Leader / tester。
- 计划不能迫使 Implementation Engineer 去推测缺失的 architecture、凭空发明 scope，或选择未经批准的 dependency。

按以下原则做出判断：task 含糊、acceptance criteria 缺失、design constraint 缺失、目标模糊、未经 review 的 interface 变更、defect fix 缺少 regression criteria，或者 verification expectations 既无法执行也无法 delegate —— 这些情况一律给 `request_changes`。如果 requirements、TestPlan、diagnosis evidence、code 上下文或 specialist review 暂时缺失，但补充后就能让你 validate 这份 Story Spec，则使用 `needs_more_evidence`。
