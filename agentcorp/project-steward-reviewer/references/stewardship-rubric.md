# Stewardship Rubric

这份 rubric 把 Project Steward Reviewer 的“owner 品味”落成可复核的问题。它不是通用最佳实践清单；只在能说明当前改动会影响项目长期健康时使用。

## 外部锚点

- Google Engineering Practices 把 code review 的目标定义为让整体 code health 随时间变好，并明确允许 reviewer 拒绝不想纳入系统的功能；同时强调设计、复杂度、测试、文档与系统上下文。
- Google 的 ownership 模型把 peer review、code owner approval、readability 分开；code owner 关注改动是否适合其代码区、是否增加技术债、团队是否有能力维护。
- Apache Project Maturity Model 可作为成熟项目参照：代码可构建和可追溯；强依赖 license 不应增加限制；发布过程可重复；质量状态透明；安全、向后兼容和迁移说明优先；重要决策要有书面记录。
- Open Source Guides 强调 maintainer 可以友善但坚定地说 no：贡献可能有价值，但若不匹配项目 scope、vision 或实现质量，就不应该接受。

参考来源：
- https://google.github.io/eng-practices/review/reviewer/standard.html
- https://google.github.io/eng-practices/review/reviewer/looking-for.html
- https://abseil.io/resources/swe-book/html/ch09.html
- https://community.apache.org/apache-way/apache-project-maturity-model.html
- https://opensource.guide/best-practices/

## 审查维度

### 1. Project Fit

问：这个能力是否属于项目核心职责，还是只是某个调用方、团队、客户或短期场景需要？

强信号：
- 新能力需要项目长期拥有新的产品概念，但 requirements 没证明它属于项目 identity。
- 代码为了单个业务场景加入通用入口、全局配置或跨模块概念。
- 可通过插件、调用方组合、独立服务或局部扩展解决，却被塞进核心。

### 2. Ownership And Maintenance

问：谁将维护这部分？团队是否有专业知识、监控、升级、回滚和故障处理路径？

强信号：
- 新增依赖、外部系统、运行时、定时任务、数据迁移或发布步骤，但没有 owner。
- 改动引入需要持续更新的 compatibility shim、mapping 表、特例列表或双写路径。
- 关键知识只存在于实现者脑中，没有落到设计记录、注释、contract 或 runbook。

### 3. Architectural Boundary

问：改动是否尊重既有模块边界和信息隐藏，还是把内部细节泄漏成长期 coupling？

强信号：
- 调用方开始依赖内部状态、内部命名、存储细节或临时协议。
- 本该局部的概念被提升为全局 abstraction，导致更多模块需要知道它。
- 为绕过当前限制增加 backdoor、global flag、隐式 fallback 或跨层调用。

### 4. Public Surface And Compatibility

问：新增或修改的 public/shared surface 是否值得被长期承诺？

强信号：
- 新 endpoint、schema 字段、CLI 参数、配置项、exported type、event 或 JSON/RPC method 没有兼容策略。
- breaking change 没有 versioning、deprecation、迁移说明或调用方影响分析。
- “临时” public option 没有删除条件，实际会被用户或其他模块依赖。

### 5. Change Shape And Reviewability

问：这次 diff 是否让维护者能清楚看出真实语义改动？

强信号：
- 功能改动混入大规模重排、格式化、顺手重构、命名迁移或测试重写。
- 单个改动跨太多模块，无法按一个可审查的故事解释。
- 关键决策没有对应 issue、design artifact、comment 或 commit context。

### 6. Debt Ledger

问：如果接受债务，它是否被记录、限界并有退出路径？

强信号：
- TODO/FIXME/HACK 只描述“以后清理”，没有触发条件、owner 或验证方式。
- 兼容 shim、双写、fallback、特殊分支没有 sunset plan。
- 为赶进度牺牲结构，但没有说明为什么这是唯一可接受的临时选择。

### 7. Test And Documentation As Assets

问：测试和文档是否帮助未来维护者安全演进，而不只是让本轮通过？

强信号：
- 测试依赖过度 mock、只测调用次数、不会在核心行为破坏时失败。
- 新公共行为、配置、迁移、发布步骤或故障处理没有文档。
- 文档只复述怎么用，没有记录为什么这样设计、边界是什么、何时不能用。

## 输出建议

每条 finding 按这个结构写：

- 长期健康影响：未来谁会承担什么维护成本。
- 证据：代码/计划/设计/文档路径和行号，必要时附实际搜索结果。
- 建议动作：收窄范围、移到插件/调用方、补 contract、拆 PR、补 design record、加 sunset plan、要求 human owner 接受风险等。
- 路由：`review-fixer`、`implementation-planner`、`solution-architect`、`release owner`、`human owner`。

当问题本质是项目方向或 owner tradeoff，不要假装工具能裁决；把选项写清楚，路由给 human owner。
