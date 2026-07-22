import type { ReactNode } from 'react';
import { Icon, type IconName } from './Icon';
import { useT } from '../app/i18n';

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        <h1 className="page-title">{title}</h1>
        {subtitle ? <div className="page-subtitle">{subtitle}</div> : null}
      </div>
      {actions ? <div className="page-header-actions">{actions}</div> : null}
    </div>
  );
}

export function Skeleton({ rows = 3, height = 14 }: { rows?: number; height?: number }) {
  return (
    <div className="skeleton-stack" aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="skeleton" style={{ height, width: `${100 - ((index * 13) % 30)}%` }} />
      ))}
    </div>
  );
}

export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title?: string;
  message: string;
  onRetry?: () => void;
}) {
  const t = useT();
  return (
    <div className="state-box state-error" role="alert">
      <Icon name="alert-circle" size={20} className="state-icon" />
      <div className="state-title">{title ?? t('somethingWrong')}</div>
      <div className="state-message">{message}</div>
      {onRetry ? (
        <button type="button" className="btn" onClick={onRetry}>
          <Icon name="refresh" size={14} /> {t('retry')}
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon = 'file-text',
  title,
  message,
}: {
  icon?: IconName;
  title: string;
  message: ReactNode;
}) {
  return (
    <div className="state-box state-empty">
      <Icon name={icon} size={22} className="state-icon" />
      <div className="state-title">{title}</div>
      <div className="state-message">{message}</div>
    </div>
  );
}

export function Spinner({ label }: { label?: string }) {
  return (
    <span className="spinner" role="status" aria-label={label ?? 'loading'}>
      <span className="spinner-ring" aria-hidden="true" />
    </span>
  );
}
