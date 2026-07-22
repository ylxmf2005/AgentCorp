import type { ReactNode } from 'react';
import { Fragment } from 'react';
import { Mermaid } from './Mermaid';

// A small, dependency-free Markdown renderer covering the constructs that show
// up in real Longrein artifacts: headings, lists, tables, code fences, inline
// code, emphasis and links. It renders to React elements only — never via
// dangerouslySetInnerHTML — so arbitrary artifact content cannot inject markup.
//
// Keys are positional (derived from block/inline index), so re-rendering the
// same document — e.g. on the detail page's 5s auto-refresh — reconciles in
// place instead of remounting the whole subtree. Remounting would flash the
// content and force embedded Mermaid diagrams to re-render on every poll.

function renderInline(text: string, keyPrefix: string): ReactNode {
  // Tokenize by code spans first so formatting inside them is left alone.
  const parts = text.split(/(`[^`]*`)/g);
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return (
        <code key={`${keyPrefix}-c${index}`} className="md-code">
          {part.slice(1, -1)}
        </code>
      );
    }
    return renderEmphasis(part, `${keyPrefix}-${index}`);
  });
}

function renderEmphasis(text: string, keyPrefix: string): ReactNode {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    if (match[1]) nodes.push(<strong key={`${keyPrefix}-e${i}`}>{token.slice(2, -2)}</strong>);
    else if (match[2]) nodes.push(<em key={`${keyPrefix}-e${i}`}>{token.slice(1, -1)}</em>);
    else if (match[3]) {
      const linkMatch = /\[([^\]]+)\]\(([^)]+)\)/.exec(token)!;
      const href = linkMatch[2];
      const safe = /^(https?:|mailto:|#|\/)/i.test(href);
      nodes.push(
        safe ? (
          <a key={`${keyPrefix}-e${i}`} href={href} target="_blank" rel="noreferrer noopener">
            {linkMatch[1]}
          </a>
        ) : (
          <span key={`${keyPrefix}-e${i}`}>{linkMatch[1]}</span>
        ),
      );
    }
    last = match.index + token.length;
    i += 1;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes.length ? <Fragment key={`${keyPrefix}-f`}>{nodes}</Fragment> : text;
}

interface Block {
  kind: 'heading' | 'para' | 'ul' | 'ol' | 'code' | 'table' | 'quote' | 'hr';
  level?: number;
  lines?: string[];
  text?: string;
  lang?: string;
  rows?: string[][];
}

function splitBlocks(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    // fenced code
    const fence = /^```(\w+)?\s*$/.exec(line);
    if (fence) {
      const body: string[] = [];
      i += 1;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i += 1;
      }
      i += 1; // closing fence
      blocks.push({ kind: 'code', lang: fence[1] ?? '', text: body.join('\n') });
      continue;
    }
    // heading
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }
    // hr
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      blocks.push({ kind: 'hr' });
      i += 1;
      continue;
    }
    // table (a row of pipes followed by a --- separator row)
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const rows: string[][] = [];
      const parseRow = (raw: string) =>
        raw
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((cell) => cell.trim());
      rows.push(parseRow(line));
      i += 2; // skip separator
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) {
        rows.push(parseRow(lines[i]));
        i += 1;
      }
      blocks.push({ kind: 'table', rows });
      continue;
    }
    // blockquote
    if (/^\s*>\s?/.test(line)) {
      const body: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      blocks.push({ kind: 'quote', text: body.join(' ') });
      continue;
    }
    // unordered list
    if (/^\s*[-*+]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*+]\s+/, ''));
        i += 1;
      }
      blocks.push({ kind: 'ul', lines: items });
      continue;
    }
    // ordered list
    if (/^\s*\d+[.)]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
        i += 1;
      }
      blocks.push({ kind: 'ol', lines: items });
      continue;
    }
    // paragraph: gather until blank line or a new block starter
    const para: string[] = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|```|\s*[-*+]\s|\s*\d+[.)]\s|\s*>\s?)/.test(lines[i])
    ) {
      para.push(lines[i]);
      i += 1;
    }
    blocks.push({ kind: 'para', text: para.join(' ') });
  }
  return blocks;
}

export function Markdown({ text }: { text: string }) {
  const blocks = splitBlocks(text);
  return (
    <div className="md">
      {blocks.map((block, index) => {
        const bk = `b${index}`;
        switch (block.kind) {
          case 'heading': {
            const level = Math.min(block.level ?? 1, 4);
            const Tag = (`h${level}`) as 'h1';
            return <Tag key={bk}>{renderInline(block.text ?? '', bk)}</Tag>;
          }
          case 'para':
            return <p key={bk}>{renderInline(block.text ?? '', bk)}</p>;
          case 'ul':
            return (
              <ul key={bk}>
                {(block.lines ?? []).map((item, itemIndex) => (
                  <li key={`${bk}-${itemIndex}`}>{renderInline(item, `${bk}-${itemIndex}`)}</li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={bk}>
                {(block.lines ?? []).map((item, itemIndex) => (
                  <li key={`${bk}-${itemIndex}`}>{renderInline(item, `${bk}-${itemIndex}`)}</li>
                ))}
              </ol>
            );
          case 'code':
            if ((block.lang ?? '').toLowerCase() === 'mermaid') {
              return <Mermaid key={bk} code={block.text ?? ''} />;
            }
            return (
              <pre key={bk} className="md-pre">
                <code>{block.text}</code>
              </pre>
            );
          case 'quote':
            return <blockquote key={bk}>{renderInline(block.text ?? '', bk)}</blockquote>;
          case 'hr':
            return <hr key={bk} />;
          case 'table': {
            const rows = block.rows ?? [];
            const [head, ...body] = rows;
            return (
              <div key={bk} className="md-table-wrap">
                <table>
                  {head ? (
                    <thead>
                      <tr>
                        {head.map((cell, cellIndex) => (
                          <th key={cellIndex}>{renderInline(cell, `${bk}-h${cellIndex}`)}</th>
                        ))}
                      </tr>
                    </thead>
                  ) : null}
                  <tbody>
                    {body.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>{renderInline(cell, `${bk}-${rowIndex}-${cellIndex}`)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          default:
            return null;
        }
      })}
    </div>
  );
}
