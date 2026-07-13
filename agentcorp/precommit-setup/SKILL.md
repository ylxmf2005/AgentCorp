---
name: precommit-setup
description: "Use when AgentCorp needs to set up or improve repository pre-commit checks, commit-time guardrails, Git hook workflows, staged-file quality checks, or optional slow AI commit review with Codex or Claude. Use when the user asks to setup precommit, add commit constraints, wire local pre-commit hooks, or make AI review an opt-in pre-commit step."
argument-hint: "[runtime:claude|codex|both]"
---

# precommit-setup

This is a reusable AgentCorp support capability, not a delivery phase and not a role with its own gate. **Your question: what commit-time guardrails will this repo actually keep using?** Hook setups die in two opposite ways: too heavy (the full test suite in pre-commit → within a week everyone commits `--no-verify`; the guardrail trained people to bypass guardrails) and too hollow (plausible YAML that was never executed → breaks on the first real commit). Both share one habit — treating the config file, rather than an observed hook run, as the deliverable.

## The iron law

```
A HOOK YOU HAVE NOT RUN IS A HOOK YOU DO NOT HAVE — RUN IT, OR REPORT UNVERIFIED.
```

## Parameters

`runtime:claude|codex|both` — which runtime's hook mounting to install; default `both` when both are configured in the host repo, otherwise the one that is present; when neither is configured, ask one short question (which runtime to wire) instead of guessing.

Unknown keys get a one-line note and are otherwise ignored; a missing load-bearing value gets one short question, never a guess.

## Workflow

1. Inspect before choosing tools: existing hook systems (`.pre-commit-config.yaml`, `lefthook.yml`, `.husky/`, `.git/hooks/`, `package.json` scripts), existing quality commands (`Makefile`, `justfile`, `pyproject.toml`, CI configs), existing commit rules (`AGENTS.md`, `CLAUDE.md`, `CONTRIBUTING.md`).
2. An existing hook tool always wins — never migrate without an explicit request. With none present, prefer the language-neutral `pre-commit` framework; Husky for Node-first repos; Lefthook for multi-language monorepos or repos already on it.
3. Configure fast checks inside the latency budget, then constraints, then AI review as a slow opt-in path.
4. Run the hook and record exact install/verify commands.

## Fast default checks

Deterministic, local, quick; prefer staged-file checks. **Budget: the whole default hook under ~5 seconds on a typical commit; any single check regularly over ~10 seconds moves to the opt-in or pre-push path.** Good candidates (pick what the repo already supports — this list is examples, not a quota): whitespace/EOF/merge-marker/large-file guards, the repo's own formatters and linters, type checks or targeted tests only when they fit the budget, secret scanning when a tool is present or trivial to add. Full test suites, browser tests, dependency installs, network calls, and AI review never run mandatorily on every commit — full suites belong to CI and the test phase.

## Commit constraints

Local guardrails, easy to understand, deliberately bypassable. Common ones: block unresolved conflict markers; block obvious secrets or credential files; block generated artifacts changed without source changes (when the repo has that convention); block AgentCorp runtime artifacts such as `teamspace/` unless the user wants them committed; enforce commit-message style in `commit-msg` only when a convention exists or is requested. Every failure message says what failed, why it matters, and the command to rerun.

## Optional AI commit review

Never wire Codex/Claude review as an unconditional pre-commit step. Trigger models: **manual command** (`make ai-commit-review`), **environment opt-in** (`AI_COMMIT_REVIEW=1` — the default, paired with a manual command), **path/risk-based** (auth, payments, migrations, public APIs — only when the user names the areas), or **pre-push**. It inspects the staged diff, returns a concise pass/fail, and writes detailed notes to a gitignored path such as `.agentcorp/commit-review/` — add the ignore entry yourself; notes contain diff excerpts and must never enter history. Failure behavior: warn by default; blocking is opt-in and always ships with a bypass (`SKIP=ai-commit-review git commit ...` or the tool's standard skip). An AI commit-review hook never substitutes for the review phase's code review.

## Config patterns

Read `references/config-patterns.md` before writing any hook config and copy from it — copy-ready pre-commit / Husky / Lefthook templates, the AI-review guard script, and the failure-message pattern. Two rules travel with every template: `repo: local` is for fast repo commands only, never `make test`; use only CLIs the user actually has — check `codex --help` / `claude --help` / project scripts before writing flags.

## Verification

Actually run, in this environment: the installer (`pre-commit install` or equivalent); the full hook once (`pre-commit run --all-files`) — if it exceeds the budget, run a targeted staged-file check and say what you skipped and why; the AI review command in skip and opt-in modes when the CLI exists; `git status --short` to confirm only intended files changed. If the tool cannot be installed or run here (no network, no binary, sandboxed shell), report **UNVERIFIED** with the exact commands the user must run. Report: installed tool, added/changed files, commands run with results, remaining slow checks, bypass/opt-in instructions, and status (verified / partial / UNVERIFIED).

## Red flags — stop when you catch yourself thinking

| Thought | Reality |
| --- | --- |
| "The config is standard YAML; it will work." | Unexecuted hooks fail on paths, missing binaries, and typos. |
| "`pre-commit` is preferred, so I'll replace what's here." | The existing tool wins. Migration needs an explicit request. |
| "`make test` in the hook catches more bugs." | It also makes every commit slow until people bypass hooks entirely. |
| "I'll skip `run --all-files`; it's probably slow." | "Probably" is not a measurement. Run it once and time it; skip only with the budget as evidence, and say so. |
| "The notes dir will get ignored eventually." | Nothing ignores it but you — and it stages diff excerpts into history on the next commit. |

## Output

Hook configs, scripts, and failure messages follow the target repo's language and conventions; any AgentCorp report artifact keeps zh-CN human prose with identifiers and commands verbatim. Never write task artifacts into the skill directory; `teamspace/` stays local (add to `.git/info/exclude` if untracked; never stage, commit, or push it).
