# Plan and design artifact review reference

Use this reference when reviewing architecture, impact analysis, diagnosis, or an interface contract before implementation. The core question is always the same: does this set of design artifacts give the Implementation Engineer enough context to start without having to invent the architecture? Design artifacts can be combined: check artifact by artifact whether the structural decisions, the delta impact, the root-cause evidence, or the contract boundaries are spelled out; do not demand they be merged just because several artifacts exist, and do not assume one artifact is sufficient just because it is the only one. The sections below describe, by artifact type, what each must let you trust.

## Architecture

Used for greenfield work or a significant subsystem. It must make clear: the problem to be solved, how the components are decomposed and owned, how data flows, the technology choices and their rationale, and how much complexity this structure introduces and how it keeps that complexity down — especially along the three axes of change amplification, cognitive load, and unknown unknowns. It should spell out the key modules, interfaces, and hidden decisions; make clear which interfaces/contracts must stay stable; describe how data/state flows where relevant; and lay out compatibility behavior, risks, constraints, and the points that bear on verification. It should read like a real engineering design document, dense with detail where detail is warranted, not a bare checklist.

A trustworthy architecture: module responsibilities are clear, interfaces hide implementation details, complexity is faced head-on rather than offloaded onto the caller, and the risks that bear on verification are visible. Wherever a view would express structure, flow, state, ownership, or before/after change more clearly than prose, there should be a diagram or an equivalent flow description that makes the structure inspectable; the diagram must use real modules and boundaries and state, for each step, "what it does and what it protects" — a placeholder `User --> System --> DB` does not pass. When a diagram is present, check its syntax and readability.

## Impact Analysis

Used for an enhancement to existing code. It must make clear: the change summary, the affected modules/files, interface changes (write `none` explicitly if there are none), integration points, the existing behavior that must be preserved, the newly introduced behavior, the risk assessment, and the complexity estimate. A trustworthy impact analysis: every affected module is named, interface changes are explicit, risks are concrete, the current/target behavior and integration points are understandable, and complexity lands in S/M; when the complexity, structural decisions, or interface boundaries exceed what it can carry, it can reference an architecture or interface-contract alongside, rather than cramming everything into one document. A before/after view is worth drawing when it makes the change clearer directly.

## Diagnosis

Used for defect fixes. It must make clear: the reported symptom and the expected behavior, the reproduction (or why it cannot be reproduced), the hypotheses tested and the evidence for each, the confirmed root cause with its causal chain, the proposed minimal fix, the affected files/modules, and the regression test or verification criteria. Unless the coordinator explicitly accepts residual uncertainty, a root cause unsupported by evidence should not proceed. The failure path, the root cause, and the corrected behavior must be understandable — a precise flow description or a diagram both work; the diagram should mark the trigger, the entry point, the failing component, the root-cause state or decision point, the corrected path, the behavior that is preserved, and the success/failure outcome where relevant.

## Interface Contract

Used for parallel implementation, or whenever public/shared interfaces are involved. One contract per public endpoint, shared schema, protocol, SDK/CLI interface, or cross-module boundary; collect shared types/schemas into a single shared contract, don't duplicate them. A contract spells out the signature, the request/response shape, the protocol rules, the compatibility behavior, the auth/permission assumptions, and the error semantics, but not the implementation body. A trustworthy interface contract: every public/shared/cross-module interface has a contract, the contract exposes only what the caller needs to know, and the API Contract Reviewer or Tester can verify its behavior without guessing.

## Deciding

Only `approve` when the set of design artifacts gives the Implementation Engineer enough context to start without inventing the architecture. `request_changes` when there are concrete defects. Use `needs_more_evidence` when the artifact may be right but is missing evidence or source context.
