# 本地 Handoff 协议

本协议属于 `simplicity-reviewer` skill 自己的 reference。assignment、receipt 和本角色产物的形态，都从本目录的 `templates/` demo 取用。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符和 API/接口契约字段保持原值；面向人阅读的说明正文使用 zh-CN。

## 读取 Assignment

- 被 Delivery Orchestrator 指派时，把 assignment 文件当作任务输入。
- 将 `output_path` 相对 `task_root` 解析。
- 如果 assignment 没有 `task_root`，从 assignment 文件位置推导：找到父级 `handoffs/` 目录，并把它的父目录作为 task root。
- 在 `output_path` 写入本 phase 的主要持久产物；除非本角色说明需要创建 tester assignment、子结果或 acceptance package，否则不要额外散落产物。
- 返回一份 receipt；receipt 的 `artifact_path` 必须与主要产物路径一致，或在本角色明确产生多个产物时指向最终汇总产物。

## 本角色可用模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
