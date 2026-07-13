# 在 Codex 上运行 AgentCorp

[← 返回 README](../README_CN.md) · [English](codex-setup.md)

## 安装

```
codex plugin marketplace add ylxmf2005/AgentCorp
```

启动 Codex，从 `/plugins` 菜单启用 **AgentCorp**，重启即可。

如果只需要安装某个技能而非整个插件：

```
use skill-installer to install the skill at repo ylxmf2005/AgentCorp path agentcorp/delivery-orchestrator
```

## 生命周期 hook

Codex 没有 `SessionEnd` 事件，因此插件的生命周期 hook 需要另行挂载：将 `hooks/codex-hooks.json` 复制或合并到 `<repo>/.codex/hooks.json`（或 `~/.codex/hooks.json`），并将 `AGENTCORP_PLUGIN_ROOT` 指向本仓库的检出目录。

脚本本身不区分运行时，两端通用。Codex 环境下，skill-evolution capture 借助 `Stop` hook 逐轮记录；下次会话启动时，闲置超过 30 分钟的会话会被自动送入分析器。
