# Task Runtime

Task Runtime 为显式启动的长期任务保存唯一机器状态，并在工作单元、产物和完成证据之间建立可检查的交接边界。它不监听每次工具调用，也不要求所有任务经过固定 Skill 阶段。

## 目录与所有权

```text
<task-workspace>/
├── task.md              Runtime 生成的当前人类视图
├── timeline.md          Runtime 生成的任务历史
├── .runtime/
│   ├── state.json       核心机器状态，只有 Runtime 修改
│   └── summary.json     供 Registry 与 Dashboard 聚合的轻量投影
└── <专业产物>            Shape、Dev、Review、Test 等各自拥有
```

`.runtime/state.json` 是 Task 当前状态的唯一来源。`summary.json`、`task.md` 与 `timeline.md` 都是生成投影，不能直接编辑。

专业产物不属于 Runtime。对应 Skill 先修改自己拥有的 requirements、design、plan、report 或其他真实产物，再通过 MCP 登记其状态、内容 hash、影响和下一位消费者。

## Task Context

Task Context 保存用户承诺和执行边界：

| 字段 | 含义 |
| --- | --- |
| Goal | 最终要取得的结果 |
| Scope | 当前任务实际负责的范围 |
| Non-goals | 明确不在本次承诺中的内容 |
| Completion Evidence | 看到哪些证据才算完成 |
| Must Preserve | 不能破坏的现有行为 |
| Operating Envelope | 当前承诺覆盖的真实运行范围 |
| Assumptions | 尚未被事实推翻的工作前提 |

`UD-*` 表示只有用户能替换的决定。`AD-*` 表示 Agent 在专业产物中形成、可以被证据和评审修订的专业判断。Runtime 保存当前承诺和引用关系，不取代专业产物本身。

## Registry

每个 Task 有全局唯一的 `taskUid` 和供人阅读的 `taskId`。Registry 位于：

```text
${LONGREIN_HOME:-~/.longrein}/registry/tasks/<taskUid>.json
```

Registry 只保存 Task workspace、状态文件与摘要文件的位置，不复制 Task 当前状态。Task 可以通过 workspace 路径、UID 或唯一 task id 解析；重名 id 不能被猜测选择。

Dashboard 和 MCP 只读取已注册 Task。Longrein 不扫描整台电脑，也不按目录名称或修改时间猜测 Task。

## 状态与工作单元

```text
shaping → ready → working → verifying → complete
                    ↘ waiting | blocked
```

`abandoned` 与 `superseded` 是其他终态。Shape、Dev、Review 和 Test 是专业能力，不是 Runtime 的固定生命周期阶段。

工作单元记录需要恢复或交接的一段语义工作。开始时保存 Now 与仓库基线；finish 或 block 时保存结果、下一步与新快照。普通读文件、搜索和局部命令不会自动进入 Timeline。

## 投影与 Timeline

- `task.md` 表达当前有效的承诺、状态、发现、产物入口和完成证据；
- `timeline.md` 表达 Task 如何走到当前状态；
- `summary.json` 只保存目录与 Dashboard 首屏需要的轻量字段；
- 专业结论留在真正拥有它们的产物中。

当前状态不会在多个文档中平行维护。源产物先更新，MCP 检查点再保存 Runtime 事件并重新生成投影。

## 健康检查与漂移

Runtime doctor 会检查：

- 核心状态是否可读且属于当前 workspace；
- Registry 入口是否和 Task UID、workspace 一致；
- 三个生成投影是否和核心状态一致；
- active、ready、verified 产物是否存在且 hash 未漂移；
- 配置了 repository 时，最近工作单元后是否出现未解释的 Git 变化；
- 已完成 Task 是否仍满足完成证据。

生成投影或 Registry 指针可以安全重建；产物漂移、代码变化和语义缺口必须回到真实对象处理，再通过 MCP 重新登记。修复投影不能把未知变化自动承认为有效状态。

## 完成门禁

完成 Task 至少要求：

- 已建立可信 Goal、Scope 与 Completion Evidence；
- 当前没有 active、waiting 或 blocked 工作单元；
- 每项 Completion Evidence 都是 `passed`；
- 生成投影与 Registry 一致；
- 已登记产物存在且 hash 没有漂移；
- 配置了 repository 时，没有工作单元之后的未解释 Git 变化。

门禁失败时，修订真正的代码、专业产物、证据或 Runtime 登记。不能用投影修复掩盖语义缺口。

Agent 协议见 [MCP](mcp.md)，人类可视化入口见 [Task Dashboard](dashboard.md)。
