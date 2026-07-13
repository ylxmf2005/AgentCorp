---
artifact_type: PhaseAssignment
task_id: 20260603-120000-example-task
task_root: teamspace/tasks/20260603-120000-example-task/
from_agent: delivery-orchestrator
to_agent: example-agent
phase: example-phase
status: assigned
output_path: review/example-output.md
output_language: zh-CN
effort: high
source_ref: origin/main
target_ref: origin/main
merge_base: 0123abcdef0123abcdef0123abcdef0123abcd
---

# Assignment: example-phase

## Goal

State the goal of this phase.

## Inputs

- Required input artifacts or evidence.

## Source Artifacts

- requirements/validated-requirements.md

## Action Context

- Source of truth: repository for current code behavior; approved task artifacts for approved intent.
- Context files to read before acting: concrete existing paths only; list every required file.
- Allowed edit roots: list exact repository or task-root paths.
- Read-only context: list paths that may be read but not edited.
- Output path: use the frontmatter `output_path`.
- Baseline: the frontmatter `source_ref`/`target_ref`/`merge_base`, copied from `task.md` — carried whenever this phase reads, diffs, or edits code; omit all three otherwise. The assignee verifies the checkout against them before acting.
- Tier compilation: the concrete counts the task's effort tier buys for this phase (lanes to convene, layers to run, rounds cap, item categories) written as explicit constraints — the assignee follows these and never re-derives them from the `effort` field.
- Artifact rules: behavioral constraints for the assignee; do not copy them into the output artifact.

## Constraints

- Language, scope, environment, and risk constraints.

## Required Outputs

- Write the phase artifact to `output_path`.
- Return a receipt matching `templates/phase-receipt.demo.md`.

## Stop Conditions

- A required context file is missing or stale, source artifacts contradict one another, the goal is unclear, the environment is unavailable, or the risk is unsafe. Name the affected transition and any independent work that can continue.
