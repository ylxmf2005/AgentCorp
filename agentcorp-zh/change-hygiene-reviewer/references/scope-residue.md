# 范围残留 Review

仅在以下场景加载：多 commit 的 feature branch、中途发生变更的需求、用户怀疑早期实现有误、public/shared contract 被顺带修改、compatibility entry point 被废弃、fallback 行为发生变化，或者某个 hunk“虽然有解释，但看起来不是当前需求所必需的”。

## 核心原则

当前 branch 的历史不能证明用户的真实意图。早期的 commit 可能源于模糊的需求、错误的假设或探索性的补丁；如果一次 review 只顺着历史记录去解释，很容易把残留代码当成既定事实。

默认要问自己：**如果今天从零开始，只基于当前已批准的需求 / Story Spec / contracts 来实现，你还会改这里吗？**

如果答案不是明确的“yes”，就不要默默放过：

- 如果你能证明某部分不是当前需求所必需的，报 `scope-residue`。
- 如果某部分看似合理，但缺少 source artifact 支撑，报 `intent-trace-gap` 或 `needs_human_intent`。
- 如果某部分修改了 public/shared contract、compatibility entry point、error semantics，或者 caching/persistence key，报 `contract-drift`，除非该 contract 已明确授权。

## 确定 Review 范围

先列出 diff 中的语义变更，而不是只列文件：

- public/shared API、request/response schema、字段是否为 required/deprecated、error code 或 error-message semantics。
- cache key、persistence key、lookup priority、fallback、default value。
- permission/admin check 位于哪一层、何时触发。
- handler/service/model 边界变动。
- 新增的 compatibility shim、dual entry point、deprecation warning、旧 entry point 的迁移或移除。
- 与当前需求无关、但被一并改动的 behavior branch。

为每个语义变更建立一条单行追溯：

`change -> source artifact -> why required -> compatibility impact -> action`

这里的 source artifact 可以是需求文档、Story Spec、api-contract、诊断结论、review finding、test failure，或明确的用户指令。找不到 source artifact 不是小事；这正是该角色要捕捉的缺口。

## 判断问题

对每一项追问：

- **当前需求真的需要它吗？** 不是“能不能解释得通”，而是它是否能从已批准的 source artifact 中自然推导出来。
- **从零开始还会这么做吗？** 如果从干净的基线实现这个需求根本碰不到它，那它就更像残留。
- **删掉或 revert 它会破坏验收标准吗？** 如果不会，那更倾向于 revert 或拆出去。
- **它改动了已有的 caller contract 吗？** 未经明确授权就修改 public/shared contract，默认是 blocking 的。
- **它只是为了掩盖历史错误的 compatibility patch 吗？** 如果 compatibility 只是为了迁就早期的错误改动，那应该 revert 那个错误，而不是留着 compatibility 层。
- **它应该单独提一个 MR 吗？** 合理但不是当前需求必须的清理、分层整理或迁移，都应该拆出去。

## 常见发现

- **早期假设残留**：某个早期 commit 针对某个 model/field/flow 做了修改，后来方向变了，但后续实现一直在迁就它。
- **范围外的 contract drift**：某个 field 被 deprecated、某个 entry point 被移除、fallback 顺序被调整，或者 error semantics 被修改，但当前需求根本没要求这些。
- **在历史错误上打补丁**：为了避免 revert 早期错误，不断新增 compatibility、warning 或 dual path，导致 branch 一直背着这个错误。
- **顺手的架构整理混入了行为变更**：分层调整本身合理，但偷偷带进了 calling-contract 的变动。
- **Review 可追溯性不足**：实现结果或 diff 描述没有列明 behavior change 的来源，让 reviewer 自己去脑补。

## 输出要求

每条发现需包含：

- Severity：破坏 compatibility 或修改 public/shared contract 通常是 P1/P2；纯建议拆出的通常是 P3。
- Confidence：high/medium/low；如果取决于用户意图，标记为 `needs_human_intent`。
- Evidence：文件/行号或 hunk、你查阅的 source artifact、缺失的追溯链。
- Impact：为什么它会污染当前 MR、误导 reviewer，或降低后续成功的概率。
- Recommendation：revert、delete、拆分 MR/commit、保留但补充明确授权，或让原作者决定。

不要仅仅因为某处改动“看起来合理”就放过它。合理但无法追溯到当前需求的变更，依然是一个 change hygiene 问题。
