import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod/v4';
import {
  abandonTask,
  blockTaskWork,
  completeTask,
  createTask,
  finishTaskWork,
  inspectTaskHealth,
  resolveArtifactPath,
  recordTaskFinding,
  setTaskCompletionEvidence,
  setTaskContext,
  startTaskWork,
  supersedeTask,
  TaskState,
  taskPaths,
  upsertTaskArtifact,
} from './core/task-runtime.js';
import {
  catalogSnapshot,
  resolveTaskReference,
  syncTaskRegistration,
  taskRegistryHealth,
  taskWorkspace,
} from './core/task-catalog.js';
import { LONGREIN_VERSION } from './version.js';

export const LONGREIN_MCP_INSTRUCTIONS =
  'Use Longrein only when a registered Task is active or the user explicitly asks to manage Tasks. Read the current Task before mutating it. Record semantic checkpoints, not tool-call logs. Never edit Runtime-owned state.json, summary.json, task.md, or timeline.md directly. If a checkpoint partially fails, read the Task before retrying; immediate identical requests are deduplicated only within this server process.';

const evidenceRefs = z.array(z.string().min(1)).max(50).optional().describe('Evidence paths or stable identifiers.');
const actor = z.string().min(1).optional().describe('Timeline actor; defaults to LONGREIN_ACTOR or agent.');
const taskReference = z.string().min(1).describe('Task workspace path, UID, or unique human-readable task id.');

const taskSnapshotSchema = z.object({
  task_uid: z.string(),
  task_id: z.string(),
  status: z.string(),
  workspace: z.string(),
  latest_event: z.string(),
  context_revision: z.number(),
  scope_revision: z.number(),
  current_work: z.object({
    now: z.string(),
    next: z.string(),
    waiting_on: z.string(),
    active_work_unit: z.string().nullable(),
  }),
});

const doctorFindingSchema = z.object({
  severity: z.enum(['error', 'warn', 'info']),
  code: z.string(),
  message: z.string(),
  fixable: z.boolean().optional(),
});

const taskListItemSchema = z.object({
  task_uid: z.string(),
  task_id: z.string(),
  status: z.string(),
  availability: z.enum(['available', 'missing', 'corrupt']),
  workspace: z.string(),
  updated_at: z.string(),
  now: z.string().nullable(),
  next: z.string().nullable(),
  error: z.string().nullable(),
});

const taskReadSchema = z.object({
  ...taskSnapshotSchema.shape,
  original_request: z.string(),
  repository: z.string().nullable(),
  refs: z.object({
    source_ref: z.string().nullable(),
    working_branch: z.string().nullable(),
    target_ref: z.string().nullable(),
  }),
  commitments: z.object({
    goal: z.array(z.string()),
    scope: z.array(z.string()),
    non_goals: z.array(z.string()),
    completion_evidence: z.array(
      z.object({
        id: z.string(),
        text: z.string(),
        status: z.enum(['pending', 'passed', 'failed', 'blocked']),
        proof: z.string().optional(),
        evidence: z.array(z.string()),
      }),
    ),
    must_preserve: z.array(z.string()),
    operating_envelope_markdown: z.string().nullable(),
    assumptions: z.array(z.string()),
  }),
  findings: z.array(
    z.object({ id: z.string(), summary: z.string(), evidence: z.array(z.string()), status: z.enum(['active', 'superseded']) }),
  ),
  artifacts: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      path: z.string(),
      status: z.enum(['planned', 'active', 'ready', 'verified', 'stale', 'superseded']),
      establishes: z.string(),
      next_consumer: z.string(),
      hash: z.string().nullable(),
      updated_at: z.string(),
    }),
  ),
  created_at: z.string(),
  updated_at: z.string(),
});

const mutationOutputSchema = z.object({
  ok: z.literal(true),
  operation: z.string(),
  task: taskSnapshotSchema,
  steps: z.array(z.object({ operation: z.string(), reference: z.string().optional() })).optional(),
});

const readOutputSchema = z.object({
  ok: z.literal(true),
  operation: z.enum(['task.list', 'task.show', 'task.doctor']),
  tasks: z.array(taskListItemSchema).optional(),
  task: taskReadSchema.optional(),
  findings: z.array(doctorFindingSchema).optional(),
});

type ToolResult = {
  content: Array<{ type: 'text'; text: string }>;
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

function compactText(value: unknown): string {
  return JSON.stringify(value);
}

function success(value: Record<string, unknown>): ToolResult {
  return {
    content: [{ type: 'text', text: compactText(value) }],
    structuredContent: value,
  };
}

function failure(operation: string, error: unknown, completedSteps: Array<Record<string, unknown>> = []): ToolResult {
  const value = {
    ok: false,
    operation,
    error: error instanceof Error ? error.message : String(error),
    completed_steps: completedSteps,
    retry: 'Read the current Task before deciding whether to retry.',
  };
  return {
    isError: true,
    content: [{ type: 'text', text: compactText(value) }],
    structuredContent: value,
  };
}

function taskSnapshot(state: TaskState): z.infer<typeof taskSnapshotSchema> {
  return {
    task_uid: state.taskUid,
    task_id: state.taskId,
    status: state.status,
    workspace: state.workspace,
    latest_event: state.latestEvent,
    context_revision: state.contextRevision,
    scope_revision: state.scopeRevision,
    current_work: {
      now: state.currentWork.now,
      next: state.currentWork.next,
      waiting_on: state.currentWork.waitingOn,
      active_work_unit: state.currentWork.active?.id ?? null,
    },
  };
}

function taskReadProjection(state: TaskState): z.infer<typeof taskReadSchema> {
  return {
    ...taskSnapshot(state),
    original_request: state.originalRequest,
    repository: state.repository,
    refs: {
      source_ref: state.refs.sourceRef,
      working_branch: state.refs.workingBranch,
      target_ref: state.refs.targetRef,
    },
    commitments: {
      goal: state.commitments.goal,
      scope: state.commitments.scope,
      non_goals: state.commitments.nonGoals,
      completion_evidence: state.commitments.completionEvidence,
      must_preserve: state.commitments.mustPreserve,
      operating_envelope_markdown: state.commitments.operatingEnvelopeMarkdown,
      assumptions: state.commitments.assumptions,
    },
    findings: state.findings,
    artifacts: state.artifacts.map((artifact) => ({
      id: artifact.id,
      type: artifact.artifactType,
      path: artifact.path,
      status: artifact.status,
      establishes: artifact.establishes,
      next_consumer: artifact.nextConsumer,
      hash: artifact.hash,
      updated_at: artifact.updatedAt,
    })),
    created_at: state.createdAt,
    updated_at: state.updatedAt,
  };
}

function mutateAndRegister(action: () => TaskState): TaskState {
  const state = action();
  try {
    syncTaskRegistration(state);
  } catch (error) {
    throw new Error(
      `Task state changed at ${state.workspace}, but registry sync failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  return state;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

const DEDUPE_WINDOW_MS = 10_000;
const DEDUPE_LIMIT = 256;
const recent = new Map<string, { at: number; result: Promise<ToolResult> }>();

function deduplicated(name: string, input: unknown, action: () => Promise<ToolResult> | ToolResult): Promise<ToolResult> {
  const now = Date.now();
  for (const [key, value] of recent) {
    if (now - value.at > DEDUPE_WINDOW_MS) recent.delete(key);
  }
  const key = `${name}:${canonical(input)}`;
  const existing = recent.get(key);
  if (existing) return existing.result;
  const result = Promise.resolve().then(action);
  recent.set(key, { at: now, result });
  while (recent.size > DEDUPE_LIMIT) recent.delete(recent.keys().next().value!);
  return result;
}

function mutationHandler<T>(name: string, action: (input: T) => TaskState) {
  return async (input: T): Promise<ToolResult> => {
    try {
      const state = action(input);
      return success({ ok: true, operation: name, task: taskSnapshot(state) });
    } catch (error) {
      return failure(name, error);
    }
  };
}

export function createLongreinMcpServer(): McpServer {
  const server = new McpServer(
    { name: 'longrein', version: LONGREIN_VERSION },
    { instructions: LONGREIN_MCP_INSTRUCTIONS },
  );

  server.registerTool(
    'longrein_task_read',
    {
      title: 'Read Longrein Tasks',
      description: 'List registered Tasks, read one current Task, or inspect its Runtime consistency.',
      inputSchema: {
        action: z.enum(['list', 'show', 'doctor']).describe('Read operation to perform.'),
        task: taskReference.optional().describe('Required for show and doctor; omit for list.'),
      },
      outputSchema: readOutputSchema,
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    ({ action, task }) => {
      try {
        if (action === 'list') {
          const snapshot = catalogSnapshot();
          return success({
            ok: true,
            operation: 'task.list',
            tasks: snapshot.tasks.map((item) => ({
              task_uid: item.registration.taskUid,
              task_id: item.summary?.taskId ?? item.registration.lastKnownTaskId,
              status: item.summary?.status ?? item.availability,
              availability: item.availability,
              workspace: item.registration.workspace,
              updated_at: item.summary?.updatedAt ?? item.registration.updatedAt,
              now: item.summary?.currentWork.now ?? null,
              next: item.summary?.currentWork.next ?? null,
              error: item.error,
            })),
            findings: snapshot.findings,
          });
        }
        if (!task) return failure(`task.${action}`, 'task is required for show and doctor');
        if (action === 'show') {
          return success({ ok: true, operation: 'task.show', task: taskReadProjection(resolveTaskReference(task)) });
        }
        const workspace = taskWorkspace(task);
        return success({
          ok: true,
          operation: 'task.doctor',
          findings: [...inspectTaskHealth(workspace), ...taskRegistryHealth(workspace)],
        });
      } catch (error) {
        return failure(`task.${action}`, error);
      }
    },
  );

  server.registerTool(
    'longrein_task_create',
    {
      title: 'Create Longrein Task',
      description: 'Create and globally register a new Runtime-owned Task workspace.',
      inputSchema: {
        directory: z.string().min(1).describe('New Task workspace directory.'),
        task_id: z.string().min(1).describe('Stable human-readable Task id.'),
        request: z.string().min(1).describe('Original user request.'),
        repository: z.string().min(1).optional().describe('Associated Git worktree.'),
        source_ref: z.string().optional(),
        working_branch: z.string().optional(),
        target_ref: z.string().optional(),
        actor,
      },
      outputSchema: mutationOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    mutationHandler('task.create', (input) =>
      mutateAndRegister(() =>
        createTask({
          directory: input.directory,
          taskId: input.task_id,
          request: input.request,
          repository: input.repository,
          sourceRef: input.source_ref,
          workingBranch: input.working_branch,
          targetRef: input.target_ref,
          actor: input.actor,
        }),
      ),
    ),
  );

  server.registerTool(
    'longrein_task_context',
    {
      title: 'Set Longrein Task Context',
      description: 'Establish or revise the authoritative Task Context and current work direction.',
      inputSchema: {
        task: taskReference,
        summary: z.string().min(1).describe('Timeline summary for this context change.'),
        decision: z.string().regex(/^UD-\d{3,}$/).optional().describe('Required when replacing established commitments.'),
        goal: z.array(z.string().min(1)).max(50).optional(),
        scope: z.array(z.string().min(1)).max(50).optional(),
        non_goals: z.array(z.string().min(1)).max(50).optional(),
        completion_evidence: z.array(z.string().min(1)).max(50).optional(),
        must_preserve: z.array(z.string().min(1)).max(50).optional(),
        assumptions: z.array(z.string().min(1)).max(50).optional(),
        operating_envelope_markdown: z.string().nullable().optional(),
        source_ref: z.string().nullable().optional(),
        working_branch: z.string().nullable().optional(),
        target_ref: z.string().nullable().optional(),
        status: z.enum(['shaping', 'ready']).optional(),
        now: z.string().optional(),
        next: z.string().optional(),
        waiting_on: z.string().optional(),
        evidence: evidenceRefs,
        actor,
      },
      outputSchema: mutationOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    mutationHandler('task.context', (input) =>
      mutateAndRegister(() =>
        setTaskContext(taskWorkspace(input.task), {
          summary: input.summary,
          decision: input.decision,
          goal: input.goal,
          scope: input.scope,
          nonGoals: input.non_goals,
          completionEvidence: input.completion_evidence,
          mustPreserve: input.must_preserve,
          assumptions: input.assumptions,
          operatingEnvelopeMarkdown: input.operating_envelope_markdown,
          sourceRef: input.source_ref,
          workingBranch: input.working_branch,
          targetRef: input.target_ref,
          status: input.status,
          now: input.now,
          next: input.next,
          waitingOn: input.waiting_on,
          evidence: input.evidence,
          actor: input.actor,
        }),
      ),
    ),
  );

  server.registerTool(
    'longrein_work_start',
    {
      title: 'Start Longrein Work Unit',
      description: 'Start a recoverable Task work unit and capture its repository baseline.',
      inputSchema: {
        task: taskReference,
        now: z.string().min(1).describe('Work being performed now.'),
        next: z.string().optional(),
        evidence: evidenceRefs,
        actor,
      },
      outputSchema: mutationOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    mutationHandler('task.work.start', (input) =>
      mutateAndRegister(() =>
        startTaskWork(taskWorkspace(input.task), {
          now: input.now,
          next: input.next,
          evidence: input.evidence,
          actor: input.actor,
        }),
      ),
    ),
  );

  const artifactInput = z.object({
    type: z.string().regex(/^[a-z][a-z0-9.-]*$/),
    path: z.string().min(1),
    status: z.enum(['planned', 'active', 'ready', 'verified', 'stale', 'superseded']),
    establishes: z.string().min(1),
    next_consumer: z.string().min(1),
    evidence: evidenceRefs,
  });
  const verificationInput = z.object({
    evidence_id: z.string().regex(/^CE-\d{3,}$/),
    status: z.enum(['pending', 'passed', 'failed', 'blocked']),
    proof: z.string().optional(),
    evidence: evidenceRefs,
  });

  server.registerTool(
    'longrein_checkpoint',
    {
      title: 'Record Longrein Checkpoint',
      description: 'Record one semantic checkpoint: findings, artifacts and verification, then optionally finish or block active work.',
      inputSchema: {
        task: taskReference,
        findings: z.array(z.object({ summary: z.string().min(1), evidence: evidenceRefs })).max(20).optional(),
        artifacts: z.array(artifactInput).max(20).optional(),
        verification: z.array(verificationInput).max(20).optional(),
        finish: z
          .object({
            result: z.string().min(1),
            now: z.string().optional(),
            next: z.string().optional(),
            status: z.enum(['ready', 'verifying']).optional(),
            evidence: evidenceRefs,
          })
          .optional(),
        block: z
          .object({
            reason: z.string().min(1),
            waiting_on: z.string().optional(),
            next: z.string().optional(),
            evidence: evidenceRefs,
          })
          .optional(),
        actor,
      },
      outputSchema: mutationOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
    },
    (input) =>
      deduplicated('task.checkpoint', input, () => {
        const completed: Array<{ operation: string; reference?: string }> = [];
        let state: TaskState | undefined;
        try {
          if (input.finish && input.block) throw new Error('finish and block are mutually exclusive');
          if (!input.findings?.length && !input.artifacts?.length && !input.verification?.length && !input.finish && !input.block) {
            throw new Error('checkpoint must contain at least one semantic update');
          }
          const workspace = taskWorkspace(input.task);
          for (const finding of input.findings ?? []) {
            state = mutateAndRegister(() =>
              recordTaskFinding(workspace, { summary: finding.summary, evidence: finding.evidence, actor: input.actor }),
            );
            completed.push({ operation: 'task.finding', reference: state.findings.at(-1)?.id });
          }
          for (const artifact of input.artifacts ?? []) {
            state = mutateAndRegister(() =>
              upsertTaskArtifact(workspace, {
                artifactType: artifact.type,
                artifactPath: artifact.path,
                status: artifact.status,
                establishes: artifact.establishes,
                nextConsumer: artifact.next_consumer,
                evidence: artifact.evidence,
                actor: input.actor,
              }),
            );
            const paths = taskPaths(workspace);
            const artifactTarget = resolveArtifactPath(paths, artifact.path);
            completed.push({
              operation: 'task.artifact',
              reference: state.artifacts.find((item) => resolveArtifactPath(paths, item.path) === artifactTarget)?.id,
            });
          }
          for (const verification of input.verification ?? []) {
            state = mutateAndRegister(() =>
              setTaskCompletionEvidence(workspace, verification.evidence_id, {
                status: verification.status,
                proof: verification.proof,
                evidence: verification.evidence,
                actor: input.actor,
              }),
            );
            completed.push({ operation: 'task.evidence', reference: verification.evidence_id });
          }
          if (input.finish) {
            state = mutateAndRegister(() =>
              finishTaskWork(workspace, {
                result: input.finish!.result,
                now: input.finish!.now,
                next: input.finish!.next,
                status: input.finish!.status,
                evidence: input.finish!.evidence,
                actor: input.actor,
              }),
            );
            completed.push({ operation: 'task.work.finish' });
          } else if (input.block) {
            state = mutateAndRegister(() =>
              blockTaskWork(workspace, {
                reason: input.block!.reason,
                waitingOn: input.block!.waiting_on,
                next: input.block!.next,
                evidence: input.block!.evidence,
                actor: input.actor,
              }),
            );
            completed.push({ operation: 'task.work.block' });
          }
          state ??= resolveTaskReference(input.task);
          return success({ ok: true, operation: 'task.checkpoint', task: taskSnapshot(state), steps: completed });
        } catch (error) {
          return failure('task.checkpoint', error, completed);
        }
      }),
  );

  server.registerTool(
    'longrein_task_close',
    {
      title: 'Close Longrein Task',
      description: 'Complete, abandon, or supersede an open Task with an explicit terminal reason.',
      inputSchema: {
        task: taskReference,
        action: z.enum(['complete', 'abandon', 'supersede']),
        summary: z.string().min(1),
        superseded_by: taskReference.optional().describe('Required only for supersede.'),
        evidence: evidenceRefs,
        actor,
      },
      outputSchema: mutationOutputSchema,
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: false, openWorldHint: false },
    },
    mutationHandler('task.close', (input) => {
      const workspace = taskWorkspace(input.task);
      if (input.action === 'complete') {
        return mutateAndRegister(() => completeTask(workspace, { summary: input.summary, evidence: input.evidence, actor: input.actor }));
      }
      if (input.action === 'abandon') {
        return mutateAndRegister(() => abandonTask(workspace, { summary: input.summary, evidence: input.evidence, actor: input.actor }));
      }
      if (!input.superseded_by) throw new Error('superseded_by is required for supersede');
      const replacement = resolveTaskReference(input.superseded_by);
      const current = resolveTaskReference(input.task);
      if (replacement.taskUid === current.taskUid) throw new Error('a Task cannot supersede itself');
      return mutateAndRegister(() =>
        supersedeTask(workspace, {
          summary: input.summary,
          supersededBy: replacement.taskUid,
          evidence: input.evidence,
          actor: input.actor,
        }),
      );
    }),
  );

  return server;
}

export async function runLongreinMcpServer(): Promise<void> {
  const server = createLongreinMcpServer();
  await server.connect(new StdioServerTransport());
}
