---
id: api-contract
name: API Contract
inputs: [architecture doc, impact analysis, API/interface requirements]
outputs: [API contract design artifact]
optional: true
---

# API 契约（API Contract）

在实现之前固化一个公共、共享或跨模块的接口，让调用方、实现者、reviewer 和 tester 对同一个边界达成一致。适用于 HTTP/RPC API、SDK/CLI 契约、共享 schema、payload 与 event 的形态、auth/权限契约、错误语义，或任何并行开发需要先定下约定的边界。它是一份契约，不是实现方案，也不是源码。

## 这份产物要达到什么

任何人读完，都应当能照着这个边界去开发、review 或测试，而不必猜。所以对于设计点名的每一个面向调用方或跨模块的接口，它都要钉死：

- 请求/响应的形态、签名，以及协议形态；
- schema——多个模块共用时，只定义一次，其余处按引用复用；
- 状态归属、auth/权限假设，以及错误语义；
- 兼容性行为：哪些现有调用方保持不变、哪些会变、怎么迁移；
- reviewer 或 tester 能实际去核对的验证钩子。

让接口相对于它所隐藏的内容保持简单，每个契约只提供一种清晰的抽象。代码块只用来描述契约——除非 Delivery Orchestrator 指派了实现工作，否则不要创建源码文件。

## 何时跳过

没有公共、共享或跨模块的边界发生改动；或者是单模块任务，且 architecture/impact 产物已经把本地细节讲够了。

## 输出

把产物写到 assignment 的 `output_path`（通常是 `design/api-contract.md`），遵循 `api-contract` demo 模板。
