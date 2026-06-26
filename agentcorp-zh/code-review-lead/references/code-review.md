# 本地代码审查参考

用于协调实现 review，并将其收敛为一个可以追责的决策。这里讲的是「怎么审」——找谁参与、怎么给 finding 定级、怎么敲定结论——不是排版格式。

## 审查维度与人员选择

以下五个维度必须始终考虑：correctness（逻辑、状态、边界条件、错误传播）、standards（仓库明确指令与本地约定）、simplicity（不必要的抽象、范围蔓延、可避免的开销）、change hygiene（diff 整洁度、意图可追溯性、历史残留、超出范围的语义/合约变更）和 project stewardship（项目方向、长期维护成本、public surface、模块边界，以及 owner 是否愿意长期为这个变更负责）。其余维度根据变更的实际风险按需启用，不要默认全开：security 对应 auth、权限、external endpoints、untrusted input、secrets；reliability 对应 retries、timeouts、I/O、async tasks、health checks、recovery；performance 对应 hot paths、queries、loops、memory、scale；API contract 对应 routes、JSON-RPC/A2A、CLI、schemas、external interfaces；change hygiene reviewer 对应 formatting/wrapping/drive-by-refactor 噪音、multi-commit 历史残留、中途变更需求、顺带改掉的 public/shared contracts，以及对兼容性入口 / fallback / cache key / deprecation 行为的修改；adversarial 对应高风险、大规模、多角色、时间敏感或容易被滥用的变更；当实现改变了风险或 coverage 的假设时，引入 Test Planner 或 test review。

## finding 定级

定级依据是「是否存在可操作的失败路径」，而非有多少 reviewer 提出了这个 finding。

Must-fix 包括：可复现的行为 bug、security 或数据丢失风险、contract-breaking 变更、违反明确需求、无法追溯到已审批 source artifacts 的越界语义/合约变更、steward 提出的会在项目核心写入错误长期承诺的 finding，以及任何会阻碍有效验证的 review blocker。Suggested fixes 包括：存在合理失败模式的 maintainability、reliability、performance、coverage 或长期维护风险，或者一个合理的 change hygiene finding，应当从当前 MR/PR 中拆分出去。Optional 包括：不阻塞交付的有益清理。应予驳回的包括：style 观点、重复项、与本次变更无关的既有问题、没有可操作路径的猜测。

合并重复 finding 时，归入证据最强、file/line 最精确的那一条。

## 决策

`approve`：已无 must-fix finding，可以继续验证。`request_changes`：仍有 must-fix finding。`needs_more_evidence`：因缺少 diff、requirements、test 或 design 上下文，无法完成 review。

高风险改动上（安全/权限边界、public/shared contract、数据丢失/不可逆发布），在下结论前取一次跨家族二次意见 —— 从一个跟形成这个 verdict 不同的模型家族那里做一次独立冷读，走 host 暴露的任一通道，不点名具体模型 —— 并作为一个输入记下来; 结论仍归 Code Review Lead 自己。若 sponsor 要求了、而又没有别家族通道，就停下来报告，而不是自己给自己签字。

禁止在没有证据的情况下声称某个 reviewer、command 或 test 已经执行过。
