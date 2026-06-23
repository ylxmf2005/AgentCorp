---
id: architecture
name: Architecture Design
inputs: [validated requirements, TestPlan document]
outputs: [architecture design artifact]
optional: false
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

After the requirements, this is the most human-facing artifact. The originator must be able to trust the design from it, and the planner must be able to build downstream on top of it without reverse-engineering the code. So it must make clear (organize it in whatever structure best serves the design):

- the problem to solve, and the intent behind this design;
- the key decisions, and why they are made this way;
- what each component owns, and what it hides;
- which interfaces and contracts must stay stable;
- how data or state flows where it affects boundaries;
- where relevant, the storage/table structure/API contracts and their compatibility behavior; carry the body of data tables and data models as DDL, ORM, Pydantic/TypeScript schema, or pseudocode blocks close to the project's stack;
- how much complexity it introduces, and how this structure holds that complexity down;
- plus the risks, constraints, and anything that affects verification.

Give as much detail as it takes for someone to trust the design, no more; where detail is dense, use code blocks, tables, or bullet lists. Use diagrams per the guidance in `references/mermaid.md`: wherever a view expresses structure, flow, state, ownership, or a before/after change more clearly than prose, draw one — but keep the set to the smallest that conveys the design (usually 2–3), and don't decompose prose or branch-lists into separate flowcharts. When this is a change to existing code, prefer a single change-annotated diagram (mark new/changed parts) plus, when data crosses services, a data-flow sequence whose messages name the real function and payload type — see `references/mermaid.md`.

If the requirements or existing code are too vague to design with confidence, return `blocked` and name the specific evidence you are missing, rather than inventing it.

## Output

Write the artifact to the assignment's `output_path` (usually `design/architecture.md`), following the `design-artifact` demo template. The output is language-agnostic; when refactoring, follow the language of what is being changed. Contract examples in the text are only there to illustrate the design — do not write implementation files.

If it is a refactor, briefly state what is wrong with the original approach and how this one resolves it.
