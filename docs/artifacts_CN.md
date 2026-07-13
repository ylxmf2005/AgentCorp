# 产物一览：完整运行时布局

[← 返回 README](../README_CN.md) · [English](artifacts.md)

每个阶段都会留下一份带 frontmatter（`artifact_type` / `author_agent` / `phase` / `status` / `source_artifacts`）的结构化产物，让工作可审计、可追溯。并不是每个任务都会用到下面每一个文件：这棵树展示的是完整运行时布局，而 AgentCorp 只会创建这个任务实际需要的阶段、评审、测试、研究包和交接单。

```
teamspace/
├── testing-context.md                    # 跨任务的运行时事实：入口点、登录、页面、可观测面、测试数据
├── compound/                             # 跨任务沉淀库：一条教训一个文件、已去重，含试过不通的走法
│   └── invite-token-reuse-trap.md        #   触发情境 -> 根因 -> 该怎么做 -> 下次如何更快
├── knowledge/                            # 可复用研究快照：从任务研究里拷出、值得留存的部分
│   └── <technology>/INDEX.md
├── probes/                               # 独立地形报告：在任何任务存在之前就写下
│   └── 20260620-billing-module.md
├── walkthroughs/                         # 任务之外的独立变更讲解（自包含 HTML）
├── replays/                              # 独立 session 复盘（compound 的复盘对象）：一次 session 一份 ReplayReport
└── tasks/20260622-invite-members/        # 当前任务根目录
    ├── task.md                           # 任务记录：请求、成功标准、阶段序列、门禁历史、决策
    ├── manifest.md                       # 审计台账：阶段、Owner、状态、人工门、质量门、分派单、产物、回执
    │
    ├── probe/                            # 可选：进入需求前的地形报告，附一份持续更新的未知项台账
    │   └── 00-probe.md
    │
    ├── handoffs/                         # 委派阶段的分派单/回执闭环
    │   ├── 001-validate-requirements.md
    │   ├── 001-validate-requirements-receipt.md
    │   ├── 002-test-plan.md
    │   ├── 002-test-plan-receipt.md
    │   └── ...
    │
    ├── requirements/
    │   └── validated-requirements.md     # 意图、用户、旅程、FR/AC、非目标、约束、假设、待解问题
    │
    ├── design/                           # 按需生成；多份设计产物可以并存
    │   ├── architecture.md               # 新系统/子系统设计：组件、数据/状态流、接口、取舍
    │   ├── impact-analysis.md            # 增量设计：受影响模块、当前/目标行为、风险、需保留的行为
    │   ├── diagnosis.md                  # Bug 诊断：复现、假设、根因、建议修法、回归标准
    │   └── interface-contract.md         # 公共/共享契约：schema、认证、错误、兼容性、验证钩子
    │
    ├── test/
    │   ├── test-plan.md                  # 按风险排序的总体策略、必测层级、显式的缺口、禁区
    │   ├── api-test-plan.md              # API/集成手册：字面请求、预期响应、证据处理
    │   ├── e2e-test-plan.md              # E2E 手册：浏览器步骤、字面输入、截图/URL 证据
    │   ├── regression-test-plan.md       # 回归手册：波及范围、既有套件、修前失败/修后通过的检查
    │   ├── test-plan-review.md           # 对测试计划的独立评审：approve / request_changes / needs_more_evidence
    │   └── exploration/                  # 用于补全 testing-context.md 的工作文件；确认过的事实回写过去
    │       ├── charters.md               # 探索章程与状态
    │       ├── frontier.md               # 候选入口点及其来源
    │       └── journal.md                # 逐个动作的观察、截图和阻塞
    │
    ├── implementation/
    │   ├── implementation-story.md       # 故事规范：划定范围的 AC、有序任务、目标模块、约束、验证期望
    │   └── implementation-result.md      # 实际结果：改动的文件、命令、偏差、阻塞、移交评审
    │
    ├── review/
    │   ├── plan-review.md                # Plan Review Lead 对故事规范的决定
    │   ├── plan-review-findings/         # 计划评审专项的发现（与 code-review 的分开存放）
    │   ├── code-review.md                # Code Review Lead 的汇总决定
    │   ├── specialist-findings/          # 专项发现；只有被调用的 reviewer 才在这里写文件
    │   │   ├── correctness-reviewer.md
    │   │   ├── security-reviewer.md
    │   │   ├── performance-reviewer.md
    │   │   ├── reliability-reviewer.md
    │   │   ├── simplicity-reviewer.md
    │   │   ├── taste-reviewer.md
    │   │   ├── change-hygiene-reviewer.md
    │   │   ├── standards-reviewer.md
    │   │   ├── comment-optimizer.md
    │   │   ├── project-steward-reviewer.md
    │   │   ├── api-contract-reviewer.md
    │   │   ├── adversarial-reviewer.md
    │   │   └── parallel-researcher.md    # 案头/源头核证级研究，作为专项证据时使用
    │   ├── research/                     # 评审复核；每条发现都当作可能的误报来检验
    │   │   ├── 00-index.md               # 汇总各条问题研究文件的索引
    │   │   ├── 001-confirmed-...md       # 一条问题一个文件：裁定、证据、根因、修复建议
    │   │   └── 002-false-positive-...md  # 误报、或需人工确认的记录
    │   ├── fix-records/                  # 每个互不重叠的 Review Fixer 文件组一份记录
    │   │   └── invite-service.md         # 各项的处置、改动的文件、验证、漂移说明
    │   └── fix-result.md                 # 编排者对所有修复组和合并验证的汇总
    │
    ├── research/                         # 动手研究包：任务需要做实验或留快照时生成
    │   └── invite-email-provider/
    │       ├── 00-report.md
    │       ├── env/
    │       ├── sources/
    │       └── experiments/
    │
    ├── explain/                          # 可选：为 sponsor 评审落库的白话解释
    │   └── review-summary/
    │       ├── 00-index.md
    │       └── 001-finding-context.md
    │
    ├── walkthrough/                      # 可选：本次变更的教学产物，背景 → 直觉 → 故事 → 测验
    │   └── invite-flow.html
    │
    ├── verification/
    │   ├── assignments/                  # Test Leader 在委派验证时写给各测试者的分派单
    │   │   ├── e2e-tester.md
    │   │   ├── api-contract-tester.md
    │   │   └── regression-tester.md
    │   ├── test-results/                 # 真实执行的证据；不臆断成功
    │   │   ├── e2e-tester.md             # 状态、检查过的流程、命令、截图/URL 证据
    │   │   ├── api-contract-tester.md    # 请求/响应、通过/失败、schema/契约证据
    │   │   └── regression-tester.md      # 前后对比、命令、退出码
    │   └── verification-report.md        # Test Leader 的决定，援引各 result 文件与剩余缺口
    │
    ├── acceptance/
    │   ├── acceptance-package.md         # 编排者的验收包：成功标准、产物索引、直接证据、缺口
    │   └── acceptance-decision.md        # Acceptance Review Lead 的裁决：accept / reject / needs_more_evidence
    │
    ├── compound/
    │   └── compound-result.md            # 沉淀 phase 的产出：落了哪些回归测试、写了哪些规则、提了哪些提案
    │
    └── delivery/
        └── delivery-report.md            # 最终交付报告：状态、代码/产物位置、测试、风险、后续项
```
