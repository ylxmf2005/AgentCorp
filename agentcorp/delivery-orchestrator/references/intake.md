# 本地 Triage 引用

当 incoming 工作以 issue、bug 报告、用户反馈或模糊请求的形式到来、需要分派时，用这份引用。

## Intake 原则

先读完整批再分派任何一项。保留报告者的观察，添加分类元数据，而不是把报告改写成你自己的理论。按用户影响和技术 severity 分类，而不是按报告者的资历或新旧。分派前先合并 duplicate，避免产生互相冲突的实现工作。分派出去的 work item 要自包含，让下一个 agent 不必读无关线程就能开工。

## Classification

| Issue 信号 | Type | Paradigm |
| --- | --- | --- |
| 曾经能用、现在失效 | `bugfix` | `bugfix/hypothesis-driven` |
| 与文档化或预期行为不符 | `bugfix` | `bugfix/hypothesis-driven` |
| 崩溃、数据丢失或安全漏洞 | `bugfix` | `bugfix/hypothesis-driven` |
| 用户想要一项尚不存在的能力 | `enhancement` | `enhancement/delta-design` |
| 用户想让现有行为换一种方式工作 | `enhancement` | `enhancement/delta-design` |
| 不改接口的小型孤立能力 | `addition` | `addition/simple` |
| 全新系统或重要子系统 | `greenfield` | `dev/architecture-first` |

当 issue 是设计争议、一个问题，或依赖你不具备的领域专长时，升级上报而不是硬分类。

## Deduplication

强 duplicate 信号：相同的复现步骤；相同的错误信息且发生在同一界面；同一页面、endpoint、命令或 workflow 上的同一失败；一份报告是另一份的子集。合并时保留最清晰的标题、最完整的复现、最高的 severity，以及所有 source issue ID。

## Priority

| Priority | 含义 |
| --- | --- |
| P0 | 生产对大量用户不可用、数据丢失，或正在发生的安全入侵。需发起人确认。 |
| P1 | 重大用户影响或无 workaround。需发起人确认。 |
| P2 | 有 workaround 的真实问题，或有意义的功能缺口。 |
| P3 | 轻微摩擦、外观问题，或 backlog 改进。 |

回归、blocker、安全问题和数据丢失要上调 priority。每个 priority 都要一句话的理由。

## Work Item 形态

遵循 `references/templates/work-item.demo.md`。
