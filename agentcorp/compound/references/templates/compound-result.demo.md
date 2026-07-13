# Demo: compound-result (`compound/compound-result.md`)

This demo corresponds to the `compound` phase's output. Copy the shape, then replace the example values. Human-facing prose in zh-CN; frontmatter values, paths, and identifiers verbatim.

```markdown
---
artifact_type: CompoundResult
task_id: 20260603-120000-example-task
author_agent: compound
status: completed
---

# Compound 沉淀结果

## 回归测试(直接落库)

- `tests/test_export_encoding.py::test_chinese_headers` — 覆盖本单修复的导出乱码缺陷;fails-before 已在 verification/test-results/regression-tester.md 记录。
- 没有时写:无(本单未修复缺陷)。

## 规则 / 约定(直接落库)

- 目标仓 `CLAUDE.md` 新增一条:"报表导出路径统一 UTF-8,禁止依赖 locale 默认编码" — 来源 diagnosis.md 的根因。
- 没有时写:无。

## Reviewer 触发建议(仅提案,待 sponsor 批准)

- 建议给 `correctness-reviewer` 的 hunt list 增补"locale 默认编码依赖"触发词 — 本单该缺陷经两轮 review 才被发现。**未落地,已在 deliver 向 sponsor 点名。**
- 没有时写:无。

## 持久沉淀条目

- `teamspace/compound/report-builder-locale-encoding.md`(type: root-cause,新建)
- 没有时写:无可沉淀,并给一句原因(例:一行配置改动,无新知识)。
```

Self-check before delivery: every asset above names its landing path; reviewer-skill changes are proposals only (never landed without an explicit sponsor yes); an honest "无可沉淀" is written when the task genuinely yields nothing — never pad for ritual.
