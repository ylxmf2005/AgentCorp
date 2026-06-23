# Local Handoff 协议

本协议是 `security-reviewer` skill 的专用参考文档。assignment、receipt 以及本 role 的 artifact 格式，均来自本目录 `templates/` 下的示例。

protocol 字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段保持原值；供人阅读的说明文字请用简体中文书写。

## 阅读 Assignment

- 被 Delivery Orchestrator 指派后，将 assignment 文件作为你的 task 输入。
- 根据 `task_root` 解析 `output_path`。
- 若 assignment 中没有 `task_root`，则根据文件位置推导：找到父级 `handoffs/` 目录，再取其父目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非本 role 的指令要求创建 tester assignment、sub-results 或 acceptance package，否则不要生成多余的 artifact。
- 需返回 receipt；其中 `artifact_path` 应与主 artifact 路径一致，若本 role 明确生成多个 artifact，则指向最终聚合的 artifact。

## 本 role 可用的 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
