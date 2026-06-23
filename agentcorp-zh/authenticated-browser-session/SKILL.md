---
name: authenticated-browser-session
description: "把持久化的已登录浏览器会话作为 AgentCorp 的通用行为能力：使用独立 Chrome/Chromium profile 和 DevTools Protocol，请用户登录一次，然后在页面上下文执行 JavaScript/fetch，让 cookie、SSO、CSRF 和同源行为都保持真实。用于 debugging、API probe、E2E 或 regression 验证、内部 Web 应用、authenticated smoke test，以及任何需要真实登录态但不能读取 cookie 的任务。"
---

# Authenticated Browser Session

当任务需要真实登录态浏览器，但 agent 不应该读取 cookie store、session 文件或要求用户粘贴 token 时，使用这个行为。它是 AgentCorp 的通用 action surface，不是 tester 角色：E2E、API contract、regression、debugging、incident triage 和 exploratory verification 都可以使用。

核心规则：在真实页面内部操作，让浏览器自然携带凭证。不要读取 cookie database、password store、local storage dump 或 session file。

## 这能证明什么

- Page-context `fetch` 证明同一个浏览器会话里的同源 authenticated request 行为。
- DOM inspection 或 screenshot 证明页面实际渲染状态。
- Console/network observation 可以在需要 DevTools 语义时辅助 debug。

每次相关时都要说明边界：纯 API 的 page-context check 不能证明 UI layout、完整用户交互或外部通知，除非这些也被单独观察到了。

## Setup

使用与用户日常浏览器分开的专用 profile。profile 会跨任务持久化，所以用户通常每台机器/每个账号只需要登录一次。

```bash
./scripts/browser-session.sh 'https://example.com'
```

如果不在本 skill 目录执行，用绝对路径调用脚本：

```bash
/path/to/authenticated-browser-session/scripts/browser-session.sh 'https://example.com'
```

如果页面出现登录态，引导用户：

> 我打开了一个单独的 agent 专用浏览器 profile。请在这里登录；我不会读取你的 cookie 或密码。你确认页面已登录后，我就可以在页面本地运行检查，让浏览器自然带上登录态。

用户确认登录后再继续。

配置项：

```bash
AGENTCORP_BROWSER_PROFILE="$HOME/.agentcorp/browser-session-profile"
AGENTCORP_BROWSER_HOST="127.0.0.1"
AGENTCORP_BROWSER_PORT="9222"
AGENTCORP_BROWSER_BIN="/Applications/Google Chrome.app"
```

端口被占用时换一个端口：

```bash
AGENTCORP_BROWSER_PORT=9333 ./scripts/browser-session.sh 'https://example.com'
```

脚本也兼容旧的 `CHROME_COOKIE_JS_PROFILE/HOST/PORT` 环境变量，只用于过渡旧本地配置。

## 运行页面 JavaScript

用 `page-js.mjs` 在已登录页面中执行 JavaScript：

```bash
node ./scripts/page-js.mjs --url 'https://example.com/app' --eval 'document.title'
```

较大的检查脚本写到任务工作区或 `/tmp`：

```bash
node ./scripts/page-js.mjs --url 'https://example.com/app' --file /tmp/auth-check.js
```

请求 probe 使用 async IIFE：

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

## 安全协议

先做只读 probe：

```bash
node ./scripts/page-js.mjs --url 'https://example.com/app' --eval 'location.href'
```

任何会写数据、触发流程、发送通知、启动任务或改变远端状态的 page JS 之前，先说明：

- 目标环境和 URL
- 具体 endpoint 或 action
- 具体 payload 或人可读 diff
- 预期结果和证据
- 恢复/清理方案，或为什么不需要清理

除非用户在当前任务里已经明确授权这类写操作，否则不要继续。

不要打印 secrets。保存证据前 redact URL auth 参数、token、临时凭证、cookie 和敏感响应字段。

## 证据形态

用于 verification/debugging 的 artifact 要足以复现：

- 页面 URL、title、environment、账号引用
- 使用的 command 或 script path
- request method/path/body，secrets 要 redact
- response status/content-type/body 摘要
- timestamp 和 trace/request ID
- browser session 不能直接观察什么
- 人工观察点，例如邮件/聊天/push 通知

如果 page-context request 成功，但用户可见结果在浏览器外部，暂停并要求补齐观察，不要自行推断成功。

## Troubleshooting

检查 CDP 是否可用：

```bash
curl -sS --max-time 3 http://127.0.0.1:9222/json/version
curl -sS --max-time 3 http://127.0.0.1:9222/json/list
```

常见情况：

- `/json/version` 失败：用 `browser-session.sh` 启动专用 profile。
- 端口有监听但 `/json/version` 不是 Chrome CDP：换端口。
- 出现登录跳转或 SSO：请用户在专用 profile 完成登录。
- Hash-routed SPA：传入包含 `#/route` 的完整 URL。
- 页面出现 browser warning：记录它，但除非 warning 阻断目标行为，否则以被测试行为本身判断。

## 角色集成

- Test Planner：当 live system 需要 authenticated browser state 时，把它写成 execution surface。plan 必须写明页面 URL、账号/环境、允许写操作、恢复方案和证据要求。
- E2E Tester：当 TestPlan 明确允许 page-context API/JS 作为用户旅程或 fallback 的一部分时使用。说明它能证明和不能证明的 UI 行为。
- API Contract Tester：当普通 HTTP client 无法复现浏览器 auth 或 CSRF 行为时，用它做同源 authenticated API 检查。
- Regression Tester 和 Debugging 角色：用它复现登录态行为、比较前后差异、检查 console 输出，并捕获 request/response 证据。
