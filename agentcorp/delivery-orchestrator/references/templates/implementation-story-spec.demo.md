---
artifact_type: ImplementationStorySpec
task_id: 20260603-120000-example-task
author_agent: implementation-planner
status: ready_for_plan_review
source_artifacts:
  - requirements/validated-requirements.md
  - design/impact-analysis.md
---

# Implementation Story: Example Title

## Implementation Story

As a user or system actor,
I want the approved change completed,
so that the required outcome is met.

## Source Context

- Requirements: requirements/validated-requirements.md
- TestPlan/Test Strategy: test/test-plan.md
- Design artifacts: design/impact-analysis.md
- Plan Review status: pending
- Source of truth: repository for current code behavior; approved task artifacts for approved intent.
- Concrete context files read: list every existing file, no unresolved globs.
- Allowed edit roots: exact paths.
- Read-only context: exact paths.
- Key facts implementation needs to know up front:
  - Only state facts the engineer needs immediately.

## Acceptance Criteria

1. Observable acceptance conditions traceable to the requirements.

## Tasks / Subtasks

- [ ] T1: Task title (AC: 1, target: module/file)
  - [ ] T1.1 Specific subtask.

## Implementation Constraints

- Module boundaries, patterns, contracts, data flow, behaviors that must be preserved, and forbidden zones.

## Verification Expectations

- TestPlan/diagnosis acceptance criteria: paths and sections.
- Checks the engineer owns: focused tests or commands.
- External verification: checks the Test Leader/testers own later.

## Review Focus

- Specific areas the Plan Review Lead should examine closely.
