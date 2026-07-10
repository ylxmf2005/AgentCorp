---
artifact_type: AcceptanceDecision
task_id: 20260603-120000-example-task
author_agent: acceptance-review-lead
status: accept
source_artifacts:
  - path/to/source.md
---

# Review Decision

## Decision

accept | reject | needs_more_evidence | blocked

## Basis

- The direct evidence supporting this decision — files you opened, each with its inspectable handle (command plus output, log path, screenshot). Every Must Have appears here or under Evidence Gaps, none silently unmentioned.
- For a defect-class task: record that the original failing input was re-run, and what it produced.

## Verification Dimension Audit

- Completeness: underlying evidence opened; missing/skipped checks and impact.
- Correctness: directness of evidence for behavior and failure paths.
- Coherence: agreement among requirements, design, plan, implementation, and observed behavior.

## Must Fix

- Write "None" when there are none.

## Should Fix

- Write "None" when there are none.

## Evidence Gaps

- Write "None" when there are none.

## Residual Risk

- Write "None" when there are none.

## Next Owner

- The agent or human responsible for the next action.
