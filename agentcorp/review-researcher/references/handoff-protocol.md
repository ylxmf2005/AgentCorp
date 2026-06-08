# 本地 Handoff 协议

本协议属于 `review-researcher` skill 自己的 reference。assignment、receipt 的形态从本目录的 `templates/` demo 取用；研究文件夹的骨架在 `research-doc-template.md`。

协议字段、`artifact_type`、`status` 枚举、`verdict` 枚举、路径、代码标识符保持原值；面向人阅读的说明正文使用 zh-CN。

## 读取 Assignment

- 被 Delivery Orchestrator 指派时，把 assignment 文件当作任务输入。
- 将 `output_path` 相对 `task_root` 解析；`output_path` 指向研究文件夹（或其中的 `00-index.md`）。
- 如果 assignment 没有 `task_root`，从 assignment 文件位置推导：找到父级 `handoffs/` 目录，并把它的父目录作为 task root。
- 在研究文件夹下写 `00-index.md` 和每个 issue 一份文件；除此之外不要额外散落产物。
- 返回一份 receipt；receipt 的 `artifact_path` 指向 `00-index.md`。

## 本角色可用模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `research-doc-template.md`（索引与单 issue 文件骨架）
