# Module Depth

## Description

模块深度衡量的是功能量与接口复杂度之比。**深度模块**（deep module）在简洁的接口背后封装了大量功能，把实现细节对使用者隐藏起来。**浅层模块**（shallow module）则相反：接口复杂，但提供的功能却很有限，对控制复杂度几乎没什么帮助。

设计目标始终是**收益最大化、成本最小化**——用尽可能简单的接口提供尽可能多的功能。深度模块之所以是好的抽象，是因为使用者只能看到其内部复杂度的一小部分。

## Core Principles

### Deep vs Shallow Modules

- **深度模块**：接口简单，却隐藏了巨大的实现复杂度。开发者无需了解内部细节，就能使用强大的功能（例如 Unix 文件 I/O，仅凭 5 个简单的 system call 就管理了数十万行代码）。
- **浅层模块**：接口几乎和实现一样复杂。它们没有隐藏多少复杂度，徒增认知负担，却没有对等的收益。

### Interface Design

- 接口应该比它暴露的实现**简单得多**。
- 接口既包括形式化的部分（签名、类型），也包括非形式化的部分（行为、使用约束，通常写在注释里）。
- 接口体现的是该模块对整个系统施加的复杂度。接口越小、越简单，引入的复杂度就越低。

### General-Purpose Interfaces

- 适度通用的接口比专用接口更深。它应当既满足当前需求，又足够灵活以支撑多种用途。
- 通用方法能减少 API 中的总方法数，降低学习和使用成本。
- 专用接口容易在模块之间泄漏信息，导致紧耦合。UI 层面的抽象不应该出现在底层模块中。

### Common Case Simplicity

- 接口应让最常见场景的使用尽可能简单。默认行为就应该符合大多数用户的需求。
- 不常见的场景可以通过可选机制来支持，而不要让这些机制干扰典型用户的接口体验。

### Avoiding Over-Decomposition (Classitis)

- 把类拆成大量小碎片会产生浅层模块，反而提升整个系统的复杂度。
- 每个小类都有自己的接口，这些接口累积起来会在系统层面形成巨大的复杂度。
- 小类泛滥往往导致代码冗长、样板代码（boilerplate）过多。

## Red Flags

### Shallow Module Indicators

- **Trivial wrappers**：方法只是简单委托给另一个调用，几乎没有任何转换（例如 `addNullValueForAttribute(String attr) { data.put(attr, null); }`）
- **Documentation longer than implementation**：如果解释接口比读代码本身还费劲，那它大概率是浅层模块
- **No abstraction benefit**：接口把实现的所有复杂度都暴露了出来
- **One-use methods**：方法只为某一个特定场景设计

### Interface Complexity Indicators

- **Many methods with narrow purposes**：方法数量庞大，每个只服务于单一场景
- **Special-purpose operations in general modules**：通用模块里出现了 UI 层面的概念（例如文本存储类里冒出个 "backspace"）
- **Boilerplate proliferation**：完成一件简单的事需要多个对象或多次调用（例如 Java 里的 FileInputStream → BufferedInputStream → ObjectInputStream）

### Over-Decomposition Indicators

更多关于"拆还是合"的红旗，参见 `cohesion-separation.md`。

- **Excessive class count**：大量类，每个却只承担极少的功能
- **Pass-through chains**：创建对象的唯一目的是把它传给另一个构造函数
- **Verbose setup**：常见操作需要多步初始化才能完成

## Issue Tags

在报告模块深度问题时使用以下 tag：

- **[Shallow Module]** — 接口复杂度几乎等于实现复杂度
- **[Trivial Wrapper]** — 方法没有提供有意义的抽象
- **[Special-Purpose API]** — 接口为单一狭窄场景设计，而非通用用途
- **[Complex Interface]** — 接口方法或参数过多，与提供的功能不成比例
- **[False Abstraction]** — 接口看似简洁，却隐藏了使用者必须了解的关键细节
