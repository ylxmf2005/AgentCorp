# AgentCorp

**Loop engineering for software delivery: controllable, understandable, verifiable.**

English · [简体中文](README_CN.md)

[Quick Start](#quick-start) · [How a Delivery Runs](#how-a-delivery-runs) · [Trust Architecture](#the-trust-architecture) · [Skills](#skills) · [Artifacts](#artifacts) · [Limitations](#honest-limitations)

---

AI generates code faster every month, but the cost of verifying that code still
lands on you. And the loop that follows is worse than the code: an agent's work
is a black box, so you can't follow its reasoning; because you can't follow it,
you skip review; because you skip review, cognitive debt piles up; the deeper
the debt, the more dependent you become — until you no longer dare to hand it
anything that matters.

AgentCorp is a [loop-engineering](https://addyosmani.com/blog/loop-engineering/)
system built to break that loop. It packages a full software-delivery
organization — **37 skills**: an orchestrator, planners, an engineer, 12
specialist review lanes, testers, an acceptance gate, and the thinking/teaching
capabilities around them — as plain-markdown Agent Skills that run on both
**Claude Code** and **Codex** (one skill body, the open Agent Skills standard).
Less a prompt pack than an org chart with contracts — who produces what,
who is allowed to approve it, and what evidence has to exist before work moves.

- **Controllable** — the process scales itself to the task. A one-line change
  takes the micro lane (no paradigm ceremony — the quick path, review kept); a new system skips no critical phase; gates actually
  block, and repeated failure forces replanning instead of a third identical retry.
- **Understandable** — every phase leaves a structured artifact recording who
  decided what on which evidence. Review findings are explained to the level of
  "you can judge this without having read the code."
- **Verifiable** — no role approves its own output, tests are decided before
  implementation, and every review finding is treated as a possible false
  positive until an independent role has walked the failure path itself.

## Quick Start

### Install

**Claude Code:**

```
/plugin marketplace add ylxmf2005/AgentCorp
/plugin install agentcorp@agentcorp
```

Then run `/reload-plugins` or restart. Skills are namespaced, for example
`/agentcorp:delivery-orchestrator`.

**Codex:**

```
codex plugin marketplace add ylxmf2005/AgentCorp
```

Launch Codex, enable **AgentCorp** from the `/plugins` menu, and restart. To
install a single skill: `use skill-installer to install the skill at repo
ylxmf2005/AgentCorp path agentcorp/delivery-orchestrator`.

Codex has no `SessionEnd` event, so the plugin's lifecycle hooks mount
differently there: copy or merge `hooks/codex-hooks.json` into
`<repo>/.codex/hooks.json` (or `~/.codex/hooks.json`), adjusting
`AGENTCORP_PLUGIN_ROOT` to this checkout. The same scripts serve both runtimes;
on Codex, skill-evolution capture records each turn via the `Stop` hook and the
next session start sweeps sessions idle for 30+ minutes into the analyzer.

### Calling Skills

The main entry point is the Delivery Orchestrator. Hand it a task and it drives
the full pipeline — classifying the work, routing each phase to the right role,
and gating on evidence:

```
/agentcorp:delivery-orchestrator add rate limiting to the public API and verify it under load
```

You can also call any single skill directly when you only need that one step:

```
/agentcorp:code-review-lead run a code review on the current diff before I merge
```

### First Use

After installation, describe what you need, or call
`/agentcorp:delivery-orchestrator`. It will first confirm the success criteria
with you, recommend an execution route, then move through the phases and stop at
each gate to report.

When a task needs a real browser or logged-in state verification, AgentCorp uses
an isolated browser profile, asks you to log in manually once, and then performs
checks inside the page automatically. It does not touch your local cookies. At
the end of the task, you receive a delivery report and an audit record that
traces every decision.

## How a Delivery Runs

[![AgentCorp delivery workflow](docs/assets/delivery-workflow.png)](docs/assets/delivery-workflow.excalidraw)

Hand the Delivery Orchestrator a task and it classifies the work for the sponsor (the human this pipeline answers to — you), picks a
paradigm (greenfield / enhancement / bugfix / simple addition), announces the
phase sequence as a commitment, and drives it — stopping at human gates with a
navigable summary (where we are → what I see → what I recommend → your
options) instead of a bare "approve?". Between phases, work moves by
**assignment/receipt files with YAML contracts**, mechanically validated: a
receipt claiming an artifact that doesn't exist, an empty deliverable, a phase
nobody recognizes — caught by `validate-handoff.py` before any human reads a word.

Four orthogonal knobs tune the collaboration per task, each threading into
every downstream assignment:

| Knob | Values | Decides |
| --- | --- | --- |
| `mode:` | `direct` \| `partial` \| `full` | you-as-reviewer / orchestrator executes, reviews delegated / every phase delegated |
| `pace:` | `continuous` \| `guided` | keep moving, report at checkpoints / one artifact at a time, taught |
| `effort:` | `low` \| `medium` \| `high` \| `max` | how much redundancy and optional coverage the task buys |
| `lang:` | any | the language every human-facing artifact is written in |

`effort:low` gets you speed by trading redundancy — one review round, focused
verification, optional phases skipped. It never trades honesty: no tier can
fabricate evidence, approve its own work, or skip re-running the original
failing input — and a security/permission/data-loss surface **auto-upgrades its
phases to max, out loud**, whatever tier the task chose. Individual skills
take parameters the same way: `/agentcorp:probe output:inline`,
`/agentcorp:walkthrough format:md quiz:off`, `/agentcorp:explain reader:newcomer`.

Be honest about the bill: a delegated multi-reviewer pipeline costs real tokens
and wall-clock. That is exactly what `effort` prices — `low` approaches a
single-agent session, `max` buys an independent session per lane. Spend it
where wrongness is expensive.

## The Trust Architecture

Every mechanism below exists because the naive version failed somewhere real:

- **No role approves its own artifact.** Author/reviewer separation holds in
  every mode — even solo (`direct`) mode keeps the review gates and makes you
  the reviewer, informed and explicitly willing.
- **Review findings are hypotheses, not facts.** The most expensive failure in
  multi-agent work is a confident-but-wrong finding taken downstream as truth.
  `review-researcher` is the circuit breaker: it re-walks every finding
  adversarially (null hypothesis: false positive), kills the fakes with named
  evidence, and only confirmed, in-scope items ever reach `fix`.
- **Claims need handles.** "Tests pass" counts only with something you can
  open — a path, a log, a rendered screenshot. A behavior that can only be
  verified in an environment the machine lacks is marked `unverified` and
  passes no gate; verbal confirmation is not evidence; raw evidence logs are
  verbatim and append-only.
- **Gates speak a closed vocabulary.** Human gates resolve to
  `approved / skipped / revised / blocked` — recorded, never silently passed. A
  sponsor reply that doesn't address the question maps to no outcome: nothing
  in the pipeline may invent a "default-approve convention".
- **High-stakes changes get a second opinion from a different model family.**
  On a security boundary, public contract, or irreversible release, the verdict
  owner takes an independent cold-read from the other runtime family (Codex
  checking Claude-family work, and vice versa) before concluding — two families
  rarely share one blind spot.
- **The mechanical layer is fuzz-tested.** `validate-handoff.py`'s known
  blind spots were found by fuzzing and are pinned by a shipping regression
  suite (`tools/test-validate-handoff.py`) so they stay closed.

## It Improves Itself — With a Human Gate

AgentCorp treats its own skills as a system under test:

- **Capture → surface → land.** A session-end hook analyzes the transcript for
  skill-improvement signals (privacy-redacted before anything persists), the
  next session surfaces the pending count, and `skill-evolution` drafts the
  edit — which lands only on an explicit human yes to the specific diff.
  Nothing self-rewrites silently.
- **`compound` (沉淀, "let the lessons settle") is a phase, not a note.** Before delivery, the round's
  lessons become assets that change future behavior on their own: a fixed bug
  becomes a regression test, a discovered trap becomes a `CLAUDE.md` rule, a
  confirmed review pattern becomes a proposal for the reviewer that missed it.
- **`replay` replays the session itself.** A deterministic extractor parses
  the runtime's own recordings (Claude Code project JSONL, Codex rollouts) into
  turns, wall-clock, token economics, tool errors, and stall points — then the
  analysis anchors every claim to a transcript entry. Memory is a hypothesis;
  the trajectory file is the evidence.
- **Edits need a failing trajectory.** The evolution doctrine rejects wording
  polish: a skill change must cite a concrete failed run, the gate where it
  broke, and whether the fault is trigger wording, a body rule, or a
  cross-skill contract.

## Regression-Tested Against Trap Scenarios — and the Tests Ship With It

`scenarios/` contains the **golden regression
set** used to evolve it: nine trap-seeded delivery tasks — modeled on real
agent-failure patterns from SWE-bench, TAU-bench, and RefactorBench — run
end-to-end through the actual skills, with each phase executed by an isolated
agent receiving only its contracted inputs. The traps include an issue that
confidently names the wrong fix, a test suite where the cheapest green is
editing the asserts, a policy hidden in the docs that the goal-state satisfies
by violating, and a defect verifiable only in a real browser. Alongside them:
24 routing probes (realistic phrasings vs. the trigger table) and the validator
fuzz suite. Any skill edit replays its scenario and its wired partners — the
calibration pair (a one-liner that must stay low-effort, a greenfield build that
must stay high-effort) keeps the pipeline from ever being optimized in one direction only.

## Skills

The 37 skills are grouped by delivery phase below (within a phase, planners, reviewers, and implementers sit together). Each skill's behavior is defined in
`agentcorp/<skill>/SKILL.md` and appears in the Claude Code and Codex skill
pickers. Together, they cover the delivery loop and the supporting behaviors
needed to run it in real projects.

- **Orchestration**
  - `delivery-orchestrator` — owns and gates the whole delivery pipeline: classifies the work, routes each phase to the right role, and decides when the evidence is strong enough to move on
- **Planning and design**
  - `solution-architect` — settles structural design decisions before any code exists, holding down complexity from change amplification, cognitive load, and unknown unknowns
  - `implementation-planner` — slices approved design into ordered, dovetailed, independently verifiable stories an engineer can build directly
  - `plan-review-lead` — judges whether a Story Spec is mature enough for an engineer to start without inventing missing architecture, scope, or unapproved dependencies
  - `test-planner` — sets the verification strategy before implementation — what to test and why, with coverage following risk rather than spread evenly
  - `test-plan-reviewer` — judges whether a TestPlan's coverage matches the requirements and risks before implementation begins
  - `parallel-researcher` — decomposes a question into independent research lanes to establish what evidence actually exists, countering anchoring and confirmation bias
- **Implementation**
  - `implementation-engineer` — implements an approved Story Spec as clean, working code that hugs the project's existing architecture, patterns, and conventions
- **Code review**
  - `code-review-lead` — coordinates the specialist reviewers and converges their findings into a single merge decision, filtering by evidence rather than headcount
  - `correctness-reviewer` — hunts functional defects — off-by-one, state corruption, null propagation, races — that make code behave wrongly on real inputs
  - `security-reviewer` — inspects for exploitable holes — injection, auth bypass, hardcoded secrets, SSRF — that let attackers cross trust boundaries
  - `performance-reviewer` — catches regressions that slow the system or exhaust resources at scale: N+1 queries, unbounded growth, missing pagination, blocking I/O
  - `reliability-reviewer` — exposes failure-handling gaps — missing timeouts, swallowed errors, retry storms, leaks, cascading failures — that crash or hang the system
  - `adversarial-reviewer` — assumes it's already broken and proves it, hunting emergent failures from combination, timing, and abuse that single-axis reviewers miss
  - `simplicity-reviewer` — finds complexity that doesn't pay for itself: needless abstractions, premature generalization, dead code, structural choices that can't justify their cost
  - `taste-reviewer` — judges whether a change is built in the right shape — hack vs root-cause form, wrong abstraction, conceptual misnaming, API feel, proportionality — against the pipeline's pull toward the smallest diff
  - `change-hygiene-reviewer` — checks that every hunk in the diff traces to an approved requirement, blocking out-of-scope changes, history residue, and formatting noise
  - `standards-reviewer` — verifies code and artifacts follow the project's own conventions — frontmatter, naming, formatting, reference style — not generic best practices
  - `comment-optimizer` — optimizes comments directly: rewrites, deletes, or adds concise why/boundary/history notes instead of routing through a review-then-fix loop
  - `project-steward-reviewer` — judges whether a change is worth admitting into the project's long-term history: maintenance cost, module boundaries, public surface, direction
  - `api-contract-reviewer` — keeps API boundaries — schemas, routes, types, status codes, error semantics — backward-compatible so consumers don't break without a migration path
  - `review-researcher` — independently verifies each review finding to ground truth before any fix lands, then proposes the correct, elegant fix
  - `review-fixer` — lands one group of verified fixes at the root within an authorized file set, following the research fix approach and adding regression checks
- **Verification**
  - `test-leader` — orchestrates a change's overall verification, assigns specialist testers, folds their evidence into one judgment, and gates delivery on sufficient proof
  - `e2e-tester` — takes on a real user's goal and drives the live system end-to-end through complete flows, capturing exactly what happened
  - `api-contract-tester` — writes and actually runs tests proving an API honors its request/response shape, status codes, auth boundaries, and error semantics
  - `regression-tester` — confirms behavior that used to work still works after a change, catching regressions that fail silently
- **Acceptance and delivery**
  - `acceptance-review-lead` — guards the final gate before delivery, judging whether the complete evidence proves every requirement met and the risks acceptable
- **Support**
  - `probe` — investigates unfamiliar territory before work starts and teaches the sponsor the terrain: the corrections to their map, the surprises, what "good" looks like locally, and a living unknowns ledger
  - `brainstorm` — turns an unclear request into sponsor-approved, testable requirements by pressure-testing intent, scope, and viability one question at a time
  - `grill` — pressure-tests an existing plan, design, or argument through a relentless one-question-at-a-time interview with its owner, ending in an honest readiness verdict (`ready`/`needs-evidence`/`needs-redesign`/`blocked`)
  - `replay` — replays a session's recorded trajectory (Claude Code JSONL / Codex rollouts) through a deterministic extractor: where time and tokens went, what kept failing, and what to improve — routed to skill-evolution proposals, project docs, or compound entries
  - `authenticated-browser-session` — holds a real logged-in browser session to verify authenticated flows without reading cookies or asking the user for tokens
  - `explain` — explains bugs, test progress, review findings, and delivery status at the reader's level — zero-context sponsor by default — with every conclusion carrying its status and evidence
  - `walkthrough` — turns a change into a teaching artifact — background first, intuition before code, the change as a story rather than a file list — ending in a quiz the sponsor must pass before merge
  - `precommit-setup` — sets up commit-time guardrails: fast deterministic checks by default, optional AI review, explicit constraints, without slowing every commit
  - `skill-evolution` — turns a skill-improvement signal captured at session end into a reviewed, landed edit (or a new skill from research), keeping AgentCorp's own skills improving with a human in the loop

## Artifacts

Every phase leaves a structured artifact with frontmatter (`artifact_type` /
`author_agent` / `phase` / `status` / `source_artifacts`), making the work
auditable and traceable. Not every task uses every file below: the tree shows
the full runtime layout, and AgentCorp creates only the phases, reviews, tests,
research packages, and handoffs that the task actually needs.

```
teamspace/
├── testing-context.md                    # Cross-task runtime facts: entry points, auth, pages, observable surfaces, test data
├── compound/                             # Cross-task compound store: one lesson per file, deduped, incl. failed approaches
│   └── invite-token-reuse-trap.md        #   Trigger -> root cause -> what to do -> how to move faster next time
├── knowledge/                            # Reusable research snapshots copied out of task research when worth keeping
│   └── <technology>/INDEX.md
├── probes/                               # Standalone terrain reports written before any task exists
│   └── 20260620-billing-module.md
├── walkthroughs/                         # Standalone change walkthroughs (self-contained HTML) outside a task
└── tasks/20260622-invite-members/        # Current task root
    ├── task.md                           # Task record: request, success criteria, phase sequence, gate history, decisions
    ├── manifest.md                       # Audit ledger: phase, owner, status, human gate, quality gate, assignment, artifact, receipt
    │
    ├── probe/                            # Optional pre-requirements terrain report with a living unknowns ledger
    │   └── 00-probe.md
    │
    ├── handoffs/                         # Assignment/receipt loop for delegated phases
    │   ├── 001-validate-requirements.md
    │   ├── 001-validate-requirements-receipt.md
    │   ├── 002-test-plan.md
    │   ├── 002-test-plan-receipt.md
    │   └── ...
    │
    ├── requirements/
    │   └── validated-requirements.md     # Intent, users, journeys, FR/AC, non-goals, constraints, assumptions, open questions
    │
    ├── design/                           # Created as needed; several design artifacts may coexist
    │   ├── architecture.md               # Greenfield/subsystem design: components, data/state flow, interfaces, trade-offs
    │   ├── impact-analysis.md            # Delta design: affected modules, current/target behavior, risks, preserved behavior
    │   ├── diagnosis.md                  # Bugfix diagnosis: reproduction, hypotheses, root cause, proposed fix, regression criteria
    │   └── interface-contract.md         # Public/shared contracts: schemas, auth, errors, compatibility, verification hooks
    │
    ├── test/
    │   ├── test-plan.md                  # Overall risk-ordered strategy, required layers, explicit gaps, forbidden zones
    │   ├── api-test-plan.md              # API/integration playbook: literal requests, expected responses, evidence handling
    │   ├── e2e-test-plan.md              # E2E playbook: browser steps, literal input, screenshot/URL evidence
    │   ├── regression-test-plan.md       # Regression playbook: blast radius, existing suites, before-fails/after-passes checks
    │   ├── test-plan-review.md           # Independent review of the test plan: approve / request_changes / needs_more_evidence
    │   └── exploration/                  # Work files used to fill testing-context.md; confirmed facts are written back
    │       ├── charters.md               # Exploration charters and status
    │       ├── frontier.md               # Candidate entry points and where they came from
    │       └── journal.md                # Action-by-action observations, screenshots, and blockers
    │
    ├── implementation/
    │   ├── implementation-story.md       # Story spec: scoped AC, ordered tasks, target modules, constraints, verification expectations
    │   └── implementation-result.md      # Actual result: changed files, commands, deviations, blockers, review handoff
    │
    ├── review/
    │   ├── plan-review.md                # Plan Review Lead decision on the Story Spec
    │   ├── plan-review-findings/         # Plan-review specialists (kept apart from code-review's)
    │   ├── code-review.md                # Code Review Lead aggregate decision
    │   ├── specialist-findings/          # Specialist findings; only invoked reviewers write files here
    │   │   ├── correctness-reviewer.md
    │   │   ├── security-reviewer.md
    │   │   ├── performance-reviewer.md
    │   │   ├── reliability-reviewer.md
    │   │   ├── simplicity-reviewer.md
    │   │   ├── taste-reviewer.md
    │   │   ├── change-hygiene-reviewer.md
    │   │   ├── standards-reviewer.md
    │   │   ├── comment-optimizer.md
    │   │   ├── project-steward-reviewer.md
    │   │   ├── api-contract-reviewer.md
    │   │   ├── adversarial-reviewer.md
    │   │   └── parallel-researcher.md    # Desk/source-verified research when used as specialist evidence
    │   ├── research/                     # Review recheck; every finding is tested as a possible false positive
    │   │   ├── 00-index.md               # Aggregated index across per-issue research files
    │   │   ├── 001-confirmed-...md       # One file per issue: verdict, evidence, root cause, fix recommendation
    │   │   └── 002-false-positive-...md  # False-positive or needs-human-confirmation record
    │   ├── fix-records/                  # One record per non-overlapping Review Fixer file group
    │   │   └── invite-service.md         # Item dispositions, files changed, validation, drift notes
    │   └── fix-result.md                 # Orchestrator rollup of all fix groups and merge validation
    │
    ├── research/                         # Hands-on research packages, when a task needs experiments or snapshots
    │   └── invite-email-provider/
    │       ├── 00-report.md
    │       ├── env/
    │       ├── sources/
    │       └── experiments/
    │
    ├── explain/                          # Optional persisted plain-language explanations for sponsor review
    │   └── review-summary/
    │       ├── 00-index.md
    │       └── 001-finding-context.md
    │
    ├── walkthrough/                      # Optional teaching artifact for the change: background → intuition → story → quiz
    │   └── invite-flow.html
    │
    ├── verification/
    │   ├── assignments/                  # Tester assignments written by Test Leader during delegated verification
    │   │   ├── e2e-tester.md
    │   │   ├── api-contract-tester.md
    │   │   └── regression-tester.md
    │   ├── test-results/                 # Real execution evidence; no assumed success
    │   │   ├── e2e-tester.md             # Status, checked flows, commands, screenshot/URL evidence
    │   │   ├── api-contract-tester.md    # Requests/responses, pass/fail, schema/contract evidence
    │   │   └── regression-tester.md      # Before/after comparison, commands, exit codes
    │   └── verification-report.md        # Test Leader decision citing the result files and remaining gaps
    │
    ├── acceptance/
    │   ├── acceptance-package.md         # Orchestrator package: success criteria, artifact index, direct evidence, gaps
    │   └── acceptance-decision.md        # Acceptance Review Lead decision: accept / reject / needs_more_evidence
    │
    ├── compound/
    │   └── compound-result.md            # 沉淀 phase output: regression tests landed, rules written, proposals raised
    │
    └── delivery/
        └── delivery-report.md            # Final delivery report: status, code/artifact locations, tests, risks, follow-ups
```

## Honest Limitations

The same discipline the pipeline demands, applied to itself:

- Markdown contracts **constrain** model behavior and make violations visible;
  they cannot make violations impossible. The mechanical validator checks
  envelopes and existence, not truth — truth is what the review/verify roles
  and your gates are for.
- The trap-scenario set is a regression guard written by the maintainers, not
  third-party benchmark results; no SWE-bench score is claimed.
- There is deliberately no frontend role and no merge/push owner: frontend
  changes need an explicit sponsor waiver, and landing code on a branch stays
  with you.
- Requirements: Claude Code or Codex CLI with plugin/skill support; the
  validators and the trajectory extractor are Python 3.9+ stdlib-only.

---

AgentCorp welds controllability, understandability, and verifiability into
the structure itself instead of leaving them for the operator to guarantee by
hand — and every delivered task leaves the system a little stronger than it
found it. If AgentCorp is useful to you, a star helps others find it.
