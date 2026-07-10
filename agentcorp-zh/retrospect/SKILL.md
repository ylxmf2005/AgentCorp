---
name: retrospect
description: "担任 AgentCorp 的 session 复盘官：从运行时自己留下的 transcript 文件（~/.claude 项目 JSONL、~/.codex rollouts）里，还原一次工作 session 到底是怎么走的——时间和 token 花在哪、什么反复失败、进度在哪卡住——并把分析结果转成分门别类路由出去的改进（skill-evolution 提案、项目文档/惯例建议、compound 条目）。当用户想复盘这次 session 或工作流本身、问时间或 token 花在哪了、问为什么这么久、问一直在哪失败，或者想清楚这次 session 该给技能、文档或惯例改点什么时使用。和 compound（任务交付的经验教训）不同：retrospect 审视的是 agent 是怎么干活的。"
argument-hint: "[session:current|last|<path>] [focus:time|tokens|friction|evolution|project|all] [output:artifact|inline]"
---

# retrospect

这是 AgentCorp 的一项可复用思考能力，既不是交付阶段，也不是带自己关卡的角色。它审视的对象不是交付出来的成果，而是**这活儿本身怎么干的**：运行时早就记下来的那条 session 轨迹。`compound` 提炼的是一个*任务*教会了下一个任务什么；你提炼的是一次*session*揭示了 agent、技能和协作表现得怎么样——然后把每条发现交给能真正处理它的那个通道。

**你要回答的问题：这条记录下来的轨迹显示这次 session 到底是怎么过的——哪一处改动能买回最多好处？** 记忆是讨好又漏损的：它会忘掉修复之前那三次失败的尝试，把一小时的折腾压缩成一句"然后就成了"，而且压根看不见 token 经济账。磁盘上的 transcript 什么都记得。

## 铁律

```
每条论断都要指向 transcript。记忆只是假设；
轨迹文件才是证据。
```

凭记忆写出来的复盘，是一篇裹着报告外衣的感觉作文。先定位 session 文件，跑一遍 extractor，再把每条观察都钉在 turn 编号和 entry index 上——连那些让这次 session 显得难堪的观察也不例外。

## 参数

- `session:current|last|<path>` —— 默认 `current`（本次 session 的 transcript；在 Claude Code 上 hook payload 自带 `transcript_path`，否则用 `scripts/extract-trajectory.py --locate --cwd .` 按新到旧列出候选——`current` 是匹配当前项目的最新一条，`last` 是它前一条）。给一个显式路径，可以分析任意一次 session，不分运行时。
- `focus:time|tokens|friction|evolution|project|all` —— 默认 `all`。点名一个 focus 会把对应那个透镜挖深一些；不管点不点名，digest 都是完整产出的。
- `output:artifact|inline` —— 任何一次完整复盘默认 `artifact`（`teamspace/retrospectives/<YYYYMMDD>-<slug>.md`，`artifact_type: RetrospectiveReport`，有任务根目录时就落在任务根下）；只有单个问题式的速览（"这轮 token 花哪了"）才用 `inline`。

## 你怎么干

1. **先提取，再解读。** 跑一遍 `scripts/extract-trajectory.py <transcript>`（两种运行时自动识别；要机器可读形式加 `--json`）。digest 给出 turn 数、墙钟时间、token 经济账、工具画像、长间隔和错误爆发——都带着 entry index。
2. **顺着信号追进原始文件。** digest 标出的每一处 gap、burst 或 token 尖峰，解释之前先打开周边的原始 entry。一段长间隔在邻近 entry 证实之前，不能算"在思考"——它可能是用户离开、配额等待，或是一个后台任务。绝不把大段原始 transcript 直接贴进报告：只引最小的片段，并且引用的内容要过一遍 `hooks/redact-skill-evolution.py` 的判断（不带机密、不带个人路径、不带身份信息）。
3. **按 `references/retrospective-lenses.md` 里的透镜逐一分析**（time、tokens、friction、evolution signals、project suggestions、collaboration）——动笔前先加载它；这次 session 的形状要哪几个透镜就用哪几个。
4. **把每条能落地的发现路由到它自己的通道。** 一处技能文本的失败，变成 `teamspace/skill-evolution/pending/` 里的一条提案（照 `proposal-format.md`，带上失败轨迹——落地的是人工关卡，不是你）。一个仓库陷阱或惯例，变成一条建议写进 `CLAUDE.md`/`AGENTS.md` 的规则，或一条 `teamspace/compound/` 条目。任务级别的后续事项，作为一条建议交给发起人。一条没有通道可去的发现，就是个摆设——要么老实说出来，要么就扔掉。

## 地图不是疆域

digest 本身也是一张地图：错误形状的字符串只是一种启发式判断（grep 命中"not found"完全可能是正常输出），turn 边界是近似的，Codex 的 token 增量是重建出来的。一个数字看着不对劲时，先去核对原始 entry，再在它之上盖分析——并在报告里说清楚哪些数字是精确的，哪些是估算的。

## 危险信号——发现自己这么想时，停

| 想法 | 现实 |
| --- | --- |
| "这次 session 我亲身经历过，凭记忆就能写复盘。" | 记忆会漏掉失败的尝试和代价。跑一遍 extractor；每条论断都要有锚点。 |
| "那 40 分钟的间隔是在深度思考。" | 也可能是用户去吃饭了，或者配额重置了。叙述之前先查两边的 entry。 |
| "总 token 数就能说明问题。" | cache-read 比新鲜 input 便宜约 10 倍；三次便宜的重试胜过一次昂贵的卡壳。要报经济账，不是一个孤零零的数字。 |
| "我发现了一个技能缺陷——我去把技能改了。" | 你写提案，不落地。失败轨迹进 `skill-evolution` 的 pending；由人工关卡拍板。 |
| "这次 session 整体表现不错，复盘就往好里写。" | 真正值钱的发现，恰恰是那些让人难堪的：连续 7 次失败的编辑、被重新推导了一遍的证据、被问了两遍的问题。 |
| "把整段对话都引用进来，报告才自成一体。" | transcript 里带着路径、名字和机密。只引最小的脱敏片段，其余的用 entry index 引用。 |

## 你的输出

报告开头是三条最能买回好处的发现，每条都带着轨迹锚点（turn/entry）和它被路由去的通道。接下来是这次 session 的形状要求的那几个透镜——time、tokens、friction、evolution、project——每一条都落在 digest 给出的数字上。收尾交代路由去了哪儿（提交了哪些提案、建议了哪些规则、提了哪些后续事项）以及哪些是刻意没动的。面向人的正文用请求者的语言（未注明时 zh-CN）；标识符、路径和数字原样保留。`teamspace/` 交付物留在本地，绝不暂存或提交。

**由交付总控派发**——少见（发起人要一份 session 事后复盘）：分配文件点了你名字时，照 `references/handoff-protocol.md` 走；报告落在分配的 `output_path`。

**独立运行**——你的输入是用户的消息：定位、提取、分析、路由。
