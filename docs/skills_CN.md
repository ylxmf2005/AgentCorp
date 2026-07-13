# 38 项技能

[← 返回 README](../README_CN.md) · [English](skills.md)

技能按交付阶段分组（同一阶段里，规划者、评审者、实现者放在一起）。每个技能的具体行为定义在 `agentcorp/<skill>/SKILL.md` 中，也会出现在 Claude Code 和 Codex 的技能选择器里。它们共同覆盖交付循环，以及真实项目里运行这套循环所需的配套行为。

## 编排

- `delivery-orchestrator` — 掌控整条交付流水线：给任务分级、把每个阶段派给对应角色、判断证据是否足以推进到下一关

## 规划与设计

- `solution-architect` — 动手写代码前敲定结构性决策，按住变更放大、认知负担和未知的未知带来的复杂度
- `implementation-planner` — 把定稿的设计切成有序、环环相扣、可独立验证的实现故事，工程师拿到即可开工
- `plan-review-lead` — 判断实现故事规范是否成熟到工程师能直接开工，不必自己补缺失的架构、范围或未批准的依赖
- `test-planner` — 在实现之前就定好验证策略：测什么、为什么测，覆盖面跟着风险走而非平均铺开
- `test-plan-reviewer` — 在实现启动前，判断测试计划的覆盖面是否对得上需求与风险
- `parallel-researcher` — 把问题拆成多条独立调研线并行求证，确认外部、内部和本地代码里到底有哪些证据，对抗锚定与确认偏误

## 实现

- `implementation-engineer` — 把批准的故事规范实现成干净、能跑的代码，贴合项目现有的架构、模式与约定

## 代码评审

- `code-review-lead` — 协调各专项评审、汇总他们的发现，按证据而非人数把「过不过」一锤定音
- `correctness-reviewer` — 专盯功能性缺陷：边界错误、状态写坏、空值蔓延、竞态，这些会让代码在真实输入下给出错误结果
- `security-reviewer` — 从攻击者视角排查能击穿信任边界的漏洞：注入、越权、硬编码密钥、SSRF
- `performance-reviewer` — 抓会在规模上拖慢系统或耗尽资源的性能退化：N+1 查询、无界增长、缺分页、阻塞 I/O
- `reliability-reviewer` — 找依赖出故障时让系统崩溃或卡死的隐患：缺超时、吞错误、重试风暴、资源泄漏、级联故障
- `adversarial-reviewer` — 先假设它已经坏了再去证明，专攻组合、时序、滥用引发的、单轴评审各自都看不到的涌现型故障
- `simplicity-reviewer` — 挖出不值当的复杂度：多余的抽象、过早泛化、死代码，以及配不上其成本的结构选择
- `taste-reviewer` — 判断改动是否长成了对的形态——hack 还是治本形态、错误抽象、概念性错误命名、API 手感、比例失衡——顶着管线偏向最小 diff 的惯性
- `change-hygiene-reviewer` — 核查 diff 里每处改动是否都能追溯到批准的需求，挡掉越界改动、历史残留和格式噪音
- `standards-reviewer` — 核对代码与产物是否遵循项目自己的约定：frontmatter、命名、格式、引用方式，而非通用最佳实践
- `comment-optimizer` — 直接优化注释：重写、删除或补充简短的 why/边界/历史说明，避免先 review 再修的绕路
- `project-steward-reviewer` — 从长期维护成本、模块边界、对外承诺和项目走向，判断一处变更值不值得写进项目历史
- `api-contract-reviewer` — 守住 API 边界：schema、路由、类型、状态码、错误语义保持向后兼容，不在无迁移路径下悄悄弄坏调用方
- `review-researcher` — 独立查证每条评审发现的真伪与根因，作为落地修复前的熔断器，再给出正确利落的修法
- `review-fixer` — 在授权的文件范围内，按复核给出的修法从根上落地一组已验证的修复，并补上回归检查

## 验证

- `test-leader` — 统筹一次变更的整体验证，派出各专项测试者，把证据汇成一个判断，守住交付前那道验证关
- `e2e-tester` — 以真实用户的身份从外部把系统端到端跑一遍完整流程，如实记录到底发生了什么
- `api-contract-tester` — 动手写测试并真跑，验证 API 是否兑现其结构、状态码、权限边界和错误语义
- `regression-tester` — 确认变更之后原本好用的行为仍然好用，逮住那些悄无声息坏掉的回归

## 验收与交付

- `acceptance-review-lead` — 守交付前最后一关，判断完整证据是否足以证明所有需求达成、风险可接受

## 配套

- `probe` — 在开工前先侦查陌生地带，把地形讲给发起人：修正其原有认知地图、指出意外发现、说明本地「好」长什么样，并维护一份持续更新的未知项台账
- `brainstorm` — 用一次一问的追问把模糊诉求逼成经发起人确认、可测试的需求
- `grill` — 对已有的 plan/设计/论证做一次一问的连环拷问，owner 现场答辩，以诚实的就绪判定（`ready`/`needs-evidence`/`needs-redesign`/`blocked`）收束
- `replay` — 用确定性提取器回放 session 的真实轨迹（Claude Code JSONL / Codex rollouts）：时间和 token 花在哪、一直在哪失败、该改进什么——发现分别路由到 skill-evolution 提案、项目文档或 compound 条目
- `authenticated-browser-session` — 用独立浏览器配置维持真实登录态来验证需登录的流程，不读 Cookie 也不要用户贴 token
- `explain` — 按读者水平讲解 bug、测试进展、评审发现和交付状态——默认面向零上下文的发起人——每个结论都带状态标签和证据
- `walkthrough` — 把一次变更做成教学产物——先讲背景、代码之前先给直觉、把变更讲成 story 而非文件清单——最后以一份发起人必须通过才能合并的测验收尾
- `precommit-setup` — 给仓库配提交前防线：默认跑快速确定性检查，AI 评审按需开启，不拖慢每次提交
- `skill-evolution` — 把在会话结束时捕获的技能改进信号，变成一次经审、落地的编辑（或从调研生成新的 skill），让 AgentCorp 自身的技能在人工参与的控制下持续改进
- `semantic-core-translation` — 将中英文档维护成一致的成对产物：翻译时守住语义，明确哪份是事实源，并在新建中文文档时询问是否需要英文配对文件，而不是自行假定需要
