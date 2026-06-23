# Review Research 目录骨架

`review-researcher` 会产出一个目录：一份索引 + 每个 issue 一份 research 文件。下面是两者的骨架；组装时复制结构，再把内容替换成当前 issue。

这些文件是**人工 gate**：一个人只读这一份文件，然后决定「修不修、按谁的说法修」。所以每份文件必须自包含——读者没看过 diff，没看过任何 review artifact，也不认识任何 in-task 代码。

Verdict 取值：**confirmed / false-positive / partial / needs-human**。

---

## 索引：`00-index.md`

行序固定：先放要修的（confirmed、partial，按 P0→P1→P2 排序），再放 needs-human，**false positive 垫底**。「人工决策」列留空，供人填写。

```markdown
# Review Research Index

本轮共 N 个 issue。Verdict 列告诉你哪些需要修、哪些是噪音；点击链接查看单个问题的完整 research；看完后请在「人工决策」列填写意见。

| ID | Severity | 一句话描述 | Verdict | 建议修复方案 | 人工决策 | 详情 |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | P0 | <一句话说清楚这是什么问题> | Confirmed | <一句话修复方案> | | [详情](F-01-confirmed-<slug>.md) |
| F-04 | P2 | <一句话> | Partial | <修正后的一句话修复方案> | | [详情](F-04-partial-<slug>.md) |
| F-05 | P1 | <一句话> | Needs-human | 需要 <谁> 决定 <什么> | | [详情](F-05-needs-human-<slug>.md) |
| F-03 | P1 | <一句话> | **False positive · 无需修复** | —— | | [详情](F-03-false-positive-<slug>.md) |

Summary：X 个 confirmed，Y 个 partial（这两类在人工决策后交给 review-fixer 落地），W 个 needs-human，Z 个 false positive。
```

---

## 单 issue 文件：`<id>-<verdict>-<slug>.md`

文件名中的 verdict 段用英文：`confirmed` / `partial` / `false-positive` / `needs-human`——这样文件列表就能区分哪些需要修、哪些是噪音。Verdict 必须出现在三个地方：文件名、标题、首句。

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

<!-- 标题中的 verdict 标签按实际 verdict 写：[Confirmed · P0] / [Partial · P2] / [False positive · no fix needed] / [Needs-human] -->

**一句话**：verdict **<confirmed/false-positive/partial/needs-human>** · <它是什么、为什么（不）需要修，用一两句大白话说清楚>

## 人工决策

<!-- 本段留给人工批注：只搭骨架，绝对不要替人勾选或填写 -->
- [ ] 同意 verdict 及建议修复方案
- [ ] 不同意 / 部分接受（见批注）
- 批注：

## 背景
<读者没看过 diff，没看过任何 review artifact。先回答三件事：这段代码 / 这张表 / 这个流程
**是什么**、**谁在用 / 什么时候触发**、**正常路径下应该发生什么**——
然后再进入问题本身。
这一段是后续所有因果分析的根基；在此之前不要出现任何详细论证。>

## 代码上下文
<涉及的文件、函数、行号；调用链怎么跑的（谁调谁，用文字叙述）；
尤其要指出是否存在相关的权限 / 校验 gate、前置断言、或上游的类型 / 不变量保证。
粘贴并解释关键证据的代码片段——读者手头没有 repo，只给 file:line 等于没给证据。>

## 原始 finding 的描述
<reviewer 最初是怎么描述这个问题的、建议怎么修。用你自己的话完整重述一遍（读者没看过 review artifact），以便与你的 verdict 对照。>

## 我的核实与 verdict
<读完真实代码后得出的结论，必须有证据支撑：
- Confirmed：走一遍故障路径「输入 → 分支 → 落到这行 → 结果错了」，证明它确实会发生。
- False positive：指出哪条证据推翻了它——例如上游某个 gate（权限检查 / 前置 raise / 类型保证）让条件不可能触发，
  或与文档中的 intentional design 冲突，或根因其实在前端。
- Partial：确实有问题，但要说明原始 finding 的机制 / 严重度 / 建议修复方案错在哪，并给出修正后的正确描述。
- Needs-human：verdict 取决于 repo 里没有的上下文（外部系统 / 运行时配置 / 产品意图）；写清楚还缺什么。>

## 根因（confirmed / partial 时填写）
<讲清因果链：具体为什么出错。如果某层 fallback 本该拦住但没拦住，解释为什么没拦住。>

## 影响 / 爆炸半径（confirmed / partial 时填写）
<破坏有多严重、影响谁、属于哪一类：数据损坏 / 泄漏 / 资源泄漏 / 卡死 / ……>

## 建议修复方案（confirmed / partial 时填写）
<针对根因的、最小化、优雅的修复方案，符合现有分层和惯例。给出方向和关键改动点（需要时贴 before/after 片段）。
如果原始 finding 建议的修复是 ugly patch 或没治到根因，要明确指出它哪里丑、为什么这个版本更干净。
这是给 review-fixer 落地的建议；该角色不碰产品代码。>

## 预防 / 复发检查
<以后怎么避免；要加什么样的「修之前会失败」的回归检查；能否在结构层面（类型 / 枚举 / 锁 / 不变量）阻断复发。>

## 相关
<相关的 issue、相关 artifact、或上游 finding——每个引用的 ID 配一句话说明它是什么；没有就写「none」。>
```

---

### 交付前自检

每份文件交付前过一遍；如果命中任何一条，回去重写：

- 骨架与模板不符，或「背景」段落缺失；
- 出现未解释的 in-task 代码（T-xx、F-xx、ST、内部 artifact 名等）；
- 关键断言只有 `file:line`、没有粘贴代码片段；
- verdict 没有同时出现在文件名、标题、首句这三处；
- 「人工决策」块缺失，或内容已被勾选 / 填写；
- false positive / partial 没有说清楚「为什么（完全/部分）不是问题」。
