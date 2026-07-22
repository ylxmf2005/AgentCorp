import fs from 'node:fs';
import { Command, OptionValues } from 'commander';
import pc from 'picocolors';
import {
  abandonTask,
  blockTaskWork,
  completeTask,
  createTask,
  finishTaskWork,
  fixTaskViews,
  inspectTaskHealth,
  loadTaskState,
  recordTaskFinding,
  setTaskCompletionEvidence,
  setTaskContext,
  startTaskWork,
  supersedeTask,
  TASK_STATUSES,
  taskSummary,
  TaskState,
  upsertTaskArtifact,
} from './core/task-runtime.js';
import {
  catalogSnapshot,
  resolveTaskReference,
  syncTaskRegistration,
  taskRegistryHealth,
  taskWorkspace,
} from './core/task-catalog.js';
import { unregisterTask as unregisterTaskRegistration } from './core/task-registry.js';

function collect(value: string, previous: string[] | undefined): string[] {
  return [...(previous ?? []), value];
}

function looksLikeTaskUid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function optionalFile(file: string | undefined): string | null | undefined {
  if (file === undefined) return undefined;
  if (file === '-') return fs.readFileSync(0, 'utf8');
  return fs.readFileSync(file, 'utf8');
}

function run(action: () => void): void {
  try {
    action();
  } catch (error) {
    console.error(pc.red(`error: ${error instanceof Error ? error.message : String(error)}`));
    process.exitCode = 1;
  }
}

function mutateAndRegister(action: () => TaskState): TaskState {
  const state = action();
  try {
    syncTaskRegistration(state);
  } catch (error) {
    throw new Error(
      `Task state was updated at ${state.workspace}, but Registry sync failed: ${error instanceof Error ? error.message : String(error)}. Repair it with longrein task register ${state.workspace}.`,
    );
  }
  return state;
}

function evidenceOptions(command: Command): Command {
  return command
    .option('--actor <name>', 'actor recorded in timeline.md')
    .option('--evidence-ref <reference>', 'evidence path or identifier (repeatable)', collect);
}

function printMutationResult(
  operation: string,
  state: TaskState,
  extra: Record<string, unknown> = {},
): void {
  console.log(
    JSON.stringify({
      ok: true,
      operation,
      task_uid: state.taskUid,
      task_id: state.taskId,
      status: state.status,
      latest_event: state.latestEvent,
      ...extra,
    }),
  );
}

function printFindings(
  findings: Array<{ severity: 'error' | 'warn' | 'info'; code: string; message: string }>,
): void {
  if (findings.length === 0) {
    console.log(pc.green('✓ no problems found'));
    return;
  }
  for (const finding of findings) {
    const label =
      finding.severity === 'error'
        ? pc.red('error')
        : finding.severity === 'warn'
          ? pc.yellow('warn ')
          : pc.cyan('info ');
    console.log(`${label} ${finding.code}: ${finding.message}`);
  }
}

export function registerTaskCommands(program: Command): void {
  const task = program.command('task').description('create, register, inspect and update persistent Longrein Tasks');

  task
    .command('create <directory>')
    .description('create and globally register a Runtime-owned Task')
    .requiredOption('--id <task-id>', 'human-readable task id')
    .requiredOption('--request <text>', 'original user request')
    .option('--repository <path>', 'repository associated with the task')
    .option('--source-ref <ref>', 'intended source ref')
    .option('--working-branch <branch>', 'intended working branch')
    .option('--target-ref <ref>', 'intended target ref')
    .option('--actor <name>', 'actor recorded in timeline.md')
    .action((directory: string, opts: OptionValues) =>
      run(() => {
        const state = mutateAndRegister(() =>
          createTask({
            directory,
            taskId: opts.id,
            request: opts.request,
            repository: opts.repository,
            sourceRef: opts.sourceRef,
            workingBranch: opts.workingBranch,
            targetRef: opts.targetRef,
            actor: opts.actor,
          }),
        );
        printMutationResult('task.create', state, { workspace: state.workspace });
      }),
    );

  task
    .command('list')
    .description('list every Task registered under the current Longrein home')
    .option('--json', 'print the catalog as JSON', false)
    .action((opts: OptionValues) =>
      run(() => {
        const snapshot = catalogSnapshot();
        if (opts.json) {
          console.log(JSON.stringify(snapshot, null, 2));
          return;
        }
        if (snapshot.tasks.length === 0) {
          console.log(pc.dim('No registered Tasks.'));
        } else {
          for (const item of snapshot.tasks) {
            const status = item.summary?.status ?? item.availability;
            const id = item.summary?.taskId ?? item.registration.lastKnownTaskId;
            const updated = item.summary?.updatedAt ?? item.registration.updatedAt;
            console.log(`${item.registration.taskUid}\t${status}\t${updated}\t${id}\t${item.registration.workspace}`);
          }
        }
        for (const finding of snapshot.findings) {
          console.error(pc.yellow(`warn ${finding.code}: ${finding.message}`));
        }
      }),
    );

  task
    .command('register <task-path>')
    .description('register or repair a current-schema Task from its workspace path')
    .action((taskPath: string) =>
      run(() => {
        const state = resolveTaskReference(taskPath);
        const entry = syncTaskRegistration(state);
        console.log(
          JSON.stringify({
            ok: true,
            operation: 'task.register',
            task_uid: entry.taskUid,
            workspace: entry.workspace,
          }),
        );
      }),
    );

  task
    .command('unregister <task>')
    .description('remove a Task from the global registry without deleting its workspace')
    .action((taskRef: string) =>
      run(() => {
        let taskUid = taskRef;
        try {
          taskUid = resolveTaskReference(taskRef).taskUid;
        } catch (error) {
          if (!looksLikeTaskUid(taskRef)) throw error;
        }
        const removed = unregisterTaskRegistration(taskUid);
        console.log(
          JSON.stringify({
            ok: true,
            operation: 'task.unregister',
            task_uid: taskUid,
            changed: removed,
          }),
        );
      }),
    );

  const registry = task.command('registry').description('inspect the global Task registry');
  registry
    .command('doctor')
    .description('check registry entries, generated summaries and registered Task health')
    .option('--json', 'print findings as JSON', false)
    .action((opts: OptionValues) =>
      run(() => {
        const snapshot = catalogSnapshot();
        const findings: Array<{ severity: 'error' | 'warn' | 'info'; code: string; message: string }> = [
          ...snapshot.findings,
        ];
        for (const item of snapshot.tasks) {
          if (item.availability !== 'available') {
            findings.push({
              severity: item.availability === 'missing' ? 'warn' : 'error',
              code: `registry-task-${item.availability}`,
              message: `${item.registration.taskUid}: ${item.error}`,
            });
            continue;
          }
          findings.push(...inspectTaskHealth(item.registration.stateFile));
          findings.push(...taskRegistryHealth(item.registration.stateFile));
        }
        if (opts.json) console.log(JSON.stringify(findings, null, 2));
        else printFindings(findings);
        if (findings.some((finding) => finding.severity === 'error' || finding.severity === 'warn')) {
          process.exitCode = 1;
        }
      }),
    );

  const context = evidenceOptions(
    task
      .command('context <task>')
      .description('establish or revise Task Context through the Runtime')
      .requiredOption('--summary <text>', 'timeline summary for this context change')
      .option('--decision <UD-###>', 'required when replacing established commitments')
      .option('--goal <item>', 'goal item (repeatable)', collect)
      .option('--scope <item>', 'scope item (repeatable)', collect)
      .option('--non-goal <item>', 'non-goal item (repeatable)', collect)
      .option('--completion <item>', 'completion evidence item (repeatable)', collect)
      .option('--preserve <item>', 'must-preserve item (repeatable)', collect)
      .option('--assumption <item>', 'assumption or evidence gap (repeatable)', collect)
      .option('--envelope-file <path>', 'Markdown body for Task Operating Envelope; use - for stdin')
      .option('--source-ref <ref>', 'intended source ref')
      .option('--working-branch <branch>', 'intended working branch')
      .option('--target-ref <ref>', 'intended target ref')
      .option('--status <status>', 'set shaping or ready')
      .option('--now <text>', 'current work after applying this context')
      .option('--next <text>', 'next work after applying this context')
      .option('--waiting-on <text>', 'person or external condition currently awaited'),
  );
  context.action((taskRef: string, opts: OptionValues) =>
    run(() => {
      if (opts.status && !['shaping', 'ready'].includes(opts.status)) {
        throw new Error('context --status must be shaping or ready');
      }
      const state = mutateAndRegister(() =>
        setTaskContext(taskWorkspace(taskRef), {
          summary: opts.summary,
          actor: opts.actor,
          decision: opts.decision,
          evidence: opts.evidenceRef,
          goal: opts.goal,
          scope: opts.scope,
          nonGoals: opts.nonGoal,
          completionEvidence: opts.completion,
          mustPreserve: opts.preserve,
          assumptions: opts.assumption,
          operatingEnvelopeMarkdown: optionalFile(opts.envelopeFile),
          sourceRef: opts.sourceRef,
          workingBranch: opts.workingBranch,
          targetRef: opts.targetRef,
          status: opts.status,
          now: opts.now,
          next: opts.next,
          waitingOn: opts.waitingOn,
        }),
      );
      printMutationResult('task.context', state);
    }),
  );

  const work = task.command('work').description('record explicit work-unit boundaries without hooks');

  evidenceOptions(
    work
      .command('start <task>')
      .description('start one work unit and capture its repository baseline')
      .requiredOption('--now <text>', 'work being performed now')
      .option('--next <text>', 'expected next action'),
  ).action((taskRef: string, opts: OptionValues) =>
    run(() => {
      const state = mutateAndRegister(() =>
        startTaskWork(taskWorkspace(taskRef), {
          now: opts.now,
          next: opts.next,
          actor: opts.actor,
          evidence: opts.evidenceRef,
        }),
      );
      printMutationResult('task.work.start', state);
    }),
  );

  evidenceOptions(
    work
      .command('finish <task>')
      .description('finish the active work unit and reconcile repository changes')
      .requiredOption('--result <text>', 'observable result of the work unit')
      .option('--now <text>', 'current action after finishing; defaults to none')
      .option('--next <text>', 'next action')
      .option('--status <status>', 'ready or verifying', 'ready'),
  ).action((taskRef: string, opts: OptionValues) =>
    run(() => {
      if (!['ready', 'verifying'].includes(opts.status)) throw new Error('work finish --status must be ready or verifying');
      const state = mutateAndRegister(() =>
        finishTaskWork(taskWorkspace(taskRef), {
          result: opts.result,
          now: opts.now,
          next: opts.next,
          status: opts.status,
          actor: opts.actor,
          evidence: opts.evidenceRef,
        }),
      );
      printMutationResult('task.work.finish', state);
    }),
  );

  evidenceOptions(
    work
      .command('block <task>')
      .description('end the active work unit as blocked or waiting')
      .requiredOption('--reason <text>', 'why progress cannot safely continue')
      .option('--waiting-on <text>', 'person or external condition being awaited')
      .option('--next <text>', 'next action after the blocker clears'),
  ).action((taskRef: string, opts: OptionValues) =>
    run(() => {
      const state = mutateAndRegister(() =>
        blockTaskWork(taskWorkspace(taskRef), {
          reason: opts.reason,
          waitingOn: opts.waitingOn,
          next: opts.next,
          actor: opts.actor,
          evidence: opts.evidenceRef,
        }),
      );
      printMutationResult('task.work.block', state);
    }),
  );

  evidenceOptions(
    task
      .command('finding <task>')
      .description('record a confirmed finding that changes subsequent judgment')
      .requiredOption('--summary <text>', 'confirmed finding'),
  ).action((taskRef: string, opts: OptionValues) =>
    run(() => {
      const state = mutateAndRegister(() =>
        recordTaskFinding(taskWorkspace(taskRef), {
          summary: opts.summary,
          evidence: opts.evidenceRef,
          actor: opts.actor,
        }),
      );
      printMutationResult('task.finding', state);
    }),
  );

  evidenceOptions(
    task
      .command('artifact <task>')
      .description('publish or refresh an Artifact Map entry and its content hash')
      .requiredOption('--type <artifact-type>', 'stable type such as shape.design, review.report or evidence')
      .requiredOption('--path <path>', 'artifact path, relative to the Task workspace or absolute')
      .requiredOption('--status <status>', 'planned, active, ready, verified, stale or superseded')
      .requiredOption('--establishes <text>', 'what this artifact establishes')
      .requiredOption('--next-consumer <text>', 'who should read it next'),
  ).action((taskRef: string, opts: OptionValues) =>
    run(() => {
      const state = mutateAndRegister(() =>
        upsertTaskArtifact(taskWorkspace(taskRef), {
          artifactType: opts.type,
          artifactPath: opts.path,
          status: opts.status,
          establishes: opts.establishes,
          nextConsumer: opts.nextConsumer,
          actor: opts.actor,
          evidence: opts.evidenceRef,
        }),
      );
      printMutationResult('task.artifact', state);
    }),
  );

  evidenceOptions(
    task
      .command('evidence <task> <evidence-id>')
      .description('record the result for one Completion Evidence item')
      .requiredOption('--status <status>', 'pending, passed, failed or blocked')
      .option('--proof <text>', 'short proof summary'),
  ).action((taskRef: string, evidenceId: string, opts: OptionValues) =>
    run(() => {
      const state = mutateAndRegister(() =>
        setTaskCompletionEvidence(taskWorkspace(taskRef), evidenceId, {
          status: opts.status,
          proof: opts.proof,
          evidence: opts.evidenceRef,
          actor: opts.actor,
        }),
      );
      printMutationResult('task.evidence', state);
    }),
  );

  task
    .command('show <task>')
    .description('show current Task status by path, UID or unique task id')
    .option('--json', 'print Runtime state as JSON', false)
    .action((taskRef: string, opts: OptionValues) =>
      run(() => {
        const state = resolveTaskReference(taskRef);
        console.log(opts.json ? JSON.stringify(state, null, 2) : taskSummary(state));
      }),
    );

  task
    .command('doctor <task>')
    .description('detect drift between Runtime state, generated views, registry, artifacts and repository')
    .option('--fix', 'regenerate views and repair the registry entry', false)
    .option('--json', 'print findings as JSON', false)
    .action((taskRef: string, opts: OptionValues) =>
      run(() => {
        const workspace = taskWorkspace(taskRef);
        if (opts.fix) {
          fixTaskViews(workspace);
          syncTaskRegistration(loadTaskState(workspace));
        }
        const findings = [...inspectTaskHealth(workspace), ...taskRegistryHealth(workspace)];
        if (opts.json) console.log(JSON.stringify(findings, null, 2));
        else printFindings(findings);
        if (findings.some((finding) => finding.severity === 'error' || finding.severity === 'warn')) {
          process.exitCode = 1;
        }
      }),
    );

  evidenceOptions(
    task
      .command('complete <task>')
      .description('complete a Task only after evidence and consistency gates pass')
      .requiredOption('--summary <text>', 'completion summary'),
  ).action((taskRef: string, opts: OptionValues) =>
    run(() => {
      const state = mutateAndRegister(() =>
        completeTask(taskWorkspace(taskRef), {
          summary: opts.summary,
          actor: opts.actor,
          evidence: opts.evidenceRef,
        }),
      );
      printMutationResult('task.complete', state);
    }),
  );

  evidenceOptions(
    task
      .command('abandon <task>')
      .description('close an open Task without claiming completion')
      .requiredOption('--summary <text>', 'why the Task is being abandoned'),
  ).action((taskRef: string, opts: OptionValues) =>
    run(() => {
      const state = mutateAndRegister(() =>
        abandonTask(taskWorkspace(taskRef), {
          summary: opts.summary,
          actor: opts.actor,
          evidence: opts.evidenceRef,
        }),
      );
      printMutationResult('task.abandon', state);
    }),
  );

  evidenceOptions(
    task
      .command('supersede <task>')
      .description('close an open Task because another registered Task replaces it')
      .requiredOption('--by <task-ref>', 'replacement Task UID, unique id or path')
      .requiredOption('--summary <text>', 'why the replacement is authoritative'),
  ).action((taskRef: string, opts: OptionValues) =>
    run(() => {
      const replacement = resolveTaskReference(opts.by);
      const current = resolveTaskReference(taskRef);
      if (replacement.taskUid === current.taskUid) throw new Error('a Task cannot supersede itself');
      const state = mutateAndRegister(() =>
        supersedeTask(current.workspace, {
          summary: opts.summary,
          supersededBy: replacement.taskUid,
          actor: opts.actor,
          evidence: opts.evidenceRef,
        }),
      );
      printMutationResult('task.supersede', state);
    }),
  );

  task.addHelpText(
    'after',
    `\nLifecycle statuses: ${TASK_STATUSES.join(', ')}\nTask references accept a path, Task UID or unique human-readable id. Core state files are Runtime-owned.\n`,
  );
}
