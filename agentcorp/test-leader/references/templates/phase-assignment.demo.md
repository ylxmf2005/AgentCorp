---
artifact_type: PhaseAssignment
task_id: 20260603-120000-example-task
task_root: teamspace/tasks/20260603-120000-example-task/
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

- The required input artifacts or evidence.

## Source Artifacts

- requirements/validated-requirements.md

## Action Context

- Source of truth: named runtime environment for observed behavior; listed task artifacts for expected behavior.
- Context files to read: concrete TestPlan/playbook, implementation, and review paths.
- Allowed write roots: the assigned result path and explicitly authorized test data only.
- Read-only context: product code unless the assignment explicitly authorizes a fixture or test edit.
- Artifact rules: execution constraints; do not copy them into the result.

## Constraints

- Language, scope, environment, and risk constraints.

## Required Output

- Write the phase artifact at `output_path`.
- Return a receipt matching `templates/phase-receipt.demo.md`.

## Stop Conditions

- Missing required input, an unclear goal, an unavailable environment, or unsafe risk.
