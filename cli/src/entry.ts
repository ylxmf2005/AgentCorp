import { LONGREIN_VERSION } from './version.js';

const command = process.argv[2];
const helpTarget = command === 'help' ? process.argv[3] : undefined;

if (command === '--version' || command === '-V') {
  console.log(LONGREIN_VERSION);
} else if (command === 'task' || helpTarget === 'task') {
  await import('./task-entry.js');
} else if (command === 'dashboard' || helpTarget === 'dashboard') {
  await import('./dashboard-entry.js');
} else if (command === 'mcp') {
  await import('./mcp-entry.js');
} else {
  await import('./index.js');
}
