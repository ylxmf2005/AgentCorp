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
---

# Assignment: example-phase

## Goal

State the goal of this phase.

## Inputs

- Required input artifacts or evidence.

## Source artifacts

- requirements/validated-requirements.md

## Constraints

- Language, scope, environment, and risk constraints.

## Required outputs

- Write the phase artifact at `output_path`.
- Return a receipt matching `templates/phase-receipt.demo.md`.

## Stop conditions

- Required inputs are missing, the goal is unclear, the environment is unavailable, or the risk is unsafe.
