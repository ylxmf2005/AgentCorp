# 经验沉淀

每一次交付都应该让下一次更轻松。第一次解决某个问题需要研究成本；一旦沉淀下来，下次再遇到同类问题，翻出来看几分钟就够了。pipeline 产出的其他 artifacts（delivery report、research、walkthrough）都只服务于**当前这一个任务**；而 `teamspace/learnings/` 是唯一能够跨任务存活下来的层——没有它，每个任务都得从零开始，同一个坑反复踩。

## 存储格式与结构

一条经验一个文件：`teamspace/learnings/<slug>.md`，附带可 grep 的 frontmatter：

```yaml
---
slug: <hyphenated-english>
date: <YYYY-MM-DD>
task_id: <source task>
type: repo-trap | root-cause | process | convention
applies_when: <one line: in what situation should this come to mind>
tags: [module-name, error-keyword, domain-word]
---
```

正文最多四段：触发场景 → 根因或事实 → 该怎么做 → 下次怎么更快。短到一屏能读完；需要展开的证据，引用源任务的 artifact 路径，不要在这里复述。Workspace 和 Location 的同步规则与其他 `teamspace/` artifacts 一致。

## 什么值得记录（门槛）

- 这次让你感到意外或反直觉的事实（看起来是 X，根因其实是 Y）。
- 反复修复失败后才定位到的根因；诊断过程中暴露出的非显而易见的机制。
- repo 或系统特有的陷阱 / 约定，而 repo 文档和 CLAUDE.md 里都没写。
- 流程层面的教训：某个 phase 的 artifact 形状不够用、某类 reviewer 的系统性误报模式、某个 gate 错误放行的原因。哪怕是指向 skill 自身文本的教训，也作为 `process` 类型记录，并在交付时点名给 sponsor——skill 的修改权始终归人类。

不要记录：一次性 trivia；repo 文档、CLAUDE.md 或 git history 里已有的内容；只对当前任务有意义的细节。唯一判断标准：**换了一个 agent，在做下一个不同的任务时读到这条，能不能避免走错路**——如果不能，就别写；不要为了仪式感硬凑条目。

## 先查重，再落笔

动笔之前，先用 module、error message、keyword grep `teamspace/learnings/`。如果和已有条目高度重叠（同一个问题、同一个根因），**去更新旧文件**并把 `last_updated` 往后推；不要另起一篇——两份文档描述同一个问题必然 drift，而新上下文更可信，所以把它合并进旧文件。只有同一个领域换了个角度，才新建文件，并且让两篇互相引用。

## 什么时候写

- **交付收尾时 review**：这一轮有没有产出够格的经验？有就写，没有就明确决定不写。
- **任务中间也可以写**：在 fresh-start restart 之前（教训最容易丢的时刻——别让它们随着旧会话一起消失）、review-research 推翻了一批 false positive 之后、非显而易见的根因被诊断出来之后。趁热写，别等到交付时细节已经忘光。
- 这不是 human gate：记录是 orchestrator 的 housekeeping，三种模式下静默完成，会话里提一句就行；如果 sponsor 明确表示不需要，尊重他的决定。

## 什么时候查（回流）

- **intake / validate-requirements 开始时**，按 task keyword（module、error message、domain word）grep `teamspace/learnings/`；命中了先读 frontmatter 判断相关性，相关再读正文。
- 把相关条目以 **path + 一行摘要** 的形式写进下游 task 的 upstream context 里——`architecture`、`diagnose`、`implementation-plan` 和 `review-research` 最受益。对 owner 来说，经验是线索，不是指令；是否采纳由 owner 根据当前代码判断（条目反映的是写它那个时刻的事实，代码可能已经变了）。
- 修 bug 的时候，尤其优先搜 `root-cause` / `repo-trap` 类型——同类问题可能早就已经被解决过一次了。
