import type { ReactNode } from 'react';
import type { Tone } from '../status';

interface BadgeProps {
  tone?: Tone;
  pulse?: boolean;
  children: ReactNode;
}

// Compact status badge: a dot plus label. The dot carries the tone; `pulse`
// adds a subtle live motion reserved for genuinely active states.
export function Badge({ tone = 'neutral', pulse = false, children }: BadgeProps) {
  return (
    <span className={`badge badge-${tone}`}>
      <span className={`badge-dot${pulse ? ' pulse' : ''}`} aria-hidden="true" />
      <span className="badge-label">{children}</span>
    </span>
  );
}
