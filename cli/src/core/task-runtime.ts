import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const TASK_SCHEMA_VERSION = 2;
export const TASK_SUMMARY_SCHEMA_VERSION = 1;

export const TASK_STATUSES = [
  'shaping',
  'ready',
  'working',
  'waiting',
  'blocked',
  'verifying',
  'complete',
  'abandoned',
  'superseded',
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];
export type CompletionStatus = 'pending' | 'passed' | 'failed' | 'blocked';
export type ArtifactStatus = 'planned' | 'active' | 'ready' | 'verified' | 'stale' | 'superseded';

export interface RepositorySnapshot {
  head: string | null;
  worktreeFingerprint: string | null;
  capturedAt: string;
}

export interface CompletionEvidence {
  id: string;
  text: string;
  status: CompletionStatus;
  proof?: string;
  evidence: string[];
}

export interface TaskFinding {
  id: string;
  summary: string;
  evidence: string[];
  status: 'active' | 'superseded';
}

export interface TaskArtifact {
  id: string;
  artifactType: string;
  path: string;
  status: ArtifactStatus;
  establishes: string;
  nextConsumer: string;
  hash: string | null;
  updatedAt: string;
}

export interface TaskEvent {
  id: string;
  at: string;
  actor: string;
  kind:
    | 'task_created'
    | 'context_established'
    | 'context_changed'
    | 'scope_changed'
    | 'work_started'
    | 'work_finished'
    | 'work_blocked'
    | 'finding_recorded'
    | 'artifact_published'
    | 'artifact_updated'
    | 'verification_recorded'
    | 'task_completed'
    | 'task_abandoned'
    | 'task_superseded';
  summary: string;
  details?: string;
  evidence: string[];
  contextRevision: number;
  scopeRevision: number;
}

export interface TaskState {
  schemaVersion: number;
  taskUid: string;
  taskId: string;
  originalRequest: string;
  status: TaskStatus;
  contextRevision: number;
  scopeRevision: number;
  latestEvent: string;
  workspace: string;
  repository: string | null;
  refs: {
    sourceRef: string | null;
    workingBranch: string | null;
    targetRef: string | null;
  };
  commitments: {
    goal: string[];
    scope: string[];
    nonGoals: string[];
    completionEvidence: CompletionEvidence[];
    mustPreserve: string[];
    operatingEnvelopeMarkdown: string | null;
    assumptions: string[];
  };
  currentWork: {
    now: string;
    next: string;
    waitingOn: string;
    active: null | {
      id: string;
      actor: string;
      startedAt: string;
      repositoryBaseline: RepositorySnapshot | null;
    };
  };
  findings: TaskFinding[];
  artifacts: TaskArtifact[];
  events: TaskEvent[];
  lastReconciledRepository: RepositorySnapshot | null;
  counters: {
    event: number;
    workUnit: number;
    finding: number;
    artifact: number;
    completionEvidence: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface TaskSummaryProjection {
  summarySchemaVersion: number;
  stateSchemaVersion: number;
  taskUid: string;
  taskId: string;
  status: TaskStatus;
  goalHeadline: string | null;
  workspace: string;
  repository: string | null;
  refs: TaskState['refs'];
  contextRevision: number;
  scopeRevision: number;
  currentWork: TaskState['currentWork'];
  completion: Record<CompletionStatus | 'total', number>;
  artifacts: Record<ArtifactStatus | 'total', number>;
  activeFindings: number;
  latestEvent: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskPaths {
  workspace: string;
  runtimeDir: string;
  stateFile: string;
  summaryFile: string;
  taskFile: string;
  timelineFile: string;
  lockFile: string;
}

export interface DoctorFinding {
  severity: 'error' | 'warn' | 'info';
  code: string;
  message: string;
  fixable?: boolean;
}

export interface ContextUpdate {
  summary: string;
  actor?: string;
  decision?: string;
  evidence?: string[];
  goal?: string[];
  scope?: string[];
  nonGoals?: string[];
  completionEvidence?: string[];
  mustPreserve?: string[];
  assumptions?: string[];
  operatingEnvelopeMarkdown?: string | null;
  sourceRef?: string | null;
  workingBranch?: string | null;
  targetRef?: string | null;
  status?: 'shaping' | 'ready';
  now?: string;
  next?: string;
  waitingOn?: string;
}

function nowIso(): string {
  return new Date().toISOString();
}

function sha256(value: string | Buffer): string {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function yamlScalar(value: string | number | null): string {
  if (value === null) return 'null';
  if (typeof value === 'number') return String(value);
  return JSON.stringify(value);
}

function escapeTable(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', '<br>');
}

function displayValue(value: string | null): string {
  return value && value.trim() ? value : 'unresolved';
}

function renderBulletList(items: string[], empty = 'unresolved'): string {
  if (items.length === 0) return `- ${empty}`;
  return items.map((item) => `- ${item}`).join('\n');
}

function formatSequence(prefix: string, value: number, width = 4): string {
  return `${prefix}-${String(value).padStart(width, '0')}`;
}

function normalizeActor(actor?: string): string {
  return actor?.trim() || process.env.LONGREIN_ACTOR?.trim() || 'agent';
}

function assertStatus(value: string): asserts value is TaskStatus {
  if (!TASK_STATUSES.includes(value as TaskStatus)) {
    throw new Error(`invalid task status "${value}"; expected one of: ${TASK_STATUSES.join(', ')}`);
  }
}

function assertCompletionStatus(value: string): asserts value is CompletionStatus {
  if (!['pending', 'passed', 'failed', 'blocked'].includes(value)) {
    throw new Error(`invalid completion evidence status "${value}"`);
  }
}

function assertArtifactStatus(value: string): asserts value is ArtifactStatus {
  if (!['planned', 'active', 'ready', 'verified', 'stale', 'superseded'].includes(value)) {
    throw new Error(`invalid artifact status "${value}"`);
  }
}

function assertArtifactType(value: string): void {
  if (!/^[a-z][a-z0-9.-]*$/.test(value)) {
    throw new Error(`invalid artifact type "${value}"; use a stable lowercase name such as shape.design or review.report`);
  }
}

function assertTaskOpen(state: TaskState, action: string): void {
  if (['complete', 'abandoned', 'superseded'].includes(state.status)) {
    throw new Error(`cannot ${action} on terminal task (${state.status})`);
  }
}

export function taskPaths(input: string): TaskPaths {
  const resolved = path.resolve(input);
  let workspace = resolved;
  if (path.basename(resolved) === 'task.md') workspace = path.dirname(resolved);
  if (
    ['state.json', 'summary.json'].includes(path.basename(resolved)) &&
    path.basename(path.dirname(resolved)) === '.runtime'
  ) {
    workspace = path.dirname(path.dirname(resolved));
  }
  const runtimeDir = path.join(workspace, '.runtime');
  return {
    workspace,
    runtimeDir,
    stateFile: path.join(runtimeDir, 'state.json'),
    summaryFile: path.join(runtimeDir, 'summary.json'),
    taskFile: path.join(workspace, 'task.md'),
    timelineFile: path.join(workspace, 'timeline.md'),
    lockFile: path.join(runtimeDir, 'task.lock'),
  };
}

function atomicWrite(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`;
  try {
    fs.writeFileSync(temp, content, 'utf8');
    fs.renameSync(temp, file);
  } finally {
    if (fs.existsSync(temp)) fs.rmSync(temp);
  }
}

function acquireLock(paths: TaskPaths): () => void {
  fs.mkdirSync(paths.runtimeDir, { recursive: true });
  const attempt = (): number => fs.openSync(paths.lockFile, 'wx');
  let fd: number;
  try {
    fd = attempt();
  } catch (error) {
    if (!fs.existsSync(paths.lockFile)) throw error;
    const ageMs = Date.now() - fs.statSync(paths.lockFile).mtimeMs;
    if (ageMs <= 60_000) {
      throw new Error(`task is locked by another process: ${paths.lockFile}`);
    }
    fs.rmSync(paths.lockFile);
    fd = attempt();
  }
  fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, acquiredAt: nowIso() }) + '\n');
  return () => {
    try {
      fs.closeSync(fd);
    } finally {
      if (fs.existsSync(paths.lockFile)) fs.rmSync(paths.lockFile);
    }
  };
}

function runGit(repository: string, args: string[]): string | null {
  try {
    return execFileSync('git', ['-C', repository, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 32 * 1024 * 1024,
    }).trimEnd();
  } catch {
    return null;
  }
}

export function captureRepositorySnapshot(repository: string | null): RepositorySnapshot | null {
  if (!repository) return null;
  const root = runGit(repository, ['rev-parse', '--show-toplevel']);
  if (!root) return null;
  const head = runGit(root, ['rev-parse', 'HEAD']);
  const diff = runGit(root, ['diff', '--binary', 'HEAD', '--']) ?? '';
  const status = runGit(root, ['status', '--porcelain=v1', '--untracked-files=all']) ?? '';
  const untrackedMeta: string[] = [];
  const untracked = runGit(root, ['ls-files', '--others', '--exclude-standard', '-z']) ?? '';
  for (const relative of untracked.split('\0').filter(Boolean).sort()) {
    const full = path.join(root, relative);
    try {
      const stat = fs.lstatSync(full);
      const contentHash = stat.isSymbolicLink()
        ? sha256(fs.readlinkSync(full))
        : stat.isFile()
          ? sha256(fs.readFileSync(full))
          : 'not-a-file';
      untrackedMeta.push(`${relative}\0${stat.mode}\0${contentHash}`);
    } catch {
      untrackedMeta.push(`${relative}\0missing`);
    }
  }
  return {
    head,
    worktreeFingerprint: sha256(`${diff}\0${status}\0${untrackedMeta.join('\0')}`),
    capturedAt: nowIso(),
  };
}

function sameRepositorySnapshot(a: RepositorySnapshot | null, b: RepositorySnapshot | null): boolean {
  if (a === null || b === null) return a === b;
  return a.head === b.head && a.worktreeFingerprint === b.worktreeFingerprint;
}

export function resolveArtifactPath(paths: TaskPaths, artifactPath: string): string {
  return path.isAbsolute(artifactPath) ? artifactPath : path.resolve(paths.workspace, artifactPath);
}

function storedArtifactPath(paths: TaskPaths, artifactPath: string): string {
  const resolved = resolveArtifactPath(paths, artifactPath);
  const relative = path.relative(paths.workspace, resolved);
  return relative && !relative.startsWith('..') && !path.isAbsolute(relative) ? relative : resolved;
}

function artifactHash(paths: TaskPaths, artifactPath: string): string | null {
  const resolved = resolveArtifactPath(paths, artifactPath);
  try {
    const stat = fs.statSync(resolved);
    if (!stat.isFile()) return null;
    return sha256(fs.readFileSync(resolved));
  } catch {
    return null;
  }
}

function appendEvent(
  state: TaskState,
  input: Omit<TaskEvent, 'id' | 'at' | 'contextRevision' | 'scopeRevision' | 'evidence'> & {
    evidence?: string[];
  },
): TaskEvent {
  state.counters.event += 1;
  const event: TaskEvent = {
    id: formatSequence('EVT', state.counters.event),
    at: nowIso(),
    actor: input.actor,
    kind: input.kind,
    summary: input.summary,
    details: input.details,
    evidence: input.evidence ?? [],
    contextRevision: state.contextRevision,
    scopeRevision: state.scopeRevision,
  };
  state.events.push(event);
  state.latestEvent = event.id;
  return event;
}

export function taskSummaryProjection(state: TaskState): TaskSummaryProjection {
  const completion: TaskSummaryProjection['completion'] = {
    total: state.commitments.completionEvidence.length,
    pending: 0,
    passed: 0,
    failed: 0,
    blocked: 0,
  };
  for (const item of state.commitments.completionEvidence) completion[item.status] += 1;

  const artifacts: TaskSummaryProjection['artifacts'] = {
    total: state.artifacts.length,
    planned: 0,
    active: 0,
    ready: 0,
    verified: 0,
    stale: 0,
    superseded: 0,
  };
  for (const artifact of state.artifacts) artifacts[artifact.status] += 1;

  return {
    summarySchemaVersion: TASK_SUMMARY_SCHEMA_VERSION,
    stateSchemaVersion: TASK_SCHEMA_VERSION,
    taskUid: state.taskUid,
    taskId: state.taskId,
    status: state.status,
    goalHeadline: state.commitments.goal.at(0) ?? null,
    workspace: state.workspace,
    repository: state.repository,
    refs: state.refs,
    contextRevision: state.contextRevision,
    scopeRevision: state.scopeRevision,
    currentWork: state.currentWork,
    completion,
    artifacts,
    activeFindings: state.findings.filter((item) => item.status === 'active').length,
    latestEvent: state.latestEvent,
    createdAt: state.createdAt,
    updatedAt: state.updatedAt,
  };
}

export function renderTaskSummaryJson(state: TaskState): string {
  return JSON.stringify(taskSummaryProjection(state), null, 2) + '\n';
}

export function renderTaskMarkdown(state: TaskState): string {
  const evidence = state.commitments.completionEvidence.length
    ? state.commitments.completionEvidence
        .map((item) => {
          const checked = item.status === 'passed' ? 'x' : ' ';
          const proof = item.proof ? ` — ${item.proof}` : '';
          return `- [${checked}] [${item.id}] ${item.text}${proof}`;
        })
        .join('\n')
    : '- [ ] unresolved';

  const findings = state.findings.filter((item) => item.status === 'active');
  const findingText = findings.length
    ? findings
        .map((item) => {
          const refs = item.evidence.length ? ` — ${item.evidence.join(', ')}` : '';
          return `- [${item.id}] ${item.summary}${refs}`;
        })
        .join('\n')
    : '- none';

  const artifactRows = [
    '| Artifact | Type | Status | What it establishes | Next consumer |',
    '| --- | --- | --- | --- | --- |',
    '| `task.md` | task.context | active | 当前任务承诺、状态和产物入口 | all |',
    '| `timeline.md` | task.timeline | active | 工作单元与语义变化的任务历史 | all |',
    ...state.artifacts.map(
      (artifact) =>
        `| \`${escapeTable(artifact.path)}\` | ${artifact.artifactType} | ${artifact.status} | ${escapeTable(artifact.establishes)} | ${escapeTable(artifact.nextConsumer)} |`,
    ),
  ].join('\n');

  return `---
artifact_type: TaskContext
schema_version: ${TASK_SCHEMA_VERSION}
task_uid: ${yamlScalar(state.taskUid)}
task_id: ${yamlScalar(state.taskId)}
status: ${state.status}
context_revision: ${state.contextRevision}
scope_revision: ${state.scopeRevision}
latest_event: ${yamlScalar(state.latestEvent)}
workspace: ${yamlScalar(state.workspace)}
repository: ${yamlScalar(state.repository)}
source_ref: ${yamlScalar(state.refs.sourceRef)}
working_branch: ${yamlScalar(state.refs.workingBranch)}
target_ref: ${yamlScalar(state.refs.targetRef)}
updated_at: ${yamlScalar(state.updatedAt)}
---

# Task Context: ${state.taskId}

## Original Request

${state.originalRequest || 'unresolved'}

## Goal

${renderBulletList(state.commitments.goal)}

## Scope

${renderBulletList(state.commitments.scope)}

## Non-goals

${renderBulletList(state.commitments.nonGoals, 'none')}

## Completion Evidence

${evidence}

## Must Preserve

${renderBulletList(state.commitments.mustPreserve, 'none')}

## Task Operating Envelope

${state.commitments.operatingEnvelopeMarkdown?.trim() || '- none established'}

## Assumptions And Evidence Gaps

${renderBulletList(state.commitments.assumptions, 'none')}

## Current Work

- Now: ${displayValue(state.currentWork.now)}
- Next: ${displayValue(state.currentWork.next)}
- Waiting on: ${state.currentWork.waitingOn || 'none'}
${state.currentWork.active ? `- Active work unit: ${state.currentWork.active.id}, actor ${state.currentWork.active.actor}, started ${state.currentWork.active.startedAt}` : '- Active work unit: none'}

## Confirmed Findings

${findingText}

## Artifact Map

${artifactRows}

## Timeline

完整任务历史见 [\`timeline.md\`](timeline.md)。最新事件：${state.latestEvent}。
`;
}

export function renderTimelineMarkdown(state: TaskState): string {
  const entries = state.events
    .map((event) => {
      const evidence = event.evidence.length
        ? `\n- Evidence: ${event.evidence.map((item) => `\`${item}\``).join(', ')}`
        : '';
      const details = event.details?.trim() ? `\n\n${event.details.trim()}` : '';
      return `## ${event.id} · ${event.at} · ${event.kind}\n\n${event.summary}\n\n- Actor: ${event.actor}\n- Revisions: context r${event.contextRevision}, scope r${event.scopeRevision}${evidence}${details}`;
    })
    .join('\n\n');
  return `# Task Timeline: ${state.taskId}

这里记录会帮助用户或下一位理解任务如何推进的事件：工作单元、决定、发现、产物、验证和状态变化。普通工具调用不进入 Timeline。

${entries || 'No events recorded.'}
`;
}

function validateStateShape(value: unknown): TaskState {
  if (!value || typeof value !== 'object') throw new Error('task state is not an object');
  const state = value as TaskState;
  if (state.schemaVersion !== TASK_SCHEMA_VERSION) {
    throw new Error(`unsupported task state schema ${String(state.schemaVersion)}; expected ${TASK_SCHEMA_VERSION}`);
  }
  if (!state.taskUid || !state.taskId || !state.workspace || !Array.isArray(state.events)) {
    throw new Error('task state is missing required fields');
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(state.taskUid)) {
    throw new Error(`invalid task uid: ${state.taskUid}`);
  }
  assertStatus(state.status);
  for (const artifact of state.artifacts) {
    assertArtifactStatus(artifact.status);
    assertArtifactType(artifact.artifactType);
  }
  return state;
}

export function loadTaskState(input: string): TaskState {
  const paths = taskPaths(input);
  if (!fs.existsSync(paths.stateFile)) {
    throw new Error(`task runtime state not found: ${paths.stateFile}; create a Runtime Task first`);
  }
  const state = validateStateShape(JSON.parse(fs.readFileSync(paths.stateFile, 'utf8')));
  if (path.resolve(state.workspace) !== paths.workspace) {
    throw new Error(`task workspace mismatch: state points to ${state.workspace}, opened ${paths.workspace}`);
  }
  return state;
}

export function loadTaskSummary(input: string): TaskSummaryProjection {
  const paths = taskPaths(input);
  if (!fs.existsSync(paths.summaryFile)) throw new Error(`task summary not found: ${paths.summaryFile}`);
  const value = JSON.parse(fs.readFileSync(paths.summaryFile, 'utf8')) as TaskSummaryProjection;
  if (
    !value ||
    value.summarySchemaVersion !== TASK_SUMMARY_SCHEMA_VERSION ||
    value.stateSchemaVersion !== TASK_SCHEMA_VERSION ||
    !value.taskUid ||
    !value.taskId ||
    !value.workspace
  ) {
    throw new Error(`invalid task summary: ${paths.summaryFile}`);
  }
  return value;
}

function saveStateAndViews(paths: TaskPaths, state: TaskState): void {
  state.updatedAt = nowIso();
  atomicWrite(paths.stateFile, JSON.stringify(state, null, 2) + '\n');
  try {
    atomicWrite(paths.summaryFile, renderTaskSummaryJson(state));
    atomicWrite(paths.taskFile, renderTaskMarkdown(state));
    atomicWrite(paths.timelineFile, renderTimelineMarkdown(state));
  } catch (error) {
    throw new Error(
      `Task state was saved at ${paths.stateFile}, but generated views could not be refreshed: ${error instanceof Error ? error.message : String(error)}. Run longrein task doctor ${paths.workspace} --fix after resolving the filesystem error.`,
    );
  }
}

function mutateTask(input: string, mutation: (state: TaskState, paths: TaskPaths) => void): TaskState {
  const paths = taskPaths(input);
  const release = acquireLock(paths);
  try {
    const state = loadTaskState(paths.workspace);
    mutation(state, paths);
    saveStateAndViews(paths, state);
    return state;
  } finally {
    release();
  }
}

export function createTask(input: {
  directory: string;
  taskId: string;
  request: string;
  repository?: string;
  sourceRef?: string;
  workingBranch?: string;
  targetRef?: string;
  actor?: string;
}): TaskState {
  const paths = taskPaths(input.directory);
  const existingCoreFiles = [paths.stateFile, paths.summaryFile, paths.taskFile, paths.timelineFile].filter((file) =>
    fs.existsSync(file),
  );
  if (existingCoreFiles.length) {
    throw new Error(`refusing to overwrite existing Task files: ${existingCoreFiles.join(', ')}`);
  }
  fs.mkdirSync(paths.workspace, { recursive: true });
  const release = acquireLock(paths);
  try {
    const createdAt = nowIso();
    const repository = input.repository ? path.resolve(input.repository) : null;
    const repositorySnapshot = captureRepositorySnapshot(repository);
    if (repository && !repositorySnapshot) {
      throw new Error(`repository is not a readable Git worktree: ${repository}`);
    }
    const state: TaskState = {
      schemaVersion: TASK_SCHEMA_VERSION,
      taskUid: crypto.randomUUID(),
      taskId: input.taskId,
      originalRequest: input.request,
      status: 'shaping',
      contextRevision: 0,
      scopeRevision: 0,
      latestEvent: '',
      workspace: paths.workspace,
      repository,
      refs: {
        sourceRef: input.sourceRef ?? null,
        workingBranch: input.workingBranch ?? null,
        targetRef: input.targetRef ?? null,
      },
      commitments: {
        goal: [],
        scope: [],
        nonGoals: [],
        completionEvidence: [],
        mustPreserve: [],
        operatingEnvelopeMarkdown: null,
        assumptions: [],
      },
      currentWork: { now: '形成可信 Task Context', next: '使用 shape 调查真实对象', waitingOn: 'none', active: null },
      findings: [],
      artifacts: [],
      events: [],
      lastReconciledRepository: repositorySnapshot,
      counters: { event: 0, workUnit: 0, finding: 0, artifact: 0, completionEvidence: 0 },
      createdAt,
      updatedAt: createdAt,
    };
    appendEvent(state, {
      actor: normalizeActor(input.actor),
      kind: 'task_created',
      summary: input.request,
    });
    saveStateAndViews(paths, state);
    return state;
  } finally {
    release();
  }
}

function nextCompletionEvidence(state: TaskState, text: string): CompletionEvidence {
  const existing = state.commitments.completionEvidence.find((item) => item.text === text);
  if (existing) return existing;
  state.counters.completionEvidence += 1;
  return {
    id: formatSequence('CE', state.counters.completionEvidence, 3),
    text,
    status: 'pending',
    evidence: [],
  };
}

export function setTaskContext(input: string, update: ContextUpdate): TaskState {
  return mutateTask(input, (state) => {
    assertTaskOpen(state, 'change context');
    const commitmentsEstablished = state.scopeRevision > 0;
    const nextRefs = {
      sourceRef: update.sourceRef !== undefined ? update.sourceRef : state.refs.sourceRef,
      workingBranch: update.workingBranch !== undefined ? update.workingBranch : state.refs.workingBranch,
      targetRef: update.targetRef !== undefined ? update.targetRef : state.refs.targetRef,
    };
    const nextCommitments = {
      goal: update.goal ?? state.commitments.goal,
      scope: update.scope ?? state.commitments.scope,
      nonGoals: update.nonGoals ?? state.commitments.nonGoals,
      completionEvidence:
        update.completionEvidence !== undefined
          ? update.completionEvidence.map((text) => nextCompletionEvidence(state, text))
          : state.commitments.completionEvidence,
      mustPreserve: update.mustPreserve ?? state.commitments.mustPreserve,
      operatingEnvelopeMarkdown:
        update.operatingEnvelopeMarkdown !== undefined
          ? update.operatingEnvelopeMarkdown
          : state.commitments.operatingEnvelopeMarkdown,
      assumptions: update.assumptions ?? state.commitments.assumptions,
    };
    const commitmentsChanged =
      !sameValue(state.commitments.goal, nextCommitments.goal) ||
      !sameValue(state.commitments.scope, nextCommitments.scope) ||
      !sameValue(state.commitments.nonGoals, nextCommitments.nonGoals) ||
      !sameValue(
        state.commitments.completionEvidence.map((item) => item.text),
        nextCommitments.completionEvidence.map((item) => item.text),
      ) ||
      !sameValue(state.commitments.mustPreserve, nextCommitments.mustPreserve) ||
      !sameValue(state.refs, nextRefs);
    const factsChanged =
      commitmentsChanged ||
      !sameValue(state.commitments.operatingEnvelopeMarkdown, nextCommitments.operatingEnvelopeMarkdown) ||
      !sameValue(state.commitments.assumptions, nextCommitments.assumptions);
    if (!factsChanged && update.status === undefined) throw new Error('context update changes nothing');
    const establishingCommitments = commitmentsChanged && !commitmentsEstablished;
    if (commitmentsChanged && commitmentsEstablished) {
      if (!update.decision || !/^UD-\d{3,}$/.test(update.decision)) {
        throw new Error('changing task commitments requires --decision UD-###');
      }
    }
    state.commitments = nextCommitments;
    state.refs = nextRefs;
    state.contextRevision += 1;
    if (commitmentsChanged) state.scopeRevision += 1;
    if (update.status) state.status = update.status;
    else if (state.commitments.goal.length && state.commitments.scope.length && state.commitments.completionEvidence.length) {
      state.status = 'ready';
    }
    state.currentWork = {
      ...state.currentWork,
      now: update.now ?? (establishingCommitments && state.status === 'ready' ? 'none' : state.currentWork.now),
      next: update.next ?? (establishingCommitments && state.status === 'ready' ? '选择下一项工作' : state.currentWork.next),
      waitingOn: update.waitingOn ?? state.currentWork.waitingOn,
    };
    appendEvent(state, {
      actor: normalizeActor(update.actor),
      kind: establishingCommitments ? 'context_established' : commitmentsChanged ? 'scope_changed' : 'context_changed',
      summary: update.summary,
      details: update.decision ? `Authorized by ${update.decision}.` : undefined,
      evidence: update.evidence,
    });
  });
}

export function startTaskWork(
  input: string,
  options: { now: string; next?: string; actor?: string; evidence?: string[] },
): TaskState {
  return mutateTask(input, (state) => {
    assertTaskOpen(state, 'start work');
    if (state.currentWork.active) throw new Error(`work unit already active: ${state.currentWork.active.id}`);
    state.counters.workUnit += 1;
    const actor = normalizeActor(options.actor);
    const active = {
      id: formatSequence('WU', state.counters.workUnit, 3),
      actor,
      startedAt: nowIso(),
      repositoryBaseline: captureRepositorySnapshot(state.repository),
    };
    state.currentWork = {
      now: options.now,
      next: options.next ?? state.currentWork.next,
      waitingOn: 'none',
      active,
    };
    state.status = 'working';
    appendEvent(state, {
      actor,
      kind: 'work_started',
      summary: options.now,
      details: `Work unit ${active.id} started.`,
      evidence: options.evidence,
    });
  });
}

export function finishTaskWork(
  input: string,
  options: {
    result: string;
    next?: string;
    now?: string;
    status?: 'ready' | 'verifying';
    actor?: string;
    evidence?: string[];
  },
): TaskState {
  return mutateTask(input, (state) => {
    const active = state.currentWork.active;
    if (!active) throw new Error('no active work unit');
    const after = captureRepositorySnapshot(state.repository);
    const repositoryChanged = !sameRepositorySnapshot(active.repositoryBaseline, after);
    state.currentWork = {
      now: options.now ?? 'none',
      next: options.next ?? 'none',
      waitingOn: 'none',
      active: null,
    };
    state.status = options.status ?? 'ready';
    state.lastReconciledRepository = after;
    appendEvent(state, {
      actor: normalizeActor(options.actor ?? active.actor),
      kind: 'work_finished',
      summary: options.result,
      details: `Work unit ${active.id} finished. Repository changed: ${repositoryChanged ? 'yes' : 'no'}.`,
      evidence: options.evidence,
    });
  });
}

export function blockTaskWork(
  input: string,
  options: { reason: string; waitingOn?: string; next?: string; actor?: string; evidence?: string[] },
): TaskState {
  return mutateTask(input, (state) => {
    const active = state.currentWork.active;
    if (!active) throw new Error('no active work unit');
    const after = captureRepositorySnapshot(state.repository);
    state.currentWork = {
      now: 'none',
      next: options.next ?? '等待阻塞条件解除后重新判断',
      waitingOn: options.waitingOn?.trim() || 'none',
      active: null,
    };
    state.status = state.currentWork.waitingOn === 'none' ? 'blocked' : 'waiting';
    state.lastReconciledRepository = after;
    appendEvent(state, {
      actor: normalizeActor(options.actor ?? active.actor),
      kind: 'work_blocked',
      summary: options.reason,
      details: `Work unit ${active.id} stopped.`,
      evidence: options.evidence,
    });
  });
}

export function recordTaskFinding(
  input: string,
  options: { summary: string; evidence?: string[]; actor?: string },
): TaskState {
  return mutateTask(input, (state) => {
    assertTaskOpen(state, 'record a finding');
    state.counters.finding += 1;
    const finding: TaskFinding = {
      id: formatSequence('FND', state.counters.finding, 3),
      summary: options.summary,
      evidence: options.evidence ?? [],
      status: 'active',
    };
    state.findings.push(finding);
    state.contextRevision += 1;
    appendEvent(state, {
      actor: normalizeActor(options.actor),
      kind: 'finding_recorded',
      summary: `[${finding.id}] ${finding.summary}`,
      evidence: finding.evidence,
    });
  });
}

export function upsertTaskArtifact(
  input: string,
  options: {
    artifactType: string;
    artifactPath: string;
    status: string;
    establishes: string;
    nextConsumer: string;
    actor?: string;
    evidence?: string[];
  },
): TaskState {
  assertArtifactStatus(options.status);
  assertArtifactType(options.artifactType);
  return mutateTask(input, (state, paths) => {
    assertTaskOpen(state, 'publish an artifact');
    const storedPath = storedArtifactPath(paths, options.artifactPath);
    let artifact = state.artifacts.find((item) => item.path === storedPath);
    const created = !artifact;
    if (!artifact) {
      state.counters.artifact += 1;
      artifact = {
        id: formatSequence('ART', state.counters.artifact, 3),
        artifactType: options.artifactType,
        path: storedPath,
        status: options.status as ArtifactStatus,
        establishes: options.establishes,
        nextConsumer: options.nextConsumer,
        hash: null,
        updatedAt: nowIso(),
      };
      state.artifacts.push(artifact);
    }
    artifact.artifactType = options.artifactType;
    artifact.status = options.status as ArtifactStatus;
    artifact.establishes = options.establishes;
    artifact.nextConsumer = options.nextConsumer;
    artifact.hash = artifactHash(paths, storedPath);
    artifact.updatedAt = nowIso();
    appendEvent(state, {
      actor: normalizeActor(options.actor),
      kind: created ? 'artifact_published' : 'artifact_updated',
      summary: `[${artifact.id}] ${storedPath} is ${artifact.status}`,
      details: artifact.establishes,
      evidence: options.evidence,
    });
  });
}

export function setTaskCompletionEvidence(
  input: string,
  evidenceId: string,
  options: { status: string; proof?: string; evidence?: string[]; actor?: string },
): TaskState {
  assertCompletionStatus(options.status);
  return mutateTask(input, (state) => {
    assertTaskOpen(state, 'record completion evidence');
    const item = state.commitments.completionEvidence.find((entry) => entry.id === evidenceId);
    if (!item) throw new Error(`unknown completion evidence: ${evidenceId}`);
    item.status = options.status as CompletionStatus;
    item.proof = options.proof;
    item.evidence = options.evidence ?? [];
    appendEvent(state, {
      actor: normalizeActor(options.actor),
      kind: 'verification_recorded',
      summary: `[${item.id}] ${item.status}: ${item.text}`,
      details: item.proof,
      evidence: item.evidence,
    });
  });
}

function currentViewFinding(paths: TaskPaths, state: TaskState, file: 'task' | 'timeline' | 'summary'): DoctorFinding | null {
  const target = file === 'task' ? paths.taskFile : file === 'timeline' ? paths.timelineFile : paths.summaryFile;
  const expected =
    file === 'task' ? renderTaskMarkdown(state) : file === 'timeline' ? renderTimelineMarkdown(state) : renderTaskSummaryJson(state);
  if (!fs.existsSync(target)) {
    return { severity: 'warn', code: `${file}-missing`, message: `${path.basename(target)} is missing`, fixable: true };
  }
  const actual = fs.readFileSync(target, 'utf8');
  if (actual !== expected) {
    return {
      severity: 'warn',
      code: `${file}-drift`,
      message: `${path.basename(target)} differs from runtime state`,
      fixable: true,
    };
  }
  return null;
}

export function inspectTaskHealth(input: string): DoctorFinding[] {
  const paths = taskPaths(input);
  const findings: DoctorFinding[] = [];
  let state: TaskState;
  try {
    state = loadTaskState(paths.workspace);
  } catch (error) {
    return [{ severity: 'error', code: 'state-invalid', message: error instanceof Error ? error.message : String(error) }];
  }
  const taskView = currentViewFinding(paths, state, 'task');
  const timelineView = currentViewFinding(paths, state, 'timeline');
  const summaryView = currentViewFinding(paths, state, 'summary');
  if (taskView) findings.push(taskView);
  if (timelineView) findings.push(timelineView);
  if (summaryView) findings.push(summaryView);

  if (state.events.at(-1)?.id !== state.latestEvent) {
    findings.push({ severity: 'error', code: 'event-pointer', message: 'latest_event does not match the final Timeline event' });
  }
  for (const artifact of state.artifacts) {
    if (artifact.status === 'planned' || artifact.status === 'superseded') continue;
    const currentHash = artifactHash(paths, artifact.path);
    if (currentHash === null) {
      findings.push({ severity: 'warn', code: 'artifact-missing', message: `artifact ${artifact.path} is missing` });
    } else if (artifact.hash !== currentHash) {
      findings.push({
        severity: 'warn',
        code: 'artifact-drift',
        message: `artifact ${artifact.path} changed after its latest Task event`,
      });
    }
  }
  const repositoryNow = captureRepositorySnapshot(state.repository);
  if (state.repository && repositoryNow === null) {
    findings.push({
      severity: 'warn',
      code: 'repository-unavailable',
      message: `repository is not a readable Git worktree: ${state.repository}`,
    });
  }
  if (!sameRepositorySnapshot(state.lastReconciledRepository, repositoryNow)) {
    findings.push({
      severity: 'warn',
      code: 'repository-drift',
      message: 'repository changed after the latest reconciled work-unit boundary',
    });
  }
  if (state.status === 'complete') {
    if (state.commitments.completionEvidence.length === 0) {
      findings.push({
        severity: 'error',
        code: 'complete-without-evidence',
        message: 'task is complete but defines no Completion Evidence',
      });
    }
    const incomplete = state.commitments.completionEvidence.filter((item) => item.status !== 'passed');
    if (incomplete.length) {
      findings.push({
        severity: 'error',
        code: 'complete-without-evidence',
        message: `task is complete but ${incomplete.length} completion evidence item(s) are not passed`,
      });
    }
  }
  if (fs.existsSync(paths.lockFile)) {
    const ageMs = Date.now() - fs.statSync(paths.lockFile).mtimeMs;
    findings.push({
      severity: ageMs > 60_000 ? 'warn' : 'info',
      code: ageMs > 60_000 ? 'stale-lock' : 'active-lock',
      message: `${ageMs > 60_000 ? 'stale' : 'active'} task lock exists at ${paths.lockFile}`,
      fixable: ageMs > 60_000,
    });
  }
  return findings;
}

export function fixTaskViews(input: string): DoctorFinding[] {
  const paths = taskPaths(input);
  const release = acquireLock(paths);
  try {
    const state = loadTaskState(paths.workspace);
    atomicWrite(paths.taskFile, renderTaskMarkdown(state));
    atomicWrite(paths.timelineFile, renderTimelineMarkdown(state));
    atomicWrite(paths.summaryFile, renderTaskSummaryJson(state));
  } finally {
    release();
  }
  return inspectTaskHealth(paths.workspace);
}

export function completeTask(
  input: string,
  options: { summary: string; actor?: string; evidence?: string[] },
): TaskState {
  const paths = taskPaths(input);
  const release = acquireLock(paths);
  try {
    const state = loadTaskState(paths.workspace);
    assertTaskOpen(state, 'complete');
    if (state.currentWork.active) throw new Error(`cannot complete with active work unit ${state.currentWork.active.id}`);
    if (state.status === 'waiting' || state.status === 'blocked') {
      throw new Error(`cannot complete task while status is ${state.status}`);
    }
    if (state.status !== 'ready' && state.status !== 'verifying') {
      throw new Error(`cannot complete task while status is ${state.status}; expected ready or verifying`);
    }
    if (state.scopeRevision === 0 || !state.commitments.goal.length || !state.commitments.scope.length) {
      throw new Error('cannot complete before a credible Task Context is established');
    }
    if (state.commitments.completionEvidence.length === 0) {
      throw new Error('cannot complete without Completion Evidence');
    }
    const incomplete = state.commitments.completionEvidence.filter((item) => item.status !== 'passed');
    if (incomplete.length) {
      throw new Error(`cannot complete: ${incomplete.map((item) => item.id).join(', ')} not passed`);
    }
    const health = inspectTaskHealth(paths.workspace).filter((item) => item.severity !== 'info');
    if (health.length) {
      throw new Error(`cannot complete while Task is inconsistent: ${health.map((item) => item.code).join(', ')}`);
    }
    state.status = 'complete';
    state.currentWork = { now: 'none', next: 'none', waitingOn: 'none', active: null };
    appendEvent(state, {
      actor: normalizeActor(options.actor),
      kind: 'task_completed',
      summary: options.summary,
      evidence: options.evidence,
    });
    saveStateAndViews(paths, state);
    return state;
  } finally {
    release();
  }
}

export function abandonTask(
  input: string,
  options: { summary: string; actor?: string; evidence?: string[] },
): TaskState {
  return mutateTask(input, (state) => {
    assertTaskOpen(state, 'abandon');
    if (state.currentWork.active) throw new Error(`cannot abandon with active work unit ${state.currentWork.active.id}`);
    state.status = 'abandoned';
    state.currentWork = { now: 'none', next: 'none', waitingOn: 'none', active: null };
    appendEvent(state, {
      actor: normalizeActor(options.actor),
      kind: 'task_abandoned',
      summary: options.summary,
      evidence: options.evidence,
    });
  });
}

export function supersedeTask(
  input: string,
  options: { summary: string; supersededBy: string; actor?: string; evidence?: string[] },
): TaskState {
  return mutateTask(input, (state) => {
    assertTaskOpen(state, 'supersede');
    if (state.currentWork.active) throw new Error(`cannot supersede with active work unit ${state.currentWork.active.id}`);
    state.status = 'superseded';
    state.currentWork = { now: 'none', next: 'none', waitingOn: 'none', active: null };
    appendEvent(state, {
      actor: normalizeActor(options.actor),
      kind: 'task_superseded',
      summary: options.summary,
      details: `Superseded by ${options.supersededBy}.`,
      evidence: options.evidence,
    });
  });
}

export function taskSummary(state: TaskState): string {
  return [
    `${state.taskId}  ${state.status}`,
    `UID: ${state.taskUid}`,
    `Task: ${path.join(state.workspace, 'task.md')}`,
    `Now: ${state.currentWork.now}`,
    `Next: ${state.currentWork.next}`,
    `Waiting on: ${state.currentWork.waitingOn}`,
    `Latest event: ${state.latestEvent}`,
  ].join('\n');
}
