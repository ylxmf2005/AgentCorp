# Fresh Start Handoff

在以下情况使用此能力：当前对话或 working tree 可能会拖累后续工作 —— 漫长的多轮调试/重构 session、同一个根本问题反复尝试仍修不好、需求分散在很多轮对话中或者中途变更、早期架构假设被推翻、working tree 里到处是跨模块的探索性未提交改动，或者 sponsor 说"重来 / 新 session / 上下文一团糟"。目标不是总结所有内容，而是判断当前线程是否已成为负担，并在征得 sponsor 同意后生成一份干净的 handoff prompt，让新 session（或新的 subagent 分配）避免继承污染。

核心动作：将散乱的上下文整理成一份自包含的单一真相源 prompt，同时把探索过程、失败尝试和陈旧假设隔离出来并清晰标记，而不是继续将其写成叙述性文字。

## 触发时机（评分指南）

在自然的 phase 边界快速检查：大规模重构前、反复调试失败后、commit 前、需求变更后、对话开始变得冗长陈旧时。

- +3：sponsor 明确或暗示地说"重来"、"新 session"、"handoff"或"上下文一团糟"。
- +3：同一个根本问题连续两次或以上都修不好。
- +3：发现早期架构假设或诊断有误。
- +2：需求是在很多轮对话后才逐渐明确的，或者在实现开始后才变更。
- +2：下一步取决于记住多个早期约束或例外情况。
- +2：working tree 中存在跨模块的探索性未提交改动。
- +2：工作正从探索/调试转向干净的实现 phase。
- +1：对话中包含矛盾的结论、冗长的复盘，或"别再干 X 了"之类的纠正。
- +1：验证结果混杂、过时或不清晰。

≥3 分：暂停并征求意见；≥5 分：强烈建议重启。不要为了一步搞定的小改动、上下文仍然干净时、或 sponsor 刚拒绝过且风险没有实质上升时去打断。

## 征询意见（这是一个 human gate）

如果 sponsor 明确要求 handoff prompt，直接写就好；否则只问一次，给出一个具体理由，提供三个选项：A）只要 prompt；B）git 隔离方案 + prompt；C）留在当前 session 继续。如果选 C，继续原任务，除非风险升级，否则不再询问。绝不要替 sponsor 决定重启；未经 sponsor 明确同意，切勿丢弃、reset、stash、commit 或 branch 他们的工作。

## 生成 Handoff Prompt

动笔之前，先把本轮有价值的经验沉淀到 `teamspace/learnings/`（参见 `references/learnings.md`）—— 重启应当只丢弃被污染的对话，而不是连同经验一起扔掉。

1. **盘点当前真相。** 以源码、测试、`git status`、diff、日志和 sponsor 的明确指令为准，而非对话中的记忆；如果能查 repo，先查后写，不能则如实说明未知项。
2. **分类整理信息。** 目标 / 完成标准 / 已验证事实（附证据）/ 相关文件和入口 / 已接受的约束和决策 / 失败尝试（作为经验总结和禁区，而非继续下去的起点）/ 可疑或未验证的假设 / working-tree 状态。
3. **明确 working-tree 立场。** 新工作从哪开始，四选一：干净的基线 branch（探索性工作已归档为只读参考）；当前脏的 tree（未提交改动视为候选工作，非已验证事实）；checkpoint branch；仅作为历史参考的归档。
4. **撰写 prompt 并直接交给 sponsor。** 使用下面的模板，删除不适用的章节，但保留"单一真相源"和"防污染"的措辞；把它放在 fenced markdown block 里，让 sponsor 能直接复制，不要埋在冗长的复盘下面。

```markdown
You are starting from scratch and rely on no prior conversation. Treat this prompt and the current repo state as the single source of truth; where the two conflict, trust the repo and the tests, and report the discrepancy before changing code.

## 目标
## 完成标准（可观察的成功标准，必须通过的所有测试/构建/人工检查）
## Working-Tree 立场（四选一，并注明对应的 branch/归档位置）
## 相关文件和入口（路径 + 相关原因）
## 命令与验证
## 已验证事实（VERIFIED：事实 — 证据：文件/测试/日志/sponsor 指令）
## 已接受的约束与决策（ACCEPTED：…）
## 失败尝试，切勿盲目重复（FAILED：方法 — 证据 — 教训）
## 可疑/未验证假设（UNVERIFIED：假设 — 验证方法）
## 建议路径（先确认事实，再做最小改动，然后运行验证；若验证失败，根据证据而非旧假设来修正）
## 护栏（执行破坏性 git 操作、大规模重写、依赖升级、迁移、文件删除前先请示；除非能解释清楚失败原因已不复存在，否则不要复用失败代码；上下文缺失时，提出针对性问题，而非猜测）
```

## 常见错误

- 不要写"聊天里发生了什么"的流水账。
- 不要把失败代码作为起点继续往下传，除非它已被归档并明确标注。
- 不要把未经验证的东西写成"我们知道 X"。
- 不要把旧的 workaround 和新计划混在同一条指令里。
- 不要让新 session 在不知情的情况下继承一个脏的 working tree —— 要么解释清楚，要么建议隔离。
- 不要列出你碰过的每个文件，只列可能对下一次尝试相关的；working-tree 状态单独说明。
