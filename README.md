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

Pass the work directly to the relevant skill. The Delivery Orchestrator chooses
the workflow parameters for an end-to-end task; the Code Review Lead chooses
the review depth from the diff and its risk:

```text
/agentcorp:delivery-orchestrator <your prompt>
/agentcorp:code-review-lead <your diff or review request>
```

Parameters remain available when you need explicit control; otherwise the skill
infers them from the task, repository, and risk surface.

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

An orchestrated task is designed to leave a navigable record. The full layout
keeps cross-task knowledge beside each task's decisions and evidence:

```text
teamspace/
├── testing-context.md                   # shared runtime and test facts
├── compound/                            # reusable lessons from prior tasks
│   └── <lesson>.md
├── knowledge/                           # reusable research snapshots
│   └── <technology>/INDEX.md
├── probes/                              # standalone territory reports
│   └── <date>-<topic>.md
├── walkthroughs/                        # standalone teaching artifacts
│   └── <change>.html
└── tasks/<task>/
    ├── task.md                          # success criteria, route, decisions, gates
    ├── manifest.md                      # phase, owner, quality gate, artifact, receipt
    ├── probe/
    │   └── 00-probe.md                  # unknowns and corrected assumptions
    ├── handoffs/                        # delegated assignments and receipts
    │   ├── <phase>.md
    │   └── <phase>-receipt.md
    ├── requirements/
    │   └── validated-requirements.md
    ├── design/
    │   ├── architecture.md
    │   ├── impact-analysis.md
    │   ├── diagnosis.md
    │   └── interface-contract.md
    ├── test/
    │   ├── test-plan.md
    │   ├── api-test-plan.md
    │   ├── e2e-test-plan.md
    │   ├── regression-test-plan.md
    │   ├── test-plan-review.md
    │   └── exploration/
    │       ├── charters.md
    │       ├── frontier.md
    │       └── journal.md
    ├── implementation/
    │   ├── implementation-story.md
    │   └── implementation-result.md
    ├── review/
    │   ├── plan-review.md
    │   ├── plan-review-findings/
    │   ├── code-review.md
    │   ├── specialist-findings/
    │   │   └── <reviewer>.md
    │   ├── research/
    │   │   ├── 00-index.md              # every finding is rechecked
    │   │   ├── 001-confirmed-....md
    │   │   └── 002-false-positive-....md
    │   ├── fix-records/
    │   │   └── <file-group>.md
    │   └── fix-result.md
    ├── research/<topic>/                # hands-on research packages
    │   ├── 00-report.md
    │   ├── env/
    │   ├── sources/
    │   └── experiments/
    ├── explain/                         # persisted decision explanations
    │   └── <topic>/
    │       ├── 00-index.md
    │       └── 001-context.md
    ├── walkthrough/
    │   └── <change>.html                # background, intuition, story, quiz
    ├── verification/
    │   ├── assignments/
    │   │   └── <tester>.md
    │   ├── test-results/
    │   │   └── <tester>.md
    │   └── verification-report.md
    ├── acceptance/
    │   ├── acceptance-package.md
    │   └── acceptance-decision.md
    ├── compound/
    │   └── compound-result.md
    └── delivery/
        └── delivery-report.md
```

Not every task creates every optional file, but every phase it does run has an
accountable home. Phase artifacts carry structured frontmatter, and delegated
handoffs are checked mechanically before their claims are trusted. See the
[full artifact layout](docs/artifacts.md).

## How It Works

[![AgentCorp delivery workflow](docs/assets/delivery-workflow.png)](docs/assets/delivery-workflow.excalidraw)

AgentCorp follows the loop philosophy described in
[Judgment Is Not a Moat, but a Water Source](https://efgli.com/posts/source-not-the-moat/):
when AI makes prediction and action cheap, the scarce assets are accumulated
context, practiced judgment, and a human willing to own the outcome. The goal
is not a longer process. It is a loop that increases feedback density and leaves
the human better able to participate in the next decision.

The main threat is the **unknown unknown**: the constraint nobody stated, the
coupling outside the diff, the tacit preference that appears only after seeing
the wrong design, or the confident review finding that is not actually true.
AgentCorp reduces that uncertainty in five moves:

1. **Discover blind spots.** Probe the territory, expose assumptions, and turn
   unknown unknowns into questions before they harden into implementation.
2. **Make judgment explicit.** Requirements, tests, design decisions, boundaries,
   and trade-offs become inspectable contracts instead of temporary chat context.
3. **Challenge the smooth answer.** Independent reviewers look from different
   failure angles, and review findings are re-researched before fixes land.
4. **Adjudicate evidence.** Verification, acceptance, explanations, and
   walkthroughs keep the human capable of understanding and intervening, not
   merely clicking approve.
5. **Compound the consequences.** Deviations, failed assumptions, and accepted
   judgments become tests, repository rules, research memory, and better future
   constraints.

Human gates stop the flow at decisions that belong to you. Their outcomes are
recorded rather than silently inferred, so context and judgment can accumulate
across tasks instead of disappearing with the session.

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

## Documentation

- [All 38 skills](docs/skills.md)
- [Parameters and effort levels](docs/parameters.md)
- [Runtime artifacts](docs/artifacts.md)
- [Codex setup](docs/codex-setup.md)

Questions and bug reports belong in [GitHub Issues](https://github.com/ylxmf2005/AgentCorp/issues).
