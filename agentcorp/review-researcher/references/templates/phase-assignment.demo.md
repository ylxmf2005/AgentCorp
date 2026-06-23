---
artifact_type: PhaseAssignment
task_id: example-task-20260603-120000
task_root: teamspace/tasks/example-task-20260603-120000/
from_agent: delivery-orchestrator
to_agent: review-researcher
phase: review-research
status: assigned
output_path: review/research/
---

# Assignment: review-research

## Goal

Research every finding from this round of code review to the bottom: verify whether it is real, give a verdict of confirmed/false-positive/partial/needs-human, give an elegant fix suggestion for those that hold, and write a fully understandable per-issue explanation + index.

## Inputs

- review/code-review.md (required)
- review/specialist-findings/ (if any)
- the real diff / changed-file list (if any)
- documented design principles (CLAUDE.md / auto memory / design memory) (if any)

## Source artifacts

- review/code-review.md

## Constraints

- zh-CN, written for someone unfamiliar with this code; where code is involved, paste key snippets and explain.
- The verdict must land on real code and be evidence-backed; mark needs-human when code reading is insufficient or out-of-repo context is missing, and do not force a conclusion.
- Give only fix suggestions; do not change product code or make acceptance judgments.
- Research/explanation documents are *.md and are never included in a commit.

## Required outputs

- Under the `output_path` folder, write `00-index.md` (with every verdict) and one research file per issue.
- Return a receipt matching `templates/phase-receipt.demo.md`, with `artifact_path` pointing to `00-index.md`.

## Stop conditions

- Code review findings are missing, or the key code/diff cannot be read, so honest verification is impossible.
