import { isPlaceholder } from '../format';
import { useT } from '../app/i18n';

interface NowNextProps {
  now: string;
  next: string;
  waitingOn?: string;
  compact?: boolean;
}

// The primary "what is happening / what comes next" read-out. Placeholder
// values ("none", "unresolved") render dimmed so real signal stands out.
export function NowNext({ now, next, waitingOn, compact = false }: NowNextProps) {
  const t = useT();
  const showWaiting = waitingOn !== undefined && !isPlaceholder(waitingOn);
  return (
    <div className={`nownext${compact ? ' nownext-compact' : ''}`}>
      <div className="nownext-row">
        <span className="nownext-key">{t('now')}</span>
        <span className={`nownext-value${isPlaceholder(now) ? ' is-empty' : ''}`}>{now || '—'}</span>
      </div>
      <div className="nownext-row">
        <span className="nownext-key">{t('next')}</span>
        <span className={`nownext-value${isPlaceholder(next) ? ' is-empty' : ''}`}>{next || '—'}</span>
      </div>
      {showWaiting ? (
        <div className="nownext-row">
          <span className="nownext-key">{t('waiting')}</span>
          <span className="nownext-value is-waiting">{waitingOn}</span>
        </div>
      ) : null}
    </div>
  );
}
