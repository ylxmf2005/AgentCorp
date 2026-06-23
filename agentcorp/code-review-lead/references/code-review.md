# Local code review reference

For coordinating implementation review and converging it into a decision someone can be held to. This covers "how to judge" — who to bring in, how to grade findings, how to settle the conclusion — not the layout format.

## Review dimensions and selection

Always consider these five dimensions: correctness (logic, state, boundary conditions, error propagation), standards (explicit repo instructions and local conventions), simplicity (unnecessary abstractions, scope creep, avoidable complexity), change hygiene (diff cleanliness, intent traceability, history residue, out-of-scope semantic/contract changes), and project stewardship (project direction, long-term maintenance cost, public surface, module boundaries, and whether the owner is willing to own this change long-term). Add the other dimensions by the change's actual risk rather than turning them all on by default: security for auth, permissions, external endpoints, untrusted input, secrets; reliability for retries, timeouts, I/O, async tasks, health checks, and recovery; performance for hot paths, queries, loops, memory, scale; API contract for routes, JSON-RPC/A2A, CLI, schemas, external interfaces; change hygiene reviewer for formatting/wrapping/drive-by-refactor noise, multi-commit history residue, mid-flight requirement changes, public/shared contracts changed in passing, and changes to compatibility entry points / fallback / cache key / deprecation behavior; adversarial for changes that are high-risk, large, multi-role, timing-sensitive, or easy to abuse; bring in the Test Planner or test review when the implementation changes the risk or coverage assumptions.

## Grading findings

The grading basis is "whether there is an actionable failure path," not how many reviewers a finding came from.

Must-fix are: reproducible behavior bugs, security or data-loss risks, contract-breaking changes, violations of explicit requirements, out-of-scope semantic/contract changes that cannot be traced to approved source artifacts, steward findings that would write a wrong long-term commitment into the project's core, and any review blocker that would prevent meaningful verification. Suggested fixes are: maintainability, reliability, performance, coverage, or long-term maintenance risks with a plausible failure mode, or a sound change hygiene finding that should be split out of this MR/PR. Optional are: useful cleanups that do not block delivery. To be overruled are: style opinions, duplicates, pre-existing problems unrelated to this change, and speculation with no actionable path.

When merging duplicate findings, file them under the one with the strongest evidence and the most precise file/line.

## Decision

`approve`: no must-fix findings remain, verification can proceed. `request_changes`: one or more must-fix findings remain. `needs_more_evidence`: the review cannot be completed because the diff, requirements, test, or design context is missing.

Never claim a reviewer, command, or test ran without evidence.
