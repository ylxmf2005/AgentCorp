# 本地实现参考

在实现已批准的交付项时，将此参考作为逐步展开的详细指引。

## 输入

你基于以下材料进行实现：已批准的 Implementation Story Spec、Plan Review Lead 的决策与实现约束，以及 Story Spec 引用的源产物（已验证的需求、TestPlan/测试策略或诊断标准、设计产物/契约、local standards），再加上任何分配给你的 code review 发现。当多个源产物发生冲突时，停下来报告冲突，而不是猜测。

## 执行 Story Spec

首先通读整个 Story Spec，消化其中的 Story、Acceptance Criteria、Tasks/Subtasks、Implementation Constraints、Verification Expectations、Review Focus 和 Status，然后加载它引用的代码和项目上下文。接着按顺序完成 tasks/subtasks——除非 Story Spec 或 reviewer 明确允许重新排序。

对每个 task 做"最小且正确"的改动：紧贴已批准的 story 实现，不要顺带塞入周边优化；保持现有模块边界不变，除非已批准的产物明确要求修改。尽量让每个文件只包含单一连贯的改动，并且在再次修改前重新读一遍。当行为、契约、bug、数据、auth 或 public interface 发生变化时，添加或更新针对性测试。在推进过程中，把进度、变更文件、命令、偏差和 blockers 记录到 `implementation/implementation-result.md`。

改动越少越好。在添加任何内容之前，先用以下问题 gate 一下，防止 diff 膨胀：

- **先复用，再新建。** 在添加函数、文件或抽象之前，先在仓库里搜一下是否已有现成实现（grep 关键符号、相似名称、同类工具）——能复用就复用，不要在旁边再立一个同义副本。
- **不为想象的未来做泛化。** 不要预留 flag/option/plugin point，也不要写通用结构来应对"以后可能会用到"；如果眼下只有一个 use case，就按这一个 case 写。
- **不提前抽取。** 单调用方的逻辑直接内联写；不要抽成共享函数，除非已批准的 Story Spec 明确要求该接口。
- **不顺手碰无关代码。** 任务没要求改的现有代码保持原样——不要把顺带的重命名、重构和格式化塞进这次改动。
- **每个新增都追溯到 spec。** 每项新增的能力、文件或分支都应能追溯到 Story Spec 或 acceptance criteria；追溯不到的即 out of scope，不要做。

实现中最需要警惕的是用静默 fallback、伪造成功、大而全的 catch 或吞掉 error 来掩盖失败——宁可让它显式挂掉。

## bugfix

只有在诊断已得出因果链之后，才动手修 bug。修复应落在 root cause 上，而不是只处理 symptom。添加一个 regression check——它在修复前应当失败。

## handoff 前的 gate

在 handoff 给 Code Review 之前，要让实现真正值得信任，即确实做完了、确实验证过了：每个必需的 task/subtask 要么已完成，要么被明确列为 blocked；代码能编译通过，相关 static checks（如有）通过；focused tests 通过，或者失败被如实记录为 blocker；结果行为已对照 acceptance criteria、TestPlan 或诊断标准检查过；implementation result 列出了所有新增、修改和删除的文件，以及所有偏离已批准 Story Spec 的地方；Code Review Lead 能够拿到变更文件、命令、测试证据和已知风险。
