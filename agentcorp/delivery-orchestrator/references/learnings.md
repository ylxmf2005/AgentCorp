# Learnings

Every finished piece of work should make the next one easier. Solving a problem the first time costs research; once captured, the next problem of the same kind is a few minutes of lookup. The pipeline's other artifacts (delivery report, research, walkthrough) all serve **this one task**; `teamspace/learnings/` is the only layer that survives across tasks — without it, every task starts from zero and the same pits get stepped in over and over.

## Storage and Shape

One lesson per file: `teamspace/learnings/<slug>.md`, with greppable frontmatter:

```yaml
---
slug: <hyphenated-english>
date: <YYYY-MM-DD>
task_id: <source task>
type: repo-trap | root-cause | process | convention
applies_when: <one line: in what situation should this come to mind>
tags: [module-name, error-keyword, domain-word]
---
```

The body is four paragraphs at most: triggering situation → root cause or fact → what to do → how to be faster next time. Short enough to read in one screen; for evidence that needs expanding, cite the artifact path of the source task rather than restate it. The sync rules for Workspace and Location are the same as for other `teamspace/` artifacts.

## What's Worth Capturing (the bar)

- A fact that was surprising or counterintuitive this time (it looked like X, the root cause was actually Y).
- A root cause found only after repeated failed fixes; a non-obvious mechanism that the diagnosis revealed.
- A repo/system-specific trap or convention that neither the repo docs nor CLAUDE.md records.
- A process lesson: a phase's artifact shape was inadequate, a reviewer type's systematic false-positive pattern, the reason a gate let something through wrongly. A lesson that points at a skill's own text is still captured as a `process` entry, and is named to the sponsor at deliver time — the right to modify a skill stays with humans.

Don't capture: one-off trivia; anything already recorded in the repo docs, CLAUDE.md, or git history; details meaningful only to this task. The single criterion: **would an agent on a different next task, reading this, avoid a wrong turn** — if not, don't write it; don't pad the list for ritual's sake.

## Dedup First, Then Write

Before you start writing, grep `teamspace/learnings/` by module, error message, and keyword. If there's heavy overlap with an existing entry (same problem, same root cause), **update the old file** and bump `last_updated`; don't create a second one — two documents describing the same problem will inevitably drift, and since the newer context is more trustworthy, fold it into the old file. Create a new file only for the same domain from a different angle, and have the two name each other.

## When to Write

- **Review at deliver wrap-up**: did this round produce any qualifying lessons? If so, write them; if not, explicitly decide not to.
- **Write mid-task too**: before a fresh-start restart (the moment lessons are most at risk — don't let them be lost with the old conversation), after review-research overturns a batch of false positives, after a non-obvious root cause is diagnosed. Write while the context is fresh, don't wait until deliver when the details are already forgotten.
- This is not a human gate: capturing is the orchestrator's housekeeping, done silently in all three modes, with one line mentioned in the conversation; respect it when the sponsor explicitly doesn't want it.

## When to Search (the reflux)

- **At the start of intake / validate-requirements**, grep `teamspace/learnings/` by task keyword (module, error message, domain word); for hits, read the frontmatter first to judge relevance, and read the body only if relevant.
- Write relevant entries into the downstream assignment's upstream context as **path + one-line summary** — `architecture`, `diagnose`, `implementation-plan`, and `review-research` benefit most. To the owner, a learning is a lead, not an instruction; whether to adopt it is for the owner to judge against the current code (an entry reflects the facts at the time it was written, and the code may have since changed).
- When fixing a bug, especially search the `root-cause` / `repo-trap` types first — a problem of the same kind may already have been solved once.
