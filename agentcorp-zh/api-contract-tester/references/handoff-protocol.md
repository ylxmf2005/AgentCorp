# 本地 handoff 协议

本协议是 `api-contract-tester` skill 的自有参考。assignment、receipt 以及本角色的 artifact 格式均取自本目录下 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/接口合约字段保持原值不变；人机可读的解释性正文使用简体中文。

## 读取 assignment

- 由 Delivery Orchestrator 分派时，将 assignment 文件视为任务输入。
- 将 `output_path` 相对于 `task_root` 解析。
- 若 assignment 中没有 `task_root`，则根据 assignment 文件所在位置推导：找到父级 `handoffs/` 目录，再取其父目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非本角色的指令明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要散落额外 artifact。
- 返回 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或者在本角色明确产出多个 artifact 时指向最终汇总 artifact。

## 本 role 可用的 templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/test-result.demo.md`
