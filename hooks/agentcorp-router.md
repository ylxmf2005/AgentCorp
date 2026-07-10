# AgentCorp Session Router

AgentCorp is a phased software-delivery pipeline packaged as skills. If the user mentions AgentCorp, Delivery Orchestrator, AgentCorp delivery workflow, a phase name, an AgentCorp role, or an AgentCorp artifact path, load the matching AgentCorp skill before answering, planning, or editing.

When the user states a software-delivery ask in plain language with no AgentCorp mention — a defect report ("帮我修个 bug", "报错了", "上次改动引入回归"), a requirement or spec handed over as fact, a refactor/maintainability ask ("让这个模块更好维护"), or a pre-release verification ask ("上线前帮我验一下") — do not silently start ad-hoc work and do not auto-load the pipeline either: offer it in one line ("这类任务我可以走 AgentCorp 交付流程(诊断/需求闸门/评审),要吗?") and route through `delivery-orchestrator` on a yes. These asks are exactly what the gates exist for; leaving them to freestyle answers is the adoption gap, forcing the pipeline on unrelated chat is the over-trigger trap.

Do not treat phase names or artifact paths as ordinary words. They are routing signals.

## Discipline Core

These non-negotiable rules hold for every AgentCorp response, regardless of which skill is loaded:

- **Evidence ≠ a verbal claim.** Show the artifact, test run, reproduction, or raw output. A claim without an inspectable handle does not count as done.
- **Defect "done" = the original failing input re-run.** When claiming a fix works, re-run the exact original input/scenario that failed — not a proxy sample.
- **Un-renderable output must be persisted.** Diagrams, diffs, walkthroughs, and anything a terminal cannot render go to a file, not dumped inline.
- **Lock scope; no silent fallback.** If you cannot deliver what was asked in the required scope (missing access, environment, or tool), say so — do not quietly substitute a weaker answer.

## Default Route

Use `delivery-orchestrator` when the user mentions AgentCorp, Delivery Orchestrator, AgentCorp delivery workflow, phased artifacts, gates, handoffs, task orchestration, workflow mode, task root, assignment/receipt, manifest, or asks which AgentCorp role should handle something.

After loading `delivery-orchestrator`, read `references/workflow.md` before choosing phases, owners, gates, workflow mode, handoff shape, or artifact paths.

## Phase And Artifact Routing

| User mentions | Load skill |
| --- | --- |
| `validate-requirements`, `validated-requirements.md`, requirements confidence, user journeys, success criteria | `delivery-orchestrator` |
| `test-plan`, TestPlan, test strategy, `test/test-plan.md` | `test-planner` |
| `test-plan-review`, `test/test-plan-review.md`, reviewing a test plan | `test-plan-reviewer` |
| `architecture.md`, `impact-analysis.md`, `diagnosis.md`, `interface-contract.md`, design docs, architecture, impact, diagnosis, interface contract before implementation, why does this fail, root cause, flaky test, 为什么失败, 查根因, 时红时绿, 偶发失败 | `solution-architect` |
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
| apply verified review fixes, `review/fix-records/`, `review/fix-result.md` (a bare "修一下/fix it" is a defect report → `delivery-orchestrator`, never this row: review-fixer presupposes verified verdicts and OWNED_FILES) | `review-fixer`; use `delivery-orchestrator` first if grouping or parallel coordination is needed |
| `verify`, `verification-report.md`, coordinate validation evidence | `test-leader` |
| E2E, end-to-end, user-facing flow validation | `e2e-tester` |
| interface contract test, request/response/status/auth/error/schema behavior | `api-contract-tester` |
| regression test, blast radius, existing behavior still works | `regression-tester` |
| `acceptance-review`, `acceptance-decision.md`, release acceptance evidence (judging the evidence; a plain "帮我做验收/上线前验一下" usually means *producing* verification first → `delivery-orchestrator` chains verify → acceptance) | `acceptance-review-lead` |
| `deliver`, `delivery-report.md`, final delivery summary | `delivery-orchestrator` |
| `compound`, `compound-result.md`, 总结这次任务学到了什么, 沉淀经验, 下次别再踩坑, cross-task lessons (task-delivery lessons; "复盘这个 session/工作流本身" → `replay`) | `delivery-orchestrator` (read `references/compound.md`) |
| session replay, 复盘这次会话/工作流, where did the time/tokens go, 时间花哪了, token 花哪了, 为什么这么久, what kept failing, 一直在哪失败, analyze the session trajectory | `replay` |
| understand this change, change explainer, walkthrough with a quiz, comprehension quiz, merge quiz, understanding gate, walkthrough viewer, HTML walkthrough, 讲懂这次改动, 帮我看懂这个分支, 考考我, 理解闸门 (tiebreak vs `explain`: wants to *master the whole change* → walkthrough; wants *one point translated / what did it do* → explain) | `walkthrough` |
| plain-language explanation, zero-context explanation, explain for sponsor, persisted explanation, 落库解释, 白话解释, 看不懂, 方便看, what does this PR/branch/diff do, 这个分支/改动做了啥, 讲讲这个分支, 我没读代码 (tiebreak vs `walkthrough`: single-point translation → explain; "吃透整个改动+考我" → walkthrough) | `explain` |
| probe the territory/codebase, blindspot pass, blind spot pass, terrain scan, unknown unknowns, unfamiliar codebase/module before starting, don't know what to ask, 盲区扫描, 探一探, 不知道从哪开始 (if the fog is *what to build* rather than *what's out there*, it's `brainstorm`) | `probe` |
| brainstorm, think it through with me, explore directions, clarify requirements, pressure-test requirements, multi-path proposal, requirement shaping, 需求澄清, 头脑风暴, 发散一下, 帮我想想方案 | `brainstorm` |
| grill me, pressure-test my plan live, challenge my plan in an interview, relentless questioning, 拷问我的方案, 压测这个计划, 挑战我一下 (the owner answers live, one hard question at a time; a *written artifact* to attack without its owner → `adversarial-reviewer`) | `grill` |
| authenticated browser session, logged-in browser state, page-context JavaScript, same-origin API request from the logged-in page, 登录态浏览器 | `authenticated-browser-session` |
| taste review, hack vs honest shape, wrong abstraction, special-case elimination, root-cause shape, conceptual misnaming, API feel, proportionality, 代码品味, 优不优雅, 写得优雅吗 | `taste-reviewer` |
| comment optimization, optimize comments, comment quality, AI boilerplate comments, TODO/FIXME hygiene, missing why-comment, 注释啰嗦, 清理注释, 注释质量 | `comment-optimizer` |
| setup precommit, pre-commit setup, commit constraints, commit-time guardrails, Git hook workflow, AI commit review hook, Codex commit review, Claude commit review, 提交前检查, commit 约束, precommit 配置, AI commit review | `precommit-setup` |
| parallel research, deep research, SOTA, current best practice, external technical research, prior art, paper research, open-source scan, competitor research, in-repo cross-source investigation, 仓库里 X 是怎么实现的(跨模块查证), 帮我查清楚这个机制 | `parallel-researcher` |
| adversarial review, challenge assumptions, pressure-test a written plan/design artifact, 挑战这个设计, 有没有想当然 (finding set on an artifact; a live interrogation the owner answers → `grill`) | `adversarial-reviewer` |
| skill evolution, skill improvement proposal, improve/optimize a skill, evolve a skill, `teamspace/skill-evolution/pending`, turn research/trial-and-error into a project skill | `skill-evolution` |

## Reference Loading Rules

- For `solution-architect` work on `interface-contract`, read `references/interface-contract.md`.
- For `solution-architect` diagrams, read `references/mermaid.md` before writing Mermaid.
- For `delivery-orchestrator` handoffs, read `references/handoff-protocol.md` and the relevant template under `references/templates/`.
- For `delivery-orchestrator` requirement validation, read `references/validate-requirements.md`.
- For fresh-start handoff or context-reset requests, use `delivery-orchestrator` and read `references/fresh-start-handoff.md`.
- For the `compound` phase or cross-task lessons (复盘/总结经验/沉淀), use `delivery-orchestrator` and read `references/compound.md`.
- For `probe` reports, read `references/templates/probe-report.demo.md` before writing.
- For `walkthrough` artifacts, read `references/artifact-format.md` before writing.
- For `explain` persisted artifacts, read `references/artifact-format.md` before writing.

## Operating Rules

- Human-facing AgentCorp artifacts follow the sponsor's working language (the task's `output_language`, recorded at intake; zh-CN when unstated); target code and infrastructure keep their original language.
- Keep task artifacts under `teamspace/`; if `teamspace/` appears in git status, add it to `.git/info/exclude`.
- Do not stage, commit, or push `teamspace/` artifacts, docs, tests, or markdown files unless the user explicitly changes that rule.
- For AgentCorp delivery work, stay backend-focused. Do not modify frontend code — unless the sponsor explicitly grants a frontend waiver for the task at a recorded gate — and do not treat frontend-owned issues as backend fixes. A frontend ask with no waiver gets an explicit one-line boundary reply naming what is out of scope and who can decide, never a silent generic attempt.
- Merging or pushing product code has no pipeline owner: it stays with the sponsor. When asked to merge/push, say so, and proceed only on the sponsor's explicit order with the Fix-Loop Protocol's pre-publish SCM gate.
- Preserve author/reviewer separation: a role must not approve its own artifact.
- Review findings must pass through `review-research` before `fix`; do not fix raw code-review findings directly.
