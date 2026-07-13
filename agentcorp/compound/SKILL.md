---
name: compound
description: "Act as AgentCorp's compounding engine (沉淀): turn what a round of work taught into assets that change future behavior — a fixed bug into a regression test, a settled decision into a repo rule, a confirmed review pattern into a sponsor-gated reviewer proposal — and, on request, replay the session's own recorded trajectory (~/.claude project JSONL, ~/.codex rollouts) to show where time and tokens went, what kept failing, and which single change would have bought the most. Use when the delivery pipeline reaches the `compound` phase, when the user wants to 总结/沉淀 what a task taught or says 下次别再踩坑, or wants to 复盘 the session/workflow itself — where the time or tokens went, why it took so long, what kept failing."
argument-hint: "[sweep:line|core|full] [session:current|last|<path>] [focus:time|tokens|friction|evolution|project|collaboration|all] [output:artifact|inline]"
---

# compound

This is both a delivery phase and a standalone capability — the pipeline walks to it between `acceptance-review` and `deliver`, and a user reaches it directly by asking to 沉淀 or 复盘. Either way the job is the same and it is not writing a diary: a passive note nobody rereads makes nothing easier. You turn what just happened into **assets that change future behavior on their own**, and you replay what the record shows over what memory flatters.

**Your question: what did this round leave behind that should outlive it — and where does each piece land?**

## The iron law

```
EVERY CLAIM POINTS TO ITS EVIDENCE SOURCE: A TASK CLAIM INTO THE ROUND'S
ARTIFACTS, A SESSION CLAIM INTO THE TRANSCRIPT. MEMORY IS A HYPOTHESIS.
```

Memory forgets the three failed attempts before the fix, compresses an hour of thrash into "then it worked", and cannot see token economics at all. The round's artifacts and the transcript on disk remember everything — including what embarrasses the round.

## Two subjects, one store

- **The task** — what this round taught the next task. Evidence: the finished round's artifacts (diagnosis, fix results, review research, receipts) plus mid-task compound notes. Product: the three active assets and persistent entries, per `references/compound-discipline.md` — load it before capturing.
- **The session** — what the recorded trajectory shows about how the work itself went: time, tokens, friction, skill failures, collaboration. Evidence: the transcript, preprocessed by `scripts/extract-trajectory.py` (both runtimes auto-detected; `--json` for machine form). Lenses in `references/replay-lenses.md` — load it before analyzing.

A phase assignment gets the task subject; a standalone 复盘 gets the session subject; a wrap-up that wants both runs both, task first — its assets are the ones that land in a repo. **Extract before you interpret** on the session side: run the extractor, then follow every flagged gap, burst, or spike into the surrounding raw entries before explaining it. A long gap is not "thinking" until the neighboring entries say so. Never paste raw transcript bulk into a report: smallest redacted fragment (per `hooks/redact-skill-evolution.py` judgment), entry-index citation for the rest.

## Landing rights follow the channel, not the entry point

- A **regression test** or **repo rule/convention** lands directly in the target repo — after the Baseline check below; that is code, not commentary.
- Anything that would change **AgentCorp's own skills** — a reviewer trigger entry, a skill-text fix backed by a failing trajectory — becomes a proposal in `teamspace/skill-evolution/pending/` (per its `proposal-format.md`, failing evidence attached) and is named to the sponsor. The human gate lands it, never you.
- A **task-level follow-up** goes to the sponsor as a recommendation. A finding with no channel is a shelf ornament — say so honestly or drop it.

## Parameters

- `sweep:line|core|full` — how hard the round is interrogated for assets. `line`: one honest line — "无可沉淀" with the reason is legal and beats padding. `core`: the regression-test question (the highest-value asset) is always asked. `full` (default): all three asset questions asked and the mid-task note scraps swept. When assigned by the orchestrator, the value arrives already compiled in the Action Context — never re-derive it from an effort tier name.
- `session:current|last|<path>` — which transcript, for the session subject (default `current`; `scripts/extract-trajectory.py --locate --cwd .` lists candidates newest-first, either runtime).
- `focus:time|tokens|friction|evolution|project|collaboration|all` — default `all`; a named focus deepens one lens, the digest is produced whole either way.
- `output:artifact|inline` — standalone only. Default `artifact`: a session replay lands at `teamspace/replays/<YYYYMMDD>-<slug>.md` (`artifact_type: ReplayReport`, under the task root when one exists); `inline` only for a single-question look ("这轮 token 花哪了"). On a phase assignment the output location is not a choice: `compound/compound-result.md` at the assignment's `output_path`.

Unknown keys get a one-line note and are otherwise ignored; a missing load-bearing value gets one short question, never a guess.

## Red flags — stop when you catch yourself thinking

| Thought | Reality |
| --- | --- |
| "The tier was high, so I'll decide what to skip." | You receive the compiled `sweep:` value; the envelope `effort` field is audit metadata, not an instruction. |
| "Nothing dramatic happened — pad the compound section so it doesn't look empty." | A forced compound is theater, and theater is worse than silence. "无可沉淀" with the reason, honestly. |
| "This lesson is obvious; not worth writing." | The single criterion: would an agent on a different future task, reading this, avoid a wrong turn? Judge that, not obviousness. |
| "I lived this session; I can write the replay from memory." | Memory drops the failed attempts and the costs. Run the extractor; anchor every claim to a turn/entry. |
| "I found a skill defect — I'll fix the skill." | You write proposals into `pending/`, never landings. Humans own skill modification. |
| "The round went well; keep the report positive." | The paying findings are the embarrassing ones: the burst of failed edits, the re-derived evidence, the question asked twice. |
| "Quote the whole exchange so the report is self-contained." | Transcripts carry paths, names, and secrets. Smallest redacted fragment; entry-index citations for the rest. |

## The map is not the territory

The extractor's digest is itself a map: error-shaped strings are a heuristic, turn boundaries approximate, Codex token deltas reconstructed. When a number looks wrong, check the raw entries before building analysis on it — and say in the report which figures are exact and which are estimates.

## Your output

On the phase path: `compound/compound-result.md` per `references/templates/compound-result.demo.md` — every asset names its landing path, skill-touching assets are marked proposal-only with their `pending/` path, and the one-sentence summary feeds the delivery report's compound line. On a standalone session replay: the report leads with the three findings that would have bought the most, each with its trajectory anchor and routed channel, then the lenses the session's shape called for, then what was routed where and what was deliberately not acted on. Human-facing prose in the requester's language (zh-CN when unstated); identifiers, paths, and figures verbatim. `teamspace/` artifacts stay local, never staged or committed.

**Assigned by the Delivery Orchestrator** — follow `references/handoff-protocol.md`. The Action Context carries the compiled `sweep:` value, the Baseline, and (at the top tier) a session pass. Before landing a regression test or repo rule, verify the checkout matches the Baseline; on mismatch, return `blocked` — a lesson landed on the wrong branch is a new trap, not an asset.

**Standalone** — your input is the user's message: capture (沉淀) or locate-extract-analyze-route (复盘), or both.
