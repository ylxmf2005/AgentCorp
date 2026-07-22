import type { Tone } from '../status';

// A thin completion meter. Reused wherever "N of M passed" needs a visual read
// (task cards, the detail snapshot rail). Tone colours the fill; the track is
// neutral. Renders empty (just the track) when there is nothing to measure.
export function Meter({ value, total, tone = 'ok' }: { value: number; total: number; tone?: Tone }) {
  const ratio = total > 0 ? Math.max(0, Math.min(1, value / total)) : 0;
  return (
    <span className="meter" role="img" aria-label={`${value} of ${total}`}>
      <span className={`meter-fill meter-${tone}`} style={{ width: `${ratio * 100}%` }} />
    </span>
  );
}
