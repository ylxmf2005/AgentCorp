# CLI

Longrein CLI 面向安装、维护、Dashboard 启动和人工 Runtime 恢复。Agent 对 Task Runtime 的正常读写只使用 MCP，不学习或回退到 `longrein task ...`。

## 安装与状态

```text
longrein                         显示 Skills、常驻块和 MCP 状态
longrein install [skill…]        安装 Skills，同步常驻块并注册 MCP
longrein update                  刷新过期副本、常驻块和 MCP
longrein uninstall --all         移除 Longrein 管理的 Skills、常驻块与 MCP
longrein status                  显示安装状态
longrein list                    以纯文本列出可用 Skills
longrein doctor [--fix]          检查安装残留、过期副本、断链与损坏标记
```

安装和维护命令支持 `--codex` 或 `--claude`。`install` 的默认模式是复制；开发 checkout 使用 `--link`。

## MCP 管理

```text
longrein mcp                     启动 stdio server，供宿主调用
longrein mcp install [host]      注册 MCP
longrein mcp status [host]       检查 MCP 配置
longrein mcp uninstall [host]    移除 Longrein 管理的 MCP
```

`host` 可以是 `all`、`codex` 或 `claude`，默认 `all`。

## Dashboard

```text
longrein dashboard               启动本地前端与 API，默认打开浏览器
  --port <port>                  使用指定 loopback 端口；0 表示自动选择
  --no-open                      不自动打开浏览器
```

Dashboard 进程运行期间终端会保持占用，按 Ctrl-C 停止。

## 人工 Task 维护

现有 `longrein task` 子命令暂时保留给人类诊断、恢复 Registry 或检查底层状态。它们不是 Agent 协议，未来可以在不改变 Skill 与 MCP 工作流的前提下移除。

```text
longrein task create             创建 Runtime Task
longrein task list               列出 Registry Task；--json 输出结构化目录
longrein task register           注册或修复一个 Task 的全局入口
longrein task unregister         移除入口但不删除 Task workspace
longrein task registry           检查 Registry 和已注册 Task
longrein task show               查看完整当前状态
longrein task context            建立或修订 Task Context
longrein task work               人工登记工作单元边界
longrein task finding            人工登记确认发现
longrein task artifact           人工登记产物及内容 hash
longrein task evidence           人工更新 Completion Evidence
longrein task doctor             检查投影、Registry、产物和 Git 漂移
longrein task complete           通过完成门禁后关闭 Task
longrein task abandon            不宣称完成地关闭 Task
longrein task supersede          用另一项已注册 Task 取代当前 Task
```

使用具体命令前运行 `longrein <command> --help`。不要手工编辑 Runtime 拥有的 `.runtime/state.json`、`.runtime/summary.json`、`task.md` 或 `timeline.md`。
