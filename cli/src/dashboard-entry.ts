import { Command } from 'commander';
import { registerDashboardCommand } from './dashboard-command.js';
import { LONGREIN_VERSION } from './version.js';

const program = new Command()
  .name('longrein')
  .description('Install and maintain the longrein engineering skills for Claude Code and Codex.')
  .version(LONGREIN_VERSION);

registerDashboardCommand(program);
await program.parseAsync();
