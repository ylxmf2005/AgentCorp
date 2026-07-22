import { spawn } from 'node:child_process';
import { Command, OptionValues } from 'commander';
import pc from 'picocolors';
import { startDashboardServer } from './dashboard-server.js';

function openBrowser(url: string): void {
  const command = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'cmd' : 'xdg-open';
  const args = process.platform === 'win32' ? ['/c', 'start', '', url] : [url];
  const child = spawn(command, args, { detached: true, stdio: 'ignore' });
  child.on('error', (error) => {
    console.error(pc.yellow(`warn: could not open the browser automatically: ${error.message}`));
  });
  child.unref();
}

export function registerDashboardCommand(program: Command): void {
  program
    .command('dashboard')
    .description('start the local read-only Task Dashboard backend')
    .option('--port <port>', 'loopback port; defaults to an available port', (value) => Number.parseInt(value, 10), 0)
    .option('--no-open', 'do not open the browser automatically')
    .action(async (opts: OptionValues) => {
      try {
        if (!Number.isInteger(opts.port) || opts.port < 0 || opts.port > 65535) {
          throw new Error('dashboard --port must be an integer from 0 to 65535');
        }
        const handle = await startDashboardServer({ port: opts.port });
        console.log(pc.green('✓ Longrein Dashboard backend is running'));
        console.log(`URL: ${handle.url}`);
        console.log(`API: http://${handle.host}:${handle.port}/api/v1`);
        console.log(pc.dim('Read-only; press Ctrl-C to stop.'));
        if (opts.open) openBrowser(handle.url);
      } catch (error) {
        console.error(pc.red(`error: ${error instanceof Error ? error.message : String(error)}`));
        process.exitCode = 1;
      }
    });
}
