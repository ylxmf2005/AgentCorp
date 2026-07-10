# Replay Lenses

Use the lenses the session's shape calls for; every observation cites its digest figure or entry index. The goal of each lens is a *change*, not a description — end each with "下次这里怎么省/怎么避".

## Time

Where did the wall-clock go? Rank turns by duration; separate agent-active time from gaps (user idle, quota waits, background tasks — classify each long gap by its neighboring entries). Look for: phases that took multiples of their peers; serial work that had no dependency (could have been parallel); waiting that a smaller cache-friendly poll or a notification would have avoided; the same file re-read many times.

## Tokens

Where did the budget go, in economic terms (output ≫ fresh-input ≫ cache-read per token)? Rank turns by output tokens; check cache hit ratio trends (a collapsing ratio marks context churn or long sleeps past the cache TTL); find re-derived work — the same evidence, search, or explanation produced twice because the first wasn't persisted or found. Subagent-heavy sessions: which fan-outs earned their cost, which duplicated the main loop's reading?

## Friction

Where did attempts repeatedly fail? Error bursts (≥3 error-shaped results in a turn) and what broke the loop; the same command failing with the same shape (a rule or missing check would have caught it turn one); permission denials and their workarounds; tool misfires (wrong tool for the job, N calls where one dedicated tool existed); edits that got re-edited immediately (anchor misses, stale reads).

## Evolution signals (→ `teamspace/skill-evolution/pending/`)

Moments where a skill's text failed the session: an instruction ambiguous enough to cause a wrong turn, a missing rule someone had to invent, a trigger that should have fired and didn't, a workaround against the skill's own guidance that worked better. Each becomes a proposal with the failing trajectory (turn/entry anchor) — never a direct skill edit from here.

## Project suggestions (→ `CLAUDE.md`/`AGENTS.md`, `teamspace/compound/`, or the sponsor)

What the session learned about the *repo*: a trap that cost time and belongs in the project docs; a convention that was derived on the fly and should be written down; a refactor or missing test the session had to work around repeatedly; documentation whose absence caused a detour.

## Collaboration

The human loop: questions asked that the repo could have answered (and the reverse — guesses that should have been questions); gates or confirmations that stalled progress versus ones that caught real errors; instructions that had to be repeated (the first phrasing didn't land — what wording would have); the moment the sponsor corrected course and what signal, earlier, would have predicted it.
