// Contract types mirrored from cli/src/core/*.ts. The dashboard backend serves
// these shapes verbatim; keep them structural-only (no runtime code) here.

export type TaskStatus =
  | 'shaping'
  | 'ready'
  | 'working'
  | 'waiting'
  | 'blocked'
  | 'verifying'
  | 'complete'
  | 'abandoned'
  | 'superseded';

export type CompletionStatus = 'pending' | 'passed' | 'failed' | 'blocked';
export type ArtifactStatus = 'planned' | 'active' | 'ready' | 'verified' | 'stale' | 'superseded';
export type Availability = 'available' | 'missing' | 'corrupt';

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

export type TaskEventKind =
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

export interface TaskEvent {
  id: string;
  at: string;
  actor: string;
  kind: TaskEventKind;
  summary: string;
  details?: string;
  evidence: string[];
  contextRevision: number;
  scopeRevision: number;
}

export interface CurrentWork {
  now: string;
  next: string;
  waitingOn: string;
  active: null | {
    id: string;
    actor: string;
    startedAt: string;
    repositoryBaseline: RepositorySnapshot | null;
  };
}

export interface Refs {
  sourceRef: string | null;
  workingBranch: string | null;
  targetRef: string | null;
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
  refs: Refs;
  commitments: {
    goal: string[];
    scope: string[];
    nonGoals: string[];
    completionEvidence: CompletionEvidence[];
    mustPreserve: string[];
    operatingEnvelopeMarkdown: string | null;
    assumptions: string[];
  };
  currentWork: CurrentWork;
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
  refs: Refs;
  contextRevision: number;
  scopeRevision: number;
  currentWork: CurrentWork;
  completion: Record<CompletionStatus | 'total', number>;
  artifacts: Record<ArtifactStatus | 'total', number>;
  activeFindings: number;
  latestEvent: string;
  createdAt: string;
  updatedAt: string;
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

export interface RegistryFinding {
  severity: 'error' | 'warn';
  code: string;
  message: string;
  file: string;
  taskUid?: string;
}

export interface CatalogTask {
  registration: TaskRegistryEntry;
  availability: Availability;
  summary: TaskSummaryProjection | null;
  error: string | null;
}

export interface CatalogSnapshot {
  generatedAt: string;
  tasks: CatalogTask[];
  findings: RegistryFinding[];
}

export interface TaskDetailResponse {
  registration: TaskRegistryEntry;
  state: TaskState;
}

export interface DoctorFinding {
  severity: 'error' | 'warn' | 'info';
  code: string;
  message: string;
  fixable?: boolean;
}

export interface TaskHealthResponse {
  taskUid: string;
  findings: DoctorFinding[];
}

export interface MetaResponse {
  apiVersion: number;
  readOnly: boolean;
  localActions: {
    openPath: boolean;
    reveal: boolean;
  };
  maxArtifactPreviewBytes: number;
}

export type OpenTarget = 'workspace' | 'repository';
export type OpenApplication = 'finder' | 'vscode' | 'terminal';
export type RevealApplication = 'vscode' | 'finder';

export interface OpenPathResponse {
  taskUid: string;
  target: OpenTarget;
  application: OpenApplication;
  path: string;
}

export interface RevealResponse {
  taskUid: string;
  application: RevealApplication;
  path: string;
  line: number | null;
}

export interface ArtifactContentResponse {
  artifact: TaskArtifact;
  preview: string | null;
  previewStatus: 'ready' | 'binary' | 'too-large';
  size: number;
  maxPreviewBytes?: number;
}
