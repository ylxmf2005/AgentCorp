# Local handoff protocol

本协议是 `review-fixer` skill 的自有参考。assignment、receipt 以及本 role 的 artifact 的格式，均取自本目录下 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/接口合约字段保持原值；面向人的解释性正文使用简体中文。

## 读取 assignment

- 被 Delivery Orchestrator 派发时，将 assignment 文件视为任务输入。assignment 会给你**一组** fix item（`FIX_ITEMS`）以及你被授权操作的文件集合（`OWNED_FILES`）。
- 将 `output_path` 解析为相对于 `task_root` 的路径；`output_path` 指向本组 fix record 的位置 `review/fix-records/<group-slug>.md`。
- 如果 assignment 没有 `task_root`，则从 assignment 文件所在位置推导：找到父级 `handoffs/` 目录，再取其父目录作为 task root。
- 在 `output_path` 写入本组的 fix record；只修改 `OWNED_FILES` 范围内的后端代码；不要把其他产物散落到别处。
- 返回一个 receipt；receipt 的 `artifact_path` 指向本组 fix record 的路径。
- 跨组合并检查以及 `review/fix-result.md` 的汇总由 Delivery Orchestrator 完成，不由你写入。

## 本 role 可用的模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/fix-record.demo.md`
