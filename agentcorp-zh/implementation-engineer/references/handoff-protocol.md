# Local Handoff Protocol

本 protocol 是 `implementation-engineer` skill 的内部参考文档。assignment、receipt 和本 role 的 artifact 的格式均取自当前目录下 `templates/` 中的示例。

protocol 字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段保持原样；面向人类的说明性文字使用简体中文。

## 读取 Assignment

- Delivery Orchestrator 分配任务时，将 assignment 文件作为 task input 处理。
- 将 `output_path` 按相对于 `task_root` 的路径解析。
- 若 assignment 中无 `task_root`，则从 assignment 文件所在位置推导：找到父级 `handoffs/` 目录，再取其父目录作为 task root。
- 本 phase 的主要持久化 artifact 写入 `output_path`；除非本 role 的指令明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要额外散落其他 artifact。
- 返回 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或者在本 role 明确产出多个 artifact 时，指向最终的 summary artifact。

## 本 role 可用的 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/implementation-result.demo.md`
