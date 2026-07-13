# Compound(沉淀)

每完成一件事,都应该让下一件更容易——但一条没人重读的被动笔记什么也不会变容易。`compound` 是把本轮教训变成**自己会改变未来行为的资产**的 phase:一个 bug 变成一条回归测试,一个决定变成下个 agent 动手前会读到的规则,一个被证实的评审模式变成一条待 sponsor 批准的 reviewer 提案。它位于每条 paradigm 中 `acceptance-review` 与 `deliver` 之间,由 `compound` skill 拥有,走和其它非评审 phase 一样的管线:`full-delegation` 下带 assignment/receipt 派发,`direct`/`partial-delegation` 下由 Delivery Orchestrator 按同一纪律亲自执行,任何模式都要写 `manifest.md` 条目,做没做看得见。

它是**软 phase**:写进 phase 列表本身就是让它发生的机制(orchestrator 自然走到这一步,而不是靠埋在参考文件里的提醒),但 `deliver` 永远不因它被硬卡——被逼出来的沉淀是 theater,theater 比沉默更糟。跳过是可见的(delivery report 的 compound 一栏留空,且任务的阶段序列有 `deliver` 无 `compound` 时 `validate-handoff.py` 会告警),但从不被 police。对本轮盘问用多大力气由 `sweep:` 参数决定(`line|core|full`),派发时由 orchestrator 从 effort 档位编译而来——见 SKILL.md。

## 三种主动资产

| 资产 | 由什么触发 | 落到哪 | 自动程度 |
| --- | --- | --- | --- |
| 回归测试 | 本单修复或复现过的 bug | 目标仓的测试套件(遵循 `regression-tester` 同样的纪律:修前失败、修后通过) | 直接落——这本就是修好一个 bug 该交付的一部分 |
| 规则 / 约定 | 本单发现的仓库陷阱或定下的约定 | 目标仓的 `CLAUDE.md` / `AGENTS.md` | 直接落 |
| Reviewer 触发条目 | 本单确认的、可复用的评审发现模式 | AgentCorp 自己的 reviewer skill——**仅作为提案**:先按其 `proposal-format.md` 写进 `teamspace/skill-evolution/pending/`(附证据),再在 `deliver` 时向 sponsor 点名,得到明确同意后才落地(skill 修改权在人) | 提案入 `pending/` → sponsor 批准 → 落地 |

三种都不匹配的教训仍写入下述持久条目——但先问一遍能否成为主动资产;笔记是兜底,不是默认。

## 持久存储与形制

跨任务知识存于 `teamspace/compound/<slug>.md`(此存储取代 `teamspace/learnings/`;碰到旧条目时顺手迁移)。一条一文件,frontmatter 可 grep:

```yaml
---
slug: <hyphenated-english>
date: <YYYY-MM-DD>
task_id: <source task>
type: repo-trap | root-cause | process | convention | failed-approach
applies_when: <一行:什么情形下应该想起这条>
tags: [module-name, error-keyword, domain-word]
---
```

正文最多四段:触发情形 → 根因或事实 → 该怎么做 → 下次怎么更快。一屏读完;需要展开的证据引用来源任务的 artifact 路径而不是复述。同步规则与其它 `teamspace/` artifact 一致。

`failed-approach` 是一等类型:试过并放弃的路,连同原因。fresh-start handoff 携带的 `FAILED:` 标记正是这一类——在知道它们的上下文消亡之前写进来。

## 什么够格

- 本次令人意外或反直觉的事实(看起来是 X,根因其实是 Y)。
- 多次修复失败后才找到的根因;诊断揭示的非显然机制。
- 仓库/系统特有、repo 文档和 CLAUDE.md 都没记的陷阱或约定。
- 试过但不行的路,连同原因(`failed-approach`)。
- 过程教训:某个 phase 的 artifact 形制不够用、某类 reviewer 的系统性假阳性模式、某道 gate 放行错误的原因。指向 skill 自身文本的教训,写成 **reviewer 触发条目 / skill 提案**存入 `teamspace/skill-evolution/pending/` 交给 sponsor——绝不静默改 skill。

不记:一次性琐事;repo 文档、CLAUDE.md 或 git 历史已有的内容;只对本任务有意义的细节。唯一判据:**换一个未来任务上的 agent,读了这条能不能少走一步弯路?** 不能就不写——诚实的"无可沉淀"胜过凑数。

## 先去重,再动笔

动笔前按模块、报错信息、关键词 grep `teamspace/compound/`。与既有条目高度重叠(同一问题、同一根因)→ **更新旧文件**并刷新 `last_updated`;两份描述同一问题的文档必然漂移,而更新的上下文更可信。只有同一领域、确实不同角度才新建文件,且两条互相点名。

## 何时运行,用多大力

- **作为 phase**:在 `acceptance-review` 之后、`deliver` 之前,只在走到 deliver 的路径上运行。reject/rework 路径上的沉淀由下述随手记承担(尤其 `failed-approach`)。
- **按任务缩放**:一行改动的沉淀就是 delivery report 里一句"本轮无可沉淀",然后继续。bugfix 或中型任务通常至少要过一遍回归测试之问。绝不让 compound 把小任务变重。
- **随手记(事件驱动)**:可沉淀的时刻发生时——`diagnose` 得出反直觉根因、`review-research` 推翻一批假阳性、踩到仓库陷阱、fresh-start handoff 即将丢弃辛苦换来的死胡同——**当场**记一笔轻量笔记,趁上下文还知道它。`compound` phase 负责把这些零碎收拢成三种资产;它不依赖任务结束时的记忆。

## 回流(取用侧)

记下来只是一半;另一半是下个任务真的读到它。

- **在 `intake` / `validate-requirements` 开始时**,按任务关键词(模块、报错信息、领域词)grep `teamspace/compound/`;先读 frontmatter 判相关性,命中才读正文。
- 把相关条目以 **路径 + 一行摘要** 喂进下游 assignment——`architecture`、`diagnose`、`implementation-plan`、`review-research` 受益最大。对 owner 而言,compound 条目是线索不是指令;它反映的是记录时的事实,代码可能已经变了。
- 修 bug 时优先搜 `root-cause` / `repo-trap` / `failed-approach`——同类问题可能已经解过一次,或已有已知的死胡同。

## 产出

按 `references/templates/compound-result.demo.md` 写 `teamspace/tasks/<task_id>/compound/compound-result.md`(`artifact_type: CompoundResult`,`author_agent: compound`——orchestrator 亲自执行该 phase 时写 `delivery-orchestrator`):落了哪些回归测试、写了哪些规则、提了哪些 reviewer 触发提案(或诚实的"无可沉淀"),每项带落点路径。在 delivery report 和给 sponsor 的最终回复里用一句话概括——例如"本轮沉淀:加了 1 条回归测试,给目标仓 CLAUDE.md 加了 1 条规则,有 1 条 reviewer 触发词建议待你确认。"
