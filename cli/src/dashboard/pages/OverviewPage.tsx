import { useCallback, useMemo, useState } from 'react';
import type { ApiClient } from '../api';
import { formatRelative } from '../format';
import { useFetch } from '../hooks/useFetch';
import { useInterval } from '../hooks/useInterval';
import { SEVERITY_META, TASK_STATUS_META, TASK_STATUS_ORDER, type Severity } from '../status';
import type { CatalogSnapshot, CatalogTask, TaskStatus } from '../types';
import { EmptyState, ErrorState, PageHeader, Skeleton } from '../components/States';
import { Icon } from '../components/Icon';
import { TaskCard } from '../components/TaskCard';
import { useLocale, useT } from '../app/i18n';

const REFRESH_MS = 5000;

type StatusFilter = 'all' | TaskStatus;

function countByStatus(tasks: CatalogTask[]): Map<TaskStatus, number> {
  const counts = new Map<TaskStatus, number>();
  for (const task of tasks) {
    if (task.summary) counts.set(task.summary.status, (counts.get(task.summary.status) ?? 0) + 1);
  }
  return counts;
}

function worstSeverity(snapshot: CatalogSnapshot): Severity | null {
  if (snapshot.findings.some((finding) => finding.severity === 'error')) return 'error';
  if (snapshot.findings.some((finding) => finding.severity === 'warn')) return 'warn';
  return null;
}

export function OverviewPage({ client, onOpenTask }: { client: ApiClient; onOpenTask: (taskUid: string) => void }) {
  const t = useT();
  const { locale } = useLocale();
  const fetcher = useCallback((signal: AbortSignal) => client.catalog(signal), [client]);
  const { data, error, loading, reload } = useFetch<CatalogSnapshot>(fetcher);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [query, setQuery] = useState('');

  useInterval(reload, REFRESH_MS, Boolean(data) && !error);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.tasks.filter((task) => {
      if (statusFilter !== 'all') {
        const status = task.summary?.status;
        if (status !== statusFilter) return false;
      }
      if (!q) return true;
      const haystack = [
        task.summary?.goalHeadline ?? '',
        task.summary?.currentWork.now ?? '',
        task.summary?.currentWork.next ?? '',
        task.registration.lastKnownTaskId,
        task.registration.workspace,
        task.error ?? '',
      ]
        .join('\n')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [data, statusFilter, query]);

  if (loading && !data) {
    return (
      <div className="page">
        <PageHeader title={t('tasks')} subtitle={t('loadingRegistry')} />
        <div className="task-grid">
          <Skeleton rows={1} height={168} />
          <Skeleton rows={1} height={168} />
          <Skeleton rows={1} height={168} />
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="page">
        <PageHeader title={t('tasks')} />
        <ErrorState message={error} onRetry={reload} />
      </div>
    );
  }

  const snapshot = data!;
  const counts = countByStatus(snapshot.tasks);
  const severity = worstSeverity(snapshot);
  const presentStatuses = TASK_STATUS_ORDER.filter((status) => counts.has(status));

  return (
    <div className="page">
      <PageHeader
        title={t('tasks')}
        subtitle={
          <>
            {snapshot.tasks.length} {t('registered')} · {t('updated')} {formatRelative(snapshot.generatedAt, locale)}
            <span className="refresh-hint">
              · {t('autoRefresh')} {REFRESH_MS / 1000}s
            </span>
          </>
        }
      />

      {severity ? (
        <div className={`banner banner-${SEVERITY_META[severity].tone}`}>
          <Icon name="alert-triangle" size={16} />
          <div className="banner-body">
            <div className="banner-title">
              {snapshot.findings.length}{' '}
              {snapshot.findings.length === 1 ? t('registryIssueDetected') : t('registryIssuesDetected')}
            </div>
            <ul className="banner-list">
              {snapshot.findings.map((finding, index) => (
                <li key={index}>
                  <span className={`severity-dot severity-${finding.severity}`} aria-hidden="true" />
                  <span className="banner-message">{finding.message}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      {snapshot.tasks.length === 0 ? (
        <EmptyState
          icon="layers"
          title={t('noTasksTitle')}
          message={
            <>
              {t('noTasksBodyA')} <code>longrein task create</code>
              {t('noTasksBodyB')}
            </>
          }
        />
      ) : (
        <>
          <div className="toolbar">
            <div className="segmented" role="tablist" aria-label={t('filterTasks')}>
              <button
                type="button"
                className={`segment${statusFilter === 'all' ? ' is-active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                {t('all')} <span className="segment-count">{snapshot.tasks.length}</span>
              </button>
              {presentStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`segment${statusFilter === status ? ' is-active' : ''}`}
                  onClick={() => setStatusFilter(status)}
                >
                  {TASK_STATUS_META[status].label} <span className="segment-count">{counts.get(status)}</span>
                </button>
              ))}
            </div>
            <div className="search">
              <Icon name="search" size={15} className="search-icon" />
              <input
                className="search-input"
                type="search"
                placeholder={t('filterTasks')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label={t('filterTasks')}
              />
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon="search" title={t('noMatchingTitle')} message={t('noMatchingBody')} />
          ) : (
            <div className="task-grid">
              {filtered.map((task) => (
                <TaskCard key={task.registration.taskUid} task={task} onOpen={onOpenTask} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
