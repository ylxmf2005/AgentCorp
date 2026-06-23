# Engineering principles

When reviewing plans and judging implementation constraints, use these principles to gauge architecture quality.

## Deep modules

Prefer interfaces that are "simple for the caller while hiding substantial implementation complexity inside." A shallow wrapper that exposes every internal concern only adds cognitive load.

## Information hiding

Hide the volatile details behind a stable interface. A plan that requires the caller to know storage layout, timing, parsing internals, or environment quirks is leaking its design.

## Clean layering

Each layer should provide a different abstraction. Pass-through layers, UI/API/persistence logic mixed together, and protocol code laced with filesystem concerns are all signals of blurred boundaries.

## Cohesion and decomposition

Keep things that change together in one place; separate things that change for different reasons. Do not scatter a single concept across many files just to look "modular."

## Error handling

Prefer making illegal states impossible, or forcing them to surface explicitly. Avoid the "catch and continue" style that dresses failure up as a misleading success.

## Naming and documentation

Naming should convey domain meaning, units, and intent. Comments should explain the non-obvious design decisions, not restate the code.

## Strategic design

Small choices accumulate. Prefer the simplest design that localizes change, lowers cognitive load, and makes future changes easy to discover.
