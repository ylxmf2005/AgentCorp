# 38 项技能

[← 返回 README](../README_CN.md) · [English](skills.md)

所有技能的参数见 [parameters_CN.md](parameters_CN.md)。

技能按交付阶段分组（同一阶段内，规划者、reviewer 和实现者放在一起）。每项技能的行为定义在 `agentcorp/<skill>/SKILL.md` 中，同时出现在 Claude Code 和 Codex 的技能选择器里。它们合起来覆盖了整条交付循环以及在真实项目中运转这条循环所需的全部配套行为。

## 编排

- `delivery-orchestrator` — 掌控整条交付流水线并把守每道 gate：给工作分类，把各阶段路由给合适的角色，判断证据何时充分到可以放行

## 规划与设计

- `solution-architect` — 在一行代码写出来之前就把结构性设计拍板，压住变更放大、认知负荷和未知的未知带来的复杂度
- `implementation-planner` — 把通过的设计切成有先后、相互衔接、各自可独立验证的故事，工程师拿到就能直接写
- `plan-review-lead` — 判断一份 Story Spec 是否成熟到工程师可以直接动手——不需要自己补架构、补范围或引入未批准的依赖
- `test-planner` — 在实现开始前确定验证策略——测什么、为什么测，覆盖率跟着风险走而不是撒胡椒面
- `test-plan-reviewer` — 在实现动工前判断一份 TestPlan 的覆盖是否对齐了需求和风险
- `parallel-researcher` — 把一个问题拆成彼此独立的调研 lane，查明到底有哪些证据，对冲锚定效应和确认偏误

## 实现

- `implementation-engineer` — 把通过的 Story Spec 变成干净、能跑的代码，紧贴项目已有的架构、模式和约定

## 代码 review

- `code-review-lead` — 协调各专项 reviewer，把发现收敛成一个合并决定，靠证据筛选而不是数人头
- `correctness-reviewer` — 追猎功能性缺陷——差一错误、状态损坏、空值传播、竞态——让代码在真实输入下出错的那些东西
- `security-reviewer` — 排查可利用的安全漏洞——注入、越权、硬编码密钥、SSRF——能让攻击者突破信任边界的入口
- `performance-reviewer` — 捕捉在规模下拖慢系统或耗尽资源的退化：N+1 查询、无界增长、缺分页、阻塞 I/O
- `reliability-reviewer` — 暴露故障处理上的缺口——缺超时、吞错误、重试风暴、泄漏、级联故障——会让系统崩溃或挂死的那些
- `adversarial-reviewer` — 先假定系统已经坏了再去证明，追猎由组合、时序和滥用引发的涌现故障——单轴 reviewer 各自看不到的那种
- `simplicity-reviewer` — 找出回不了本的复杂度：多余的抽象、过早泛化、死代码、成本对不上收益的结构选择
- `taste-reviewer` — 判断一处改动的形态对不对——hack 还是根因修法、抽象有没有选错、概念有没有叫错名、API 手感、比例——顶住流水线偏向最小 diff 的拉力来评判
- `change-hygiene-reviewer` — 检查 diff 里的每个 hunk 是否都追溯到一条批准过的需求，拦住越界改动、历史残留和格式噪音
- `standards-reviewer` — 核实代码和产物是否遵循项目自身的约定——frontmatter、命名、格式、引用风格——而非泛泛的业界最佳实践
- `comment-optimizer` — 直接动手优化注释：改写、删除或补上简洁的 why/边界/历史说明，不绕 review-再-fix 的弯路
- `project-steward-reviewer` — 判断一处改动值不值得纳入项目的长期历史：维护成本、模块边界、对外暴露面、方向
- `api-contract-reviewer` — 守住 API 边界——schema、路由、类型、状态码、错误语义——保持向后兼容，让消费方不会在没有迁移路径的情况下被破坏
- `review-researcher` — 在修复落地之前，独立把每条 review 发现核实到确凿事实，然后提出正确且利落的修法
- `review-fixer` — 在授权的文件集内按研究给出的修法从根上落地一组已核实的修复，同时补上回归检查

## 验证

- `test-leader` — 统筹一次变更的整体验证：分派专项 tester，把他们的证据汇成一个判断，以充分证明为条件把守交付
- `e2e-tester` — 接过一个真实用户的目标，端到端驱动在线系统跑完完整流程，如实记录发生了什么
- `api-contract-tester` — 编写并实际运行测试，证明一个 API 兑现了它承诺的请求/响应形状、状态码、认证边界和错误语义
- `regression-tester` — 确认变更之后原本正常的行为依旧正常，逮住那些悄无声息坏掉的回归

## 验收与交付

- `acceptance-review-lead` — 把守交付前的最后一道 gate，判断全套证据是否证明了每条需求已满足、风险可接受

## 配套

- `probe` — 在工作启动前深入陌生地带侦察，把地形教给发起人：对他已有认知的修正、出乎意料之处、在本地什么样算"好"、以及一份持续更新的未知项台账
- `brainstorm` — 一次一问地压测意图、范围和可行性，把一个模糊的请求变成经发起人批准的可测试需求
- `grill` — 对 owner 发起一场一次一问、步步紧逼的访谈，压测一份既有的计划、设计或论证，最终给出诚实的就绪裁定（`ready` / `needs-evidence` / `needs-redesign` / `blocked`）
- `compound` — 拥有 `compound` phase，也接独立的沉淀/复盘请求：把本轮教训变成落地资产（回归测试、仓库规则、需发起人批准的技能提案）；按需用确定性提取器回放会话录制的轨迹（Claude Code JSONL / Codex rollouts）——时间和 token 花在了哪里、哪些反复失败、每条论断锚定到它的证据源
- `authenticated-browser-session` — 维持一个真实的已登录浏览器会话来验证需认证的流程，不读 Cookie、不向用户索要 token
- `explain` — 按读者水平讲解 bug、测试进展、review 发现和交付状态——默认面向零上下文的发起人——每个结论都带着自己的状态和证据
- `walkthrough` — 把一次变更做成教学 artifact——先给背景、先建直觉再上代码、把变更讲成一个故事而不是一张文件清单——以一份发起人必须通过才能 merge 的测验收尾
- `precommit-setup` — 架设提交时的护栏：默认跑快速的确定性检查，AI review 可选开启，约束写明白，但不拖慢每次提交
- `skill-evolution` — 把会话结束时捕获到的技能改进信号变成一次经 review、已落地的编辑（或从调研中长出一个新技能），让 AgentCorp 自身的技能在有人参与的前提下持续进化
- `semantic-core-translation` — 把中英文档维护成一对连贯的整体：翻译时守住语义，确立哪份是权威源，新建中文文档时先问是否需要英文对应件而不是默认就要
