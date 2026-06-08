# TestPlan 评审参考

评审 TestPlan 时常见的红旗信号——看到这些，多半说明计划照着执行也建立不起信心。

- 「测一下功能能用」——没有可验证的断言，无法证伪。
- 面向用户的工作流改动，却只有 unit 覆盖，缺端到端验证。
- public surface（API）变更，却没有 request/response 检查。
- 迁移或持久化改动，却没有 before/after 的数据核对。
- browser/UI 工作，却没有真实交互或视觉证据。
- 环境假设被默认掉，没写明 tester 实际怎么跑。
- coverage 汇总里有条目既没有 E2E 目标、也没给出省略的理由。
