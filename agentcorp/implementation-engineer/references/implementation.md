# Local Implementation Reference

实现一份已批准的工作时，把这份参考当作渐进展开的细节来用。

## 输入

你实现的依据是：已批准的 Implementation Story Spec、Plan Review Lead 的决定和实现约束、以及 Story Spec 所引用的源产物（validated requirements、TestPlan/Test Strategy 或 diagnosis criteria、design 产物/contracts、本地规范），还有被指派回来的 code review findings。多个源产物互相冲突时，停下来报冲突，不要靠猜。

## 执行一份 Story Spec

先把整份 Story Spec 读完，吃透它的 Story、Acceptance Criteria、Tasks/Subtasks、Implementation Constraints、Verification Expectations、Review Focus 和 Status，再把它引用的代码和项目上下文加载进来。然后照 task/subtask 的顺序往下做——除非 Story Spec 或 reviewer 明确允许重排。

每个 task 都做那个「最小且正确」的改动：贴着已批准的故事来实现，不要顺手做相邻的改进；现有模块边界保持原样，除非已批准的产物要改它。尽量让每个文件只动一处连贯的改动，要再改之前先重新读一遍。行为、契约、bug、数据、auth 或公共接口有变动时，补上或更新聚焦的测试。一路把进度、改动文件、命令、deviation 和 blocker 记进 `implementation/implementation-result.md`。

实现里最该警惕的是用静默 fallback、假成功、宽泛的 catch 或吞掉的错误把失败盖住——宁可让它显式地失败。

## bugfix

bugfix 只在 diagnosis 已经给出因果链之后才动手。修复要打在 root cause 上，而不只是症状上。补一个 regression check——它在修复之前应当会失败。

## 交接前的把关

交给 Code Review 之前，让人能信任这次实现是真的做完、真的验证过了：每个必需的 task/subtask 要么完成、要么明确列为 blocked；代码能编译、相关的静态检查（若有）能跑过；聚焦的测试通过，否则把失败如实记成 blocker；改动后的行为对照过 acceptance criteria、TestPlan 或 diagnosis criteria；实现结果里列全了所有新增、修改、删除的文件，以及偏离已批准 Story Spec 的地方；Code Review Lead 拿得到改动文件、命令、测试证据和已知风险。
