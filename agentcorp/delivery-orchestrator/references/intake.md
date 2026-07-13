# Local Triage Reference

Use this reference when incoming work arrives as an issue, bug report, user feedback, or vague request that needs to be assigned out.

## Intake Principles

Read the whole batch before assigning any single item. Preserve the reporter's observations and add classification metadata, rather than rewriting the report into your own theory. Classify by user impact and technical severity, not by the reporter's seniority or by recency. Merge duplicates before assigning, to avoid producing conflicting implementation work. A work item that's assigned out must be self-contained, so the next agent can start without reading unrelated threads.

## Classification

| Issue signal | Type | Paradigm |
| --- | --- | --- |
| Used to work, now broken | `bugfix` | `bugfix/hypothesis-driven` |
| Doesn't match documented or expected behavior | `bugfix` | `bugfix/hypothesis-driven` |
| Crash, data loss, or security vulnerability | `bugfix` | `bugfix/hypothesis-driven` |
| User wants a capability that doesn't yet exist | `enhancement` | `enhancement/delta-design` |
| User wants existing behavior to work a different way | `enhancement` | `enhancement/delta-design` |
| Small isolated capability that doesn't change interfaces | `addition` | `addition/simple` |
| Brand-new system or significant subsystem | `greenfield` | `dev/architecture-first` |

When an issue is a design dispute, a question, or depends on domain expertise you don't have, escalate rather than force-classify it.

## Deduplication

Strong duplicate signals: identical reproduction steps; the same error message occurring on the same surface; the same failure on the same page, endpoint, command, or workflow; one report being a subset of another. When merging, keep the clearest title, the most complete reproduction, the highest severity, and all source issue IDs.

Dedup against the past, not just the batch: grep `teamspace/compound/` by module, error message, and domain word (entries are self-describing — judge relevance from `applies_when`/`tags` frontmatter). A hit may mean the problem was already solved, already has a known dead end, or carries an invariant the fix must not break; feed relevant entries into the downstream assignment as path + one-line summary.

## Priority

| Priority | Meaning |
| --- | --- |
| P0 | Production unusable for many users, data loss, or an active security breach. Requires sponsor confirmation. |
| P1 | Major user impact or no workaround. Requires sponsor confirmation. |
| P2 | A real problem with a workaround, or a meaningful functional gap. |
| P3 | Minor friction, a cosmetic issue, or a backlog improvement. |

Raise priority for regressions, blockers, security issues, and data loss. Give a one-sentence rationale for every priority.

## Work Item Shape

Follow `references/templates/work-item.demo.md`.
