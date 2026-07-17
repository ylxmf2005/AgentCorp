import { build } from 'esbuild';
import { chmodSync } from 'node:fs';

await build({
  entryPoints: ['cli/src/index.tsx'],
  outfile: 'cli/dist/index.js',
  bundle: true,
  packages: 'external',
  platform: 'node',
  format: 'esm',
  target: 'node18',
  jsx: 'automatic',
  banner: { js: '#!/usr/bin/env node' },
  logLevel: 'warning',
});

chmodSync('cli/dist/index.js', 0o755);
