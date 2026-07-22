import { Command } from 'commander';
import pc from 'picocolors';
import { targets, Target, TargetFilter } from './core/paths.js';
import { listSkills, Skill } from './core/skills.js';
import { inspect, installSkill, pruneBrokenOwnLinks, uninstallSkill, SkillState } from './core/installer.js';
import { blockStatus, listBlocks, removeBlocks, upsertBlocks } from './core/blocks.js';
import { runDoctor } from './core/doctor.js';
import { LONGREIN_VERSION } from './version.js';
import {
  claudeMcpStatus,
  codexMcpStatus,
  installClaudeMcp,
  installCodexMcp,
  uninstallClaudeMcp,
  uninstallCodexMcp,
  CodexMcpStatus,
} from './core/codex-mcp.js';

const program = new Command();

interface CommonOpts {
  claude?: boolean;
  codex?: boolean;
}

function activeTargets(opts: CommonOpts): Target[] {
  const filter: TargetFilter = { claude: opts.claude, codex: opts.codex };
  return targets(filter);
}

function resolveSkills(names: string[]): Skill[] {
  const all = listSkills();
  if (names.length === 0) return all;
  const byName = new Map(all.map((s) => [s.name, s]));
  const missing = names.filter((n) => !byName.has(n));
  if (missing.length) {
    console.error(pc.red(`unknown skill(s): ${missing.join(', ')}`));
    console.error(pc.dim(`available: ${all.map((s) => s.name).join(', ')}`));
    process.exit(1);
  }
  return names.map((n) => byName.get(n)!);
}

function stateLabel(state: SkillState, stampVersion?: string): string {
  switch (state) {
    case 'linked':
      return pc.green('✓ linked');
    case 'copy-fresh':
      return pc.green(`✓ v${stampVersion ?? '?'}`);
    case 'copy-stale':
      return pc.yellow(`◐ stale v${stampVersion ?? '?'}`);
    case 'foreign-link':
      return pc.red('! foreign link');
    case 'foreign-dir':
      return pc.red('! foreign');
    case 'missing':
      return pc.dim('·');
  }
}

function syncBlocks(active: Target[], quiet = false): void {
  const blocks = listBlocks();
  for (const target of active) {
    const { changed } = upsertBlocks(target.instructionFile, blocks);
    if (!quiet) {
      const owners = blocks.map((b) => b.owner).join(', ');
      console.log(
        `  ${target.label.padEnd(12)} ${target.instructionFile}: ` +
          (changed ? pc.green(`blocks synced (${owners})`) : pc.dim(`blocks already in sync (${owners})`)),
      );
    }
  }
}

function hasCodex(active: Target[]): boolean {
  return active.some((target) => target.id === 'codex');
}

function hasClaude(active: Target[]): boolean {
  return active.some((target) => target.id === 'claude');
}

function mcpStateLabel(status: CodexMcpStatus): string {
  if (status.state === 'managed') return pc.green('✓ managed');
  if (status.state === 'missing') return pc.dim('· missing');
  if (status.state === 'foreign') return pc.yellow('! foreign');
  return pc.red('! unavailable');
}

function printStatus(opts: CommonOpts): void {
  const active = activeTargets(opts);
  const skills = listSkills();
  const blocks = listBlocks();

  console.log(pc.bold(`\nlongrein v${LONGREIN_VERSION}`));
  console.log(pc.dim(`source: ${skills[0] ? skills[0].dir.replace(/\/skills\/.*$/, '') : '(no skills found)'}\n`));

  const nameWidth = Math.max(...skills.map((s) => s.name.length), 5) + 2;
  const colWidth = 18;
  console.log(
    '  ' + 'skill'.padEnd(nameWidth) + active.map((t) => pc.bold(t.label.padEnd(colWidth))).join(''),
  );
  for (const skill of skills) {
    const cells = active.map((t) => {
      const found = inspect(t, skill);
      // pad on the raw label length (ANSI codes break padEnd)
      const label = stateLabel(found.state, found.stampVersion);
      const rawLen = label.replace(/\u001b\[[0-9;]*m/g, '').length;
      return label + ' '.repeat(Math.max(colWidth - rawLen, 1));
    });
    console.log('  ' + skill.name.padEnd(nameWidth) + cells.join(''));
  }

  console.log(pc.bold('\n  always-on blocks'));
  for (const target of active) {
    const { statuses, orphans } = blockStatus(target.instructionFile, blocks);
    const parts = statuses.map((s) => {
      if (s.state === 'ok') return pc.green(`${s.owner} ✓`);
      if (s.state === 'stale') return pc.yellow(`${s.owner} ◐`);
      return pc.dim(`${s.owner} ·`);
    });
    const orphanNote = orphans.length ? pc.red(`  orphans: ${orphans.join(', ')}`) : '';
    console.log(`  ${target.label.padEnd(nameWidth)}${parts.join('  ')}${orphanNote}`);
    console.log(pc.dim(`  ${''.padEnd(nameWidth)}${target.instructionFile}`));
  }
  if (hasCodex(active)) {
    const mcp = codexMcpStatus();
    console.log(pc.bold('\n  Codex MCP'));
    console.log(`  ${mcpStateLabel(mcp)}  ${pc.dim(mcp.detail)}`);
  }
  if (hasClaude(active)) {
    const mcp = claudeMcpStatus();
    console.log(pc.bold('\n  Claude Code MCP'));
    console.log(`  ${mcpStateLabel(mcp)}  ${pc.dim(mcp.detail)}`);
  }
  console.log();
}

program
  .name('longrein')
  .description('Install and maintain the longrein engineering skills for Claude Code and Codex.')
  .version(LONGREIN_VERSION);

program
  .command('install [skills...]')
  .description('install skills into ~/.claude/skills and ~/.codex/skills, and sync always-on blocks')
  .option('--link', 'symlink to this checkout instead of copying (development mode)', false)
  .option('--force', 'replace existing unmanaged dirs/links of the same name', false)
  .option('--no-blocks', 'skip syncing the always-on instruction blocks')
  .option('--claude', 'only target Claude Code')
  .option('--codex', 'only target Codex')
  .option('-y, --yes', 'non-interactive: install everything requested without the picker', false)
  .action(async (names: string[], opts) => {
    const active = activeTargets(opts);
    let skills = resolveSkills(names);

    if (names.length === 0 && !opts.yes && process.stdout.isTTY && process.stdin.isTTY) {
      const { pickSkills } = await import('./ui/Picker.js');
      const picked = await pickSkills(skills, opts.link ? 'link mode' : 'copy mode');
      if (picked === null) {
        console.log(pc.dim('cancelled'));
        return;
      }
      skills = resolveSkills(picked);
      if (skills.length === 0) {
        console.log(pc.dim('nothing selected'));
        return;
      }
    }

    console.log(pc.bold(`\ninstalling ${skills.length} skill(s) [${opts.link ? 'link' : 'copy'}]\n`));
    let problems = 0;
    for (const target of active) {
      console.log(pc.bold(`  ${target.label}`) + pc.dim(` → ${target.skillsDir}`));
      for (const skill of skills) {
        const result = installSkill(target, skill, { link: opts.link, force: opts.force });
        const icon =
          result.action === 'skipped' ? pc.red('✗') : result.action === 'unchanged' ? pc.dim('=') : pc.green('✓');
        if (result.action === 'skipped') problems++;
        console.log(`    ${icon} ${skill.name.padEnd(14)} ${pc.dim(result.detail)}`);
      }
      for (const removed of pruneBrokenOwnLinks(target)) {
        console.log(`    ${pc.green('✓')} ${removed.padEnd(14)} ${pc.dim('pruned broken longrein link')}`);
      }
    }
    if (opts.blocks !== false) {
      console.log(pc.bold('\n  always-on blocks'));
      syncBlocks(active);
    }
    if (hasCodex(active)) {
      console.log(pc.bold('\n  Codex MCP'));
      const mcp = installCodexMcp();
      console.log(`  ${mcpStateLabel(mcp)}  ${pc.dim(mcp.detail)}`);
      if (mcp.state !== 'managed') problems++;
    }
    if (hasClaude(active)) {
      console.log(pc.bold('\n  Claude Code MCP'));
      const mcp = installClaudeMcp();
      console.log(`  ${mcpStateLabel(mcp)}  ${pc.dim(mcp.detail)}`);
      if (mcp.state !== 'managed') problems++;
    }
    console.log();
    if (problems > 0) {
      console.log(pc.yellow(`${problems} item(s) skipped — rerun with --force to replace them, or see \`longrein doctor\`.\n`));
      process.exitCode = 1;
    }
  });

program
  .command('uninstall [skills...]')
  .description('remove longrein-managed skills; --all also removes the always-on blocks')
  .option('--all', 'remove every longrein skill and the managed instruction blocks', false)
  .option('--claude', 'only target Claude Code')
  .option('--codex', 'only target Codex')
  .action((names: string[], opts) => {
    if (!opts.all && names.length === 0) {
      console.error(pc.red('specify skill names or --all'));
      process.exit(1);
    }
    const active = activeTargets(opts);
    const skills = resolveSkills(opts.all ? [] : names);
    console.log();
    for (const target of active) {
      console.log(pc.bold(`  ${target.label}`));
      for (const skill of skills) {
        const result = uninstallSkill(target, skill);
        const icon = result.action === 'removed' ? pc.green('✓') : result.action === 'skipped' ? pc.red('✗') : pc.dim('·');
        console.log(`    ${icon} ${skill.name.padEnd(14)} ${pc.dim(result.detail)}`);
      }
      if (opts.all) {
        const { changed } = removeBlocks(target.instructionFile);
        console.log(
          `    ${changed ? pc.green('✓') : pc.dim('·')} ${'blocks'.padEnd(14)} ${pc.dim(
            changed ? `removed from ${target.instructionFile}` : 'none present',
          )}`,
        );
      }
    }
    if (opts.all && hasCodex(active)) {
      console.log(pc.bold('\n  Codex MCP'));
      const mcp = uninstallCodexMcp();
      console.log(`  ${mcpStateLabel(mcp)}  ${pc.dim(mcp.detail)}`);
    }
    if (opts.all && hasClaude(active)) {
      console.log(pc.bold('\n  Claude Code MCP'));
      const mcp = uninstallClaudeMcp();
      console.log(`  ${mcpStateLabel(mcp)}  ${pc.dim(mcp.detail)}`);
    }
    console.log();
  });

program
  .command('update')
  .description('refresh stale copies and re-sync the always-on blocks')
  .option('--claude', 'only target Claude Code')
  .option('--codex', 'only target Codex')
  .action((opts) => {
    const active = activeTargets(opts);
    const skills = listSkills();
    console.log();
    for (const target of active) {
      console.log(pc.bold(`  ${target.label}`));
      let touched = 0;
      for (const skill of skills) {
        const found = inspect(target, skill);
        if (found.state === 'copy-stale') {
          const result = installSkill(target, skill, { link: false, force: false });
          console.log(`    ${pc.green('✓')} ${skill.name.padEnd(14)} ${pc.dim(result.detail)}`);
          touched++;
        }
      }
      for (const removed of pruneBrokenOwnLinks(target)) {
        console.log(`    ${pc.green('✓')} ${removed.padEnd(14)} ${pc.dim('pruned broken longrein link')}`);
        touched++;
      }
      if (touched === 0) console.log(pc.dim('    all installed copies up to date'));
    }
    console.log(pc.bold('\n  always-on blocks'));
    syncBlocks(active);
    if (hasCodex(active)) {
      console.log(pc.bold('\n  Codex MCP'));
      const mcp = installCodexMcp();
      console.log(`  ${mcpStateLabel(mcp)}  ${pc.dim(mcp.detail)}`);
      if (mcp.state !== 'managed') process.exitCode = 1;
    }
    if (hasClaude(active)) {
      console.log(pc.bold('\n  Claude Code MCP'));
      const mcp = installClaudeMcp();
      console.log(`  ${mcpStateLabel(mcp)}  ${pc.dim(mcp.detail)}`);
      if (mcp.state !== 'managed') process.exitCode = 1;
    }
    console.log();
  });

program
  .command('status')
  .description('show install state per skill and target, plus block status')
  .option('--claude', 'only target Claude Code')
  .option('--codex', 'only target Codex')
  .action((opts) => printStatus(opts));

program
  .command('list')
  .description('list available skills (plain, scriptable)')
  .action(() => {
    for (const skill of listSkills()) {
      console.log(`${skill.name}\t${skill.description}`);
    }
  });

program
  .command('doctor')
  .description('detect leftovers from old install mechanisms, stale copies and broken markers')
  .option('--fix', 'apply safe fixes automatically', false)
  .option('--claude', 'only target Claude Code')
  .option('--codex', 'only target Codex')
  .action((opts) => {
    const findings = runDoctor(activeTargets(opts));
    if (findings.length === 0) {
      console.log(pc.green('\n  ✓ no problems found\n'));
      return;
    }
    console.log();
    let unfixed = 0;
    for (const finding of findings) {
      const tag =
        finding.severity === 'error' ? pc.red('error') : finding.severity === 'warn' ? pc.yellow('warn ') : pc.cyan('info ');
      console.log(`  ${tag} ${finding.message}`);
      if (finding.fix && opts.fix) {
        console.log(`        ${pc.green('fixed:')} ${finding.fix()}`);
      } else if (finding.fix) {
        unfixed++;
      }
    }
    console.log();
    if (unfixed > 0 && !opts.fix) {
      console.log(pc.dim(`  ${unfixed} finding(s) can be fixed automatically: longrein doctor --fix\n`));
    }
    if (findings.some((f) => f.severity === 'error')) process.exitCode = 1;
  });

program.command('task').description('create, register, inspect and update persistent Longrein Tasks');
program.command('dashboard').description('open the local Longrein Task Dashboard');
program.command('mcp').description('run or manage the Longrein stdio MCP server for Codex and Claude Code');

// bare `longrein` → status dashboard
if (process.argv.length <= 2) {
  printStatus({});
} else {
  await program.parseAsync();
}
