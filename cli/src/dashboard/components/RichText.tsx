import { Fragment, type ReactNode } from 'react';

// Longrein's plain-text fields (finding summaries, evidence proofs, event
// details) are written by engineers and are dense with code references:
// file:line locators, rooted API paths, Class.method names, snake_case
// identifiers. Rendered as flat text they read as a wall. RichText upgrades
// those tokens to inline <code> so the eye can separate prose from symbol, and
// preserves newlines as real line breaks. It never interprets markup — it only
// wraps recognised tokens — so untrusted content stays inert.

// Ordered alternation: earlier patterns win at a given position.
const TOKEN = new RegExp(
  [
    '`[^`]+`', // backtick spans, honoured as-is
    '[\\w-]+(?:/[\\w-]+)+\\.[A-Za-z]{1,6}(?![A-Za-z0-9])(?::\\d+(?:-\\d+)?(?:,\\s?\\d+(?:-\\d+)?)*)?', // path/with/slashes.ext:line
    '[\\w-]+\\.[A-Za-z]{1,6}(?![A-Za-z0-9])(?::\\d+(?:-\\d+)?(?:,\\s?\\d+(?:-\\d+)?)*)?', // file.ext(:line)
    '/[A-Za-z][\\w./-]{2,}', // /rooted/api/path
    '[A-Z][A-Za-z0-9]+\\.[a-zA-Z][A-Za-z0-9]+', // Class.method
    '[a-z]+_[a-z0-9_]+(?:/[a-z]+_[a-z0-9_]+)*', // snake_case, snake/snake
  ].join('|'),
  'g',
);

function renderLine(line: string, lineKey: string): ReactNode {
  if (!line) return null;
  const nodes: ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of line.matchAll(TOKEN)) {
    const at = match.index ?? 0;
    if (at > last) nodes.push(<Fragment key={`t${index}`}>{line.slice(last, at)}</Fragment>);
    const raw = match[0];
    const text = raw.startsWith('`') && raw.endsWith('`') ? raw.slice(1, -1) : raw;
    nodes.push(
      <code key={`c${index}`} className="rt-code">
        {text}
      </code>,
    );
    last = at + raw.length;
    index += 1;
  }
  if (last < line.length) nodes.push(<Fragment key={`t${index}`}>{line.slice(last)}</Fragment>);
  return <Fragment key={lineKey}>{nodes}</Fragment>;
}

export function RichText({ text, className }: { text: string; className?: string }) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  return (
    <span className={className ? `rt ${className}` : 'rt'}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 ? <br /> : null}
          {renderLine(line, `l${i}`)}
        </Fragment>
      ))}
    </span>
  );
}
