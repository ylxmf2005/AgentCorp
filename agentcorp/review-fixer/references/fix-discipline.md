# 单组落地执行细节

本文件是 `review-fixer` 的本地 reference：作为单个修复 worker，怎么把指派给你的**一组**已核验修复项落地。切分、并行、合并校验、跨组汇总都不在这里——那是 Delivery Orchestrator 的事。

## 你的边界

- 只处理 assignment 给的 `FIX_ITEMS`，只编辑 `OWNED_FILES`。`OWNED_FILES` 是 Orchestrator 用来保证「两个并行 worker 不碰同一文件」的契约：越界编辑会破坏这个保证，所以需要外溢时**停下来上报**，不要擅自改别的文件。
- 只修判定为 **确认（confirmed）/ 部分成立（partial）** 的项。误报、待人确认不该被派给你；若混进来，标 `not-applicable`、不修。

## 每个 item 的步骤

1. **抗漂移核对（不是重做核验）**：读 `OWNED_FILES` 里相关代码，确认 research 的修法建议仍对得上当前代码。
   - 对得上 → 进入实现。
   - 代码已变 / 建议在当前上下文落不下去 / 会与现有代码冲突 → **不要自行改方案硬上**：`needs-research` 退回让 `review-researcher` 复核，或 `needs-human` 上报。
   - 注意：这一步只核对「建议还能不能落地」，**不重新判断 bug 真伪**——真伪 research 已经独立核验过。
2. **忠实落地**：按修法建议改 root cause，聚焦、贴合仓库约定。
   - **不把建议降格成局部补丁**，不加它没要求的防御代码或兜底，不顺手重构邻居，不回退别人的改动。
   - partial 项按 research **修正后**的修法改，不按原 finding 的描述。
3. **补回归检查**：行为/契约/数据/auth/公共接口有变时，补一个「修复前会失败、修复后通过」的检查。
4. **跑聚焦校验**：跑 assignment 指定的聚焦校验（具体测试文件/用例、语法或类型检查）确认本组改动；纯文档/注释类可跳过。**不要**跑全量 suite——全量由 Orchestrator 在所有组返回后跑一次。
5. 本组多个 item 串行处理，处理完汇成本组记录。

## 返回契约

写 `review/fix-records/<group-slug>.md`，逐条记录，每条：

- `verdict`：`fixed-as-suggested`（按 research 修法忠实落地）| `needs-research`（建议对不上当前代码，请复核）| `needs-human`（外溢出 `OWNED_FILES` / 需决策 / 三次修不动）| `not-applicable`（被误派的误报或待人确认项）
- `fix_item_id`、`severity`
- `files_changed`：本条改动的文件（都应在 `OWNED_FILES` 内）
- `regression_check`：补了什么「修复前会失败」的检查（没补就说明原因）
- `notes`：抗漂移核对结论 + 按哪条建议改的 + 有无偏离及原因
- `escalation`：仅 needs-research / needs-human 时——说清对不上在哪、或需要谁决定什么

把这份记录交回 Orchestrator；它收齐各组后跑合并校验、汇总成 `review/fix-result.md`。
