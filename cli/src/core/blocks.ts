import fs from 'node:fs';
import path from 'node:path';
import { globalRoot, userContextFile } from './paths.js';

export interface Block {
  owner: string;
  content: string;
  editHint: string;
}

const beginMarker = (owner: string) => `<!-- >>> LONGREIN BLOCK: ${owner} >>> -->`;
const endMarker = (owner: string) => `<!-- <<< LONGREIN BLOCK: ${owner} <<< -->`;

const ANY_BLOCK_RE =
  /<!-- >>> LONGREIN BLOCK: (.+?) >>> -->\n[\s\S]*?<!-- <<< LONGREIN BLOCK: \1 <<< -->\n?/g;

// Blocks written before the rename to longrein; stripped on every upsert.
const LEGACY_BLOCK_RE =
  /<!-- >>> GEMBA BLOCK: (.+?) >>> -->\n[\s\S]*?<!-- <<< GEMBA BLOCK: \1 <<< -->\n?/g;

/** Package-owned global blocks plus the optional user-owned context file. */
export function listBlocks(): Block[] {
  const root = globalRoot();
  const blocks = fs.existsSync(root)
    ? fs
        .readdirSync(root)
        .filter((f) => f.endsWith('.md'))
        .sort()
        .map((f) => ({
          owner: path.basename(f, '.md'),
          content: fs.readFileSync(path.join(root, f), 'utf8').trim(),
          editHint: `Managed by the longrein CLI. Edit global/${f} in the longrein repo, not here.`,
        }))
    : [];

  const contextPath = userContextFile();
  if (fs.existsSync(contextPath)) {
    const content = fs.readFileSync(contextPath, 'utf8').trim();
    if (content) {
      blocks.push({
        owner: 'user-context',
        content,
        editHint: `User-owned context. Edit ${contextPath}; longrein only injects it.`,
      });
    }
  }
  return blocks;
}

function renderBlock(block: Block): string {
  return [
    beginMarker(block.owner),
    `<!-- ${block.editHint} -->`,
    '',
    block.content,
    '',
    endMarker(block.owner),
  ].join('\n');
}

function stripManagedBlocks(text: string): string {
  return text.replace(ANY_BLOCK_RE, '').replace(LEGACY_BLOCK_RE, '').replace(/\n{3,}/g, '\n\n');
}

/** Idempotently (re)write all longrein blocks; user content outside markers is untouched. */
export function upsertBlocks(file: string, blocks: Block[]): { changed: boolean } {
  const original = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  let next = stripManagedBlocks(original).trimEnd();
  for (const block of blocks) {
    next = next ? `${next}\n\n${renderBlock(block)}` : renderBlock(block);
  }
  next += '\n';
  if (next !== original) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, next);
    return { changed: true };
  }
  return { changed: false };
}

/** Remove every longrein block (uninstall --all). */
export function removeBlocks(file: string): { changed: boolean } {
  if (!fs.existsSync(file)) return { changed: false };
  const original = fs.readFileSync(file, 'utf8');
  const next = stripManagedBlocks(original);
  if (next !== original) {
    fs.writeFileSync(file, next);
    return { changed: true };
  }
  return { changed: false };
}

export type BlockState = 'ok' | 'stale' | 'missing';

export interface BlockStatus {
  owner: string;
  state: BlockState;
}

export function blockStatus(file: string, blocks: Block[]): { statuses: BlockStatus[]; orphans: string[] } {
  const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
  const installed = new Map<string, string>();
  for (const m of text.matchAll(ANY_BLOCK_RE)) {
    installed.set(m[1], m[0]);
  }
  const statuses: BlockStatus[] = blocks.map((block) => {
    const current = installed.get(block.owner);
    if (!current) return { owner: block.owner, state: 'missing' };
    const expected = renderBlock(block) + '\n';
    return { owner: block.owner, state: current === expected ? 'ok' : 'stale' };
  });
  const owners = new Set(blocks.map((b) => b.owner));
  const orphans = [...installed.keys()].filter((o) => !owners.has(o));
  return { statuses, orphans };
}
