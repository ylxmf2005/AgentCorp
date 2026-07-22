---
name: task
description: 仅在用户显式调用 `$task`（Claude Code 中为 `/task`）时使用。创建新的 Runtime Task，或恢复、查看用户指定且已包含 `.runtime/state.json` 的现有 Task；确定唯一 Active Task，建立可信 Task Context，并通过显式工作单元、产物登记、证据和完成门禁维持可恢复状态。其他 Skill、Agent、任务复杂度或持久化需要不触发本 Skill。
---

# task

把用户明确启动的 Task 展开到所有参与者都能接手的位置。`task` 管理任务生命周期、承诺、当前状态和产物入口；`shape`、`grill`、`dev`、`review`、`test` 等 Skill 仍拥有各自的专业判断。

创建或恢复 Task 时读取 [Task Runtime](references/task-runtime.md)。需要建立或修改承诺时读取 [决策来源与修改权](references/decision-provenance.md)；判断哪些变化应进入历史时读取 [Task Timeline](references/task-timeline.md)。

## 确定 Active Task

一个 Session 同时只有一个 Active Task。用户给出的 Task UID、唯一 task id、`task.md` 绝对路径或明确的 `new | resume` 指令说了算：

- `new`：创建新的 Runtime Task；
- `resume <task-uid|unique-task-id|absolute-task.md-path>`：恢复指定 Runtime Task；
- 当前 Session 已宣布 Active Task：沿用该绝对路径；
- 用户只输入 `$task`、又没有 Active Task：使用 `longrein_task_read` 的 `list` 读取全局 Registry 中的未完成候选，让用户选择 resume 或 new；即使只有一个候选也不猜测，不扫描磁盘补充候选。

旧式、只有 `task.md` 而没有 `.runtime/state.json` 的目录不是 Runtime Task，不迁移、不接管，也不直接改写。用户仍要继续其目标时创建新的 Runtime Task，并把仍然有效的原始请求作为输入重新塑形。

选定后先使用 `longrein_task_read` 的 `show` 核验状态，再在用户可见消息中宣布 `Active Task: <task.md 的绝对路径>`。仓库里碰巧存在其他 `task.md` 不表示它们属于当前工作。

## 创建 Task

新任务使用稳定的 `<YYYYMMDD>-<slug>` 标识，并只选择一个位置：

```text
目标项目已有、未追踪且已被本地忽略的 studio/：<repo-root>/studio/tasks/<task-id>/
其他情况：                                      ~/.longrein/studio/tasks/<task-id>/
```

使用项目内 `studio/` 前运行：

```bash
git check-ignore -q studio/ || printf '\nstudio/\n' >> "$(git rev-parse --git-path info/exclude)"
```

不要修改 `.gitignore`，不要暂存或提交本地 Task 产物。若 `studio/` 已被追踪或 Task 产物本身需要交付，使用用户目录下的位置。

使用 `longrein_task_create` 创建，不手工建立核心文件。

Runtime 创建 `status: shaping` 的 Task，分配全局唯一 `taskUid`，保留原始请求，生成 `.runtime/state.json`、`.runtime/summary.json`、`task.md` 与 `timeline.md`，并在当前 Longrein Home 中注册入口。仓库不是任务对象时省略 `--repository`。

## 建立可信 Context

新 Task 先让 `shape` 接触真实对象。Goal、Scope 与完成条件尚未成立时保持 `unresolved`，不要为了填满视图提前制造承诺。需要理解生成视图的固定章节时读取 [Task Context demo](references/templates/task-context.demo.md)，但不能复制模板后直接编辑 `task.md`。

调查和用户裁决足以支撑承诺后，通过 `longrein_task_context` 建立 Goal、Scope、Non-goals、Completion Evidence、Must Preserve、Git 意图、Task Operating Envelope 与下一步。关键用户决定使用任务内唯一的 `UD-###`；Agent 的 `AD-###` 留在所属专业产物。

首次建立承诺不需要 `--decision`。已经生效的 Goal、Scope、Non-goals、Completion Evidence、Must Preserve 或 Git 意图准备变化时，先按 [Task Context report demos](references/templates/task-context-report.demo.md) 向用户说明冲突、证据、代价和影响；用户明确批准后，使用新的 `UD-###` 和 `--decision UD-###` 更新。事实、假设或 Operating Envelope 变化不冒充用户决定。

激活、首次建立可信 Context 或发生实质变化时，按 report demo 向用户报告变化量；普通工作进度不重复整份 `task.md`。

## 用工作单元维持状态

Task Runtime 不使用 Hook，也不记录普通工具调用。每个会修改代码、专业产物、任务判断或验证状态，并且需要交接的工作单元遵循同一边界：

1. 开始前使用 `longrein_work_start`，写清 Now 与预期 Next；
2. 先修改真正拥有结论的代码或专业产物；
3. 用 `longrein_checkpoint` 汇总已经成立的 finding、artifact 与 verification；Context 变化仍使用 `longrein_task_context`；
4. 成功或阻塞时在同一语义检查点中 finish 或 block；
5. 交接前使用 `longrein_task_read` 的 `doctor`。

不要为每次读取、搜索或命令创建工作单元。边界保护的是可交接状态：不能让仓库变化、产物 hash、Task 视图和声明结果在交接时互相矛盾。

`.runtime/state.json` 是核心机器状态，`.runtime/summary.json`、`task.md` 和 `timeline.md` 是 Runtime 生成投影或视图。`task.md` 的固定形状见 [Task Context demo](references/templates/task-context.demo.md)，`timeline.md` 的固定形状见 [Task Timeline demo](references/templates/task-timeline.demo.md)；两个 Demo 只用于理解生成产物，不能复制后手工维护。任何 Skill 都不能直接编辑这四个文件。`doctor --fix` 只能重建三个生成文件并修复 Registry 指针，不能把未登记的代码变化、产物漂移或手工文字承认为有效状态。

如果 MCP 不可用、调用失败或状态损坏，停止依赖该状态更新的工作并报告阻塞；不要改用 shell 或手工编辑核心文件。`checkpoint` 部分失败时先读取当前 Task 和已完成步骤，再决定新的调用，不能盲目重放。已经产生的专业产物保持原样并明确标为尚未同步，不能声称 Task 已可交接或完成。

## 按任务需要组合专业能力

- 方向、边界、根因、关键系统形态或实现路线不清楚：`shape`；
- 已有方向需要用户分轮裁决隐含决定：`grill`；
- 方向和关键结构明确并已授权修改：`dev`；
- 需要独立压力检查：`review`；
- 需要执行证明：`test`；
- 用户需要理解现状或成果：`walkthrough`。

Skill 是工作单元使用的能力，不是 Task 生命周期。Task 状态由 Runtime 根据真实推进维护为 `shaping | ready | working | waiting | blocked | verifying | complete`；不再继续的 Task 显式进入 `abandoned` 或 `superseded`。Runtime 不要求所有任务经过固定阶段。

## 完成

只有可信 Task Context 已建立、没有活动或阻塞的工作单元、每项 Completion Evidence 都已通过、关键产物存在且 hash 一致、仓库变化已在工作单元边界解释、生成视图无漂移时，才先用 `longrein_task_read doctor` 检查，再使用 `longrein_task_close` 的 `complete`。

完成门禁失败时修订真正的代码、专业产物、证据或 MCP 登记；不要绕过门禁，也不要创建第二份任务摘要。
