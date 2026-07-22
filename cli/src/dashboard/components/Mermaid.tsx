import { useEffect, useRef, useState } from 'react';

// Mermaid diagrams embedded in artifacts (```mermaid fences). Mermaid is bundled
// locally (no CDN) and loaded on first use. Rendering is deferred to an effect;
// if a diagram fails to parse we fall back to the original fence as a code block
// so a malformed diagram is never a blank box.

type MermaidTheme = 'default' | 'dark';

let loader: Promise<typeof import('mermaid').default> | null = null;
let configuredTheme: MermaidTheme | null = null;

async function loadMermaid(theme: MermaidTheme) {
  if (!loader) loader = import('mermaid').then((module) => module.default);
  const mermaid = await loader;
  if (configuredTheme !== theme) {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme, fontFamily: 'inherit' });
    configuredTheme = theme;
  }
  return mermaid;
}

function useDatasetTheme(): MermaidTheme {
  const read = (): MermaidTheme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default');
  const [theme, setTheme] = useState<MermaidTheme>(read);
  useEffect(() => {
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

let sequence = 0;

export function Mermaid({ code }: { code: string }) {
  const host = useRef<HTMLDivElement>(null);
  const theme = useDatasetTheme();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    sequence += 1;
    const id = `mermaid-${sequence}`;
    void (async () => {
      try {
        const mermaid = await loadMermaid(theme);
        const { svg } = await mermaid.render(id, code);
        if (!cancelled && host.current) host.current.innerHTML = svg;
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, theme]);

  if (failed) {
    return (
      <pre className="md-pre">
        <code>{code}</code>
      </pre>
    );
  }
  return <div className="mermaid-diagram" ref={host} role="img" />;
}
