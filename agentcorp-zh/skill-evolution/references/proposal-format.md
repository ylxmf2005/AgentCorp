# Skill Evolution Proposal — 格式

`session-end-capture` 钩子（注册为 `SessionEnd` 钩子）每会话写一份文件到 `teamspace/skill-evolution/pending/<ts>-<session>.md`，包含零条或多条提案。如果会话没有产出，则不写文件（分析器输出 `NO_PROPOSALS`）。此形状的权威发射器是插件根目录的 prompt `hooks/skill-evolution-analyze.md`；本文件为消费者记录该形状——任何 schema 变更必须同时编辑两者，在同一轮落地中完成。

## Frontmatter

- `artifact_type: SkillEvolutionProposal`
- `session_id: <id>`
- `status: pending` —— 文件离开 `pending/` 时重写为 `landed` 或 `rejected`（见生命周期）。

## 每条提案块

- **target**：现有技能名称（例如 `delivery-orchestrator`）或 `NEW: <topic>` 表示要构建的新技能。
- **trigger**：`user-noticed` | `agent-trial-and-error` | `external-research`。
- **signal**：来自会话的具体、隐私最小化证据——实际发生了什么。脱敏 secret、个人绝对路径、身份、邮箱和 private URL；只引用最小必要片段。
- **proposed change**：具体的编辑，或要运行的研究；优先选择执行/结构而非会被忽略的文字。
- **blast radius**：`wording` | `behavior` | `structural` | `new-skill`。
- **suggested lane**：`fast`（措辞/执行，一个或少量文件） | `full`（结构性变更或新技能——交付流水线）。
- **confidence**：`high` | `medium` | `low`。

## 生命周期

结果按提案记录；文件按文件移动。提案本身不会编辑技能；落地总是通过人类门控。

需要更多细节时，本地原始 transcript 才是验证来源。绝不要通过恢复脱敏值来“丰富” pending proposal；`<path>`、`<redacted>`、`<user>`、`<company>`、`<email>`、`<url>` 这类占位符是有意设置的边界。

- **按提案**：`skill-evolution` 技能验证信号、选择通道、起草、门控（标准 + 人类）并落地或拒绝。在该提案块下直接追加 `## Outcome` 章节记录结果：决策（`landed` | `rejected`）、一行原因、以及产生的路径（落地时，两棵树中编辑的文件）。
- **按文件**：文件只有在其中每条提案都有了 `## Outcome` 时才离开 `pending/`。然后重写 `status:` 并移动文件——到 `landed/` 如果至少有一条提案落地了，否则到 `rejected/`。绝不要移动仍包含未决定提案的文件：SessionStart 钩子只统计 `pending/*.md`，过早移动会静默删除未决定提案，使其从人类视野中消失。
