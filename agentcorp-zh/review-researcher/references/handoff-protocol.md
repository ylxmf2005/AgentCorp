# Local Handoff Protocol

本协议是 `review-researcher` 自用的参考文档。assignment 和 receipt 的表单格式，请从本目录 `templates/` 下的 demo 文件中取用；调研文件夹的骨架在 `research-doc-template.md` 里。

协议字段、`artifact_type`、`status` 枚举、`verdict` 枚举、路径和代码标识符保持原值；供人阅读的解释性正文使用简体中文。

## Reading the Assignment

- 被 Delivery Orchestrator 派发时，将 assignment 文件作为你的任务输入。
- 按 `task_root` 为基准解析 `output_path`；`output_path` 指向调研文件夹（或其中的 `00-index.md`）。
- 若 assignment 里没有 `task_root`，则从 assignment 文件所在位置推导：先找到上层的 `handoffs/` 目录，再取其上级作为 task root。
- 在调研文件夹下编写 `00-index.md`，每个 issue 各写一份文件；除此之外不要再额外散落其他产物。
- 返回一份 receipt；其中 `artifact_path` 指向 `00-index.md`。

## Templates available to this role

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `research-doc-template.md`（index 及单 issue 文件的骨架）
