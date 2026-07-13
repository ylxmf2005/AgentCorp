# 本地交接协议

本协议是 `test-leader` 技能自身的参考文件。指派、回执以及本角色的产物形状，均取自本目录下 `templates/` 中的演示文件。

演示文件展示的是形状，不是值：保持协议字段名、`status` 枚举和前置数据键与模板定义完全一致，并将每个 `example-*` 占位符替换为本次任务的实际值；面向人类的解释性正文使用 assignment 的 `output_language`（intake 时记录的 sponsor 工作语言；未指定时为 zh-CN）。

## 阅读指派文件

- 由交付编排器指派时，将指派文件视为你的任务输入。
- 相对于 `task_root` 解析 `output_path`。
- assignment 携带 `effort` 时，总控已把该档位编译进你的 Action Context 约束——把它当审计元数据：照具体约束执行，绝不按档位名缩放你自己的用心程度或证据与状态的诚实度。
- 如果指派文件没有 `task_root`，从其所在位置推导：找到父目录 `handoffs/` 并取其父目录作为任务根目录。
- 在 `output_path` 写入本阶段的主要持久产物；除非本角色的指令要求创建测试员指派、子结果或验收包，否则不要散落额外产物。
- 返回回执；回执的 `artifact_path` 必须与主产物路径匹配，或者当本角色明确产出多个产物时，指向最终汇总产物。

## 编写测试员指派

- 复制 `templates/phase-assignment.demo.md` 并设置 `from_agent: test-leader`、`to_agent: <tester-slug>`、`phase: verify`、`status: assigned` 以及本次任务的实际 `task_id`。
- 始终显式设置 `task_root`。测试员无法从 `verification/assignments/` 推导它——回退推导期望父目录 `handoffs/`，而此路径没有。
- 设置 `output_path: verification/test-results/<tester-slug>.md`，并在 Inputs 中命名匹配的执行手册路径。
- 验证阶段指派的专业审查员获得相同的形状；他们自己的技能默认将输出放在 `review/specialist-findings/`，因此指派文件必须显式设置 `output_path`。

## 本角色可用的模板

- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/verification-report.demo.md`
- `templates/test-result.demo.md`