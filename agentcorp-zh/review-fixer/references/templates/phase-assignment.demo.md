---
artifact_type: PhaseAssignment
task_id: example-task-20260603-120000
task_root: teamspace/tasks/example-task-20260603-120000/
from_agent: delivery-orchestrator
to_agent: review-fixer
phase: fix
status: assigned
group_slug: <this group's short English slug>
output_path: review/fix-records/<group-slug>.md
---

# 指派：fix（单组）

## 目标

忠实落地该组已验证的修复项（文件集合不与其他组重叠）。本次指派仅是本轮并行修复中的一个组；拆分与跨组合并由 Delivery Orchestrator 负责。

## FIX_ITEMS（该组必须落地的项）

- P0-1：verdict 已确认；root cause …；fix approach …；涉及 path/to/service.py
- P2-2：verdict 为 partial；修正后的 fix approach …；涉及 path/to/service.py
（每一项都引用 review/research/ 下对应 issue 文件中的 verdict 与 fix approach；仅包含 confirmed / partial 的项。）

## OWNED_FILES（该组可编辑的文件集合）

- path/to/service.py
- path/to/helper.py
（不得编辑该集合之外的 backend 文件；如需溢出，按 needs-human 上报。）

## 输入

- 该组各 issue 在 review/research/ 下的 verdict 与 fix approach（必填）
- Human comments（如有，最高优先级）
- 该组应执行的 focused validation hints

## 约束

- 不要 re-verify：validity / root cause / fix approach 以 research 结论为准；本角色只管落地。
- 忠实落地优雅的修复，从根源入手而非打补丁；改动保持聚焦，并与现有 conventions 保持一致。
- 只编辑 OWNED_FILES 内的 backend 代码，并保留在 working tree 中；不要 commit，不要 push；不要碰 frontend。
- 只运行 focused validation，不要跑 full suite（Orchestrator 会在 merge 后跑 full suite）。
- 如果 suggestion 与当前代码不匹配，打回 re-check（needs-research）；不要自己叠一层替代方案。

## 必需输出

- 将该组的 fix record 写入 `output_path`（格式参照 `templates/fix-record.demo.md`）。
- 返回一份 receipt，格式匹配 `templates/phase-receipt.demo.md`，`artifact_path` 指向该组的 record。

## 停止条件

FIX_ITEMS 引用的 research conclusions 缺失、必须编辑 OWNED_FILES 之外的文件、或修复会触及 frontend / 需要未经批准的 dependency。
