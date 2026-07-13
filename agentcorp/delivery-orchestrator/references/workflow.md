# Local AutoDev Workflow

Use this reference progressively while coordinating work. It is the Delivery Orchestrator's local workflow contract, and depends on no external runtime directory.

## Operating Philosophy

Define "done" before routing: what must work, what must never break, what is out of scope. Understand before changing: assemble enough code, test, requirement, issue, or design context for the chosen phase. Present the phase sequence before starting work — that is the pipeline commitment. Hold author/reviewer separation: the author of an artifact does not approve their own artifact. Treat every result as evidence — a command passing is useful only when it proves the behavior that was changed. Stop once the success criteria are met; don't swallow adjacent scope into the current round. Each phase writes only the part its owner is responsible for, cites upstream rather than restating it, and adds detail only when it changes a decision or avoids implementation/verification ambiguity. All assignments, receipts, manifests, and phase artifacts are Markdown files with YAML frontmatter.

## Workflow Modes

Each task chooses a mode before phase execution begins. The three modes are ordered by **degree of delegation**; the phase vocabulary, artifact paths, and quality gates stay the same across all three — what changes is each phase's executor and the adjudicator of the reviews:

| Mode | Default? | How it works | When to use |
| --- | --- | --- | --- |
| `direct` | No | Delegate to no subagent. The Delivery Orchestrator executes every phase itself; for review-type phases it produces a **draft** conclusion from the corresponding review perspective, with approval resting on that phase's human gate — the sponsor is the reviewer. | Small, low-risk changes, the sponsor wants a fast track, or the host environment has no subagent capability. |
| `partial-delegation` | Yes | The Delivery Orchestrator executes the non-review phases directly; review, review-research, and fix are delegated to independent roles. | Routine tasks, small-to-medium changes, or work where a single agent can preserve enough context. |
| `full-delegation` | No | Every delegable phase is delegated to its stage owner via assignment/receipt files, and each returned artifact is validated. | The sponsor requests it, L/XL work, parallel implementation, or phases that need independent authorship beyond review. |

The default is `partial-delegation`. Switching to `full-delegation` requires the sponsor's explicit choice, or a documented orchestration rationale: high complexity, mutually independent parallel modules, a dedicated execution environment, or a strong need for author separation beyond review. Switching to `direct` must be the sponsor's explicit choice or confirmation — it replaces independent review roles with the sponsor adjudicating personally, and the sponsor must be informed and willing to be the reviewer; never silently downgrade to `direct`.

## Interaction Pace

Pace is independent of workflow mode: mode decides **who executes and adjudicates**; pace decides **how much ready work advances before the sponsor sees the next checkpoint**. Record one in `task.md`, and let the sponsor switch at any time.

- `continuous` (default for an actionable request) — continue through every ready, reversible action permitted by the current gates; batch non-urgent narration into meaningful checkpoints. "Keep going," "use your judgment," and "do not stop for routine approvals" select this pace and act as standing permission for skippable human pauses, not as permission to weaken evidence or cross an unapproved irreversible boundary.
- `guided` — advance one meaningful artifact or action at a time. Teach with **explain → do → show → pause** on the real task, not a toy walkthrough; recommend a smaller first slice when the task is too large to teach clearly, but let the sponsor override that soft guardrail.

Both paces keep the same quality gates, author separation, stop conditions, and artifact set. `guided` is not a slower workflow mode, and `continuous` is not blanket pre-approval.

## Effort

The third orthogonal knob: mode decides **who executes**, pace decides **how much advances between checkpoints**, effort decides **how much team the task convenes and how many process steps it walks** — never how careful any convened role is. `effort:low|medium|high|max` — default `high` — is chosen at intake with this precedence: an explicit `effort:` parameter wins; otherwise inherit the host session's effort level when the host exposes it (the orchestrator SKILL carries the substitution line; `xhigh` normalizes to `max`); the sponsor's words still adjust the pick ("赶时间/尽快" → `low`/`medium`, "从严/别出错" → `max`). Say which you picked and why, and record it in `task.md`.

**The orchestrator is this table's only reader — compile, don't forward.** At dispatch, translate the tier into explicit counts and switches in each assignment's Action Context: which lanes to convene, which layers to run, the rounds cap, which item categories to admit. A role with its own knob receives the compiled value through that knob (`depth:core|lean|full` to the Code Review Lead, `depth:desk|source-verified|hands-on` to a researcher, named layers and testers to the Test Leader); a specialist receives only convened-or-not. No worker interprets the tier name — the envelope `effort` field is audit metadata, and the shared handoff protocol tells every worker exactly that. At `deliver`, the report carries the **effort ledger**: the tier, what this table promised for it, what actually ran, and every deviation with its reason — the tier is a contract, not a mood.

| Dial | `low` (赶时间) | `medium` | `high` (default) | `max` |
| --- | --- | --- | --- | --- |
| Intake & route | 0 question sets — propose the route directly; micro **and small** changes take the fast path | fast path for micro changes | at most one route-changing question set | one set + success criteria confirmed item by item; full paradigm even for micro (reason recorded) |
| probe / brainstorm convened | only when the sponsor names unknown territory | on clearly unknown modules | whenever the sponsor or you doesn't know the territory | any unfamiliar module gets `probe`; open direction gets `brainstorm` with 4 paths |
| Optional phases (impact-analysis / interface-contract / test-plan where optional) | skipped unless a shared/public contract is touched | produced only when their trigger condition clearly holds | per their documented conditions | produced whenever plausibly useful |
| Design artifact set | single nearest artifact; cross-type decisions folded in and flagged | the task class's typical combination | combination + a contract whenever a shared surface exists | full risk-matched set + researcher lanes for external evidence |
| plan-review | skipped when explicitly tiny and low-risk; otherwise Correctness lane only | 3 of the 5 always-consider lanes (Correctness, Simplicity, TestPlan) | all 5 + risk-matched lanes per conditions | all 5 + every risk lane + adversarial |
| code-review | one round, `depth:core` (lead alone); afterwards scoped amendments only | one round, `depth:lean` (lead + Correctness lane + only the surface lanes the diff unambiguously demands); afterwards scoped amendments only | one full round + scoped amendments; a second full round needs a recorded reason; lanes per the roster's conditions — a lane clearly not needed is recorded, not convened | up to two full rounds, `depth:full`, then escalate to the sponsor; borderline lanes convened; large diffs split lanes by axis |
| review-research | must-fix items only; 1 worker | must-fix items; workers by volume | items the lead routed | must-fix + suggested items; parallel by cluster; externally researchable gaps get a `parallel-researcher` lane |
| fix | P0 fix-now items only; 1 group | P0+P1 fix-now | all confirmed/partial fix-now, parallel disjoint groups | same + merge validation runs the full relevant suites |
| verify | 1 tester; capability checks + regression on the changed surface; e2e off, skipped layers named unverified | 2 testers; capability + cheap integration; expensive e2e (environment-bound, multi-surface) skipped unless the TestPlan marks that journey at-risk — unit/simple checks always kept; skipped layers named unverified, never implicitly green | testers and layers per the TestPlan / the Verification Hierarchy as applicable | all testers + risk-domain reviewer lanes; full hierarchy; environment requirements taken strictly |
| Fix-loop vs pipeline re-entry | fix-loop whenever its entry conditions hold | fix-loop for narrow single-surface defects | fix-loop only with sponsor agreement and a held diagnosis | full pipeline re-entry recommended; fix-loop needs a recorded reason |
| Human gates | propose skipping all skippable gates once, up front | propose skipping the low-risk gates | per the Human Gate Policy | no skip proposals |
| Cross-family second opinion | high-stakes rule still applies | high-stakes rule still applies | high-stakes rule (offered) | offered on high-stakes, lean toward taking it; also offered on borderline shared-contract changes |
| acceptance-review | lead adjudicates alone; Must-Have and scoped-risk evidence files opened (floor) | + one lane per contested dimension | 1–2 lanes; every file the verification report indexes opened | a lane per contested or thin dimension; cross-family cold read; every listed artifact opened |
| compound / walkthrough | an honest one-line 无可沉淀 is legal; walkthrough on request only | the regression-test question always asked | all three asset questions asked | all three + mid-task scraps swept; walkthrough offered and kept alive to merge |

**Hard floors — no tier may cross these.** Effort trades redundancy and optional coverage, never honesty: (1) evidence is never fabricated and `unverified` never passes a gate; (2) author/reviewer separation holds — under `low` the sponsor personally adjudicates what independent reviewers would have; (3) a defect's done still means the original failing input re-run; (4) **high-stakes surfaces auto-upgrade**: a security/permission boundary, public/shared contract, or data-loss/irreversible change runs its affected phases at `max` regardless of the task's tier, and the upgrade is said out loud, not silently applied. A tier is a budget, not a quality waiver — when a tier and a floor collide, the floor wins and the sponsor hears about the cost. And effort never reaches inside a convened role: a specialist has no "less careful" mode — the tier decides whether and how many instances are convened, never how hard they look.

### Sponsor Work-Path Menu

Mode is an internal ledger term; lead with the work path the sponsor needs, state interaction pace separately, then map the path to a mode:

| Path the sponsor sees | Internal mode | When to recommend |
| --- | --- | --- |
| Quick small change | `direct` | The task is tiny and low-risk, and the sponsor explicitly is willing to adjudicate the review gates personally; you must make clear that review is only a draft and approval rests with the sponsor. |
| Standard delivery | `partial-delegation` | The default recommendation. Fits most backend fixes, enhancements, and small-to-medium requirements; keeps review/research/fix independent. |
| Deep orchestration | `full-delegation` | Big changes, high risk, a need for parallel authorship, spanning multiple modules, or the sponsor requests full-role orchestration. |

Don't mechanically display all three paths to everyone at intake. If the signals are clear, just say "I recommend standard delivery," and offer 1-2 alternatives; if the task is tiny, ask whether to take the quick small-change route; if the task is clearly complex, recommend deep orchestration. When the user has already given an explicit mode, adopt it directly and restate the consequences.

The conversation skeleton when starting a task:

```text
I'll treat this as <paradigm> for now. The success criteria are <1-3 items>, and the main risks are <1-3 items>.
I recommend the <path> route (internal mode: <mode>), because <reason>.
Next I'll run: <plain-language summary of the phase sequence>.
You can:
1. Continue per recommendation
2. Change to <another suitable path>
3. First supplement/modify the success criteria
```

Stop and wait for the sponsor's choice only when confidence is LOW, priority/scope/risk-acceptance is unclear, or the path choice would change reviewer independence; otherwise announce the recommended route and continue executing.

### Subagent Invocation Parameters

When invoking a subagent, default to inheriting the current host's/caller's own runtime configuration. When Claude itself spawns a Claude subagent, use Claude's current default; when Codex itself spawns a Codex subagent/CLI/skill, use Codex's current default. AgentCorp's role routing only decides "who to assign, what context to give, and where to put the output," and is not responsible for hardcoding the model, reasoning effort, permissions, or other runtime parameters.

Only three cases permit passing parameters explicitly: the sponsor explicitly requires it; the assignment/manifest already has a documented override value; the target tool's schema requires it. Even when an override is needed, pass only the minimal necessary parameters and record the reason in the assignment or manifest.

### Runtime Routing

Roles split across two runtime layers, both invoked per the runtime-inheritance principle above without specifying extra model parameters:

- **Claude (decision layer)**: Delivery Orchestrator, Test Planner, Test Plan Reviewer, Solution Architect, Implementation Planner, Plan Review Lead, Code Review Lead, Test Leader, Review Researcher, Acceptance Review Lead, Adversarial Reviewer, Parallel Researcher, Simplicity Reviewer, Project Steward Reviewer, Taste Reviewer, Comment Optimizer — go through the native subagent/Agent capability of the current Claude environment.
- **Codex (execution layer)**: Implementation Engineer, Review Fixer, Correctness Reviewer, Security Reviewer, Performance Reviewer, Reliability Reviewer, Standards Reviewer, API Contract Reviewer, API Contract Tester, E2E Tester, Regression Tester — go through the native subagent/CLI/skill capability of the current Codex environment; when no Codex channel is present in the host, degrade to a local subagent invocation of the same skill, with the protocol unchanged. When the host exposes **no subagent channel at all**, the phase's coordinator executes the work itself under the same skill and protocol, discloses author=judge in both the artifact and the receipt (attributing `author_agent` to the executing coordinator), and the next independent gate spot-checks that evidence — a bespoke authorization clause invented per-assignment is not a substitute for this rule.

Review independence cannot be compromised in any of the three modes; only the adjudicator changes: under `partial-delegation`/`full-delegation`, `test-plan-review`, `plan-review`, `code-review`, and `acceptance-review` always go to their review owners; under `direct` these phases have the Delivery Orchestrator produce a draft conclusion itself, but **a draft is not approval** — each review phase's human gate must stay active and be adjudicated by the sponsor, and these gates cannot be skipped under `direct`. In any mode, the Delivery Orchestrator never approves its own artifacts or evidence.

The two phases that handle code-review findings, `review-research` and `fix`, are both **delegated** out under `partial-delegation`/`full-delegation`; the Delivery Orchestrator does not verify or write fix code itself (under `direct` it does them itself, but keeps the same order and artifacts: research first, producing a per-issue verdict, then the sponsor's human gate, then fix lands). The division of labor:

- `review-research` is delegated as a whole to `review-researcher`: it adversarially re-checks each finding independently, kills the false positives, and produces `review/research/` (verdict + fix recommendation + per-issue explanation). This is the circuit breaker against error propagation and must be done independently and thoroughly.
- `fix` is **orchestrated in parallel by the Delivery Orchestrator**: the Orchestrator does not write fix code itself, but **partitions the confirmed/partial fix items into mutually non-overlapping groups by file ownership**, dispatches one `review-fixer` single worker per group to land them in parallel (ensuring two groups never touch the same file), and after all groups return, runs one merge validation and aggregates them into `review/fix-result.md`. A `review-fixer` is a single fix worker, and does not partition or dispatch on its own. See the Parallel Execution Protocol.

The two have a **sequential dependency**: `fix` must come after `review-research`; `review-fixer` consumes only the verified `review/research/`, and if it can't find it, it stops — it does not verify the raw findings itself. This preserves the author separation between "independent verification" and "faithful landing."

Under `partial-delegation`, keep the same phase vocabulary and artifact paths: the Delivery Orchestrator writes the non-review artifacts directly and records itself as owner in `manifest.md`, and these phases may omit the assignment/receipt files; the delegated review phases still keep assignment/receipt. Under `full-delegation`, every delegated phase goes through the full handoff discipline. Under `direct` there are no assignment/receipt at all: all phase artifacts and manifest entries are still required, review-type artifacts record the owner in the manifest as delivery-orchestrator and are marked as draft, and the gate result records the sponsor's adjudication.

### Cross-Family Second Opinion (high-stakes only)

The three roles that own a final verdict — Code Review Lead (`code-review`), Acceptance Review Lead (`acceptance-review`), and Review Researcher (`review-research`) — adjudicate on the decision layer, the same model family that produced the work under review. On an ordinary change this is fine: independence is already held by author/reviewer separation and the review-research circuit breaker. But on a high-stakes change, a verdict adjudicated by the same family that wrote the code shares its blind spot, and nothing downstream catches what both miss.

High-stakes means a security or permission boundary, a public/shared contract, or a data-loss / irreversible / hard-to-roll-back release. On such a change — and only such a change — the verdict owner takes one independent second opinion from a model family different from the one that produced the verdict, before issuing its conclusion. Inherit the other channel from the host exactly as Runtime Routing does — the Codex channel when the owner ran on Claude, the Claude channel when it ran on Codex — and never name a specific model: routing knows only "a different family than the one executing now," chosen from whatever channels the host actually exposes, not which family that is. The second opinion goes out under the independent-handoff discipline (pointers and paths only, no upstream conclusions — see "The Two Kinds of Context Fidelity"), reads the artifacts cold, and returns its own verdict; the owner records it in the decision artifact as one input and still owns the final call.

Opt-in, and it degrades honestly:

- Default for a high-stakes change: the second opinion is offered. If the host exposes no other-family channel, fall back to a same-family independent second pass and record the one-line reason in the decision artifact — do not block.
- When the sponsor explicitly required a cross-family second opinion and no other-family channel exists, fail loud: stop at the gate and report it, rather than letting the same family silently sign off on its own work.

Ordinary, non-high-stakes changes take no second opinion; their routing is unchanged.

## Fix-Loop Protocol (post-delivery rapid fixes)

When a narrowly-scoped defect surfaces after delivery (before a broader release) and the original diagnosis still holds, the Delivery Orchestrator may run a **lightweight fix-loop** instead of re-running the full pipeline. Enter only with sponsor agreement, and enforce three gates before any publish:

1. **Root cause locked** — the original diagnosis is re-confirmed; if it changed, escalate to a new task instead of continuing to patch.
2. **Reproduction bound** — a runnable case that reproduces the defect (from the TestPlan or newly written) is attached, and the fix is falsified against the original failing input, not a proxy sample.
3. **Pre-publish SCM gate** — before any push, confirm the target branch, current `HEAD`, and the built artifact all agree with the task; a mismatch blocks the push.

Keep a small **invariant ledger** across fix rounds (in `delivery/fix-loop.md` or the manifest): record every parameter/config the fix touches, and re-check the prior invariants each round so a later edit cannot silently revert an earlier fix. An invariant violation or an SCM mismatch is a hard stop pending sponsor risk acceptance.

## Task Classification

| Signal | Paradigm |
| --- | --- |
| New project/system, a new significant subsystem, or no existing codebase | `dev/architecture-first` |
| Defect, regression, incorrect behavior, crash, data loss, or security bug | `bugfix/hypothesis-driven` |
| A single function/component/endpoint, 1-2 modules, no change to existing interfaces | `addition/simple` |
| Enhancement to an existing product, behavior extension, or interface/data-flow change | `enhancement/delta-design` |

A **micro change** — one line or one file, no interface change, low risk — is not a paradigm question: recommend the Quick small change path (`direct`, sponsor adjudicates) or `partial-delegation` with the gate-skipping consult, at intake. Running a full paradigm on a micro change requires a recorded reason in `task.md`; "the pipeline exists" is not one. The compound question still gets its one line at the end.

When in doubt between paradigms, choose `enhancement/delta-design`. If a phase's quality gate exposes a classification mismatch, reclassify before continuing.

## Human Gate Policy

A human gate is the sponsor's checkpoint, not a phase's quality gate. Skipping a human gate only removes the sponsor's pause; it does not weaken the evidence required to move forward.

`blocked` is always scoped: it stops only the dependent claim, action, or phase transition. It never means the sponsor is blocked or that the whole task must stop. Continue every reversible, independent action that preserves approved intent, and record both the blocked transition and the continueable work in `task.md`. An explicit sponsor risk acceptance may change the delivery conclusion to `delivered-with-risk`; it never turns missing evidence into a passed quality gate.

A sponsor instruction such as "keep going," "do not stop for routine approvals," or "use your judgment" selects `continuous` pace and is a standing navigation preference. Record it once in `task.md`; skip every human pause that the workflow allows to be skipped, continue reversible decisions within approved scope, and defer non-urgent reporting to the next meaningful checkpoint instead of asking again. This preference cannot authorize fabricated evidence, unauthorized access, self-approval, or destructive/irreversible action without specific informed confirmation; those constraints apply only to the affected transition.

Default human gates: Requirements, TestPlan, Design or diagnosis, Implementation Story Spec, blocking or risky review/verification decisions, the review-research verdict and fix recommendations (before `fix` lands), Final delivery.

After `review-research` and before `fix` is a natural sponsor checkpoint: here the sponsor can confirm which findings are real problems, which are false positives, which land now versus defer to a follow-up (research's `disposition`, overridable here in either direction), and whether the proposed fixes are acceptable, before clearing `fix` to land. For small, low-risk changes, you may consult the sponsor about skipping this gate, but skipping does not change the dependency that "`fix` must consume the verified `review/research/`."

Outcomes allowed at each human gate:

| Outcome | Meaning |
| --- | --- |
| `approved` | The sponsor approves or says to continue. |
| `skipped` | The sponsor explicitly skips this gate. |
| `revised` | The sponsor requests changes; rerun or revise the corresponding phase before continuing. |
| `blocked` | The named transition cannot honestly proceed yet; it needs sponsor input, credentials, environment, or risk acceptance. Independent reversible work continues. |

### Gate Navigation Menu

When entering a human gate, don't just ask "approved?" First give the sponsor enough of a summary to judge, then short options. Default format:

```text
Where we are: <phase/gate> has reached the human gate; this step decides <downstream impact>.
Evidence: <artifact paths + key conclusions/gaps, no more than 4 items>.
Blocked transition: <specific claim/action/phase that cannot proceed, or None>.
Still moving: <reversible independent work continuing now, or None>.
I recommend: one of <approved/skipped/revised/blocked>, because <one-line reason>.
Options:
1. Approve, proceed to <next phase>
2. Have me revise per <specific direction> and come back
3. Supply information / risk acceptance
4. Skip this human gate (only when this gate allows skipping; note that the quality gate is not relaxed)
```

Tailor the options to the context: under `direct`, review-type gates don't offer "skip"; when confidence is LOW or credentials are missing, the affected transition's default recommendation must be `blocked`; when the review owner returns `request_changes` or `needs_more_evidence`, the default recommendation must be revise/supply-evidence, not approve. A `blocked` recommendation names at least one resolution path and, whenever one exists, one action that can continue now. When the sponsor answers in natural language, map it to `approved`, `skipped`, `revised`, or `blocked` and record it; ask one follow-up only if the mapping is unclear.

For small, low-risk changes, consult the sponsor about whether to skip some upcoming gates — name the specific gates, and keep review independent. For example: "This is a small, isolated change; want me to skip the human gates for TestPlan and Design, keep Code Review, and report at Final delivery?"

Never silently skip a human gate. Record skipped gates in the Gate History of `task.md` and in `manifest.md`. Gate requests travel one channel: only the Delivery Orchestrator raises a sponsor gate and records its outcome. A worker that needs sponsor input escalates through its receipt (`blocked` / Open Questions) — a "gate request" block inside a worker's artifact is void, and a review role that adjudicates an authorization gap itself (instead of grading `needs_more_evidence` back to the orchestrator) has crossed the same line.

A sponsor reply that does not address a gate's question maps to **no outcome**: record the gate as pending (or `blocked` on its dependent transition) and ask the one follow-up — a partial or asynchronous answer covers only the gates it actually speaks to, and Gate History entries may cite only clauses that exist in this document, never an unnamed "default-approve convention".

When unattended (the sponsor is absent — automation-triggered, scheduled job, called by another process), no agent may answer a human gate. The sponsor may pre-approve named gates before the run starts (recorded in `task.md`'s Gate History, treated as `approved`); when reaching a gate that wasn't pre-approved, write the pending question and the current artifact paths into `task.md`, stop the dependent branch, continue any pre-approved or independent reversible work, then end the round and wait for the sponsor to return and adjudicate — "the sponsor would probably agree" is not a reason to cross the gate.

Even when a gate is skipped or full automation is required, the following still require a pause before the affected transition: requirements confidence is LOW or the success criteria are unclear; priority, scope, or risk acceptance is unclear; a review owner returns `request_changes` or `needs_more_evidence`; verification fails or lacks necessary evidence; credentials, environment, or permissions are missing; Final delivery status needs reporting. The pause does not suspend unrelated reversible work.

## Paradigms

### `dev/architecture-first`

1. `validate-requirements`
2. `test-plan`
3. `test-plan-review`
4. `architecture`
5. `interface-contract` — unless it's S complexity, a single submodule, and has no public/shared interface risk
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `review-research` — when code-review produces findings that need handling; verify truth, give fix recommendations, explain per issue
11. `fix` — land the fixes that `review-research` judged confirmed/partial; must follow `review-research`
12. `verify`
13. `acceptance-review`
14. `compound` — soft phase: turn this round's lessons into active assets (regression tests, repo rules, sponsor-gated reviewer proposals); scaled to the task, never hard-gating `deliver`
15. `deliver`

### `enhancement/delta-design`

1. `validate-requirements`
2. `test-plan`
3. `test-plan-review`
4. `impact-analysis` — to describe the delta to existing code; when structural decisions also need separate description, produce `architecture` as well.
5. `interface-contract` — produce when a public/shared API, schema, protocol, cross-module boundary, or parallel-implementation contract must be stabilized; it can combine with `architecture` or `impact-analysis`.
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `review-research` — when code-review produces findings that need handling; verify truth, give fix recommendations, explain per issue
11. `fix` — land the fixes that `review-research` judged confirmed/partial; must follow `review-research`
12. `verify`
13. `acceptance-review`
14. `compound` — soft phase: turn this round's lessons into active assets (regression tests, repo rules, sponsor-gated reviewer proposals); scaled to the task, never hard-gating `deliver`
15. `deliver`

Design artifacts are owned by the Solution Architect.

### `bugfix/hypothesis-driven`

1. `validate-requirements` — based on the bug report and reproduction confidence
2. `diagnose`
   - When the fix spans multiple modules, changes existing behavior, or needs an explicit landing spot/preserved behavior, append `impact-analysis`.
   - When the fix involves a public/shared API, schema, protocol, or cross-module contract, append `interface-contract`.
3. `implementation-plan`
4. `plan-review` — unless the fix is explicitly scoped as tiny and low-risk
5. `implement`
6. `code-review`
7. `review-research` — when code-review produces findings that need handling; verify truth, give fix recommendations, explain per issue
8. `fix` — land the fixes that `review-research` judged confirmed/partial; must follow `review-research`
9. `verify`
10. `acceptance-review`
11. `compound` — soft phase: turn this round's lessons into active assets (regression tests, repo rules, sponsor-gated reviewer proposals); scaled to the task, never hard-gating `deliver`
12. `deliver`

Diagnosis defines the correctness and regression criteria, and `verify` consumes them directly. When the verification surface outgrows what the diagnosis criteria can carry — multi-surface regressions, layered environments — insert `test-plan` (+ `test-plan-review`) after `diagnose`: the Test Planner's declared ability to consume diagnosis criteria only runs when this insertion gives it a phase. If the bug can't be reproduced or its boundary can't be pinned down, block to ask for more information rather than guess.

### `addition/simple`

1. `validate-requirements`
2. `test-plan` — with feature-level acceptance criteria
3. `test-plan-review`
4. `impact-analysis` — only when the target module, constraints, or behavior to preserve isn't obvious
5. `interface-contract` — only when some public/shared API, schema, protocol, or cross-module boundary must be stabilized
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `review-research` — when code-review produces findings that need handling; verify truth, give fix recommendations, explain per issue
11. `fix` — land the fixes that `review-research` judged confirmed/partial; must follow `review-research`
12. `verify`
13. `acceptance-review`
14. `compound` — soft phase: turn this round's lessons into active assets (regression tests, repo rules, sponsor-gated reviewer proposals); scaled to the task, never hard-gating `deliver`
15. `deliver`

When it affects more than 3 modules, or an existing interface must change, escalate to `enhancement/delta-design`.

## Phase Catalog

| Phase | Owner | Inputs | Outputs | Quality gate |
| --- | --- | --- | --- | --- |
| `validate-requirements` | Delivery Orchestrator (writes personally, see `references/validate-requirements.md`) | task description, issue, or requirement draft | validated requirements with confidence, user journeys, and constraints, plus a flow diagram when it clarifies intent | confidence MEDIUM/HIGH; no blocker questions; inputs/outputs/constraints/success criteria understood; user journeys observable; if multiple solution paths were plausible, sponsor selected a path or authorized a hybrid; diagrams included whenever they make a journey, scope, state, or before/after behavior easier to understand, any number, with syntax and readability validated |
| `test-plan` | Test Planner | validated requirements or diagnosis criteria, project testing context (`teamspace/testing-context.md`, explore to fill it in first if missing) | a TestPlan file set: the overall strategy (risk-ordered checks, required layers, environment needs, explicit gaps) plus the API/E2E/Regression playbooks | Must Haves observable; forbidden zones specific; no unjustified coverage gaps; playbooks runnable as written (E2E execution shape explicit, user input given verbatim) |
| `test-plan-review` | Test Plan Reviewer | validated requirements, the TestPlan file set, project constraints | `approve`, `request_changes`, `needs_more_evidence`, or `blocked` | the test plan is executable, covers the requirements/risk surface, and has no test theater |
| `architecture` | Solution Architect | validated requirements and the approved TestPlan | a reader-facing design: context, goals, key decisions, module boundaries, interfaces, data/state flows, compatibility, trade-offs, risks, verification-relevant constraints | required decisions explicit; the design is thorough and clear enough for the sponsor and Implementation Planner to work from; diagrams included whenever they make structure, sequencing, ownership, data/state flow, or before/after change easier to inspect, any number, validated; each step states the action/output/boundary, not just a function name |
| `impact-analysis` | Solution Architect | validated requirements, the approved TestPlan, existing code context | a delta record: affected modules, interface/data changes, behavior to preserve, risks, complexity, plus a useful delta diagram or flow description | affected modules and interface changes explicit; current and target behavior understandable; risk assessment present; a diagram or precise flow description makes the delta inspectable; use a before/after comparison only when it directly explains the change; complexity S/M or escalated |
| `diagnose` | Solution Architect | bug report, reproduction steps, observed failure | a diagnosis: verified hypotheses, evidence, root cause, proposed fix, affected files, regression criteria, plus a useful failure/fix diagram or flow description | the root cause's causal chain has evidence; no guessing; reproduction status recorded; the failure path and corrected behavior are understandable; diagrams are complete, not placeholders |
| `interface-contract` | Solution Architect | the architecture or impact document plus the interface requirements | a Markdown interface contract artifact: public/shared interfaces, request/response schemas, auth/error semantics, compatibility behavior, verification hooks | every public/shared/cross-module interface has a contract with signature, schema, protocol shape, ownership, compatibility, and auth/error semantics; shared types centralized; the API Contract Reviewer/Tester can verify without guessing; because this phase lands after the TestPlan in every paradigm, the Orchestrator hands the finished contract back for a TestPlan contract-delta pass — API/contract checks written before the contract existed are provisional until then |
| `implementation-plan` | Implementation Planner | validated requirements, the approved TestPlan, design artifacts/contracts | an Implementation Story Spec: goals, scoped ACs, ordered tasks, target modules, constraints, verification expectations given by reference | the first task is unambiguous; target paths/modules named; no open questions that change the implementation direction |
| `plan-review` | Plan Review Lead | the Implementation Story Spec plus requirements, TestPlan, design artifacts/contracts | `approve`, `request_changes`, `needs_more_evidence`, or `blocked` | the Story Spec gives the Implementation Engineer enough context to not invent architecture itself |
| `implement` | Implementation Engineer | the approved Implementation Story Spec and the Plan Review Lead decision | working code, focused tests, an implementation result recording changed files/commands/deviations/blockers | consistent with the approved Story Spec/contracts; focused tests/checks run or blockers recorded |
| `code-review` | Code Review Lead | the diff, changed files, Story Spec, requirements, TestPlan, design/diagnosis, local standards | a review decision plus graded findings | review complete; correctness, standards, simplicity, change hygiene, and project stewardship considered; must-fix items handled via `review-research`/`fix` or decided as request_changes |
| `review-research` | Review Researcher (when findings are many, the Delivery Orchestrator orchestrates in parallel by code domain and aggregates the index) | code-review findings (required — activation follows the Code Review Lead's routing: findings the lead routed to research/fix; a decision that routes nothing there skips both this phase and `fix`), the diff, design principles/conventions | `review/research/`: **one per-issue file per finding** (verdict + root-cause-level fix recommendation + a human-readable explanation for someone unfamiliar) + `00-index.md` | each finding has an evidence-backed verdict landed on real code, written per item (not bundled), with context; false-positive/partial items explain why; confirmed/partial items get an elegant fix recommendation and a disposition (`fix-now`/`defer`, reconciled against the requirements' Non-Goals, a `defer` naming the follow-up shape); missing out-of-repo context is marked for human confirmation rather than forced to a conclusion |
| `fix` | Delivery Orchestrator coordinating parallel Review Fixer workers | `review/research/` (required, with verdicts and fix recommendations) + human comments; the changed-file list | per-group `review/fix-records/<group>.md` + the aggregate `review/fix-result.md` + backend code changes (left in the working tree) | `review/research/` found and consumed (if missing, stop and require `review-research` first); confirmed/partial items partitioned into mutually non-overlapping groups by file ownership, parallel workers dispatched to land them, no concurrency on the same file; each worker lands faithfully, fixing the root cause rather than patching; merge validation run once and passing; no commits; no touching the frontend unless the sponsor explicitly authorized frontend scope for this task at a recorded gate and the assignment relays that waiver |
| `verify` | Test Leader coordinating testers | the implementation, the TestPlan or diagnosis criteria, the environment spec; when a `fix` phase ran, also `review/fix-result.md` + `review/fix-records/` — the tree under verification is the post-fix tree, and the Implementation Result alone no longer describes it | verification results given per capability/integration/E2E/regression | required checks pass; E2E run when needed; gaps explicit; no fabricated or assumed success; each passed/failed result names its result-file path or output excerpt (e.g. verification/test-results/<tester>.md), not a bare pass/fail; a behavior claim that can only be verified in an environment the local box lacks (e.g., a real browser, headless renderer, GPU, or prod-like service) MUST run in that environment or be marked status=unverified and may not pass any gate; user verbal confirmation is not evidence |
| `acceptance-review` | Acceptance Review Lead | `acceptance/acceptance-package.md` — the Delivery Orchestrator assembles it before dispatching this phase, so the lead's required input always has an obligated producer — plus requirements, TestPlan, Story Spec, implementation notes, the code review decision, verification evidence including `verification/verification-report.md`, fix results when a `fix` ran, residual risks | `accept`, `reject`, `needs_more_evidence`, or `blocked` | evidence supports every Must Have and the scoped risks; for defect-class tasks, the original failing input has been re-run against the fix and produces correct output; residual risk acceptable |
| `compound` | Delivery Orchestrator (writes personally like `deliver`: no assignment/receipt, manifest entry required) | the finished round's artifacts (diagnosis, fix results, review research) plus mid-task compound notes | `compound/compound-result.md` (`artifact_type: CompoundResult`): regression tests landed in the target repo, rules landed in the target repo's `CLAUDE.md`/`AGENTS.md`, reviewer-trigger proposals awaiting the sponsor, persistent entries under `teamspace/compound/` — or an honest "无可沉淀" with the reason | soft phase on the deliver path only: skipping is visible (the delivery report's compound line stays empty) but `deliver` is never hard-gated on it; a one-line change compounds as one line; AgentCorp-self-modifying assets land only as proposals pending an explicit sponsor yes (see `references/compound.md`) |
| `deliver` | Delivery Orchestrator | the accepted implementation and evidence | a delivery report | the report and the final sponsor reply explicitly list artifact paths — code location, verification/test-result paths, review/MR paths — plus tests, deviations, follow-ups, and residual risks; any claim with no inspectable path is recorded as a gap, never stated as passed |

### Phase Completion Hint

After each phase passes its quality gate, report to the sponsor only what helps them judge the next step:

- `What was done`: the phase name + plain-language meaning.
- `Where the evidence is`: artifact paths, key tests/checks, the receipt or review decision.
- `Next step`: the next phase and owner; if there's an active human gate, switch to the Gate Navigation Menu.
- `Optional redirect`: offer only when new evidence exposes a scope, risk, or classification change; otherwise don't re-list the full menu.

When sending a phase back, give navigation too: state the reason for the send-back, what you'll change before re-dispatching, and whether you need sponsor input. A reviewer whose only remaining objection is a single named amendment may return `request_changes` **scoped**: name the one landing spot and its acceptance criterion, and the re-review verifies that amendment only — a one-line fix must not force a full re-dispatch/re-review round. After sending the same phase back twice in a row, default to stopping and re-evaluating the partition or plan, and offer the optional routes to the sponsor.

## Artifact Re-entry and Coherence

A task may be revised at any time, including after implementation has started. Artifact creation order is a useful reading order; it does not make later artifacts subordinate or prevent a later discovery from revising an earlier one.

Scope accretion is a revision event, not conversational ambience. Three arrivals trigger this protocol the moment they appear: the sponsor casually mentions a new want mid-discussion ("also, could it…"), a review or design conversation surfaces an improvement nobody ordered, or a worker reports that the fix or capability it owns deserves more than this task can carry. None of these is license to widen the open artifacts — the most common inflation path is exactly this drip: each review round absorbs one "reasonable" addition, and by delivery the architecture and requirements cover a task nobody gated. The default for separately deliverable scope is a **spin-off** — a linked task on its own branch/MR — and proposing it is the Orchestrator's move, made proactively and out loud ("this deserves its own flow; one branch carries one deliverable"), never a concession the sponsor must extract. Absorbing new scope into the current task is a recorded gate decision that reconciles requirements (including Non-Goals), TestPlan, and design on the delta; a sponsor's passing mention is intent to explore, never that decision by itself. Record every such arrival with its answer (absorbed per gate row N / spun off to <task> / declined for now) in `task.md` — an unlogged "later" is how later silently becomes now.

Baseline drift is likewise a revision event, on either ref. **Source drift**: `source_ref` moved or was rebased onto code this task touches, a stacked parent branch changed, or `merge_base` is no longer an ancestor of the working branch. **Target drift**: the sponsor re-targets `target_ref`, or `target_ref` advanced onto the same code. Update the frontmatter refs (new `merge_base`) and reconcile per this protocol — name which claims in requirements, design, or verification were read at the old baseline and no longer hold — before any dependent phase advances; and when `source_ref` != `target_ref`, delivery additionally requires the work reconciled onto `target_ref`.

1. **Decide update versus new task.** Revise the current task when the intended outcome is unchanged and the new request substantially overlaps the existing work. Start a linked task when intent changes, scope expands into a separately deliverable outcome, or the original task can complete independently. When in doubt, recommend the linked task and say so. Never preserve continuity by silently mutating one task into a different promise.
2. **Resolve the real artifact set.** Use `manifest.md`, `task.md`, and the task root to enumerate the concrete files that exist; do not rely on remembered filenames, stale assignments, or unresolved glob patterns. The repository is the source of truth for current code behavior; approved task artifacts are the source of truth for approved intent until their gates are reopened.
3. **Apply a semantic delta.** Change only what the new decision affects, preserve untouched content, and make the update idempotent: applying the same decision again should yield no further edit.
4. **Reconcile in every direction.** Read the touched artifact and every existing artifact whose claims depend on or constrain it. A design change may revise requirements, a code discovery may revise design and tasks, and verification evidence may invalidate an earlier assumption. Record contradictions, gaps, and duplication rather than updating only downstream files.
5. **Route and mark staleness.** Each artifact revision goes to its owner. Mark affected rows in `manifest.md` as `needs_revision`, record `revised` in Gate History where approval is invalidated, replace stale assignments with refreshed Action Context, and do not advance the dependent branch until the set is coherent again.
6. **Carry plan changes into code and evidence.** If implementation already exists, a coherent planning update is not completion: re-enter implement, review, and verification for the affected slice. Unaffected reversible work may continue.

Keep the live reconciliation state in `task.md` under Artifact Coherence: trigger, affected artifacts, current state, and next owner. A task is ready to deliver only when this ledger says `coherent`.

## Stage Owners

- The Delivery Orchestrator owns classification, mode selection, gatekeeping, and final delivery in all three modes.
- The Delivery Orchestrator directly owns `compound` (load `references/compound.md` on entering it) and `validate-requirements` and writes the artifact personally — on entering that phase, load `references/validate-requirements.md` (confidence, when to block, the gate adjudicated by the sponsor; shape per the demo, bar per the Phase Catalog).
- Under `partial-delegation`, the Delivery Orchestrator also personally writes `test-plan`, the design/diagnosis/contracts when needed, `implementation-plan`, `implement`, and `verify` artifacts.
- Under `direct`, the Delivery Orchestrator executes every phase itself; for review-type phases it produces a draft from the corresponding review perspective, with approval resting on the sponsor's human gate.
- Under `full-delegation`, the Test Planner owns `test-plan`; the Solution Architect owns the design/analysis artifacts; the Implementation Planner owns the Implementation Story Spec; the Implementation Engineer owns `implement`; the Test Leader owns verification coordination; the API Contract Tester, E2E Tester, and Regression Tester execute their assigned verification.
- `test-plan-review` belongs to the Test Plan Reviewer, `plan-review` to the Plan Review Lead, `code-review` to the Code Review Lead, and `acceptance-review` to the Acceptance Review Lead — this holds under both `partial-delegation` and `full-delegation`; under `direct`, the approval of these reviews belongs to the sponsor's human gate.
- `review-research` is delegated to the Review Researcher. When findings are many, the Delivery Orchestrator dedups and clusters by code domain and dispatches multiple Review Researchers in parallel, each writing **per-issue** files for its cluster, and the Orchestrator then aggregates `00-index.md`; workers don't write bundle files and don't fan out themselves. `fix` is likewise orchestrated in parallel by the Delivery Orchestrator: partition the files into groups, dispatch multiple Review Fixer single workers in parallel, run merge validation, and aggregate `fix-result.md`; a Review Fixer only lands the group it was assigned, and does not partition or dispatch itself. This holds under both `partial-delegation` and `full-delegation`, to preserve the author separation between "independent verification" and "faithful landing"; under `direct`, the Orchestrator does research and fix itself in sequence, and the author separation is preserved by having the research verdict pass the sponsor's human gate first. `fix` always comes after `review-research`, and consumes only the verified `review/research/`.

## Artifact Organization

Before minting a new task, reconnoiter `teamspace/tasks/`: an in-flight or truncated task on the same intent is resumed or explicitly superseded (linked in the new `task.md`), never silently duplicated — a prior task's receipts and manifest are the memory a restart must not relabel as "来源不明". Then, when there's truly no existing task, set `task_id` to `<YYYYMMDD-HHMMSS>-<desc-slug>` (timestamp first, so a directory listing by name browses in time order), set `task_root` to `teamspace/tasks/<task_id>/` relative to `workdir`, and then create `task.md` and `manifest.md` per the demos.

Every task pins its **Baseline** in `task.md` at intake, before any artifact reads code — as frontmatter metadata (`source_ref`, `target_ref`, `merge_base`) so `validate-handoff.py` can check every ref-carrying assignment against the ledger mechanically, plus the working branch in the body. `source_ref` is what the working branch is cut from and verified against — a spin-off stacking on its parent names the parent's branch and lands only after it merges; `target_ref` is what the delivery merges into — usually the repo default branch, even when stacked. Both refs are sponsor intent, not checkout facts: default to the repo's default branch, and when the current checkout is anything else — especially a stale or temporary-looking branch — say it out loud with the evidence (current branch, ahead/behind the default) and confirm before proceeding, because building on whatever HEAD happened to be is how a task gets delivered onto a branch the sponsor abandoned. Requirements, design, and every diff implicitly claim "read at `merge_base` on `source_ref`"; the claim is checkable only because it is recorded.

When a task produces persistent notes, designs, prompts, screenshots, logs, reviews, verification evidence, or handoffs, locate the artifact's place before writing. All persistent collaboration artifacts live under `<workdir>/teamspace/`; when a separate `code_worktree`/`code_location` exists, they must be synced to the same relative path under `<code_worktree>/teamspace/` — when creating or updating an artifact, write the current side first, and before reporting completion, copy the same relative path to the other side. Record artifact paths relative to `workdir`; don't rewrite `<workdir>` into a machine-specific Location path. The default task runtime layout:

```text
teamspace/tasks/<task_id>/
  task.md
  manifest.md
  probe/                          # optional pre-requirements terrain report (probe capability)
    00-probe.md
  handoffs/
    001-validate-requirements.md
    001-validate-requirements-receipt.md
  requirements/
    validated-requirements.md
  test/
    test-plan.md                    # overall strategy; execution playbooks alongside as needed
    api-test-plan.md
    e2e-test-plan.md
    regression-test-plan.md
    test-plan-review.md
  design/                         # combine as needed; multiple artifacts may coexist
    architecture.md
    impact-analysis.md
    diagnosis.md
    interface-contract.md
  implementation/
    implementation-story.md
    implementation-result.md
  review/
    plan-review.md
    plan-review-findings/          # plan-review specialists (kept apart from code-review's)
    code-review.md
    specialist-findings/
    research/
      00-index.md
      <id>-<verdict>-<slug>.md
    fix-result.md
    fix-records/
  walkthrough/                    # optional teaching artifact for the change (walkthrough capability)
    <slug>.html
  verification/
    assignments/
    verification-report.md
    test-results/
  acceptance/
    acceptance-package.md
    acceptance-decision.md
  compound/
    compound-result.md
  delivery/
    delivery-report.md
```

Use only the files/subdirectories the task needs. Keep paths inside artifacts and handoffs relative. Outside the task directory, `teamspace/testing-context.md` is the project-level testing context (the basis for the test-plan phase, reused across tasks and maintained incrementally), and `teamspace/compound/` is the cross-task compound store (successor of `teamspace/learnings/`; migrate old entries opportunistically). `teamspace/` is local coordination state: if it shows up in git status, add `teamspace/` to `.git/info/exclude` for that local repo or worktree; never stage or commit it. Any repo-level scan a plan or check performs (grep for consumers, dead-code sweeps, coverage gates) must explicitly exclude `teamspace/` — the mirror-synced copies of the pipeline's own artifacts will otherwise trip the scan.

`task.md` is also the live execution ledger. Update its Execution Progress after each completed, failed, or blocked work unit with the evidence handle or blocker. The approved Implementation Story Spec remains stable planning input; never turn its checkboxes or prose into runtime state.

## Orchestrator Artifact Demos

Use the local demos rather than restating the shape:

- `references/templates/task-record.demo.md` corresponds to `task.md`
- `references/templates/task-manifest.demo.md` corresponds to `manifest.md`
- `references/templates/phase-assignment.demo.md` corresponds to a delegated phase's assignment
- `references/templates/phase-receipt.demo.md` corresponds to a delegated phase's receipt
- `references/templates/acceptance-package.demo.md` corresponds to `acceptance/acceptance-package.md`

Copy the shape, then replace the example values with the current task's phases, owners, statuses, and paths.

`artifact_type` values: what the Orchestrator produces is `TaskRecord`, `TaskManifest`, `PhaseAssignment`, `AcceptancePackage`, `FixResult` (`review/fix-result.md`), `CompoundResult` (`compound/compound-result.md`), or `DeliveryReport` (`delivery/delivery-report.md`), with `author_agent: delivery-orchestrator`; a delegated phase's receipt is written back by its owner, with `from_agent` being that owner and `phase` being the assignment's phase. At final delivery, write `delivery/delivery-report.md`, covering Status, Code/Artifact Location, what was delivered, the verification results, gaps, follow-ups, and the key artifact paths. Merging or pushing the product code is not part of `deliver`: it stays with the sponsor unless they explicitly order it, and an ordered push runs the Fix-Loop Protocol's pre-publish SCM gate first.

## Phase Handoff Discipline

For a delegated phase, the Delivery Orchestrator writes the assignment file before the phase begins. Every delegated assignment carries a `task_root` (`teamspace/tasks/<task_id>/` relative to `workdir`) and an `output_path` relative to that task root; when Location and Workspace differ, the same task root must also exist at `<code_worktree>/teamspace/tasks/<task_id>/`. The delegated owner writes the phase artifact at the assignment's `output_path` and writes back a Markdown receipt that names the artifact path and the status.

Before dispatch, fill the assignment's Action Context with concrete values: source of truth; every context file the owner must read before acting; allowed edit roots; read-only context; output path; the task Baseline (`source_ref`/`target_ref`/`merge_base` copied into the assignment frontmatter from `task.md`) whenever the phase reads, diffs, or edits code; the `output_language` (the sponsor language recorded in `task.md`); and behavioral constraints. Context files are existing concrete paths, never an unresolved glob or a guessed conventional filename. Constraints guide the owner but are not prose to copy into the output artifact. When a revision makes an assignment stale, replace it before re-dispatch rather than appending contradictory instructions. A pre-written assignment cites gate outcomes only as ledger pointers ("per task.md Gate History row N"), never as adjectival fact ("the approved TestPlan") — and an assignment naming a gate precondition is not dispatched until Gate History actually carries that gate's outcome. On receiving a receipt, transcribe every deferred hand-over item it names (upstream write-backs, gate bookkeeping, follow-ups) into `task.md`'s Execution Progress with an owner — an unlogged deferral is how the same P2 gets re-verified three times.

For each receipt received, the Delivery Orchestrator runs the mechanical validation first, then makes the quality judgment — the two are separate:

- **Mechanical validation (envelope consistency)**: run `scripts/validate-handoff.py --pair <assignment> <receipt> --task-root <task_root>` (or `--sweep --task-root <task_root>` after processing a batch). It checks that the receipt's `artifact_path` truly exists, matches the assignment's `output_path`, that `from_agent`/`phase`/`task_id` line up with the assignment, that the artifact's `author_agent` matches the owner, and that status is non-empty. This step plugs the failures that a free-text contract most easily lets through — "the receipt says it's done but the artifact isn't there / wrong artifact / missing field" (receipt wording ≠ actual artifact). **A non-zero validation exit is treated as the handoff being incomplete**: send it back to the owner as `needs_more_evidence`, don't proceed to the next step, and don't count it as a gate pass.
- **Quality judgment (phase gate)**: only after the mechanical validation passes does the Orchestrator judge whether the status satisfies that phase's quality gate and whether the evidence is strong enough. Passing the mechanical validation does not mean the gate passes. When a receipt carries notes on deviations, concerns, or blockers, read the notes through before making the gate judgment; don't look only at the status field.

A send-back is not a verbatim retry. After a phase is sent back (mechanical validation failed, `request_changes`, `needs_more_evidence`, or the owner reports blocked), you must change something before re-dispatching: supply the missing context it named, narrow or split the task, switch the execution channel, or escalate to the sponsor — re-dispatching with nothing changed only earns the same failure. After sending the same phase back twice in a row, stop and re-evaluate whether the partition or the plan itself is wrong, rather than retrying a third time.

After validation passes, record the assignment, the artifact, the receipt, the human gate result, and the phase quality result in `manifest.md`, then sync the updated artifact set between Workspace and Location. The Delivery Orchestrator stops at an active human gate until the sponsor explicitly approves, skips, or redirects.

Under `partial-delegation`, a phase the Delivery Orchestrator writes personally may omit the assignment/receipt files, but the phase artifact and manifest entry are still required; review phases still use assignment/receipt because they remain delegated. Under `full-delegation`, a delegated phase must have an assignment/receipt. Under `direct` there are no assignment/receipt, and all phase artifacts and manifest entries are still required. In any mode, the validated requirements artifact is written personally by the Delivery Orchestrator (see `references/validate-requirements.md`). During delegated verification, the Test Leader may write tester assignments under `verification/assignments/`, testers write result files under `verification/test-results/`, and the Test Leader writes the final `verification/verification-report.md`.

### The Two Kinds of Context Fidelity in a Handoff (coupled vs independent)

The default principle that "an upstream artifact's name and path are enough, cite rather than restate" applies to one kind of handoff only, not all. When writing an assignment and deciding how much context to feed, first identify which kind it is:

- **independent (independent/review type)**: `test-plan-review`, `plan-review`, `code-review`, the specialist reviews, `review-research`, `acceptance-review`, the verification types. What the downstream needs is an **independent judgment**, and seeing too many upstream conclusions actually biases it (conformity). Here, hold the default principle: pass **pointers/paths**, let the downstream read and judge for itself; the downstream returns **distilled conclusions** (findings/decision), not re-injected raw context. This preserves independence and saves context.

- **coupled (coupled/continuation type)**: `implement`, `fix`, the `code-review → review-research → fix` repair spine, and any handoff where "the downstream builds on the upstream decision and getting it wrong cascades." Here it's **the reverse**: the assignment must carry the **full upstream artifact and prior decisions** (not a summary, not a pointer), because actions carry implicit decisions, and an implicit decision not passed along produces conflicts and rework. Typical must-include items: `fix` must carry `review-research`'s **full verdict + root cause + fix recommendation** for that issue (not a one-liner "see review/research/"); `implement` must carry the full text of the approved Story Spec and the relevant contract, not just a path.

The one-line criterion: **does the downstream "judge it again independently" or "build on the upstream conclusion"** — the former passes pointers to preserve independence, the latter feeds the full text to preserve coherence. When unsure, treat it as coupled (better to over-feed than to drop a decision).

## Verification Hierarchy

1. Capability: every per-module Must Have and failure/edge case is checked directly.
2. Integration/API: every cross-module or public-contract flow has both success and error-propagation checks.
3. E2E: every user-facing capability appears in at least one complete user goal, with both happy and error paths.
4. When a change involves UI, do a frontend visual/interaction check. The corpus ships no frontend owner: when nobody in the host can run or act on this check, record it as an explicit gap (or `status=unverified`) instead of skipping it silently — finding a frontend defect nobody may fix is a sponsor decision, not a dead end to hide.

Don't advance to a higher layer while a required lower-layer check still fails. When a scenario can't be run, record the reason and treat it as a gap, unless explicitly accepted.

## Parallel Execution Protocol

Parallel implementation is a protocol within the `implement` phase, not a separate phase. Parallelize only when all of the following hold: complexity is M/L/XL; at least two submodules can be built independently; the submodules share interfaces but not implementation; an architecture or impact document already exists; `interface-contract` is complete when public/shared API, schema, protocol, or cross-module contracts are involved; the Implementation Story Spec partitions tasks per the contracts and keeps only the integration context each submodule needs; the TestPlan scopes Must Haves, Need Haves, Failure/Edge Cases, and Forbidden Zones per submodule.

Before any parallel or batch dispatch, build a consolidated map of each unit's hard dependencies, required/provided contracts, touched files or surfaces, and allowed edit roots — including each unit's **own deliverables** (its new tests and files belong in its OWN list; a blanket FORBIDDEN_ZONE must never forbid a unit's own assigned outputs). A missing hard dependency blocks only dependent units; an overlap is a warning that must be resolved by grouping, ordering, or disjoint ownership, not an implicit dependency. Show one consolidated status and obtain one sponsor confirmation when a human choice is required. Track success, skipped, blocked, and failed per unit, and continue independent units after an isolated failure.

Each parallel implementation session receives exactly these inputs:

1. `STORY_SPEC_PATH`: the relative path to the approved Implementation Story Spec.
2. `DESIGN_DOC_PATH`: the relative path to the architecture, impact, diagnosis, or interface contract.
3. `OWN_CONTRACT`: the contract stub this session implements.
4. `DEP_CONTRACTS`: the read-only contracts this session calls but does not modify.
5. `TESTPLAN_SCOPE`: this submodule's capability, boundary, Must Have, Need Have, Failure/Edge Cases.
6. `FORBIDDEN_ZONE`: this submodule's explicit red lines.
7. `COMPLETION_SIGNAL`: the exact completion signal the coordinator expects.
8. `INTEGRATION_CONTEXT`: the integration tests and cross-boundary expectations involving this submodule.

### Parallelizing `review-research` (dedup-partition by code domain, output still written per item)

`review-research`, when findings are many, is also orchestrated in parallel by the Delivery Orchestrator. There's a distinction that must be held here: **the investigation unit may be clustered, but the output unit is always per item.** Clustering exists only so "the same batch of code isn't read repeatedly," and must never collapse the output granularity into a cluster file.

1. **Take the findings**: take all findings to verify from the code-review findings.
2. **Dedup and merge into clusters by code domain**: when multiple findings across reviewers point at the same file / the same call chain, group them into one cluster (e.g. "convert polling," "asset clone lock," "batch status contract"). A cluster exists so that one worker reads that shared batch of code once and covers multiple findings, rather than 33 findings each spawning an agent that re-reads the same files.
3. **Dispatch `review-researcher` in parallel**: one assignment per cluster, giving `FINDINGS` (the full text of each finding in this cluster + reviewer evidence, as leads only), `CODE_SCOPE` (the relevant code range for this cluster), `DESIGN_PRINCIPLES` (the documented design principles), the discipline of independent adversarial re-checking, and `OUTPUT_DIR=review/research/`. **Write the hard constraint into the assignment: the worker writes one per-issue file `review/research/<id>-<verdict>-<slug>.md` for each finding in its cluster (the verdict segment is the worker's own verdict, named per its skill), and is not allowed to write a bundle/cluster file.** Respect the harness concurrency limit; if parallelism isn't supported, go serial, with the protocol unchanged.
4. **Aggregate the index**: each worker writes the per-issue files for its few findings and returns a receipt. After all return, **the Orchestrator aggregates `review/research/00-index.md` from all per-issue files** (index shape, same as the Review Researcher's own: one line per finding ordered P0→P1→P2 — one-sentence summary + verdict + an empty human-decision column + a link to the per-issue file). The Orchestrator does not invent a merged `SUMMARY.md`, nor assign a custom `artifact_type` to the index — the index is `00-index.md`.
5. **Only proceed to fix after the human-review gate**: by default, stop at the review-research human gate to let the sponsor confirm the verdicts and fixes, then proceed to `fix`; don't chain straight from research to fix.

When receiving receipts, validate as usual with `scripts/validate-handoff.py` (a worker receipt's `artifact_path` points to one of the per-issue files it produced or to `review/research/`), and after the index is aggregated, run a full `--sweep` pass.

### Parallelizing `fix` (same protocol, partitioned by file ownership)

`fix` is also a parallel protocol orchestrated by the Delivery Orchestrator, not a special case outside a separate phase. Precondition: `review-research` has produced `review/research/`, in which there are fix items judged **confirmed/partial**. The Orchestrator does the following:

1. **Take the items to fix**: take the confirmed/partial items whose **`disposition` is `fix-now`** and their fix recommendations from `review/research/` (overlaid with human comments — a human override beats research's disposition in either direction; false positives, `needs-human` items, and `disposition: defer` items are not fixed — defer items become follow-ups the sponsor sees at deliver). If `review/research/` can't be found, stop and run `review-research` first.
2. **Partition into mutually non-overlapping groups by file ownership**: list each item's primary file to change (and the foreseeable spill-over files); **items touching the same file go into the same group**, handled serially by the same worker. The file-occupancy sets of two groups must be disjoint.
3. **Dispatch `review-fixer` single workers in parallel**: one assignment per group, giving exactly these inputs — `GROUP_SLUG`, `FIX_ITEMS` (this group's confirmed/partial items and the research fix recommendations), `OWNED_FILES` (the file set this group is authorized to edit and no other group will touch), `REPO_CONVENTIONS`, `FOCUSED_VALIDATION` (the focused checks this group should run), `OUTPUT_PATH` (`review/fix-records/<group-slug>.md`). Respect the harness concurrency limit: queue when over the limit and fill as slots free up; if the harness doesn't support parallelism, go serial, with the protocol unchanged.
4. **Collect + merge validation**: each worker writes its group's `fix-records/<group>.md` and returns a receipt. After all return, the Orchestrator **runs one** full-repo validation over the merged changes (syntax/import/types/relevant tests) to catch cross-group interactions. A failure that lands on a changed file → send the relevant group back to redo, or escalate; a failure that lands only on a file no one changed → record it as a pre-existing failure.
5. **Aggregate**: the Orchestrator writes `review/fix-result.md`: aggregate each group's disposition by P0→P1→P2 (landed/sent back as needs-research/needs-human/false-positive reference), the merge validation result, and the residual risks. This aggregate belongs to the Orchestrator, not to any single worker.

Workers don't collide on files because their occupancy sets are disjoint; if some worker's fix spills out of `OWNED_FILES`, it must stop and report rather than cross the boundary, and the Orchestrator re-partitions or reruns serially.

## Compound (沉淀)

Lessons used to live in a silent housekeeping note that almost never triggered — not a phase, gated by nothing, invisible when skipped. `compound` is now a **soft phase** between `acceptance-review` and `deliver` in every paradigm: the orchestrator walks to it naturally, it produces assets that change future behavior on their own (a bug becomes a regression test, a decision becomes a repo rule, a confirmed review pattern becomes a sponsor-gated reviewer proposal), and skipping stays visible without ever hard-gating `deliver`. The bar, the three active assets, dedup, reflux, and per-scale behavior are in `references/compound.md`.

Two standing touchpoints live outside the phase: at the start of `intake`/`validate-requirements`, **search** `teamspace/compound/` by task keyword and feed relevant entries by path into the downstream assignment; **mid-task**, when a compoundable moment happens (a counterintuitive root cause, a batch of overturned false positives, a repo trap, `FAILED:` marks before a fresh-start handoff), jot the lightweight note then — the phase collects the scraps, it does not rely on end-of-task memory.

## Wrap-Up Navigation

`deliver` is not just announcing completion. Both the final reply and `delivery/delivery-report.md` must let the sponsor know whether the task can be closed out, where the evidence is, and what natural follow-ups remain. Default structure:

1. Status: delivered / delivered-with-risk / blocked / rejected.
2. What was delivered: code location, key artifact paths, key verification.
3. Deviations and residual risks: write none if there are none; otherwise give an owner or acceptance condition.
3.5. Compound: one sentence on what this round compounded (tests/rules/proposals), or "无可沉淀".
3.6. Effort ledger: the tier, what the Effort table promised for it, what actually ran, and every deviation with its reason (auto-upgrades named) — the tier is audited here, not just declared at intake.
4. Recommended next step: one clear recommendation.
5. Optional follow-ups: list 2-4 as needed, e.g. close the task, create a follow-up, run `walkthrough` (sponsor understanding + quiz gate), do another round of verification, review the compound result, return to a gate to revise.

If acceptance didn't pass or evidence is insufficient, the recommended next step cannot be "close out"; it must point to supplying evidence, revising, re-reviewing, or sponsor risk acceptance.
