# 本地交接协议

本协议是 `correctness-reviewer` skill 自带的参考文档。assignment、receipt 以及本 role 产出 artifact 的格式，均取自本目录下 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举值、路径、代码标识符以及 API/接口契约字段保持原值不变；面向人的说明性文字使用 zh-CN。

## 读取 assignment

- 被 Delivery Orchestrator 指派时，将 assignment 文件视为你的 task 输入。
- 将 `output_path` 解析为相对于 `task_root` 的路径。
- 如果 assignment 没有 `task_root`，则从 assignment 文件所在位置推导：找到上级 `handoffs/` 目录，再取其上级目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非本 role 明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要额外散落其他 artifact。
- 返回 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或者在本 role 明确产出多个 artifact 时指向最终聚合 artifact。

## 本 role 可用的模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/finding-set.demo.md`
