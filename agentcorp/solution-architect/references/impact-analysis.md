---
id: impact-analysis
name: Impact Analysis (Delta Design)
inputs: [validated requirements, existing codebase]
outputs: [impact analysis design artifact]
optional: false
---

# Impact Analysis (Delta Design)

A precise record of a change to existing code. It is not a rewrite of the architecture — it covers only the delta: what is there now, what will change, what must never break, and what risks remain.

## What you do

First read the affected modules, interfaces, and data flows, so the delta is designed against how the code "actually runs," not how you "assume it runs." Then design the change with the same goals as architecture design: localize the change, don't widen an interface beyond what the change requires, and put new code in the module where it already belongs. When a boundary or hiding decision is unclear, consult `principles/`.

## What this artifact must achieve

After reading it, the reader should understand: what the current behavior is, what the target behavior is, exactly where the change lands, what must be preserved, and where things might break. It must make clear:

- what changes and why, in one honest overview paragraph;
- the affected modules and files (real paths; mark line numbers only when it removes ambiguity);
- the interface and data changes, spelled out item by item — `none` is a valid and useful answer;
- the integration points where new code meets existing code;
- the existing behavior that must keep working;
- risks: what might break, and how exposed it is.

Draw a diagram only where a view makes the "current path, target path, or preserved behavior" easier to reason about than prose. Diagrams must be honest and concrete — real modules and outcomes, not placeholder boxes.

If this change ripples through many modules or brings structural interface changes, don't strain the impact analysis to cover everything: put the structural decisions in `architecture.md`, put public/shared or cross-module boundaries in `api-contract.md`, and keep the impact analysis focused on the delta and the behavior that must be preserved.

## Output

Write the artifact to the assignment's `output_path` (usually `design/impact-analysis.md`), following the `design-artifact` demo template.
