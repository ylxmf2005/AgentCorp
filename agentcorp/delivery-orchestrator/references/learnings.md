# 学习沉淀（Learnings）

每完成一份工作，都该让下一份更容易。第一次解决一个问题要花研究；沉淀下来，下次同类问题就是几分钟的查阅。流水线的其他产物（delivery report、research、walkthrough）都只面向**这一个任务**；`teamspace/learnings/` 是唯一跨任务存活的层——没有它，每个任务都从零开始，同样的坑反复踩。

## 存放与形态

一条教训一份文件：`teamspace/learnings/<slug>.md`，frontmatter 可被 grep 检索：

```yaml
---
slug: <短横线英文>
date: <YYYY-MM-DD>
task_id: <来源任务>
type: repo-trap | root-cause | process | convention
applies_when: <一句话：什么情景下该想起它>
tags: [模块名, 错误关键词, 领域词]
---
```

正文四段以内：触发情景 → 根因或事实 → 该怎么做 → 下次怎么更快。短到一屏读完；要展开的证据引用来源任务的产物路径，不复述。Workspace 与 Location 的同步规则与其他 `teamspace/` 产物相同。

## 什么值得沉淀（门槛）

- 这次让人意外、与直觉相反的事实（看着像 X，根因其实是 Y）。
- 反复修不动之后才找到的根因；诊断揭示的非显然机制。
- 仓库/系统专有的陷阱与约定，而 repo 文档、CLAUDE.md 都没记。
- 流程教训：某个 phase 的产物形态不够用、某类 reviewer 的系统性误报模式、gate 误放的原因。指向某个 skill 文本本身的教训照样沉淀为 `process` 类，并在 deliver 时向发起人点名——skill 的修改权在人。

不沉淀：一次性琐事；repo 文档、CLAUDE.md 或 git history 已记录的；只对本任务有意义的细节。判据只有一条：**下一个不同任务的 agent 读到它，会不会少走弯路**——不会就不写，不要为了仪式感凑条目。

## 先查重，再写

动笔前先按模块、错误信息、关键词 grep `teamspace/learnings/`。与现有条目高度重叠（同一问题、同一根因）就**更新旧文件**、补 `last_updated`，不要新建第二份——两份描述同一问题的文档必然漂移，新上下文更可信，就把它折进旧文件。同一领域、不同角度才新建，并互相点名。

## 何时写

- **deliver 收尾时回顾**：本次有没有过门槛的教训？有就写，没有就明确不写。
- **任务中途也写**：fresh-start 重启前（教训最高发的时刻，别让它随旧对话丢失）、review-research 推翻一批误报后、诊断出非显然根因后。趁上下文新鲜写，不要等到 deliver 时已经忘了细节。
- 这不是 human gate：沉淀是编排者的内务，三种 mode 下都静默执行，对话里一句话带过即可；发起人明确不要时尊重。

## 何时查（回流）

- **intake / validate-requirements 开始时**，按任务关键词（模块、错误信息、领域词）grep `teamspace/learnings/`，命中的先读 frontmatter 判相关性，相关才读正文。
- 相关条目以**路径 + 一句话提要**写进下游 assignment 的上游上下文——`architecture`、`diagnose`、`implementation-plan`、`review-research` 最受益。learning 对 owner 是线索不是指令，采不采纳由它对着当前代码判断（条目反映的是写下时的事实，代码可能已变）。
- 修 bug 时尤其先查 `root-cause` / `repo-trap` 类——同类问题可能已经解过一次。
