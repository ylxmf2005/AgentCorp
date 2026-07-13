# Contrastive examples

These examples illustrate the method; they are not a phrase table. Re-derive meaning from context every time.

## Software and technical conventions

### `fail loudly`

Source:

> In production, the service should fail loudly rather than silently discard invalid requests.

Plain semantic core:

> The service should clearly report and expose the failure instead of hiding it or continuing silently.

Natural Chinese realizations include `明确报错` and `让错误立即暴露出来`. Sound-related renderings such as `失败得很响` change the meaning.

### `paper over`

Source:

> Retries may paper over the consistency bug for a while.

Plain semantic core:

> Retries may temporarily hide the bug's symptoms without fixing its underlying cause.

Possible Chinese realization: `重试可能暂时掩盖一致性问题`.

### `the abstraction leaks`

Source:

> Under load, the abstraction leaks and callers must understand the storage layout.

Plain semantic core:

> Under load, implementation details that the abstraction was meant to hide become visible to callers.

Possible Chinese realization: `在高负载下，这层抽象无法屏蔽实现细节`.

### `buys us time`

Source:

> The compatibility shim buys us time, but it is not a permanent fix.

Plain semantic core:

> The compatibility shim gives us additional time before a permanent solution is required.

Possible Chinese realization: `兼容层能为我们争取一些时间`.

### `happy path`

Source:

> The benchmark covers the happy path but ignores recovery after partial failure.

Plain semantic core:

> The benchmark covers the normal successful flow but not recovery from partial failure.

Possible Chinese realization: `基准测试覆盖了正常成功路径` rather than `快乐路径`.

## Context can make the same words literal

Source:

> The firework failed loudly, ending with a sharp bang instead of a burst of color.

Here `loudly` describes an actual sound. A suitable core is:

> The firework malfunctioned and produced a loud bang.

Do not force the software convention `明确报错` onto this sentence.

## Do not over-unpack

Source:

> The warning was read loudly so that everyone in the hall could hear it.

`read loudly` is compositionally literal. Translate it normally. It is not a semantic hazard merely because it contains an adverb that is metaphorical elsewhere.

## Preserve modality and polarity

Source:

> The fallback should not silently paper over authorization failures.

Core:

> The fallback is advised not to hide authorization failures without reporting them.

The translation must preserve `should not`; changing it to `cannot` or `must not` changes force.

## Preserve ambiguity

Source:

> The change may open the door to a different deployment model.

Depending on context, this can mean `make possible`, `make easier`, or literally open a door only in an unusual physical setting. If nearby text does not distinguish the first two and the distinction matters, choose a target phrase that preserves the broad possibility rather than inventing a precise mechanism.
