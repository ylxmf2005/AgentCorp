import { formatDateTimeFull, formatRelative, isPlaceholder } from '../format';
import { AVAILABILITY_META, TASK_STATUS_META } from '../status';
import type { CatalogTask } from '../types';
import { useLocale, useT } from '../app/i18n';
import { Badge } from './Badge';
import { Icon } from './Icon';
import { Meter } from './Meter';
import { NowNext } from './NowNext';
import { RefText } from './RefTag';

// A single task rendered as a self-contained tile. The left spine is coloured
// by status so a wall of cards is scannable at a glance; the body carries the
// goal and the now/next read-out; the footer carries the evidence / artifact /
// finding counts. This is the one card shape the overview uses — compose it,
// don't hand-roll rows.
export function TaskCard({ task, onOpen }: { task: CatalogTask; onOpen: (taskUid: string) => void }) {
  const t = useT();
  const { locale } = useLocale();
  const summary = task.summary;
  const availability = AVAILABILITY_META[task.availability];
  const statusMeta = summary ? TASK_STATUS_META[summary.status] : availability;
  const headline =
    summary?.goalHeadline && !isPlaceholder(summary.goalHeadline)
      ? summary.goalHeadline
      : task.registration.lastKnownTaskId;
  const updatedAt = summary?.updatedAt ?? task.registration.updatedAt;

  return (
    <button
      type="button"
      className={`task-card tone-${statusMeta.tone}`}
      onClick={() => onOpen(task.registration.taskUid)}
    >
      <div className="task-card-head">
        <div className="task-card-badges">
          <Badge tone={statusMeta.tone} pulse={statusMeta.pulse}>
            {statusMeta.label}
          </Badge>
          {task.availability !== 'available' && summary ? (
            <Badge tone={availability.tone}>{availability.label}</Badge>
          ) : null}
        </div>
        <span className="task-card-time" title={formatDateTimeFull(updatedAt, locale)}>
          <Icon name="clock" size={12} />
          {formatRelative(updatedAt, locale)}
        </span>
      </div>

      <div className="task-card-title">
        <RefText text={headline} />
      </div>
      <div className="task-card-id">{task.registration.lastKnownTaskId}</div>

      {summary ? (
        <NowNext now={summary.currentWork.now} next={summary.currentWork.next} compact />
      ) : (
        <div className="task-card-error">
          <Icon name="alert-circle" size={13} />
          {task.error ?? t('taskUnavailableBody')}
        </div>
      )}

      {summary ? (
        <div className="task-card-foot">
          <span className="stat" title={`${summary.completion.passed}/${summary.completion.total} ${t('completionEvidence')}`}>
            <Meter value={summary.completion.passed} total={summary.completion.total} />
            <span className="stat-value">
              {summary.completion.passed}/{summary.completion.total}
            </span>
            <span className="stat-label">{t('evidence')}</span>
          </span>
          <span className="stat" title={t('artifacts')}>
            <span className="stat-value">{summary.artifacts.total}</span>
            <span className="stat-label">{t('artifacts')}</span>
          </span>
          {summary.activeFindings > 0 ? (
            <span className="stat stat-warn" title={t('findings')}>
              <Icon name="alert-triangle" size={13} />
              <span className="stat-value">{summary.activeFindings}</span>
              <span className="stat-label">
                {t('finding')}
                {summary.activeFindings === 1 || locale !== 'en' ? '' : 's'}
              </span>
            </span>
          ) : null}
        </div>
      ) : null}
    </button>
  );
}
