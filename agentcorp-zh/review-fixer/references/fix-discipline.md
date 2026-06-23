# Single-group landing: 执行细节

本文档是 `review-fixer` 的本地参考：作为 single fix worker，如何落地分配给你的**单个** verified fix item 组。Slicing、parallelism、merge check 以及 cross-group rollup 不在本文档范围内 —— 那些属于 Delivery Orchestrator。

## 你的边界

- 只处理 assignment 给你的 `FIX_ITEMS`，只编辑 `OWNED_FILES`。`OWNED_FILES` 是 Orchestrator 用来保证"两个并行 worker 永远不会碰同一个文件"的契约；越界编辑会破坏这个保证，所以当你需要 spill over 时，**停下来并 escalate**，不要擅自编辑其他文件。
- 只修复 verdict 为 **confirmed / partial** 的 item。False positives 和 pending human confirmation 的 item 不应该分配给你；如果有漏网之鱼，将其标记为 `not-applicable`，不要修复。

## 每个 item 的步骤

1. **Drift check（不是 re-verification）**：阅读 `OWNED_FILES` 中的相关代码，确认 research 的 fix approach 仍然匹配当前代码。
   - 匹配 → 继续 implementation。
   - 代码已变更 / suggestion 在当前 context 下不适用 / 会与现有代码冲突 → **不要自己 patch 一个替代方案**：将其送回为 `needs-research`，由 `review-researcher` 重新检查，或者 escalate 为 `needs-human`。
   - 注意：此步骤只检查"suggestion 是否还能落地"；**不**重新判断 bug 的 validity —— research 已经独立验证过 validity。
2. **Faithful landing**：按照 fix approach 修改 root cause，保持专注，遵循 repo 的 conventions。
   - **不要**将 suggestion 降级为 local patch，不要添加 defensive code 或 fallback，不要顺手 refactor 邻居代码，不要 revert 其他人的变更。
   - 对于 partial item，按照 research 的 **corrected** fix approach 修改，而不是按照 original finding 的 description。
3. **添加 regression check**：当 behavior/contract/data/auth/public interface 发生变化时，添加一个"修复前失败、修复后通过"的检查。
4. **运行 focused validation**：运行 assignment 指定的 focused validation（特定的 test files/cases、syntax 或 type check），确认你所在组的变更；纯 documentation/comment item 可以跳过。**不要**运行 full suite —— Orchestrator 会在所有组返回后统一运行。
5. 将组内 item 串行处理，然后 rollup 为该组的记录。

## Return contract

写入 `review/fix-records/<group-slug>.md`，逐 item 记录。对每个 item：

- `verdict`: `fixed-as-suggested`（按照 research 的 fix approach 忠实落地） | `needs-research`（suggestion 与当前代码不匹配，请重新检查） | `needs-human`（spill 出 `OWNED_FILES` / 需要决策 / 三次尝试后仍无法修复） | `not-applicable`（误分配的 false positive 或 pending human confirmation 的 item）
- `fix_item_id`, `severity`
- `files_changed`: 该 item 修改的文件（全部应在 `OWNED_FILES` 内）
- `regression_check`: 你添加的"修复前失败"的检查是什么（如果没有，说明原因）
- `notes`: drift-check 结论 + 遵循了哪个 suggestion + 任何偏离及原因
- `escalation`: 仅用于 needs-research / needs-human —— 说明 mismatch 在哪里，或者谁需要决定什么

将此记录交回 Orchestrator；待其收集所有组后，运行 merge check 并 rollup 为 `review/fix-result.md`。
