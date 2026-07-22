import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '../..');
const cli = path.join(root, 'cli/dist/index.js');
const dashboardDist = path.join(root, 'cli/dist/dashboard');

function waitForDashboard(child) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';
    const timeout = setTimeout(() => reject(new Error(`dashboard start timed out\n${stdout}\n${stderr}`)), 10_000);
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => {
      stdout += chunk;
      const match = stdout.match(/URL: (http:\/\/127\.0\.0\.1:\d+\/)/);
      if (match) {
        clearTimeout(timeout);
        resolve(match[1]);
      }
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk;
    });
    child.once('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`dashboard exited before becoming ready (${code})\n${stdout}\n${stderr}`));
    });
  });
}

// The dashboard frontend is produced by the same `npm run build` as the CLI.
// These checks pin the build integration: the bundle must exist, be served as
// static assets, and stay referenceable from the single index.html entry.
test('dashboard frontend is built into cli/dist/dashboard and served by the backend', async (t) => {
  const indexHtml = path.join(dashboardDist, 'index.html');
  const bundle = path.join(dashboardDist, 'main.js');
  const styles = path.join(dashboardDist, 'styles.css');
  assert.ok(fs.existsSync(indexHtml), 'index.html should be built');
  assert.ok(fs.existsSync(bundle), 'main.js should be built');
  assert.ok(fs.existsSync(styles), 'styles.css should be built');

  // The entry HTML must reference exactly the local, self-contained assets the
  // CSP allows (no external/CDN references).
  const html = fs.readFileSync(indexHtml, 'utf8');
  assert.match(html, /\.\/main\.js/);
  assert.match(html, /\.\/styles\.css/);
  const externalRef = html.replace(/href="data:[^"]*"/g, '').replace(/src="data:[^"]*"/g, '');
  assert.ok(!/https?:\/\//.test(externalRef), 'index.html must not reference remote URLs');

  const longreinHome = fs.mkdtempSync(path.join(os.tmpdir(), 'longrein-dash-ui-test-'));
  t.after(() => fs.rmSync(longreinHome, { recursive: true, force: true }));
  const env = { ...process.env, LONGREIN_HOME: longreinHome };
  const child = spawn(process.execPath, [cli, 'dashboard', '--no-open', '--port', '0'], {
    cwd: root,
    env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(async () => {
    if (child.exitCode !== null) return;
    child.kill('SIGTERM');
    await once(child, 'exit');
  });
  const dashboardUrl = await waitForDashboard(child);
  const origin = new URL(dashboardUrl).origin;

  const servedIndex = await (await fetch(`${origin}/`)).text();
  assert.match(servedIndex, /<div id="root">/);

  const jsResponse = await fetch(`${origin}/main.js`);
  assert.equal(jsResponse.status, 200);
  assert.match(jsResponse.headers.get('content-type') ?? '', /javascript/);
  assert.equal(jsResponse.headers.get('cache-control'), 'no-store');
  const js = await jsResponse.text();
  assert.ok(js.length > 10_000, 'bundled dashboard JS should be non-trivial');

  const cssResponse = await fetch(`${origin}/styles.css`);
  assert.equal(cssResponse.status, 200);
  assert.match(cssResponse.headers.get('content-type') ?? '', /text\/css/);
  assert.equal(cssResponse.headers.get('cache-control'), 'no-store');

  // Unknown dashboard paths fall back to index.html (SPA behaviour) so deep
  // links still load the shell.
  const deepLink = await fetch(`${origin}/task/anything`);
  assert.equal(deepLink.status, 200);
  assert.match(await deepLink.text(), /<div id="root">/);

  // Building the dashboard must never clobber the CLI entrypoint.
  assert.ok(fs.existsSync(path.join(root, 'cli/dist/index.js')), 'cli/dist/index.js must survive the dashboard build');
});

// `npm run build` must remain a no-op-safe, idempotent producer of the CLI.
test('cli entrypoint still runs after building the dashboard bundle', () => {
  const result = spawnSync(process.execPath, [cli, '--version'], { cwd: root, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
});
