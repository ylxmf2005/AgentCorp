#!/usr/bin/env node

import { setTimeout as delay } from "node:timers/promises";

const DEFAULT_HOST = process.env.AGENTCORP_BROWSER_HOST || process.env.CHROME_COOKIE_JS_HOST || "127.0.0.1";
const DEFAULT_PORT = Number(process.env.AGENTCORP_BROWSER_PORT || process.env.CHROME_COOKIE_JS_PORT || 9222);

function parseArgs(argv) {
  const args = {
    host: DEFAULT_HOST,
    port: DEFAULT_PORT,
    timeoutMs: 30000,
    awaitPromise: true,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) throw new Error(`${arg} requires a value`);
      return argv[i];
    };

    if (arg === "--url") args.url = next();
    else if (arg === "--eval") args.expression = next();
    else if (arg === "--file") args.file = next();
    else if (arg === "--host") args.host = next();
    else if (arg === "--port") args.port = Number(next());
    else if (arg === "--timeout-ms") args.timeoutMs = Number(next());
    else if (arg === "--no-await") args.awaitPromise = false;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return args;
}

function usage() {
  return `Usage:
  node scripts/page-js.mjs --url <url> --eval '<js>'
  node scripts/page-js.mjs --url <url> --file ./script.js

Options:
  --host <host>          Browser debug host, default from AGENTCORP_BROWSER_HOST or 127.0.0.1
  --port <port>          Browser debug port, default from AGENTCORP_BROWSER_PORT or 9222
  --timeout-ms <ms>      Wait timeout, default 30000
  --no-await             Do not await Promise results from the expression
`;
}

async function readExpression(args) {
  if (args.expression && args.file) throw new Error("Use only one of --eval or --file");
  if (args.expression) return args.expression;
  if (args.file) {
    const fs = await import("node:fs/promises");
    return fs.readFile(args.file, "utf8");
  }
  throw new Error("Missing --eval or --file");
}

async function jsonFetch(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`${options?.method || "GET"} ${url} failed: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

async function findOrCreatePage(baseUrl, url) {
  const targets = await jsonFetch(`${baseUrl}/json/list`);
  const existing = targets.find((target) => target.type === "page" && sameUrl(target.url, url));
  if (existing?.webSocketDebuggerUrl) return existing;

  const created = await jsonFetch(`${baseUrl}/json/new?${encodeURIComponent(url)}`, { method: "PUT" });
  if (!created.webSocketDebuggerUrl) throw new Error("Browser did not return a page websocket debugger URL");
  return created;
}

function sameUrl(a, b) {
  try {
    return new URL(a).href === new URL(b).href;
  } catch {
    return a === b;
  }
}

function connectWebSocket(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let id = 0;
  const pending = new Map();
  const listeners = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(`${message.error.message}: ${message.error.data || ""}`));
      else resolve(message.result || {});
      return;
    }

    const handlers = listeners.get(message.method);
    if (handlers) handlers.forEach((handler) => handler(message.params || {}));
  });

  const opened = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  function send(method, params = {}) {
    id += 1;
    const requestId = id;
    socket.send(JSON.stringify({ id: requestId, method, params }));
    return new Promise((resolve, reject) => pending.set(requestId, { resolve, reject }));
  }

  function on(method, handler) {
    if (!listeners.has(method)) listeners.set(method, new Set());
    listeners.get(method).add(handler);
  }

  return { opened, send, on, close: () => socket.close() };
}

async function waitForLoad(cdp, timeoutMs) {
  let loaded = false;
  cdp.on("Page.loadEventFired", () => {
    loaded = true;
  });

  const deadline = Date.now() + timeoutMs;
  while (!loaded && Date.now() < deadline) {
    const readyState = await cdp.send("Runtime.evaluate", {
      expression: "document.readyState",
      returnByValue: true,
    });
    if (readyState.result?.value === "complete") return;
    await delay(250);
  }

  if (!loaded) throw new Error(`Timed out waiting for page load after ${timeoutMs}ms`);
}

function formatRemoteObject(remoteObject) {
  if (!remoteObject) return "";
  if (Object.hasOwn(remoteObject, "value")) {
    return typeof remoteObject.value === "string" ? remoteObject.value : JSON.stringify(remoteObject.value);
  }
  if (remoteObject.description) return remoteObject.description;
  return remoteObject.type || "";
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }
  if (!args.url) throw new Error("Missing --url");

  const expression = await readExpression(args);
  const baseUrl = `http://${args.host}:${args.port}`;
  const target = await findOrCreatePage(baseUrl, args.url);
  const cdp = connectWebSocket(target.webSocketDebuggerUrl);
  await cdp.opened;

  cdp.on("Runtime.consoleAPICalled", (params) => {
    const values = (params.args || []).map(formatRemoteObject).join(" ");
    console.log(`[console.${params.type}] ${values}`);
  });
  cdp.on("Runtime.exceptionThrown", (params) => {
    const details = params.exceptionDetails || {};
    console.error(`[page.exception] ${details.text || ""} ${details.exception?.description || ""}`.trim());
  });

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Page.bringToFront");

  const current = await cdp.send("Runtime.evaluate", {
    expression: "location.href",
    returnByValue: true,
  });
  if (!sameUrl(current.result?.value || "", args.url)) {
    await cdp.send("Page.navigate", { url: args.url });
  }
  await waitForLoad(cdp, args.timeoutMs);

  const result = await cdp.send("Runtime.evaluate", {
    expression,
    awaitPromise: args.awaitPromise,
    returnByValue: true,
    userGesture: true,
  });

  if (result.exceptionDetails) {
    const details = result.exceptionDetails;
    throw new Error(details.exception?.description || details.text || "Evaluation failed");
  }

  console.log(formatRemoteObject(result.result));
  cdp.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
