# Fresh Start Handoff

Use this capability when the current conversation or working tree might contaminate the work that follows: a long multi-turn debugging/refactoring session, the same underlying problem that won't stay fixed despite repeated attempts, requirements scattered across many turns or changed midstream, early architectural assumptions overturned, a working tree littered with cross-module exploratory uncommitted changes, or the sponsor saying "start over / new session / the context is a mess." The goal is not to summarize everything but to judge whether the current thread has become a liability, and — with the sponsor's agreement — produce a clean handoff prompt that lets a new session (or a new subagent assignment) avoid inheriting the contamination.

Core move: turn the scattered context into a self-contained source-of-truth prompt, while isolating and clearly marking the exploration, failed attempts, and stale assumptions, rather than continuing to write them up as narrative.

## When to Trigger (scoring guide)

Do a quick check at natural phase boundaries: before a big refactor, after repeated failed debugging, before committing, after a requirements change, when the conversation starts getting long and stale.

- +3: the sponsor explicitly or implicitly says "start over," "new session," "handoff," or "the context is a mess."
- +3: the same underlying problem has failed to be fixed two or more times in a row.
- +3: you discover that an early architectural assumption or diagnosis was wrong.
- +2: requirements only came together across many turns, or were changed after implementation began.
- +2: the next step depends on remembering several early constraints or exceptions.
- +2: the working tree has cross-module exploratory uncommitted changes.
- +2: the work is shifting from exploration/debugging into a clean implementation phase.
- +1: the conversation contains contradictory conclusions, bloated post-mortems, or "stop doing X" corrections.
- +1: verification results are mixed, stale, or unclear.

≥3 points: pause and consult; ≥5 points: strongly recommend a restart. Don't interrupt for a small one-step change, when the context is still clean, or when the sponsor just declined and the risk hasn't materially increased.

## Consult (this is a human gate)

If the sponsor explicitly wants a handoff prompt, just write it; otherwise ask only once, with one concrete reason, offering: A) prompt only; B) a git isolation plan + prompt; C) stay in the current session and continue. If they choose C, continue the original task and don't ask again unless the risk escalates. Never decide on a restart for the sponsor; without the sponsor's explicit approval, never discard, reset, stash, commit, or branch their work.

## Producing the Handoff Prompt

Before you start writing, capture the round's qualifying lessons into `teamspace/compound/` as event-driven compound notes, `failed-approach` entries first (see `references/compound.md`) — a restart should drop only the contaminated conversation, not the lessons along with it.

1. **Take stock of the current truth.** Trust the source, the tests, `git status`, the diff, the logs, and the sponsor's explicit instructions, not the conversation's memory; if you can query the repo, query first and write second, and if you can't, state the unknowns honestly.
2. **Bucket the information.** Goal / definition of done / verified facts (with evidence) / relevant files and entry points / accepted constraints and decisions / failed attempts (as lessons and no-go zones, not a starting point to continue from) / suspect or unverified assumptions / working-tree state.
3. **Set the working-tree stance.** Where new work starts, one of four: a clean baseline branch (exploratory work archived as read-only reference); the current dirty tree (uncommitted changes treated as candidate work, not verified fact); a checkpoint branch; an archive kept only as historical reference.
4. **Write the prompt and hand it straight to the sponsor.** Use the skeleton below, deleting the sections that don't apply, but keeping the source-of-truth and anti-contamination wording; put it in a fenced markdown block so the sponsor can copy it immediately, not buried under a long post-mortem.

```markdown
You are starting from scratch and rely on no prior conversation. Treat this prompt and the current repo state as the single source of truth; where the two conflict, trust the repo and the tests, and report the discrepancy before changing code.

## Goal
## Definition of Done (observable success criteria, the tests/builds/manual checks that must pass)
## Working-Tree Stance (one of four, with the corresponding branch/archive location)
## Relevant Files and Entry Points (path + why it's relevant)
## Commands and Verification
## Verified Facts (VERIFIED: fact — evidence: file/test/log/sponsor instruction)
## Accepted Constraints and Decisions (ACCEPTED: …)
## Failed Attempts, Don't Blindly Repeat (FAILED: approach — evidence — lesson)
## Suspect/Unverified Assumptions (UNVERIFIED: assumption — how to verify)
## Suggested Path (confirm facts first, then minimal change, then run verification; if verification fails, revise per evidence rather than per old assumptions)
## Guardrails (ask before destructive git operations, large rewrites, dependency upgrades, migrations, file deletions; don't reuse failed code unless you can explain why the failure no longer applies; when context is missing, ask a targeted question rather than guess)
```

## Common Mistakes

- Don't write a "what happened in the chat" running account.
- Don't pass failed code downstream as a starting point unless it's been archived and clearly labeled.
- Don't write something unverified as "we know X."
- Don't mix an old workaround and the new plan into the same instruction.
- Don't let the new session unknowingly inherit a dirty working tree — either explain it clearly or recommend isolation.
- Don't list every file you touched, only the ones that might be relevant to the next attempt; cover the working-tree state separately.
