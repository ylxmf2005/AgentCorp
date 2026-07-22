import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '../..');
const cli = path.join(root, 'cli/dist/index.js');

function run(args, env) {
  const result = spawnSync(process.execPath, [cli, ...args], { cwd: root, encoding: 'utf8', env });
  assert.equal(result.status, 0, `command failed: ${args.join(' ')}\n${result.stdout}\n${result.stderr}`);
  return result;
}

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

test('serves the loopback Dashboard API, local path actions and registered artifact previews', async (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'longrein-dashboard-test-'));
  t.after(() => fs.rmSync(temp, { recursive: true, force: true }));
  const longreinHome = path.join(temp, 'home');
  const taskDir = path.join(temp, 'task');
  const env = { ...process.env, LONGREIN_HOME: longreinHome };

  run(['task', 'create', taskDir, '--id', 'dashboard-task', '--request', 'Display structured state'], env);
  run(
    [
      'task',
      'context',
      taskDir,
      '--summary',
      'Establish dashboard context',
      '--goal',
      '[UD-001] Display the Task',
      '--scope',
      '[UD-002] Read-only backend',
      '--completion',
      'Dashboard API exposes the Task',
    ],
    env,
  );
  const artifact = path.join(taskDir, 'notes.md');
  fs.writeFileSync(artifact, '# Dashboard artifact\n\nVisible content.\n');
  run(
    [
      'task',
      'artifact',
      taskDir,
      '--type',
      'shape.design',
      '--path',
      artifact,
      '--status',
      'ready',
      '--establishes',
      'Dashboard artifact preview',
      '--next-consumer',
      'frontend',
    ],
    env,
  );
  const binaryArtifact = path.join(taskDir, 'binary.dat');
  fs.writeFileSync(binaryArtifact, Buffer.from([0x66, 0x6f, 0x00, 0x6f]));
  run(
    [
      'task',
      'artifact',
      taskDir,
      '--type',
      'evidence.binary',
      '--path',
      binaryArtifact,
      '--status',
      'ready',
      '--establishes',
      'Binary preview boundary',
      '--next-consumer',
      'frontend',
    ],
    env,
  );
  const largeArtifact = path.join(taskDir, 'large.txt');
  fs.writeFileSync(largeArtifact, Buffer.alloc(2 * 1024 * 1024 + 1, 0x61));
  run(
    [
      'task',
      'artifact',
      taskDir,
      '--type',
      'evidence.large',
      '--path',
      largeArtifact,
      '--status',
      'ready',
      '--establishes',
      'Large preview boundary',
      '--next-consumer',
      'frontend',
    ],
    env,
  );

  const state = JSON.parse(fs.readFileSync(path.join(taskDir, '.runtime/state.json'), 'utf8'));
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
  const parsed = new URL(dashboardUrl);
  const api = `${parsed.origin}/api/v1`;

  const meta = await (await fetch(`${api}/meta`)).json();
  assert.equal(meta.readOnly, true);
  assert.equal(meta.apiVersion, 1);
  assert.equal(meta.localActions.openPath, process.platform === 'darwin');
  assert.equal(meta.localActions.reveal, process.platform === 'darwin');

  const postMeta = await fetch(`${api}/meta`, { method: 'POST' });
  assert.equal(postMeta.status, 405);

  const catalog = await (await fetch(`${api}/tasks`)).json();
  assert.equal(catalog.tasks.length, 1);
  assert.equal(catalog.tasks[0].summary.taskUid, state.taskUid);
  assert.equal(catalog.tasks[0].summary.status, 'ready');

  const detail = await (await fetch(`${api}/tasks/${state.taskUid}`)).json();
  assert.equal(detail.state.taskId, 'dashboard-task');
  assert.equal(detail.state.artifacts[0].artifactType, 'shape.design');

  const health = await (await fetch(`${api}/tasks/${state.taskUid}/health`)).json();
  assert.deepEqual(health.findings, []);

  const invalidOpen = await fetch(`${api}/tasks/${state.taskUid}/open?target=workspace&application=unknown`, {
    method: 'POST',
  });
  assert.equal(invalidOpen.status, 400);
  assert.equal((await invalidOpen.json()).error, 'invalid_application');

  const crossOriginOpen = await fetch(`${api}/tasks/${state.taskUid}/open?target=workspace&application=finder`, {
    method: 'POST',
    headers: { Origin: 'https://example.com' },
  });
  assert.equal(crossOriginOpen.status, 403);
  assert.equal((await crossOriginOpen.json()).error, 'origin_not_allowed');

  const reboundHostOpen = await fetch(`${api}/tasks/${state.taskUid}/open?target=workspace&application=finder`, {
    method: 'POST',
    headers: { Host: `dashboard.example:${parsed.port}`, Origin: `http://dashboard.example:${parsed.port}` },
  });
  assert.equal(reboundHostOpen.status, 403);
  assert.equal((await reboundHostOpen.json()).error, 'origin_not_allowed');

  const revealBadApp = await fetch(`${api}/tasks/${state.taskUid}/reveal?path=notes.md&application=vim`, {
    method: 'POST',
  });
  assert.equal(revealBadApp.status, 400);
  assert.equal((await revealBadApp.json()).error, 'invalid_application');

  const revealNoPath = await fetch(`${api}/tasks/${state.taskUid}/reveal?application=vscode`, { method: 'POST' });
  assert.equal(revealNoPath.status, 400);
  assert.equal((await revealNoPath.json()).error, 'invalid_path');

  const revealCrossOrigin = await fetch(`${api}/tasks/${state.taskUid}/reveal?path=notes.md&application=vscode`, {
    method: 'POST',
    headers: { Origin: 'https://example.com' },
  });
  assert.equal(revealCrossOrigin.status, 403);
  assert.equal((await revealCrossOrigin.json()).error, 'origin_not_allowed');

  // A path escaping the task subtree is refused before anything is opened.
  const revealEscape = await fetch(
    `${api}/tasks/${state.taskUid}/reveal?path=${encodeURIComponent('../../../../etc/hosts')}&application=vscode`,
    { method: 'POST' },
  );
  assert.equal(revealEscape.status, 500);

  const registryFile = path.join(longreinHome, 'registry', 'tasks', `${state.taskUid}.json`);
  const mismatchedRegistration = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
  mismatchedRegistration.summaryFile = path.join(temp, 'wrong-summary.json');
  fs.writeFileSync(registryFile, JSON.stringify(mismatchedRegistration, null, 2) + '\n');
  const unhealthy = await (await fetch(`${api}/tasks/${state.taskUid}/health`)).json();
  assert.equal(unhealthy.findings.some((finding) => finding.code === 'registry-entry-mismatch'), true);

  const preview = await (
    await fetch(`${api}/tasks/${state.taskUid}/artifacts/${state.artifacts[0].id}/content`)
  ).json();
  assert.equal(preview.previewStatus, 'ready');
  assert.match(preview.preview, /Visible content/);

  const binaryPreview = await (
    await fetch(`${api}/tasks/${state.taskUid}/artifacts/${state.artifacts[1].id}/content`)
  ).json();
  assert.equal(binaryPreview.previewStatus, 'binary');
  assert.equal(binaryPreview.preview, null);

  const largePreview = await (
    await fetch(`${api}/tasks/${state.taskUid}/artifacts/${state.artifacts[2].id}/content`)
  ).json();
  assert.equal(largePreview.previewStatus, 'too-large');
  assert.equal(largePreview.preview, null);
  assert.equal(largePreview.maxPreviewBytes, 2 * 1024 * 1024);
});
