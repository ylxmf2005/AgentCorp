import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const root = path.resolve(import.meta.dirname, '../..');
const cli = path.join(root, 'cli/dist/index.js');
const longreinHome = fs.mkdtempSync(path.join(os.tmpdir(), 'longrein-home-test-'));
test.after(() => fs.rmSync(longreinHome, { recursive: true, force: true }));

function run(args, expectedStatus = 0) {
  const result = spawnSync(process.execPath, [cli, ...args], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, LONGREIN_HOME: longreinHome },
  });
  assert.equal(
    result.status,
    expectedStatus,
    `command failed: longrein ${args.join(' ')}\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`,
  );
  return result;
}

function mutationResult(result, expectedOperation) {
  const lines = result.stdout.trim().split(/\r?\n/);
  assert.equal(lines.length, 1, `mutation output must be one line:\n${result.stdout}`);
  const output = JSON.parse(lines[0]);
  assert.equal(output.ok, true);
  assert.equal(output.operation, expectedOperation);
  return output;
}

function shellQuote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function temporaryWorkspace() {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'longrein-task-test-'));
  test.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  return directory;
}

function initRepository(directory) {
  fs.mkdirSync(directory, { recursive: true });
  const git = (...args) => {
    const result = spawnSync('git', ['-C', directory, ...args], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
  };
  git('init', '-q');
  git('config', 'user.email', 'task-runtime@example.com');
  git('config', 'user.name', 'Task Runtime Test');
  fs.writeFileSync(path.join(directory, 'base.txt'), 'base\n');
  git('add', 'base.txt');
  git('commit', '-qm', 'init');
}

test('routes both task help forms through the lazy Task entry', () => {
  assert.match(run(['task', '--help']).stdout, /context \[options\] <task>/);
  assert.match(run(['help', 'task']).stdout, /context \[options\] <task>/);
});

test('creates, advances and completes a task without hooks', () => {
  const temp = temporaryWorkspace();
  const repository = path.join(temp, 'repo');
  const taskDir = path.join(temp, 'task');
  initRepository(repository);

  run(['task', 'create', taskDir, '--id', '20260721-runtime', '--request', 'Build runtime', '--repository', repository]);
  run([
    'task',
    'context',
    taskDir,
    '--summary',
    'Establish context',
    '--goal',
    '[UD-001] Show current state',
    '--scope',
    '[UD-002] Runtime and Timeline',
    '--non-goal',
    '[UD-003] No hooks',
    '--completion',
    'Lifecycle commands are executable',
    '--preserve',
    '[UD-004] Professional artifacts own conclusions',
  ]);
  run(['task', 'work', 'start', taskDir, '--now', 'Implement behavior', '--next', 'Verify it']);
  fs.writeFileSync(path.join(repository, 'changed.txt'), 'changed\n');
  run(['task', 'work', 'finish', taskDir, '--result', 'Behavior implemented', '--next', 'Check evidence', '--status', 'verifying']);
  run(['task', 'evidence', taskDir, 'CE-001', '--status', 'passed', '--proof', 'commands succeeded']);
  run(['task', 'doctor', taskDir]);
  run(['task', 'complete', taskDir, '--summary', 'Runtime verified']);

  const state = JSON.parse(fs.readFileSync(path.join(taskDir, '.runtime/state.json'), 'utf8'));
  assert.equal(state.status, 'complete');
  assert.match(state.taskUid, /^[0-9a-f-]{36}$/);
  assert.equal(state.latestEvent, 'EVT-0006');
  assert.equal(state.currentWork.active, null);
  assert.equal(fs.existsSync(path.join(taskDir, 'timeline.md')), true);
  assert.equal(fs.existsSync(path.join(taskDir, '.runtime/summary.json')), true);

  const taskMarkdown = fs.readFileSync(path.join(taskDir, 'task.md'), 'utf8');
  const timeline = fs.readFileSync(path.join(taskDir, 'timeline.md'), 'utf8');
  assert.match(taskMarkdown, /## Current Work/);
  assert.match(taskMarkdown, /## Confirmed Findings/);
  assert.match(taskMarkdown, /latest_event: "EVT-0006"/);
  assert.match(timeline, /work_started/);
  assert.match(timeline, /task_completed/);
  assert.doesNotMatch(timeline, /tool_call/);

  const terminalMutation = run(['task', 'finding', taskDir, '--summary', 'Late finding'], 1);
  assert.match(terminalMutation.stderr, /terminal task \(complete\)/);
});

test('chains compact Task mutations and stops after the first failure', () => {
  const temp = temporaryWorkspace();
  const repository = path.join(temp, 'repo');
  const taskDir = path.join(temp, 'task');
  const artifact = path.join(taskDir, 'design.md');
  const marker = path.join(temp, 'must-not-run');
  initRepository(repository);

  mutationResult(
    run(['task', 'create', taskDir, '--id', 'command-chain', '--request', 'Chain Task commands', '--repository', repository]),
    'task.create',
  );
  mutationResult(
    run([
      'task',
      'context',
      taskDir,
      '--summary',
      'Establish chain context',
      '--goal',
      '[UD-001] Reduce command overhead',
      '--scope',
      '[UD-002] Sequential Task mutations',
      '--completion',
      'The command chain succeeds',
    ]),
    'task.context',
  );
  mutationResult(run(['task', 'work', 'start', taskDir, '--now', 'Run one command chain']), 'task.work.start');
  fs.writeFileSync(path.join(repository, 'changed.txt'), 'changed\n');
  fs.writeFileSync(artifact, 'design\n');

  const commands = [
    [
      process.execPath,
      cli,
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
      'The chain contract',
      '--next-consumer',
      'dev',
    ],
    [
      process.execPath,
      cli,
      'task',
      'evidence',
      taskDir,
      'CE-001',
      '--status',
      'passed',
      '--proof',
      'The first two commands succeeded',
    ],
    [process.execPath, cli, 'task', 'work', 'finish', taskDir, '--result', 'The command chain completed'],
  ].map((args) => args.map(shellQuote).join(' '));
  const success = spawnSync('bash', ['--noprofile', '--norc', '-c', commands.join(' && ')], {
    cwd: root,
    encoding: 'utf8',
    env: { ...process.env, LONGREIN_HOME: longreinHome },
  });
  assert.equal(success.status, 0, success.stderr);
  assert.equal(success.stderr, '');
  const outputs = success.stdout.trim().split(/\r?\n/).map((line) => JSON.parse(line));
  assert.deepEqual(
    outputs.map((output) => output.operation),
    ['task.artifact', 'task.evidence', 'task.work.finish'],
  );
  assert.equal(outputs.every((output) => output.ok === true), true);

  const failure = spawnSync(
    'bash',
    [
      '--noprofile',
      '--norc',
      '-c',
      [
        [process.execPath, cli, 'task', 'work', 'finish', taskDir, '--result', 'No active unit'].map(shellQuote).join(' '),
        ['touch', marker].map(shellQuote).join(' '),
      ].join(' && '),
    ],
    {
      cwd: root,
      encoding: 'utf8',
      env: { ...process.env, LONGREIN_HOME: longreinHome },
    },
  );
  assert.equal(failure.status, 1);
  assert.equal(failure.stdout, '');
  assert.match(failure.stderr, /no active work unit/);
  assert.equal(fs.existsSync(marker), false);
});

test('registers every current-schema Task and resolves UID, id and path references', () => {
  const temp = temporaryWorkspace();
  const taskDir = path.join(temp, 'task');
  run(['task', 'create', taskDir, '--id', 'catalog-resolution', '--request', 'Register this Task']);

  const state = JSON.parse(fs.readFileSync(path.join(taskDir, '.runtime/state.json'), 'utf8'));
  const registryFile = path.join(longreinHome, 'registry', 'tasks', `${state.taskUid}.json`);
  assert.equal(fs.existsSync(registryFile), true);

  const list = JSON.parse(run(['task', 'list', '--json']).stdout);
  const listed = list.tasks.find((item) => item.registration.taskUid === state.taskUid);
  assert.equal(listed.availability, 'available');
  assert.equal(listed.summary.taskId, 'catalog-resolution');
  assert.equal(listed.summary.status, 'shaping');

  const summaryFile = path.join(taskDir, '.runtime/summary.json');
  const tamperedSummary = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
  tamperedSummary.status = 'complete';
  tamperedSummary.completion.passed = 999;
  fs.writeFileSync(summaryFile, JSON.stringify(tamperedSummary, null, 2) + '\n');
  const catalogAfterTamper = JSON.parse(run(['task', 'list', '--json']).stdout);
  const listedAfterTamper = catalogAfterTamper.tasks.find((item) => item.registration.taskUid === state.taskUid);
  assert.equal(listedAfterTamper.summary.status, 'shaping');
  assert.equal(listedAfterTamper.summary.completion.passed, 0);
  assert.match(run(['task', 'doctor', taskDir], 1).stdout, /summary-drift/);
  run(['task', 'doctor', taskDir, '--fix']);

  assert.match(run(['task', 'show', state.taskUid]).stdout, /catalog-resolution/);
  assert.match(run(['task', 'show', 'catalog-resolution']).stdout, new RegExp(state.taskUid));

  run(['task', 'unregister', state.taskUid]);
  assert.equal(fs.existsSync(registryFile), false);
  assert.equal(fs.existsSync(path.join(taskDir, '.runtime/state.json')), true);
  assert.match(run(['task', 'show', 'catalog-resolution'], 1).stderr, /not found/i);

  run(['task', 'register', taskDir]);
  assert.equal(fs.existsSync(registryFile), true);
});

test('detects and repairs missing or invalid registry entries without changing Task state', () => {
  const temp = temporaryWorkspace();
  const taskDir = path.join(temp, 'task');
  run(['task', 'create', taskDir, '--id', 'registry-repair', '--request', 'Repair the global pointer']);

  const stateFile = path.join(taskDir, '.runtime/state.json');
  const stateBefore = fs.readFileSync(stateFile, 'utf8');
  const state = JSON.parse(stateBefore);
  const registryFile = path.join(longreinHome, 'registry', 'tasks', `${state.taskUid}.json`);

  fs.rmSync(registryFile);
  const missing = run(['task', 'doctor', taskDir], 1);
  assert.match(missing.stdout, /task-unregistered/);
  run(['task', 'doctor', taskDir, '--fix']);
  assert.equal(fs.existsSync(registryFile), true);
  assert.equal(fs.readFileSync(stateFile, 'utf8'), stateBefore);

  fs.writeFileSync(registryFile, '{broken json\n');
  const invalid = JSON.parse(run(['task', 'registry', 'doctor', '--json'], 1).stdout);
  assert.equal(invalid.some((finding) => finding.code === 'registry-entry-invalid'), true);
  run(['task', 'unregister', state.taskUid]);
  assert.equal(fs.existsSync(registryFile), false);
  run(['task', 'doctor', taskDir, '--fix']);
  assert.equal(JSON.parse(fs.readFileSync(registryFile, 'utf8')).taskUid, state.taskUid);
  assert.equal(fs.readFileSync(stateFile, 'utf8'), stateBefore);

  const mismatched = JSON.parse(fs.readFileSync(registryFile, 'utf8'));
  mismatched.summaryFile = path.join(temp, 'wrong-summary.json');
  fs.writeFileSync(registryFile, JSON.stringify(mismatched, null, 2) + '\n');
  const mismatch = run(['task', 'doctor', taskDir], 1);
  assert.match(mismatch.stdout, /registry-entry-mismatch/);
  run(['task', 'doctor', taskDir, '--fix']);
});

test('reports a registered Task workspace that was moved behind the registry', () => {
  const temp = temporaryWorkspace();
  const original = path.join(temp, 'original');
  const moved = path.join(temp, 'moved');
  run(['task', 'create', original, '--id', 'moved-task', '--request', 'Detect a stale pointer']);
  const state = JSON.parse(fs.readFileSync(path.join(original, '.runtime/state.json'), 'utf8'));

  fs.renameSync(original, moved);
  const catalog = JSON.parse(run(['task', 'list', '--json']).stdout);
  const listed = catalog.tasks.find((item) => item.registration.taskUid === state.taskUid);
  assert.equal(listed.availability, 'missing');
  assert.equal(catalog.findings.some((finding) => finding.code === 'registry-task-missing'), true);

  const rejected = run(['task', 'register', moved], 1);
  assert.match(rejected.stderr, /workspace mismatch/);
});

test('rejects ambiguous human task ids while preserving globally unique UIDs', () => {
  const temp = temporaryWorkspace();
  const first = path.join(temp, 'first');
  const second = path.join(temp, 'second');
  run(['task', 'create', first, '--id', 'duplicate-readable-id', '--request', 'First']);
  run(['task', 'create', second, '--id', 'duplicate-readable-id', '--request', 'Second']);

  const firstState = JSON.parse(fs.readFileSync(path.join(first, '.runtime/state.json'), 'utf8'));
  const secondState = JSON.parse(fs.readFileSync(path.join(second, '.runtime/state.json'), 'utf8'));
  assert.notEqual(firstState.taskUid, secondState.taskUid);
  assert.match(run(['task', 'show', 'duplicate-readable-id'], 1).stderr, /ambiguous/);
  assert.match(run(['task', 'show', firstState.taskUid]).stdout, new RegExp(firstState.taskUid));
});

test('records explicit abandoned and superseded terminal states', () => {
  const temp = temporaryWorkspace();
  const abandoned = path.join(temp, 'abandoned');
  const replacement = path.join(temp, 'replacement');
  const superseded = path.join(temp, 'superseded');
  run(['task', 'create', abandoned, '--id', 'abandoned-task', '--request', 'Stop safely']);
  run(['task', 'abandon', abandoned, '--summary', 'No longer needed']);
  assert.equal(JSON.parse(fs.readFileSync(path.join(abandoned, '.runtime/state.json'), 'utf8')).status, 'abandoned');

  run(['task', 'create', replacement, '--id', 'replacement-task', '--request', 'New authoritative work']);
  run(['task', 'create', superseded, '--id', 'superseded-task', '--request', 'Old work']);
  const replacementState = JSON.parse(fs.readFileSync(path.join(replacement, '.runtime/state.json'), 'utf8'));
  run([
    'task',
    'supersede',
    superseded,
    '--by',
    replacementState.taskUid,
    '--summary',
    'Replacement owns the remaining work',
  ]);
  const state = JSON.parse(fs.readFileSync(path.join(superseded, '.runtime/state.json'), 'utf8'));
  assert.equal(state.status, 'superseded');
  assert.match(state.events.at(-1).details, new RegExp(replacementState.taskUid));
});

test('does not overwrite a legacy task directory', () => {
  const temp = temporaryWorkspace();
  const taskDir = path.join(temp, 'legacy');
  const taskFile = path.join(taskDir, 'task.md');
  fs.mkdirSync(taskDir, { recursive: true });
  fs.writeFileSync(taskFile, 'legacy task\n');

  const rejected = run(['task', 'create', taskDir, '--id', 'new-runtime', '--request', 'Do not adopt legacy state'], 1);
  assert.match(rejected.stderr, /refusing to overwrite existing Task files/);
  assert.equal(fs.readFileSync(taskFile, 'utf8'), 'legacy task\n');
  assert.equal(fs.existsSync(path.join(taskDir, '.runtime/state.json')), false);
});

test('requires an explicit user decision to replace established commitments', () => {
  const temp = temporaryWorkspace();
  const taskDir = path.join(temp, 'task');
  run(['task', 'create', taskDir, '--id', 'scope-guard', '--request', 'Guard scope']);
  run([
    'task',
    'context',
    taskDir,
    '--summary',
    'Initial commitments',
    '--goal',
    '[UD-001] First goal',
    '--scope',
    '[UD-002] First scope',
    '--completion',
    'Proof exists',
  ]);

  const rejected = run(
    ['task', 'context', taskDir, '--summary', 'Silent replacement', '--goal', '[UD-003] Different goal'],
    1,
  );
  assert.match(rejected.stderr, /requires --decision UD-###/);

  run([
    'task',
    'context',
    taskDir,
    '--summary',
    'User replaced goal',
    '--goal',
    '[UD-003] Different goal',
    '--decision',
    'UD-003',
  ]);
  const state = JSON.parse(fs.readFileSync(path.join(taskDir, '.runtime/state.json'), 'utf8'));
  assert.equal(state.scopeRevision, 2);
  assert.equal(state.events.at(-1).kind, 'scope_changed');
});

test('allows shaping findings before the first credible Task Context', () => {
  const temp = temporaryWorkspace();
  const taskDir = path.join(temp, 'task');
  run(['task', 'create', taskDir, '--id', 'shape-first', '--request', 'Investigate before committing']);
  run(['task', 'finding', taskDir, '--summary', 'The repository uses an existing state store']);
  run([
    'task',
    'context',
    taskDir,
    '--summary',
    'Establish commitments after shaping',
    '--goal',
    '[UD-001] Reuse the existing store',
    '--scope',
    '[UD-002] Runtime integration',
    '--completion',
    'Integration behavior is verified',
  ]);

  const state = JSON.parse(fs.readFileSync(path.join(taskDir, '.runtime/state.json'), 'utf8'));
  assert.equal(state.contextRevision, 2);
  assert.equal(state.scopeRevision, 1);
  assert.equal(state.events.at(-1).kind, 'context_established');
});

test('does not reconcile repository changes through work block without a started work unit', () => {
  const temp = temporaryWorkspace();
  const repository = path.join(temp, 'repo');
  const taskDir = path.join(temp, 'task');
  initRepository(repository);
  run(['task', 'create', taskDir, '--id', 'block-guard', '--request', 'Guard reconciliation', '--repository', repository]);
  fs.writeFileSync(path.join(repository, 'unexplained.txt'), 'change\n');

  const rejected = run(['task', 'work', 'block', taskDir, '--reason', 'No active unit'], 1);
  assert.match(rejected.stderr, /no active work unit/);
  const doctor = run(['task', 'doctor', taskDir], 1);
  assert.match(doctor.stdout, /repository-drift/);
});

test('detects untracked content drift even when file size and timestamps are restored', () => {
  const temp = temporaryWorkspace();
  const repository = path.join(temp, 'repo');
  const taskDir = path.join(temp, 'task');
  initRepository(repository);
  run(['task', 'create', taskDir, '--id', 'content-drift', '--request', 'Track repository content', '--repository', repository]);
  run(['task', 'work', 'start', taskDir, '--now', 'Create an untracked work file']);
  const workFile = path.join(repository, 'scratch.txt');
  fs.writeFileSync(workFile, 'aaaa\n');
  run(['task', 'work', 'finish', taskDir, '--result', 'Work file created']);
  run(['task', 'doctor', taskDir]);

  const original = fs.statSync(workFile);
  fs.writeFileSync(workFile, 'bbbb\n');
  fs.utimesSync(workFile, original.atime, original.mtime);
  const doctor = run(['task', 'doctor', taskDir], 1);
  assert.match(doctor.stdout, /repository-drift/);
});

test('requires a credible context and at least one Completion Evidence item', () => {
  const temp = temporaryWorkspace();
  const taskDir = path.join(temp, 'task');
  run(['task', 'create', taskDir, '--id', 'completion-guard', '--request', 'Guard completion']);
  run([
    'task',
    'context',
    taskDir,
    '--summary',
    'Context without evidence',
    '--goal',
    '[UD-001] Guard completion',
    '--scope',
    '[UD-002] Completion gate',
    '--status',
    'ready',
  ]);

  const rejected = run(['task', 'complete', taskDir, '--summary', 'Should not complete'], 1);
  assert.match(rejected.stderr, /without Completion Evidence/);
});

test('detects view and artifact drift and only fixes generated views', () => {
  const temp = temporaryWorkspace();
  const taskDir = path.join(temp, 'task');
  run(['task', 'create', taskDir, '--id', 'drift-guard', '--request', 'Detect drift']);
  run([
    'task',
    'context',
    taskDir,
    '--summary',
    'Initial commitments',
    '--goal',
    '[UD-001] Detect drift',
    '--scope',
    '[UD-002] Generated views and artifacts',
    '--completion',
    'Drift is rejected',
  ]);

  fs.appendFileSync(path.join(taskDir, 'task.md'), '\nmanual edit\n');
  fs.appendFileSync(path.join(taskDir, '.runtime/summary.json'), '\nmanual edit\n');
  const viewDrift = run(['task', 'doctor', taskDir], 1);
  assert.match(viewDrift.stdout, /task-drift/);
  assert.match(viewDrift.stdout, /summary-drift/);
  run(['task', 'doctor', taskDir, '--fix']);
  assert.doesNotMatch(fs.readFileSync(path.join(taskDir, 'task.md'), 'utf8'), /manual edit/);
  assert.doesNotMatch(fs.readFileSync(path.join(taskDir, '.runtime/summary.json'), 'utf8'), /manual edit/);

  const artifact = path.join(taskDir, 'design.md');
  fs.writeFileSync(artifact, 'v1\n');
  run([
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
    'Runtime contract',
    '--next-consumer',
    'dev',
  ]);
  run(['task', 'evidence', taskDir, 'CE-001', '--status', 'passed', '--proof', 'view checks passed']);
  fs.writeFileSync(artifact, 'v2\n');
  const artifactDrift = run(['task', 'doctor', taskDir], 1);
  assert.match(artifactDrift.stdout, /artifact-drift/);
  const completionRejected = run(['task', 'complete', taskDir, '--summary', 'Should fail'], 1);
  assert.match(completionRejected.stderr, /Task is inconsistent/);
});
