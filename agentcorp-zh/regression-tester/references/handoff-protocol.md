# Local Handoff Protocol

这份协议是 `regression-tester` skill 的自用参考。assignment、receipt 以及本 role 的 artifact 格式，全部取自本目录下 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段保持原值不变；面向人的说明正文用简体中文书写。

## 阅读 Assignment

- 被 Delivery Orchestrator 指派时，将 assignment 文件视为你的 task 输入。
- 将 `output_path` 相对于 `task_root` 解析。
- 若 assignment 中没有 `task_root`，则根据 assignment 文件所在位置推导：找到父级 `handoffs/` 目录，再取其上级目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非本 role 的指令明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要散落额外 artifact。
- 返回一个 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或者在本 role 明确产出多个 artifact 时，指向最终的汇总 artifact。

## 本 role 可用的 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/test-result.demo.md`
