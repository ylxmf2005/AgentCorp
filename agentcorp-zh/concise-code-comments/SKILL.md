---
name: concise-code-comments
description: "当 AgentCorp 写、审查或修复代码注释，并且注释需要短、准、有用、不过度解释时使用。适用于 inline comments、测试注释、TODO/FIXME/HACK、文件头、方法文档、交付 walkthrough 注释，以及注释太长、太显然、AI 味太重、过期或复述代码时的清理。"
---

# Concise Code Comments

这是 AgentCorp 的通用代码沟通能力，不是交付 phase，也不是带独立 gate 的角色。任何编辑或审查代码的角色，在注释质量影响可维护性、评审清晰度或交付观感时都可以加载它。

目标是控制注释密度：短、准确，只补代码本身看不出的上下文。不要把代码改写成散文文档。

## 核心原则

- **解释 why，不复述 what。** 代码已经表达“做什么”时，注释只解释为什么这么做、为什么安全、为什么不能改。
- **短注释优先。** 内联注释通常 1 行；复杂因果最多 2 行。超过 2 行必须有强理由。
- **只补缺失上下文。** 有价值的注释说明历史兼容、外部系统行为、运行期/保存期差异或安全边界。
- **测试注释更克制。** 测试名和断言通常已表达含义。只有测试保护历史 bug、非直觉契约或兼容规则时才保留注释。
- **不写过程叙事。** 不把调查过程、PR 讨论或情绪强调塞进代码。
- **匹配本地风格。** 中文项目注释继续中文，英文文件继续英文。不要加装饰符号、emoji、口号式标题或伪图标。

## 保留注释的场景

- 历史数据兼容：脏数据、缺字段、旧 API 形状、迁移缺口。
- 外部契约：另一个服务、SDK、数据库、配置系统或运行时有非直觉行为。
- 保存期与运行期差异：例如保存期 fail-fast，运行期 fail-open。
- 安全和可靠性边界：不能吞错、不能重试、不能写空串、不能改默认值。
- 临时 workaround：TODO/FIXME/HACK 必须写 owner、移除条件或阻塞项。

## 删除或压缩

- 复述下一行代码的注释。
- 解释显而易见测试断言的注释。
- 复制到代码里的长需求摘要。
- 用多行解释一个本可通过更好命名表达的布尔判断。
- 容易漂移的字段清单、数字或流程细节；能引用常量/方法名就引用。
- “理论上不会发生”“兜底一下”“重要逻辑”这类没有真实边界的模糊注释。

## 工作流

1. 先看当前 `git diff`。除非用户明确要求更大范围，只处理当前任务改动过的注释。
2. 对每条新增或修改注释问：
   - 没有它，维护者会不会误读或误删？
   - 它解释的是原因、边界或历史，而不是复述代码吗？
   - 能不能压到 1 行，最多 2 行？
3. 注释太长时，先考虑能否用更好的变量名或方法名承载含义。
4. 改完后重读相邻代码，确认注释只陈述代码或证据能支持的事实。
5. 不为了对称而补注释；目标是更少、更准。

## 示例

推荐：

```java
// 保存期拒绝脏配置；运行期仍 fail-open，避免历史数据导致告警漏报。
validateEffectiveTime(policy);
```

不推荐：

```java
// 这里调用 validateEffectiveTime 来校验 policy 的 effectiveTimeMode、effectiveTimeCustom、
// effectiveTimePreset 等字段，防止用户传入错误配置导致后续保存失败或运行时出现异常。
validateEffectiveTime(policy);
```

问题：复述调用内容，字段清单容易漂移，原因太泛。

## AgentCorp 集成

- **Implementation Engineer / Review Fixer**：实现或修复结果返回前，如果新增/修改过注释，就用它收口。
- **Code Review Lead / Change Hygiene / Standards / Simplicity reviewers**：用于指出过长、过期、显然或误导性的注释。
- **Change Detailed Walker**：用于控制 walkthrough inline comments 的密度，只讲 rationale，不膨胀 diff。
- **Delivery Orchestrator**：当注释噪音影响 implementation gate 时，可要求 implementer/fixer 加载此能力。
