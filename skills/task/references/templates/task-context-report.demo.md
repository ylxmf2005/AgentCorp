# Task Context Report Demos

## Task Activated

```markdown
Active Task：`<task.md 的绝对路径>`

- Continuity：new | resumed
- Status：shaping | ready | working | waiting | blocked | verifying
- Now：<当前正在调查、恢复或核验什么>
- Next：<下一步怎样形成或继续可信 Context>
```

这条消息只确定当前 Session 使用哪个 Task，不表示 Goal 或 Scope 已经成立。

## First Established

```markdown
任务上下文已建立

- Goal：<用户最终能观察到的结果>
- Scope：<本次负责的边界>
- Non-goals：<本次明确不做的内容>
- Done when：<关键完成证据>
- User decisions：<本次生效的 UD-### 及其简短内容>
- Task：`<task.md 的绝对路径>`
```

只有 Runtime 已建立可信 Context 且 `longrein_task_read doctor` 没有发现状态漂移时使用。方向仍在形成时，不把候选 Goal 或 Scope 写成已建立。

## Fact Change

```markdown
任务上下文已更新：context r<old> → r<new>

- 新证据：<刚确认的事实>
- 变化：<它改变了哪个后续判断>
- 影响：<需要重新核验或已经失效的产物>
- Scope：未变化
- Next：<下一步读取什么、做什么>
```

只报告会改变后续判断的事实。Current Work、Artifact Map 或普通执行状态更新不使用这份消息。

## Scope Change Proposal

```markdown
发现需要修改任务承诺

- 当前边界：<task.md 中已经批准的内容>
- 建议变化：<准备增加、删除或改道的内容>
- Decision impact：<新增哪些 UD；是否与现有 UD 冲突或准备 supersede>
- 原因和证据：<为什么原承诺不再诚实>
- 代价：<工作量、风险、兼容或时间变化>
- 影响：<哪些现有产物需要重新核验>

请确认是否按这个变化更新任务范围。
```

用户决定前不要更新 `scope_revision`，也不要让依赖候选范围的实现继续前进。

## Scope Change Applied

```markdown
任务范围已更新：scope r<old> → r<new>，context r<old> → r<new>

- 已确认变化：<用户批准的承诺变化>
- User decision：<新 UD-###；若替换旧决定，写 supersedes UD-###>
- 保持不变：<仍然有效的重要边界>
- 失效产物：<需要重做或重新核验的产物>
- Next：<下一步读取什么、做什么>
- Task：`<task.md 的绝对路径>`
```
