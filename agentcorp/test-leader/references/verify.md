# 本地验证统筹参考

实现和 code review 之后，用它来统筹各 tester。

## 验证层级

验证是分层的，层级之间有先后：底层的必需检查没过，上层的证据就还不算成立。

- **Capability**——每一条 Must Have 都要有直接证据；有自动化测试就跑；TestPlan 点名要人工确认的，才走人工。
- **Integration/API**——跨模块的数据流被真正走过；边界处的错误传播被检查过；public 契约用真实的请求、响应、schema 或 CLI 输出来验，而不是空口。
- **E2E**——每一项面向用户的能力，至少有一条完整用户目标跑通；该走的 happy path 和 error path 都走；每一步都记下动作、预期结果、实际结果和证据。

## 环境处理

有 TestPlan 的环境规格就照它来。环境不可用时，如实说清到底是哪些检查被 blocked 或降级，而不是从读源码里编出证据。

## 指派

- **API Contract Tester**——HTTP、JSON-RPC、A2A、CLI、SDK、schema、对外接口契约。
- **E2E Tester**——经由 browser、CLI、API 或产品 UI 的真实用户流程。
- **Regression Tester**——bug 复现、修复证明、邻近的 regression suite。
- **专项 reviewer**——需要时，在各自的风险域内解读证据。

## 证据质量

好的证据带着命令、请求、响应、截图、日志、产物、环境、时间戳和 pass/fail 状态。弱证据是「看起来没问题」「应该能过」，或者本该被执行的行为却只靠读源码来推断。
