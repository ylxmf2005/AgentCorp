---
id: validate-requirements
name: Validated Requirements
inputs: [sponsor request, issue, requirement draft]
outputs: [validated requirements artifact]
optional: false
---

# Validated Requirements

This is the pipeline's first phase, and the one the Delivery Orchestrator owns personally and never delegates — there is no Requirements Analyst role. Your job is not to transcribe the sponsor's words into a document but to **validate** a raw request into requirements that downstream can design, test, and implement against: what the intent is, whose problem it solves, what counts as success, and what is explicitly out of scope. Pin these down while there's still no code and changes are cheap.

Before you start writing, take a look at `teamspace/learnings/` by task keyword (module, error message, domain word) — a problem of the same kind may already have been hit, and a relevant entry directly affects the scope and risk judgment (see `references/learnings.md`).

When the raw request is not yet clear enough to validate, load the `brainstorm` capability before writing the artifact. Brainstorm is not a separate phase; it is the interaction surface used to get requirements to MEDIUM/HIGH confidence.

Use one of two modes:

- **Question-by-question** — use when direction is mostly clear but a missing fact blocks confidence. Ask one high-leverage question at a time, then fold the answer into the requirement picture. Keep going only while the next answer would change scope, success criteria, risk acceptance, or user journey.
- **Multi-path proposal** — use when several solution shapes could satisfy the sponsor's goal. Load `brainstorm/references/proposal-paths.md` and present 2-4 complete paths using AgentCorp proposal lenses. Each path must be complete enough for the sponsor to choose, refine, or reject. Give a recommendation, then ask the sponsor to choose or modify one.

If you propose multiple paths, do not write validated requirements until the sponsor has selected a direction or explicitly authorized a hybrid. Anything merely implied by the unchosen paths stays out of scope.

## What You're Up Against

The four most common distortions; validation exists to block them:

- **Taking the sponsor's wording as the requirement.** What the sponsor says is the *surface* of what they want; the *intent* behind it often needs one more question. Keep the important original phrasing, but dig down to "the problem they're really trying to solve," rather than stopping at the literal words.
- **Smuggling implementation decisions into the requirements.** Requirements state "what must be observably achieved," not "which table, which interface, or which algorithm to do it with." Once an implementation slant gets written in, you've made the decision for the downstream architect and engineer — that's not your job.
- **Writing acceptance criteria that can't be tested.** "Better experience," "faster," "more stable" can't be falsified. Every requirement must come down to an observable condition, so the Test Planner knows what to prove it with.
- **Writing what wasn't asked as fact.** Anything the sponsor didn't say and the repo can't confirm is an open question or an assumption, not a conclusion. Filling in a missing fact out of thin air is the costliest distortion — it gets taken as true all the way downstream.

## What This Artifact Must Achieve

The readers (the sponsor themselves, the Test Planner, the Solution Architect) must be able to trust these requirements and build directly on them. So it must spell out the sponsor's intent, the problem to solve, the target users and their job, the observable user journeys, the functional requirements with verifiable acceptance criteria, the non-goals and MVP boundary, the constraints, the success criteria, the assumptions, and the open questions; draw a diagram when one is needed to make before/after behavior or scope clear. The full shape of each section (including the user-journey diagrams and the diagram validation checklist) is governed by `references/templates/validated-requirements.demo.md`, and the gate bar by workflow.md's Phase Catalog; this file doesn't restate the fields.

Draw the line clearly between "intent/problem/success criteria" and "implementation": the requirements side answers what and why; only the design side answers how.

## How to Set Confidence

The artifact frontmatter's `confidence` is not decoration; it directly decides whether the gate can pass:

- **HIGH** — intent is clear, the success criteria are observable, and there's no ambiguity that would change direction. Safe to enter the next phase.
- **MEDIUM** — the main thrust is clear and you can move forward, but there are a few assumptions that downstream needs to confirm, or non-blocking open questions. List these explicitly under "Assumptions" and "Open Questions"; don't hide them.
- **LOW** — too vague to design against honestly: intent unclear, success criteria you can't state out loud, key constraints unknown. **Don't force this into requirements**; block per below.

The gate requires MEDIUM or HIGH. LOW must not be wrapped in wording to "look like MEDIUM."

## When to Block

When requirements confidence is LOW, or the success criteria can't be stated clearly, or priority/scope/risk-acceptance is unclear, first use `brainstorm` if the missing clarity is reachable through sponsor interaction. If the sponsor cannot or does not resolve the missing point, stop and return `blocked`, naming exactly which piece of information you're missing so the sponsor can supply it — rather than guessing one and filling it in. Better to honestly mark LOW or an open question than to mask the real uncertainty with confident wording. This isn't stalling; it's blocking the costliest rework at the cheapest stage.

## Who Adjudicates This Gate

This is how author/reviewer separation lands in this phase: you (the Orchestrator) write the artifact, but **the reviewer of this gate is the human sponsor themselves** — there's no independent Requirements Analyst to review it again, so the sponsor confirming that the requirements got it right is the independent judgment for this gate. So this human gate especially must not be silently skipped: if the sponsor hasn't confirmed, the requirements aren't validated.

## Output

Write to `requirements/validated-requirements.md`, following the demo's shape. When it contains Mermaid, check syntax and readability item by item per the "Mermaid validation" checklist at the end of the demo. These requirements are only complete when intent and implementation are kept distinct, the acceptance criteria are observable, the confidence is honest, and the sponsor has confirmed.
