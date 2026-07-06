# 思考体系协议

当需要在 `probe`、`brainstorm`、`grill`、`explain`、`walkthrough` 之间路由或交接时，使用这个 reference。

## 五个动作

- `probe` 把隐藏不确定性变成被命名的不确定性：unknown unknown -> known unknown。
- `brainstorm` 把不清晰意图变成可选择的需求或方向。
- `grill` 把已选形状打磨成更不容易骗过自己的形状。
- `explain` 把看不懂的知识点、报告、摘录或输出变成带上下文的理解。
- `walkthrough` 把具体代码变更变成可教学的理解。

## 知识矩阵

不确定性会影响方向时，使用 Rumsfeld/Johari 风格矩阵：

| 类别 | 含义 | 处理 |
| --- | --- | --- |
| known known | 我们知道，且能引用证据。 | 直接使用；必要时解释。 |
| known unknown | 我们知道缺什么。 | 询问、检查、研究或测试。 |
| unknown known | 知识已经存在于某处，但不在当前框架里。 | 搜索历史产物、learnings、文档、代码、日志或用户历史决策。 |
| unknown unknown | 我们还没命名缺失的框架。 | 用 probe 镜头追问，直到它变成 known unknown。 |

不要让 unknown 停留在诗意表达里。把它转成以下之一：

- `ask_user`：只有 sponsor 能回答的问题。
- `inspect_repo`：要检查的文件、测试、文档或行为。
- `inspect_history`：要搜索的历史任务、learning、决策、事故、review 或 artifact。
- `research_external`：需要验证的当前事实或第三方事实。
- `experiment`：便宜的复现、spike 或测量。
- `accept_assumption`：显式假设，带风险 owner 和回看点。

## 交接形状

这些 skill 之间交接时，保留：

- 原始请求或产物
- 关键知识矩阵条目
- 已检查证据
- 未解决 known unknown 及其 resolution path
- 推荐下一步动作

下一步动作应是：`probe`、`brainstorm`、`grill`、`explain`、`walkthrough`、`parallel-researcher` 或正常 AgentCorp delivery role。
