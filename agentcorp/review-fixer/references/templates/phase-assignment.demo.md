---
artifact_type: PhaseAssignment
task_id: example-task-20260603-120000
task_root: teamspace/tasks/example-task-20260603-120000/
from_agent: delivery-orchestrator
to_agent: review-fixer
phase: fix
status: assigned
group_slug: <本组的简短英文 slug>
output_path: review/fix-records/<group-slug>.md
---

# 指派：fix（单组）

## 目标

把本组（一个互不与其它组重叠的文件集）的已核验修复项忠实落地。本 assignment 只是本轮并行修复中的一个分组；切分与跨组合并由 Delivery Orchestrator 负责。

## FIX_ITEMS（本组要落地的项）

- P0-1：判定 确认；根因 …；修法建议 …；涉及 path/to/service.py
- P2-2：判定 部分成立；修正后修法 …；涉及 path/to/service.py
（每条引用 review/research/ 里对应 issue 文件的判定与修法建议；只含确认/部分成立项。）

## OWNED_FILES（本组允许编辑的文件集）

- path/to/service.py
- path/to/helper.py
（不得编辑集合外的后端文件；需外溢就 needs-human 上报。）

## 输入

- review/research/ 里本组各 issue 的判定与修法建议（必需）
- human 评论（如有，优先级最高）
- 本组该跑的聚焦校验提示

## 约束

- 不重做核验：真伪/根因/修法以 research 为准；本角色只落地。
- 忠实落地那份优雅修法，治本不打补丁；改动聚焦、贴合既有约定。
- 只编辑 OWNED_FILES 内的后端代码并留在工作区；不提交、不 push；不碰前端。
- 只跑聚焦校验，不跑全量 suite（全量由 Orchestrator 合并后跑）。
- 建议对不上当前代码就退回复核（needs-research），不自行改方案硬上。

## 必需输出

- 在 `output_path` 写入本组修复记录（`templates/fix-record.demo.md` 形态）。
- 返回一份匹配 `templates/phase-receipt.demo.md` 的 receipt，`artifact_path` 指向本组记录。

## 停止条件

- FIX_ITEMS 引用的 research 结论缺失、需编辑 OWNED_FILES 之外的文件、或修复会触碰前端 / 需未批准的依赖。
