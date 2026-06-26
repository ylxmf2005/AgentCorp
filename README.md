# AgentCorp

**Loop engineering for software delivery: controllable, understandable, verifiable.**

English · [Simplified Chinese](README_CN.md)

[Quick Start](#quick-start) · [Skills](#skills) · [Artifacts](#artifacts)

---

AI can generate code faster and faster, but the cost of verifying whether that
code is correct still lands on you. When you receive a pile of code that "looks
fine," the responsibility for judging whether it is actually right is entirely
yours. The deeper your dependency on AI becomes, the easier it is for that
judgment to get dull.

The harder problem is the loop that follows: an agent's work process is a black
box, so you cannot understand its reasoning; because you cannot understand it,
you skip review; because you skip review, cognitive debt accumulates; the deeper
that debt gets, the more dependent you become, and the harder it is to correct
the agent when it goes wrong. Eventually, you no longer dare to hand it important
work.

AgentCorp exists to break that loop. It is a
[loop engineering](https://addyosmani.com/blog/loop-engineering/) system for
software delivery: it turns agent work from an uncontrollable, unreadable,
untraceable black-box chain into a **controllable, understandable, verifiable**
delivery loop. It includes **32 skills** drawn from enterprise-grade software
delivery practice, covering the full delivery loop and the supporting practices
needed to run it in real projects. It works with both **Claude Code** and
**Codex**.

- **Controllable** -- The process scales itself to the size of the task. A
  one-line change does not pay the cost of an architecture review, while a new
  system skips no critical phase. Gates actually block: failed verification
  stops the pipeline, and repeated failure forces replanning. You can step in at
  any point, or let the pipeline run.
- **Understandable** -- Every phase leaves a structured artifact and records
  who made which decision under what evidence. Every review finding is explained
  to the level of "even if you have not read this code, you can still judge
  whether it should be changed." At delivery time, the final diff is turned into
  function-level comments that explain why the change was made.
- **Verifiable** -- No role can approve its own output. Tests are decided
  before implementation and independently reviewed. Review findings are treated
  as possible false positives and re-verified by another role; only confirmed
  findings enter the fix stage.

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

## Skills

The 32 skills are grouped by function below. Each skill's behavior is defined in
`agentcorp/<skill>/SKILL.md` and appears in the Claude Code and Codex skill
pickers. Together, they cover the delivery loop and the supporting behaviors
needed to run it in real projects.

- **Orchestration**
  - `delivery-orchestrator` — owns and gates the whole delivery pipeline: classifies the work, routes each phase to the right role, and decides when the evidence is strong enough to move on
- **Planning and design**
  - `solution-architect` — settles structural design decisions before any code exists, holding down complexity from change amplification, cognitive load, and unknown unknowns
  - `implementation-planner` — slices approved design into ordered, dovetailed, independently verifiable stories an engineer can build directly
  - `test-planner` — sets the verification strategy before implementation — what to test and why, with coverage following risk rather than spread evenly
  - `parallel-researcher` — decomposes a question into independent research lanes to establish what evidence actually exists, countering anchoring and confirmation bias
- **Implementation**
  - `implementation-engineer` — implements an approved Story Spec as clean, working code that hugs the project's existing architecture, patterns, and conventions
  - `review-fixer` — lands one group of verified fixes at the root within an authorized file set, following the research fix approach and adding regression checks
- **Plan and test-plan review**
  - `plan-review-lead` — judges whether a Story Spec is mature enough for an engineer to start without inventing missing architecture, scope, or unapproved dependencies
  - `test-plan-reviewer` — judges whether a TestPlan's coverage matches the requirements and risks before implementation begins
  - `adversarial-reviewer` — challenges assumptions, surfaces failure modes, and stress-tests requirements and designs to expose overlooked cross-component risks
- **Code review**
  - `code-review-lead` — coordinates the specialist reviewers and converges their findings into a single merge decision, filtering by evidence rather than headcount
  - `correctness-reviewer` — hunts functional defects — off-by-one, state corruption, null propagation, races — that make code behave wrongly on real inputs
  - `security-reviewer` — inspects for exploitable holes — injection, auth bypass, hardcoded secrets, SSRF — that let attackers cross trust boundaries
  - `performance-reviewer` — catches regressions that slow the system or exhaust resources at scale: N+1 queries, unbounded growth, missing pagination, blocking I/O
  - `reliability-reviewer` — exposes failure-handling gaps — missing timeouts, swallowed errors, retry storms, leaks, cascading failures — that crash or hang the system
  - `simplicity-reviewer` — finds complexity that doesn't pay for itself: needless abstractions, premature generalization, dead code, structural choices that can't justify their cost
  - `change-hygiene-reviewer` — checks that every hunk in the diff traces to an approved requirement, blocking out-of-scope changes, history residue, and formatting noise
  - `standards-reviewer` — verifies code and artifacts follow the project's own conventions — frontmatter, naming, formatting, reference style — not generic best practices
  - `project-steward-reviewer` — judges whether a change is worth admitting into the project's long-term history: maintenance cost, module boundaries, public surface, direction
  - `api-contract-reviewer` — keeps API boundaries — schemas, routes, types, status codes, error semantics — backward-compatible so consumers don't break without a migration path
- **Verification**
  - `test-leader` — orchestrates a change's overall verification, assigns specialist testers, folds their evidence into one judgment, and gates delivery on sufficient proof
  - `e2e-tester` — takes on a real user's goal and drives the live system end-to-end through complete flows, capturing exactly what happened
  - `api-contract-tester` — writes and actually runs tests proving an API honors its request/response shape, status codes, auth boundaries, and error semantics
  - `regression-tester` — confirms behavior that used to work still works after a change, catching regressions that fail silently
- **Recheck and acceptance**
  - `review-researcher` — independently verifies each review finding to ground truth before any fix lands, then proposes the correct, elegant fix
  - `acceptance-review-lead` — guards the final gate before delivery, judging whether the complete evidence proves every requirement met and the risks acceptable
  - `change-detailed-walker` — mirrors a change into a PR on a local forge and walks it function-by-function with "why this change" comments reviewers read natively
- **Support**
  - `brainstorm` — turns an unclear request into sponsor-approved, testable requirements by pressure-testing intent, scope, and viability one question at a time
  - `authenticated-browser-session` — holds a real logged-in browser session to verify authenticated flows without reading cookies or asking the user for tokens
  - `explain` — translates bugs, test progress, review findings, and delivery status into zero-context language a sponsor who hasn't read the code can follow
  - `concise-code-comments` — writes short, accurate comments that explain only what the code can't show, dropping the obvious, stale, or over-written
  - `precommit-setup` — sets up commit-time guardrails: fast deterministic checks by default, optional AI review, explicit constraints, without slowing every commit

## Artifacts

Every phase leaves a structured artifact with frontmatter (`artifact_type` /
`author_agent` / `phase` / `status` / `source_artifacts`), making the work
auditable and traceable. Not every task uses every file below: the tree shows
the full runtime layout, and AgentCorp creates only the phases, reviews, tests,
research packages, and handoffs that the task actually needs.

```
teamspace/
├── testing-context.md                    # Cross-task runtime facts: entry points, auth, pages, observable surfaces, test data
├── learnings/                            # Cross-task lessons; one lesson per file, deduped before writing
│   └── invite-token-reuse-trap.md        #   Trigger -> root cause -> what to do -> how to move faster next time
├── knowledge/                            # Reusable research snapshots copied out of task research when worth keeping
│   └── <technology>/INDEX.md
└── tasks/20260622-invite-members/        # Current task root
    ├── task.md                           # Task record: request, success criteria, phase sequence, gate history, decisions
    ├── manifest.md                       # Audit ledger: phase, owner, status, human gate, quality gate, assignment, artifact, receipt
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
    │   ├── code-review.md                # Code Review Lead aggregate decision
    │   ├── specialist-findings/          # Specialist findings; only invoked reviewers write files here
    │   │   ├── correctness-reviewer.md
    │   │   ├── security-reviewer.md
    │   │   ├── performance-reviewer.md
    │   │   ├── reliability-reviewer.md
    │   │   ├── simplicity-reviewer.md
    │   │   ├── change-hygiene-reviewer.md
    │   │   ├── standards-reviewer.md
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
    └── delivery/
        └── delivery-report.md            # Final delivery report: status, code/artifact locations, tests, risks, follow-ups
```

---

AgentCorp lets work compound while welding controllability, understandability,
and verifiability into the structure itself, instead of leaving them for the
operator to guarantee by hand.
