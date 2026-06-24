# Scope Residue Review

Load only for a multi-commit feature branch, requirements that shifted mid-stream, a user suspecting the early implementation was wrong, a public/shared contract changed in passing, a compatibility entry point deprecated, fallback behavior changed, or a hunk that "has an explanation but does not look required for this requirement."

## Core principle

The current branch history is not evidence of user intent. Early commits may come from vague requirements, wrong assumptions, or exploratory patching; a later review that only follows the historical explanation easily mistakes residue for established fact.

Ask by default: **if you started fresh today, building only against the current approved requirements / Story Spec / contracts, would you still change this?**

When the answer is not a clear "yes," do not let it slide silently:

- For what you can prove is not needed by this requirement, report `scope-residue`.
- For what might be reasonable but lacks source artifact support, report `intent-trace-gap` or `needs_human_intent`.
- For what changes a public/shared contract, compatibility entry point, error semantics, or caching/persistence key, report `contract-drift`, unless the contract explicitly authorizes it.

## Establishing what to review

First list the semantic changes from the diff, not just the files:

- public/shared API, request/response schema, whether a field is required/deprecated, error codes or error-message semantics.
- cache keys, persistence keys, lookup priority, fallback, default values.
- which layer permission/admin checks live in and when they are invoked.
- handler/service/model boundary changes.
- new compatibility shims, dual entry points, deprecation warnings, migration of or removal of old entry points.
- behavior branches unrelated to this requirement that got changed along with it.

Build a one-line trace for each semantic change:

`change -> source artifact -> why required -> compatibility impact -> action`

Here the source artifact can be requirements, a Story Spec, an interface-contract, a diagnosis, a review finding, a test failure, or an explicit user instruction. Being unable to find a source artifact is not a minor matter; this is exactly the gap this role hunts for.

## Judgment questions

Ask of each item:

- **Does the current requirement require it?** Not "can it be explained," but whether it follows naturally from the approved source artifacts.
- **Would a fresh start do it?** If implementing this requirement from a clean baseline would not touch it, it leans toward residue.
- **Would deleting/reverting it break the acceptance criteria?** If not, it leans toward revert or split out.
- **Does it change an existing caller contract?** Changing a public/shared contract without explicit authorization is blocking by default.
- **Is it merely a compatibility patch for a historical mistake?** If the compatibility serves only an early wrong change, the wrong change should be reverted rather than keeping the compatibility layer.
- **Should it be a separate MR?** Reasonable but not-required-for-this cleanup, layering tidy-up, or migration should be split out.

## Common findings

- **Early-assumption residue**: an early commit changed something for a model/field/flow that was later overturned, and the subsequent implementation keeps accommodating it.
- **Out-of-scope contract drift**: a field deprecated, an entry point removed, fallback order changed, or error semantics changed, but the current requirement did not ask for it.
- **Patch on a historical mistake**: to avoid reverting an early mistake, new compatibility, warnings, or dual paths are added, so the branch keeps carrying the mistake.
- **Drive-by architectural tidy-up mixed with behavior change**: the layering adjustment is reasonable in itself but smuggles in a calling-contract change.
- **Insufficient review traceability**: the implementation result or diff description does not list where the behavior changes come from, leaving the reviewer to fill in the gaps.

## Output requirements

Each finding includes:

- Severity: breaking compatibility or changing a public/shared contract is usually P1/P2; a pure split-out recommendation is usually P3.
- Confidence: high/medium/low; mark `needs_human_intent` when it depends on user intent.
- Evidence: file/line number or hunk, the source artifact you read, the missing trace.
- Impact: why this pollutes this MR, misleads the reviewer, or lowers the odds of downstream success.
- Recommendation: revert, delete, split the MR/commit, keep but add explicit authorization, or let the originator decide.

Do not let a change off the hook just because it "looks reasonable." Reasonable but untraceable to this requirement is still a change hygiene problem.
