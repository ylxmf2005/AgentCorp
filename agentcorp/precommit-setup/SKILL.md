---
name: precommit-setup
description: "Use when AgentCorp needs to set up or improve repository pre-commit checks, commit-time guardrails, Git hook workflows, staged-file quality checks, or optional slow AI commit review with Codex or Claude. Use when the user asks to setup precommit, add commit constraints, wire local pre-commit hooks, or make AI review an opt-in pre-commit step."
---

# Precommit Setup

This is a reusable AgentCorp support capability, not a delivery phase and not a role with its own gate. Use it to add practical commit-time guardrails to a target repository without turning every commit into a slow delivery pipeline.

The goal is a fast default path plus optional deeper review: normal commits run quick deterministic checks; expensive Codex/Claude commit review is opt-in or conditionally triggered.

## Workflow

1. Inspect the target repository before choosing tools:
   - Existing hook systems: `.pre-commit-config.yaml`, `lefthook.yml`, `.husky/`, `.git/hooks/`, `package.json` hook scripts.
   - Existing quality commands: `Makefile`, `justfile`, `package.json`, `pyproject.toml`, `tox.ini`, `go.mod`, `Cargo.toml`, CI configs.
   - Existing commit rules in `AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`, or docs.
2. Preserve the repo's current hook tool when one exists.
3. If no hook tool exists, prefer the language-neutral `pre-commit` framework. Use Husky only for Node-first repos or repos already using Husky. Use Lefthook when the repo already uses it or is a multi-language monorepo that benefits from one fast hook runner.
4. Configure fast checks first. Keep default commit latency low.
5. Add commit constraints as explicit, readable checks.
6. Add AI commit review only as a slow optional path.
7. Run the hook locally and record exact install/test commands.

## Fast Default Checks

Default pre-commit checks should be deterministic, local, and quick. Prefer staged-file checks when the tool supports them.

Good default candidates:

- Whitespace, end-of-file, merge-conflict markers, large-file guard.
- Formatters or format checks already used by the repo.
- Linters already used by the repo.
- Type checks only when the repo already has a reasonably fast command.
- Targeted tests only when they are cheap and already local.
- Secret scanning when an existing tool is present or easy to add without heavy setup.

Avoid making full test suites, browser tests, dependency installs, network calls, or AI review mandatory on every commit.

## Commit Constraints

Implement commit constraints as local guardrails that are easy to understand and easy to bypass deliberately when needed.

Common constraints:

- Block commits with unresolved merge conflict markers.
- Block commits with obvious secrets or local credential files.
- Block commits that modify generated artifacts without source changes, when the repo has that convention.
- Block commits that include AgentCorp runtime artifacts such as `teamspace/`, unless the user explicitly wants to commit them.
- Block destructive or noisy churn such as whole-file formatting when the task only changed a small area, if the repo has a reliable detector.
- Enforce commit message style in `commit-msg` only when the repo already has a convention or the user asks for one.

Prefer clear failure messages that say what failed, why it matters, and the command to rerun.

## Optional AI Commit Review

Codex/Claude commit review is useful but slow. Do not wire it as an unconditional pre-commit step.

Use one of these trigger models:

- **Manual**: add a command such as `make ai-commit-review` or `npm run ai:commit-review`.
- **Environment opt-in**: run only when `AI_COMMIT_REVIEW=1` is set.
- **Path/risk based**: run only when staged files touch sensitive areas such as auth, payments, migrations, public APIs, or security policy.
- **Pre-push instead of pre-commit**: run before push when the team wants deeper checks without blocking every local save point.

The AI review should inspect the staged diff, not the entire working tree by default. It should return a concise pass/fail summary and write any detailed notes to a local ignored path such as `.agentcorp/commit-review/`.

When adding an AI review hook, make its failure behavior explicit:

- Default recommendation: warn but do not block unless the user requests blocking behavior.
- Blocking mode is acceptable for protected or high-risk repos, but must be opt-in.
- Always include a bypass path such as `SKIP=ai-commit-review git commit ...` or the hook tool's standard skip mechanism.

## Config Patterns

For `pre-commit`, prefer a small `.pre-commit-config.yaml` that starts with universal checks and adds repo-local commands only when they already exist.

Use local hooks for repo commands:

```yaml
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: trailing-whitespace
      - id: end-of-file-fixer
      - id: check-merge-conflict
      - id: check-added-large-files
  - repo: local
    hooks:
      - id: unit-check
        name: unit check
        entry: make test
        language: system
        pass_filenames: false
```

For optional AI review, make the guard explicit:

```sh
if [ "${AI_COMMIT_REVIEW:-0}" != "1" ]; then
  echo "AI commit review skipped; set AI_COMMIT_REVIEW=1 to run it."
  exit 0
fi
```

Use the local CLI the user has available. Do not invent non-existent flags; check `codex --help`, `claude --help`, or existing project scripts first.

## Verification

After setup, run:

1. The hook installer, such as `pre-commit install` or the repo's equivalent.
2. The full hook once, such as `pre-commit run --all-files`, unless it is known to be too expensive. If too expensive, run a targeted staged-file check and say why.
3. The optional AI review command in skip mode and opt-in mode when the CLI is available.
4. `git status --short` to confirm only intended setup files changed.

Report the installed tool, added/changed files, commands run, results, remaining slow checks, and how to bypass or opt into AI review.
