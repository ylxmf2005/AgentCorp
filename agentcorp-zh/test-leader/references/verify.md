# 本地验证编排参考

实现和 code review 之后，用它来编排测试人员。

## 验证层级

验证是分层的，各层之间有先后顺序：只有低层级的必做检查通过之后，高层级的证据才算数。

- **Capability** — 每个 Must Have 都需要直接证据；如果已有自动化测试，直接跑；只有在 TestPlan 明确标注需要人工确认的地方，才走人工。
- **Integration/API** — 跨模块的数据流必须实际跑通；边界上的错误传播要检查过；public contracts 必须用真实请求、响应、schema 或 CLI 输出验证，不能靠猜。
- **E2E** — 每个面向用户的能力至少要有一条完整的用户目标跑通；happy path 和应该覆盖的 error path 都要跑；每一步都要记录 action、expected result、actual result 和 evidence。

## 环境处理

如果 TestPlan 里有环境规格，按规格来。如果环境不可用，如实说明哪些检查被阻塞或降级，别靠读源码编造证据。

## 任务分配

- **API Contract Tester** — HTTP、JSON-RPC、A2A、CLI、SDK、schema、外部接口 contract。
- **E2E Tester** — 通过浏览器、CLI、API 或产品 UI 的真实用户流程。
- **Regression Tester** — bug 复现、fix 验证、周边回归 suite。
- **Specialist reviewers** — 需要时，由他们基于自己的风险领域解读证据。

## 证据质量

合格的证据要包含：执行的命令、请求、响应、截图、日志、artifact、环境信息、时间戳，以及 pass/fail 状态。弱证据是“看起来没问题”“应该能过”，或者纯粹靠读源码推断行为。
