# 研究方法：拆分子任务、选择来源、并行执行、综合结论

本文是 `parallel-researcher` 的执行手册：如何把研究问题拆成 lane、每个 lane 该查哪些来源、如何并行派发，以及 synthesis 阶段要检查什么。SKILL.md 讲为什么这么做；这里讲怎么做。

## 研究类型与拆分

先确定研究类型，再拆 lane。别让多个 researcher 去查同一个大而空的问题——如果 lane 没有各自独立的问题和来源策略，回收来的就是好几份大同小异的模糊综述。

- Technology selection / SOTA：官方文档、release notes、标准/RFC、上游 issue/PR、主流实现、benchmark、迁移与弃用信息。
- Open-source project scan：GitHub/GitLab 仓库、README、文档、examples、issue、discussion、release/changelog、stars/forks/活跃度、license、维护节奏。
- Papers / academic：arXiv、Google Scholar、Semantic Scholar、OpenAlex、Crossref、ACM/IEEE/Springer/USENIX、Papers with Code、相关综述与 benchmark。
- Engineering practice：官方指南、成熟项目的代码、postmortem、会议演讲、工程博客、Stack Overflow、HN/Reddit 讨论。
- Product / market / competitors：官网、定价、文档、changelog、案例研究、G2/Capterra、行业报告、press release、客户论坛。
- Security / compliance / standards：CVE/NVD、GitHub Security Advisories、厂商安全公告、OWASP、CIS、NIST、IETF/W3C/WHATWG/ISO 标准。
- Internal / local knowledge：当前仓库、`AGENTS.md`/项目文档、团队空间产物、历史 MR/PR、内部 wiki、Slack/IM、MDB/日志、Rainbow/配置；仅在任务授权且工具可用时使用。

常用 lane 模板：

- `source-map`：确认要查哪些来源、keywords、时间范围、权威优先级。
- `official-docs`：官方文档、版本、弃用说明、兼容性、推荐实践。
- `open-source-prior-art`：有代表性的仓库和真实实现。
- `papers-and-benchmarks`：论文、benchmark、排行榜、评估指标。
- `community-and-failure-modes`：issue、postmortem、讨论、踩坑记录。
- `local-repo-and-org-context`：代码库当前状态、组织内先例、现有约束。
- `synthesis-challenger`：独立寻找反例、矛盾证据和被忽略的来源。

## 搜索来源矩阵

每个任务选 3 到 6 个来源类别；高风险或高成本的决策至少覆盖 4 个，且必须包含一个反例/失败来源。

| 目标 | 主要来源 | 次要来源 | 必查项 |
| --- | --- | --- | --- |
| 当前 API/库的使用方式 | 官方文档、API reference、release notes、迁移指南 | Context7、源码、examples、Stack Overflow | 当前版本、弃用情况、breaking changes、最小可用方式 |
| 开源实现 | GitHub/GitLab 搜索、仓库文档、issue、PR、discussion | package registry、stars 历史、commit 活跃度 | 维护状态、license、实际使用方式、未决 bug |
| 论文与算法 | arXiv、Semantic Scholar、Google Scholar、OpenAlex、Crossref | Papers with Code、会议论文集、作者仓库 | 问题定义、指标、数据集、可复现实验、后续工作 |
| Benchmark / 排行榜 | Papers with Code、官方 benchmark、公开评测集 | 项目 README、复现实验、issue | 指标是否适合任务、数据泄漏、评测时效性 |
| Web 领域的先前工作 | 搜索引擎、厂商文档、工程博客、会议演讲 | HN、Reddit、博客 | 多来源是否一致、时间范围、营销偏见 |
| 产品/竞品 | 官网、定价、文档、changelog、案例研究 | 新闻、G2/Capterra、客户论坛、招聘启事 | 当前能力、限制、定位、商业约束 |
| 安全/合规 | NVD/CVE、GHSA、厂商安全公告、OWASP/CIS/NIST | 漏洞库、安全博客 | 当前版本是否受影响、修复版本、缓解措施 |
| 内部知识 | 仓库文档、团队空间、MR/PR、wiki、Slack/IM、日志/配置平台 | 运行手册、postmortem、历史设计文档 | 本项目约束、已有决策、组织偏好 |

搜索必须覆盖同义词和反向查询。例如：`<tech> best practice 2026`、`<tech> migration guide`、`<tech> deprecated sunset`、`<approach> alternatives`、`<approach> postmortem`、`site:github.com <library> example`、`<paper/topic> survey`、`<system> architecture`、`<claim> criticism`。

## 来源级别的验证：什么时候必须看到代码

README、官方文档和论文摘要都是项目的"门面"——说"支持 X"不等于真的实现了 X，更不等于实现对了。以下情况如果只停留在网页层面，等于没验证：

- **推荐方案所依赖的能力**：把候选仓库完整 clone 到临时目录，在源码里定位该能力及其测试的实现。README 声称但你在源码/测试里找不到的东西，记为"unconfirmed"。commit 历史也是证据：`git log`/`git blame` 能直接回答维护节奏、哪个版本引入了关键能力、bug 是怎么修的。顺手看看 examples 和 issue 里的真实用法——那是文档之外的第一手证据。

- **论文/算法**：先找实现——论文里的代码链接、Papers with Code、作者的 GitHub、高 star 的复现项目。如果有实现，读核心算法文件并核对论文声称的内容（指标怎么算的、关键 trick 到底有没有实现、超参数是不是论文里那套）；如果没有公开实现，就在证据缺口里明确写"cannot be reproduced"——这本身就是一条影响选择的事实。

- **存疑的版本行为**：当博客和 Stack Overflow 说法冲突时，直接读当前 tag 的上游源码或 changelog 来定论；别选人多那边。

操作边界：

- 如果 GitHub 网页版能让你看清单个文件的内容，就不必 clone；只有在需要跨文件跟调用链、grep 符号、检查测试覆盖率或查看 commit 历史时才 clone。默认完整 clone；仅在仓库大得离谱（数 GB）时才退而求其次用 `--depth 1` 或 sparse-checkout，并接受丢失历史证据的代价。

- 只读 clone，不要执行：把仓库里的脚本、setup.py 和 CI 配置当作不可信输入，绝不运行。遵守 license。

- 引用来源证据时精确到 `file-path:line-number` 或 commit permalink，让读者能验证到某一行代码，而不是只看到仓库主页。

## 并行执行协议

1. 确定研究简报：写下核心问题、它服务于什么决策、时间范围、本地约束、候选方案、必须包含/排除的来源，以及成功标准。
2. 画出证据地图：列出所有 lane，每个 lane 要写清楚它的问题、来源、搜索 keywords、预期产出和质量门槛。
3. 派发 lane：每个 researcher 只给它自己的问题、上下文摘要、来源策略和输出格式。不要给它完整历史，也不要让多个 lane 同时写最终报告。
4. 单个 lane 的产出必须包含：结论、关键证据、引用、置信度、冲突/反例、未覆盖的点，以及下一步建议。
5. 综合阶段由你负责：合并重复来源、按证据质量排序、标记冲突、指出影响决策的缺口。
6. 自检：确认是否覆盖了官方来源、真实实现、失败/反例、当前版本/日期，以及任务的本地约束；确认事实和推断是分开的。

如果研究量很小，可以跳过真正的并行，但仍需说明为什么没有拆分。如果任务很大，优先并行，而不是让一个 researcher 从头搜到尾。

## 证据质量权重

按以下顺序加权，但不要机械执行：

1. 当前官方文档、标准、release notes、上游源码、一手数据。
2. 同行评审论文、权威会议、可复现 benchmark、成熟项目中的真实实现。
3. 工程博客、postmortem、issue/PR、社区共识。
4. 二手博客、SEO 聚合站、模型生成的摘要、未经核实的论坛帖。

高过时风险的信息必须带日期或版本说明：定价、模型能力、API 限制、法规、产品功能、benchmark 排行榜、依赖兼容性、安全漏洞。

## 报告骨架

写一份能驱动决策的研究报告；frontmatter 遵循 `templates/decision-artifact.demo.md` 中的 envelope 字段（使用它的 `status` 枚举：`approve` / `request_changes` / `needs_more_evidence` / `blocked`，不要自己发明值），正文按以下结构组织：

- `Research Brief`：核心问题、服务的决策、范围、假设、停止条件。
- `Parallel Lanes`：每个 lane 的问题、来源、执行状态和研究价值。
- `Evidence Map`：来源列表、类型、日期/版本、权威级别，以及每个来源支持的断言。
- `Findings`：按主题组织，明确区分事实、推断和置信度；`hands-on` 层级的能力断言还要带上三种状态（verified / verification failed / unverified；见 `research-package.md`）。
- `Comparative Options`：候选对比、适用条件、成本、风险。
- `Disagreements And Counterevidence`：冲突、反例、失败模式。
- `Recommendation`：must / should / could，并解释为什么适用于当前任务。
- `Decision-Relevant Gaps`：仍影响决策的缺口；如果没有，写"none"。
- `Follow-Up Research`：下一轮的具体问题和建议的 lane；如果不需要，写"none"。

报告必须具体到来源、项目、论文、版本、数字、接口、命令或文件路径。不要输出"业界普遍认为"这类空话。引用链接必须能让读者去验证。

## 交付前自检

- 每条结论都要区分"来源陈述的事实 / 来源自己的解读 / 我的推断 / 未经证实的假设"。
- 推荐方案依赖的能力必须下沉到源码、测试或官方实现层面，而不能停在 README、摘要和博客转述上；凡是本该 clone 却没 clone 的，要说明原因。
- 覆盖度自检已完成：官方来源、真实实现、反例/失败、当前版本和日期、任务的本地约束；缺了什么，在 Gaps 里写清楚。
- 来源冲突要保留，并解释可能的原因，不要掩盖。
- 所有高过时风险信息都带日期或版本说明。
- 引用要让读者能打开验证；没跟原始来源核对过的东西，不要写进结论。
