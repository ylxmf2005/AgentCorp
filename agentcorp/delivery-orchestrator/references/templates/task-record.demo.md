---
artifact_type: TaskRecord
task_id: 20260603-120000-example-task
author_agent: delivery-orchestrator
status: active
current_phase: validate-requirements
workflow_mode: partial-delegation
interaction_mode: auto
effort: high
output_language: zh-CN
source_ref: origin/main
target_ref: origin/main
merge_base: 0123abcdef0123abcdef0123abcdef0123abcd
---

# Task: Example Task

## Requester Request

- Original request or issue link.

## Success Criteria

- Observable completion conditions.

## Out of Scope

- Explicit non-goals.

## Baseline

- Machine copy lives in the frontmatter (`source_ref` / `target_ref` / `merge_base`) — `validate-handoff.py` checks every assignment that carries refs against it.
- source_ref: what the working branch is cut from and verified against; a stacked task names its parent task's branch here and lands only after the parent merges.
- target_ref: what this delivery merges into — usually the repo default branch, even when stacked; it differs from source_ref only while a parent is unmerged.
- Working branch: feat/example-task
- Both refs are sponsor intent confirmed at intake, never inferred from the current checkout. When source_ref != target_ref, delivery is incomplete until the work is reconciled onto target_ref.

## Selected Paradigm

- enhancement/delta-design

## Workflow Mode

- partial-delegation (choose one of: direct | partial-delegation | full-delegation)

## Interaction Policy

- auto (choose one of: auto | gate)

## Effort

- high (choose one of: low | medium | high | max)

## Phase Sequence

- validate-requirements -> test-plan -> test-plan-review -> impact-analysis -> implementation-plan -> plan-review -> implement -> code-review -> review-research -> fix -> verify -> acceptance-review -> compound -> deliver

## Gate History

- Requirements gate: approved | skipped | revised | blocked
- Standing sponsor preference: none | continue without routine pauses | <specific instruction>

## Active Constraint

- Blocked transition: None.
- Reason: None.
- Continueable work: All work permitted by current gates.
- Sponsor decision needed: None.

## Artifact Coherence

- State: coherent | needs_revision
- Triggering revision: None.
- Affected artifacts: None.
- Next owner: None.

## Execution Progress

| Work unit | Status | Owner | Evidence or blocker |
| --- | --- | --- | --- |
| Example | pending | example-agent | None. |

## Decision Log

- Key orchestration decisions and their rationale.
