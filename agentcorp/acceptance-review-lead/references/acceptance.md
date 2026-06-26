# Local Acceptance Reference

Use this one after verification has run and before delivery.

## The evidence you have

An acceptance judgment is built on a full body of evidence: the acceptance package from the Delivery Orchestrator, the validated requirements, the TestPlan, the implementation notes and changed-file list, the Code Review Lead's decision, plus the commands, requests, flows, screenshots, logs, and artifacts left behind by verification, together with the known failures, untested areas, and residual risks. These together form the basis for your judgment — the more direct and traceable the evidence, the more your conclusion holds up.

## What you must confirm

There is one core question: does the evidence truly prove that this delivery satisfies the requirements. To convince yourself, you must confirm that every Must Have has direct evidence; that, where layering is appropriate, capability, integration/API, and E2E each ran in the required order; that real endpoints, commands, or user-facing environments were actually used wherever they should have been; that for the risks falling in scope, the contract, data, security, performance, or reliability evidence is in place; that failures were reproduced and fixed, or honestly accepted as residual risk; and that no conclusion rests on an implicit fallback, a mock-only success, or pure inference from source code.

## The three conclusions

- `accept`: the evidence supports the delivery, and residual risk is acceptable.
- `reject`: required behavior fails, or risk is unacceptable.
- `needs_more_evidence`: the work itself may be correct, but the evidence is missing, indirect, or incomplete.

The reason to pass is always that the evidence proves the requirements, never the number of reviewers.

On a high-stakes release (security/permission boundary, public/shared contract, data-loss/irreversible change), take one cross-family second opinion before `accept` — an independent cold read of the package from a model family different from the one forming this verdict, through whatever channel the host exposes, never a named model — and record it as one input; the call stays the Acceptance Review Lead's own. If the sponsor required it and no other-family channel exists, return `blocked` and report rather than self-signing.
