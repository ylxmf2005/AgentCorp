# 本地 Handoff 协议

本协议属于 `review-fixer` skill 自己的 reference。assignment、receipt 和本角色产物的形态，都从本目录的 `templates/` demo 取用。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符和 API/接口契约字段保持原值；面向人阅读的说明正文使用 zh-CN。

## 读取 Assignment

- 被 Delivery Orchestrator 指派时，把 assignment 文件当作任务输入。assignment 给的是**一组**修复项（`FIX_ITEMS`）和你被授权的文件集（`OWNED_FILES`）。
- 将 `output_path` 相对 `task_root` 解析；`output_path` 指向本组的修复记录 `review/fix-records/<group-slug>.md`。
- 如果 assignment 没有 `task_root`，从 assignment 文件位置推导：找到父级 `handoffs/` 目录，并把它的父目录作为 task root。
- 在 `output_path` 写入本组修复记录；只编辑 `OWNED_FILES` 内的后端代码；除此之外不要额外散落产物。
- 返回一份 receipt；receipt 的 `artifact_path` 指向本组修复记录路径。
- 跨组的合并校验与汇总 `review/fix-result.md` 由 Delivery Orchestrator 做，不由你写。

## 本角色可用模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/fix-record.demo.md`
