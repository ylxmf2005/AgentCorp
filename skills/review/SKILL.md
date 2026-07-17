---
name: review
description: 对需求、设计、计划、代码、diff、MR 或交付物做独立冷读，从当前 Task Context 锁定 scope、Git baseline 与 Task Operating Envelope，按行为风险、变更纪律、架构维护等簇建立完整覆盖，并在报告前独立证伪每个 finding。用于用户要求 review、判断 MR/方案能否前进、检查修复是否优雅而非 hack、寻找隐藏风险，或重要产物需要在测试、合并或交付前接受独立压力时。用户明确要求直接实现或修复、没有可审查对象、只需解释现状，或为了“更严格”给小改动制造评审团时不要触发。
---

# review

## 从冷上下文重新建立判断

评审不是替作者润色，也不是把最佳实践清单念一遍。先确认被审查对象的准确版本、它承诺什么、相对哪条基线变化，再尝试构造会让承诺失败的真实输入、调用链、状态变化或长期成本。

证据高于数量、语气和身份。作者摘要、已有结论、测试名称和多个审查者的共识都只是线索；没有自己走通的路径，就还不是问题项。

## 锁定对象、边界和完整变化面

按常驻 Context 协议固定目标、scope、non-goals、must-preserve、Task Operating Envelope 和 Git 意图。打开原始需求、设计、计划、diff、调用者和必要历史，不把摘要当作替代。代码变化记录实际 inspected commit、未提交差异、baseline、相对 target 的交付状态以及会合入的 diff；基线 unresolved 且会改变对象时，只暂停依赖它的审查路径。

先列出全部可审查面，再按风险分配深度。完整覆盖不等于平均用力，但每个变化文件、关键章节或受影响消费者都应被检查、明确判定无关，或记录为证据缺口。发现第一个问题后继续看完整对象。

变化审查只把本次变化引入或显著放大的问题归到当前对象。既有问题只有在用户要求整体审计，或它会使本次结论失真时才展开，并明确它不是本次变化引入的。

## 建立 Review Envelope

在展开 finding 前记录审查对象、baseline、任务承诺、Task Operating Envelope，以及每个 review type 的 `reviewed | not-applicable | evidence-gap`。`not-applicable` 必须有证据；“作者说不会发生”和“普通用户一般不会这样做”不能推翻 retry、重复回调、多 worker、公共入口或运行数据。

所有评审都考虑正确性、scope/change hygiene、standards、simplicity/cleanliness、taste/architecture 与 project stewardship；公共接口才深入兼容性，鉴权和不可信输入才深入安全，I/O、异步和恢复才深入可靠性，热路径与有来源规模才深入性能，高风险组合才深入 adversarial。

使用 [review-witnesses.md](references/review-witnesses.md) 的因果见证，按三个簇组织覆盖：

1. **Behavior & Boundaries**：correctness、compatibility、security、reliability、performance、adversarial/composition；
2. **Change Integrity**：scope/change hygiene、standards、simplicity、cleanliness/dead code、comments 与 test adequacy；
3. **Architecture & Stewardship**：taste/honest shape、architecture boundary、project fit、ownership、maintenance 与 debt/public surface。

簇是覆盖结构，不是固定 Reviewer 名单。小改动由同一上下文分簇检查；大型、跨组件、高风险、强路径惯性或争议性对象，只有独立 Agent 能实质减少共同盲区、平台允许且成本值得时才按 substantive clusters 拆分，最后由一个 lead 从原始对象和证据汇总裁决。独立性来自重新走通证据，不来自增加赞成票。

## 问题项必须拥有可走通的见证

一项问题至少包含：

- 具体输入、状态、调用者、扰动或代码结构；
- 它经过的文件、接口、分支或状态转换；
- 最终错误、破坏的承诺或由谁承担的长期成本；
- 可打开的文件行号、命令、请求、日志、规则原文或其他证据；
- 最小正确处理方向，以及仍未确认的边界。

风格偏好、理论可能和“最好再加一层保护”不满足问题项标准。结构问题还要给出更诚实的形态和实际价格；只说“应该重构”不是结论。

## 分开记录问题的五个维度

每个问题项分别记录：

- **类别**：它属于正确性、安全、可靠性、性能、兼容性、标准、简洁性、形态、范围、项目承担或其他哪类风险；
- **优先级**：问题发生后的影响；
- **证据状态**：目前知道它有多真；
- **Scope relation**：它与本次变化和交付范围是什么关系；
- **处理方式**：当前对象应当怎样前进。

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

优先级不替代处理方式。一个 `P2` 的明确规范违反可以是 `fix-now`；高优先级也不自动授权评审者扩大范围。代码变化新引入的 `P0`、`P1`、`P2` 默认不能以 `follow-up` 掩盖，除非当前变化移除相关行为，或 Owner 明确接受剩余风险。

## Review your findings

报告前把每个候选当成未证实假设重新检查，不继承最初措辞。主动寻找上游门、权限、类型保证、调用契约、已有补偿、Task Operating Envelope 和明确设计；依赖 SDK、协议、标准或外部系统语义时查一手文档、源码或可重放证据。分别判断问题是否真实、原机制/影响/P 是否正确、是否由本次变化引入或放大，以及正确处理是否应落在本任务。

最终每个候选只能进入 `confirmed`、`partial`、`needs-more-evidence` 或 `overruled`。失败于证伪不等于 confirmed；多个 Reviewer 同意也不是证据。真实契约缺失且会改变裁决时保留 `needs-more-evidence`，不选一个方便的 fixture 把不确定性跑成 confirmed 或 approve。

## 给出一个裁决

最终结论使用：

- `approve`：没有 `fix-now` 问题，关键证据足够，剩余风险已说明；
- `request_changes`：至少一个已确认或核心成立的 `fix-now` 问题；
- `needs_more_evidence`：命名明确的证据缺口可能改变是否前进的判断；
- `blocked`：审查对象不可用或审查任务被取消。

`follow-up` 和 `owner-decision` 不得静默消失；它们必须说明当前对象为何仍可前进、谁承担剩余风险以及下一负责人。缺少证据时不要用低优先级包装不确定性，也不要用高优先级包装猜测。

评审可以运行窄复现来确认问题；完整 TestPlan、E2E 和覆盖结论属于 `test`。评审发现需求或方向本身错误时回到 `shape`，发现结构决定不成立时交给 `design`，不在错误框架里只修表面。

## 保持作者与裁决分离

默认不直接修改自己正在批准的产物。用户要求 review 后修复时，先保存评审结论，再进入 `dev`，最后只复核受影响的问题和新 diff。

## 产物

简单评审可直接在对话给出结论。需要保存或交接时写入：

```text
<task-workspace>/review/review.md
```

结果依次写：审查结论；`fix-now` blocker 索引；Review Envelope 与 type coverage ledger；按 cluster/type 分组、每个 type 内按 `P0` 到 `P3` 排序的问题项；Finding Audit 中的 partial、overruled、高信号误报和重复项；Owner decisions 与 follow-ups；证据缺口与剩余风险。问题项的完整字段使用 [review-witnesses.md](references/review-witnesses.md) 中的唯一模板。

低风险小对象把 Envelope 和 coverage 压缩成一个短表或几行，只展开实际有 finding、evidence gap 或高信号 overruled 的类型；不要为显示完整而生成十几个空章节。类型没有静默消失即可，不用平均分配篇幅。

完成时，被审查对象、版本和持久 `context_revision` / `scope_revision`（若有）明确，完整变化面已经检查，每个 review type 都有状态，所有报告的问题都有因果见证并经过 finding audit，误报与 scope 外问题没有被包装成当前 blocker，未检查表面和证据缺口没有被静默写成 `approve`。
