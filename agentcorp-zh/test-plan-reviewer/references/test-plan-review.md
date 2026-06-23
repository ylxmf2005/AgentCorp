# TestPlan review 参考

review TestPlan 时常见的 red flag——如果你看到下面这些情况，执行这个 plan 大概率也建立不了什么信心。

- "测一下功能是否正常"——没有可验证的断言，也没有可证伪的点。
- 面向用户的 workflow 变更只覆盖了 unit test，没有 end-to-end 验证。
- public surface（API）发生变更，却没有 request/response 检查。
- migration 或 persistence 变更，没有前后数据对账。
- Browser/UI 相关工作，没有真实交互或视觉证据。
- E2E case 没声明执行形式，或者实际上是披着 E2E 标签的 API call——无法证明用户实际看到的是什么。
- check 只写了意图但没有步骤（比如"起个 Plan 验证恢复"），或者把用户输入留空（比如"输入一个合适的 prompt"）——测试人员得自己现编操作流程。
- plan 里引用的 entry point、page 或数据，在 testing context 文档（`teamspace/testing-context.md`）中找不到出处，测试人员只能现场瞎猜。
- 环境假设被默认带过，没有说明测试人员实际该怎么跑。
- coverage summary 里某一项既没有 E2E objective，也没说明为什么跳过。
