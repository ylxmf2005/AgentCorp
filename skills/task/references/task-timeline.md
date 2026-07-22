# Task Timeline

`task.md` 和各专业产物表达当前有效状态；`timeline.md` 保存 Task 怎样走到这里。Timeline 是用户可读的任务历史，不是工具调用流水账。

## 记录什么

Runtime 为每条记录分配任务内递增且不复用的 `EVT-####`。以下变化进入 Timeline：

- Task 创建和完成；
- 工作单元开始、完成、阻塞或等待；
- 新证据纠正任务事实、假设或 Task Operating Envelope；
- 用户批准修改 Goal、Scope、Non-goals、Completion Evidence、Must Preserve、Git 意图、风险接受或其他 `UD-*`；
- 新证据修订会被后续依赖的 `AD-*`、根因、设计、实现路线或验证入口；
- 产物创建、更新、失效、重新核验或 supersede；
- Completion Evidence 的 passed、failed、blocked 结果；
- rewind、恢复或改道改变当前可信时间线。

普通文件读取、搜索、工具调用、无状态变化的检查和未登记对象的机械编辑不进入 Timeline。

Runtime 不监听 Git 或文件系统。专业产物只是在磁盘上发生变化，不会自动成为 Timeline 事件；已登记产物的内容 hash 一旦变化，必须用 `longrein_checkpoint` 重新登记 artifact，Runtime 会追加 `artifact_updated`。未登记的变化只会在 `longrein_task_read doctor` 中表现为 artifact drift，不能冒充已经同步的历史。当前 Runtime 的粒度是“产物是否变化”，不能自动区分语义修订和排版调整，因此不要为了整理文字反复改动已登记的当前产物。

Phase 不是 Runtime 的独立事件类型。全部 Phase 的当前状态、结果和证据保存在共享 `plan.md`；有交接意义的 Plan 变化通过重新登记 artifact 进入 Timeline。只有某个阶段同时形成需要独立恢复、交接或解释的工作边界时，才用 `longrein_work_start` 建立工作单元，并通过 `longrein_checkpoint` 的 finish 或 block 收束。普通施工步骤和“完成了百分之多少”不进入。

## 当前状态和历史各自负责什么

- Goal、Scope、Current Work、当前发现、产物可信度和完成证据看 `task.md`；
- 全部 Phase、Owner、依赖、当前状态、结果和证据看根目录 `plan.md`；
- 完整专业结论看 Shape、Dev、Review、Test 等所属产物；
- 一项状态何时、因为什么变化，以及当时产生了什么结果看 `timeline.md`；
- 代码行为和测试终态仍以代码、Git、运行结果和测试证据为准。

Timeline 不维护第二份当前状态。旧事件需要纠正时追加新事件，不能回写历史使它看起来从未发生。

## 事件应写清什么

生成文件的准确事件形状遵循 [Task Timeline demo](templates/task-timeline.demo.md)。本文件只定义什么变化值得进入历史、当前状态与历史怎样分工，不维护平行模板。

每条事件至少包含：

- 稳定事件号和时间；
- actor 和事件类型；
- 对用户或下一位有意义的结果；
- 当时的 `context_revision` 与 `scope_revision`；
- 需要时附证据路径、被替换的 `UD-*` / `AD-*` 或旧事件；
- 工作单元事件说明开始、完成或阻塞，而不是罗列执行过程。

承诺变化以用户决定取得修改资格；事实和专业结论变化以证据取得修改资格。专业正文先回到真正拥有它的产物，再通过 Longrein MCP 登记 Timeline 与当前投影视图。修订被下游依赖的 `AD-*`、契约、Plan Phase、Owner、依赖或验证入口时，在 artifact 事件中说明变化原因和受影响的下游；纯排版变化若已经改变登记产物的 hash，也只能按当前 Runtime 的 artifact 更新边界诚实登记。
