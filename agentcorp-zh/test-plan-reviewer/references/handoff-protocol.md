# 本地 Handoff 协议

本协议是 `test-plan-reviewer` skill 的专用参考。assignment、receipt 和本角色 artifact 的模板均来自本目录 `templates/` 下的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/接口契约字段均保持原值；面向读者的说明性正文使用简体中文撰写。

## 阅读 Assignment

- 被 Delivery Orchestrator 指派后，将 assignment 文件作为你的任务输入。
- 相对于 `task_root` 解析 `output_path`。
- 若 assignment 未指定 `task_root`，则从 assignment 文件所在位置推导：先找到上级 `handoffs/` 目录，再将其上级目录作为 task root。
- 本 phase 的主要持久产物写入 `output_path`；除非角色指令明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要额外生成其他产物。
- 需要返回一份 receipt；receipt 中的 `artifact_path` 必须与主产物路径一致，若本角色显式产出多个产物，则指向最终的汇总产物。

## 本角色可用模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/review-decision.demo.md`
