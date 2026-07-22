# 安装与首次使用

## 前提

- Node.js 18 或更高版本；
- 至少安装了 Codex CLI 或 Claude Code 之一；
- `longrein` 可执行文件位于 `PATH`。

## 安装

```bash
npm install -g longrein
longrein install -y
```

默认安装到 Codex 与 Claude Code。只安装一个宿主：

```bash
longrein install -y --codex
longrein install -y --claude
```

安装会完成三件事：

1. 把全部 Longrein Skills 安装到宿主的 Skills 目录；
2. 把 `job` 与 `soul` 管理块同步到宿主常驻指令文件；
3. 注册由 `longrein mcp` 启动的 stdio MCP。

Longrein 只修改自己创建的符号链接、带 `.longrein.json` 标记的副本、`LONGREIN BLOCK` 标记之间的内容，以及能够确认由 Longrein 管理的 MCP 条目。发现同名但来源不同的 Skill 或 MCP 时会停止，不会静默接管。

安装后完全退出并重新打开 Codex 或 Claude Code，使新 Skill 和 MCP 在新会话中加载。

## 验证

```bash
longrein status
longrein mcp status
```

`longrein status` 应显示已安装的 Skills、两个常驻块，以及所选宿主的 MCP 为 `managed`。如果 MCP 名称被其他配置占用，会显示 `foreign`；Longrein 不会覆盖它。

也可以从宿主侧检查：

```bash
codex mcp get longrein --json
claude mcp get longrein
```

## 开始第一项持久任务

| Claude Code | Codex |
| --- | --- |
| `/task <你的请求>` | `$task <你的请求>` |

Task Skill 会先接触真实项目并建立可信 Task Context，然后通过 MCP 创建或更新 Runtime Task。成功后会给出 Active Task workspace 的绝对路径。

不需要跨 Session 保存状态时，不必启动 Task。Longrein 的其他 Skills 仍可以按需使用。

## 打开 Dashboard

```bash
longrein dashboard
```

命令会启动同一个进程内的本地 API 与前端，并默认打开浏览器。若不希望自动打开，或需要固定端口：

```bash
longrein dashboard --no-open --port 4318
```

Dashboard 只显示已经注册到当前 Longrein Home 的 Task。它不会扫描磁盘猜测哪些目录是 Task。

## 更新与卸载

更新已安装副本、常驻块和 MCP：

```bash
npm install -g longrein@latest
longrein update
```

移除 Longrein 管理的全部 Skills、常驻块与 MCP：

```bash
longrein uninstall --all
```

这不会删除已有 Task workspace 或其中的专业产物。

## 从源码使用

```bash
npm install
npm run typecheck
npm test
npm run build
npm link
longrein install --link -y
```

`--link` 适合开发：宿主中的 Skill 指向当前 checkout，修改会直接生效。发布或稳定使用时采用默认复制模式。
