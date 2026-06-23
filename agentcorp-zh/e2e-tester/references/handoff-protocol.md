# 本地 Handoff 协议

本协议是 `e2e-tester` skill 的自有参考。assignment、receipt 以及本 role 的 artifact 格式均取自本目录下的 `templates/` 示例。

protocol 字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段保持原值；人类可读的解释正文使用 zh-CN。

## 读取 Assignment

- 被 Delivery Orchestrator 指派时，将 assignment 文件视为你的任务输入。
- 将 `output_path` 相对于 `task_root` 解析。
- 若 assignment 没有 `task_root`，则从其文件位置推导：找到上级 `handoffs/` 目录，再取其上级作为 task root。
- 将本 phase 的主持久化 artifact 写入 `output_path`；除非本 role 的指令明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要散落额外 artifact。
- 返回一个 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或者在本 role 明确产出多个 artifact 时指向最终的 summary artifact。

## 本 role 可用的 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/test-result.demo.md`
