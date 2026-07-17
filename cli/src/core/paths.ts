import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** Walk up from the compiled entry until we find longrein's own package.json. */
export function packageRoot(): string {
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (;;) {
    const pj = path.join(dir, 'package.json');
    if (fs.existsSync(pj)) {
      try {
        if (JSON.parse(fs.readFileSync(pj, 'utf8')).name === 'longrein') return dir;
      } catch {
        /* keep walking */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) throw new Error('cannot locate the longrein package root');
    dir = parent;
  }
}

export function packageVersion(): string {
  const pj = JSON.parse(fs.readFileSync(path.join(packageRoot(), 'package.json'), 'utf8'));
  return pj.version as string;
}

export const skillsRoot = (): string => path.join(packageRoot(), 'skills');
export const globalRoot = (): string => path.join(packageRoot(), 'global');
export const userContextFile = (): string => path.join(os.homedir(), '.longrein', 'user-context.md');

export type TargetId = 'claude' | 'codex';

export interface Target {
  id: TargetId;
  label: string;
  skillsDir: string;
  instructionFile: string;
}

export interface TargetFilter {
  claude?: boolean;
  codex?: boolean;
}

export function targets(filter?: TargetFilter): Target[] {
  const home = os.homedir();
  const all: Target[] = [
    {
      id: 'claude',
      label: 'Claude Code',
      skillsDir: path.join(home, '.claude', 'skills'),
      instructionFile: path.join(home, '.claude', 'CLAUDE.md'),
    },
    {
      id: 'codex',
      label: 'Codex',
      skillsDir: path.join(home, '.codex', 'skills'),
      instructionFile: path.join(home, '.codex', 'AGENTS.md'),
    },
  ];
  if (!filter || (!filter.claude && !filter.codex)) return all;
  return all.filter((t) => (t.id === 'claude' && filter.claude) || (t.id === 'codex' && filter.codex));
}
