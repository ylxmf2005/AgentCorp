# 本地 Triage 参考

当新的工作以 issue、bug report、user feedback 或需要分派出去的模糊请求形式到来时，请使用本参考。

## 受理原则

在分派任何单项之前，先完整阅读整批内容。保留报告者的原始观察，并补充分类元数据，而不是把报告改写成你自己的推断。按用户影响和技术严重程度分类，而不是按报告者的资历或时间先后。分派前先合并重复项，避免产出相互冲突的实现工作。分派出去的工作项必须是自包含的，这样下一个 agent 无需阅读无关线程即可开始。

## 分类

| 问题信号 | Type | Paradigm |
| --- | --- | --- |
| 以前正常，现在坏了 | `bugfix` | `bugfix/hypothesis-driven` |
| 与文档或预期行为不符 | `bugfix` | `bugfix/hypothesis-driven` |
| 崩溃、数据丢失或安全漏洞 | `bugfix` | `bugfix/hypothesis-driven` |
| 用户想要一个尚不具备的能力 | `enhancement` | `enhancement/delta-design` |
| 用户希望现有行为换一种方式工作 | `enhancement` | `enhancement/delta-design` |
| 不改动接口的小型独立能力 | `addition` | `addition/simple` |
| 全新系统或重要子系统 | `greenfield` | `dev/architecture-first` |

当 issue 属于设计争议、疑问，或依赖你所不具备的领域专业知识时，应升级处理，而不是强行分类。

## 去重

强重复信号：完全相同的复现步骤；同一界面上出现的相同错误信息；同一页面、endpoint、command 或 workflow 上的相同失败；某个报告是另一个报告的子集。合并时保留最清晰的标题、最完整的复现、最严重的级别，以及所有来源 issue ID。

## 优先级

| Priority | 含义 |
| --- | --- |
| P0 | Production 对大量用户不可用、数据丢失或正在发生的安全入侵。需要 sponsor 确认。 |
| P1 | 重大用户影响或没有 workaround。需要 sponsor 确认。 |
| P2 | 有 workaround 的真实问题，或有意义的功能缺口。 |
| P3 | 轻微摩擦、外观问题或 backlog 改进。 |

对 regression、blocker、security issue 和数据丢失要提高优先级。每个优先级都要给一句理由。

## 工作项形态

遵循 `references/templates/work-item.demo.md`。
