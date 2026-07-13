# Artifacts: the Full Runtime Layout

[← back to README](../README.md) · [简体中文](artifacts_CN.md)

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
├── replays/                              # Standalone session replays (compound's 复盘 subject): ReplayReport per session
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
