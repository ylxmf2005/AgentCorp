---
id: api-contract
name: API Contract
inputs: [architecture doc, impact analysis, API/interface requirements]
outputs: [API contract design artifact]
optional: true
---

# API Contract

Pin down a public, shared, or cross-module interface before implementation, so callers, implementers, reviewers, and testers all agree on the same boundary. It applies to HTTP/RPC APIs, SDK/CLI contracts, shared schemas, payload and event shapes, auth/permission contracts, error semantics, or any boundary where parallel development needs the convention settled first. It is a contract, not an implementation plan, and not source code.

## What this artifact must achieve

Anyone who reads it should be able to develop, review, or test against this boundary without guessing. So for every caller-facing or cross-module interface the design names, it nails down:

- the request/response shape, signature, and protocol form;
- the schema — when shared across modules, define it once and reuse it by reference everywhere else;
- state ownership, auth/permission assumptions, and error semantics;
- compatibility behavior: which existing callers stay unchanged, which change, and how they migrate;
- verification hooks a reviewer or tester can actually check against.

Keep the interface simple relative to what it hides, and let each contract offer one clear abstraction. Use code blocks only to describe the contract — unless the Delivery Orchestrator has assigned implementation work, do not create source files.

## When to skip

No public, shared, or cross-module boundary changes; or it is a single-module task and the architecture/impact artifacts already cover the local details sufficiently.

## Output

Write the artifact to the assignment's `output_path` (usually `design/api-contract.md`), following the `api-contract` demo template.
