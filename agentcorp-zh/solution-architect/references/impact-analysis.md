---
id: impact-analysis
name: Impact Analysis (Delta Design)
inputs: [validated requirements, existing codebase]
outputs: [impact analysis design artifact]
optional: false
---

# Impact Analysis (Delta Design)

对现有代码变更的精确记录。不是重写 architecture，只聚焦 delta：现在代码长什么样、要改什么、哪些绝对不能搞坏、还有哪些风险残留。

## What you do

先通读受影响的 module、interface 和 data flow，让 delta 的设计基于代码"实际怎么跑"，而不是你"假设它怎么跑"。然后像做 architecture design 一样来设计变更：把改动范围收拢，interface 不要扩得比需求还大，新代码该归哪个 module 就放哪个 module。边界或封装决策拿不准的时候，去翻 `principles/`。

## What this artifact must achieve

读完之后，读者应该清楚：当前行为是什么、目标行为是什么、改动具体落在哪里、哪些东西必须保留、哪里可能炸。必须明确写出：

- 改了什么、为什么改，用一段实在的 overview 概括；
- 受影响的 module 和文件（真实路径；只在能消除歧义时才标行号）；
- interface 和 data 的变更，逐条列清楚——写 `none` 也是一个完全合理且有用的答案；
- 新代码与旧代码的 integration points；
- 必须继续跑通的现有行为；
- 风险：什么可能炸，以及暴露面有多大。

只有当图比文字更容易让人理清"当前路径、目标路径或必须保留的行为"时，才画图。图必须实在、具体——用真实的 module 和结果，不要画占位框。

如果变更波及很多 module，或者涉及结构性的 interface 调整，别硬把 impact analysis 撑成百科全书：结构性决策写进 `architecture.md`，public/shared 或跨 module 的边界写进 `interface-contract.md`，impact analysis 只盯紧 delta 和那些必须保住的现有行为。

## Output

把 artifact 写到 assignment 的 `output_path`（通常是 `design/impact-analysis.md`），遵循 `design-artifact` 的 demo template。
