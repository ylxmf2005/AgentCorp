<div align="center">

# AgentCorp

### Make coding agents prove their work.

**A software-delivery system for Claude Code and Codex.**

AgentCorp organizes a task as a planned, independently reviewed, and verified
delivery, with evidence you can inspect before you accept the result.

[![Claude Code](https://img.shields.io/badge/Claude%20Code-plugin-d97757)](#claude-code) [![Codex](https://img.shields.io/badge/Codex-plugin-1f2328)](#codex) [![Agent Skills](https://img.shields.io/badge/Agent%20Skills-open%20standard-6366f1)](docs/skills.md)

English · [简体中文](README_CN.md)

[Quick Start](#quick-start) · [Why AgentCorp](#why-agentcorp) · [How It Works](#how-it-works) · [38 Skills](docs/skills.md)

</div>

## Quick Start

### Claude Code

```text
/plugin marketplace add ylxmf2005/AgentCorp
/plugin install agentcorp@agentcorp
```

Run `/reload-plugins` or restart Claude Code.

### Codex

```text
codex plugin marketplace add ylxmf2005/AgentCorp
codex plugin add agentcorp@agentcorp
```

Start a new Codex task. You can also install **AgentCorp** from the `/plugins`
menu after adding the marketplace. Lifecycle hooks need one additional setup
step: [Codex setup](docs/codex-setup.md).

### Give it a task

In Claude Code:

```text
/agentcorp:delivery-orchestrator fix duplicate webhook deliveries and prove the regression is closed
```

In Codex:

```text
Use $agentcorp:delivery-orchestrator to fix duplicate webhook deliveries and prove the regression is closed.
```

Before changing code, the orchestrator defines what done means, recommends a
work path, and shows you the phases it intends to run. Omit the knobs and let it
recommend them; add `mode:`, `pace:`, `effort:`, or `lang:` when you want
explicit control.

## Why AgentCorp

Coding agents are fast. The hard part is knowing whether their result deserves
to ship. A single conversation often collapses author, reviewer, and tester
into the same context, so confident claims can pass as proof.

AgentCorp separates those responsibilities and makes the handoffs inspectable:

| Typical agent loop | AgentCorp |
| --- | --- |
| The agent writes the change and judges it | The workflow separates authors from approvers |
| A review finding immediately becomes a fix | The workflow requires `review-researcher` to re-prove it as a possible false positive |
| "Tests pass" is the end of the story | Claims point to a path, log, response, or screenshot you can open |
| A null check and a migration get the same process | Mode and effort scale the organization to the risk |
| Lessons disappear with the session | `compound` turns them into tests, repo rules, or reviewer proposals |

The result is not another prompt pack. It is an organization with contracts:
who produces each artifact, who may approve it, and what evidence must exist
before the work moves forward.

## What You Get

An orchestrated task is designed to leave a navigable record. A typical delivery
includes:

```text
teamspace/tasks/<task>/
├── task.md                              # success criteria, route, decisions, gate history
├── requirements/validated-requirements.md
├── implementation/implementation-result.md
├── review/code-review.md
├── verification/verification-report.md
├── acceptance/acceptance-decision.md
└── delivery/delivery-report.md
```

AgentCorp creates only the phases the task needs. Phase artifacts carry
structured frontmatter, and delegated handoffs are checked mechanically before
their claims are trusted. See the [full artifact layout](docs/artifacts.md).

## How It Works

[![AgentCorp delivery workflow](docs/assets/delivery-workflow.png)](docs/assets/delivery-workflow.excalidraw)

1. **Shape the work.** Confirm success criteria, decide what must be tested,
   and settle the design or diagnosis before implementation.
2. **Build and challenge it.** Implement from an approved story, run independent
   review lanes, and verify every routed finding before a fix lands.
3. **Prove, learn, and deliver.** Run the required verification, assemble the
   evidence for acceptance, compound reusable lessons, and issue a delivery report.

Human gates stop the flow at decisions that belong to you. Gate outcomes use a
closed vocabulary (`approved`, `skipped`, `revised`, `blocked`) and are recorded
rather than silently inferred.

## Scale the Process to the Risk

Four independent knobs tune a delivery:

| Knob | Values | Controls |
| --- | --- | --- |
| `mode:` | `direct` \| `partial` \| `full` | who executes the phases and who reviews them |
| `pace:` | `continuous` \| `guided` | checkpoint reporting or one-artifact-at-a-time teaching |
| `effort:` | `low` \| `medium` \| `high` \| `max` | how much independent coverage and redundancy to convene |
| `lang:` | any language | the language of every human-facing artifact |

Low effort trades redundancy for speed, never evidence for convenience.
The workflow requires deeper scrutiny for security, permission, public contract,
and data-loss surfaces. See the [parameter catalog](docs/parameters.md) for the
exact behavior of every level and skill.

## Use the Skills Directly

The Delivery Orchestrator drives end-to-end work, but every capability can also
be called on its own.

Claude Code:

```text
/agentcorp:code-review-lead depth:full review this diff
/agentcorp:parallel-researcher scope:both depth:source-verified compare workflow engines
/agentcorp:probe output:inline map the auth module before we change it
```

Codex:

```text
Use $agentcorp:code-review-lead to review this diff at depth:full.
Use $agentcorp:parallel-researcher to compare workflow engines with scope:both and depth:source-verified.
Use $agentcorp:probe to map the auth module before we change it, with output:inline.
```

Browse all [38 skills](docs/skills.md), from planning and implementation through
12 specialist review lanes, verification, acceptance, research, explanation,
browser testing, and skill evolution.

## Built to Be Checked

- The same 38 Agent Skill definitions serve Claude Code and Codex, backed by
  small helper scripts for validation, replay, browser sessions, and hooks.
- `validate-handoff.py` checks handoff envelopes for missing artifacts,
  mismatched owners or phases, and other consistency errors.
- Nine trap-seeded delivery scenarios model failure modes such as wrong issue
  diagnoses, test-editing shortcuts, hidden policy constraints, and browser-only
  defects.
- Twenty-four routing probes guard the boundaries between similar skills, and a
  23-expectation regression script covers validator edge cases.

The repository ships the scenarios and checks; it does not ask you to trust a
benchmark screenshot.

## Honest Limitations

- Markdown contracts constrain model behavior and make violations visible; they
  cannot make incorrect behavior impossible.
- The scenario suite is maintained by this project, not an independent benchmark.
  AgentCorp claims no SWE-bench score.
- Independent review costs tokens and wall-clock time. Use `effort:` to spend that
  cost where being wrong is expensive.
- AgentCorp deliberately has no frontend role and no merge/push owner. Frontend
  work needs an explicit waiver, and landing a branch remains under your control.
- The validators and trajectory extractor require Python 3.9+ and use only the
  standard library.

## Documentation

- [All 38 skills](docs/skills.md)
- [Parameters and effort levels](docs/parameters.md)
- [Runtime artifacts](docs/artifacts.md)
- [Codex setup](docs/codex-setup.md)

Questions and bug reports belong in [GitHub Issues](https://github.com/ylxmf2005/AgentCorp/issues).
