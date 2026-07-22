import { useEffect, useState } from 'react';

export interface DetailSectionNavItem {
  id: string;
  label: string;
  count?: number;
}

// The detail route already owns the URL hash, so section navigation scrolls to
// real landmarks instead of writing a second fragment into the address bar.
// The active marker follows the last section that has crossed the sticky nav.
export function DetailSectionNav({ items, label }: { items: DetailSectionNavItem[]; label: string }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const threshold = 124;
      let current = items[0]?.id ?? '';
      for (const item of items) {
        const element = document.getElementById(item.id);
        if (!element) continue;
        if (element.getBoundingClientRect().top <= threshold) current = item.id;
        else break;
      }
      setActiveId(current);
    };
    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [items]);

  return (
    <nav className="detail-section-nav" aria-label={label}>
      <div className="detail-section-nav-track">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`detail-section-link${active ? ' is-active' : ''}`}
              aria-current={active ? 'location' : undefined}
              onClick={() => {
                setActiveId(item.id);
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              <span>{item.label}</span>
              {item.count !== undefined ? <span className="detail-section-count">{item.count}</span> : null}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
