---
name: brainstorm
description: "Act as AgentCorp's requirement-shaping and open-thinking capability: explore an idea without forcing a conclusion, or turn an unclear request into sponsor-approved, observable requirements through focused questions or genuinely divergent proposal paths. Use when the user wants to think something through, brainstorm, compare directions, clarify or pressure-test requirements, or when sponsor intent, success criteria, scope, user journeys, or solution direction is unclear — especially during Delivery Orchestrator validate-requirements."
argument-hint: "[mode:questions|proposals]"
---

# Brainstorm

This is a general AgentCorp thinking capability, not a delivery phase and not a role with its own gate. Any role may load it; its primary home is `delivery-orchestrator` during `validate-requirements`. Inside a task, decisions fold back into the owning phase artifact (usually `requirements/validated-requirements.md`) — never into implementation, architecture, or downstream artifacts written on the side. Standalone exploration may stay in conversation; thinking does not need to manufacture an artifact or a conclusion to count as useful.

**Your question: what does the sponsor actually need, stated so it can be validated?** Two different gaps hide inside "unclear," and they take different instruments:

- **Known unknowns** — facts the sponsor knows they have not settled. Close them with **Mode 1**: focused questions the repo cannot answer.
- **Unknown knowns** — preferences the sponsor cannot state but recognizes on sight. Surface them with **Mode 2**: complete, genuinely different options to *react* to — reacting is cheap, composing is expensive.
- **Unknown unknowns** — terrain nobody has scouted — are not your instrument. Run `probe` first and ground the brainstorm in its report; interviewing a sponsor about ground nobody has scouted launders blind spots into requirements.

## The iron law

```
YOUR RECOMMENDATION IS REACTION MATERIAL, NEVER A DECISION.
```

Both modes require a computed recommended default — it exists so the sponsor has something concrete to react to. Nothing becomes a requirement until the sponsor explicitly chooses it, no matter how obvious your default looks or how slowly the sponsor replies. An unconfirmed default is recorded as an assumption with its question left open, or the brainstorm returns `blocked` naming the missing fact.

## Operating principles

- **Validate intent before shape.** Preserve the sponsor's important wording, but dig for the underlying problem, target user, success signal, and non-goals. Pressure-test problem reality, user value, scope, risks, and simpler alternatives — without turning the sponsor into an interview subject.
- **Open threads, not an interrogation funnel.** When the sponsor is still thinking, surface a few live directions, tensions, or analogies and let the conversation follow what has energy. Pivot when new evidence changes the shape; do not force every exchange through a prewritten questionnaire or prematurely collapse several plausible threads into one.
- **Ground and visualize.** Read the relevant code and existing artifacts when the topic has a real system behind it. Use a compact diagram, state sketch, or comparison table when it reveals structure or trade-offs more clearly than another paragraph; visualization is evidence-bearing thinking, not decoration.
- **Never ask what the repo can answer.** Before any question reaches the sponsor, check whether code, docs, prior artifacts, or `teamspace/compound/` already answer it. A question the repo could have answered is effort pushed back onto the person who delegated it.
- **Make the sponsor react, not compose.** Every question ships with 2–4 concrete candidate answers, their trade-offs, and your recommended default; every direction ships as a path complete enough to choose, refine, or reject.
- **Ground factual claims.** When the answer depends on repo behavior, docs, or prior tasks, inspect the evidence first — the probe report when one exists, local standards (`AGENTS.md`, `README*`), prior `teamspace/` artifacts, related code — and carry the handle (`file:line`, command + output, doc path) into the decision record. Clone external references to a scratch location and read them as evidence; run nothing from them without explicit authorization. External evidence a quick read cannot settle — SOTA, prior art, a dependency's real capability — is a `parallel-researcher` lane, not brainstorm homework.
- **Keep requirement vs implementation clean.** Brainstorm product behavior, journeys, success criteria, and scope; leave tables, modules, APIs, and algorithms to design unless the brainstorm is explicitly about a technical choice.

## Parameters

`mode:questions|proposals` parses from the invocation or prose; default: choose by the gap type (known unknowns → questions; unclear direction → proposals) and say which you chose. An explicit value overrides. The open-exploration stance below takes no mode — it is the no-conclusion-yet posture.

Unknown keys get a one-line note and are otherwise ignored; a missing load-bearing value gets one short question, never a guess.

## Open exploration stance

Use this stance when the sponsor wants to think, compare, investigate, or follow a hunch but is not yet asking for a decision. It is deliberately adaptive: inspect the real code or artifacts when relevant, challenge assumptions, surface multiple live threads, and follow the thread the sponsor chooses. There is no mandatory sequence, final recommendation, or output artifact. Summarize only when the thinking has crystallized enough that a summary would preserve something useful.

When a decision does crystallize, make the transition explicit: chosen direction, rejected alternatives and why, remaining unknowns, and which owning artifact is affected. Offer to capture it there; do not silently write a side artifact. If the sponsor asks to implement and intent is already sufficient, hand back to the owning delivery or implementation role and proceed under its gates — there is no artificial "exit exploration" lock.

## Mode 1: Question-by-Question

Use when the direction is mostly clear but specific facts would change confidence. Build the full question list silently, rank by leverage — answers that would change architecture or data model first, then scope and observable behavior, then journey and UX, then cosmetics — and ask **one per turn**, each with candidate answers, the trade-off each implies, and your pick with reasons. Fold each answer into a running requirement picture. **Stop when remaining answers would no longer change direction**; record what is left as assumptions or open questions. If an unresolved fact would still block design or test planning, return `blocked` naming exactly what is missing.

## Mode 2: Multi-Path Proposal

Use when the request points to a goal but not a shape, or when several plausible shapes lead to different validated requirements. Present 2–4 complete paths and ask the sponsor to choose; load `references/proposal-paths.md` for the lens set, the required per-path shape, prototype guidance for visual/interactive shapes, and the recommendation rule. The non-negotiables: paths must genuinely diverge (two paths differing only in wording are one path), at least one path deliberately overshoots the sponsor's stated taste (hidden preferences surface only at the boundary), and the final recommendation uses only ingredients visible in the paths.

For deeper pressure-testing of a single direction, load `references/pressure-test-lenses.md` and use only the lenses that fit — and when the sponsor wants their chosen shape interrogated live, one hard question at a time, that is the `grill` capability, not another brainstorm round.

## Red flags — stop when you catch yourself thinking

| Thought | Reality |
| --- | --- |
| "The sponsor hasn't answered — my default is good enough." | The recommendation exists to be reacted to, not adopted. Record it as an assumption or return `blocked`; never fold it in as a decision. |
| "I'll just ask the sponsor; they know best." | They know their intent. What the repo already does, what prior tasks tried — that is your homework, not their question. |
| "I'll ask what they want it to look like." | Unknown knowns don't answer open questions; they react to concrete options. Show real alternatives instead. |
| "Four paths, to be thorough." | Divergence is the value, not the count. Padded paths teach nothing. |
| "One more question can't hurt." | Every turn spends sponsor attention. When answers stop changing direction, stop asking. |
| "The territory is unfamiliar, but the interview will surface it." | Interviews surface what the sponsor knows. Unfamiliar territory needs `probe` first, or blind spots become requirements. |

## Output back to the owning phase

When the work has reached a decision, return a concise decision record: chosen direction (and rejected paths with the sponsor's stated reason — rejections encode taste the next round would otherwise re-litigate); sponsor intent in the sponsor's vocabulary; target users and actors; observable journeys and success criteria; must-haves; non-goals and the MVP boundary; assumptions and open questions, labeled as such; evidence consulted, with handles. Before returning, check that every "chosen" traces to an explicit sponsor statement, and that any prototypes live under `brainstorm/prototypes/`, unstaged, with nothing in product code referencing them. If the session remained exploratory, report the live threads and what evidence changed the picture; do not fabricate a decision record.

For `validate-requirements` this synthesis is not a separate gate: the Delivery Orchestrator writes it into the validated requirements artifact, which still needs the sponsor's human confirmation before the requirements gate passes.
