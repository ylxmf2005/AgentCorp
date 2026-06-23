---
id: test-plan
name: Test Plan
inputs: [validated requirements, diagnosis criteria, testing context]
outputs: [TestPlan artifact set]
optional: false
---

# Test Plan (TestPlan)

Settle the verification strategy before implementation begins. The point is to spell out how this task should be proven correct while there is still no code and changes are still cheap — so the implementer knows what must stay testable, and the tester knows how to prove the risky behaviors.

## What you are fighting against

Missing a risk, and verifying the wrong place, are the two enemies. Coverage must follow risk: concentrate effort on the critical paths, boundaries, failure modes, and regressions that genuinely matter, rather than spreading it evenly. At the same time, make the plan prove behavior rather than some internal implementation style — keep out brittle assertions that drift with implementation details, or the tests will go false-positive in sheets during refactors.

There is a third enemy: a plan that can write "what to test" but not "how to test". A check with intent but no steps forces the tester to invent operations on the spot — and the invented operations are not necessarily the same as the risk you assessed. So this artifact's passing line is **followable verbatim**: the tester can run what is written without inventing any step.

## Work order

1. **Read the inputs** — validated requirements (or diagnosis criteria), constraints, environment notes, existing test artifacts.
2. **Check the context** — read `teamspace/testing-context.md`; if it does not exist, or does not cover the surface this task needs to test, first explore and fill the gaps per Step 0–5 of `references/testing-context.md`, then proceed.
3. **Rank risk** — set the Must-Haves, the forbidden zones, the P0 gates, and the execution order.
4. **Write the three execution manuals** — specificity standard below. The entry points, pages, and control text the E2E manual references must trace to entries in the page map that are **actually walked**; any page step whose provenance is only code-inferred must either be sent back to exploration and verified on the ground, or be explicitly marked "page entry unverified" in that flow and listed in the overall strategy's open questions — the verification may not be silently left to the tester.
5. **Specify result reporting** — each manual states what the tester must write down after every check: exact actions/inputs, exact requests/responses when relevant, observation surface, evidence paths, cleanup, and evidence limits.
6. **Write the overall strategy** — the coverage summary maps each requirement to a check id and the file it lives in.
7. **Self-check before delivery** — every AC has an owner; the E2E execution form is explicit; the three manuals pass the "followable verbatim" standard; the result-recording expectations are explicit; the environment is described faithfully; every omission and gap has its reason written down.

## Context first, then the plan

When "how to test" is not specific enough, the root cause is almost always the missing project runtime context: where the system is entered, how to log in, what the pages look like, what conventions the test data follows. These should not be guessed on the spot in each case; they sit in the project-level testing-context document `teamspace/testing-context.md`, reused across tasks and maintained incrementally.

Read it before you start planning. If the document does not exist, or does not cover the surface this task needs to test (e.g. a new page, a new interface), first fill the gaps per the exploration guidance in `references/testing-context.md`, then start planning. Wherever the plan references an entry point, page, or data, it should trace back to a source in the context document; supplements specific to this task (data created on purpose, temporary config) go into the corresponding execution manual, not back-fed into the project-level document — that one collects only facts that are stable across tasks.

## Artifact shape: a set of files, not one file

The TestPlan is a set of files — an overall strategy plus three execution manuals — written into the `test/` directory that holds the assignment's `output_path`:

- `test/test-plan.md` — the overall strategy: risk ranking and execution order, Must-Haves, forbidden zones, coverage mapping, environment, assignment, residual risk. The global view for the human gate, the Test Plan Reviewer, and the Test Leader; no piling-up of case detail.
- `test/api-test-plan.md` — the API Contract Tester's execution manual: contract checks and data/migration verification.
- `test/e2e-test-plan.md` — the E2E Tester's execution manual: complete user flows, step by step.
- `test/regression-test-plan.md` — the Regression Tester's execution manual: blast radius, the existing suites to run, adjacent checks.

When a given manual is genuinely out of scope for this task (e.g. a backend-only task has no user flows), explain the omission reason in the overall strategy; do not create an empty file. The section shape of each file follows the corresponding demo under `references/templates/`.

## How detailed each of the three manuals must be

There is only one standard for judging specificity: **the designated tester, holding this manual and the testing-context document, can start running without inventing any step.**

- **API manual** — each check gives the directly executable request or SQL verbatim (method, path, params, body), the expected status, response shape, and assertions, the prerequisite data it needs, and how to handle failure (stop, mark blocked, or continue). "Call the list interface and verify the return" does not pass; the passing form is that the curl or SQL is right there in the manual.
- **E2E manual** — first declare the execution form (browser operation as primary evidence by default, see the next section), then write each flow as numbered steps: which page this step is on, what action to take; wherever the user inputs content (search terms, form values, especially the prompt sent to the system), give the **literal text**, leaving no blank like "enter a suitable prompt"; the expected page behavior and screenshot point for each step; what the supporting evidence (API/DB/logs) checks. Identify controls in steps by visible text plus position to disambiguate ("Submit (personal-info section)"), not css/xpath. The last step of each flow must be a confirmation of the result (what is seen on the page, what is found in the data); it cannot stop at "the action is done". Write the error path as steps too; do not gloss it over in one sentence.
- **Regression manual** — which modules and contracts this change's blast radius lands on; the literal command for the existing suites to run; the adjacent checks picked out of the affected surface, each with why it was selected; the regression checks to add (the ideal form is "fails before the change, passes after"); the pass criteria.

## Result-recording standard

Every execution manual must say how the tester records the result. Use the same bar for API-driven, browser-driven, CLI-driven, and hybrid live checks:

- Start each check record with the background/user goal, environment, entry point, and writes it may perform.
- Include the concrete action before the conclusion. For API or page-console checks, include method, path, payload, credentials/session mode, status, key response body fields, and trace/request IDs.
- Record the observation surface that proves the user-visible or runtime outcome: UI state, screenshot, DB read-back, log line, audit event, notification content, or manual user confirmation.
- For async or external outcomes, name the observation window and who/what confirms it. A trigger request returning success is not enough to prove email/chat/push/scheduler behavior.
- For negative checks, state what source was watched and what matching signal was absent. If absence cannot be observed reliably, the expected result should be `needs_more_evidence` or `blocked`, not pass.
- End each check with cleanup/restore evidence and an evidence boundary: what this check proves and what it cannot prove.

## E2E execution form: browser as primary evidence

For tasks with a user-facing interface, E2E defaults to browser operation as primary evidence — the tester drives a real browser through the flow step by step, with screenshots and page state as the primary evidence and API/DB/logs as supporting. When the environment is not in place (service not up, routing not switched, data not prepared), mark the corresponding flow blocked and state what is missing; **do not write an API-driven check as E2E**: such a check cannot prove what the user actually sees, and belongs in the API manual. When it truly can only be API-driven (a pure-interface product, no UI), declare so explicitly in the E2E manual and state the boundary of this layer's evidence.

When the task input conflicts with this standard (e.g. the task states "this round the frontend is only an optional entry point, with API/logs as the primary evidence"), do not silently pick one: the E2E manual still writes out the browser-version steps per this standard, names this conflict in the overall strategy's open questions, states what each form can and cannot prove, and leaves it to the human gate to decide which to execute.

## Verification layering and risk ranking

Verification is naturally layered; when arranging checks, let each sit where it belongs:

- **Capability layer** — every Must-Have and every failure/edge case should have a direct check proving it.
- **Integration/API layer** — every pair of modules that communicate, and every public contract, has at least one success-path check and one error-propagation check.
- **E2E layer** — every user-facing capability appears in at least one complete user goal, every goal walks the happy path and the error path, and leaves verification at each step.

When a lower layer still has unresolved failures, do not rush to pile checks onto the upper layer — if the bottom is unstable, the upper layer's evidence cannot stand either. Rank the whole set of checks by risk (P0/P1/P2) so the most important ones are seen first, and state the execution order and gates in the overall strategy: which P0 failing makes which later checks directly blocked.

Two other classes of risk have dedicated owners: bugfixes and high-risk existing behavior must be backstopped by regression checks; anything involving migration, persistence, backfill, rollback, retention, or privacy-sensitive storage must have explicit data verification, covering audit/log signals and security/token constraints when needed.

## Environment

Describe the runtime environment clearly in plain Markdown in the overall strategy, so a tester can bring the environment up by following it: environment type (local, docker, ssh, hosted, or other); how commands are run; the working directory, ports, and service URLs where relevant; environment variables by name only (unless a particular non-secret value is genuinely needed); credentials by reference only, never printing secrets; and whether the environment is currently ready or needs to be set up on the spot. If no environment is available at all, mark e2e as blocked or local-only and list which evidence is thereby weakened.

## Output

Write the artifact set into the `test/` directory that holds the assignment's `output_path`, with the shape following each demo under `references/templates/`. This plan is only in place when the Must-Haves are all observable, the forbidden zones are drawn concretely, the integration checks cover the real boundaries, the e2e has no unreasoned gaps, all three manuals pass the "followable verbatim" standard, and the tester-role recommendations for the Test Leader are genuinely actionable.

If the requirements or diagnosis criteria are too vague to rank risk and design verification with confidence, return `blocked` and state specifically what evidence is missing, rather than making it up.
