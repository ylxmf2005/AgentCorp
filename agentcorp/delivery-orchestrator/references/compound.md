# Compound (沉淀)

Every finished piece of work should make the next one easier — but a passive note nobody rereads makes nothing easier. `compound` is the phase that turns this round's lessons into **assets that change future behavior on their own**: a bug becomes a regression test, a decision becomes a rule the next agent reads before editing, a confirmed review pattern becomes a proposal to sharpen the reviewer that missed it. It sits between `acceptance-review` and `deliver` in every paradigm, owned by the Delivery Orchestrator personally (like `deliver` and `validate-requirements`: no assignment/receipt, but a `manifest.md` entry, so whether it ran is visible).

It is a **soft phase**: being in the phase list is what makes it happen (the orchestrator walks to it naturally instead of being reminded by a buried reference), but `deliver` is never hard-gated on it — a forced compound produces theater, and theater is worse than silence. Skipping is visible (the delivery report's compound section stays empty), never policed.

## The three active assets

| Asset | Triggered by | Lands in | Automation |
| --- | --- | --- | --- |
| Regression test | a bug this task fixed or reproduced | the target repo's test suite (via the same discipline `regression-tester` holds: fails-before, passes-after) | land directly — it is part of what a fixed bug delivers |
| Rule / convention | a repo trap discovered or a convention settled this task | the target repo's `CLAUDE.md` / `AGENTS.md` | land directly |
| Reviewer trigger entry | a confirmed, reusable review-finding pattern from this task | AgentCorp's own reviewer skill — **as a proposal only**: name it to the sponsor at `deliver`; it lands only after an explicit yes (humans own skill modification) | proposal → sponsor approval → land |

A lesson that fits none of the three still gets a persistent entry (below) — but always ask first whether it can be an active asset; a note is the fallback, not the default.

## Persistent store and shape

Cross-task knowledge lives in `teamspace/compound/<slug>.md` (this store replaces `teamspace/learnings/`; migrate old entries opportunistically when you touch them). One entry per file, greppable frontmatter:

```yaml
---
slug: <hyphenated-english>
date: <YYYY-MM-DD>
task_id: <source task>
type: repo-trap | root-cause | process | convention | failed-approach
applies_when: <one line: in what situation should this come to mind>
tags: [module-name, error-keyword, domain-word]
---
```

The body is four paragraphs at most: triggering situation → root cause or fact → what to do → how to be faster next time. Short enough for one screen; for evidence that needs expanding, cite the source task's artifact path rather than restating it. Sync rules follow other `teamspace/` artifacts.

`failed-approach` is first-class: an approach that was tried and abandoned, with why. The `FAILED:` markers a fresh-start handoff carries are exactly this type — write them here before the context that knows them dies.

## What clears the bar

- A fact that was surprising or counterintuitive this time (it looked like X; the root cause was Y).
- A root cause found only after repeated failed fixes; a non-obvious mechanism the diagnosis revealed.
- A repo/system-specific trap or convention that neither the repo docs nor CLAUDE.md records.
- An approach that was tried and did not work, with the reason (`failed-approach`).
- A process lesson: a phase artifact shape that proved inadequate, a reviewer's systematic false-positive pattern, the reason a gate let something through. A lesson that points at a skill's own text becomes a **reviewer trigger entry / skill proposal** for the sponsor — never a silent skill edit.

Don't capture: one-off trivia; anything already in the repo docs, CLAUDE.md, or git history; details meaningful only to this task. The single criterion: **would an agent on a different future task, reading this, avoid a wrong turn?** If not, don't write it — and "无可沉淀" recorded honestly beats padding.

## Dedup first, then write

Before writing, grep `teamspace/compound/` by module, error message, and keyword. Heavy overlap with an existing entry (same problem, same root cause) → **update the old file** and bump `last_updated`; two documents describing the same problem will drift, and the newer context is the more trustworthy one. Create a new file only for the same domain from a genuinely different angle, and have the two name each other.

## When it runs, and at what weight

- **As a phase**: after `acceptance-review`, before `deliver`, on the deliver path only. On a reject/rework path the mid-task notes below carry the load (especially `failed-approach`).
- **Scaled to the task**: a one-line change compounds as one line — "本轮无可沉淀" in the delivery report — and moves on. A bugfix or medium task normally yields at least the regression-test question. Never let compound turn a small task heavy.
- **Mid-task notes (event-driven)**: when a compoundable moment happens — a counterintuitive root cause lands in `diagnose`, `review-research` overturns a batch of false positives, a repo trap bites, a fresh-start handoff is about to discard hard-won dead ends — jot the lightweight note **then**, while the context knows it. The `compound` phase collects these scraps into the three assets; it does not rely on end-of-task memory.

## The reflux (search side)

Capturing is half; the other half is that the next task actually reads it.

- **At the start of `intake` / `validate-requirements`**, grep `teamspace/compound/` by task keyword (module, error message, domain word); judge relevance from frontmatter, read bodies only on a hit.
- Feed relevant entries into downstream assignments as **path + one-line summary** — `architecture`, `diagnose`, `implementation-plan`, and `review-research` benefit most. To the owner a compound entry is a lead, not an instruction; it reflects the facts at capture time, and the code may have moved.
- When fixing a bug, search `root-cause` / `repo-trap` / `failed-approach` first — the same problem may already have been solved, or already have a known dead end.

## Output

Write `teamspace/tasks/<task_id>/compound/compound-result.md` per `references/templates/compound-result.demo.md` (`artifact_type: CompoundResult`, `author_agent: delivery-orchestrator`): the regression tests added, the rules written, the reviewer-trigger proposals raised (or the honest "无可沉淀"), each with its landing path. Summarize it in one sentence of the delivery report and the final sponsor reply — e.g. "本轮沉淀:加了 1 条回归测试,给目标仓 CLAUDE.md 加了 1 条规则,有 1 条 reviewer 触发词建议待你确认。"
