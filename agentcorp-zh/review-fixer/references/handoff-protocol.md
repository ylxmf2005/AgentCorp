# 本地交接协议

本协议是 `review-fixer` 技能的自有参考。任务分配、回执及本角色产出的形状均取自本目录下 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符以及 API/接口契约字段保持原值不变；面向人类的说明性文本使用 assignment 的 `output_language`（intake 时记录的 sponsor 工作语言；未指定时为 zh-CN）。

## 读取任务分配

- 当由交付编排器派发时，将任务分配文件视为你的任务输入。任务分配给你**一个组**的修复项（`FIX_ITEMS`）和你的授权文件集（`OWNED_FILES`）。
- 将 `output_path` 相对于 `task_root` 解析；`output_path` 指向本组的修复记录 `review/fix-records/<group-slug>.md`。
- assignment 携带 `effort` 时，总控已把该档位编译进你的 Action Context 约束——把它当审计元数据：照具体约束执行，绝不按档位名缩放你自己的用心程度或证据与状态的诚实度。
- 如果任务分配没有 `task_root`，则从其文件位置推导：找到父级 `handoffs/` 目录，并取其父目录作为任务根目录。
- 在 `output_path` 撰写本组的修复记录；仅编辑 `OWNED_FILES` 内的产品代码；不要在此之外散布其他产出。
- 动手编辑之前，先按任务分配的 Baseline（frontmatter 里从 `task.md` 抄录的 `source_ref`/`target_ref`/`merge_base`）核对检出状态：确认自己在任务的工作分支上，且其历史包含 `merge_base`。对不上时，返回 `status: blocked` 并写明漂移——落在错误 base 上的修复会毁掉所有组的合并。
- 返回一个回执；回执的 `artifact_path` 指向本组的修复记录路径。
- 如果触发终止条件（缺失研究结论、不可避免的越界编辑），返回 `status: blocked` 的回执并注明阻塞原因；逐条升级（`needs-research` / `needs-human`）不阻塞整个组——将其记录在修复记录中并返回 `status: completed`。
- 跨组合并检查和 `review/fix-result.md` 汇总由交付编排器完成，不由你撰写。

## 本角色可用的模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/fix-record.demo.md`
