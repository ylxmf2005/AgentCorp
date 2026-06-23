# 本地 Handoff 协议

本协议是 `parallel-researcher` 的自用参考。assignment、receipt 以及该 role 产出物（artifact）的格式均取自本目录下 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/接口契约字段保持原值不变；可读性说明文本用简体中文书写。

## 阅读 Assignment

- 由 Delivery Orchestrator 指派任务时，将 assignment 文件视为任务输入。
- 将 `output_path` 解析为相对于 `task_root` 的路径。
- 若 assignment 中未指定 `task_root`，则根据 assignment 文件所在位置推导：找到上级 `handoffs/` 目录，再取其上级目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非该 role 的指令明确要求创建 tester assignment、sub-results 或 acceptance package，否则不要额外散落其他 artifact。
- `hands-on` 级别是个例外：artifact 为 research-package 文件夹 `research/<topic-slug>/`（结构见 `../research-package.md`），`output_path`/`artifact_path` 指向其中的 `00-report.md`，整个文件夹即为本 phase 的 artifact。
- 返回一个 receipt；receipt 中的 `artifact_path` 必须与主 artifact 路径一致，若该 role 明确产出多个 artifact，则指向最终汇总 artifact。

## 本 role 可用 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/decision-artifact.demo.md`
