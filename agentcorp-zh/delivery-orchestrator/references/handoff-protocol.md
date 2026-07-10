# 本地交接协议

本协议是 `delivery-orchestrator` 技能的自有参考。分配、回执以及本角色制品的形态取自本目录 `templates/` 中的示例。

协议字段、`artifact_type`、`status` 枚举、路径、代码标识符和接口合约字段保持原始值；人类可读的说明性文字使用 zh-CN。

## 被分配者如何处理你的分配

每个被委派的负责人将你的分配文件作为任务输入，并按以下规则执行——编写分配时确保它们成立：

- 负责人将分配文件作为任务输入。
- 负责人在动手前，读取 Source Artifacts 与 Action Context 中列出的每条具体路径。未解析 glob、按惯例猜出的文件名或摘要，都不能替代必需文件。
- assignment 中的 source of truth、允许编辑的根目录和只读上下文是硬动作边界。约束用于指导行为，不是要抄进输出交付物的内容。
- 必需 context file 缺失、过期或互相矛盾时，负责人点名受影响的交付物或阶段跃迁并返回不一致，绝不能猜；依赖之外的独立工作可以继续。
- 负责人相对于 `task_root` 解析 `output_path`。
- 如果分配没有 `task_root`，负责人从分配文件的位置推导：找到包含的 `handoffs/` 目录，取其父目录作为任务根目录。
- 负责人在 `output_path` 写入该阶段的主要持久化制品，不会散落额外制品，除非其角色指示要求创建测试者分配、子结果或验收包。
- 负责人返回一个回执；回执的 `artifact_path` 必须匹配主要制品路径，或在该角色明确产出多个制品时指向最终聚合制品。

## 验证回执（机械验证，在质量判断之前）

收到每个回执后，运行 `scripts/validate-handoff.py` 进行信封一致性验证，然后做阶段质量判断：

- 单对：`python3 scripts/validate-handoff.py --pair <assignment> <receipt> --task-root <task_root>`
- 全任务：`python3 scripts/validate-handoff.py --sweep --task-root <task_root>`

它验证 `artifact_path` 确实存在、与分配的 `output_path` 匹配、`from_agent`/`phase`/`task_id` 对齐、制品的 `author_agent` 匹配负责人、且 status 非空。**非零退出 = 交接未完成**：以 `needs_more_evidence` 退回，不计入门禁。通过机械检查 ≠ 通过质量门禁。

## 本角色可用的模板

此列表完整—— `templates/` 中的每个示例都列在这里。从这些示例获取制品形态；不要自行发明。

- `templates/acceptance-package.demo.md`
- `templates/interface-contract.demo.md`
- `templates/decision-artifact.demo.md` — 其他决策的通用决策形态，例如 `acceptance-decision`（`AcceptanceDecision`，status `accept|reject|needs_more_evidence|blocked`）
- `templates/design-artifact.demo.md`
- `templates/finding-set.demo.md`
- `templates/implementation-result.demo.md`
- `templates/implementation-story-spec.demo.md`
- `templates/phase-assignment.demo.md`
- `templates/phase-receipt.demo.md`
- `templates/review-decision.demo.md` — 支撑 `code-review`（`CodeReviewDecision`）；使用相同形态配合 `PlanReviewDecision` / `TestPlanReviewDecision` 用于 `plan-review` 和 `test-plan-review`
- `templates/task-manifest.demo.md`
- `templates/task-record.demo.md`
- `templates/test-plan.demo.md`
- `templates/api-test-plan.demo.md`、`templates/e2e-test-plan.demo.md`、`templates/regression-test-plan.demo.md` — TestPlan 执行手册，`test/test-plan.md` 的子文件
- `templates/testing-context.demo.md` — 项目级 `teamspace/testing-context.md`
- `templates/test-result.demo.md`
- `templates/validated-requirements.demo.md`
- `templates/work-item.demo.md`
- `templates/exploration-frontier.demo.md`、`templates/exploration-charters.demo.md`、`templates/exploration-journal.demo.md` — 用于填充 testing-context 的探索工作笔记；故意无 YAML frontmatter，绝不出现在回执中，因此 `validate-handoff.py` 永远不会看到它们
