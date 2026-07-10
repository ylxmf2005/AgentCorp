---
name: authenticated-browser-session
description: "当任务需要真实的已登录浏览器状态时使用：起一个专用的 Chrome/Chromium 配置文件、走 DevTools Protocol，让用户登录一次，之后在页面上下文里跑 JavaScript/fetch，让 cookie、SSO、CSRF 和同源行为都是真的。适用于调试、API 探测、E2E 或回归验证、内部 Web 应用、登录态冒烟测试——凡是不这么做就会诱使 Agent 去要 token 或读 cookie 的检查。"
---

# Authenticated Browser Session

这是一块可复用的 AgentCorp 操作面，不是某个测试员角色：任何角色——E2E、API 契约、回归、调试、事故排查、探索性验证——只要任务需要真实的已登录浏览器状态就加载它，而所属的计划或任务要指明页面 URL、账号/环境、允许的写操作和证据要求。

你存在，是为了堵住一种失败：Agent 撞上登录墙，要么伸手去拿凭据本身，要么悄悄降级成一个未登录的探测、还当成真结果端上来。这两条路都以用户看不见的方式毁掉信任。第三条路就是这块技能：在一个专用浏览器配置文件的真实页面里操作，让浏览器自然地带上凭据，于是证据是真的，而凭据从头到尾不经你的手。

## 铁律

```
凭据留在浏览器里——用这个会话，绝不从里面往外抠。
```

这条禁令两个方向都堵。绝不读磁盘上的凭据文件：cookie 数据库、密码库、local storage 转储、会话文件。也绝不借活着的会话把凭据导出去：不许 `document.cookie` 转储、不许 CDP 的 cookie/storage 接口（`Network.getCookies` 及其同类），不许把会话 token、cookie 或认证头从页面上下文的响应里抠出来、拿去 curl 或别的客户端复用。要是某个检查看起来非得拿到原始凭据不可，那这个检查本身就错了——把它改造成在页面里跑。

## 这能证明什么

- 页面上下文里的 `fetch`，证明的是这个会话下的同源已登录请求行为。
- DOM 检查或截图，证明的是加载出来的页面渲染成了什么样。
- 控制台/网络的观察，在 DevTools 语义要紧时给调试撑腰。

限制要紧时就说清楚：只测 API 的页面上下文检查，证明不了 UI 布局、完整的用户交互、或外部通知，除非这些另有观察。当页面上下文的请求成功了、但用户真正看到的结果落在浏览器之外（邮件、聊天、推送)时，停下来去要那份缺的观察，别一口咬定成功。

## 起会话

用一个专用配置文件，跟用户日常的浏览器分开。这个配置文件跨任务保留，所以用户一般每台机器/每个账号登录一次就行。

```bash
./scripts/browser-session.sh 'https://example.com'
```

在别的目录里调这些脚本（`browser-session.sh`，以及下面的 `page-js.mjs`）时，用本技能文件夹的绝对路径来调。

对于已经在监听的 CDP 端点，脚本只有在核实过"拥有这个浏览器进程的确是用专用配置文件启动的"（`--user-data-dir=$HOME/.agentcorp/browser-session-profile`）之后，才会接管它；要是端口被另一个浏览器占着——包括用户自己带 `--remote-debugging-port` 起的日常 Chrome——它会拒绝，并让你用 `AGENTCORP_BROWSER_PORT` 换个新端口。手动探 CDP 时你也守同一条规矩：配置文件没核实过的端点，绝不往上跑页面 JS（见故障排查）。

如果站点弹出登录页，就实话实说：

> 我另开了一个专供 Agent 干活的浏览器配置文件。请在那里登录；我不会读你的 cookie 或密码。等你确认页面登录好了，我就能跑那些天然借用浏览器会话的页面内检查。

只有用户确认登录之后才继续。

可调的参数（换端口：`AGENTCORP_BROWSER_PORT=9333 ./scripts/browser-session.sh ...`；旧的 `CHROME_COOKIE_JS_PROFILE/HOST/PORT` 变量仍作为老本地环境的兜底）：

```bash
AGENTCORP_BROWSER_PROFILE="$HOME/.agentcorp/browser-session-profile"
AGENTCORP_BROWSER_HOST="127.0.0.1"
AGENTCORP_BROWSER_PORT="9222"
AGENTCORP_BROWSER_BIN="/Applications/Google Chrome.app"
```

## 跑页面 JavaScript

```bash
node ./scripts/page-js.mjs --url 'https://example.com/app' --eval 'document.title'
node ./scripts/page-js.mjs --url 'https://example.com/app' --file /tmp/auth-check.js   # 较大的检查：任务本地脚本
```

请求探测用异步 IIFE：

```js
(async () => {
  const response = await fetch('/api/status', { credentials: 'include' });
  const text = await response.text();
  let body = text;
  try { body = JSON.parse(text); } catch {}
  return JSON.stringify({
    url: response.url,
    status: response.status,
    contentType: response.headers.get('content-type'),
    body,
  });
})();
```

## 安全流程

先跑只读探测（`--eval 'location.href'`)。任何会写数据、触发工作流、发通知、启动任务或改动远程状态的页面 JS 之前，先声明：目标环境和 URL；确切的端点或动作；确切的载荷、或人能看懂的 diff；预期结果和证据；恢复/清理方案（或为什么不需要）。除非用户在当前任务里已经明确授权这类动作，否则别动手写。

绝不打印秘密。存证据前，把 URL 里的认证参数、token、临时凭据、cookie 和敏感响应字段都脱敏。

## 证据长什么样

记够能复现的东西：页面 URL、标题、环境、账号（以引用方式）；命令或脚本路径；请求的方法/路径/主体（秘密已脱敏)；响应的状态/content-type/主体摘要；时间戳、以及有的话的 trace/请求 ID；会话直接观察不到的部分，外加人工观察点（邮件/聊天/推送）。

把证据端出去之前，自查一遍：这个会话是专用配置文件——是核实过的、不是假定的；存下来的任何东西里都没有凭据材料；每次写操作都声明并授权过；证据能证明到哪一步的限制，就贴在对应说法旁边。

## 危险信号——发现自己冒出这些念头，就停下

| 念头 | 实情 |
| --- | --- |
| "这端口上已经起了个 CDP 端点——接过去能省一次启动。" | 那可能是用户的日常 Chrome。先核实进程跑的是专用配置文件，或者换个新端口。 |
| "`document.cookie` 又不是 cookie 数据库，规则管不着它。" | 禁令禁的是"往外抠"，不只是磁盘上的文件。借会话读凭据是同一种违规，只是步骤少几步。 |
| "把 token 复制进 curl 跑一次，比走 page-js 快。" | token 一离开浏览器，承诺就破了——而且结果也不再证明浏览器会话下的行为。 |
| "fetch 返回了 200，功能就是好的。" | 200 只证明请求这条路通了。UI 渲染、通知、下游任务，各自都得有自己的观察。 |
| "就往测试端点发个小 POST；声明纯属多余。" | 每一次远程变更都要走"先声明、再授权"。打错环境的小写入，正是事故的起点。 |
| "这会儿用户肯定登录完了吧。" | 只有用户明确确认了才继续。半登录的会话产出的证据，错得悄无声息。 |

## 故障排查

对着你实际启动时用的主机/端口查 CDP 通不通：

```bash
curl -sS --max-time 3 "http://${AGENTCORP_BROWSER_HOST:-127.0.0.1}:${AGENTCORP_BROWSER_PORT:-9222}/json/version"
curl -sS --max-time 3 "http://${AGENTCORP_BROWSER_HOST:-127.0.0.1}:${AGENTCORP_BROWSER_PORT:-9222}/json/list"
```

- `/json/version` 失败：用 `browser-session.sh` 起专用配置文件。
- CDP 已经通了：跑任何页面 JS 前，先确认端点属于专用配置文件——浏览器进程的命令行里必须有 `--user-data-dir=$HOME/.agentcorp/browser-session-profile`（`ps ax | grep -- "--remote-debugging-port=9222"`，把端口换成你自己的）。要是端口被另一个浏览器占着，换端口，别接管。
- 端口在监听、但不是 Chrome 的 CDP：换个端口。
- 冒出登录重定向或 SSO：请用户在专用配置文件里把登录走完。
- 哈希路由的 SPA：把带 `#/route` 的完整 URL 传进去。
- 浏览器告警：记下来，但除非它挡住了请求行为，否则成不成看请求行为本身。
