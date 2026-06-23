# Local Handoff Protocol

本协议是 `acceptance-review-lead` skill 自身的参考文档。assignment、receipt 以及该 role 的 artifact 格式均取自本目录下的 `templates/` 示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段保持原值不变；面向人类的说明性文字使用 zh-CN。

## Reading the Assignment

- 由 Delivery Orchestrator 指派时，将 assignment 文件视为 task input。
- 相对于 `task_root` 解析 `output_path`。
- 若 assignment 中无 `task_root`，则从 assignment 文件所在位置推导：找到父级 `handoffs/` 目录，取其上级目录作为 task root。
- 将 phase 的主要持久化 artifact 写入 `output_path`；除非该 role 的 instructions 明确要求创建 tester assignment、sub-result 或 acceptance package，否则不要散落额外 artifact。
- 返回 receipt；receipt 的 `artifact_path` 必须与主 artifact 路径一致，或者当该 role 明确产出多个 artifact 时，指向最终合并后的 artifact。
