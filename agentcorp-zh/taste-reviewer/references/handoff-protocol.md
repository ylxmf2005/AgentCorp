# Local Handoff Protocol

本协议是 `taste-reviewer` skill 的自带参考文档。assignment 的结构、receipt 以及本角色的 artifact，均取自本目录下 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/接口契约字段保持原值不变；面向人类的说明性正文使用简体中文。

## 阅读 assignment

- 被 Delivery Orchestrator 指派时，将 assignment 文件视为任务输入。
- `output_path` 相对于 `task_root` 解析。
- 若 assignment 没有 `task_root`，则从其文件位置推导：找到上级 `handoffs/` 目录，再取其上级目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非本角色的指令要求创建 tester assignment、子结果或 acceptance package，否则不要散落额外 artifact。
- 返回一个 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或者在本角色明确产出多个 artifact 时，指向最终的汇总 artifact。

## 本角色可用的模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`

## 本 role 可用的模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
