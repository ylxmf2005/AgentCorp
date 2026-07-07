---
id: validate-requirements
name: Validated Requirements
inputs: [sponsor request, issue, requirement draft]
outputs: [validated requirements artifact]
optional: false
---

# Validated Requirements

这是 pipeline 的第一个 phase，也是 Delivery Orchestrator 亲自负责、绝不 delegate 的 phase——这里不存在 Requirements Analyst 这个角色。你的工作不是把 sponsor 的话原样抄成文档，而是把一份原始 request **validate** 成 downstream 能够据此进行 design、test 和 implement 的 requirements：intent 是什么、解决的是谁的问题、怎样算 success、以及哪些明确 out of scope。趁现在还没有代码、改动成本还低的时候，把这些敲定。

动笔之前，先按 task keyword（module、error message、domain word）去翻一下 `teamspace/learnings/`——同类问题可能已经被踩过，而相关的 entry 会直接影响 scope 和 risk 的判断（见 `references/learnings.md`）。

当原始 request 还不够清楚，无法诚实 validate 时，先加载 `brainstorm` 能力，再写 artifact。Brainstorm 不是单独 phase；它是把需求推到 MEDIUM/HIGH confidence 的互动界面。

当不清楚的是*地形*本身——工作落在 sponsor（或你）不了解的 module、codebase 或领域上——先加载 `probe` 再做 brainstorm：访谈只能问出 sponsor 已经知道的东西，而建立在未勘察土地上的需求，会把盲区洗白成 scope。之后，probe 报告为 brainstorm、scope 判断和 risk 评估提供根基。

使用两种模式之一：

- **逐个追问** —— 当方向大体清楚，但某个缺失事实会阻塞 confidence 时使用。每次只问一个高杠杆问题，然后把答案折回需求图景。只有当下一个答案会改变 scope、success criteria、risk acceptance 或 user journey 时，才继续问。
- **多方案提案** —— 当多个方案形状都可能满足 sponsor 目标时使用。加载 `brainstorm/references/proposal-paths.md`，并使用 AgentCorp proposal lenses 提出 2-4 个完整路径。每个路径都必须完整到 sponsor 可以选择、修改或拒绝。给出你的推荐，然后请 sponsor 选择或修改其中一个。

如果你提出了多个路径，在 sponsor 选择方向或明确授权混合方案前，不要写 validated requirements。未被选择路径里只是暗示出来的内容，不能偷偷进入范围。

## 你要对抗什么

四种最常见的失真；validation 就是为了挡住它们：

- **把 sponsor 的措辞直接当成 requirement。** Sponsor 说的只是他们想要东西的 *surface*；背后的 *intent* 往往还需要多问一句。保留重要的原始措辞，但要深挖到"他们真正想解决的问题"，而不是停在字面意思上。

- **把 implementation decision 偷偷塞进 requirements。** Requirements 说的是"必须能被观察到地达成什么"，而不是"用哪张表、哪个 interface、哪个 algorithm 去做"。一旦把 implementation 的倾向写进去，你就替 downstream 的 architect 和 engineer 做了决定——这不是你该干的活。

- **写无法 test 的 acceptance criteria。** "更好的体验"、"更快"、"更稳定"这些没法证伪。每个 requirement 最终都得落到一个可观察的条件上，这样 Test Planner 才知道拿什么去证明它。

- **把没被问到的东西写成既定事实。** Sponsor 没说过、repo 也确认不了的任何事情，都是 open question 或 assumption，而不是 conclusion。凭空脑补缺失的事实是最贵的失真——它会被一路 downstream 当成真的。

## 这个 Artifact 必须达成什么

读者（sponsor 本人、Test Planner、Solution Architect）必须能够信任这些 requirements，并直接在其上继续构建。因此它必须明确阐明 sponsor 的 intent、要解决的问题、目标用户及其工作、可观察的 user journeys、带有可验证 acceptance criteria 的 functional requirements、non-goals 和 MVP boundary、constraints、success criteria、assumptions 和 open questions；如果需要，就画一张 diagram 来把 before/after 的行为或 scope 讲清楚。每个 section 的完整形态（包括 user-journey diagram 和 diagram validation checklist）由 `references/templates/validated-requirements.demo.md` 规定，gate bar 由 workflow.md 的 Phase Catalog 规定；本文档不再重复这些字段。

在 "intent/problem/success criteria" 和 "implementation" 之间划清界限：requirements 这边回答 what 和 why；只有 design 那边才回答 how。

## 如何设定 Confidence

Artifact frontmatter 里的 `confidence` 不是装饰；它直接决定 gate 能不能过：

- **HIGH** — intent 清楚，success criteria 可观察，不存在会改变方向的 ambiguity。可以安全进入下一个 phase。

- **MEDIUM** — 主线清楚，可以继续推进，但存在一些需要 downstream 确认的 assumptions，或不阻塞的 open questions。在 "Assumptions" 和 "Open Questions" 下面明确列出来；别藏着。

- **LOW** — 太模糊，根本没法诚实地面向它做 design：intent 不清、success criteria 你说不出口、关键 constraints 未知。**别硬塞进 requirements**；按下面的方式 block。

Gate 要求 MEDIUM 或 HIGH。LOW 绝不能用措辞包装成"看起来像 MEDIUM"。

## 何时 Block

当 requirements 的 confidence 为 LOW、或者 success criteria 说不清楚、或者 priority/scope/risk-acceptance 不明确时，如果缺失清晰度可以通过 sponsor 互动补齐，先使用 `brainstorm`。如果 sponsor 不能或没有解决这个缺口，再停下来返回 `blocked`，并明确指出你缺的是哪块信息，让 sponsor 来补——而不是自己猜一个填进去。诚实标成 LOW 或 open question，也好过用看似自信的措辞掩盖真正的不确定性。这不是在拖；这是在成本最低的环节挡住最贵的返工。

## 谁来裁决这个 Gate

这就是 author/reviewer separation 在这个 phase 的体现：你（Orchestrator）写 artifact，但这个 gate 的 reviewer 是**人类 sponsor 本人**——没有独立的 Requirements Analyst 再来审一遍，所以 sponsor 确认 requirements 写得对，就是这个 gate 的独立 judgment。因此这个 human gate 尤其不能被悄悄跳过：如果 sponsor 还没确认，requirements 就不算 validated。

## 输出

写到 `requirements/validated-requirements.md`，按 demo 的格式来写。如果里面包含 Mermaid，对照 demo 末尾的 "Mermaid validation" checklist 逐条检查 syntax 和 readability。只有当 intent 和 implementation 被严格区分、acceptance criteria 可观察、confidence 诚实、并且 sponsor 已确认时，这些 requirements 才算完整。
