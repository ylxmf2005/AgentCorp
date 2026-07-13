---
name: compound
description: "担任 AgentCorp 的沉淀引擎：把一轮工作教会我们的东西，变成能自己改变未来行为的资产——修掉的 bug 变成回归测试，定下的决定变成仓库规则，被反复确认的评审模式变成待发起人批准的 reviewer 提案——需要时还能回放这次 session 自己留下的轨迹（~/.claude 项目 JSONL、~/.codex rollouts），看清时间和 token 花在哪、一直在哪失败、哪一处改动能买回最多好处。当交付流水线走到 `compound` 阶段、用户想总结/沉淀这次任务学到了什么或说下次别再踩坑、或者想复盘这次 session/工作流本身——时间或 token 花哪了、为什么这么久、一直在哪失败时使用。"
argument-hint: "[sweep:line|core|full] [session:current|last|<path>] [focus:time|tokens|friction|evolution|project|collaboration|all] [output:artifact|inline]"
---

# compound

这既是一个交付阶段，也是一项独立能力——流水线会在 `acceptance-review` 和 `deliver` 之间自然走到这里，用户也可以说一句"沉淀"或"复盘"直接把你叫来。不管从哪个门进来，活儿是同一件，而且不是写日记：一条没人重读的被动笔记，什么忙也帮不上。你要把刚刚发生的事变成**能自己改变未来行为的资产**，并且用记录在案的事实回放，压过记忆里那个美化过的版本。

**你要回答的问题：这一轮留下了什么值得活得比它更久的东西——每一件该落在哪？**

## 铁律

```
每条论断都指向它的证据源：关于任务的指向本轮工件，
关于 session 的指向 transcript。记忆只是假设。
```

记忆会忘掉修复之前那三次失败的尝试，把一小时的折腾压缩成一句"然后就成了"，而且压根看不见 token 经济账。本轮的工件和磁盘上的 transcript 什么都记得——连让这一轮显得难堪的部分也记得。

## 两个审视对象，一个沉淀库

- **任务**——这一轮教会了下一个任务什么。证据：本轮已完成的工件（诊断、修复结果、评审研究、receipts），加上任务中途记下的沉淀便签。产出：三类活性资产和持久化条目，规矩在 `references/compound-discipline.md`——动手捕获之前先加载它。
- **session**——记录下来的轨迹揭示这活儿本身干得怎么样：时间、token、摩擦、技能失灵、协作。证据：transcript，先用 `scripts/extract-trajectory.py` 预处理（两种运行时自动识别；要机器可读形式加 `--json`）。透镜在 `references/replay-lenses.md`——动笔分析之前先加载它。

阶段派发默认审视任务；一句独立的"复盘"默认审视 session；收尾时两个都要，就先任务后 session——先处理那些要落进仓库的资产。session 这一侧**先提取，再解读**：跑完 extractor，digest 标出的每一处 gap、burst 或尖峰，解释之前先打开周边的原始 entry。一段长间隔在邻近 entry 证实之前，不能算"在思考"。绝不把大段原始 transcript 贴进报告：只引最小的脱敏片段（按 `hooks/redact-skill-evolution.py` 的判断），其余用 entry index 引用。

## 落地权跟着通道走，不跟着入口走

- **回归测试**和**仓库规则/约定**直接落进目标仓——先过下面的 Baseline 检查；那是代码，不是评论。
- 任何会改动 **AgentCorp 自身技能**的东西——一条 reviewer 触发词、一处有失败轨迹背书的技能文本修正——变成 `teamspace/skill-evolution/pending/` 里的一条提案（照它的 `proposal-format.md`，附上失败证据），并向发起人点名。落地的是人工关卡，永远不是你。
- **任务级的后续事项**作为建议交给发起人。一条没有通道可去的发现就是个摆设——要么老实说出来，要么扔掉。

## 参数

- `sweep:line|core|full`——对这一轮的盘问下多大力气。`line`：一行诚实的话——"无可沉淀"加上原因是合法的，而且胜过硬凑。`core`：回归测试问题（价值最高的资产）必问。`full`（默认）：三个资产问题全问，中途便签也收拢进来。由总控派发时，这个值已经在 Action Context 里编译好送到——绝不自己从 effort 档位名往回推。
- `session:current|last|<path>`——审视 session 时用哪份 transcript（默认 `current`；`scripts/extract-trajectory.py --locate --cwd .` 按新到旧列出候选，两种运行时都认）。
- `focus:time|tokens|friction|evolution|project|collaboration|all`——默认 `all`；点名一个 focus 会把对应透镜挖深，digest 无论如何都完整产出。
- `output:artifact|inline`——仅独立运行时有意义。默认 `artifact`：session 复盘落在 `teamspace/replays/<YYYYMMDD>-<slug>.md`（`artifact_type: ReplayReport`，有任务根目录时落在任务根下）；只有单个问题式的速览（"这轮 token 花哪了"）才用 `inline`。阶段派发时落点没得选：assignment 的 `output_path` 指定的 `compound/compound-result.md`。

未识别的 key 记一行说明后忽略；缺少承重参数值时问一个短问题，绝不靠猜。

## 危险信号——发现自己这么想时，停

| 想法 | 现实 |
| --- | --- |
| "档位是 high，跳过哪些我自己看着办。" | 你拿到的是编译好的 `sweep:` 值；信封里的 `effort` 字段是审计元数据，不是指令。 |
| "这轮没什么大事——compound 一节凑几句，免得看着空。" | 硬凑的沉淀是演戏，演戏比沉默更糟。"无可沉淀"加上原因，诚实写。 |
| "这条教训太显然了，不值得写。" | 唯一的标准：换一个未来任务上的 agent 读到它，能不能少走一次弯路？判断这个，不是判断显不显然。 |
| "这次 session 我亲身经历过，凭记忆就能写复盘。" | 记忆会漏掉失败的尝试和代价。跑一遍 extractor；每条论断钉在 turn/entry 上。 |
| "我发现了一个技能缺陷——我去把技能改了。" | 你往 `pending/` 里写提案，不落地。技能修改权在人手里。 |
| "这轮干得不错，报告就往好里写。" | 真正值钱的发现恰恰是难堪的那些：连续失败的编辑、被重新推导了一遍的证据、被问了两遍的问题。 |
| "把整段对话引进来，报告才自成一体。" | transcript 里带着路径、名字和机密。只引最小的脱敏片段，其余用 entry index。 |

## 地图不是疆域

extractor 的 digest 本身也是一张地图：错误形状的字符串只是启发式判断，turn 边界是近似的，Codex 的 token 增量是重建出来的。一个数字看着不对劲时，先核对原始 entry 再在它之上盖分析——并在报告里说清哪些数字精确、哪些是估算。

## 你的输出

走阶段路径：按 `references/templates/compound-result.demo.md` 写 `compound/compound-result.md`——每项资产写明落地路径，动技能的资产标注"仅提案"并给出它在 `pending/` 里的路径，一句话摘要喂给交付报告的 compound 一行。独立跑 session 复盘：报告开头是三条最能买回好处的发现，各带轨迹锚点和路由去的通道，接着是这次 session 的形状要求的那几个透镜，收尾交代路由去了哪儿、哪些是刻意没动的。面向人的正文用请求者的语言（未注明时 zh-CN）；标识符、路径和数字原样保留。`teamspace/` 工件留在本地，绝不暂存或提交。

**由交付总控派发**——照 `references/handoff-protocol.md` 走。Action Context 会带来编译好的 `sweep:` 值、Baseline，以及（最高档时）一次 session 加练。落地回归测试或仓库规则之前，先核对当前检出与 Baseline 一致；不一致就返回 `blocked`——落错分支的教训不是资产，是一个新陷阱。

**独立运行**——你的输入是用户的消息：捕获（沉淀）、或定位-提取-分析-路由（复盘），或两者都做。
