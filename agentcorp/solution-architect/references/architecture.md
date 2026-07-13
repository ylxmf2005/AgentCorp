---
id: architecture
name: Architecture Design
inputs: [validated requirements, TestPlan document]
outputs: [architecture design artifact]
optional: true  # produced only when the task calls for this artifact type — selection is governed by SKILL.md "Your outputs"
---

# Architecture Design

Design the system's structure before any implementation. The goal is to settle the structural decisions while they are still cheap, so that later work does not keep building on top of an early mistake.

## What you are fighting

Complexity is the number-one enemy. Good structure holds it down along three axes:

- **Change amplification** — a simple change should not ripple through many places. Localize change: one decision lands in one place.
- **Cognitive load** — a developer should not have to hold the whole system in their head just to change one spot safely. Deep modules hide complexity behind simple interfaces.
- **Unknown unknowns** — it should be obvious at a glance where a change is needed and what you need to know. Expose dependencies, and make contracts explicit.

The mindset: pull complexity inward into modules, don't push it onto callers. The best interface is the simplest one that "lets a caller accomplish its goal without needing to know how the internals work." Get the structure right early, because every additional caller written on top of a leaky interface is one more place to rework later. When a specific judgment (depth, hiding, layering, naming) is unclear, consult the relevant file in `principles/`.

## What this artifact must achieve

After requirements, this is the normative structural contract for downstream agents and reviewers. The sponsor still needs a compact decision surface, but a separate walkthrough teaches the design when human comprehension needs more than that summary. The architecture must let a planner or engineer retrieve the approved rules without searching through research narration.

Prefer this order unless the design has a stronger reason:

1. Decision Summary.
2. Unchanged Contracts.
3. Invariants and scope boundaries.
4. Target components, schema, and interfaces.
5. Changed flows only.
6. Migration and compatibility.
7. Complexity, risks, non-goals, coherence impact, and open questions.

It must make clear:

- the problem to solve, and the intent behind this design;
- the key decisions, and why they are made this way;
- what each component owns, and what it hides;
- which interfaces and contracts must stay stable;
- how data or state flows where it affects boundaries;
- where relevant, the storage/table structure/API contracts and their compatibility behavior; carry the body of data tables and data models as DDL, ORM, Pydantic/TypeScript schema, or pseudocode blocks close to the project's stack;
- how much complexity it introduces, and how this structure holds that complexity down;
- plus the risks, constraints, and anything that affects verification.

State each normative rule once. Put code-reading evidence in Source References or `design/evidence/`; do not turn the artifact into a research transcript. Do not include task slicing, implementation order, reviewer recommendations, or review history unless one of them changes the architecture itself. Distinguish approved decisions from proposals and assumptions. When a refactor includes a rename or cleanup, price its concrete benefit and migration cost; omit it when it does not change behavior, ownership, or long-term maintenance.

Give as much normative detail as implementation needs, no more. Exact DDL and shared contracts belong here; exhaustive caller inventories, command transcripts, and unchanged system tours do not. Use diagrams per `references/mermaid.md`, usually 2–3, and draw only the changed structure or guarantee.

If the requirements or existing code are too vague to design with confidence, return `blocked` and name the specific evidence you are missing, rather than inventing it.

## Output

Write the artifact to the assignment's `output_path` (usually `design/architecture.md`), following the `design-artifact` demo template. The output is language-agnostic; when refactoring, follow the language of what is being changed. Contract examples in the text are only there to illustrate the design — do not write implementation files.

If it is a refactor, briefly state what is wrong with the original approach and how this one resolves it.
