# 本地 Handoff 协议

本协议是 `reliability-reviewer` skill 的自身参考。assignment、receipt 以及该 role 产出 artifact 的格式，均取自本目录 `templates/` 下的示例。

protocol 字段、`artifact_type`、`status` 枚举、路径、代码标识符及 API/接口契约字段保持原样；面向人的说明文字使用简体中文。

## 读取 Assignment

- 当 Delivery Orchestrator 指派任务时，将 assignment 文件作为任务输入。
- 以 `task_root` 为基准解析 `output_path`。
- 若 assignment 未指定 `task_root`，则从文件所在位置推导：找到上级 `handoffs/` 目录，并将其父目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非该 role 明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要额外散落其他 artifact。
- 返回 receipt；receipt 的 `artifact_path` 须与主 artifact 路径一致；若该 role 明确产出多个 artifact，则指向最终汇总 artifact。

## 本 role 可用的 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
