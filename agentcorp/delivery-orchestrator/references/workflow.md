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

### Sponsor Work-Path Menu

Mode is an internal ledger term; lead with the collaboration cadence to the sponsor, then map it to a mode:

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

- **Claude (decision layer)**: Delivery Orchestrator, Test Planner, Test Plan Reviewer, Solution Architect, Implementation Planner, Plan Review Lead, Code Review Lead, Test Leader, Review Researcher, Acceptance Review Lead, Adversarial Reviewer, Parallel Researcher, Simplicity Reviewer, Project Steward Reviewer — go through the native subagent/Agent capability of the current Claude environment.
- **Codex (execution layer)**: Implementation Engineer, Review Fixer, Correctness Reviewer, Security Reviewer, Performance Reviewer, Reliability Reviewer, Standards Reviewer, API Contract Reviewer, API Contract Tester, E2E Tester, Regression Tester — go through the native subagent/CLI/skill capability of the current Codex environment; when no Codex channel is present in the host, degrade to a local subagent invocation of the same skill, with the protocol unchanged.

Review independence cannot be compromised in any of the three modes; only the adjudicator changes: under `partial-delegation`/`full-delegation`, `test-plan-review`, `plan-review`, `code-review`, and `acceptance-review` always go to their review owners; under `direct` these phases have the Delivery Orchestrator produce a draft conclusion itself, but **a draft is not approval** — each review phase's human gate must stay active and be adjudicated by the sponsor, and these gates cannot be skipped under `direct`. In any mode, the Delivery Orchestrator never approves its own artifacts or evidence.

The two phases that handle code-review findings, `review-research` and `fix`, are both **delegated** out under `partial-delegation`/`full-delegation`; the Delivery Orchestrator does not verify or write fix code itself (under `direct` it does them itself, but keeps the same order and artifacts: research first, producing a per-issue verdict, then the sponsor's human gate, then fix lands). The division of labor:

- `review-research` is delegated as a whole to `review-researcher`: it adversarially re-checks each finding independently, kills the false positives, and produces `review/research/` (verdict + fix recommendation + per-issue explanation). This is the circuit breaker against error propagation and must be done independently and thoroughly.
- `fix` is **orchestrated in parallel by the Delivery Orchestrator**: the Orchestrator does not write fix code itself, but **partitions the confirmed/partially-valid fix items into mutually non-overlapping groups by file ownership**, dispatches one `review-fixer` single worker per group to land them in parallel (ensuring two groups never touch the same file), and after all groups return, runs one merge validation and aggregates them into `review/fix-result.md`. A `review-fixer` is a single fix worker, and does not partition or dispatch on its own. See the Parallel Execution Protocol.

The two have a **sequential dependency**: `fix` must come after `review-research`; `review-fixer` consumes only the verified `review/research/`, and if it can't find it, it stops — it does not verify the raw findings itself. This preserves the author separation between "independent verification" and "faithful landing."

Under `partial-delegation`, keep the same phase vocabulary and artifact paths: the Delivery Orchestrator writes the non-review artifacts directly and records itself as owner in `manifest.md`, and these phases may omit the assignment/receipt files; the delegated review phases still keep assignment/receipt. Under `full-delegation`, every delegated phase goes through the full handoff discipline. Under `direct` there are no assignment/receipt at all: all phase artifacts and manifest entries are still required, review-type artifacts record the owner in the manifest as delivery-orchestrator and are marked as draft, and the gate result records the sponsor's adjudication.

## Task Classification

| Signal | Paradigm |
| --- | --- |
| New project/system, a new significant subsystem, or no existing codebase | `dev/architecture-first` |
| Defect, regression, incorrect behavior, crash, data loss, or security bug | `bugfix/hypothesis-driven` |
| A single function/component/endpoint, 1-2 modules, no change to existing interfaces | `addition/simple` |
| Enhancement to an existing product, behavior extension, or interface/data-flow change | `enhancement/delta-design` |

When in doubt, choose `enhancement/delta-design`. If a phase's quality gate exposes a classification mismatch, reclassify before continuing.

## Human Gate Policy

A human gate is the sponsor's checkpoint, not a phase's quality gate. Skipping a human gate only removes the sponsor's pause; it does not weaken the evidence required to move forward.

Default human gates: Requirements, TestPlan, Design or diagnosis, Implementation Story Spec, blocking or risky review/verification decisions, the review-research verdict and fix recommendations (before `fix` lands), Final delivery.

After `review-research` and before `fix` is a natural sponsor checkpoint: here the sponsor can confirm which findings are real problems, which are false positives, and whether the proposed fixes are acceptable, before clearing `fix` to land. For small, low-risk changes, you may consult the sponsor about skipping this gate, but skipping does not change the dependency that "`fix` must consume the verified `review/research/`."

Outcomes allowed at each human gate:

| Outcome | Meaning |
| --- | --- |
| `approved` | The sponsor approves or says to continue. |
| `skipped` | The sponsor explicitly skips this gate. |
| `revised` | The sponsor requests changes; rerun or revise the corresponding phase before continuing. |
| `blocked` | Needs sponsor input, credentials, environment, or risk acceptance. |

### Gate Navigation Menu

When entering a human gate, don't just ask "approved?" First give the sponsor enough of a summary to judge, then short options. Default format:

```text
Where we are: <phase/gate> has reached the human gate; this step decides <downstream impact>.
Evidence: <artifact paths + key conclusions/gaps, no more than 4 items>.
I recommend: one of <approved/skipped/revised/blocked>, because <one-line reason>.
Options:
1. Approve, proceed to <next phase>
2. Have me revise per <specific direction> and come back
3. Supply information / risk acceptance
4. Skip this human gate (only when this gate allows skipping; note that the quality gate is not relaxed)
```

Tailor the options to the context: under `direct`, review-type gates don't offer "skip"; when confidence is LOW or credentials are missing, the default recommendation must be `blocked`; when the review owner returns `request_changes` or `needs_more_evidence`, the default recommendation must be revise/supply-evidence, not approve. When the sponsor answers in natural language, map it to `approved`, `skipped`, `revised`, or `blocked` and record it; ask one follow-up only if the mapping is unclear.

For small, low-risk changes, consult the sponsor about whether to skip some upcoming gates — name the specific gates, and keep review independent. For example: "This is a small, isolated change; want me to skip the human gates for TestPlan and Design, keep Code Review, and report at Final delivery?"

Never silently skip a human gate. Record skipped gates in the Gate History of `task.md` and in `manifest.md`.

When unattended (the sponsor is absent — automation-triggered, scheduled job, called by another process), no agent may answer a human gate. The sponsor may pre-approve named gates before the run starts (recorded in `task.md`'s Gate History, treated as `approved`); when reaching a gate that wasn't pre-approved, write the pending question and the current artifact paths into `task.md`, stop there and end the round, and wait for the sponsor to return and adjudicate — "the sponsor would probably agree" is not a reason to continue.

Even when a gate is skipped or full automation is required, the following still require a pause: requirements confidence is LOW or the success criteria are unclear; priority, scope, or risk acceptance is unclear; a review owner returns `request_changes` or `needs_more_evidence`; verification fails or lacks necessary evidence; credentials, environment, or permissions are missing; Final delivery status needs reporting.

## Paradigms

### `dev/architecture-first`

1. `validate-requirements`
2. `test-plan`
3. `test-plan-review`
4. `architecture`
5. `api-contract` — unless it's S complexity, a single submodule, and has no public/shared interface risk
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `review-research` — when code-review produces findings that need handling; verify truth, give fix recommendations, explain per issue
11. `fix` — land the fixes that `review-research` judged confirmed/partially-valid; must follow `review-research`
12. `verify`
13. `acceptance-review`
14. `deliver`

### `enhancement/delta-design`

1. `validate-requirements`
2. `test-plan`
3. `test-plan-review`
4. `impact-analysis` — to describe the delta to existing code; when structural decisions also need separate description, produce `architecture` as well.
5. `api-contract` — produce when a public/shared API, schema, protocol, cross-module boundary, or parallel-implementation contract must be stabilized; it can combine with `architecture` or `impact-analysis`.
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `review-research` — when code-review produces findings that need handling; verify truth, give fix recommendations, explain per issue
11. `fix` — land the fixes that `review-research` judged confirmed/partially-valid; must follow `review-research`
12. `verify`
13. `acceptance-review`
14. `deliver`

Design artifacts are owned by the Solution Architect.

### `bugfix/hypothesis-driven`

1. `validate-requirements` — based on the bug report and reproduction confidence
2. `diagnose`
   - When the fix spans multiple modules, changes existing behavior, or needs an explicit landing spot/preserved behavior, append `impact-analysis`.
   - When the fix involves a public/shared API, schema, protocol, or cross-module contract, append `api-contract`.
3. `implementation-plan`
4. `plan-review` — unless the fix is explicitly scoped as tiny and low-risk
5. `implement`
6. `code-review`
7. `review-research` — when code-review produces findings that need handling; verify truth, give fix recommendations, explain per issue
8. `fix` — land the fixes that `review-research` judged confirmed/partially-valid; must follow `review-research`
9. `verify`
10. `acceptance-review`
11. `deliver`

Diagnosis defines the correctness and regression criteria. If the bug can't be reproduced or its boundary can't be pinned down, block to ask for more information rather than guess.

### `addition/simple`

1. `validate-requirements`
2. `test-plan` — with feature-level acceptance criteria
3. `test-plan-review`
4. `impact-analysis` — only when the target module, constraints, or behavior to preserve isn't obvious
5. `api-contract` — only when some public/shared API, schema, protocol, or cross-module boundary must be stabilized
6. `implementation-plan`
7. `plan-review`
8. `implement`
9. `code-review`
10. `review-research` — when code-review produces findings that need handling; verify truth, give fix recommendations, explain per issue
11. `fix` — land the fixes that `review-research` judged confirmed/partially-valid; must follow `review-research`
12. `verify`
13. `acceptance-review`
14. `deliver`

When it affects more than 3 modules, or an existing interface must change, escalate to `enhancement/delta-design`.

## Phase Catalog

| Phase | Owner | Inputs | Outputs | Quality gate |
| --- | --- | --- | --- | --- |
| `validate-requirements` | Delivery Orchestrator (writes personally, see `references/validate-requirements.md`) | task description, issue, or requirement draft | validated requirements with confidence, user journeys, and constraints, plus a flow diagram when it clarifies intent | confidence MEDIUM/HIGH; no blocker questions; inputs/outputs/constraints/success criteria understood; user journeys observable; if multiple solution paths were plausible, sponsor selected a path or authorized a hybrid; diagrams included whenever they make a journey, scope, state, or before/after behavior easier to understand, any number, with syntax and readability validated |
| `test-plan` | Test Planner | validated requirements or diagnosis criteria, project testing context (`teamspace/testing-context.md`, explore to fill it in first if missing) | a TestPlan file set: the overall strategy (risk-ordered checks, required layers, environment needs, explicit gaps) plus the API/E2E/Regression playbooks | Must Haves observable; forbidden zones specific; no unjustified coverage gaps; playbooks runnable as written (E2E execution shape explicit, user input given verbatim) |
| `test-plan-review` | Test Plan Reviewer | validated requirements, the TestPlan file set, project constraints | `approve`, `request_changes`, or `needs_more_evidence` | the test plan is executable, covers the requirements/risk surface, and has no test theater |
| `architecture` | Solution Architect | validated requirements and the approved TestPlan | a reader-facing design: context, goals, key decisions, module boundaries, interfaces, data/state flows, compatibility, trade-offs, risks, verification-relevant constraints | required decisions explicit; the design is thorough and clear enough for the sponsor and Implementation Planner to work from; diagrams included whenever they make structure, sequencing, ownership, data/state flow, or before/after change easier to inspect, any number, validated; each step states the action/output/boundary, not just a function name |
| `impact-analysis` | Solution Architect | validated requirements, the approved TestPlan, existing code context | a delta record: affected modules, interface/data changes, behavior to preserve, risks, complexity, plus a useful delta diagram or flow description | affected modules and interface changes explicit; current and target behavior understandable; risk assessment present; a diagram or precise flow description makes the delta inspectable; use a before/after comparison only when it directly explains the change; complexity S/M or escalated |
| `diagnose` | Solution Architect | bug report, reproduction steps, observed failure | a diagnosis: verified hypotheses, evidence, root cause, proposed fix, affected files, regression criteria, plus a useful failure/fix diagram or flow description | the root cause's causal chain has evidence; no guessing; reproduction status recorded; the failure path and corrected behavior are understandable; diagrams are complete, not placeholders |
| `api-contract` | Solution Architect | the architecture or impact document plus the API/interface requirements | a Markdown API contract artifact: public/shared interfaces, request/response schemas, auth/error semantics, compatibility behavior, verification hooks | every public/shared/cross-module interface has a contract with signature, schema, protocol shape, ownership, compatibility, and auth/error semantics; shared types centralized; the API Contract Reviewer/Tester can verify without guessing |
| `implementation-plan` | Implementation Planner | validated requirements, the approved TestPlan, design artifacts/contracts | an Implementation Story Spec: goals, scoped ACs, ordered tasks, target modules, constraints, verification expectations given by reference | the first task is unambiguous; target paths/modules named; no open questions that change the implementation direction |
| `plan-review` | Plan Review Lead | the Implementation Story Spec plus requirements, TestPlan, design artifacts/contracts | `approve`, `request_changes`, or `needs_more_evidence` | the Story Spec gives the Implementation Engineer enough context to not invent architecture itself |
| `implement` | Implementation Engineer | the approved Implementation Story Spec and the Plan Review Lead decision | working code, focused tests, an implementation result recording changed files/commands/deviations/blockers | consistent with the approved Story Spec/contracts; focused tests/checks run or blockers recorded |
| `code-review` | Code Review Lead | the diff, changed files, Story Spec, requirements, TestPlan, design/diagnosis, local standards | a review decision plus graded findings | review complete; correctness, standards, simplicity, change hygiene, and project stewardship considered; must-fix items handled via `review-research`/`fix` or decided as request_changes |
| `review-research` | Review Researcher (when findings are many, the Delivery Orchestrator orchestrates in parallel by code domain and aggregates the index) | code-review findings (required), the diff, design principles/conventions | `review/research/`: **one per-issue file per finding** (verdict + root-cause-level fix recommendation + a human-readable explanation for someone unfamiliar) + `00-index.md` | each finding has an evidence-backed verdict landed on real code, written per item (not bundled), with context; false-positive/partially-valid items explain why; confirmed/partially-valid items get an elegant fix recommendation; missing out-of-repo context is marked for human confirmation rather than forced to a conclusion |
| `fix` | Delivery Orchestrator coordinating parallel Review Fixer workers | `review/research/` (required, with verdicts and fix recommendations) + human comments; the changed-file list | per-group `review/fix-records/<group>.md` + the aggregate `review/fix-result.md` + backend code changes (left in the working tree) | `review/research/` found and consumed (if missing, stop and require `review-research` first); confirmed/partially-valid items partitioned into mutually non-overlapping groups by file ownership, parallel workers dispatched to land them, no concurrency on the same file; each worker lands faithfully, fixing the root cause rather than patching; merge validation run once and passing; no commits, no touching the frontend |
| `verify` | Test Leader coordinating testers | the implementation, the TestPlan or diagnosis criteria, the environment spec | verification results given per capability/integration/E2E/regression | required checks pass; E2E run when needed; gaps explicit; no fabricated or assumed success |
| `acceptance-review` | Acceptance Review Lead | requirements, TestPlan, Story Spec, implementation notes, the code review decision, verification evidence, residual risks | `accept`, `reject`, or `needs_more_evidence` | evidence supports every Must Have and the scoped risks; residual risk acceptable |
| `deliver` | Delivery Orchestrator | the accepted implementation and evidence | a delivery report | the report includes files/artifacts, tests, deviations, follow-ups, and residual risks |

### Phase Completion Hint

After each phase passes its quality gate, report to the sponsor only what helps them judge the next step:

- `What was done`: the phase name + plain-language meaning.
- `Where the evidence is`: artifact paths, key tests/checks, the receipt or review decision.
- `Next step`: the next phase and owner; if there's an active human gate, switch to the Gate Navigation Menu.
- `Optional redirect`: offer only when new evidence exposes a scope, risk, or classification change; otherwise don't re-list the full menu.

When sending a phase back, give navigation too: state the reason for the send-back, what you'll change before re-dispatching, and whether you need sponsor input. After sending the same phase back twice in a row, default to stopping and re-evaluating the partition or plan, and offer the optional routes to the sponsor.

## Stage Owners

- The Delivery Orchestrator owns classification, mode selection, gatekeeping, and final delivery in all three modes.
- The Delivery Orchestrator directly owns `validate-requirements` and writes the artifact personally — on entering that phase, load `references/validate-requirements.md` (confidence, when to block, the gate adjudicated by the sponsor; shape per the demo, bar per the Phase Catalog).
- Under `partial-delegation`, the Delivery Orchestrator also personally writes `test-plan`, the design/diagnosis/contracts when needed, `implementation-plan`, `implement`, and `verify` artifacts.
- Under `direct`, the Delivery Orchestrator executes every phase itself; for review-type phases it produces a draft from the corresponding review perspective, with approval resting on the sponsor's human gate.
- Under `full-delegation`, the Test Planner owns `test-plan`; the Solution Architect owns the design/analysis artifacts; the Implementation Planner owns the Implementation Story Spec; the Implementation Engineer owns `implement`; the Test Leader owns verification coordination; the API Contract Tester, E2E Tester, and Regression Tester execute their assigned verification.
- `test-plan-review` belongs to the Test Plan Reviewer, `plan-review` to the Plan Review Lead, `code-review` to the Code Review Lead, and `acceptance-review` to the Acceptance Review Lead — this holds under both `partial-delegation` and `full-delegation`; under `direct`, the approval of these reviews belongs to the sponsor's human gate.
- `review-research` is delegated to the Review Researcher. When findings are many, the Delivery Orchestrator dedups and clusters by code domain and dispatches multiple Review Researchers in parallel, each writing **per-issue** files for its cluster, and the Orchestrator then aggregates `00-index.md`; workers don't write bundle files and don't fan out themselves. `fix` is likewise orchestrated in parallel by the Delivery Orchestrator: partition the files into groups, dispatch multiple Review Fixer single workers in parallel, run merge validation, and aggregate `fix-result.md`; a Review Fixer only lands the group it was assigned, and does not partition or dispatch itself. This holds under both `partial-delegation` and `full-delegation`, to preserve the author separation between "independent verification" and "faithful landing"; under `direct`, the Orchestrator does research and fix itself in sequence, and the author separation is preserved by having the research verdict pass the sponsor's human gate first. `fix` always comes after `review-research`, and consumes only the verified `review/research/`.

## Artifact Organization

When there's no existing task, set `task_id` to `<YYYYMMDD-HHMMSS>-<desc-slug>` (timestamp first, so a directory listing by name browses in time order), set `task_root` to `teamspace/tasks/<task_id>/` relative to `workdir`, and then create `task.md` and `manifest.md` per the demos.

When a task produces persistent notes, designs, prompts, screenshots, logs, reviews, verification evidence, or handoffs, locate the artifact's place before writing. All persistent collaboration artifacts live under `<workdir>/teamspace/`; when a separate `code_worktree`/`code_location` exists, they must be synced to the same relative path under `<code_worktree>/teamspace/` — when creating or updating an artifact, write the current side first, and before reporting completion, copy the same relative path to the other side. Record artifact paths relative to `workdir`; don't rewrite `<workdir>` into a machine-specific Location path. The default task runtime layout:

```text
teamspace/tasks/<task_id>/
  task.md
  manifest.md
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
    api-contract.md
  implementation/
    implementation-story.md
    implementation-result.md
  review/
    plan-review.md
    code-review.md
    specialist-findings/
    research/
      00-index.md
      <number>-<slug>.md
    fix-result.md
    fix-records/
  verification/
    assignments/
    verification-report.md
    test-results/
  acceptance/
    acceptance-package.md
    acceptance-decision.md
  delivery/
    delivery-report.md
```

Use only the files/subdirectories the task needs. Keep paths inside artifacts and handoffs relative. Outside the task directory, `teamspace/testing-context.md` is the project-level testing context (the basis for the test-plan phase, reused across tasks and maintained incrementally), and `teamspace/learnings/` is the learnings layer. `teamspace/` is local coordination state: if it shows up in git status, add `teamspace/` to `.git/info/exclude` for that local repo or worktree; never stage or commit it.

## Orchestrator Artifact Demos

Use the local demos rather than restating the shape:

- `references/templates/task-record.demo.md` corresponds to `task.md`
- `references/templates/task-manifest.demo.md` corresponds to `manifest.md`
- `references/templates/phase-assignment.demo.md` corresponds to a delegated phase's assignment
- `references/templates/phase-receipt.demo.md` corresponds to a delegated phase's receipt
- `references/templates/acceptance-package.demo.md` corresponds to `acceptance/acceptance-package.md`

Copy the shape, then replace the example values with the current task's phases, owners, statuses, and paths.

`artifact_type` values: what the Orchestrator produces is `TaskRecord`, `TaskManifest`, `PhaseAssignment`, or `AcceptancePackage`, with `author_agent: delivery-orchestrator`; a delegated phase's receipt is written back by its owner, with `from_agent` being that owner and `phase` being the assignment's phase. At final delivery, write `delivery/delivery-report.md`, covering Status, Code/Artifact Location, what was delivered, the verification results, gaps, follow-ups, and the key artifact paths.

## Phase Handoff Discipline

For a delegated phase, the Delivery Orchestrator writes the assignment file before the phase begins. Every delegated assignment carries a `task_root` (`teamspace/tasks/<task_id>/` relative to `workdir`) and an `output_path` relative to that task root; when Location and Workspace differ, the same task root must also exist at `<code_worktree>/teamspace/tasks/<task_id>/`. The delegated owner writes the phase artifact at the assignment's `output_path` and writes back a Markdown receipt that names the artifact path and the status.

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
4. When a change involves UI, do a frontend visual/interaction check.

Don't advance to a higher layer while a required lower-layer check still fails. When a scenario can't be run, record the reason and treat it as a gap, unless explicitly accepted.

## Parallel Execution Protocol

Parallel implementation is a protocol within the `implement` phase, not a separate phase. Parallelize only when all of the following hold: complexity is M/L/XL; at least two submodules can be built independently; the submodules share interfaces but not implementation; an architecture or impact document already exists; `api-contract` is complete when public/shared API, schema, protocol, or cross-module contracts are involved; the Implementation Story Spec partitions tasks per the contracts and keeps only the integration context each submodule needs; the TestPlan scopes Must Haves, Need Haves, Failure/Edge Cases, and Forbidden Zones per submodule.

Each parallel implementation session receives exactly these inputs:

1. `STORY_SPEC_PATH`: the relative path to the approved Implementation Story Spec.
2. `DESIGN_DOC_PATH`: the relative path to the architecture, impact, diagnosis, or API contract.
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
3. **Dispatch `review-researcher` in parallel**: one assignment per cluster, giving `FINDINGS` (the full text of each finding in this cluster + reviewer evidence, as leads only), `CODE_SCOPE` (the relevant code range for this cluster), `DESIGN_PRINCIPLES` (the documented design principles), the discipline of independent adversarial re-checking, and `OUTPUT_DIR=review/research/`. **Write the hard constraint into the assignment: the worker writes one per-issue file `review/research/<number>-<slug>.md` for each finding in its cluster, and is not allowed to write a bundle/cluster file.** Respect the harness concurrency limit; if parallelism isn't supported, go serial, with the protocol unchanged.
4. **Aggregate the index**: each worker writes the per-issue files for its few findings and returns a receipt. After all return, **the Orchestrator aggregates `review/research/00-index.md` from all per-issue files** (per the `templates`/research-skeleton index shape: list each item by P0→P1→P2 + verdict + link). The Orchestrator does not invent a merged `SUMMARY.md`, nor assign a custom `artifact_type` to the index — the index is `00-index.md`.
5. **Only proceed to fix after the human-review gate**: by default, stop at the review-research human gate to let the sponsor confirm the verdicts and fixes, then proceed to `fix`; don't chain straight from research to fix.

When receiving receipts, validate as usual with `scripts/validate-handoff.py` (a worker receipt's `artifact_path` points to one of the per-issue files it produced or to `review/research/`), and after the index is aggregated, run a full `--sweep` pass.

### Parallelizing `fix` (same protocol, partitioned by file ownership)

`fix` is also a parallel protocol orchestrated by the Delivery Orchestrator, not a special case outside a separate phase. Precondition: `review-research` has produced `review/research/`, in which there are fix items judged **confirmed/partially-valid**. The Orchestrator does the following:

1. **Take the items to fix**: take all confirmed/partially-valid items and their fix recommendations from `review/research/` (overlaid with human comments; false positives and "needs human confirmation" are not fixed). If `review/research/` can't be found, stop and run `review-research` first.
2. **Partition into mutually non-overlapping groups by file ownership**: list each item's primary file to change (and the foreseeable spill-over files); **items touching the same file go into the same group**, handled serially by the same worker. The file-occupancy sets of two groups must be disjoint.
3. **Dispatch `review-fixer` single workers in parallel**: one assignment per group, giving exactly these inputs — `GROUP_SLUG`, `FIX_ITEMS` (this group's confirmed/partially-valid items and the research fix recommendations), `OWNED_FILES` (the file set this group is authorized to edit and no other group will touch), `REPO_CONVENTIONS`, `FOCUSED_VALIDATION` (the focused checks this group should run), `OUTPUT_PATH` (`review/fix-records/<group-slug>.md`). Respect the harness concurrency limit: queue when over the limit and fill as slots free up; if the harness doesn't support parallelism, go serial, with the protocol unchanged.
4. **Collect + merge validation**: each worker writes its group's `fix-records/<group>.md` and returns a receipt. After all return, the Orchestrator **runs one** full-repo validation over the merged changes (syntax/import/types/relevant tests) to catch cross-group interactions. A failure that lands on a changed file → send the relevant group back to redo, or escalate; a failure that lands only on a file no one changed → record it as a pre-existing failure.
5. **Aggregate**: the Orchestrator writes `review/fix-result.md`: aggregate each group's disposition by P0→P1→P2 (landed/sent back as needs-research/needs-human/false-positive reference), the merge validation result, and the residual risks. This aggregate belongs to the Orchestrator, not to any single worker.

Workers don't collide on files because their occupancy sets are disjoint; if some worker's fix spills out of `OWNED_FILES`, it must stop and report rather than cross the boundary, and the Orchestrator re-partitions or reruns serially.

## Learnings

The pipeline terminates at `deliver`, but lessons survive across tasks in `teamspace/learnings/` — this is a built-in capability of the Delivery Orchestrator, not a phase, has no gate, and doesn't change the Phase Catalog. Two actions: at the start of `intake`/`validate-requirements`, **search** prior lessons by task keyword and feed relevant entries by path into the downstream assignment; at deliver wrap-up or when a qualifying lesson surfaces mid-task (an unexpected root cause, repeated rework, a repo trap), **capture** it. The bar, shape, dedup, and reflux rules are in `references/learnings.md`.

## Wrap-Up Navigation

`deliver` is not just announcing completion. Both the final reply and `delivery/delivery-report.md` must let the sponsor know whether the task can be closed out, where the evidence is, and what natural follow-ups remain. Default structure:

1. Status: delivered / delivered-with-risk / blocked / rejected.
2. What was delivered: code location, key artifact paths, key verification.
3. Deviations and residual risks: write none if there are none; otherwise give an owner or acceptance condition.
4. Recommended next step: one clear recommendation.
5. Optional follow-ups: list 2-4 as needed, e.g. close the task, create a follow-up, run `change-detailed-walker`, do another round of verification, capture/review learnings, return to a gate to revise.

If acceptance didn't pass or evidence is insufficient, the recommended next step cannot be "close out"; it must point to supplying evidence, revising, re-reviewing, or sponsor risk acceptance.
