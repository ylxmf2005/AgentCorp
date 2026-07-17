# Context — 让所有 Skill 在同一个任务里工作

每个任务都维护一份共享的 **Task Context**。它是当前任务的权威状态：同时包含用户批准的承诺，以及会改变下游判断的当前事实；它不是某个阶段的临时摘要。简单、单轮任务可以只在当前对话中维护等价状态；任务一旦跨 Skill、跨阶段、跨 Agent、跨会话、跨分支或开始产生持久产物，就把它写入 `<task-workspace>/task.md`。

Context 协议包含三个概念：

- **Project Context**：项目现实及其证据，包括真实使用者、调用链、并发与顺序、规模、信任边界、失败恢复、数据生命周期、兼容和部署。
- **Task Operating Envelope**：从 Project Context 中选出、当前任务真正需要负责的运行条件；每个相关 dimension 区分 normal range、credible edge、explicit exclusion 和 evidence。“用户一般不会这样做”不能替代平台重试、worker、公共入口或运行数据。
- **Task Context**：当前目标、scope、non-goals、完成证据、必须保持的行为、source ref、working branch、target ref，以及 Task Operating Envelope。User Context 不属于当前协议。

Scope 由用户与 `shape` 形成。后续证据可以推翻它，但其他 Skill 只能核验、提出修订或记录冲突；用户直接改变方向，或用户同意 Agent 提出的变化后，才更新任务承诺和 `scope_revision`。任何会改变下游判断的权威事实或承诺变化都增加 `context_revision`；只有承诺变化同时增加 `scope_revision`。调查可以比 scope 宽，执行、修复、评审裁决和测试结论不能静默变宽。

Git 的 `source_ref`、`working_branch`、`target_ref` 是任务意图：工作线从哪里长出、在哪条分支工作、最终合到哪里。它们可以为空；空值要区分 `not-applicable` 与 `unresolved`，不表示可以把当前 HEAD 当成用户意图。代码相关 Skill 先核对 repo、worktree、branch 和已记录 refs；适用且已解析时，按需要分别取得工作线相对 `source_ref` 的 fork point，以及 `target_ref` 实际会收到的 delivery diff。`merge-base(...)`、inspected revision 和交付状态是现场证据，不是用户参数。无法取得时记录原因；只有 unresolved 状态会改变对象或结果时，才暂停依赖该基线的路径。

每个 Skill 开始时读取或恢复当前 Task Context；存在持久文件时，在产物中标明使用的 `context_revision`，涉及任务承诺时同时标明 `scope_revision`。现实与 Context 冲突时，先修正事实模型并增加 `context_revision`；若冲突会改变 scope、兼容承诺、refs、Task Operating Envelope 或长期成本，暂停依赖它的动作，向用户提出清楚且标价的修订，其他独立工作继续。

持久产物优先沿用已有任务工作区。没有约定时，若目标仓库已有 `studio/`，使用 `<repo-root>/studio/tasks/<task-id>/`；否则使用 `~/.longrein/studio/tasks/<task-id>/`，其中 `<task-id>` 优先沿用稳定标识，没有时使用 `<YYYYMMDD>-<slug>`。不要为此擅自在目标仓库创建 `studio/`、修改 `.gitignore` 或扩大提交范围；各 Skill 只声明自己的相对子目录和文件，落盘后告诉用户绝对路径。
