# Regression Testing 参考

在证明 bug 仍然被修复、或某项高风险行为仍然兼容时，使用这份参考。

## 如何清楚地证明 regression

首先说明要验证的 bug 或高风险行为，然后在当前 baseline 上尽力复现——如果复现不了，说明原因。接着运行本应发现问题的定向检查；如果 blast radius 不小，把受影响模块或 contract 周边的测试也拉进来一起跑。最后用直接证据确认修复或保留的行为确实成立，并如实记录所有无法复现、flaky、被阻塞或依赖环境的结果。

## 什么样的 regression 证据才算合格

- 原始复现步骤，以及现在观察到的结果。
- 在可行的情况下，提供 change 之前失败、之后通过的测试。
- 命令、请求、截图、日志或 artifact。
- 从受影响模块或 contract 中挑选的周边检查。
- 明确的 pass/fail 状态。

## 边界

除非被指派，否则不要扩展到广泛的 exploratory testing。不要把评审 implementation code 当作主要证据。不要隐瞒 flaky 或依赖环境的失败。
