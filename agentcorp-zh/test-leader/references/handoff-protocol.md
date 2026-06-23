# Local Handoff protocol

本协议是 `test-leader` skill 的自用参考。assignment、receipt 以及本 role 各 artifact 的格式，均取自本目录 `templates/` 中的示例。

protocol 字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段均保持原样；面向人的说明正文请用简体中文书写。

## Reading the Assignment

- 被 Delivery Orchestrator 指派时，将 assignment 文件作为你的任务输入。
- `output_path` 以 `task_root` 为基准解析。
- 若 assignment 没有 `task_root`，则从 assignment 文件所在位置推导：找到上级 `handoffs/` 目录，再取其上级目录作为 task root。
- 将本 phase 的主持久 artifact 写入 `output_path`；除非本 role 的指令要求创建 tester assignment、sub-result 或 acceptance package，否则不要额外散落其他 artifact。
- 返回一份 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，若本 role 明确产出多个 artifact，则指向最终的汇总 artifact。

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/decision-artifact.demo.md`
- `templates/test-result.demo.md`
