# Local Handoff Protocol

这份 protocol 是 `performance-reviewer` skill 自用的一份参考文档。assignment、receipt 以及本 persona 的 artifact 的格式，均取自本目录下 `templates/` 中的 demo 示例。

protocol 字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/接口契约字段保持原始值不变；面向人的说明性正文使用简体中文撰写。

## Reading the Assignment

- 被 Delivery Orchestrator 指派时，将 assignment 文件视为任务输入。
- 相对于 `task_root` 解析 `output_path`。
- 如果 assignment 没有 `task_root`，则根据 assignment 文件所在位置推导：找到父级 `handoffs/` 目录，再取该目录的父目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非本 persona 明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要额外散落其他 artifact。
- 返回 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或者当本 persona 显式产出多个 artifact 时，指向最终合并后的 artifact。

## Templates available to this persona

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
