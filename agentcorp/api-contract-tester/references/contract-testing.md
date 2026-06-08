# 契约测试参考

执行 API、JSON-RPC、A2A、CLI、SDK 或其它对外接口面的契约验证时使用。

## 各类接口面要核对的契约要素

- **HTTP 路由**：method、path、status code、headers、请求体、响应体、auth。
- **JSON-RPC / A2A**：method 名、params、result/error 形态、streaming 行为、协议扩展。
- **CLI**：flag、参数、exit code、stdout/stderr 形态、机器可读输出。
- **SDK / 导出类型**：函数签名、schema、向后兼容的可选字段。
- **错误契约**：status/code、body 形态、可重试性、用户可见消息。

## 执行要点

有可用环境时，跑真实的请求或命令，而不是靠看代码推断契约是否被兑现。happy path 与契约相关的错误路径都要走到。把实际响应与 TestPlan、文档、schema 或既往契约预期逐一对照。除非 TestPlan 明确授权改动、或环境本身一次性可丢弃，否则保持持久数据不变。无法执行的接口面，显式记录它没测以及原因。

## 每条检查要留下的证据

- 接口面，以及版本（若有）。
- 用的请求或命令。
- 预期的 status / 形态 / 输出。
- 实际的 status / 形态 / 输出。
- pass / fail。
- 有用时附上产物路径，或内联一段脱敏样本。

报告、日志、截图、payload 里都不要泄露任何密钥。
