# Contract testing reference

在对 API、JSON-RPC、A2A、CLI、SDK 或其他外部 interface surface 做 contract verification 时使用。

## 每种 interface surface 要检查的 contract 要素

- **HTTP routes**：method、path、status code、headers、request body、response body、auth。
- **JSON-RPC / A2A**：method name、params、result/error shape、streaming behavior、protocol extensions。
- **CLI**：flags、arguments、exit codes、stdout/stderr shape、machine-readable output。
- **SDK / exported types**：function signatures、schemas、backward-compatible optional fields。
- **error contract**：status/code、body shape、retriability、user-visible message。

## 执行要点

如果有可用环境，直接跑真实请求或命令，而不是靠读代码去推断 contract 是否被遵守。既要走 happy path，也要覆盖跟 contract 相关的错误路径。把实际返回与 TestPlan、文档、schema 或之前的 contract 预期逐项比对。除非 TestPlan 明确允许修改，或者环境本身就是一次性的，否则不要动持久化数据。对于无法执行的 interface surface，要如实记录没测的原因。

## 每次检查要留的证据

- interface surface 及其版本（如有）。
- 实际发出的 request 或执行的 command。
- 预期的 status / shape / output。
- 实际的 status / shape / output。
- pass / fail。
- 如有必要，附上 artifact path 或脱敏后的 inline sample。

报告、日志、截图、payload 里严禁泄露任何 secret。
