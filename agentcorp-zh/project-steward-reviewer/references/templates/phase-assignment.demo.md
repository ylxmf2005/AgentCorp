---
artifact_type: PhaseAssignment
task_id: example-task-20260603-120000
phase: code-review
owner_agent: project-steward-reviewer
status: assigned
task_root: teamspace/tasks/example-task-20260603-120000
output_path: review/specialist-findings/project-steward-reviewer.md
---

# Phase Assignment

## Goal

以项目 steward / maintainer 的视角，review 这个 plan、design 或 diff 是否值得被纳入项目的长期历史。

## Input

- implementation/implementation-story.md
- implementation/implementation-result.md
- review/code-review.md
- git diff 或变更文件列表

## Output

- `review/specialist-findings/project-steward-reviewer.md`

## Constraints

- 输出内容使用简体中文。
- 只报告对长期维护有影响、可定位且可执行的问题。
- 不要把个人风格偏好包装成 blocker。
