# 本地 Handoff 协议

本协议是 `implementation-planner` skill 的自有参考。assignment、receipt 和本 role 的 artifacts 的结构，均来自本目录下 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/接口契约字段保持原值不变；面向人的说明性文字使用简体中文。

## 阅读 Assignment

- 被 Delivery Orchestrator 指派时，将 assignment 文件视为任务输入。
- 相对于 `task_root` 解析 `output_path`。
- 如果 assignment 中没有 `task_root`，则从 assignment 文件所在位置推导：找到上级 `handoffs/` 目录，并将其父目录作为 task root。
- 将本 phase 的主要持久 artifact 写入 `output_path`；除非本 role 的 instructions 明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要散落额外的 artifacts。
- 返回一个 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或者在本 role 明确产出多个 artifacts 时指向最终的汇总 artifact。

## 本 role 可用的 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/implementation-story-spec.demo.md`
