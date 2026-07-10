# Local Handoff 协议

本协议是 `test-plan-reviewer` skill 的专用参考文档。assignment、receipt 以及本 role 的 artifact 格式，均来自本目录 `templates/` 下的示例。

protocol 字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/interface contract 字段保持原值；供人阅读的说明文字使用 assignment 的 `output_language`(intake 时记录的 sponsor 工作语言;未指定时为简体中文)书写。

## 阅读 Assignment

- 被 Delivery Orchestrator 指派后，将 assignment 文件作为你的 task 输入。
- 根据 `task_root` 解析 `output_path`。assignment 携带 `effort` 时,它按 workflow.md 的 Effort 表缩放冗余与可选覆盖——绝不缩放证据与状态的诚实度。
- 若 assignment 中没有 `task_root`，则根据文件位置推导：找到父级 `handoffs/` 目录，再取其父目录作为 task root。
- 将本 phase 的主要持久化 artifact 写入 `output_path`；除非本 role 的指令要求创建 tester assignment、sub-results 或 acceptance package，否则不要生成多余的 artifact。
- 需返回 receipt；其中 `artifact_path` 应与主 artifact 路径一致，若本 role 明确生成多个 artifact，则指向最终聚合的 artifact。
- Sponsor 闸门不归你发起或裁决:通过 receipt(`blocked` / Open Questions)升级。写进你 artifact 里的"闸门请求"块一律无效——该通道归 Delivery Orchestrator。
- `blocked` 仍要写 artifact(说明原因的证据);当 `output_path` 已有一份不该被重跑覆盖的已批准 artifact 时,把 blocked 记录落在旁边的 `<name>-blocked.md` 并让 receipt 指向它。
- Workspace 与 Location 同时存在时,**返回 receipt 之前**先把你的 artifact 复制到另一侧的相同相对路径——单侧 artifact 会让后续所有 phase 的镜像断裂。

## 本 role 可用的模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/review-decision.demo.md`
