---
name: brainstorm
description: "Use when AgentCorp needs a reusable brainstorm capability to clarify, pressure-test, or reshape requirements before planning or implementation, especially during Delivery Orchestrator validate-requirements when sponsor intent, success criteria, scope, user journey, or solution direction is not yet clear."
---

# Brainstorm

This is a general AgentCorp thinking capability, not a delivery phase and not a role with its own gate. Use it the way AgentCorp uses `authenticated-browser-session`: any role may load it when the current work needs this behavior, but its primary home is `delivery-orchestrator` during `validate-requirements`.

The goal is to turn an unclear request into sponsor-approved, observable requirements. Do not implement, plan architecture, or write downstream artifacts while brainstorming. Fold the result back into the owning phase artifact, usually `requirements/validated-requirements.md`.

## Operating Principles

- **Validate intent before shape.** Preserve the sponsor's important wording, but dig for the underlying problem, target user, success signal, and non-goals.
- **One question at a time unless comparing options.** Missing facts are handled by focused follow-up; unresolved direction is handled by complete alternatives.
- **Ground factual claims.** If the answer depends on repo behavior, product docs, prior tasks, or cloned reference projects, inspect evidence before claiming.
- **Grill with care.** Pressure-test problem reality, user value, scope, risks, and simpler alternatives without turning the sponsor into an interview subject.
- **Every proposed option must be viable.** If you put an option in front of the sponsor, make it concrete enough to choose, refine, or reject.
- **Keep requirement vs implementation clean.** Brainstorm product behavior, journeys, success criteria, and scope. Leave tables, modules, APIs, and algorithms to design unless the brainstorm is explicitly about a technical choice.

## Choose One Mode

### Mode 1: Question-by-Question

Use this when the direction is mostly clear but one or more facts would change confidence from LOW to MEDIUM/HIGH.

Ask exactly one high-leverage question per turn. Prefer questions that unlock validated requirements:

- Who is the primary user or system actor?
- What must be observable when this succeeds?
- What is explicitly out of scope?
- What current behavior, workaround, or failure are we replacing?
- Which risk or tradeoff is the sponsor willing to accept?
- What would make this a no-go?

After each answer, update the internal requirement picture. Stop asking when the remaining uncertainty can be recorded as an assumption/open question without changing direction. If the next missing fact would still block design or test planning, continue with one more question or return `blocked`.

### Mode 2: Multi-Path Proposal

Use this when the sponsor's request points to a goal but not a shape, or when several plausible shapes would lead to different validated requirements. In this mode, present 2-4 complete paths and ask the sponsor to choose one.

For detailed rules, load `references/proposal-paths.md`. The short version: use AgentCorp proposal lenses, not invented roles. Each path must be complete enough for the sponsor to select, refine, or reject, and the final recommendation may only use ingredients that were visible in the paths.

## Grounding

Before strong claims, inspect the smallest useful evidence set:

- local standards and context: `AGENTS.md`, `README*`, `STRATEGY.md`, `CONCEPTS.md`
- prior AgentCorp artifacts: `teamspace/tasks/`, `teamspace/learnings/`, prior requirements, plans, reviews
- related product docs or code when absence/presence changes requirements
- external references only when the sponsor asks or the decision depends on current/third-party facts

When studying external repositories, clone to a scratch location such as `/tmp`, read them as evidence, and do not run their scripts or setup commands unless the sponsor explicitly authorizes it.

## Grill Lenses

Use only the lenses that fit; do not dump the list on the sponsor. Load `references/grill-lenses.md` when the request needs deeper pressure-testing.

## Output Back to AgentCorp

Return a concise synthesis to the owning phase:

- chosen direction or selected path
- sponsor intent in the sponsor's vocabulary
- target users / actors
- observable journeys and success criteria
- must-have requirements
- non-goals and MVP boundary
- assumptions and open questions
- evidence consulted

For `validate-requirements`, this synthesis is not a separate gate. The Delivery Orchestrator writes it into the validated requirements artifact and still needs the sponsor's human confirmation before the requirements gate passes.

## Role Integration

- **Delivery Orchestrator**: use during `validate-requirements` when confidence is LOW or multiple shapes remain. Pick Mode 1 for missing facts, Mode 2 for unresolved direction.
- **Solution Architect**: use only to clarify product intent before design; do not use it to bypass validated requirements.
- **Test Planner / Test Leader**: use only when success criteria or user journeys are too vague to test; send the clarification back to the owning requirements artifact.
- **Review roles**: do not reopen requirements during review unless the artifact itself is ambiguous enough to block the review; report that as `needs_more_evidence`.
