---
id: interface-contract
name: Interface Contract
inputs: [architecture doc, impact analysis, interface requirements]
outputs: [interface contract design artifact]
optional: true
---

# Interface Contract

在动手实现之前，先把 public、shared 或跨模块的 interface 敲定，让调用方、实现方、reviewer 和 tester 都对同一条边界达成共识。它适用于 HTTP/RPC API、SDK/CLI contract、共享 schema、payload 与 event 形态、鉴权/权限约定、错误语义，或者任何需要先把规矩立好才能并行开发的边界。它是 contract，不是实现方案，也不是源码。

## 这份 artifact 必须达成的目标

任何人读完后，都应该能基于这条边界直接开发、review 或测试，而不需要靠猜。因此，对于设计中提到的每一个面向调用方或跨模块的 interface，必须明确：

- request/response 的形态、签名和协议格式；
- schema——如果在多个模块之间共享，只定义一次，其他地方通过引用复用；
- 状态归属、鉴权/权限假设以及错误语义；
- 兼容性行为：哪些现有调用方保持不变，哪些会变，以及如何迁移；
- reviewer 或 tester 能够实际核验的 verification hook。

让 interface 相对于它所封装的东西保持简单，每个 contract 只提供一种清晰的抽象。代码块仅用于描述 contract——除非 Delivery Orchestrator 已经分配了实现工作，否则不要创建源文件。

## 什么时候可以跳过

没有 public、shared 或跨模块的边界变更；或者这是一个单模块任务，且 architecture/impact artifact 已经把局部细节覆盖充分。

## 输出

将 artifact 写入 assignment 的 `output_path`（通常是 `design/interface-contract.md`），并遵循 `interface-contract` demo template。
