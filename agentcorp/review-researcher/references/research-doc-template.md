# Review Research Folder Skeleton

`review-researcher` produces a folder: one index + one research file per issue. Below are the skeletons for both; when assembling, copy the structure and replace the content with the current issue.

These files are the **human gate**: a person reads only this one file and then decides "fix or not, and according to whose account." So every file must be self-contained — the reader has not seen the diff, has not seen any review artifact, and recognizes none of the in-task codes.

Verdict values: **confirmed / false-positive / partial / needs-human**.

---

## Index: `00-index.md`

Fixed row order: those to fix first (confirmed, partial, ordered P0→P1→P2), needs-human next, **false positives at the bottom**. Leave the "human decision" column empty for a person to fill.

```markdown
# Review Research Index

This round has N issues in total. The verdict column tells you which need fixing and which are noise; click a link for the full research on a single problem; please fill in the "human decision" column after reading.

| ID | Severity | One sentence | Verdict | Suggested fix | Human decision | Details |
| --- | --- | --- | --- | --- | --- | --- |
| F-01 | P0 | <one sentence stating clearly what this problem is> | Confirmed | <one-sentence fix> | | [details](F-01-confirmed-<slug>.md) |
| F-04 | P2 | <one sentence> | Partial | <corrected one-sentence fix> | | [details](F-04-partial-<slug>.md) |
| F-05 | P1 | <one sentence> | Needs-human | needs <who> to decide <what> | | [details](F-05-needs-human-<slug>.md) |
| F-03 | P1 | <one sentence> | **False positive · no fix needed** | —— | | [details](F-03-false-positive-<slug>.md) |

Summary: X confirmed, Y partial (these two categories go to review-fixer to land after the human decision), W needs-human, Z false positives.
```

---

## Single issue: `<id>-<verdict>-<slug>.md`

The verdict segment in the file name is in English: `confirmed` / `partial` / `false-positive` / `needs-human` — so the file list separates what needs fixing from the noise. The verdict must appear in all three places: the file name, the title, and the first sentence.

```markdown
---
artifact_type: ReviewResearchNote
task_id: <task_id>
author_agent: review-researcher
finding_id: <id>
verdict: <confirmed/false-positive/partial/needs-human>
severity: <P0/P1/P2>
status: completed
---

# <id> [Confirmed · P0] <one-sentence title>

<!-- Write the title verdict tag per the actual verdict: [Confirmed · P0] / [Partial · P2] / [False positive · no fix needed] / [Needs-human] -->

**One sentence**: verdict **<confirmed/false-positive/partial/needs-human>** · <what it is and why it is (or is not) a problem to fix, said in one or two plain sentences>

## Human decision

<!-- This section is left for a person to annotate: build the skeleton only, never check or fill it in for the human -->
- [ ] Agree with the verdict and suggested fix
- [ ] Disagree / partially accept (see annotations)
- Annotations:

## Background
<The reader has not seen the diff, has not seen any review artifact. Answer three things first: what this code/this table/this flow
**is**, **who uses it / when it is triggered**, and **what is supposed to happen on the normal path** —
then move into the problem itself.
This paragraph is the foundation for all the causality that follows; no detailed argument may appear before it.>

## Code context
<The files, functions, and line numbers involved; how the call chain runs (who calls whom, stated in prose);
in particular, point out whether there is a relevant permission/validation gate, an earlier assertion, or a type or invariant guarantee upstream.
Paste and explain code snippets for key evidence — the reader has no repo at hand, so throwing only file:line is the same as giving no evidence.>

## The finding's original account
<How the reviewer originally described this problem and the fix they suggested. Restate it in full in your own words (the reader has not seen the review artifact), so it can be compared against your verdict.>

## My verification and verdict
<The conclusion reached after reading the real code, which must be evidence-backed:
- Confirmed: walk the failure path "input → branch → lands on this line → wrong result" and show it really happens.
- False positive: point out which piece of evidence overturns it — e.g. some upstream gate (a permission check / earlier raise / type guarantee) makes the condition impossible,
  or it collides with a documented intentional design, or the root cause is actually in the frontend.
- Partial: there is a real problem, but state where the original finding's mechanism/severity/suggested fix is wrong, and give the corrected, correct description.
- Needs-human: the verdict depends on context not in the repo (external systems / runtime configuration / product intent); write down clearly what is still missing.>

## Root cause (when confirmed / partial)
<Tell the causal chain through: exactly why it goes wrong. If some layer's fallback should have caught it but did not, explain why.>

## Impact / blast radius (when confirmed / partial)
<How badly it breaks, who is affected, and which category it falls into: data corruption / leakage / resource leak / hang / ….>

## Suggested fix (when confirmed / partial)
<A root-cause-level, minimal, elegant fix that conforms to existing layering and conventions. Give the direction and the key change points (paste a before/after snippet when needed).
If the fix suggested by the original finding is an ugly patch or fails to cure the root cause, state clearly where it is ugly and why this version is cleaner.
This is a suggestion for review-fixer to land; this role does not touch product code.>

## Prevention / recurrence check
<How to avoid it in the future; what "would-fail-before-the-fix" regression check to add; whether recurrence can be blocked at the structural level (types/enums/locks/invariants).>

## Related
<Related issues, related artifacts, or upstream findings — every referenced ID gets one sentence explaining what it is; if there are none, write "none".>
```

---

### Pre-delivery self-check

Run this over every file before delivery; if it hits any item, go back and rewrite:

- the skeleton does not match the template, or the "Background" section is missing;
- an unexplained in-task code appears (T-xx, F-xx, ST, internal artifact name, etc.);
- a key assertion has only `file:line` with no code snippet pasted;
- the verdict does not appear in all three of the file name, title, and first sentence;
- the "Human decision" block is missing, or content was checked/filled in for the human;
- a false positive / partial does not state clearly "why this is not (or not entirely) a problem to change."
