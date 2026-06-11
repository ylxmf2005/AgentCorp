# Scope Residue 审查

只在多 commit 功能分支、需求中途变化、用户怀疑早期实现错了、公共/共享契约被顺带改变、兼容入口被废弃、fallback 行为变化，或某个 hunk “有解释但不像本需求必需”时加载。

## 核心原则

当前分支历史不是用户意图的证据。早期 commit 可能来自模糊需求、错误假设或探索性修补；后续 review 如果只沿着历史解释，很容易把残留当成既定事实。

默认问一句：**如果今天 fresh start，只按当前 approved requirements / Story Spec / contracts 做，还会改这里吗？**

答案不是明确的“会”时，不要静默放过：

- 能证明不是本需求需要的，报 `scope-residue`。
- 可能合理但缺 source artifact 支撑的，报 `intent-trace-gap` 或 `needs_human_intent`。
- 改变 public/shared 契约、兼容入口、错误语义、缓存/持久化 key 的，报 `contract-drift`，除非 contract 明确授权。

## 建立审查对象

先从 diff 中列出语义变化，而不是只列文件：

- public/shared API、request/response schema、字段是否 required/deprecated、错误码或错误消息语义。
- 缓存 key、持久化 key、查找优先级、fallback、默认值。
- 权限/管理员校验所在层级及调用时机。
- handler/service/model 边界变化。
- 新增兼容 shim、双入口、废弃 warning、迁移或删除老入口。
- 与本需求无关但被一起改掉的行为分支。

对每项语义变化建立一行 trace：

`change -> source artifact -> why required -> compatibility impact -> action`

其中 source artifact 可以是 requirements、Story Spec、api-contract、diagnosis、review finding、测试失败或明确用户指令。找不到 source artifact 不是小问题；这就是本角色要抓的缺口。

## 判定问题

逐项问：

- **当前需求要求了吗？** 不是“能解释”，而是能否从 approved source artifacts 自然推出。
- **fresh start 会做吗？** 如果从干净基线实现本需求不会碰它，它倾向于 residue。
- **删掉/回退它会破坏验收标准吗？** 不破坏则倾向于回退或拆出。
- **它是否改变既有调用方契约？** 改 public/shared contract 而没有明确授权时，默认阻塞。
- **它是否只是为历史错误补兼容？** 如果兼容只服务早期错误改动，应该回退错误改动，而不是保留兼容层。
- **它是否应该另开 MR？** 合理但非本需求必要的 cleanup、分层收口或迁移，建议拆出。

## 常见 finding

- **早期假设残留**：早期 commit 为一个后来被推翻的模型/字段/流程做了改动，后续实现继续兼容它。
- **需求外契约漂移**：字段废弃、入口删除、fallback 顺序改变、错误语义改变，但当前需求没有要求。
- **历史错误上的补丁**：为了不回退早期错误，新增兼容、warning 或双路径，导致分支继续背负错误。
- **顺手架构收口混入行为变化**：分层调整本身合理，但夹带了调用契约变化。
- **审查可追溯性不足**：implementation result 或 diff 说明没有列出行为变化来源，reviewer 只能脑补。

## 输出要求

每条 finding 包含：

- 严重程度：破坏兼容或改变 public/shared contract 通常 P1/P2；纯拆分建议通常 P3。
- 置信度：高/中/低；依赖用户意图时标 `needs_human_intent`。
- 证据：文件/行号或 hunk、读过的 source artifact、缺失的 trace。
- 影响：为什么这会污染本 MR、误导 reviewer，或降低后续成功率。
- 建议：回退、删掉、拆 MR/commit、保留但补明确授权，或让发起人裁决。

不要因为一个改动“看起来合理”就放过。合理但追溯不到本需求，仍然是 change hygiene 问题。
