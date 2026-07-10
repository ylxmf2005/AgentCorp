# 审查研究文件夹骨架

`review-researcher` 产出一个文件夹：一份索引 + 每 issue 一份研究文件。以下是两者的骨架；组装时复制结构并用当前 issue 的内容替换。

这些文件是**人类门控**：一个人只读这一份文件，然后决定"修不修，按谁的说明修"。所以每份文件必须自包含——读者没有看过 diff，没有看过任何审查产出，也不认识任何任务内代码。

裁决值：**confirmed / false-positive / partial / needs-human**。

严重度值：**P0**（数据丢失/损坏、安全暴露、或真实用户的主流程中断） / **P1**（真实调用者会碰到的错误行为，但有边界或有 workaround） / **P2**（边界情况、质量或卫生问题）。各审查员都按自己的标度打分；比较前先做换算（critical→P0，major→P1，minor→P2——project-steward-reviewer 的 P3 并入 P2）。当你的裁决修正了审查者的严重度时，在所有地方使用修正后的值——frontmatter、标题标签、索引行。

---

## 索引：`00-index.md`

固定行顺序：先排需要修复的（confirmed、partial，按 P0→P1→P2 排序），然后 needs-human，**误报放最底部**。"人类决策"列留空给人填写。索引不带 artifact frontmatter——从标题开始，完全如下所示。

```markdown
# Review Research Index

本轮共 N 个问题。裁决列告诉你哪些需要修复、哪些是噪音；点击链接查看单个问题的完整研究；请在阅读后填写"人类决策"列。

| ID | Severity | One sentence | Verdict | Suggested fix | Human decision | Details |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | P0 | <用一句话清楚说明这个问题是什么> | Confirmed | <一句话修复方案> | | [details](F-01-confirmed-<slug>.md) |
| F-04 | P2 | <一句话> | Partial | <修正后的一句话修复方案> | | [details](F-04-partial-<slug>.md) |
| F-05 | P1 | <一句话> | Needs-human | 需要 <谁> 决定 <什么> | | [details](F-05-needs-human-<slug>.md) |
| F-03 | P1 | <一句话> | **False positive · no fix needed** | —— | | [details](F-03-false-positive-<slug>.md) |

Summary: X confirmed, Y partial（这两类在人工决策后进入 review-fixer 落地），W needs-human, Z false positives.
```

---

## 单 issue：`<id>-<verdict>-<slug>.md`

文件名中的裁决段为英文：`confirmed` / `partial` / `false-positive` / `needs-human`——这样文件列表可以把需要修复的和噪音分开。裁决必须在三个地方出现：文件名、标题、首句。

```markdown
---
artifact_type: ReviewResearchNote
task_id: <task_id>
author_agent: review-researcher
finding_id: <id>
verdict: <confirmed/false-positive/partial/needs-human>
severity: <P0/P1/P2>
status: completed
---

# <id> [Confirmed · P0] <一句话标题>

<!-- 按实际裁决写标题标签：[Confirmed · P0] / [Partial · P2] / [False positive · no fix needed] / [Needs-human] -->

**一句话**：裁决 **<confirmed/false-positive/partial/needs-human>** · <它是什么、为什么（或为什么不是）一个问题需要修复，用一两句平实的话说明>

## 人类决策

<!-- 本区域留给人类批注：只建骨架，绝不检查或替人类填写 -->
- [ ] 同意裁决与建议修复方案
- [ ] 不同意 / 部分接受（见批注）
- 批注：

## 背景
<读者没有看过 diff，没有看过任何审查产出。先回答三件事：这段代码/这个表/这个流程**是什么**、**谁用它 / 什么时候触发**、**正常路径上应该发生什么**——
然后再进入问题本身。
本段是后续所有因果分析的基础；在此之前不得出现详细论证。>

## 代码上下文
<涉及的文件、函数与行号；调用链如何运行（谁调用谁，用散文说明）；
特别指出是否存在相关的权限/验证门控、更早的断言、或上游的类型/不变量保证。
粘贴并解释关键代码片段——读者手边没有仓库，只给 file:line 等于没有证据。>

## 审查者的原始描述
<审查者最初如何描述这个问题以及建议的修复。用你的话完整重述（读者没有看过审查产出），以便与你的裁决对比。>

## 我的验证与裁决
<阅读真实代码后得出的结论，必须有证据支撑：
- Confirmed：走过失败路径 "input → branch → 落在这行 → 错误结果"，并证明它确实发生。
- False positive：指出哪条证据推翻了它——例如某个上游门控（权限检查 / 更早的 raise / 类型保证）使条件不可能成立，
  或它与已记录的 intentional design 冲突，或根本原因其实在前端。
- Partial：确实存在问题，但说明原始发现的机制/严重度/建议修复错在哪里，并给出修正后的、正确的描述。
- Needs-human：裁决依赖于仓库外的上下文（外部系统 / 运行时配置 / 产品意图）；清楚写下还缺什么。>

## 根本原因（confirmed / partial 时）
<讲述因果链条：具体为什么出错。如果某层的 fallback 应该拦住它但没有，解释为什么。>

## 影响 / 爆炸半径（confirmed / partial 时）
<破坏有多严重、谁受影响、以及它属于哪一类：数据损坏 / 泄露 / 资源泄漏 / 卡死 / …。>

## 建议修复（confirmed / partial 时）
<根因级别的、最小化的、优雅的修复，符合既有分层与约定。给出方向和关键变更点（需要时粘贴 before/after 片段）。
如果原始发现的建议修复是丑陋补丁或未能治愈根因，清楚说明它哪里丑陋以及为什么这个版本更干净。
这是给 review-fixer 落地的建议；本角色不触碰产品代码。>

## 预防 / 复发检查
<如何在未来避免它；应添加什么"修复前失败"的回归检查；是否可以在结构层面（类型/枚举/锁/不变量）阻断复发。>

## 相关
<相关 issue、相关产出或上游发现——每个引用的 ID 都附一句说明它是什么；如果没有，写"none"。>
```

---

### 交付前自检

在交付前逐条跑过以下检查；如果命中任何一项，回去重写：

- 骨架与模板不匹配，或"Background"章节缺失；
- 出现未解释的任务内代码（T-xx、F-xx、ST、内部产出名等）；
- 关键断言只有 `file:line` 没有粘贴代码片段；
- 裁决没有在文件名、标题、首句三个地方全部出现；
- "Human decision"块缺失，或内容被代填/勾选；
- confirmed 或 partial 裁决的 "My verification and verdict" 章节没有在当前代码中走过具体的失败路径（this input → this branch → lands on this line → this wrong result），或没有说出发现引用行之外的 caller/gate；
- false positive / partial 没有清楚说明"为什么这（或这不完全）是一个需要改变的问题"。
