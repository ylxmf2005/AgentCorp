# Local Handoff Protocol

本协议是 `api-contract-reviewer` skill 的自有参考。assignment、receipt 以及本 role 的 artifact 结构均取自本目录下 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段保持原值不变；面向人类的说明性正文使用 zh-CN 撰写。

## Reading the Assignment

- 被 Delivery Orchestrator 派发时，将 assignment 文件视为任务输入。
- `output_path` 相对于 `task_root` 解析。
- 若 assignment 未指定 `task_root`，则根据 assignment 文件所在位置推导：找到上级 `handoffs/` 目录，再取其上级作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非本 role 的指令明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要散落额外 artifact。
- 返回 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或在本 role 明确产出多个 artifact 时指向最终的聚合 artifact。

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
