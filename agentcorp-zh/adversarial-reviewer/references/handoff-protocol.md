# 本地 Handoff 协议

本协议是 `adversarial-reviewer` skill 的参考文档。assignment、receipt 以及本 role 的 artifact 格式均取自本目录下 `templates/` 中的示例。

protocol 字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段均保持原值；面向读者的说明性文字使用简体中文。

## 阅读 Assignment

- 被 Delivery Orchestrator 指派时，将 assignment 文件视为你的任务输入。
- 基于 `task_root` 解析 `output_path`。
- 如果 assignment 中没有 `task_root`，则根据 assignment 文件所在位置推导：向上找到 `handoffs/` 目录，再取其上级目录作为 task root。
- 将 phase 的主要持久化 artifact 写入 `output_path`；除非本 role 的指令明确要求创建 tester assignment、sub-results 或 acceptance package，否则不要产生额外的 artifact。
- 返回 receipt；receipt 中的 `artifact_path` 必须与主 artifact 路径一致，若本 role 明确产出多个 artifact，则指向最终的 summary artifact。

## 本 role 可用的 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
