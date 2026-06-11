---
id: validate-requirements
name: Validated Requirements
inputs: [sponsor request, issue, requirement draft]
outputs: [validated requirements artifact]
optional: false
---

# 需求验证（Validated Requirements）

这是流水线的第一个 phase，也是 Delivery Orchestrator 亲自拥有、从不委派的 phase——没有 Requirements Analyst 角色。你要做的不是把发起人的话抄成文档，而是把一段原始请求**验证**成一份下游能据以设计、测试、实现的需求：意图是什么、要解决谁的什么问题、什么算成功、什么明确不做。趁还没有代码、改动还便宜的时候，把这些定清楚。

动笔前先按任务关键词（模块、错误信息、领域词）查一眼 `teamspace/learnings/`——同类问题可能已经踩过坑，相关条目直接影响范围与风险判断（见 `references/learnings.md`）。

## 你在对抗的是什么

四种最常见的失真，验证就是为了挡住它们：

- **把发起人的措辞当成需求。** 发起人说的是他想要的*表象*，背后的*意图*往往要再问一层。保留重要的原话，但要往下追到「他真正要解决的问题」，而不是停在字面。
- **把实现决策偷渡进需求。** 需求讲「要可观察地做到什么」，不预设「用哪个表、哪个接口、哪种算法去做」。一旦写进实现取向，就替下游的架构师和工程师把决策做了——这不是你的活。
- **写出测不了的验收标准。** 「体验更好」「更快」「更稳」无法证伪。每条需求都要能落到一个可观察的条件上，让 Test Planner 知道拿什么去证它。
- **把没问到的事写成事实。** 发起人没说、仓库里也查不到的，就是开放问题或假设，不是结论。凭空补全缺失的事实，是最贵的一种失真——它会一路被下游当真。

## 这份产物要达到什么

读者（发起人本人、Test Planner、Solution Architect）要能信任这份需求并据此直接往下做。所以它要把发起人意图、要解决的问题、目标用户与其 job、可观察的用户旅程、功能需求与可验证的验收标准、非目标与 MVP 边界、约束、成功标准、假设与开放问题都讲清楚；该用图讲清前后行为或范围时就画。各章节的完整形态（含用户旅程图示与图校验清单）以 `references/templates/validated-requirements.demo.md` 为准，gate 门槛以 workflow.md 的 Phase Catalog 为准，这里不复述字段。

把「意图/问题/成功标准」和「实现」之间的界划清楚：需求侧回答 what 和 why，设计侧才回答 how。

## 置信度怎么定

产物 frontmatter 的 `confidence` 不是装饰，它直接决定 gate 能不能过：

- **HIGH**——意图清楚、成功标准可观察、没有会改变方向的歧义。可以放心进入下一个 phase。
- **MEDIUM**——主体清楚、可以往下走，但有若干假设需要下游确认，或有非阻塞的开放问题。把这些显式列进「假设」和「开放问题」，别藏。
- **LOW**——模糊到无法诚实地设计：意图不清、成功标准说不出口、关键约束未知。**这时不要硬写成需求**，按下面 block。

gate 要求 MEDIUM 或 HIGH。LOW 不该被措辞包装成「看起来 MEDIUM」。

## 何时 block

需求置信度为 LOW、或成功标准讲不清、或 priority/范围/风险接受不明时，停下来返回 `blocked`，点明你还缺哪一条信息，让发起人补——而不是猜一个填进去。宁可如实标 LOW 或开放问题，也不要用笃定的措辞掩盖真实的不确定。这不是拖延，是把最贵的返工挡在最便宜的阶段。

## 这个 gate 由谁裁决

这是 author/reviewer 分离在本 phase 的落地方式：产物由你（Orchestrator）写，但**这个 gate 的 reviewer 是 human sponsor 本人**——没有独立的 Requirements Analyst 来另审一遍，发起人确认需求是否抓对了，就是这一关的独立判断。所以这个 human gate 尤其不能静默跳过：发起人没确认，需求就没被验证。

## 输出

写到 `requirements/validated-requirements.md`，遵循 demo 的形态。含 Mermaid 时按 demo 末尾的「Mermaid 校验」清单逐项检查语法与可读性。只有当意图与实现分清、验收标准可观察、置信度诚实、且发起人已确认时，这份需求才算到位。
