# Local Handoff 协议

本协议是 `test-planner` skill 的内部参考文档。assignment、receipt 以及本 role 对应 artifact 的格式，均来自本目录下 `templates/` 中的示例。

protocol 字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段保持原值不变；面向人的说明性文字使用简体中文。

## 阅读 Assignment

- 当 Delivery Orchestrator 给你分配任务时，将 assignment 文件视为任务输入。
- 以 `task_root` 为基准解析 `output_path`。
- 如果 assignment 中没有 `task_root`，则根据 assignment 文件所在位置推导：找到上级目录中的 `handoffs/` 目录，将其父目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非本 role 的指令明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要额外散落其他 artifact。
- 返回一个 receipt；receipt 中的 `artifact_path` 必须与主 artifact 的路径一致，或者——当本 role 明确产出多个 artifact 时——指向最终聚合用的 artifact。

## 本 role 可用的 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/test-plan.demo.md`
