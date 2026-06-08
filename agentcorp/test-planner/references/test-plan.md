---
id: test-plan
name: Test Plan
inputs: [validated requirements, diagnosis criteria]
outputs: [TestPlan artifact]
optional: false
---

# 测试计划（TestPlan）

在实现开始之前先把验证策略定好。目的是趁还没有代码、改动还便宜的时候，就讲清这份任务该如何被证明是对的——让实现者知道什么必须保持可测、让 tester 知道怎么去证那些有风险的行为。

## 你在对抗的是什么

漏掉风险，和验错地方，是两头敌人。覆盖度要跟风险走：把力气压在真正要紧的关键路径、边界、failure mode 和 regression 上，而不是平摊。同时让计划证明的是行为，而不是某种内部实现写法——脆弱的、随实现细节漂移的断言要挡在外面，否则测试会在重构里成片地假阳性。

## 这份产物要达到什么

读者要能信任这份计划的覆盖度，并据此直接行动：实现者据此知道哪些是 forbidden zone、哪些 Must-Have 必须保持可观测；Test Leader 据此把执行分派下去。所以它要把验证策略讲到能让人信任的程度——每条需求/验收标准如何被验证、对应到哪些检查、放在哪一层、看到什么证据算过。各章节的完整形态以 `references/templates/test-plan.demo.md` 为准；某一节确实超出本任务范围时才留空。

验证天然有层次，安排检查时让它们各归其位：

- **能力层**——每个 Must-Have、每个 failure/edge case，都该有一条直接的检查去证。
- **integration/API 层**——每一对相互通信的模块、每一个公共契约，至少有一条成功路径检查和一条错误传播检查。
- **e2e 层**——每个面向用户的能力，至少出现在一条完整的用户目标里，每条目标都走 happy path 与 error path，并在每一步留下验证。

当较低层还有未解决的失败时，不要急着往上层堆——底层不稳，上层的证据也立不住。整套检查按风险排序，让最要紧的先被看到。

## 环境

把运行环境用普通 Markdown 交代清楚，让 tester 能照着把环境跑起来：环境类型（local、docker、ssh、hosted 或其他）；命令的执行方式；相关时给出工作目录、端口、服务 URL；环境变量只给名字（除非确需某个非密值）；凭据只给引用、不打印密文；以及环境当前是否就绪、还是需要现场搭建。若根本没有环境可用，就把 e2e 标成 blocked 或 local-only，并列出哪些证据会因此变弱。

## 输出

把产物写到 assignment 的 `output_path`（通常是 `test/test-plan.md`），遵循 `references/templates/test-plan.demo.md` 的形态。只有当 Must-Have 都可观测、forbidden zone 划得具体、integration 检查覆盖到真实边界、e2e 没有无理由的缺口、且给 Test Leader 的 tester 角色推荐确实可落地时，这份计划才算到位。

如果需求或诊断判据模糊到无法有把握地排风险、设计验证，就返回 `blocked`，并指明具体缺什么证据，而不是把它编出来。
