---
artifact_type: PhaseAssignment
task_id: 20260603-120000-example-task
task_root: teamspace/tasks/20260603-120000-example-task/
from_agent: delivery-orchestrator
to_agent: review-fixer
phase: fix
status: assigned
group_slug: <本组的短英文标识>
output_path: review/fix-records/<group-slug>.md
output_language: zh-CN
effort: high
---

# 任务分配：修复（单组）

## 目标

忠实落地本组已验证的修复项（与其他组不重叠的文件集）。本任务分配只是本轮并行修复中的一个组；切片与跨组合并由交付编排器负责。

## FIX_ITEMS（本组必须落地的项）

- F-01：裁决 confirmed；根因 …；修复方案 …；涉及 path/to/service.py
- F-04：裁决 partial；修正后的修复方案 …；涉及 path/to/service.py
（每条引用 review/research/ 下对应 issue 文件中的裁决与修复方案；仅包含 confirmed/partial 项。）

## OWNED_FILES（本组可编辑的文件集）

- path/to/service.py
- path/to/helper.py
（不得编辑集外的文件；如需溢出，按 needs-human 升级。）

## 输入

- 本组每条 issue 在 review/research/ 下的裁决与修复方案（必需）
- 人类批注（如有，优先级最高）
- 本组应运行的聚焦验证提示

## 约束

- 不要重新验证：有效性/根因/修复方案遵循研究结论；本角色仅负责落地。
- 忠实落地那个优雅的修复，在根因处而非打补丁；保持改动聚焦并符合既有约定。
- 仅编辑 OWNED_FILES 内的产品代码并保留在工作区；不要提交，不要推送；不要触碰留给其他所有者的区域（例如前端）。
- 仅运行聚焦验证，不要运行完整套件（编排器在合并后运行完整套件）。
- 如果建议与当前代码不匹配，送回重新检查（needs-research）；不要在其上叠加自己的替代方案。

## 必需产出

- 在 `output_path` 撰写本组修复记录（格式参考 `templates/fix-record.demo.md`）。
- 返回与 `templates/phase-receipt.demo.md` 匹配的回执，`artifact_path` 指向本组记录。

## 终止条件

- FIX_ITEMS 引用的研究结论缺失、必须编辑 OWNED_FILES 外的文件、或修复会触及前端 / 需要未经批准的依赖。
- 触发时，返回 `status: blocked` 的回执并注明阻塞原因。
