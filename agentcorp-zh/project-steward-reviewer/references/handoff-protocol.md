# Local Handoff Protocol

本协议是 `project-steward-reviewer` skill 的自身参考文档。assignment、receipt 以及本 role 的 artifact 格式，均取自本目录下 `templates/` 里的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段保持原值；供人阅读的正文使用 zh-CN。

## Reading the Assignment

- 被 Delivery Orchestrator 调度时，将 assignment 文件作为你的任务输入。
- 以 `task_root` 为基准解析 `output_path`。
- 若 assignment 中没有 `task_root`，则从 assignment 文件所在位置推导：找到上级 `handoffs/` 目录，再将其上级目录作为 task root。
- 将本 phase 的主持久 artifact 写入 `output_path`；除非本 role 明确要求必须创建子结果，否则不要散落额外 artifact。
- 返回一个 receipt；receipt 中的 `artifact_path` 必须与主 artifact 路径一致。

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
