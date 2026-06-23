---
name: authenticated-browser-session
description: "Use when a task needs a persistent authenticated browser session as a reusable AgentCorp behavior: set up a separate Chrome/Chromium profile with DevTools Protocol, ask the user to log in once, then run page-context JavaScript/fetch so cookies, SSO, CSRF, and same-origin behavior are real. Use for debugging, API probes, E2E or regression verification, internal web apps, authenticated smoke tests, and any task that needs real logged-in browser state without reading cookies."
---

# Authenticated Browser Session

Use this behavior when a task needs real logged-in browser state, but the agent should not read cookie stores or ask the user to paste tokens. It is a general AgentCorp action surface, not a tester role: E2E, API contract, regression, debugging, incident triage, and exploratory verification can all use it.

The core rule: operate inside a real page and let the browser attach credentials naturally. Never read cookie databases, password stores, local storage dumps, or session files.

## What This Proves

- Page-context `fetch` proves the behavior of same-origin authenticated requests from that browser session.
- DOM inspection or screenshots prove what the loaded page rendered.
- Console/network observations can support debugging when browser DevTools semantics matter.

State the limits every time they matter: API-only page-context checks do not prove UI layout, full user interaction, or external notifications unless those are separately observed.

## Setup

Use a dedicated profile that is separate from the user's daily browser. The profile persists across tasks so the user usually logs in once per machine/account.

```bash
./scripts/browser-session.sh 'https://example.com'
```

If running from another directory, call the script by absolute path from this skill folder:

```bash
/path/to/authenticated-browser-session/scripts/browser-session.sh 'https://example.com'
```

If the site shows a login page, explain plainly:

> I opened a separate browser profile for agent work. Please log in there; I will not read your cookies or passwords. After you confirm the page is logged in, I can run page-local checks that use the browser session naturally.

Then continue only after the user confirms login.

Configuration knobs:

```bash
AGENTCORP_BROWSER_PROFILE="$HOME/.agentcorp/browser-session-profile"
AGENTCORP_BROWSER_HOST="127.0.0.1"
AGENTCORP_BROWSER_PORT="9222"
AGENTCORP_BROWSER_BIN="/Applications/Google Chrome.app"
```

Use a different port if one is occupied:

```bash
AGENTCORP_BROWSER_PORT=9333 ./scripts/browser-session.sh 'https://example.com'
```

The scripts also accept legacy `CHROME_COOKIE_JS_PROFILE/HOST/PORT` variables as fallback, only for compatibility with older local setups.

## Run Page JavaScript

Use `page-js.mjs` to run JavaScript in the authenticated page:

```bash
node ./scripts/page-js.mjs --url 'https://example.com/app' --eval 'document.title'
```

For larger checks, write a task-local script under the task workspace or `/tmp` and run it:

```bash
node ./scripts/page-js.mjs --url 'https://example.com/app' --file /tmp/auth-check.js
```

Use async IIFEs for request probes:

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

## Safety Protocol

Prefer a read-only probe first:

```bash
node ./scripts/page-js.mjs --url 'https://example.com/app' --eval 'location.href'
```

Before any page JS that writes data, triggers workflow, sends notifications, starts jobs, or mutates remote state, announce:

- target environment and URL
- exact endpoint or action
- exact payload or human-readable diff
- expected result and evidence
- restore/cleanup plan, or why cleanup is unnecessary

Do not proceed with a write unless the user has clearly authorized that kind of action in the current task.

Never print secrets. Redact URL auth parameters, tokens, temporary credentials, cookies, and sensitive response fields before saving evidence.

## Evidence Shape

For verification/debugging artifacts, record enough for replay:

- page URL, title, environment, account by reference
- command or script path used
- request method/path/body, with secrets redacted
- response status/content-type/body summary
- timestamps and trace/request IDs when available
- what the browser session cannot observe directly
- manual observation points, such as email/chat/push notifications

If the page-context request succeeds but the user-visible outcome is outside the browser, pause and ask for the missing observation instead of inferring success.

## Troubleshooting

Check whether CDP is available:

```bash
curl -sS --max-time 3 http://127.0.0.1:9222/json/version
curl -sS --max-time 3 http://127.0.0.1:9222/json/list
```

Common cases:

- `/json/version` fails: start the dedicated profile with `browser-session.sh`.
- Port is listening but `/json/version` is not Chrome CDP: choose another port.
- Login redirects or SSO appears: ask the user to complete login in the dedicated profile.
- Hash-routed SPA: pass the full URL including `#/route`.
- Browser warnings appear: capture them, but judge success from the requested behavior unless warnings block it.

## Role Integration

- Test Planner: include this as an execution surface when a live system needs authenticated browser state. The plan must name the page URL, account/environment, allowed writes, restore plan, and evidence requirements.
- E2E Tester: use it when the TestPlan explicitly allows page-context API/JS as part of the user journey or fallback. State what UI behavior it does and does not prove.
- API Contract Tester: use it for same-origin authenticated API checks when ordinary HTTP clients cannot reproduce browser auth or CSRF behavior.
- Regression Tester and Debugging roles: use it to reproduce logged-in behavior, compare before/after, inspect console output, and capture request/response evidence.
