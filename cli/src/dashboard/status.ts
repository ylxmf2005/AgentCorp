import type { ArtifactStatus, Availability, CompletionStatus, TaskStatus } from './types';

export type Tone = 'accent' | 'info' | 'ok' | 'warn' | 'danger' | 'neutral' | 'muted';

interface StatusMeta {
  label: string;
  tone: Tone;
  // Live statuses pulse to signal active motion; terminal & idle stay static.
  pulse: boolean;
}

export const TASK_STATUS_META: Record<TaskStatus, StatusMeta> = {
  shaping: { label: 'Shaping', tone: 'info', pulse: true },
  ready: { label: 'Ready', tone: 'neutral', pulse: false },
  working: { label: 'Working', tone: 'accent', pulse: true },
  waiting: { label: 'Waiting', tone: 'warn', pulse: true },
  blocked: { label: 'Blocked', tone: 'danger', pulse: false },
  verifying: { label: 'Verifying', tone: 'ok', pulse: true },
  complete: { label: 'Complete', tone: 'ok', pulse: false },
  abandoned: { label: 'Abandoned', tone: 'muted', pulse: false },
  superseded: { label: 'Superseded', tone: 'muted', pulse: false },
};

// Order used for sorting and for the segmented overview filter.
export const TASK_STATUS_ORDER: TaskStatus[] = [
  'working',
  'verifying',
  'blocked',
  'waiting',
  'ready',
  'shaping',
  'complete',
  'abandoned',
  'superseded',
];

export const AVAILABILITY_META: Record<Availability, StatusMeta> = {
  available: { label: 'Available', tone: 'ok', pulse: false },
  missing: { label: 'Missing', tone: 'danger', pulse: false },
  corrupt: { label: 'Corrupt', tone: 'danger', pulse: false },
};

export const COMPLETION_META: Record<CompletionStatus, StatusMeta> = {
  pending: { label: 'Pending', tone: 'neutral', pulse: false },
  passed: { label: 'Passed', tone: 'ok', pulse: false },
  failed: { label: 'Failed', tone: 'danger', pulse: false },
  blocked: { label: 'Blocked', tone: 'warn', pulse: false },
};

export const ARTIFACT_STATUS_META: Record<ArtifactStatus, StatusMeta> = {
  planned: { label: 'Planned', tone: 'muted', pulse: false },
  active: { label: 'Active', tone: 'accent', pulse: false },
  ready: { label: 'Ready', tone: 'info', pulse: false },
  verified: { label: 'Verified', tone: 'ok', pulse: false },
  stale: { label: 'Stale', tone: 'warn', pulse: false },
  superseded: { label: 'Superseded', tone: 'muted', pulse: false },
};

export type Severity = 'error' | 'warn' | 'info';
export const SEVERITY_META: Record<Severity, StatusMeta> = {
  error: { label: 'Error', tone: 'danger', pulse: false },
  warn: { label: 'Warning', tone: 'warn', pulse: false },
  info: { label: 'Info', tone: 'info', pulse: false },
};

const EVENT_KIND_LABELS: Record<string, string> = {
  task_created: 'Task created',
  context_established: 'Context established',
  context_changed: 'Context changed',
  scope_changed: 'Scope changed',
  work_started: 'Work started',
  work_finished: 'Work finished',
  work_blocked: 'Work blocked',
  finding_recorded: 'Finding recorded',
  artifact_published: 'Artifact published',
  artifact_updated: 'Artifact updated',
  verification_recorded: 'Verification recorded',
  task_completed: 'Task completed',
  task_abandoned: 'Task abandoned',
  task_superseded: 'Task superseded',
};

export function eventKindLabel(kind: string): string {
  return EVENT_KIND_LABELS[kind] ?? kind.replaceAll('_', ' ');
}
