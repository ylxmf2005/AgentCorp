# AgentCorp Session Router

AgentCorp is a phased software-delivery pipeline packaged as skills. If the user mentions AgentCorp, Delivery Orchestrator, AgentCorp delivery workflow, a phase name, an AgentCorp role, or an AgentCorp artifact path, load the matching AgentCorp skill before answering, planning, or editing.

Do not treat phase names or artifact paths as ordinary words. They are routing signals.

## Default Route

Use `delivery-orchestrator` when the user mentions AgentCorp, Delivery Orchestrator, AgentCorp delivery workflow, phased artifacts, gates, handoffs, task orchestration, workflow mode, task root, assignment/receipt, manifest, or asks which AgentCorp role should handle something.

After loading `delivery-orchestrator`, read `references/workflow.md` before choosing phases, owners, gates, workflow mode, handoff shape, or artifact paths.

## Phase And Artifact Routing

| User mentions | Load skill |
| --- | --- |
| `validate-requirements`, `validated-requirements.md`, requirements confidence, user journeys, success criteria | `delivery-orchestrator` |
| `test-plan`, TestPlan, test strategy, `test/test-plan.md` | `test-planner` |
| `test-plan-review`, `test/test-plan-review.md`, reviewing a test plan | `test-plan-reviewer` |
| `architecture.md`, `impact-analysis.md`, `diagnosis.md`, `interface-contract.md`, design docs, architecture, impact, diagnosis, interface contract before implementation | `solution-architect` |
| `implementation-plan`, `implementation-story.md`, Story Spec, Implementation Story Spec | `implementation-planner` |
| `plan-review`, review a Story Spec before coding | `plan-review-lead` |
| `implement`, `implementation-result.md`, implement an approved Story Spec | `implementation-engineer` |
| `code-review`, `review/code-review.md`, serious pre-merge review | `code-review-lead` |
| correctness review, functional bug review, edge-case review | `correctness-reviewer` |
| security review, auth, authorization, injection, data exposure, secrets | `security-reviewer` |
| performance review, latency, throughput, query efficiency, resource usage | `performance-reviewer` |
| reliability review, retry, timeout, idempotency, partial failure, resource leak | `reliability-reviewer` |
| simplicity review, avoidable complexity, over-engineering | `simplicity-reviewer` |
| change hygiene, diff hygiene, intent trace, scope residue, historical residue, fresh-start residue, requirement traceability, contract drift, diff noise, formatting churn, whitespace churn, drive-by change review | `change-hygiene-reviewer` |
| standards review, `AGENTS.md`, `CLAUDE.md`, frontmatter, handoff protocol, project conventions | `standards-reviewer` |
| project steward review, maintainer review, owner taste, long-term project health, public surface, technical debt gate | `project-steward-reviewer` |
| API compatibility review, route/schema/status/error/auth contract review | `api-contract-reviewer` |
| `review-research`, `review/research/`, verify code-review findings before fixing | `review-researcher` |
| `fix`, `review/fix-records/`, `review/fix-result.md`, apply verified review fixes | `review-fixer`; use `delivery-orchestrator` first if grouping or parallel coordination is needed |
| `verify`, `verification-report.md`, coordinate validation evidence | `test-leader` |
| E2E, end-to-end, user-facing flow validation | `e2e-tester` |
| interface contract test, request/response/status/auth/error/schema behavior | `api-contract-tester` |
| regression test, blast radius, existing behavior still works | `regression-tester` |
| `acceptance-review`, `acceptance-decision.md`, release acceptance evidence | `acceptance-review-lead` |
| `deliver`, `delivery-report.md`, final delivery summary | `delivery-orchestrator` |
| per-hunk diff walkthrough, hunk 讲解走查, walkthrough viewer, explain every hunk of the diff | `change-detailed-walker` |
| plain-language explanation, zero-context explanation, explain for sponsor, persisted explanation, 落库解释, 白话解释, 看不懂, 方便看 | `plain-explain` |
| parallel research, deep research, SOTA, current best practice, external technical research, prior art, paper research, open-source scan, competitor research | `parallel-researcher` |
| adversarial review, challenge assumptions, pressure-test plan/design | `adversarial-reviewer` |

## Reference Loading Rules

- For `solution-architect` work on `interface-contract`, read `references/interface-contract.md`.
- For `solution-architect` diagrams, read `references/mermaid.md` before writing Mermaid.
- For `delivery-orchestrator` handoffs, read `references/handoff-protocol.md` and the relevant template under `references/templates/`.
- For `delivery-orchestrator` requirement validation, read `references/validate-requirements.md`.
- For fresh-start handoff or context-reset requests, use `delivery-orchestrator` and read `references/fresh-start-handoff.md`.
- For cross-task learnings, use `delivery-orchestrator` and read `references/learnings.md`.

## Operating Rules

- Keep human-facing AgentCorp artifacts in zh-CN unless target code or infrastructure requires another language.
- Keep task artifacts under `teamspace/`; if `teamspace/` appears in git status, add it to `.git/info/exclude`.
- Do not stage, commit, or push `teamspace/` artifacts, docs, tests, or markdown files unless the user explicitly changes that rule.
- For AgentCorp delivery work, stay backend-focused. Do not modify frontend code, and do not treat frontend-owned issues as backend fixes.
- Preserve author/reviewer separation: a role must not approve its own artifact.
- Review findings must pass through `review-research` before `fix`; do not fix raw code-review findings directly.
