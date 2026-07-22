// Matches bracketed reference tags such as [UD-001], [UD-12], [CE-003].
const REF_PATTERN = /\[([A-Z]{2,3}-\d+)\]/;
const REF_GLOBAL = /\[([A-Z]{2,3}-\d+)\]/g;

export interface RefParts {
  prefix: string;
  rest: string;
}

export function splitRef(text: string): RefParts | null {
  const match = REF_PATTERN.exec(text);
  if (!match) return null;
  return { prefix: match[1], rest: text.slice(match.index + match[0].length).trim() };
}

// Render text, upgrading every [XX-###] reference into a styled tag (goal
// headlines sometimes carry a run of them, e.g. [UD-002][UD-003][UD-004]).
export function RefText({ text }: { text: string }) {
  if (!REF_PATTERN.test(text)) return <>{text}</>;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let index = 0;
  for (const match of text.matchAll(REF_GLOBAL)) {
    const at = match.index ?? 0;
    if (at > last) nodes.push(<span key={`t${index}`}>{text.slice(last, at)}</span>);
    nodes.push(
      <span key={`r${index}`} className="ref-tag">
        {match[1]}
      </span>,
    );
    last = at + match[0].length;
    index += 1;
  }
  if (last < text.length) nodes.push(<span key={`t${index}`}>{text.slice(last)}</span>);
  return <>{nodes}</>;
}

// A single scoped/commitment item rendered as a structured line: the reference
// tag as an anchor, the statement as body text.
export function RefLine({ text, icon }: { text: string; icon?: React.ReactNode }) {
  const parts = splitRef(text);
  return (
    <li className="refline">
      {icon ? <span className="refline-icon">{icon}</span> : null}
      {parts ? <span className="ref-tag">{parts.prefix}</span> : null}
      <span className="refline-text">{parts ? <RefText text={parts.rest} /> : text}</span>
    </li>
  );
}
