---
artifact_type: PhaseAssignment
task_id: 20260603-120000-example-task
task_root: teamspace/tasks/20260603-120000-example-task/
from_agent: delivery-orchestrator
to_agent: project-steward-reviewer
phase: code-review
status: assigned
output_path: review/specialist-findings/project-steward-reviewer.md
output_language: zh-CN
effort: high
---

# Assignment: code-review

## Goal

From a project steward / maintainer viewpoint, review whether this plan, design, or diff is worth admitting into the project's long-term history.

## Inputs

- implementation/implementation-story.md
- implementation/implementation-result.md
- review/code-review.md
- git diff or the list of changed files

## Source artifacts

- requirements/validated-requirements.md

## Constraints

- Human-readable output uses zh-CN.
- Report only issues that have long-term maintenance impact, are locatable, and are actionable.
- Do not dress up personal style preferences as blockers.

## Required outputs

- Write the phase artifact at `output_path`.
- Return a receipt matching `templates/phase-receipt.demo.md`.

## Stop conditions

- A required input is missing, the goal is unclear, or the review scope cannot be established.
