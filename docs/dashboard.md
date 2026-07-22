# Task Dashboard

Task Dashboard 是 Longrein Task Runtime 的本地只读界面。前端静态资源与 API 由同一个 Node 进程提供，不需要单独启动或配置后端。

## 启动

```bash
longrein dashboard
```

默认行为：

- 只绑定 `127.0.0.1`；
- 自动选择一个可用端口；
- 打印 Dashboard URL 与 API 地址；
- 自动打开系统默认浏览器；
- 当前终端进程结束时服务停止。

固定端口或禁止自动打开：

```bash
longrein dashboard --no-open --port 4318
```

Dashboard 不需要 access token，也没有签名 URL。它被设计为本机 loopback 工具，不应通过端口转发、反向代理或改绑公网地址暴露给其他机器。

## 前端能力

### Task 总览

- 聚合当前 Longrein Home 中全部已注册 Task；
- 显示状态、Goal 摘要、Now / Next、完成证据和产物计数；
- 按当前出现的状态筛选；
- 按 Goal、Now、Next、task id、workspace 和错误文本搜索；
- 显示 Registry 级健康问题；
- 每 5 秒自动刷新。

### Task 详情

- 原始请求、Goal、Scope、Non-goals 与 Must Preserve；
- Completion Evidence 的状态、proof 与证据引用；
- 当前和已登记产物；
- active findings 与完整 Timeline；
- Runtime、Registry、产物和 Git 漂移的健康检查；
- 当前工作单元、refs、revision、workspace、repository 与 Task UID。

### 产物阅读

已登记的文本产物可以在详情页展开或最大化阅读。内置渲染支持标题、段落、列表、表格、引用、代码块、行内格式、受限链接和 Mermaid fenced block。

预览边界：

- 文本文件最大 2 MiB；
- 二进制文件只显示元数据；
- 超过上限的文件只显示大小与限制；
- Artifact 内容始终从登记路径读取，不接受任意文件路径。

### 本机打开动作

macOS 上可以把 Task workspace 或 repository 打开到 Finder、VS Code 或终端，也可以把已登记的引用文件在 VS Code 中打开或在 Finder 中显示。

这些动作只接受已注册 Task 的路径，并要求目标仍位于其 workspace 或 repository 内。打开能力目前只在 macOS 实现；Windows 与 Linux 仍可使用全部只读页面，尝试本机打开时会收到不支持错误。

界面支持中英文切换、浅色与深色主题；偏好保存在浏览器 local storage 中。

## 只读边界

Dashboard 不创建 Task，不修订 Context，不登记发现、产物或完成证据，也不关闭 Task。所有语义状态变化仍由 Agent 通过 Longrein MCP 完成。

API 中的 POST 只用于本机打开 Finder、VS Code 或终端，不修改 Task 数据。

## API v1

| Method | Route | 用途 |
| --- | --- | --- |
| `GET` | `/api/v1/meta` | API 版本、只读标记、本机动作能力与预览上限 |
| `GET` | `/api/v1/tasks` | Registry 与 Task 摘要目录 |
| `GET` | `/api/v1/tasks/:taskUid` | 注册信息与完整 Runtime state |
| `GET` | `/api/v1/tasks/:taskUid/health` | Runtime 与 Registry 健康问题 |
| `GET` | `/api/v1/tasks/:taskUid/artifacts/:artifactId/content` | 已登记产物预览 |
| `POST` | `/api/v1/tasks/:taskUid/open` | 打开 workspace 或 repository |
| `POST` | `/api/v1/tasks/:taskUid/reveal` | 打开或显示 Task 内的引用文件 |

`open` 查询参数：

```text
target=workspace|repository
application=finder|vscode|terminal
```

`reveal` 查询参数：

```text
path=<task-relative-path>
application=vscode|finder
line=<optional-positive-line>
```

## 本地安全模型

- HTTP server 固定绑定 `127.0.0.1`；
- API 与静态资源发送 `no-store`，避免重建后新旧 bundle 混用；
- 页面使用同源 CSP，不加载远程脚本或样式；
- 本机动作验证 Host 与 Origin，拒绝跨站请求和 DNS rebinding 形式的 Host；
- 文件 reveal 解析后必须仍在已注册 Task 的 repository 或 workspace 内；
- 普通 Markdown 由 React 节点渲染；Mermaid 使用本地 bundle 的 `securityLevel: strict` 生成 SVG，不加载 CDN 资源。

这个模型保护本地、单用户使用场景，不等于远程多用户 Dashboard 的认证与授权体系。

## 常见问题

### 页面打不开

Dashboard 依赖启动它的终端进程。重新运行 `longrein dashboard`，使用命令打印的新 URL。

### 没有 Task

Dashboard 只读 Registry，不扫描磁盘。先通过 `$task` 或 `/task` 创建并注册 Task；已有 workspace 需要由人工维护命令重新注册时，参考 [CLI](cli.md)。

### Task 显示 unavailable

Registry 入口存在，但 Task 的 Runtime 状态可能缺失、损坏或路径已经移动。查看详情页健康问题，或使用人工 Runtime doctor 检查；不要直接编辑 Runtime 文件。
