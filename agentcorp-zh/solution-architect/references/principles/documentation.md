# 文档

## 描述

文档质量对可维护性至关重要。注释承载的是代码本身无法表达的设计信息。缺少合适的文档，开发者只能浪费时间还原最初的设计意图，导致修改变慢、bug 风险上升。这个 dimension 评估注释是否在合适的粒度提供了必要信息，是否有效描述了非显而易见的方面，以及文档是在支撑 abstraction 还是在污染 abstraction。

## 核心原则

### 注释描述代码无法表达的内容

代码只能表达形式语法和机械逻辑，无法表达：
- 设计决策背后的 rationale
- 高层的 purpose 与 intent
- invariant 与 precondition
- 边界条件的语义（inclusive 与 exclusive 的范围）
- 何时以及为什么要使用某个 interface
- 跨 module 的依赖与协作要求

这些要素只存在于设计者脑中，不写文档就会消失。注释把这份知识保留给未来的维护者。

### 在不同粒度上写文档

有效的注释提供的抽象层级应与代码本身不同：

**低层级的精确**：变量声明、参数和返回值需要精确澄清。要明确单位、边界行为、null 语义、ownership 职责和 invariant。像 `current offset` 这样的注释太模糊；`position of the first object not yet returned to the client` 才补充了必要的精确性。

**高层级的抽象**：方法和循环的注释应该描述 intent，而不是机械步骤。不要逐行复述，而是说明整段代码在做什么、为什么需要它。`Try to append the current key hash onto an existing RPC` 就比描述循环里每个条件判断更有价值。

### Interface 文档与 Implementation 文档

把用户需要知道的和内部实现机制分开：

**Interface 注释**定义 abstraction。它们描述 class 的能力、从调用方视角看的方法行为、参数要求、返回值、副作用、异常和 precondition。用户应该在不读 implementation 代码的情况下就能理解这个 abstraction。

**Implementation 注释**帮助维护者理解内部运作。它们解释主要代码块在做什么、为什么采用特定方案。不过，如果 interface 文档和代码本身足够清晰，大多数简单方法不需要 implementation 注释。

Interface 文档里泄露了 implementation 细节，是 shallow abstraction 的警告信号。

### 避免与代码重复

注释如果只是重复代码已经明显表达的内容，既浪费读者时间，也增加维护成本。如果只看相邻代码（而不了解更大上下文）就能写出这条注释，那这条注释就没有价值。

把方法名或变量名里的词原样搬到注释里，是常见的冗余模式。不要重复名字，而是补充关于含义、约束或上下文的额外信息。

### 在设计阶段就写注释

先写 interface 注释，再写 implementation 代码。这样做：
- 在 design reasoning 还清晰时及时记录下来
- 强迫自己在编码前先想清楚 abstraction
- 作为评估 interface 质量的 design tool
- 防止注释 debt 累积

如果某个方法或变量需要一长串复杂注释才能说清楚，那就是 red flag，说明 abstraction 有问题，应该重新考虑。

### 记录跨 Module 的决策

横跨多个 module 的设计决策特别容易出 bug，却又很难有效记录。当依赖跨越边界时，可以：

- 把文档放在开发者必然会遇到的明显中心位置（比如一个所有值都必须一起考虑的 enum）
- 为复杂的 cross-cutting concern 维护一份中心设计笔记，在受影响的代码位置放简短的 pointer

## Red Flags

### 缺少 Interface 文档

- public 的 class、方法或重要变量没有 interface 注释
- 方法文档漏掉了行为描述、参数含义、返回值语义、副作用或异常条件
- 以为代码自解释

### 重复代码

- 注释用相同粒度逐行复述代码
- 注释只是把实体名字里的词重新排列成一句话
- 注释里没有任何从声明或语句中不能一眼看出的信息

### 模糊或不精确的文档

- 变量注释缺少单位、边界条件行为、null 语义或 ownership
- 泛泛的注释如 `current offset`，却不说明什么让它 current、offset 的基准是什么
- 抽象描述缺少足够细节，无法让人正确使用 interface

### Interface 注释里混了 Implementation 细节

- interface 文档描述了内部数据结构、算法或 implementation 方案
- 在同一条注释里混着"内部怎么实现"和"外部怎么用"
- 把用户不该依赖的细节暴露给他们

### 过时或误导性注释

- 注释与实际代码行为矛盾
- 代码改了，文档还在描述旧设计
- 注释离它所描述的代码太远，导致同步困难

### 缺少"为什么"的解释

- 棘手的代码没有解释必要性
- workaround 和特例没有 rationale
- 非显而易见的设计决策没有记录 reasoning

### Abstraction 文档不足

- 用户被迫去读 implementation 代码才能学会怎么用 interface
- 没有文档说明整个 abstraction 代表什么
- 缺少高层概念框架来理解代码的 purpose

## Issue Tags

- **[Missing Documentation]**：未文档化的 public interface、关键变量或复杂逻辑
- **[Redundant Comment]**：只是重复代码已经显而易见的内容的注释
- **[Vague Documentation]**：不精确，缺少正确使用所需细节的注释
- **[Implementation Leakage]**：interface 注释暴露了内部细节
- **[Outdated Comment]**：与当前代码行为矛盾的文档
- **[Missing Rationale]**：未解释的非显而易见设计决策或棘手代码
- **[Poor Abstraction Documentation]**：用户不读 implementation 就无法理解 interface
