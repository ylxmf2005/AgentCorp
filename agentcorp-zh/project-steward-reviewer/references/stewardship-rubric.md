# Stewardship Rubric

这份评分表将 Project Steward Reviewer 的“owner 判断”转化为可逐条核对的问题。它不是一份泛泛而谈的最佳实践清单；只有在你能论证当前变更确实会影响项目长期健康时，才启用它。

## 外部参考

- Google Engineering Practices 把 code review 的目标定义为让整体代码健康度随时间持续提升，并明确允许 reviewer 拒绝那些自己不愿接进系统的功能；同样强调设计、复杂度、测试、文档和系统上下文。
- Google 的 ownership 模型将 peer review、code owner 审批和 readability 分开；code owner 重点关注变更是否契合自己的代码领域、是否引入技术债务、以及团队是否有能力持续维护。
- Apache Project Maturity Model 是成熟项目的参照：代码可构建、可追溯；强依赖的许可证不应带来额外限制；release 过程可重复；质量状态透明；安全、向后兼容和迁移说明被优先对待；重要决策均有书面记录。
- Open Source Guides 强调，maintainer 可以友善但坚定地拒绝：一份贡献可能很有价值，但如果不符合项目的 scope、vision 或实现质量要求，就不该被接受。

参考资料：
- https://google.github.io/eng-practices/review/reviewer/standard.html
- https://google.github.io/eng-practices/review/reviewer/looking-for.html
- https://abseil.io/resources/swe-book/html/ch09.html
- https://community.apache.org/apache-way/apache-project-maturity-model.html
- https://opensource.guide/best-practices/

## 评审维度

### 1. Project Fit

问：这项能力属于项目的核心职责，还是只是某个 caller、团队、客户或短期场景的一时之需？

强烈信号：
- 新能力要求项目长期背负一个全新的产品概念，但需求本身并没有证明它属于项目的 identity。
- 代码为了一个单一业务场景，硬塞了一个通用 entry point、global config 或跨模块概念。
- 本可以用 plugin、caller 自行组合、独立服务或局部扩展解决，却强行塞进 core。

### 2. Ownership And Maintenance

问：这部分由谁维护？团队是否具备相应的 expertise，是否有监控、升级、回滚和 incident 处理的路径？

强烈信号：
- 新增了 dependency、外部系统、runtime、scheduled job、数据迁移或 release 步骤，但没有指定 owner。
- 变更引入了 compatibility shim、映射表、特殊 case 清单或 dual-write 路径，需要持续更新。
- 关键知识只存在于实现者脑子里，从未沉淀到设计记录、注释、契约或 runbook 中。

### 3. Architectural Boundary

问：变更是否尊重现有模块边界与信息隐藏，还是把内部细节泄露出去、造成长期耦合？

强烈信号：
- Caller 开始依赖内部状态、内部命名、存储细节或临时协议。
- 本该保持局部的概念被拔高为 global abstraction，迫使更多模块感知它。
- 为绕过当前限制，新增了 backdoor、global flag、隐式 fallback 或跨层调用。

### 4. Public Surface And Compatibility

问：新增或修改的 public/shared surface 是否值得长期承诺？

强烈信号：
- 新的 endpoint、schema 字段、CLI 参数、config 选项、exported type、event 或 JSON/RPC 方法没有兼容策略。
- breaking change 没有 versioning、deprecation、迁移说明或 caller 影响分析。
- 一个“临时”的 public 选项没有移除条件，事实上会被用户或其他模块依赖。

### 5. Change Shape And Reviewability

问：这份 diff 是否能让 maintainer 一眼看清真正的语义变更？

强烈信号：
- 功能变更与大范围重排、格式化、顺手重构、命名迁移或测试重写混在一起。
- 单次变更横跨过多模块，无法作为一个可 review 的 story 讲清楚。
- 关键决策没有对应的 issue、设计产物、注释或 commit 上下文。

### 6. Debt Ledger

问：如果不得不接受债务，是否做了记录、划了边界、并给了退出路径？

强烈信号：
- TODO/FIXME/HACK 只写了“稍后清理”，没有触发条件、owner 或验证方法。
- compatibility shim、dual write、fallback 或特殊分支没有 sunset plan。
- 为了赶 deadline 牺牲结构，却没有解释为什么这是唯一可接受的临时方案。

### 7. Test And Documentation As Assets

问：测试和文档是在帮未来的 maintainer 安全地演进系统，还是只为了这一轮能过？

强烈信号：
- 测试过度依赖 mock，只断言调用次数，核心行为崩了也不会挂。
- 新的 public 行为、config、迁移、release 步骤或 incident 处理没有文档。
- 文档只复述怎么用，没记录为什么这么设计、边界在哪、以及什么时候绝对不能用它。

## 输出指南

按以下结构输出每条发现：

- Long-term health impact：未来谁将承担什么样的维护成本。
- Evidence：代码/计划/设计/文档路径及行号，需要时附实际检索结果。
- Recommended action：缩小 scope、移到 plugin/caller、补充契约、拆分 PR、补充设计记录、添加 sunset plan、让人类 owner 承担风险等。
- Routing：`review-fixer`、`implementation-planner`、`solution-architect`、`release owner`、`human owner`。

如果问题本质上是项目方向或 owner 的权衡取舍，不要假装某个工具能拍板；把选项列清楚，然后丢给人类 owner。
