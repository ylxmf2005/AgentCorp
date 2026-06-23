# 用户流程测试参考

跑通完整的面向用户流程时，请对照本文。

## 测试心态

把自己当作有明确目标的真人用户：从外部驱动产品，如实汇报你亲身体验到的行为，而不是拿"看起来没问题"的源码充当流程通过的证据。

## 执行模式

如果存在面向用户的界面，就把浏览器当作主要证据：用真浏览器、已登录的会话，照着 E2E 手册（通常是 `test/e2e-test-plan.md`）一步步走，逐条核对手册里的预期行为，并在它标记的截图点留存证据。API/DB/logs 仅作为辅助证据。

环境没就位时（服务没起、路由没切、数据没灌），把对应流程标为 blocked，并说明缺口；只有手册明确声明了 fallback，才允许切到 API-driven 执行，且必须在结果中注明这层证据证明不了什么。

## 如何执行一个流程

每个被分配的流程，先把前置条件敲死——入口、persona、环境、credentials、数据 setup；手册没明确指定的 precondition（比如该用哪个 object ID）不要现场捏造，直接报成 gap。

然后按"观察——操作——再观察"的节奏推进：先看清起始状态，做一次用户操作，等结果稳定后再走下一步，每一步都记下"预期 vs 实际"，直到达成目标、被 blocked，或者场景本身值得放弃。

核心是要验证流程的每一步，而不是只看最终结果。

遇到手册要求逐字输入的步骤（比如发给系统的 prompt），必须原文照搬，不要改写——改写后的输入测的已经不是 plan 评估过的那条路径了。

## 按界面类型留存证据

- Web：URL、当前可达页面状态、状态变更或失败时的截图、相关的 console/network 报错。
- CLI：command、stdout、stderr、exit code，必要时带上 latency。
- API 作为 user flow：request sequence、responses、status codes、持久化结果。
- Desktop：在支持的环境下留存截图/窗口状态。

## 真人 tester 执行日志

每个已完成或被 blocked 的 scenario 都写一条记录。先写具体执行，再写结论：

- 背景：persona、用户目标、环境、页面或入口，以及为什么这个 scenario 重要。
- 前置条件：选用的数据、账号/credential 引用、feature flag、配置备份、允许的写操作。
- 动作：准确的用户步骤、字面输入、命令行或脚本路径。如果流程中包含 page-context API，写明 method、path、body、credentials mode 和 timestamp。
- 响应：status code、response message、关键 body 字段、trace/request ID，以及持久化状态的 read-back。大 body 可以摘要，但产生它的确切 request 必须可见。
- 观察：tester 在页面、log、audit、邮件/聊天/push 或其他通知面上亲眼看到什么。人工观察要记录由谁确认，以及确认时间和内容摘要。
- 清理：恢复了什么、用哪个 request 或 UI 动作恢复、哪次 read-back 证明最终状态。
- 证据边界：这条记录证明了什么，仍然没有证明什么。

负向检查要写明观察窗口和来源（例如“15:00 到 15:05 观察聊天通知，没有看到匹配 X 的消息”）。如果没有可靠观察面，报告 `needs_more_evidence` 或 `blocked`；不要把负向路径写成 passed。

## Persona

- Novice：只看显性标签，没什么耐心，会报告困惑和缺失的 affordance。
- Power user：深挖文档、设置、快捷键，尝试 workaround，对性能和前后不一致很敏感。
- Adversarial：试探边界——重复操作、无效输入、authorization、信息泄露。

使用 TestPlan 指定的 persona；如果未指定，就选最匹配面向用户风险的那个，并说明原因。
