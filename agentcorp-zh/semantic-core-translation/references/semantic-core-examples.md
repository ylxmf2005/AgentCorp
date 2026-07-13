# 对照示例

这些示例用于说明方法，不是短语表。每次都要从当前上下文重新推导含义。

## 软件与技术惯例

### `fail loudly`

源文：

> In production, the service should fail loudly rather than silently discard invalid requests.

朴素语义核心：

> The service should clearly report and expose the failure instead of hiding it or continuing silently.

自然的中文表达可以是 `明确报错` 和 `让错误立即暴露出来`。诸如 `失败得很响` 的声音式译法改变了含义。

### `paper over`

源文：

> Retries may paper over the consistency bug for a while.

朴素语义核心：

> Retries may temporarily hide the bug's symptoms without fixing its underlying cause.

一种可能的中文表达：`重试可能暂时掩盖一致性问题`。

### `the abstraction leaks`

源文：

> Under load, the abstraction leaks and callers must understand the storage layout.

朴素语义核心：

> Under load, implementation details that the abstraction was meant to hide become visible to callers.

一种可能的中文表达：`在高负载下，这层抽象无法屏蔽实现细节`。

### `buys us time`

源文：

> The compatibility shim buys us time, but it is not a permanent fix.

朴素语义核心：

> The compatibility shim gives us additional time before a permanent solution is required.

一种可能的中文表达：`兼容层能为我们争取一些时间`。

### `happy path`

源文：

> The benchmark covers the happy path but ignores recovery after partial failure.

朴素语义核心：

> The benchmark covers the normal successful flow but not recovery from partial failure.

一种可能的中文表达：`基准测试覆盖了正常成功路径`，而不是 `快乐路径`。

## 同一词语也可能在上下文中是字面义

源文：

> The firework failed loudly, ending with a sharp bang instead of a burst of color.

这里 `loudly` 描述的是真实声音。合适的语义核心是：

> The firework malfunctioned and produced a loud bang.

不要把软件语境中的 `明确报错` 生搬到这句话上。

## 不要过度解包

源文：

> The warning was read loudly so that everyone in the hall could hear it.

`read loudly` 是可组合的字面表达。正常翻译即可。仅仅因为其中的副词在其他场景可能有隐喻义，并不足以让它成为语义风险。

## 保留情态和极性

源文：

> The fallback should not silently paper over authorization failures.

语义核心：

> The fallback is advised not to hide authorization failures without reporting them.

译文必须保留 `should not`；把它改成 `cannot` 或 `must not` 会改变力度。

## 保留歧义

源文：

> The change may open the door to a different deployment model.

依赖上下文，它可能意为 `使之成为可能`、`使之更容易`，而在少见的物理场景中也可能真的是打开一扇门。若附近文字无法区分前两者，且该区别重要，就选择保留宽泛可能性的目标语表达，而不是编造精确机制。
