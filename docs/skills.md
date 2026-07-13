# The 38 Skills

[← back to README](../README.md) · [简体中文](skills_CN.md)

Parameters for every skill are cataloged in [parameters.md](parameters.md).

Skills are grouped by delivery phase (within a phase, planners, reviewers, and
implementers sit together). Each skill's behavior is defined in
`agentcorp/<skill>/SKILL.md` and appears in the Claude Code and Codex skill
pickers. Together, they cover the delivery loop and the supporting behaviors
needed to run it in real projects.

## Orchestration

- `delivery-orchestrator` — owns and gates the whole delivery pipeline: classifies the work, routes each phase to the right role, and decides when the evidence is strong enough to move on

## Planning and design

- `solution-architect` — settles structural design decisions before any code exists, holding down complexity from change amplification, cognitive load, and unknown unknowns
- `implementation-planner` — slices approved design into ordered, dovetailed, independently verifiable stories an engineer can build directly
- `plan-review-lead` — judges whether a Story Spec is mature enough for an engineer to start without inventing missing architecture, scope, or unapproved dependencies
- `test-planner` — sets the verification strategy before implementation — what to test and why, with coverage following risk rather than spread evenly
- `test-plan-reviewer` — judges whether a TestPlan's coverage matches the requirements and risks before implementation begins
- `parallel-researcher` — decomposes a question into independent research lanes to establish what evidence actually exists, countering anchoring and confirmation bias

## Implementation

- `implementation-engineer` — implements an approved Story Spec as clean, working code that hugs the project's existing architecture, patterns, and conventions

## Code review

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

## Verification

- `test-leader` — orchestrates a change's overall verification, assigns specialist testers, folds their evidence into one judgment, and gates delivery on sufficient proof
- `e2e-tester` — takes on a real user's goal and drives the live system end-to-end through complete flows, capturing exactly what happened
- `api-contract-tester` — writes and actually runs tests proving an API honors its request/response shape, status codes, auth boundaries, and error semantics
- `regression-tester` — confirms behavior that used to work still works after a change, catching regressions that fail silently

## Acceptance and delivery

- `acceptance-review-lead` — guards the final gate before delivery, judging whether the complete evidence proves every requirement met and the risks acceptable

## Support

- `probe` — investigates unfamiliar territory before work starts and teaches the sponsor the terrain: the corrections to their map, the surprises, what "good" looks like locally, and a living unknowns ledger
- `brainstorm` — turns an unclear request into sponsor-approved, testable requirements by pressure-testing intent, scope, and viability one question at a time
- `grill` — pressure-tests an existing plan, design, or argument through a relentless one-question-at-a-time interview with its owner, ending in an honest readiness verdict (`ready`/`needs-evidence`/`needs-redesign`/`blocked`)
- `compound` — owns the `compound` phase and answers standalone 沉淀/复盘 asks: turns the round's lessons into landed assets (regression tests, repo rules, sponsor-gated skill proposals) and, on request, replays the session's recorded trajectory (Claude Code JSONL / Codex rollouts) through a deterministic extractor — where time and tokens went, what kept failing, every claim anchored to its evidence source
- `authenticated-browser-session` — holds a real logged-in browser session to verify authenticated flows without reading cookies or asking the user for tokens
- `explain` — explains bugs, test progress, review findings, and delivery status at the reader's level — zero-context sponsor by default — with every conclusion carrying its status and evidence
- `walkthrough` — turns a change into a teaching artifact — background first, intuition before code, the change as a story rather than a file list — ending in a quiz the sponsor must pass before merge
- `precommit-setup` — sets up commit-time guardrails: fast deterministic checks by default, optional AI review, explicit constraints, without slowing every commit
- `skill-evolution` — turns a skill-improvement signal captured at session end into a reviewed, landed edit (or a new skill from research), keeping AgentCorp's own skills improving with a human in the loop
- `semantic-core-translation` — maintains English-Chinese documentation as a coherent pair: it preserves meaning in translation, establishes the authoritative source, and asks whether a new Chinese document needs an English counterpart instead of assuming it does
