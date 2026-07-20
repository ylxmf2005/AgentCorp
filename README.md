<div align="center">

# Longrein

**给 Sol、Fable 这类强模型更长的缰绳，把方向、边界与裁决留在人手里。**

新一代模型已经能够长程调查、实现和验证。Longrein 不用固定流程遥控它们，
而是提供 10 个按需组合的工程 Skills 与 2 个常驻指令块，让模型自主选择路径，
让人在证据改变方向、范围或后果时作出判断。

[安装](#安装) · [开始一项任务](#开始一项任务) · [10-个-skills](#10-个-skills) · [CLI](#cli)

</div>

## 安装

需要 Node.js 18 或更高版本：

```bash
npm install -g longrein
longrein install -y
```

`longrein install -y` 会把全部 Skills 安装到 Claude Code 与 Codex，并同步 `soul`、`job`
两个常驻块。运行 `longrein` 可以检查每项内容是否已经安装：

```text
longrein v0.1.0

  skill        Claude Code       Codex
  design       ✓ v0.1.0          ✓ v0.1.0
  ...

  always-on blocks
  Claude Code  job ✓  soul ✓
  Codex        job ✓  soul ✓
```

只安装到一个宿主时使用 `--claude` 或 `--codex`。从源码开发 Longrein 时使用
`longrein install --link -y`，修改会直接生效。

## 开始一项任务

`task` 只在你明确调用时启动。它先让 `shape` 接触真实项目，再建立能够跨 Session 恢复的
Task Context；不会因为任务复杂、其他 Skill 需要产物，或仓库里碰巧存在 `task.md` 就自行启动。

| Claude Code | Codex |
| --- | --- |
| `/task 修复结算接口偶发重复扣款，先查清原因再改` | `$task 修复结算接口偶发重复扣款，先查清原因再改` |

第一次形成可信任务边界时，你会看到 Active Task 的绝对路径，以及本次承诺的 Goal、Scope、
Non-goals 和 Completion Evidence。任务状态保存在唯一的 `task.md` 中：

```text
Active Task: /absolute/path/to/studio/tasks/20260720-fix-duplicate-charge/task.md

Goal                 最终要实现什么结果
Scope                这次具体负责什么
Non-goals            这次明确不做什么
Completion Evidence  看到哪些证据才算完成
Must Preserve        哪些现有行为不能破坏
```

后续 Session 用 task id 或 `task.md` 的绝对路径恢复；没有明确路径时，`task` 会列出候选让你选择，
不会按目录、修改时间或相似名称猜测。

## 它改变什么

| 常见失效方式 | Longrein 的做法 |
| --- | --- |
| 根据用户描述直接猜系统现状 | `shape` 先接触代码、运行结果和真实约束，再形成方向 |
| 任务承诺散落在对话里 | 显式 `$task` 把边界、refs、完成证据和当前状态放在唯一 `task.md` |
| 实现者用自己的结论证明完成 | `review` 独立冷读，`test` 亲自执行并留下可重放证据 |
| 新证据出现后仍沿旧路线补丁 | `rewind` 回到最后可信状态，保留仍然可靠的资产 |
| 会话结束，代价没有改变下一轮 | `evolution` 只把可重放经验放进最窄、正确的长期作用域 |
| 人只在最后接收结果 | `walkthrough` 把背景、证据和取舍讲到人能够继续判断 |

Skills 按当前工作真正缺少的能力组合。简单请求保持简单；只有真实未知、风险和证据要求才增加
调查、设计、独立评审或完整测试。

## 10 个 Skills

| Skill | 什么时候使用 |
| --- | --- |
| [`task`](skills/task/SKILL.md) | 显式开始、恢复或查看一项持久任务 |
| [`shape`](skills/shape/SKILL.md) | 方向、任务边界或承重前提还不可靠 |
| [`design`](skills/design/SKILL.md) | 需要根因、架构、契约、影响分析或实现路线 |
| [`dev`](skills/dev/SKILL.md) | 方向明确后实现功能、修复缺陷或执行重构 |
| [`review`](skills/review/SKILL.md) | 独立检查需求、设计、计划、代码或交付物 |
| [`test`](skills/test/SKILL.md) | 制定 TestPlan、执行真实测试并交付 Test Report |
| [`walkthrough`](skills/walkthrough/SKILL.md) | 让没有读过对象的人真正理解并能够继续判断 |
| [`rewind`](skills/rewind/SKILL.md) | 错误前提已经污染当前时间线，需要恢复可信状态 |
| [`prompt`](skills/prompt/SKILL.md) | 仅在显式调用时，从真实任务中提炼更好的提示词 |
| [`evolution`](skills/evolution/SKILL.md) | 非平凡工作收尾时判断哪些经验值得改变未来行为 |

Claude Code 使用 `/name` 显式调用，Codex 使用 `$name`。除 `task`、`prompt` 等明确要求手动调用的
Skill 外，宿主也可以根据各 Skill 的 `description` 在适用时自动选择。

## 常驻块

Longrein 还维护两段随每次会话生效的底层约束：

| 块 | 作用 | Claude Code | Codex |
| --- | --- | --- | --- |
| [`soul`](global/soul.md) | 面对现实、证据、范围和复杂度的工程态度 | `~/.claude/CLAUDE.md` | `~/.codex/AGENTS.md` |
| [`job`](global/job.md) | Agent 一贯承担的工作与协作习惯 | `~/.claude/CLAUDE.md` | `~/.codex/AGENTS.md` |

任务事实不进入常驻块。具体任务的承诺和状态只属于它自己的 `task.md`；设计、实现、评审与测试
细节只进入对应产物，避免多份摘要互相漂移。

## CLI

```text
longrein                    显示每个 Skill 和常驻块的安装状态
longrein install [skill…]   安装；默认复制，--link 链接当前 checkout
longrein update             刷新过期副本、清理断链、重新同步常驻块
longrein uninstall --all    移除 Longrein 管理的全部内容
longrein list               以纯文本列出 Skills，可用于脚本
longrein doctor [--fix]     检查旧安装残留、过期副本、断链和损坏标记
```

所有管理命令支持 `--claude` / `--codex`。Longrein 只修改自己创建的符号链接、带
`.longrein.json` 标记的副本，以及 `LONGREIN BLOCK` 标记之间的内容；不会改写标记外的用户配置，
也不会接管其他来源的同名 Skill，除非明确传入 `--force`。

## 它不是什么

Longrein 不是 coding model、Agent runtime 或固定阶段的交付编排器。它不会让所有任务走同一套
流程，也不会把当前任务自动注入全局配置。它提供的是一组边界清楚、按需组合的工程能力，以及
让这些能力在 Claude Code 与 Codex 中保持一致的安装工具。

## 从源码使用

```bash
git clone https://github.com/ylxmf2005/LongRein.git
cd LongRein
npm install
npm run typecheck
npm run build
npm link
longrein install --link -y
```

修改 CLI 后运行：

```bash
npm run typecheck && npm run build && longrein doctor
```

Skill 的行为变化不能只靠文字看起来更合理：使用真实任务做前后对照，检查触发、正确性、
用户介入、意外动作、成本和长上下文副作用。相应方法在
[`evolution`](skills/evolution/SKILL.md) 中维护。

问题与建议请提交到 [GitHub Issues](https://github.com/ylxmf2005/LongRein/issues)。

## License

MIT License
