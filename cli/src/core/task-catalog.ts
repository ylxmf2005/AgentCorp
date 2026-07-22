import fs from 'node:fs';
import path from 'node:path';
import {
  DoctorFinding,
  loadTaskState,
  loadTaskSummary,
  taskPaths,
  taskSummaryProjection,
  TaskState,
  TaskSummaryProjection,
} from './task-runtime.js';
import {
  readTaskRegistry,
  registerTask,
  taskRegistration,
  TaskRegistryEntry,
  TaskRegistryFinding,
} from './task-registry.js';

export interface CatalogTask {
  registration: TaskRegistryEntry;
  availability: 'available' | 'missing' | 'corrupt';
  summary: TaskSummaryProjection | null;
  error: string | null;
}

export interface CatalogSnapshot {
  generatedAt: string;
  tasks: CatalogTask[];
  findings: TaskRegistryFinding[];
}

function looksLikePath(reference: string): boolean {
  return (
    path.isAbsolute(reference) ||
    reference.startsWith('.') ||
    reference.includes(path.sep) ||
    reference === 'task.md' ||
    reference === 'state.json'
  );
}

function stateForRegistration(entry: TaskRegistryEntry): TaskState {
  const state = loadTaskState(entry.stateFile);
  if (state.taskUid !== entry.taskUid) {
    throw new Error(`registry UID ${entry.taskUid} does not match Task UID ${state.taskUid}`);
  }
  return state;
}

export function syncTaskRegistration(state: TaskState): TaskRegistryEntry {
  return registerTask(state);
}

export function catalogSnapshot(): CatalogSnapshot {
  const registry = readTaskRegistry();
  const tasks = registry.entries.map((entry): CatalogTask => {
    if (!fs.existsSync(entry.stateFile)) {
      return { registration: entry, availability: 'missing', summary: null, error: `state missing: ${entry.stateFile}` };
    }
    try {
      const state = stateForRegistration(entry);
      const expectedSummary = taskSummaryProjection(state);
      let summary: TaskSummaryProjection;
      try {
        summary = loadTaskSummary(entry.summaryFile);
        if (JSON.stringify(summary) !== JSON.stringify(expectedSummary)) {
          throw new Error('summary does not match current Task state');
        }
      } catch {
        summary = expectedSummary;
      }
      return { registration: entry, availability: 'available', summary, error: null };
    } catch (error) {
      return {
        registration: entry,
        availability: 'corrupt',
        summary: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  });
  tasks.sort((a, b) => {
    const aTime = a.summary?.updatedAt ?? a.registration.updatedAt;
    const bTime = b.summary?.updatedAt ?? b.registration.updatedAt;
    return bTime.localeCompare(aTime);
  });
  return { generatedAt: new Date().toISOString(), tasks, findings: registry.findings };
}

export function resolveTaskReference(reference: string): TaskState {
  if (looksLikePath(reference) || fs.existsSync(reference)) return loadTaskState(reference);

  const registry = readTaskRegistry();
  const exactUid = registry.entries.find((entry) => entry.taskUid === reference);
  if (exactUid) return stateForRegistration(exactUid);

  const matchingIds = registry.entries.filter((entry) => entry.lastKnownTaskId === reference);
  if (matchingIds.length === 1) return stateForRegistration(matchingIds[0]);
  if (matchingIds.length > 1) {
    const candidates = matchingIds.map((entry) => `${entry.taskUid} (${entry.workspace})`).join(', ');
    throw new Error(`task id "${reference}" is ambiguous; use a UID or path: ${candidates}`);
  }

  throw new Error(`Task not found in the Longrein registry: ${reference}`);
}

export function taskWorkspace(reference: string): string {
  return resolveTaskReference(reference).workspace;
}

export function taskRegistryHealth(reference: string): DoctorFinding[] {
  let state: TaskState;
  try {
    state = resolveTaskReference(reference);
  } catch (error) {
    return [{ severity: 'error', code: 'registry-task-unavailable', message: error instanceof Error ? error.message : String(error) }];
  }
  let entry: TaskRegistryEntry | null;
  try {
    entry = taskRegistration(state.taskUid);
  } catch (error) {
    return [{ severity: 'error', code: 'registry-entry-invalid', message: error instanceof Error ? error.message : String(error) }];
  }
  if (!entry) {
    return [
      {
        severity: 'warn',
        code: 'task-unregistered',
        message: `Task ${state.taskUid} is not registered under the current Longrein home`,
        fixable: true,
      },
    ];
  }
  const findings: DoctorFinding[] = [];
  const expected = taskPaths(state.workspace);
  if (
    path.resolve(entry.workspace) !== expected.workspace ||
    path.resolve(entry.stateFile) !== expected.stateFile ||
    path.resolve(entry.summaryFile) !== expected.summaryFile
  ) {
    findings.push({
      severity: 'warn',
      code: 'registry-entry-mismatch',
      message: `registry entry points to ${entry.workspace}, but Task state owns ${state.workspace}`,
      fixable: true,
    });
  }
  return findings;
}
