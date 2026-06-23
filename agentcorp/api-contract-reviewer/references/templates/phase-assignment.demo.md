---
artifact_type: PhaseAssignment
task_id: example-task-20260603-120000
task_root: teamspace/tasks/example-task-20260603-120000/
from_agent: delivery-orchestrator
to_agent: example-agent
phase: example-phase
status: assigned
output_path: review/example-output.md
---

# Assignment: example-phase

## Goal

State the goal of this phase.

## Inputs

- Required input artifacts or evidence.

## Source Artifacts

- requirements/validated-requirements.md

## Constraints

- Language, scope, environment, and risk constraints.

## Required Outputs

- Write the phase artifact at `output_path`.
- Return a receipt matching `templates/phase-receipt.demo.md`.

## Stop Conditions

- A required input is missing, the goal is unclear, the environment is unavailable, or the risk is unsafe.
