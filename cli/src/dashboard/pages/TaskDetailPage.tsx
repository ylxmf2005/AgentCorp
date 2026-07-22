import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ApiClient } from '../api';
import { formatDateTimeFull, formatRelative, isPlaceholder, shortSha } from '../format';
import { useFetch } from '../hooks/useFetch';
import { useInterval } from '../hooks/useInterval';
import { ARTIFACT_STATUS_META, COMPLETION_META, TASK_STATUS_META, eventKindLabel } from '../status';
import type {
  ArtifactContentResponse,
  OpenApplication,
  OpenTarget,
  TaskArtifact,
  TaskDetailResponse,
  TaskEvent,
  TaskHealthResponse,
} from '../types';
import { ArtifactPreviewBody, ArtifactPreviewError, ArtifactPreviewLoading } from '../components/ArtifactPreview';
import { Badge } from '../components/Badge';
import { ContextMenu, type MenuItem } from '../components/ContextMenu';
import { CopyChip } from '../components/CopyChip';
import { TaskActionsProvider, useTaskActions } from '../components/TaskActions';
import { DetailSectionNav, type DetailSectionNavItem } from '../components/DetailSectionNav';
import { EmptyState, ErrorState, Skeleton, Spinner } from '../components/States';
import { Icon } from '../components/Icon';
import { Markdown } from '../components/Markdown';
import { Meter } from '../components/Meter';
import { NowNext } from '../components/NowNext';
import { Panel } from '../components/Panel';
import { RefLine, RefText } from '../components/RefTag';
import { RichText } from '../components/RichText';
import { useLocale, useT } from '../app/i18n';

const REFRESH_MS = 5000;

const OPEN_APPLICATIONS: Array<{ id: OpenApplication; label: 'finder' | 'terminal' | null }> = [
  { id: 'finder', label: 'finder' },
  { id: 'vscode', label: null },
  { id: 'terminal', label: 'terminal' },
];

function PathActions({ client, taskUid, target }: { client: ApiClient; taskUid: string; target: OpenTarget }) {
  const t = useT();
  const [opening, setOpening] = useState<OpenApplication | null>(null);
  const [failed, setFailed] = useState(false);

  const open = async (application: OpenApplication) => {
    setOpening(application);
    setFailed(false);
    try {
      await client.openTaskPath(taskUid, target, application);
    } catch {
      setFailed(true);
    } finally {
      setOpening(null);
    }
  };

  return (
    <div className="path-open-wrap">
      <div className="path-actions" aria-label={t('openIn')}>
        {OPEN_APPLICATIONS.map((application) => {
          const label = application.label ? t(application.label) : 'VS Code';
          return (
            <button
              key={application.id}
              type="button"
              className="path-open-button"
              disabled={opening !== null}
              title={`${t('openIn')} ${label}`}
              onClick={() => void open(application.id)}
            >
              {opening === application.id ? <Spinner /> : null}
              {label}
            </button>
          );
        })}
      </div>
      {failed ? (
        <span className="path-open-error" role="alert">
          {t('openPathFailed')}
        </span>
      ) : null}
    </div>
  );
}

function EvidenceItem({ item }: { item: TaskDetailResponse['state']['commitments']['completionEvidence'][number] }) {
  const meta = COMPLETION_META[item.status];
  const icon =
    item.status === 'passed' ? 'check-circle' : item.status === 'failed' ? 'x-circle' : item.status === 'blocked' ? 'alert-circle' : 'circle';
  return (
    <li className={`evidence-item evidence-${item.status}`}>
      <Icon name={icon} size={16} className="evidence-icon" />
      <div className="evidence-body">
        <div className="evidence-head">
          <span className="evidence-id">{item.id}</span>
          <Badge tone={meta.tone}>{meta.label}</Badge>
        </div>
        <div className="evidence-text">
          <RichText text={item.text} />
        </div>
        {item.proof ? (
          <div className="evidence-proof">
            <RichText text={item.proof} />
          </div>
        ) : null}
        {item.evidence.length > 0 ? (
          <div className="evidence-refs">
            {item.evidence.map((reference, index) => (
              <CopyChip key={index} value={reference} />
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

function ArtifactPreview({ client, taskUid, artifact }: { client: ApiClient; taskUid: string; artifact: TaskArtifact }) {
  const fetcher = useCallback(
    (signal: AbortSignal) => client.artifactContent(taskUid, artifact.id, signal),
    [client, taskUid, artifact.id],
  );
  const { data, error, loading } = useFetch<ArtifactContentResponse>(fetcher);
  if (loading) return <ArtifactPreviewLoading />;
  if (error) return <ArtifactPreviewError message={error} />;
  if (!data) return null;
  return <ArtifactPreviewBody data={data} />;
}

function ArtifactRow({
  client,
  taskUid,
  artifact,
  expanded,
  onToggle,
}: {
  client: ApiClient;
  taskUid: string;
  artifact: TaskArtifact;
  expanded: boolean;
  onToggle: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const actions = useTaskActions();
  const meta = ARTIFACT_STATUS_META[artifact.status];
  const panelId = `artifact-panel-${artifact.id}`;
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);

  const items: MenuItem[] = [];
  if (actions) {
    items.push({ label: t('openInVscode'), icon: 'external-link', onSelect: () => actions.reveal(artifact.path, 'vscode', null) });
    items.push({ label: t('revealInFinder'), icon: 'folder', onSelect: () => actions.reveal(artifact.path, 'finder', null) });
  }
  items.push({
    label: t('copyPath'),
    icon: 'copy',
    onSelect: () => {
      try {
        navigator.clipboard?.writeText(artifact.path);
      } catch {
        /* clipboard unavailable */
      }
    },
  });

  return (
    <li className="artifact-item">
      <div
        className="artifact-head"
        onContextMenu={(event) => {
          event.preventDefault();
          setMenu({ x: event.clientX, y: event.clientY });
        }}
      >
        <button type="button" className="artifact-toggle" aria-expanded={expanded} aria-controls={panelId} onClick={onToggle}>
          <Icon name={expanded ? 'chevron-down' : 'chevron-right'} size={15} className="artifact-caret" />
          <Icon name="file-text" size={15} className="artifact-file-icon" />
          <span className="artifact-path">{artifact.path}</span>
        </button>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>
      {menu ? <ContextMenu x={menu.x} y={menu.y} items={items} onClose={() => setMenu(null)} /> : null}
      <div className="artifact-sub">
        <span className="artifact-type">{artifact.artifactType}</span>
        <span className="artifact-establishes" title={artifact.establishes}>
          {artifact.establishes}
        </span>
        <span className="artifact-updated" title={formatDateTimeFull(artifact.updatedAt, locale)}>
          {formatRelative(artifact.updatedAt, locale)}
        </span>
      </div>
      {expanded ? (
        <div id={panelId} className="artifact-panel">
          <ArtifactPreview client={client} taskUid={taskUid} artifact={artifact} />
        </div>
      ) : null}
    </li>
  );
}

function EventItem({ event, latest }: { event: TaskEvent; latest: boolean }) {
  const t = useT();
  const { locale } = useLocale();
  return (
    <li className={`event-item${latest ? ' is-latest' : ''}`}>
      <div className="event-marker" aria-hidden="true">
        <span className="event-dot" />
        <span className="event-line" />
      </div>
      <div className="event-body">
        <div className="event-head">
          <span className="event-kind">{eventKindLabel(event.kind)}</span>
          <span className="event-id">{event.id}</span>
          <span className="event-time" title={formatDateTimeFull(event.at, locale)}>
            {formatRelative(event.at, locale)}
          </span>
        </div>
        <div className="event-summary">
          <RichText text={event.summary} />
        </div>
        {event.details ? (
          <div className="event-details">
            <RichText text={event.details} />
          </div>
        ) : null}
        <div className="event-meta">
          <span className="event-actor">
            {t('by')} {event.actor}
          </span>
          {event.evidence.map((reference, index) => (
            <CopyChip key={index} value={reference} />
          ))}
        </div>
      </div>
    </li>
  );
}

function UnavailableDetail({ error, onBack }: { error: string | null; onBack: () => void }) {
  const t = useT();
  return (
    <div className="page">
      <button type="button" className="btn btn-back" onClick={onBack}>
        <Icon name="arrow-left" size={14} /> {t('allTasks')}
      </button>
      <div className="detail-unavailable">
        <EmptyState icon="alert-triangle" title={t('taskUnavailableTitle')} message={error ?? t('taskUnavailableBody')} />
      </div>
    </div>
  );
}

export function TaskDetailPage({ client, taskUid, onBack }: { client: ApiClient; taskUid: string; onBack: () => void }) {
  const t = useT();
  const { locale } = useLocale();
  const detailFetcher = useCallback((signal: AbortSignal) => client.taskDetail(taskUid, signal), [client, taskUid]);
  const healthFetcher = useCallback((signal: AbortSignal) => client.taskHealth(taskUid, signal), [client, taskUid]);

  const detail = useFetch<TaskDetailResponse>(detailFetcher);
  const health = useFetch<TaskHealthResponse>(healthFetcher);

  const [expandedArtifact, setExpandedArtifact] = useState<string | null>(null);
  const reloadBoth = useCallback(() => {
    detail.reload();
    health.reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail.reload, health.reload]);
  useInterval(reloadBoth, REFRESH_MS, Boolean(detail.data) && !detail.error);

  const previousUid = useRef(taskUid);
  useEffect(() => {
    if (previousUid.current !== taskUid) {
      previousUid.current = taskUid;
      setExpandedArtifact(null);
    }
  }, [taskUid]);

  const state = detail.data?.state ?? null;
  const activeFindings = useMemo(() => (state ? state.findings.filter((item) => item.status === 'active') : []), [state]);
  const supersededFindings = useMemo(() => (state ? state.findings.filter((item) => item.status === 'superseded') : []), [state]);
  const timeline = useMemo(() => (state ? [...state.events].reverse() : []), [state]);
  const completionTotal = state?.commitments.completionEvidence.length ?? 0;
  const completionPassed = state?.commitments.completionEvidence.filter((item) => item.status === 'passed').length ?? 0;

  if (detail.loading && !detail.data) {
    return (
      <div className="page">
        <button type="button" className="btn btn-back" onClick={onBack}>
          <Icon name="arrow-left" size={14} /> {t('allTasks')}
        </button>
        <Skeleton rows={2} height={30} />
        <Skeleton rows={5} height={70} />
      </div>
    );
  }

  if (!state) {
    return <UnavailableDetail error={detail.error} onBack={onBack} />;
  }

  const statusMeta = TASK_STATUS_META[state.status];
  const findings = health.data?.findings ?? [];
  const goals = state.commitments.goal;
  const scopes = state.commitments.scope;
  const nonGoals = state.commitments.nonGoals;
  const mustPreserve = state.commitments.mustPreserve;
  const refs = [state.refs.sourceRef, state.refs.workingBranch, state.refs.targetRef].filter(Boolean) as string[];
  const sectionItems: DetailSectionNavItem[] = [
    ...(state.originalRequest && !isPlaceholder(state.originalRequest)
      ? [{ id: 'section-request', label: t('originalRequest') }]
      : []),
    { id: 'section-goal', label: t('goal'), count: goals.length },
    ...(scopes.length > 0 || nonGoals.length > 0
      ? [{ id: 'section-scope', label: t('scope'), count: scopes.length + nonGoals.length }]
      : []),
    ...(mustPreserve.length > 0
      ? [{ id: 'section-preserve', label: t('mustPreserve'), count: mustPreserve.length }]
      : []),
    { id: 'section-evidence', label: t('completionEvidence'), count: completionTotal },
    { id: 'section-artifacts', label: t('artifacts'), count: state.artifacts.length },
    ...(state.findings.length > 0
      ? [{ id: 'section-findings', label: t('findings'), count: state.findings.length }]
      : []),
    { id: 'section-timeline', label: t('timeline'), count: timeline.length },
  ];

  return (
    <TaskActionsProvider client={client} taskUid={taskUid}>
      <div className="page">
      <div className="detail-topbar">
        <button type="button" className="btn btn-back" onClick={onBack}>
          <Icon name="arrow-left" size={14} /> {t('allTasks')}
        </button>
        {detail.loading ? <Spinner /> : null}
      </div>

      <header className="detail-hero">
        <div className="detail-statusline">
          <Badge tone={statusMeta.tone} pulse={statusMeta.pulse}>
            {statusMeta.label}
          </Badge>
          <span className="detail-taskid">{state.taskId}</span>
        </div>
        <h1 className="detail-title">
          {!isPlaceholder(goals[0]) ? <RefText text={goals[0]} /> : state.taskId}
        </h1>
        <NowNext now={state.currentWork.now} next={state.currentWork.next} waitingOn={state.currentWork.waitingOn} />
      </header>

      <DetailSectionNav items={sectionItems} label={t('sectionNavigation')} />

      <div className="detail-body">
        <div className="detail-main">
          {state.originalRequest && !isPlaceholder(state.originalRequest) ? (
            <Panel id="section-request" title={t('originalRequest')} icon={<Icon name="file-text" size={15} />}>
              <Markdown text={state.originalRequest} />
            </Panel>
          ) : null}

          <Panel id="section-goal" title={t('goal')} icon={<Icon name="zap" size={15} />}>
        {goals.length === 0 ? (
          <div className="field-empty">{t('noGoal')}</div>
        ) : goals.length === 1 ? (
          <p className="goal-statement">
            <RefText text={goals[0]} />
          </p>
        ) : (
          <ul className="refline-list">
            {goals.map((goal, index) => (
              <RefLine key={index} text={goal} />
            ))}
          </ul>
        )}
      </Panel>

      {scopes.length > 0 || nonGoals.length > 0 ? (
        <Panel id="section-scope" title={t('scope')}>
          {scopes.length === 0 && nonGoals.length === 0 ? (
            <div className="field-empty">{t('noScope')}</div>
          ) : (
            <div className="scope-boundary">
              {scopes.length > 0 ? (
                <div className="scope-zone scope-in">
                  <div className="scope-zone-label">{t('inScope')}</div>
                  <ul className="refline-list">
                    {scopes.map((scope, index) => (
                      <RefLine key={index} text={scope} icon={<Icon name="check" size={14} />} />
                    ))}
                  </ul>
                </div>
              ) : null}
              {nonGoals.length > 0 ? (
                <div className="scope-zone scope-out">
                  <div className="scope-zone-label">{t('outOfScope')}</div>
                  <ul className="refline-list">
                    {nonGoals.map((nonGoal, index) => (
                      <RefLine key={index} text={nonGoal} icon={<Icon name="x-circle" size={14} />} />
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </Panel>
      ) : null}

      {mustPreserve.length > 0 ? (
        <Panel id="section-preserve" title={t('mustPreserve')}>
          <ul className="refline-list">
            {mustPreserve.map((item, index) => (
              <RefLine key={index} text={item} icon={<Icon name="check" size={14} />} />
            ))}
          </ul>
        </Panel>
      ) : null}

      <Panel id="section-evidence" title={t('completionEvidence')} meta={`${completionPassed}/${completionTotal} ${t('passed')}`}>
        {state.commitments.completionEvidence.length === 0 ? (
          <div className="field-empty">{t('noCompletionEvidence')}</div>
        ) : (
          <ul className="evidence-list">
            {state.commitments.completionEvidence.map((item) => (
              <EvidenceItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </Panel>

      <Panel id="section-artifacts" title={t('artifacts')} meta={String(state.artifacts.length)}>
        {state.artifacts.length === 0 ? (
          <div className="field-empty">{t('noArtifacts')}</div>
        ) : (
          <ul className="artifact-list">
            {state.artifacts.map((artifact) => (
              <ArtifactRow
                key={artifact.id}
                client={client}
                taskUid={taskUid}
                artifact={artifact}
                expanded={expandedArtifact === artifact.id}
                onToggle={() => setExpandedArtifact((current) => (current === artifact.id ? null : artifact.id))}
              />
            ))}
          </ul>
        )}
      </Panel>

      {state.findings.length > 0 ? (
        <Panel id="section-findings" title={t('findings')} meta={`${state.findings.length} ${t('recorded')}`}>
          <p className="finding-intro">{t('findingsHelp')}</p>
          <ul className="finding-list">
            {activeFindings.map((finding) => (
              <li key={finding.id} className="finding-item">
                <div className="finding-head">
                  <span className="finding-id">{finding.id}</span>
                </div>
                <div className="finding-summary">
                  <RichText text={finding.summary} />
                </div>
                {finding.evidence.length > 0 ? (
                  <div className="finding-refs">
                    <span className="refs-label">{t('references')}</span>
                    <div className="evidence-refs">
                      {finding.evidence.map((reference, index) => (
                        <CopyChip key={index} value={reference} />
                      ))}
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          {supersededFindings.length > 0 ? (
            <div className="field-empty">
              {supersededFindings.length} {t('supersededNotShown')}
            </div>
          ) : null}
        </Panel>
      ) : null}

          <Panel id="section-timeline" title={t('timeline')} icon={<Icon name="clock" size={15} />} meta={`${timeline.length} ${t('events')}`}>
            {timeline.length === 0 ? (
              <div className="field-empty">{t('noEvents')}</div>
            ) : (
              <ol className="event-list">
                {timeline.map((event, index) => (
                  <EventItem key={event.id} event={event} latest={index === 0} />
                ))}
              </ol>
            )}
          </Panel>
        </div>

        <aside className="detail-rail">
          {findings.length > 0 ? (
            <Panel
              tone="warning"
              icon={<Icon name="alert-triangle" size={15} className="health-icon" />}
              title={`${t('health')} · ${findings.length}`}
              className="health-panel"
            >
              <ul className="health-list">
                {findings.map((finding, index) => (
                  <li key={index} className={`health-item health-${finding.severity}`}>
                    <span className={`severity-dot severity-${finding.severity}`} aria-hidden="true" />
                    <span className="health-code">{finding.code}</span>
                    <span className="health-message">{finding.message}</span>
                    {finding.fixable ? <span className="health-fixable">{t('autoFixable')}</span> : null}
                  </li>
                ))}
              </ul>
            </Panel>
          ) : null}

          <Panel title={t('snapshot')} icon={<Icon name="layers" size={15} />}>
            <dl className="snapshot">
              <div className="snapshot-row snapshot-evidence">
                <dt>{t('evidence')}</dt>
                <dd>
                  <Meter value={completionPassed} total={completionTotal} />
                  <span className="snapshot-strong">
                    {completionPassed}/{completionTotal}
                  </span>
                  <span className="meta-sub">{t('passed')}</span>
                </dd>
              </div>
              {state.currentWork.active ? (
                <div className="snapshot-row">
                  <dt>{t('workUnit')}</dt>
                  <dd>
                    {state.currentWork.active.id} · {state.currentWork.active.actor} · {t('started')}{' '}
                    {formatRelative(state.currentWork.active.startedAt, locale)}
                  </dd>
                </div>
              ) : null}
              <div className="snapshot-row">
                <dt>{t('updated')}</dt>
                <dd title={formatDateTimeFull(state.updatedAt, locale)}>{formatRelative(state.updatedAt, locale)}</dd>
              </div>
              <div className="snapshot-row">
                <dt>{t('created')}</dt>
                <dd title={formatDateTimeFull(state.createdAt, locale)}>{formatRelative(state.createdAt, locale)}</dd>
              </div>
              <div className="snapshot-row">
                <dt>{t('revisions')}</dt>
                <dd>
                  context r{state.contextRevision} · scope r{state.scopeRevision}
                </dd>
              </div>
              {refs.length > 0 ? (
                <div className="snapshot-row">
                  <dt>{t('refs')}</dt>
                  <dd className="snapshot-chips">
                    {refs.map((reference, index) => (
                      <code key={index} className="ref-chip">
                        {reference}
                      </code>
                    ))}
                  </dd>
                </div>
              ) : null}
              <div className="snapshot-row">
                <dt>{t('workspace')}</dt>
                <dd className="snapshot-path">
                  <span className="snapshot-path-value">{state.workspace}</span>
                  <PathActions client={client} taskUid={taskUid} target="workspace" />
                </dd>
              </div>
              {state.repository ? (
                <div className="snapshot-row">
                  <dt>{t('repository')}</dt>
                  <dd className="snapshot-path">
                    <span className="snapshot-path-value">
                      {state.repository}
                      {state.lastReconciledRepository?.head ? (
                        <span className="meta-sub"> · HEAD {shortSha(state.lastReconciledRepository.head)}</span>
                      ) : null}
                    </span>
                    <PathActions client={client} taskUid={taskUid} target="repository" />
                  </dd>
                </div>
              ) : null}
              <div className="snapshot-row">
                <dt>{t('taskUid')}</dt>
                <dd className="mono">{state.taskUid}</dd>
              </div>
            </dl>
          </Panel>
        </aside>
      </div>
      </div>
    </TaskActionsProvider>
  );
}
