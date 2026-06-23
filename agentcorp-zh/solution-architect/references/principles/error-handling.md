# Error Handling

## Description

错误处理是软件系统复杂度的主要来源之一。这个 review 维度考察代码如何应对异常情况——即打断正常程序流程的场景。糟糕的错误处理会导致 exception 泛滥，error-checking 代码散落在系统各处，往往在实际业务逻辑之上还要成倍增加体量和复杂度。

目标是**减少必须处理 exception 的地方**，而不是捕获每一个可能的错误。Exception handling 代码写起来、测起来、维护起来都比正常路径代码更难。它在生产环境很少执行，导致 bug 很难被发现。Exception handling 还会制造更多 exception 的机会（比如恢复代码本身又挂了）。

本 review 维度关注的是：错误处理究竟在增加还是降低整体系统复杂度。最好的代码要么通过精心的 API 设计把错误条件彻底消灭，要么在关键的战略位置统一处理 exception。

## Core Principles

### 1. Define Errors Out of Existence

重新设计 API，让异常条件变成拥有明确行为的正常情况。一旦语义调整到位，就没什么"异常"可报了。

- 所有输入都应该有自然的操作结果，而不是 arbitrary restriction
- "Ensure state X" 往往比 "change to state X or fail" 更好
- 当 postcondition 已经满足时，允许操作 trivially succeed

### 2. Mask Exceptions at Low Levels

在异常发生的地方就地处理，防止其向上传播。低层代码如果能完全解决某个 exception，就该自己解决，让上层完全感知不到问题。

- Retry mechanism、redundant copy、自动恢复可以隐藏 transient failure
- Deep module 通过内部消化 exception 来吸收复杂度
- Exception masking 把复杂度往下拉，压进可复用的基础设施里

### 3. Aggregate Exception Handling

当 exception 必须向上传播时，在一个高层统一捕获多种不同的 exception，而不是把 handler 撒得满代码都是。

- 让 exception 冒泡到能够统一处理的层级
- 基于 exception 内容做分发的 generic handler 可以减少重复
- Top-level request handler 可以一个地方捕获所有 request-scoped exception

### 4. Crash on Unrecoverable Errors

对于那些不可能或不值得处理的错误，直接 fast fail 并给出清晰的诊断信息，别去写一套大概率也用不上的复杂恢复逻辑。

- Out-of-memory、corrupted data structure、catastrophic failure 通常根本修不好
- 试图从严重错误中恢复只会引入未经测试的代码，而这代码大概率跑不通
- 对于极少发生且确实没有现实恢复路径的错误，应用层直接 crash 是可以接受的

### 5. Avoid Defensive Over-Detection

别为那些其实根本不是问题的条件去报 exception。很多所谓的"错误"不过是人为施加的限制，把 API 搞得复杂却毫无价值。

- 区分"阻止操作完成的条件"和"仅仅是出乎意料的条件"
- Exception 是接口的一部分；exception 越多，module 就越 shallow、越复杂
- Throw exception 很容易，但 handle 很难——别把负担转嫁给 caller

### 6. Design Away Special Cases

除了 exception 之外，还要消灭其他 special-case 逻辑：让通用路径自然覆盖边缘条件。

- Empty collection、zero-length range、null selection 都应该能无缝适配标准操作
- 内部表示不必镜像 UI 可见的概念（比如 "no selection" vs. empty selection）
- 代码里到处是对 special case 的 `if` 检查，说明设计还可以进一步简化

## Red Flags

### Exception Proliferation

- **每个调用都配一个单独的 exception handler**：把每个有风险的操作都包进自己的 try-catch，制造视觉噪音和代码重复。
- **API throw 大量 exception type**：声明了多种不同 exception 的类，其接口复杂且 shallow。
- **Exception cascade**：Exception handler 自己还能 throw exception，形成多层 error handling 链。
- **重复的 exception handling 逻辑**：相同的错误处理模式在多个 call site 反复出现。

### Poor Exception Placement

- **把 exception 原样往上抛，不补充任何 context**：低层代码对不会处理的异常直接 throw，迫使每个 caller 都要面对。
- **通过 exception 暴露实现细节**：Exception 泄漏了内部结构（比如 API response 里出现 database-specific error）。
- **为不需要报告的条件 throw exception**：操作已经达成目标时仍然报错，或者把无害的边缘情况当成错误。

### Artificial Error Conditions

- **过于严格的前置条件**：操作明明可以轻松处理某些输入却选择失败（比如删除一个不存在的 item、substring 时传入 out-of-range index）。
- **暴露设计欠考虑的 exception**："我不知道这里该怎么处理，那就 throw 个 exception，把锅甩给 caller。"
- **为已经满足的后置条件报错**：把"目标状态已经达成"当成 failure 来报告。

### Untestable Error Handling

- **很难触发的异常路径**：为罕见条件写的 error handling 代码（I/O failure、network timeout）没有被测试覆盖到。
- **被注释掉或空的 catch block**：说明遇到过 exception，但从未真正解决。
- **Exception 来源不明确**：一个很长的 try block，根本看不出哪一行会 throw 哪个 exception。

### Special-Case Proliferation

- **用状态变量追踪是否存在 special case**：显式的 flag 来表示 "no selection"、"empty list" 等，导致代码里到处都是检查。
- **用 if-else chain 处理同一操作的变体**：本来可以共享一个通用实现的细微差异场景，却各自走独立的逻辑路径。
- **正常路径和边缘路径走完全不同的代码分支**：边缘情况用完全独立的逻辑处理，而不是自然落入通用路径。

## Issue Tags

Code review 输出中使用以下 tag：

- **[Exception Proliferation]**：Exception handler 或 exception type 过多，增加了接口复杂度
- **[Error Definition]**：操作对其实可以定义为正常行为的条件 throw exception
- **[Exception Masking Opportunity]**：低层 exception 本可以在内部消化，却被暴露了出来
- **[Exception Aggregation]**：多个相似的 handler 应该合并到更高层级
- **[Unrecoverable Error Handling]**：对 crash 更简单更安全的错误写了复杂的恢复逻辑
- **[Defensive Over-Detection]**：对其实根本不是问题的条件报告错误
- **[Special Case Complexity]**：显式处理本可被通用逻辑吸收的 case
- **[Information Leakage via Exception]**：Exception 向 caller 暴露了内部实现细节
