import { useEffect, useRef } from 'react';

// Fires `callback` every `delay` ms when `active` is true. Uses a ref for the
// callback so the interval identity stays stable across re-renders.
export function useInterval(callback: () => void, delay: number, active: boolean): void {
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => {
    if (!active) return undefined;
    const id = window.setInterval(() => ref.current(), delay);
    return () => window.clearInterval(id);
  }, [delay, active]);
}
