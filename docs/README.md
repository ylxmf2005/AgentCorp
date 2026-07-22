# Longrein 文档

Longrein 的文档按读者要完成的判断拆分。README 负责产品入口；这里负责安装、运行和稳定协议；Skill 自己的 `SKILL.md` 与 `references/` 负责 Agent 行为。

## 从哪里开始

| 你的问题 | 文档 |
| --- | --- |
| 如何安装并确认 Codex、Claude Code 已接入 | [安装与首次使用](getting-started.md) |
| MCP 为什么是 Agent 的唯一 Runtime 接口 | [MCP](mcp.md) |
| Task 状态、Registry、投影和完成门禁如何工作 | [Task Runtime](task-runtime.md) |
| Dashboard 前端能看什么、如何启动、有哪些本机动作 | [Task Dashboard](dashboard.md) |
| 人工维护时有哪些命令 | [CLI](cli.md) |
| 如何为 Codex 配置更高效的本地检索工具 | [Codex 推荐配置](codex-recommended-setup.md) |

## 权威来源

| 信息 | 唯一来源 |
| --- | --- |
| 产品定位与公开入口 | [`README.md`](../README.md) |
| CLI、MCP、Dashboard 的真实行为 | `cli/src/` 与相应测试 |
| Task 机器状态 | `<task-workspace>/.runtime/state.json`，只由 Runtime 写入 |
| Agent 的 Skill 行为 | `skills/<name>/SKILL.md` |
| 常驻规则 | `global/job.md` 与 `global/soul.md` |

专题文档解释稳定契约，不复制完整源码接口或 Skill 流程。发生冲突时，以真实实现和对应权威来源为准，并修订本文档。
