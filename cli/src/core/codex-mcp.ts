import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

export type CodexMcpState = 'missing' | 'managed' | 'foreign' | 'unavailable';

export interface CodexMcpStatus {
  state: CodexMcpState;
  detail: string;
  command?: string;
  args?: string[];
}

interface CodexMcpConfig {
  name?: string;
  transport?: {
    type?: string;
    command?: string;
    args?: string[];
  };
}

interface ClaudeUserConfig {
  mcpServers?: Record<string, { type?: string; command?: string; args?: string[] }>;
}

function currentCliEntry(): string {
  return fs.realpathSync(process.argv[1]);
}

function longreinExecutable(): string | null {
  const names = process.platform === 'win32' ? ['longrein.cmd', 'longrein.exe', 'longrein'] : ['longrein'];
  for (const directory of (process.env.PATH ?? '').split(path.delimiter).filter(Boolean)) {
    for (const name of names) {
      const candidate = path.resolve(directory, name);
      try {
        fs.accessSync(candidate, fs.constants.X_OK);
        if (packageNameForEntry(fs.realpathSync(candidate)) === 'longrein') return candidate;
      } catch {
        // Continue to the next PATH entry.
      }
    }
  }
  return null;
}

function preferredServerCommand(): { command: string; args: string[] } {
  const entry = currentCliEntry();
  const executable = longreinExecutable();
  return executable ? { command: executable, args: ['mcp'] } : { command: process.execPath, args: [entry, 'mcp'] };
}

function packageNameForEntry(entry: string): string | null {
  let directory = path.dirname(entry);
  for (;;) {
    const packageFile = path.join(directory, 'package.json');
    try {
      const value = JSON.parse(fs.readFileSync(packageFile, 'utf8')) as { name?: string };
      if (value.name) return value.name;
    } catch {
      // Keep walking until a package boundary is found.
    }
    const parent = path.dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}

function managedConfig(config: CodexMcpConfig): boolean {
  const transport = config.transport;
  if (transport?.type !== 'stdio' || !transport.command || !transport.args) return false;
  if (transport.args.length === 1 && transport.args[0] === 'mcp' && path.isAbsolute(transport.command)) {
    try {
      return packageNameForEntry(fs.realpathSync(transport.command)) === 'longrein';
    } catch {
      return false;
    }
  }
  if (transport.args.length !== 2 || transport.args[1] !== 'mcp') return false;
  const entry = transport.args[0];
  if (!path.isAbsolute(entry)) return false;
  try {
    return packageNameForEntry(fs.realpathSync(entry)) === 'longrein';
  } catch {
    return false;
  }
}

function readConfig(): { status: CodexMcpStatus; config?: CodexMcpConfig } {
  const result = spawnSync('codex', ['mcp', 'get', 'longrein', '--json'], { encoding: 'utf8' });
  if (result.error) {
    return { status: { state: 'unavailable', detail: `Codex CLI unavailable: ${result.error.message}` } };
  }
  if (result.status !== 0) {
    const message = `${result.stdout}${result.stderr}`.trim();
    if (/No MCP server named ['"]?longrein['"]? found/i.test(message)) {
      return { status: { state: 'missing', detail: 'Longrein MCP is not registered in Codex.' } };
    }
    return { status: { state: 'unavailable', detail: message || `codex mcp get exited ${result.status}` } };
  }
  try {
    const config = JSON.parse(result.stdout) as CodexMcpConfig;
    const transport = config.transport;
    const status: CodexMcpStatus = managedConfig(config)
      ? {
          state: 'managed',
          detail: 'Codex uses the Longrein stdio MCP.',
          command: transport?.command,
          args: transport?.args,
        }
      : {
          state: 'foreign',
          detail: 'A different MCP server already uses the name longrein; it was not changed.',
          command: transport?.command,
          args: transport?.args,
        };
    return { status, config };
  } catch (error) {
    return {
      status: {
        state: 'unavailable',
        detail: `Codex returned invalid MCP configuration: ${error instanceof Error ? error.message : String(error)}`,
      },
    };
  }
}

export function codexMcpStatus(): CodexMcpStatus {
  return readConfig().status;
}

export function installCodexMcp(): CodexMcpStatus {
  const current = readConfig().status;
  if (current.state === 'foreign' || current.state === 'unavailable') return current;
  const { command, args } = preferredServerCommand();
  if (current.state === 'managed' && current.command === command && JSON.stringify(current.args) === JSON.stringify(args)) {
    return { ...current, detail: 'Codex Longrein MCP is already current.' };
  }
  try {
    execFileSync('codex', ['mcp', 'add', 'longrein', '--', command, ...args], {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    return {
      state: 'managed',
      detail: current.state === 'missing' ? 'Registered Longrein MCP in Codex.' : 'Updated the Codex Longrein MCP entry.',
      command,
      args,
    };
  } catch (error) {
    return { state: 'unavailable', detail: `Could not register Longrein MCP: ${error instanceof Error ? error.message : String(error)}` };
  }
}

function claudeConfigFile(): string {
  return path.join(os.homedir(), '.claude.json');
}

export function claudeMcpStatus(): CodexMcpStatus {
  const file = claudeConfigFile();
  if (!fs.existsSync(file)) return { state: 'missing', detail: 'Longrein MCP is not registered in Claude Code.' };
  try {
    const config = JSON.parse(fs.readFileSync(file, 'utf8')) as ClaudeUserConfig;
    const entry = config.mcpServers?.longrein;
    if (!entry) return { state: 'missing', detail: 'Longrein MCP is not registered in Claude Code.' };
    const wrapped: CodexMcpConfig = { transport: entry };
    return managedConfig(wrapped)
      ? { state: 'managed', detail: 'Claude Code uses the Longrein stdio MCP.', command: entry.command, args: entry.args }
      : {
          state: 'foreign',
          detail: 'A different Claude Code MCP server already uses the name longrein; it was not changed.',
          command: entry.command,
          args: entry.args,
        };
  } catch (error) {
    return {
      state: 'unavailable',
      detail: `Claude Code returned invalid MCP configuration: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

function addClaudeMcp(command: string, args: string[]): void {
  execFileSync('claude', ['mcp', 'add', '--scope', 'user', 'longrein', '--', command, ...args], {
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf8',
  });
}

export function installClaudeMcp(): CodexMcpStatus {
  const current = claudeMcpStatus();
  if (current.state === 'foreign' || current.state === 'unavailable') return current;
  const preferred = preferredServerCommand();
  if (
    current.state === 'managed' &&
    current.command === preferred.command &&
    JSON.stringify(current.args) === JSON.stringify(preferred.args)
  ) {
    return { ...current, detail: 'Claude Code Longrein MCP is already current.' };
  }
  try {
    if (current.state === 'managed') execFileSync('claude', ['mcp', 'remove', '--scope', 'user', 'longrein']);
    addClaudeMcp(preferred.command, preferred.args);
    return {
      state: 'managed',
      detail: current.state === 'missing' ? 'Registered Longrein MCP in Claude Code.' : 'Updated the Claude Code Longrein MCP entry.',
      ...preferred,
    };
  } catch (error) {
    if (current.state === 'managed' && current.command && current.args) {
      try {
        addClaudeMcp(current.command, current.args);
      } catch {
        // The returned error still reports that the managed entry could not be updated.
      }
    }
    return {
      state: 'unavailable',
      detail: `Could not register Longrein MCP in Claude Code: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function uninstallClaudeMcp(): CodexMcpStatus {
  const current = claudeMcpStatus();
  if (current.state !== 'managed') return current;
  try {
    execFileSync('claude', ['mcp', 'remove', '--scope', 'user', 'longrein'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      encoding: 'utf8',
    });
    return { state: 'missing', detail: 'Removed the Longrein-managed MCP entry from Claude Code.' };
  } catch (error) {
    return {
      state: 'unavailable',
      detail: `Could not remove Longrein MCP from Claude Code: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function uninstallCodexMcp(): CodexMcpStatus {
  const current = readConfig().status;
  if (current.state !== 'managed') return current;
  try {
    execFileSync('codex', ['mcp', 'remove', 'longrein'], { stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' });
    return { state: 'missing', detail: 'Removed the Longrein-managed MCP entry from Codex.' };
  } catch (error) {
    return { state: 'unavailable', detail: `Could not remove Longrein MCP: ${error instanceof Error ? error.message : String(error)}` };
  }
}
