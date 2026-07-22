import fs from 'node:fs';
import path from 'node:path';
import { taskRegistryRoot } from './paths.js';

export const TASK_REGISTRY_SCHEMA_VERSION = 1;

export interface RegisterableTask {
  taskUid: string;
  taskId: string;
  workspace: string;
  repository: string | null;
}

export interface TaskRegistryEntry {
  registrySchemaVersion: number;
  taskUid: string;
  workspace: string;
  stateFile: string;
  summaryFile: string;
  registeredAt: string;
  updatedAt: string;
  lastKnownTaskId: string;
  lastKnownRepository: string | null;
}

export interface TaskRegistryFinding {
  severity: 'error' | 'warn';
  code: 'registry-entry-invalid' | 'registry-entry-mismatch' | 'registry-task-missing';
  message: string;
  file: string;
  taskUid?: string;
}

export interface TaskRegistrySnapshot {
  entries: TaskRegistryEntry[];
  findings: TaskRegistryFinding[];
}

function nowIso(): string {
  return new Date().toISOString();
}

function assertTaskUid(taskUid: string): void {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(taskUid)) {
    throw new Error(`invalid task uid: ${taskUid}`);
  }
}

function registryFile(taskUid: string): string {
  assertTaskUid(taskUid);
  return path.join(taskRegistryRoot(), `${taskUid}.json`);
}

function ensureRegistryRoot(): string {
  const root = taskRegistryRoot();
  fs.mkdirSync(root, { recursive: true, mode: 0o700 });
  try {
    fs.chmodSync(root, 0o700);
  } catch {
    // Permission modes are not available on every supported filesystem.
  }
  return root;
}

function atomicWritePrivate(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temporary = `${file}.tmp-${process.pid}-${Date.now()}`;
  try {
    fs.writeFileSync(temporary, content, { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(temporary, file);
    try {
      fs.chmodSync(file, 0o600);
    } catch {
      // Permission modes are not available on every supported filesystem.
    }
  } finally {
    if (fs.existsSync(temporary)) fs.rmSync(temporary);
  }
}

function validateEntry(value: unknown, file: string): TaskRegistryEntry {
  if (!value || typeof value !== 'object') throw new Error('entry is not an object');
  const entry = value as TaskRegistryEntry;
  if (entry.registrySchemaVersion !== TASK_REGISTRY_SCHEMA_VERSION) {
    throw new Error(
      `unsupported registry schema ${String(entry.registrySchemaVersion)}; expected ${TASK_REGISTRY_SCHEMA_VERSION}`,
    );
  }
  assertTaskUid(entry.taskUid);
  if (!entry.workspace || !entry.stateFile || !entry.summaryFile || !entry.lastKnownTaskId) {
    throw new Error('entry is missing required fields');
  }
  const expectedName = `${entry.taskUid}.json`;
  if (path.basename(file) !== expectedName) throw new Error(`filename does not match task uid ${entry.taskUid}`);
  return {
    ...entry,
    workspace: path.resolve(entry.workspace),
    stateFile: path.resolve(entry.stateFile),
    summaryFile: path.resolve(entry.summaryFile),
  };
}

export function registerTask(task: RegisterableTask): TaskRegistryEntry {
  assertTaskUid(task.taskUid);
  ensureRegistryRoot();
  const workspace = path.resolve(task.workspace);
  const file = registryFile(task.taskUid);
  let registeredAt = nowIso();
  if (fs.existsSync(file)) {
    try {
      registeredAt = validateEntry(JSON.parse(fs.readFileSync(file, 'utf8')), file).registeredAt;
    } catch {
      // Re-registering an existing Task repairs an invalid entry for the same UID.
    }
  }
  const updatedAt = nowIso();
  const entry: TaskRegistryEntry = {
    registrySchemaVersion: TASK_REGISTRY_SCHEMA_VERSION,
    taskUid: task.taskUid,
    workspace,
    stateFile: path.join(workspace, '.runtime', 'state.json'),
    summaryFile: path.join(workspace, '.runtime', 'summary.json'),
    registeredAt,
    updatedAt,
    lastKnownTaskId: task.taskId,
    lastKnownRepository: task.repository ? path.resolve(task.repository) : null,
  };
  atomicWritePrivate(file, JSON.stringify(entry, null, 2) + '\n');
  return entry;
}

export function unregisterTask(taskUid: string): boolean {
  const file = registryFile(taskUid);
  if (!fs.existsSync(file)) return false;
  fs.rmSync(file);
  return true;
}

export function readTaskRegistry(): TaskRegistrySnapshot {
  const root = taskRegistryRoot();
  if (!fs.existsSync(root)) return { entries: [], findings: [] };
  const entries: TaskRegistryEntry[] = [];
  const findings: TaskRegistryFinding[] = [];
  for (const name of fs.readdirSync(root).filter((entry) => entry.endsWith('.json')).sort()) {
    const file = path.join(root, name);
    try {
      const entry = validateEntry(JSON.parse(fs.readFileSync(file, 'utf8')), file);
      entries.push(entry);
      const expectedStateFile = path.join(entry.workspace, '.runtime', 'state.json');
      const expectedSummaryFile = path.join(entry.workspace, '.runtime', 'summary.json');
      if (entry.stateFile !== expectedStateFile || entry.summaryFile !== expectedSummaryFile) {
        findings.push({
          severity: 'warn',
          code: 'registry-entry-mismatch',
          message: `registered Task paths do not match workspace ${entry.workspace}`,
          file,
          taskUid: entry.taskUid,
        });
      }
      if (!fs.existsSync(entry.stateFile)) {
        findings.push({
          severity: 'warn',
          code: 'registry-task-missing',
          message: `registered Task state is missing: ${entry.stateFile}`,
          file,
          taskUid: entry.taskUid,
        });
      }
    } catch (error) {
      findings.push({
        severity: 'error',
        code: 'registry-entry-invalid',
        message: `${path.basename(file)}: ${error instanceof Error ? error.message : String(error)}`,
        file,
      });
    }
  }
  return { entries, findings };
}

export function taskRegistration(taskUid: string): TaskRegistryEntry | null {
  const file = registryFile(taskUid);
  if (!fs.existsSync(file)) return null;
  return validateEntry(JSON.parse(fs.readFileSync(file, 'utf8')), file);
}
