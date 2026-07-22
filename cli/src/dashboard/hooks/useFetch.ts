import { useCallback, useEffect, useRef, useState } from 'react';

export interface FetchState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

// A small self-contained data hook: fetches on mount and whenever `reloadKey`
// changes, cancels in-flight work on unmount, and exposes manual reload.
// `deps` are appended to the fetch identity so callers can include params.
//
// Background refreshes (the pages poll every 5s) are kept quiet: `loading` only
// flips while there is no data yet, and a refetch that returns byte-identical
// content leaves state untouched so nothing re-renders. This stops the page from
// flickering on every poll when nothing has actually changed.
export function useFetch<T>(fetcher: (signal: AbortSignal) => Promise<T>, deps: readonly unknown[] = []) {
  const [state, setState] = useState<FetchState<T>>({ data: null, error: null, loading: true });
  const [reloadKey, setReloadKey] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const serializedRef = useRef<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setState((previous) => (previous.data === null ? { ...previous, loading: true, error: null } : previous));
    fetcherRef
      .current(controller.signal)
      .then((data) => {
        const serialized = JSON.stringify(data);
        setState((previous) => {
          if (previous.data !== null && !previous.error && serialized === serializedRef.current) {
            // Unchanged content on a background refresh: keep the same state
            // reference so React bails out of re-rendering consumers.
            return previous.loading ? { ...previous, loading: false } : previous;
          }
          serializedRef.current = serialized;
          return { data, error: null, loading: false };
        });
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        const message = error instanceof Error ? error.message : String(error);
        setState((previous) => ({ data: previous.data, error: message, loading: false }));
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, ...deps]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  return { ...state, reload };
}
