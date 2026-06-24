---
name: explain
description: "当 AgentCorp 需要把 bug、测试进度、交付状态、评审发现、实现细节、计划或技术取舍解释给没有读过代码或产物的 sponsor/operator 时使用。用户表示看不懂、要求零上下文解释、要求通俗解释，或需要把 AgentCorp 输出翻译成清晰中文时使用。"
---

# Explain

这是 AgentCorp 的通用沟通能力，不是交付 phase，也不是带独立 gate 的角色。任何 AgentCorp 角色在需要让 sponsor 理解当前输出时都可以加载它，默认 sponsor 没看过代码、issue、终端输出或阶段产物。

目标是在不牺牲技术准确性的前提下，让解释容易跟上。适用于 bug 解释、测试进度、评审发现、交付报告、实现 walkthrough、选项解释和状态汇报。

## 输出模式

把是否落库当成显式选择：

- `output_mode: inline` —— 只在对话里回答。
- `output_mode: artifact` —— 写入任务产物，并在对话里返回一个简短路径。
- `output_mode: auto` —— 由你判断。未指定时默认使用这个模式。

调用示例：

```text
/agentcorp:explain output_mode=inline explain this test failure for a sponsor
/agentcorp:explain output_mode=artifact explain review/code-review.md item by item
Use $explain with output_mode=artifact to explain verification/verification-report.md.
```

小问题、短状态、单个概念适合 `inline`。当解释包含很多独立点、多条 finding、多条测试结果、多步实现 walkthrough，或 sponsor 很可能需要反复打开、逐项标注、对比或决策时，使用 `artifact`。用户说“落库”“写成文档”“放到产物里”“方便看”“分开写”时，直接使用 `artifact`。

使用 `artifact` 时，写到当前任务根目录：

```text
explain/<topic-slug>/
├── 00-index.md
└── <number>-<short-english-slug>.md
```

如果只有一份较长解释，写成 `explain/<topic-slug>.md`，不必建目录。若任务同时有 Workspace 和 Location，按 AgentCorp 产物同步规则保持两边相同相对路径。这些文件是协作产物，不是源码改动，不要提交。

多项解释时，一项一文件，类似 `review-researcher`：一条 finding、一条测试结果、一个设计选择或一个实现点各自成文。`00-index.md` 列出每项的一句话摘要和链接，让 sponsor 不必在聊天里翻一大坨文本。

落库解释使用这个 frontmatter：

```yaml
---
artifact_type: ExplanationSet
author_agent: explain
status: completed
source_artifacts:
  - <被解释的产物或文件>
---
```

如果是单文件解释，使用 `artifact_type: Explanation`。

## 默认结构

除非用户指定格式，按这个顺序解释：

1. **一句话结论**：先说最重要的结论。
2. **背景补齐**：说明系统、功能、文件、测试或产物是做什么的。
3. **发生了什么**：用普通语言描述 bug、测试结果、实现或当前状态。
4. **为什么重要**：说明影响用户、线上行为、开发流程、信心，还是只影响某个测试片段。
5. **当前状态**：区分已确认、已修复、未验证、被阻塞和仍不确定的部分。
6. **术语小抄**：只解释本次必须知道的技术词。

问题很小时可以合并成自然段，不要硬塞标题。

## 规则

- 默认读者没看过代码、diff、日志、issue、artifact 或前面的调查。
- 先讲结果，不从调查过程开始。
- 技术术语第一次出现时就翻译。
- 日志、堆栈、diff、测试输出先讲含义，再按需引用原文。
- 把因果讲清楚：因为 X，所以 Y 出问题。
- 区分事实、推测和未知。使用“已确认”“大概率”“还没验证”等措辞。
- 不用“很简单”“显然”“只是”“明显”这类让人焦虑或带评判感的词。
- 多用具体名词：按钮、接口、字段、文件、测试、阶段、产物、命令。
- 类比只在能缩短理解路径时使用，且不能扭曲机制。
- 落库解释要让每个文件都能独立阅读：补齐局部背景、当前点、证据和状态，不要求读者先看完整聊天。

## 解释 Bug

解释 bug 或错误时：

- 说明用户或系统原本想做什么。
- 说明实际哪里偏了。
- 用普通语言说明最可能原因。
- 说明当前是已复现、已修、部分修复，还是仍在查。
- 引用支撑结论的证据。

## 解释测试进度

解释测试或验证时：

- 说明测的是哪个用户旅程、代码分支或风险。
- 说明结果：通过、失败、阻塞、跳过或没跑。
- 如果失败，说明失败指向哪个行为问题。
- 区分“这一片测试过了”和“整个系统没风险”。
- 说明剩余风险和下一步验证。

## 解释技术实现

解释功能或技术设计时：

- 先从用户可见或运行期目的讲起。
- 说清主要组成部分和各自职责。
- 按顺序讲数据或请求怎么流动。
- 点出不能删的关键约束或判断。
- 只讲和当前决策/信心有关的取舍。

## AgentCorp 集成

- **Delivery Orchestrator**：用于 sponsor-facing 状态、gate 摘要和最终交付说明。
- **Test Leader / testers**：用于解释测试结果到底证明了什么，以及还有什么没测。
- **Review roles**：用于解释 finding，让 sponsor 不读代码也能判断是否该改。
- **Implementation Engineer / Review Fixer**：用于解释为什么选择某条代码路径或修复方式。
- **Change Detailed Walker**：当 walkthrough 面向不熟悉仓库的读者时，使用此表达风格。
