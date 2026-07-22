import { runLongreinMcpServer } from './mcp-server.js';
import {
  claudeMcpStatus,
  codexMcpStatus,
  installClaudeMcp,
  installCodexMcp,
  uninstallClaudeMcp,
  uninstallCodexMcp,
} from './core/codex-mcp.js';

function selectedHosts(): Array<'codex' | 'claude'> {
  const host = process.argv[4] ?? 'all';
  if (host === 'all') return ['codex', 'claude'];
  if (host === 'codex' || host === 'claude') return [host];
  throw new Error(`unknown MCP host: ${host}`);
}

function hostResults(action: 'install' | 'status' | 'uninstall') {
  return Object.fromEntries(
    selectedHosts().map((host) => {
      if (host === 'codex') {
        return [host, action === 'install' ? installCodexMcp() : action === 'uninstall' ? uninstallCodexMcp() : codexMcpStatus()];
      }
      return [host, action === 'install' ? installClaudeMcp() : action === 'uninstall' ? uninstallClaudeMcp() : claudeMcpStatus()];
    }),
  );
}

try {
  const action = process.argv[3];
  if (action === 'install') {
    const result = hostResults('install');
    console.log(JSON.stringify(result));
    if (Object.values(result).some((item) => item.state !== 'managed')) process.exitCode = 1;
  } else if (action === 'status') {
    const result = hostResults('status');
    console.log(JSON.stringify(result));
    if (Object.values(result).some((item) => item.state === 'unavailable')) process.exitCode = 1;
  } else if (action === 'uninstall') {
    const result = hostResults('uninstall');
    console.log(JSON.stringify(result));
    if (Object.values(result).some((item) => item.state === 'foreign' || item.state === 'unavailable')) process.exitCode = 1;
  } else if (action === '--help' || action === '-h') {
    console.log(
      'Usage: longrein mcp [install|status|uninstall] [all|codex|claude]\n\nWithout a subcommand, starts the stdio MCP server.',
    );
  } else if (action) {
    throw new Error(`unknown MCP action: ${action}`);
  } else {
    await runLongreinMcpServer();
  }
} catch (error) {
  console.error(`longrein MCP failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
