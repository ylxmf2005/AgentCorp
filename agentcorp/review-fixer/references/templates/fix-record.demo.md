---
artifact_type: FixRecordSet
task_id: example-task-20260603-120000
author_agent: review-fixer
status: completed
group_slug: <本组的简短英文 slug，通常取自占用文件集>
source_artifacts:
  - review/research/00-index.md
---

# 修复逐条记录：<group_slug>

本组占用文件集（OWNED_FILES）：path/to/service.py、path/to/helper.py

## 逐条

### 记录 1

- fix_item_id: <编号，如 P0-1>
- severity: <P0 | P1 | P2>
- verdict: fixed-as-suggested
- files_changed: path/to/service.py
- regression_check: 新增 <测试/检查>，<触发条件> 下修复前会失败、修复后通过。
- notes: 抗漂移核对通过；按 research 修法治本落地，未降格成补丁。

### 记录 2

- fix_item_id: <编号，如 P1-5>
- severity: <P0 | P1 | P2>
- verdict: needs-research
- files_changed: 无
- regression_check: 不适用
- escalation: research 建议对不上当前代码——<对不上在哪：代码已变 / 落不下去 / 与现有代码冲突>。未自行改方案硬上，退回 review-researcher 复核。
