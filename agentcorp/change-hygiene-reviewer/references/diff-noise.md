# Diff Noise 审查

只在 assignment 或 diff 信号指向空白、格式、折行、注释、顺手重构、formatter blast radius 时加载。目标是找出没有行为价值、不是工具强制、却放大 MR/PR 阅读成本的 hunk。

## 流程

1. 先跑机械扫描。
   - 从本 skill 目录运行 `python3 scripts/diff_noise_scanner.py --json`。
   - staged diff 为空但要审工作区时，加 `--worktree`；审提交范围时用 `--diff <base>...<head>`；审外部 diff 文件时用 `--file <diff-file>`。
   - 把输出里的 `verdict`、`counts_by_category` 和关键 findings 当作证据；脚本是证据收集器，不是最终裁判。
2. 建立改动面。
   - 优先用 assignment 给出的 base/head；没有就用 staged diff；再没有才看工作区 diff。
   - 读取 `git diff --stat`、`git diff --name-status`、关键文件的 `git diff -- <path>`。
   - 对怀疑是空白噪音的 hunk，用 `git diff -w -- <path>` 或 `git diff --ignore-space-change -- <path>` 对比。
3. 先分类，再判断。
   - `semantic`：实现任务所需的行为、契约、数据、错误处理、测试更新。
   - `mechanical-required`：项目 formatter/linter 必须产生的最小格式变化。
   - `noise`：不改变行为，也不是工具强制，还会增加阅读成本。
   - `mixed`：同一 hunk 混合语义和噪音，建议拆 hunk 或回退噪音行。
4. 对每个 noise/mixed hunk 做三问。
   - 本次需求、Story Spec、review finding 或测试失败要求它吗？
   - 项目 formatter/linter 明确要求它吗？
   - 如果删掉这几行，行为、验证和 lint 还会成立吗？

## 重点抓的问题

- **Whitespace-only churn**：忽略空白后 hunk 消失，且不是 formatter/linter 必需。
- **Over-wrapping**：函数调用、字面量、链式调用、列表或断言被拆得过窄；原写法未超过项目可接受行宽。
- **Under-justified reflow**：docstring、注释、字符串、错误消息、日志文本仅被重排或换行。
- **Drive-by formatting**：邻近函数、未触及分支、无关 import、已有测试被顺手格式化。
- **Drive-by refactor**：把单一调用方逻辑抽函数、合并/拆分函数、改名、重排代码块，但任务不需要。
- **Comment-only noise**：改注释措辞、加解释性注释、删注释，但没有纠正过时或错误信息。
- **Generated or formatter blast radius**：一次 formatter 改了大量无关文件，建议缩小 formatter 范围或拆成独立 MR/commit。

## 行宽与折行

不要把“更窄”当成“更好”。在 Python/后端代码里，只要满足项目 lint/formatter 和周围文件风格，保留紧凑、可读、低 diff 的写法优先。

报告 over-wrapping 前至少确认一个条件成立：同一表达式只是被模型拆成多行；周围代码普遍允许更宽的行；当前拆法显著制造噪音；`git diff -w` 或手工 hunk 对比显示主要变化来自折行/缩进。

不要报告 formatter 必须拆开的长行、明显提高可读性的复杂表达式、或为了避免超长字符串/SQL/URL/类型签名而做的必要折行。

## 输出要求

只报告有可执行修法的噪音。每条 finding 写清文件/行号或 hunk、扫描或 diff 命令证据、为什么增加 review 成本，以及建议是删掉、回退、拆 commit，还是保留但解释。
