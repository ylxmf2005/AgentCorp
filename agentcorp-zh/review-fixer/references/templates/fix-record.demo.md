---
artifact_type: FixRecordSet
task_id: example-task-20260603-120000
author_agent: review-fixer
status: completed
group_slug: <this group's short English slug, usually derived from the owned file set>
source_artifacts:
  - review/research/00-index.md
---

# 修复记录，逐项说明：<group_slug>

本组的归属文件集（OWNED_FILES）：path/to/service.py, path/to/helper.py

## 逐项记录

### 记录 1

- fix_item_id: <ID, e.g. P0-1>
- severity: <P0 | P1 | P2>
- verdict: fixed-as-suggested
- files_changed: path/to/service.py
- regression_check: 添加了 <test/check>；在 <trigger condition> 下，修复前失败，修复后通过。
- notes: Drift check 通过；按 research 给出的修复方案在根因处落地，没有降级为 patch。

### 记录 2

- fix_item_id: <ID, e.g. P1-5>
- severity: <P0 | P1 | P2>
- verdict: needs-research
- files_changed: none
- regression_check: not applicable
- escalation: research 的建议与当前代码不匹配 —— <不匹配的位置：代码已变更 / not applicable / 与现有代码冲突>。没有在上面打自己的替代 patch；已发回 review-researcher 重新检查。
