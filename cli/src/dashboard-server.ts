import fs from 'node:fs';
import http, { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { catalogSnapshot, resolveTaskReference, taskRegistryHealth } from './core/task-catalog.js';
import { inspectTaskHealth, resolveArtifactPath, taskPaths } from './core/task-runtime.js';
import { taskRegistration } from './core/task-registry.js';

const API_PREFIX = '/api/v1';
const MAX_ARTIFACT_PREVIEW_BYTES = 2 * 1024 * 1024;
const HOST = '127.0.0.1';
const execFileAsync = promisify(execFile);

type OpenTarget = 'workspace' | 'repository';
type OpenApplication = 'finder' | 'vscode' | 'terminal';
type RevealApplication = 'vscode' | 'finder';

export interface DashboardServerOptions {
  port?: number;
}

export interface DashboardServerHandle {
  server: http.Server;
  host: string;
  port: number;
  url: string;
}

function securityHeaders(response: ServerResponse): void {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  response.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; connect-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'",
  );
}

function sendJson(response: ServerResponse, status: number, value: unknown): void {
  const body = JSON.stringify(value, null, 2) + '\n';
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(body);
}

function sendText(response: ServerResponse, status: number, body: string, contentType = 'text/plain; charset=utf-8'): void {
  response.statusCode = status;
  response.setHeader('Content-Type', contentType);
  response.end(body);
}

function mimeType(file: string): string {
  switch (path.extname(file).toLowerCase()) {
    case '.html':
      return 'text/html; charset=utf-8';
    case '.js':
    case '.mjs':
      return 'text/javascript; charset=utf-8';
    case '.css':
      return 'text/css; charset=utf-8';
    case '.json':
      return 'application/json; charset=utf-8';
    case '.svg':
      return 'image/svg+xml';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    default:
      return 'application/octet-stream';
  }
}

function dashboardAssetsRoot(): string {
  return path.join(path.dirname(fileURLToPath(import.meta.url)), 'dashboard');
}

function serveDashboardAsset(url: URL, response: ServerResponse): boolean {
  const root = dashboardAssetsRoot();
  const index = path.join(root, 'index.html');
  if (!fs.existsSync(index)) return false;
  const requested = url.pathname === '/' ? 'index.html' : decodeURIComponent(url.pathname.slice(1));
  const candidate = path.resolve(root, requested);
  const relative = path.relative(root, candidate);
  const safe = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
  const file = safe && fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : index;
  response.statusCode = 200;
  response.setHeader('Content-Type', mimeType(file));
  // Dashboard assets keep stable filenames across local rebuilds. Caching them
  // would let a restarted server serve new HTML beside an hour-old JS bundle.
  response.setHeader('Cache-Control', 'no-store');
  response.end(fs.readFileSync(file));
  return true;
}

function isProbablyText(buffer: Buffer): boolean {
  const sample = buffer.subarray(0, Math.min(buffer.length, 8192));
  return !sample.includes(0);
}

function artifactContent(taskUid: string, artifactId: string): unknown {
  const state = resolveTaskReference(taskUid);
  const artifact = state.artifacts.find((item) => item.id === artifactId);
  if (!artifact) throw new Error(`unknown artifact: ${artifactId}`);
  const file = resolveArtifactPath(taskPaths(state.workspace), artifact.path);
  const stat = fs.statSync(file);
  if (!stat.isFile()) throw new Error(`artifact is not a regular file: ${artifact.path}`);
  if (stat.size > MAX_ARTIFACT_PREVIEW_BYTES) {
    return {
      artifact,
      preview: null,
      previewStatus: 'too-large',
      size: stat.size,
      maxPreviewBytes: MAX_ARTIFACT_PREVIEW_BYTES,
    };
  }
  const content = fs.readFileSync(file);
  if (!isProbablyText(content)) {
    return { artifact, preview: null, previewStatus: 'binary', size: stat.size };
  }
  return { artifact, preview: content.toString('utf8'), previewStatus: 'ready', size: stat.size };
}

function isSameOriginRequest(request: IncomingMessage): boolean {
  const host = request.headers.host?.toLowerCase();
  if (!host || !/^127\.0\.0\.1(?::\d+)?$/.test(host)) return false;
  const origin = request.headers.origin;
  if (!origin) return true;
  return origin === `http://${host}`;
}

function openArguments(application: OpenApplication, targetPath: string): string[] {
  if (application === 'finder') return [targetPath];
  if (application === 'vscode') return ['-a', 'Visual Studio Code', targetPath];
  return ['-a', 'Terminal', targetPath];
}

async function openTaskPath(taskUid: string, target: OpenTarget, application: OpenApplication): Promise<unknown> {
  if (process.platform !== 'darwin') throw new Error('opening local applications is currently supported on macOS only');
  const state = resolveTaskReference(taskUid);
  const targetPath = target === 'workspace' ? state.workspace : state.repository;
  if (!targetPath) throw new Error(`task has no ${target} path`);
  const stat = fs.statSync(targetPath);
  if (!stat.isDirectory()) throw new Error(`${target} path is not a directory`);
  await execFileAsync('/usr/bin/open', openArguments(application, targetPath), { timeout: 5000 });
  return { taskUid, target, application, path: targetPath };
}

// Resolve a task-relative path to an absolute file, refusing anything that
// escapes the task's own subtree. References come from the task's own state, but
// this endpoint still hands a path to `open`, so we constrain it to the same
// containment rule the static asset server uses: resolved path must stay inside
// a known root (repository preferred, workspace as the fallback root).
function resolveWithinTask(state: { workspace: string; repository: string | null }, relative: string): string {
  const roots = [state.repository, state.workspace].filter((root): root is string => Boolean(root));
  for (const root of roots) {
    const candidate = path.resolve(root, relative);
    const rel = path.relative(root, candidate);
    if (rel && !rel.startsWith('..') && !path.isAbsolute(rel) && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  throw new Error(`no readable file for reference: ${relative}`);
}

async function revealTaskFile(
  taskUid: string,
  relative: string,
  application: RevealApplication,
  line: number | null,
): Promise<unknown> {
  if (process.platform !== 'darwin') throw new Error('opening local applications is currently supported on macOS only');
  const state = resolveTaskReference(taskUid);
  const file = resolveWithinTask(state, relative);
  const args =
    application === 'vscode'
      ? [`vscode://file${file}${line ? `:${line}` : ''}`]
      : ['-R', file];
  await execFileAsync('/usr/bin/open', args, { timeout: 5000 });
  return { taskUid, application, path: file, line };
}

async function handleApi(request: IncomingMessage, response: ServerResponse, url: URL): Promise<void> {
  const segments = url.pathname.slice(API_PREFIX.length).split('/').filter(Boolean).map(decodeURIComponent);
  if (segments.length === 1 && segments[0] === 'meta') {
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'method_not_allowed' });
      return;
    }
    sendJson(response, 200, {
      apiVersion: 1,
      readOnly: true,
      localActions: { openPath: process.platform === 'darwin', reveal: process.platform === 'darwin' },
      maxArtifactPreviewBytes: MAX_ARTIFACT_PREVIEW_BYTES,
    });
    return;
  }
  if (segments.length === 1 && segments[0] === 'tasks') {
    if (request.method !== 'GET') {
      sendJson(response, 405, { error: 'method_not_allowed' });
      return;
    }
    sendJson(response, 200, catalogSnapshot());
    return;
  }
  if (segments[0] !== 'tasks' || !segments[1]) {
    sendJson(response, 404, { error: 'not_found' });
    return;
  }

  const taskUid = segments[1];
  const registration = taskRegistration(taskUid);
  if (!registration) {
    sendJson(response, 404, { error: 'task_not_registered', taskUid });
    return;
  }
  if (segments.length === 3 && segments[2] === 'open') {
    if (request.method !== 'POST') {
      sendJson(response, 405, { error: 'method_not_allowed' });
      return;
    }
    if (!isSameOriginRequest(request)) {
      sendJson(response, 403, { error: 'origin_not_allowed' });
      return;
    }
    const target = url.searchParams.get('target');
    const application = url.searchParams.get('application');
    if (target !== 'workspace' && target !== 'repository') {
      sendJson(response, 400, { error: 'invalid_target' });
      return;
    }
    if (application !== 'finder' && application !== 'vscode' && application !== 'terminal') {
      sendJson(response, 400, { error: 'invalid_application' });
      return;
    }
    sendJson(response, 200, await openTaskPath(taskUid, target, application));
    return;
  }
  if (segments.length === 3 && segments[2] === 'reveal') {
    if (request.method !== 'POST') {
      sendJson(response, 405, { error: 'method_not_allowed' });
      return;
    }
    if (!isSameOriginRequest(request)) {
      sendJson(response, 403, { error: 'origin_not_allowed' });
      return;
    }
    const filePath = url.searchParams.get('path');
    const application = url.searchParams.get('application');
    const lineParam = url.searchParams.get('line');
    if (!filePath) {
      sendJson(response, 400, { error: 'invalid_path' });
      return;
    }
    if (application !== 'vscode' && application !== 'finder') {
      sendJson(response, 400, { error: 'invalid_application' });
      return;
    }
    const line = lineParam && /^\d+$/.test(lineParam) ? Number(lineParam) : null;
    sendJson(response, 200, await revealTaskFile(taskUid, filePath, application, line));
    return;
  }
  if (request.method !== 'GET') {
    sendJson(response, 405, { error: 'method_not_allowed' });
    return;
  }
  if (segments.length === 2) {
    const state = resolveTaskReference(taskUid);
    sendJson(response, 200, { registration, state });
    return;
  }
  if (segments.length === 3 && segments[2] === 'health') {
    const state = resolveTaskReference(taskUid);
    sendJson(response, 200, {
      taskUid,
      findings: [...inspectTaskHealth(state.workspace), ...taskRegistryHealth(state.workspace)],
    });
    return;
  }
  if (segments.length === 5 && segments[2] === 'artifacts' && segments[4] === 'content') {
    sendJson(response, 200, artifactContent(taskUid, segments[3]));
    return;
  }
  sendJson(response, 404, { error: 'not_found' });
}

async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
  securityHeaders(response);
  const url = new URL(request.url ?? '/', `http://${HOST}`);
  try {
    if (url.pathname.startsWith(API_PREFIX)) {
      await handleApi(request, response, url);
      return;
    }
    if (serveDashboardAsset(url, response)) return;
    sendText(
      response,
      200,
      `Longrein Dashboard backend is running.\n\nAPI: ${API_PREFIX}\nThe frontend bundle has not been built yet.\n`,
    );
  } catch (error) {
    sendJson(response, 500, { error: 'request_failed', message: error instanceof Error ? error.message : String(error) });
  }
}

export async function startDashboardServer(options: DashboardServerOptions = {}): Promise<DashboardServerHandle> {
  const server = http.createServer((request, response) => void handleRequest(request, response));
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port ?? 0, HOST, () => {
      server.off('error', reject);
      resolve();
    });
  });
  const address = server.address();
  if (!address || typeof address === 'string') {
    server.close();
    throw new Error('dashboard server did not expose a TCP port');
  }
  const url = `http://${HOST}:${address.port}/`;
  return { server, host: HOST, port: address.port, url };
}
