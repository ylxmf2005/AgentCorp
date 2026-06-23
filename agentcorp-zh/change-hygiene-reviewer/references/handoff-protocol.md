# Local Handoff Protocol

本协议供 `change-hygiene-reviewer` 自用。assignment、receipt 以及该 role 的 artifact 的格式，均来自本目录下 `templates/` 中的示例。

protocol 字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/接口契约字段保持原值不变；面向人的说明文本使用简体中文。

## Reading the Assignment

- 被 Delivery Orchestrator 指派时，将 assignment 文件视为 task 输入。
- 以 `task_root` 为基准解析 `output_path`。
- 若 assignment 中未指定 `task_root`，则根据 assignment 文件所在位置推导：找到父级 `handoffs/` 目录，并以其上级目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非该 role 的指令要求创建子结果或索引，否则不要额外散落其他 artifact。
- 返回 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致。

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
