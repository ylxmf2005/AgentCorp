---
name: review
description: 对需求、设计、计划、代码、diff、MR 或交付物做独立冷读，从当前 Task Context 锁定 scope、Git baseline 与 Task Operating Envelope，检查行为风险、变更纪律、架构维护，以及决定授权、专业产物、实现和 Task Runtime 状态是否一致，并在报告前独立证伪每个 finding。用于实现 Phase 完成后的轻量审查、最终综合审查、用户要求 review、判断 MR/方案能否前进、检查修复是否优雅而非 hack、寻找隐藏风险，或重要产物需要在测试、合并或交付前接受独立压力时。用户明确要求直接实现或修复、没有可审查对象、只需解释现状，或为了"更严格"给小改动制造评审团时不要触发。
---

# review

## 从冷上下文重新建立判断

评审不是替作者润色，也不是把最佳实践清单念一遍。先确认被审查对象的准确版本、它承诺什么、相对哪条基线变化，再尝试构造会让承诺失败的真实输入、调用链、状态变化或长期成本。

证据高于数量、语气和身份。作者摘要、已有结论、测试名称和多个审查者的共识都只是线索；没有自己走通的路径，就还不是问题项。

Review 使用同一套判断做不同深度的审查。`phase` 模式只锁定一个 Phase 的实际变化和它应当影响的决定、产物与状态，报告按风险压缩；`delivery` 模式在最终交付前重新检查完整 diff、与当前交付有关的专业产物和决定、Runtime 状态及验证入口。既有决定只在本次变化依赖、改写、冲突或来源会影响授权时进入审查，不重新讲解全部历史。轻量表示对象更窄、表达更短，不降低决定来源、授权和一致性要求；极小机械变化可以只做一次合并后的交付审查。

## 锁定对象、边界和完整变化面

当前 Session 已宣布 Active Task 时，先通过 Longrein MCP 读取当前 Task、Task Operating Envelope、Git 意图、Artifact Map 和必要 Timeline，再核对实际用户决定、当前 requirements、design、contract、migration、Plan、专业报告与 Runtime 投影。需要把评审保存或交接到 Task 时，在形成持久报告前用 `longrein_work_start` 建立工作单元；Runtime 调用失败时公开阻塞，不改用 shell 或直接编辑核心文件。打开原始需求、设计、计划、diff、调用者和必要历史，不把摘要当作替代。代码变化记录实际 inspected commit、未提交差异、baseline、相对 target 的交付状态以及会合入的 diff；基线无法确认且会改变对象时，只暂停依赖它的审查路径。

同时区分决策来源。`UD-*` 表示只有用户能最终替换，不表示评审不得质疑；如果它造成真实产品、架构或风险问题，照常报告并使用 `owner-decision`，引用具体 `UD-*` 和改变它所需的证据。`AD-*` 是 Agent 的专业判断，证据推翻时直接要求设计或实现修订，不因为用户曾审核过产物就把它误认为用户决定。文档中的标签不能创造授权；Agent 向用户报告过、用户看过或讨论过，也不等于用户明确选择了范围、风险或取舍。反过来，用户已经明确决定但当前产物或 Runtime 没有同步，同样属于真实问题。没有标记的作者叙述也不能凭语气升级为 `UD-*`。

先列出全部可审查面，再按风险分配深度。完整覆盖不等于平均用力，但每个变化文件、关键章节或受影响消费者都应被检查、明确判定无关，或记录为证据缺口。发现第一个问题后继续看完整对象。

变化审查只把本次变化引入或显著放大的问题归到当前对象。既有问题只有在用户要求整体审计，或它会使本次结论失真时才展开，并明确它不是本次变化引入的。

## 固定审查边界与类型覆盖

在展开 finding 前记录审查对象、baseline、任务承诺、Task Operating Envelope，以及每个 review type 的 `reviewed | not-applicable | evidence-gap`。`not-applicable` 必须有证据；"作者说不会发生"和"普通用户一般不会这样做"不能推翻 retry、重复回调、多 worker、公共入口或运行数据。

所有评审都考虑正确性、scope/change hygiene、standards、simplicity/cleanliness、taste/architecture 与 project stewardship；存在 Active Task、持久专业产物或实现交付时，同时检查 Task Coherence。公共接口才深入兼容性，触及信任边界、鉴权、凭据或敏感数据才深入安全，I/O、异步和恢复才深入可靠性，热路径与有来源规模才深入性能，高风险组合才深入 adversarial。

使用 [review-witnesses.md](references/review-witnesses.md) 的证据构造法，按四个簇组织覆盖：

1. **Behavior & Boundaries**：correctness、compatibility、security、reliability、performance、adversarial/composition；
2. **Change Integrity**：scope/change hygiene、standards、simplicity、cleanliness/dead code、comments 与 test adequacy；
3. **Architecture & Stewardship**：taste/honest shape、architecture boundary、project fit、ownership、maintenance 与 debt/public surface；
4. **Task Coherence**：decision provenance/authorization、code-artifact coherence、artifact/runtime synchronization 与 phase completion integrity。

簇是覆盖结构，不是固定 Reviewer 名单。小改动由同一上下文分簇检查；大型、跨组件、高风险、强路径惯性或争议性对象，只有独立 Agent 能实质减少共同盲区、平台允许且成本值得时才按 substantive clusters 拆分，最后由一个 lead 从原始对象和证据汇总裁决。独立性来自重新走通证据，不来自增加赞成票。

## 检查任务决定、产物与状态是否同源

Task Coherence 把四个表面放在一起核对：用户明确决定提供授权，代码与运行结果说明系统实际成为什么，专业产物保存当前模型，Task Runtime 保存当前状态与历史。任何一个表面都不能替另一个取得资格。

- 代码或文档扩大范围，但找不到用户明确选择：这是未授权变化；不能靠补一个 `UD-*`、更新 Scope 或把代码写完来追认。
- 用户已经明确决定，代码也按它实现，但 requirements、design、Plan、Artifact 或 Timeline 没有同步：这是当前模型或 Runtime 漂移，不需要假装重新讨论同一个决定，但必须补齐源产物和登记。
- 用户只收到报告、参与讨论、表示知悉或没有反对：仍然没有形成需要明确选择的 `UD-*`。
- 新实现判断值得被后续依赖、独立修订或审查，却只藏在代码或 Dev Report 中：要求把它形成或拆分为所属 Shape 产物中的 `AD-*`。
- 文档和代码一致，但文档把本应由用户决定的范围、兼容或风险取舍写成 `AD-*`：这是决定来源错误，不是文档同步成功。
- Plan 或 Runtime 声称 Phase/Task 已完成，但代码、产物、审查、验证或 Owner decision 仍缺：这是完成状态失真。

Review 不要求默认维护逐 hunk 对照表，但必须完整读取本次对象的实际变化面，并让每项有语义或结构影响的变化能够回到当前授权、专业决定、事实或约束。找不到来源时形成 finding，不用作者“应该只是实现细节”的解释填平。

## 问题项必须能走通证据链

一项问题至少包含：

- 具体输入、状态、调用者、扰动或代码结构；
- 它经过的文件、接口、分支或状态转换；
- 最终错误、破坏的承诺或由谁承担的长期成本；
- 可打开的文件行号、命令、请求、日志、规则原文或其他证据；
- 最小正确处理方向，以及仍未确认的边界。

风格偏好、理论可能和"最好再加一层保护"不满足问题项标准。结构问题还要给出更诚实的形态和实际价格；只说"应该重构"不是结论。

## 分开记录问题的资格、影响与修复落点

每个问题项分别记录：

- **类别**：它属于正确性、安全、可靠性、性能、兼容性、标准、简洁性、形态、范围、项目承担或其他哪类风险；
- **优先级**：问题发生后的影响；
- **证据状态**：目前知道它有多真；
- **Scope relation**：它与本次变化和交付范围是什么关系；
- **处理方式**：当前对象应当怎样前进；
- **修复落点**：应修实现、源产物、Runtime 状态，取得 Owner decision，重新 Shape，还是在错误前提已经扩散时 Rewind。

优先级使用：

- `P0`：普遍成立的发布阻断、严重安全或数据事故、不可逆灾难性错误；
- `P1`：具有现实触发路径的重要失败，应当紧急处理；
- `P2`：普通但真实、作者知道后应该修的问题，包括局部错误、边缘场景、明确项目规范违反和有具体成本的可维护性问题；
- `P3`：影响较低但确有价值的改进，只有价值具体或项目规则、用户要求需要时才报告。

证据状态使用：

- `confirmed`：已经独立走通问题路径；
- `partial`：核心问题成立，但原机制、影响范围、优先级或建议需要修正；
- `needs-more-evidence`：缺少能够命名和取得的证据，当前不能诚实判断；
- `overruled`：候选问题已被代码、契约或运行证据推翻，不再作为问题项。

Scope relation 使用：

- `introduced`：本次变化新引入；
- `amplified`：问题既有，但本次变化使它可达、扩散或成本显著增加；
- `pre-existing`：问题真实，本次变化没有引入或放大；
- `outside-delivery-scope`：问题真实，但当前任务的验收与承诺不依赖其修复。

Task Operating Envelope 中不存在的运行条件不写成 `outside-delivery-scope` finding。证据证明路径不可达时，它是 `overruled`；包络证据不足时，它是 `needs-more-evidence`。

处理方式使用：

- `fix-now`：属于当前对象，在它前进前解决；
- `follow-up`：问题真实，但当前对象可以前进，正确修复应进入独立任务；
- `owner-decision`：涉及产品价值、长期承诺、范围扩大或风险接受，需要 Owner 决定。

修复落点使用 `implementation | source-artifact | runtime-state | owner-decision | re-shape | rewind`，必要时组合多个落点。Review 要说明为什么缺的是文档同步、真实授权、实现修订还是状态修复，不能只说“保持一致”让下一位重新猜一遍。

优先级不替代处理方式。一个 `P2` 的明确规范违反可以是 `fix-now`；高优先级也不自动授权评审者扩大范围。代码变化新引入的 `P0`、`P1`、`P2` 默认不能以 `follow-up` 掩盖，除非当前变化移除相关行为，或 Owner 明确接受剩余风险。

## Review your findings

报告前把每个候选当成未证实假设重新检查，不继承最初措辞。主动寻找上游门、权限、类型保证、调用契约、已有补偿、Task Operating Envelope 和明确设计；依赖 SDK、协议、标准或外部系统语义时查一手文档、源码或可重放证据。分别判断问题是否真实、原机制/影响/P 是否正确、是否由本次变化引入或放大，以及正确处理是否应落在本任务。

最终每个候选只能进入 `confirmed`、`partial`、`needs-more-evidence` 或 `overruled`。失败于证伪不等于 confirmed；多个 Reviewer 同意也不是证据。真实契约缺失且会改变裁决时保留 `needs-more-evidence`，不选一个方便的 fixture 把不确定性跑成 confirmed 或 approve。

## 给出一个裁决

最终结论使用：

- `approve`：没有 `fix-now` 或未决 `owner-decision`，关键证据足够，剩余风险已说明；
- `request_changes`：至少一个已确认或核心成立的 `fix-now` 问题；
- `needs_more_evidence`：命名明确的证据缺口可能改变是否前进的判断；
- `blocked`：审查对象不可用或审查任务被取消。

`follow-up` 必须说明当前对象为何仍可前进、谁承担剩余风险以及下一负责人。未决 `owner-decision` 不能与 `approve` 并存：把需要取得的 Owner 决定或授权记录为具名缺口，使用 `needs_more_evidence`；Owner 接受后记录风险，承诺变化时先修订 Task Context，再重新裁决。缺少证据时不要用低优先级包装不确定性，也不要用高优先级包装猜测。

评审可以运行窄复现来确认问题；完整 TestPlan、E2E 和覆盖结论属于 `test`。评审发现 `UD-*`、需求、`AD-*`、契约、方向或关键结构需要改变时回到 `shape` 修订当前模型；不触及这些结构性前提的局部实现问题交给 `dev`；只缺 Runtime 登记时由产生该变化的 Skill 通过 Longrein MCP 修复。不要在错误框架里只修表面，也不要把缺少用户决定的问题降级成补文档。

## 保持作者与裁决分离

默认不直接修改自己正在批准的产物。任务根目录的 `plan.md` 和相关 Shape/Dev 产物对 Review 是只读输入：Review 在自己的报告中给出裁决、修复落点和需要改变的内容，不边审批边回写 Phase 状态、路线、决定或结果。阶段审查的 finding 交给 `dev`、`shape`、Owner 或产生状态的 Skill 处理，随后只复核受影响的问题和新对象；最终综合审查沿用同一原则。用户要求 review 后修复时，先保存评审结论，再进入对应 Skill，不能让修复动作抹掉原裁决。

## 产物

简单评审可直接在对话给出结论。当前 Session 有 Active Task 且需要保存或交接时写入：

```text
<task-workspace>/review/review.md
```

报告遵循 [Review 产物 demo](references/templates/review.demo.md)。它是完整报告结构和问题项字段的唯一来源；正文只定义评审判断，不维护平行模板。有交接意义的 Phase Review 和最终综合 Review 都可以更新这份当前报告，但必须写明模式、准确对象与 baseline；历史由 Timeline 保存，不在目录中堆积平行状态。

产物落盘后用 `longrein_checkpoint` 登记 Review 报告、下一位读者以及已经确认且会改变后续判断的 finding，并在同一语义检查点中 finish；阻塞时使用 block。Finding 若要求修订事实、专业结论、验证入口或产物可信度，把修复落点交给 Dev、Shape、Owner 或产生状态的 Skill；它们先更新源产物并登记，Review 再复核新对象。Review 的登记不代替责任方修改被审产物；承诺变化回到 `shape` 和用户决定。Runtime 更新 Current Work、Artifact Map 与 [Task Timeline](../task/references/task-timeline.md)，Review 不直接编辑核心状态文件。没有 Active Task 时在对话中报告，或只写用户指定的路径。

Phase 审查和低风险小对象把审查边界与 coverage 压缩成一个短表或几行，只展开实际有 finding、evidence gap 或高信号 overruled 的类型；不为显示完整而生成十几个空章节。最终综合审查覆盖完整交付切片；两种模式都不能静默省略 Task Coherence。

完成时，被审查对象、模式、版本和持久 `context_revision` / `scope_revision`（若有）明确，完整变化面已经检查，每个适用 review type 都有状态，代码、决定、专业产物和 Runtime 状态之间的不一致已经形成可路由 finding，所有报告的问题都有走通的证据链并经过 finding audit，误报与 scope 外问题没有被包装成当前 blocker，未检查表面和证据缺口没有被静默写成 `approve`。
