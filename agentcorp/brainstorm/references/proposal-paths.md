# Proposal Paths

Use this reference only for Mode 2: Multi-Path Proposal.

The proposal lenses below are not new AgentCorp roles. They are requirement-shaping viewpoints derived from existing AgentCorp responsibilities, phase gates, and artifact expectations. Do not present them as agents to dispatch. Use them to create different sponsor-selectable requirement paths.

## AgentCorp Proposal Lenses

Pick 2-4 lenses that fit the ambiguity.

- **Minimal-change lens** — shapes the smallest safe requirement set that can satisfy the sponsor intent while preserving existing behavior. Grounded in AgentCorp's scope control and change-hygiene discipline.
- **Validated-journey lens** — optimizes for the clearest target user/system actor, observable journey, success criteria, and non-goals. Grounded in `validate-requirements`.
- **Documentation/onboarding lens** — asks whether the sponsor's goal can be achieved through docs, examples, templates, discoverability, or handoff clarity before product/code changes. Use only when that is a real candidate, not as filler.
- **Design-boundary lens** — proposes changing boundaries, contracts, data/state flow, or architecture only when local behavior changes will not hold. Grounded in Solution Architect responsibilities.
- **Verification-risk lens** — favors the path with the clearest proof strategy and lowest hidden regression risk. Grounded in Test Planner, Test Leader, and acceptance evidence requirements.
- **Research-first lens** — defers commitment when an external fact, prior art, customer behavior, or codebase unknown decides the requirement. Grounded in Parallel Researcher and Review Researcher evidence discipline.
- **Delivery-scope lens** — shapes the path around what AgentCorp can deliver cleanly in this task: phase count, artifact burden, review gates, and residual risk. Grounded in Delivery Orchestrator ownership.

Do not use a lens if it is not meaningfully different for this task. Two paths that differ only in wording are one path.

## Required Shape For Each Path

Each proposed path must include:

- **Name** — short, specific, not a role title unless it names the lens.
- **Lens used** — one of the AgentCorp proposal lenses above.
- **What changes** — observable user/system behavior, not implementation mechanics.
- **Target actor and journey** — who experiences the change and how success is reached.
- **Must-haves** — requirements that would appear in validated requirements if this path is chosen.
- **MVP boundary / non-goals** — what this path deliberately excludes.
- **Acceptance signals** — what evidence would prove this path worked.
- **Main risk or tradeoff** — the cost, lost benefit, ambiguity, or verification risk.
- **Why choose it** — when this path is the right sponsor decision.

## Recommendation Rule

After presenting paths, recommend one. A hybrid is allowed only when:

- the hybrid uses pieces already visible in the proposed paths
- the sponsor can understand what was combined and what was dropped
- the hybrid still has a clear MVP boundary and acceptance signal

Never write validated requirements from multiple paths until the sponsor selects one path or explicitly authorizes a hybrid.
