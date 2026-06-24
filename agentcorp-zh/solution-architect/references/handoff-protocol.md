# 本地 Handoff 协议

本协议是 `solution-architect` skill 的内部参考文档。assignment、receipt 以及本角色 artifact 的格式，均来自同级 `templates/` 目录下的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/接口契约字段保持原始值不变；面向用户的说明正文使用简体中文。

## 读取 Assignment

- Delivery Orchestrator 分配任务时，将 assignment 文件作为任务输入。
- `output_path` 相对于 `task_root` 解析。
- 若 assignment 中未指定 `task_root`，则从该文件所在位置推导：向上查找 `handoffs/` 目录，并将其父目录作为任务根目录。
- 将本 phase 的 artifact 写入 `output_path`。若设计需要产出多个 artifact，assignment 的 `output_path` 应指向 `design/` 目录；在其下按需创建 `architecture.md`、`impact-analysis.md`、`diagnosis.md`、`interface-contract.md`。
- 返回 receipt；其中 `artifact_path` 必须与 assignment 的 `output_path` 保持一致，若 `output_path` 为目录，则指向该目录下的某一份实际设计 artifact。若产出了多份设计 artifact，请在 receipt 正文的 "Notes" 章节中列出全部路径。

## 本角色可用 Templates

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/design-artifact.demo.md`
- `templates/interface-contract.demo.md`
