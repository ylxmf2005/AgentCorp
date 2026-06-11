# AgentCorp

**English** | [简体中文](README_CN.md)

A multi-agent software-delivery pipeline packaged as **Agent Skills**. A Delivery
Orchestrator classifies each task, routes every phase to a specialized role —
planning, implementation, independent code review, and layered verification — and
enforces explicit gates between phases.

Built on the [Agent Skills](https://agentskills.io) `SKILL.md` standard, so the same
skills install in both **Claude Code** and **Codex** from one repository.

## Features

- 27 specialized skills covering the full delivery flow: requirements, test plan, design, implementation, code review, verification, acceptance, and delivery.
- Author/reviewer separation — an artifact's author never reviews or approves it.
- Independent re-verification — code-review findings are re-checked one by one by a separate role before any fix, filtering out false positives.
- Parallel fixes — fixes are partitioned by file ownership and applied concurrently without overlap.
- Structured artifacts — every phase emits a Markdown file with YAML frontmatter, forming a traceable record.
- One source, two tools — installs in both Claude Code and Codex with no duplicated content.

## Workflow

The orchestrator classifies each task into one of four paradigms —
`dev/architecture-first`, `enhancement/delta-design`, `bugfix/hypothesis-driven`, or
`addition/simple` — and runs it through a phased lifecycle in which the author of an
artifact never approves it.

### 1. Delivery lifecycle

Each paradigm runs a subset of the same phases. Review phases (red) and the human gate
(yellow) sit between work phases; `request changes` and `reject` return work to an
earlier phase.

![Delivery lifecycle](docs/diagrams/01-lifecycle.png)

### 2. Roles

Each phase has a dedicated skill. Review roles stay independent of the work they
assess, and the orchestrator does not approve its own output.

![Roles](docs/diagrams/02-roles.png)

### 3. Review → research → fix

Code-review findings are not fixed directly. An independent `review-researcher`
re-verifies each finding before any fix, filtering out false positives. Confirmed
fixes then run in parallel, partitioned by file ownership so no two workers modify the
same file.

![Review, research, and fix](docs/diagrams/03-review-research-fix.png)

### 4. Handoff and gates

Delegated phases move over assignment/receipt files. Each receipt is first checked
mechanically (does the artifact exist; do the paths, author, and phase match) and only
then judged against the phase's quality gate — the two checks are kept separate.

![Handoff and gates](docs/diagrams/04-handoff.png)

### Workflow modes

| Mode | Default | How it runs | When |
|------|---------|-------------|------|
| `direct` | no | No subagents at all; the orchestrator runs every phase itself, review phases produce drafts adjudicated by the sponsor at the human gate | small low-risk changes, or hosts without subagent support; requires explicit sponsor confirmation |
| `partial-delegation` | yes | The orchestrator runs non-review phases itself; reviews are still delegated | regular, small-to-medium tasks |
| `full-delegation` | no | Every phase is delegated to its owner via assignment/receipt | large or parallel work, or when independent authorship is required |

## Output artifacts

Every phase writes a Markdown artifact (with YAML frontmatter) to a fixed path, so a
completed task leaves a traceable, reviewable record. Delegated phases use an
**assignment → receipt** pair; each receipt is checked mechanically
(`validate-handoff.py` — does the artifact exist, do the paths/author/phase match)
before its quality gate, and `manifest.md` records every phase, owner, gate result,
and artifact path.

All artifacts live under `teamspace/` in the work directory. This is local
coordination state and is never committed (add it to `.git/info/exclude` if it
appears); only the subdirectories a task needs are created.

```text
teamspace/tasks/<task_id>/
├── task.md                       # goal, classification, gate history
├── manifest.md                   # index: phase · owner · gate · artifact path
├── handoffs/                     # assignment + receipt pairs (delegated phases)
│   ├── 001-validate-requirements.md
│   └── 001-validate-requirements-receipt.md
├── requirements/
│   └── validated-requirements.md
├── test/
│   ├── test-plan.md
│   └── test-plan-review.md
├── design/                       # combine as needed; multiple artifacts may coexist
│   ├── architecture.md           # structural design
│   ├── impact-analysis.md        # incremental impact analysis
│   ├── diagnosis.md              # defect root-cause diagnosis
│   └── api-contract.md           # interface/contract definition
├── implementation/
│   ├── implementation-story.md
│   └── implementation-result.md
├── review/
│   ├── plan-review.md
│   ├── code-review.md
│   ├── specialist-findings/
│   ├── research/                 # review-researcher: one file per finding + index
│   │   ├── 00-index.md
│   │   └── <NN>-<slug>.md
│   ├── fix-result.md
│   └── fix-records/              # one per parallel review-fixer group
├── verification/
│   ├── assignments/
│   ├── test-results/
│   └── verification-report.md
├── acceptance/
│   ├── acceptance-package.md
│   └── acceptance-decision.md
└── delivery/
    └── delivery-report.md
```

## Install — Claude Code

```
/plugin marketplace add ylxmf2005/AgentCorp
/plugin install agentcorp@agentcorp
```

Then run `/reload-plugins` (or restart Claude Code). Skills are namespaced under the
plugin, e.g. `/agentcorp:delivery-orchestrator`, `/agentcorp:code-review-lead`.

## Install — Codex

Whole suite (plugin):

```
codex plugin marketplace add ylxmf2005/AgentCorp
```

Then launch Codex, enable **AgentCorp** from the `/plugins` menu, and restart so the
skills load.

Individual skills (without the plugin) — inside Codex, use the built-in installer:

```
use skill-installer to install the skill at repo ylxmf2005/AgentCorp path agentcorp/delivery-orchestrator
```

This installs the skill into `~/.codex/skills/`.

## Skills

27 skills cover the full pipeline:

- **Orchestration** — `delivery-orchestrator`
- **Planning and design** — `solution-architect`, `implementation-planner`, `test-planner`, `sota-researcher`
- **Implementation** — `implementation-engineer`, `review-fixer`
- **Plan and test-plan review** — `plan-review-lead`, `test-plan-reviewer`, `adversarial-reviewer`
- **Code review** — `code-review-lead`, plus the specialist reviewers `correctness-reviewer`, `security-reviewer`, `performance-reviewer`, `reliability-reviewer`, `simplicity-reviewer`, `change-hygiene-reviewer`, `standards-reviewer`, `project-steward-reviewer`, `api-contract-reviewer`
- **Verification** — `test-leader`, `e2e-tester`, `api-contract-tester`, `regression-tester`
- **Research and acceptance** — `review-researcher`, `acceptance-review-lead`
- **Support** — `change-detailed-walker` (fresh-start handoff and cross-task learnings are built-in capabilities of `delivery-orchestrator`, see its `references/fresh-start-handoff.md` and `references/learnings.md`)

Each skill's full description is in its `agentcorp/<skill>/SKILL.md` and appears in the
Claude Code and Codex skill pickers.

## Project layout

| Path | Purpose |
|------|---------|
| `agentcorp/<skill>/SKILL.md` | The skills — the single source, shared by both tools |
| `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` | Claude Code manifests (canonical metadata) |
| `.codex-plugin/plugin.json`, `.agents/plugins/marketplace.json` | Codex manifests (generated) |
| `tools/codex-interface.json` | Codex-only display and policy metadata |
| `tools/sync-codex.py` | Regenerates the Codex manifests from the Claude manifests |
| `tools/sync-shared.py` | Re-copies shared reference files into every skill, keeping each skill self-contained |
| `docs/diagrams/` | Workflow diagrams (`.drawio` sources and `.png` exports) |

Both tools point their `skills` field at `./agentcorp` and auto-discover the skill
folders, so there is no duplicated content. To change metadata, edit the Claude
manifests (and `tools/codex-interface.json` for Codex display), then run:

```
python3 tools/sync-codex.py
```
