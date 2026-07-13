# 产物一览：完整运行时布局

[← 返回 README](../README_CN.md) · [English](artifacts.md)

每个阶段都会产出一份结构化产物，frontmatter 标注了 `artifact_type` / `author_agent` / `phase` / `status` / `source_artifacts`，保证全程可审计、可追溯。下面的树展示完整运行时布局——并非每个任务都会用到所有文件，AgentCorp 只创建任务实际需要的阶段、评审、测试、研究包和交接单。

```
teamspace/
├── testing-context.md                    # 跨任务运行时事实：入口点、认证、页面、可观测面、测试数据
├── compound/                             # 跨任务沉淀库：一条教训一个文件，去重过，含走不通的做法
│   └── invite-token-reuse-trap.md        #   触发场景 -> 根因 -> 应对方法 -> 下次怎么更快
├── knowledge/                            # 可复用研究快照：从任务研究中摘出的值得保留内容
│   └── <technology>/INDEX.md
├── probes/                               # 独立地形报告，写于任何任务创建之前
│   └── 20260620-billing-module.md
├── walkthroughs/                         # 任务外的独立变更讲解（自包含 HTML）
├── replays/                              # 独立 session 复盘（compound 的复盘对象）：每次 session 一份 ReplayReport
└── tasks/20260622-invite-members/        # 当前任务根目录
    ├── task.md                           # 任务记录：请求、成功标准、阶段序列、门禁历史、决策
    ├── manifest.md                       # 审计台账：阶段、Owner、状态、人工门禁、质量门、分派、产物、回执
    │
    ├── probe/                            # 可选：需求前的地形报告，附持续更新的未知项台账
    │   └── 00-probe.md
    │
    ├── handoffs/                         # 委派阶段的分派/回执闭环
    │   ├── 001-validate-requirements.md
    │   ├── 001-validate-requirements-receipt.md
    │   ├── 002-test-plan.md
    │   ├── 002-test-plan-receipt.md
    │   └── ...
    │
    ├── requirements/
    │   └── validated-requirements.md     # 意图、用户、旅程、FR/AC、非目标、约束、假设、待解问题
    │
    ├── design/                           # 按需创建；多份设计产物可并存
    │   ├── architecture.md               # 全新/子系统设计：组件、数据/状态流、接口、取舍
    │   ├── impact-analysis.md            # 增量设计：受影响模块、当前与目标行为、风险、须保留的行为
    │   ├── diagnosis.md                  # Bug 诊断：复现、假设、根因、建议修法、回归标准
    │   └── interface-contract.md         # 公共/共享契约：schema、认证、错误、兼容性、验证钩子
    │
    ├── test/
    │   ├── test-plan.md                  # 风险排序的总体策略、必测层级、显式缺口、禁区
    │   ├── api-test-plan.md              # API/集成手册：字面请求、预期响应、证据处理
    │   ├── e2e-test-plan.md              # E2E 手册：浏览器步骤、字面输入、截图/URL 证据
    │   ├── regression-test-plan.md       # 回归手册：波及范围、既有套件、修前失败/修后通过检查
    │   ├── test-plan-review.md           # 测试计划的独立评审：approve / request_changes / needs_more_evidence
    │   └── exploration/                  # 填充 testing-context.md 的工作文件；确认的事实回写
    │       ├── charters.md               # 探索章程与状态
    │       ├── frontier.md               # 候选入口点及来源
    │       └── journal.md                # 逐动作的观察记录、截图和阻塞项
    │
    ├── implementation/
    │   ├── implementation-story.md       # 故事规范：限定范围的 AC、有序任务、目标模块、约束、验证期望
    │   └── implementation-result.md      # 实际结果：改动文件、命令、偏差、阻塞、评审移交
    │
    ├── review/
    │   ├── plan-review.md                # Plan Review Lead 对故事规范的裁定
    │   ├── plan-review-findings/         # 计划评审的专项发现（与 code-review 分开存放）
    │   ├── code-review.md                # Code Review Lead 的汇总裁定
    │   ├── specialist-findings/          # 专项发现；只有被调用的 reviewer 才会在此写文件
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
    │   │   └── parallel-researcher.md    # 案头/源头核证研究，充当专项证据时使用
    │   ├── research/                     # 评审复核：每条发现都按疑似误报检验一遍
    │   │   ├── 00-index.md               # 各问题研究文件的汇总索引
    │   │   ├── 001-confirmed-...md       # 每条问题一个文件：裁定、证据、根因、修复建议
    │   │   └── 002-false-positive-...md  # 误报或需人工确认的记录
    │   ├── fix-records/                  # 每个不重叠的 Review Fixer 文件组一份记录
    │   │   └── invite-service.md         # 各项处置、改动文件、验证、漂移说明
    │   └── fix-result.md                 # 总控对所有修复组及合并验证的汇总
    │
    ├── research/                         # 动手研究包：任务需要实验或快照时生成
    │   └── invite-email-provider/
    │       ├── 00-report.md
    │       ├── env/
    │       ├── sources/
    │       └── experiments/
    │
    ├── explain/                          # 可选：供发起人审阅的白话解释，落库留存
    │   └── review-summary/
    │       ├── 00-index.md
    │       └── 001-finding-context.md
    │
    ├── walkthrough/                      # 可选：变更教学产物——背景 → 直觉 → 故事 → 测验
    │   └── invite-flow.html
    │
    ├── verification/
    │   ├── assignments/                  # Test Leader 委派验证时写的各测试者分派单
    │   │   ├── e2e-tester.md
    │   │   ├── api-contract-tester.md
    │   │   └── regression-tester.md
    │   ├── test-results/                 # 真实执行证据；不假设通过
    │   │   ├── e2e-tester.md             # 状态、已检查流程、命令、截图/URL 证据
    │   │   ├── api-contract-tester.md    # 请求/响应、通过/失败、schema/契约证据
    │   │   └── regression-tester.md      # 前后对比、命令、退出码
    │   └── verification-report.md        # Test Leader 的裁定，引用各 result 文件及剩余缺口
    │
    ├── acceptance/
    │   ├── acceptance-package.md         # 总控的验收包：成功标准、产物索引、直接证据、缺口
    │   └── acceptance-decision.md        # Acceptance Review Lead 的裁决：accept / reject / needs_more_evidence
    │
    ├── compound/
    │   └── compound-result.md            # 沉淀阶段的产出：落了哪些回归测试、写了哪些规则、提了哪些提案
    │
    └── delivery/
        └── delivery-report.md            # 最终交付报告：状态、代码/产物位置、测试、风险、后续事项
```
