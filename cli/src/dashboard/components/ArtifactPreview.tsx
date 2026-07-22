import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { formatBytes } from '../format';
import { Markdown } from './Markdown';
import { Icon } from './Icon';
import { Spinner } from './States';
import type { ArtifactContentResponse } from '../types';
import { useT } from '../app/i18n';

// An in-window maximized reader: a fixed overlay that fills the browser viewport
// (not the Fullscreen API, which would hide the browser chrome). Backdrop click,
// the close button, or Esc dismiss it; body scroll is locked while open.
function ReaderOverlay({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const t = useT();
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <div
      className="reader-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="reader-panel">
        <div className="reader-head">
          <span className="reader-title">
            <Icon name="file-text" size={15} />
            {title}
          </span>
          <button type="button" className="icon-btn" onClick={onClose} title={t('closeReader')} aria-label={t('closeReader')}>
            <Icon name="x-circle" size={18} />
          </button>
        </div>
        <div className="reader-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

// Renders the result of the artifact content endpoint. Text is rendered as
// Markdown; binary and too-large artifacts get a clear not-previewable state.
export function ArtifactPreviewBody({ data }: { data: ArtifactContentResponse }) {
  const t = useT();
  const [maximized, setMaximized] = useState(false);

  if (data.previewStatus === 'ready' && data.preview !== null) {
    const rendered = <Markdown text={data.preview} />;
    return (
      <div className="artifact-preview artifact-preview-ready">
        <div className="artifact-preview-meta">
          <span>{formatBytes(data.size)}</span>
          <button type="button" className="reader-open" onClick={() => setMaximized(true)} title={t('openReader')}>
            <Icon name="maximize" size={13} />
            {t('openReader')}
          </button>
        </div>
        <div className="artifact-content">{rendered}</div>
        {maximized ? (
          <ReaderOverlay title={data.artifact.path} onClose={() => setMaximized(false)}>
            {rendered}
          </ReaderOverlay>
        ) : null}
      </div>
    );
  }
  if (data.previewStatus === 'binary') {
    return (
      <div className="artifact-preview artifact-preview-unavailable">
        <Icon name="file" size={15} />
        {t('binaryNotAvailable')} <span className="artifact-size">{formatBytes(data.size)}</span>
      </div>
    );
  }
  return (
    <div className="artifact-preview artifact-preview-unavailable">
      <Icon name="file" size={15} />
      {t('tooLargeToPreview')} — {formatBytes(data.size)}
      {data.maxPreviewBytes ? ` (${t('limit')} ${formatBytes(data.maxPreviewBytes)})` : ''}.
    </div>
  );
}

export function ArtifactPreviewLoading() {
  const t = useT();
  return (
    <div className="artifact-preview artifact-preview-loading">
      <Spinner /> <span>{t('loadingPreview')}</span>
    </div>
  );
}

export function ArtifactPreviewError({ message }: { message: string }) {
  const t = useT();
  return (
    <div className="artifact-preview artifact-preview-unavailable">
      <Icon name="alert-circle" size={15} /> {t('previewUnavailable')} — {message}
    </div>
  );
}
