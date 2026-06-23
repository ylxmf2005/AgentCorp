---
id: test-plan
name: Test Plan
inputs: [validated requirements, diagnosis criteria, testing context]
outputs: [TestPlan artifact set]
optional: false
---

# Test Plan (TestPlan)

在 implementation 开始前把验证策略敲定。核心目的在于：趁还没代码、改动成本还低的时候，把这个 task 怎么算"被证明正确"说清楚——让 implementer 清楚哪些东西必须保持可测试，让 tester 知道怎么去证明那些高风险行为。

## 你要对抗什么

漏掉一个风险、或者验证错了地方，这是两个大敌。覆盖率必须跟着风险走：把精力集中在真正重要的关键路径、边界条件、异常行为和回归点上，不要平均撒胡椒面。与此同时，plan 要证明的是行为，而不是某种内部实现风格——别写那种一重构就成片飘红的脆弱断言，否则测试会在 refactor 时集体误报。

还有第三个敌人：只能写"测什么"却写不出"怎么测"的 plan。一个只有意图没有步骤的 check，逼得 tester 临场现编操作——而现编的操作跟你评估的风险未必是一回事。所以这个 artifact 的及格线是**逐字可执行（followable verbatim）**：tester 照着手册跑，不需要自己发明任何一步。

## 工作顺序

1. **读入 inputs** — 已验证的 requirements（或 diagnosis criteria）、约束条件、环境说明、已有的测试 artifact。
2. **核对 context** — 阅读 `teamspace/testing-context.md`；如果文件不存在，或者没覆盖到本次 task 需要测试的表面，先按照 `references/testing-context.md` 的 Step 0–5 补齐缺口，再继续。
3. **排序 risk** — 确定 Must-Haves、禁区、P0 gate 和执行顺序。
4. **撰写三份 execution manual** — 详细度标准见下文。E2E manual 引用的入口、页面和控件文本，必须能追溯到 page map 里**实际走过**的条目；任何仅靠代码推断出来的页面步骤，要么打回 exploration、实地验证，要么在该 flow 中显式标注"页面入口未验证"，并在整体策略的 open questions 中列出——不能把验证工作悄悄甩给 tester。
5. **指定结果记录方式** — 每份 manual 都说明 tester 每跑完一个 check 要写下什么：准确动作/输入，相关的 request/response，观察面，证据路径，cleanup，以及证据边界。
6. **撰写 overall strategy** — coverage summary 把每个 requirement 映射到一个 check id 及其所在文件。
7. **交付前自检** — 每条 AC 都有负责人；E2E 的执行形式是明确的；三份 manual 都通过"逐字可执行"标准；结果记录期望是明确的；环境描述如实；每个遗漏和缺口都写明了原因。

## 先搞 context，再写 plan

每当"怎么测"不够具体时，根因几乎总是缺了项目运行时 context：系统从哪里进入、怎么登录、页面长什么样、测试数据遵循什么约定。这些不该每次都临时瞎猜；它们应该沉淀在项目级的测试 context 文档 `teamspace/testing-context.md` 里，跨 task 复用、持续维护。

开 plan 之前先读它。如果文档不存在，或者没覆盖到本次 task 需要测试的表面（比如新页面、新接口），先按照 `references/testing-context.md` 里的 exploration 指引补齐缺口，再开始 plan。plan 里引用的任何入口、页面或数据，都应该能回溯到 context 文档里的来源；本次 task 特有的补充（专门构造的数据、临时配置）写进对应的 execution manual，不要反向喂给项目级文档——后者只收集跨 task 稳定的事实。

## Artifact 形态：一组文件，不是单个文件

TestPlan 是一组文件——整体策略加三份 execution manual——写入 assignment `output_path` 所在的 `test/` 目录：

- `test/test-plan.md` — 整体策略：risk 排序与执行顺序、Must-Haves、禁区、coverage mapping、环境、分工、residual risk。给 human gate、Test Plan Reviewer 和 Test Leader 看的全局视图；不要堆 case 细节。
- `test/api-test-plan.md` — API Contract Tester 的 execution manual：contract check 和数据/迁移验证。
- `test/e2e-test-plan.md` — E2E Tester 的 execution manual：完整的用户 flow，一步一步。
- `test/regression-test-plan.md` — Regression Tester 的 execution manual：blast radius、要跑的现有套件、相邻检查。

如果某份 manual 对本次 task 确实 out of scope（比如纯后端 task 没有用户 flow），在整体策略里写明省略原因；不要创建空文件。每份文件的章节结构参考 `references/templates/` 下的对应 demo。

## 三份 manual 各自要写到什么程度

判断详细度只有一个标准：**拿着这份 manual 和 testing-context 文档，指定的 tester 可以直接开跑，不需要自己发明任何一步。**

- **API manual** — 每个 check 给出可直接执行的 request 或 SQL 原文（method、path、params、body），预期 status、response shape 和断言，需要的 prerequisite 数据，以及失败时的处理方式（停止、标 blocked、还是继续）。"调用列表接口并校验返回"这种写法不通过；通过的形式是 curl 或 SQL 直接写在 manual 里。
- **E2E manual** — 先声明执行形式（默认以浏览器操作为主要证据，见下一节），然后把每个 flow 写成编号步骤：当前在哪一页、做什么操作；凡是用户输入内容的地方（搜索词、表单值，尤其是发给系统的 prompt），给出**字面文本**，不要留"输入合适的 prompt"这种空白；每一步预期的页面行为和截图点；supporting evidence（API/DB/logs）查什么。步骤里用可见文本加位置来定位控件（"提交（个人信息区块）"），不要用 css/xpath。每个 flow 的最后一步必须是结果确认（页面上看到了什么、数据里查到了什么）；不能停在"操作已完成"。错误路径也要写成步骤，别用一句话带过。
- **Regression manual** — 本次改动 blast radius 落在哪些模块和 contract 上；跑现有套件的字面命令；从受影响表面挑出的相邻检查，每条附入选理由；要新增的 regression check（理想形态是"改动前失败，改动后通过"）；通过标准。

## 结果记录标准

每份 execution manual 都必须说明 tester 怎么记录结果。API-driven、browser-driven、CLI-driven 和混合 live check 都用同一条及格线：

- 每条 check 记录开头写背景/用户目标、环境、入口，以及允许执行的写操作。
- 先写具体动作，再写结论。API 或 page-console check 要写 method、path、payload、credentials/session mode、status、关键 response body 字段，以及 trace/request ID。
- 写明证明用户可见结果或 runtime 结果的观察面：UI 状态、截图、DB read-back、log line、audit event、通知内容或人工确认。
- 异步或外部结果要点名观察窗口，以及由谁/什么确认。trigger request 返回成功，不足以证明邮件/聊天/push/scheduler 行为成功。
- 负向检查要说明观察了哪个来源，以及没有出现哪个匹配信号。如果无法可靠观察“没有发生”，预期结果应该是 `needs_more_evidence` 或 `blocked`，而不是 pass。
- 每条 check 结尾写 cleanup/restore 证据和证据边界：这条 check 证明了什么，不能证明什么。

## E2E 执行形式：浏览器作为主要证据

对于带用户界面的 task，E2E 默认以浏览器操作为主要证据——tester 用真实浏览器一步一步走 flow，以截图和页面状态作为主要证据，API/DB/logs 作为 supporting。如果环境没到位（服务没起、路由没切、数据没备），把对应 flow 标为 blocked 并说明缺什么；**不要把 API-driven check 写成 E2E**：这种 check 证明不了用户实际看到什么，它属于 API manual。当确实只能 API-driven（纯接口产品，无 UI）时，在 E2E manual 里显式声明，并说明这一层证据的边界。

当 task 输入与这个标准冲突时（比如 task 写明"本轮前端只是可选入口，以 API/logs 为主要证据"），不要默默选边：E2E manual 仍按本标准写出浏览器版步骤，在整体策略的 open questions 里点名这个冲突，说明每种形式能证明什么、不能证明什么，留给 human gate 决定执行哪一种。

## 验证分层与 risk 排序

验证天然是分层的；排 check 时，让各层归各层：

- **Capability layer** — 每个 Must-Have 和每个异常/边界 case 都要有直接 check 来证明。
- **Integration/API layer** — 每对通信的模块、每个 public contract，至少有一条 success-path check 和一条 error-propagation check。
- **E2E layer** — 每个面向用户的能力至少出现在一个完整的用户目标里，每个目标走 happy path 和 error path，并在每一步留下验证。

当底层还有未解决的失败时，别急着往上层堆 check —— 如果底座不稳，上层的证据也立不住。把所有 check 按 risk 排序（P0/P1/P2），让最重要的先被看到，并在整体策略里写明执行顺序和 gate：哪个 P0 失败会直接 block 哪些后续 check。

另外两类 risk 有专门的 owner：bugfix 和高风险存量行为必须由 regression check 兜底；任何涉及 migration、persistence、backfill、rollback、retention 或隐私敏感存储的事情，必须有显式的数据验证，覆盖 audit/log 信号以及安全/token 约束。

## 环境

在整体策略里用纯 Markdown 清楚描述运行时环境，让 tester 能照着把它搭起来：环境类型（local、docker、ssh、hosted 或其他）；命令怎么跑；相关工作目录、端口、service URL；环境变量只列名称（除非某个非 secret 值确实必要）；凭证只给引用方式，绝不打印 secret；以及当前环境是就绪的还是要现场搭建。如果完全没有可用环境，把 e2e 标为 blocked 或仅限 local，并列出哪些证据会因此被削弱。

## 输出

把 artifact set 写入 assignment `output_path` 所在的 `test/` 目录，结构参考 `references/templates/` 下的各 demo。这个 plan 只有在以下条件全部满足时才算到位：所有 Must-Haves 都是可观测的；禁区画得很具体；integration check 覆盖了真实边界；e2e 没有未经推理的缺口；三份 manual 都通过"逐字可执行"标准；给 Test Leader 的 tester-role 建议真正可执行。

如果 requirements 或 diagnosis criteria 太模糊，无法 confident 地排 risk 和设计验证，返回 `blocked`，并具体说明缺什么证据，而不是凭空编造。
