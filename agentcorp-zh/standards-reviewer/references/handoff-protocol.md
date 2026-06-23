# Local Handoff 协议

本协议是 `standards-reviewer` skill 的自身参照。assignment、receipt 和本 role 的 artifact 的形态，均取自本目录下 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举值、路径、代码标识符以及 API/接口契约字段保持原值不变；面向人的说明性正文用简体中文撰写。

## 阅读 Assignment

- 被 Delivery Orchestrator 指派时，将 assignment 文件视为 task 输入。
- 将 `output_path` 按 `task_root` 解析为相对路径。
- 若 assignment 中没有 `task_root`，则从 assignment 文件所在位置推导：向上查找到 `handoffs/` 目录，取其上级目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非本 role 的指令明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要散落额外 artifact。
- 返回一个 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或在本 role 明确产出多个 artifact 时指向最终的聚合 artifact。

## 本 role 可用的 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
