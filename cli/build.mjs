import { build } from 'esbuild';
import { chmodSync, cpSync, readFileSync, rmSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const define = { __LONGREIN_VERSION__: JSON.stringify(packageJson.version) };

rmSync(new URL('./dist/', import.meta.url), { recursive: true, force: true });

await build({
  entryPoints: {
    index: 'cli/src/entry.ts',
    'task-entry': 'cli/src/task-entry.ts',
    'dashboard-entry': 'cli/src/dashboard-entry.ts',
    'mcp-entry': 'cli/src/mcp-entry.ts',
  },
  outdir: 'cli/dist',
  bundle: true,
  splitting: true,
  entryNames: '[name]',
  chunkNames: 'chunks/[name]-[hash]',
  packages: 'external',
  platform: 'node',
  format: 'esm',
  target: 'node18',
  jsx: 'automatic',
  define,
  banner: { js: '#!/usr/bin/env node' },
  logLevel: 'warning',
});

// Browser bundle for the local Task Dashboard, served from cli/dist/dashboard.
await build({
  entryPoints: ['cli/src/dashboard/main.tsx'],
  outfile: 'cli/dist/dashboard/main.js',
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: 'es2020',
  jsx: 'automatic',
  minify: true,
  logLevel: 'warning',
});

cpSync('cli/src/dashboard/index.html', 'cli/dist/dashboard/index.html');
cpSync('cli/src/dashboard/styles.css', 'cli/dist/dashboard/styles.css');

chmodSync('cli/dist/index.js', 0o755);
