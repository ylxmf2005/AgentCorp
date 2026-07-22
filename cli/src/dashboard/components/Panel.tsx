import type { ReactNode } from 'react';

// Panel is the single card primitive for the whole dashboard. Every content
// section uses it, so radius, border, padding, shadow and the title/meta row
// stay consistent. Compose panels; don't invent ad-hoc card styles.
interface PanelProps {
  id?: string;
  title?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  tone?: 'default' | 'warning';
  children: ReactNode;
  className?: string;
}

export function Panel({ id, title, meta, icon, tone = 'default', children, className = '' }: PanelProps) {
  return (
    <section id={id} className={`panel panel-${tone} ${className}`.trim()}>
      {title !== undefined || meta !== undefined ? (
        <header className="panel-head">
          {icon ? <span className="panel-head-icon">{icon}</span> : null}
          <h2 className="panel-head-title">{title}</h2>
          {meta !== undefined ? <span className="panel-head-meta">{meta}</span> : null}
        </header>
      ) : null}
      <div className="panel-body">{children}</div>
    </section>
  );
}
