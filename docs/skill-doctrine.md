# AgentCorp Skill Rewrite Doctrine (FINAL)

Binding contract for every rewritten skill. Deviate only with a stated reason in the
rewrite note. Written by Fable; grounded in direct reading, the superpowers study, and
the corpus audit.

## 0. What we are fixing (one line each)

- Closed hunt-lists + "hand to siblings" lists read as exhaustive fences; no license to
  report real problems outside them; harmful when run standalone (no sibling exists).
- 7–9 decorative sibling mentions per specialist (~10–25 lines) with zero runtime effect.
- ~25–30% internal self-repetition (iron law ↔ red flags ↔ self-check restating).
- Always-required content (finding-set shape) buried in references; identical
  handoff/template copies duplicated ~20× with drift.
- Descriptions summarize workflow (eval-proven to make agents skip the body).
- Compliance posture toward upstream/user ("names and paths count as sufficient")
  instead of judgment posture (the map may be wrong).

## 1. The question, not the list (scope architecture)

Every judgment role opens by stating THE QUESTION it answers (one sentence, bold).
Scope = anything that answers that question.

- The hunt-list becomes **"Where the answer usually hides"** — introduced explicitly as
  a map, not a fence: "These are the classic places, not the limit of your sight."
- License clause, its own conditional (no nuance clause bolted onto other rules):
  "If you find a real problem your question owns that no bullet names, report it the
  same way — concrete evidence, severity, confidence."
- Out-of-domain sightings: positive slot, not prohibition — the finding-set template
  gets an optional **"Sightings for other lanes"** section (one line each). SKILL.md
  says only: "A real problem outside your question goes there as one line — never
  developed, never dropped." No sibling territory descriptions anywhere.
- Delete every "Boundaries with the other reviewers" section and every downstream
  machinery explanation (review-researcher/review-fixer/lead reconciliation). The ONLY
  allowed cross-skill lines are functional: (a) input it consumes (path), (b) "When the
  request is actually X, use <skill> instead" one-liners where misrouting is a real
  failure, (c) orchestrator/lead rosters (their routing IS their job).

## 2. Match the form to the failure

- Discipline points (evidence honesty, self-approval ban, silent-fallback ban, gate
  integrity): iron law in a fenced block, ONE bright line; red-flags table of REAL
  rationalizations (4–6 rows); no soft "prefer/consider".
- Output shape: positive recipe — what the artifact IS, its parts, in order. Never
  prohibition lists about what not to write.
- Omittable elements: REQUIRED fields in the .demo.md template, not prose reminders.
  (Severity/confidence/residual-risks/sightings live in the template.)
- Conditional behavior: keyed to observable predicates.
  Canonical: "Your input is an assignment file under handoffs/ → pipeline contract
  (read references/handoff-protocol.md now). Otherwise → standalone contract."
- No nuance clauses; no exemption clauses — restructure instead.

## 3. Judgment posture (field-guide alignment)

Every role gets a short **"The map is not the territory"** stance (2–4 lines, worded
per role, not stamped):
- Upstream artifacts, requirements, and the sponsor's own framing may be wrong.
  When territory contradicts map, surface it — as a finding if your question owns it,
  as a sighting otherwise. Never silently implement what you believe is wrong; never
  silently "fix" it either.
- Proactivity: you may propose a better shape than what was asked — priced, as
  reaction material; the sponsor decides (generalizes brainstorm's iron law).
- Chase what you can check yourself (the diff is not your reading boundary — keep);
  ask only what the repo cannot answer.

## 4. Structure per skill (target shape; adapt per family)

Specialist reviewers (~55–75 lines):
1. Frontmatter — description = triggers + minimal identity, NO workflow summary.
2. Identity ¶ — who + THE QUESTION + why this pass exists (fold why-you-exist; ≤8 lines).
3. Iron law — fenced, one line, only if genuinely disciplinary.
4. Where the answer usually hides — map-not-fence bullets, concrete, example-rich;
   restore wrongly-excluded aspects (per-skill notes below).
5. Judgment — confidence bands compact (3 lines), evidence discipline, severity keyed
   to the role's cost model.
6. The map is not the territory — 2–4 lines.
7. Red flags — 4–6 rows, real rationalizations only.
8. Output — positive recipe + "shape: references/templates/finding-set.demo.md";
   standalone/pipeline conditional (pipeline branch = the ONLY place that mentions
   handoff-protocol.md, receipts, zh-CN artifacts, teamspace rules — ≤6 lines).
Kill: self-contained declarations, boundaries sections, downstream explanations,
self-check items restating rules (keep ≤4 mechanical-only checklist items IF the role
has forgettable mechanics; else delete section), Operating-rules block (fold the 2
load-bearing lines into the pipeline branch), "Running as parallel lenses" (lead owns
fan-out), per-skill mermaid sections (one line where genuinely useful).

Leads/orchestrator (~90–120): keep rosters/routing (functional), same treatments.
Capabilities (brainstorm/probe/explain/walkthrough) (~70–100): keep their strong cores;
same de-repetition; keep "not a phase, not a gate" line (convention).
Executors/testers (~60–90): same pattern; recipes for artifacts.

## 5. Token economy

- One rule, one home. If it's the iron law it is not also a red-flag row and a
  self-check item. Red-flag rows must not restate rules already stated — they carry
  the *rationalization*, the reality cell may reference the rule in ≤1 clause.
- Assume the agent is smart; delete throat-clearing ("This is not distrust of you…").
- One excellent example beats three good ones. One term per concept
  (sponsor/assignment/finding/artifact — keep corpus vocabulary stable).
- References one level deep; >100-line reference gets a TOC.
- If the validator or a template can enforce it, don't prose it.

## 6. Shared-text architecture

- handoff-protocol.md + phase-assignment/phase-receipt demos: regenerate ALL per-skill
  copies from canonical masters (new: `tools/shared-references/`), byte-identical
  except the skill-name line; add `tools/sync-shared-refs.py --check` so drift becomes
  mechanically checkable. Per-skill copies stay (plugin standalone-install constraint).
- finding-set.demo.md stays per-skill and CUSTOMIZED — it is the structural-slot
  carrier (role fields, Sightings section, Residual risks).
- Confidence bands: same 3-line compact text in every specialist (self-containment
  beats deduplication here; it's small).

## 7. Hard constraints (unchanged)

- Validator: name==dir; description has trigger language, ≤1024; openai.yaml
  short_description 25–64 chars, default_prompt mentions $<name>.
- Dual-tree line-for-line ZH mirror; ZH keeps EN terms (agent/skill/gate/phase/handoff/
  sponsor/artifact/review/hunk); ZH description needs 当…时使用.
- Gate enum approved|skipped|revised|blocked. Capability skills: "not a delivery
  phase, not a role with its own gate." Artifact contracts (artifact_type PascalCase,
  task_id format, validate-handoff.py status enums, 00-index.md) unchanged.
- Router row per skill; README/README_CN catalogs updated.

## 8. Per-skill scope restorations (from audit + user)

- taste-reviewer: "taste" widened beyond hack-vs-shape — naming that misnames the
  concept (already partial), API feel/ergonomics of touched surfaces, proportionality
  (solution weight vs problem weight), idiomatic fit. Keep priced-honest-shape law.
- adversarial-reviewer: "adversarial" = hostile stress mindset broadly; four classes
  become the map, not the mandate.
- explain: audience-adaptive depth (expert sponsor vs newcomer), not only zero-context.
- Other roles: audit shows tight fits; widen only where the name genuinely promises
  more (check remaining batches).

## 8b. Audit integration (all 35 skills audited; key deltas)

- Functional-vs-decorative confirmed corpus-wide: outside orchestrator/leads (whose
  rosters are functional), nearly every sibling mention is decorative. Keep only:
  orchestrator dispatch line (as the pipeline-branch conditional), consumed input paths
  (e.g. api-contract-reviewer ← api-contract-tester evidence), genuine redirects
  (explain→walkthrough, probe→parallel-researcher, brainstorm→probe,
  api-contract-tester→api-contract-reviewer for schema-diff verdicts,
  comment-optimizer→standards-reviewer referral), and skill-evolution/orchestrator lanes.
- Good existing patterns to keep/propagate: probe's non-exhaustive skeleton clause;
  brainstorm's pick-what-fits lens framing; steward's routing enum (template-enforceable);
  standards' template-enforced iron-law fields; explain's "shape optional" framing.
- Name/scope fixes (keep names, fix content+description): taste widen (naming-as-concept,
  API feel/ergonomics, proportionality, idiom); adversarial: 4 classes become map not
  mandate; explain widen to audience-adaptive (default zero-context sponsor);
  walkthrough description must signal the quiz gate; parallel-researcher description
  signals general evidence work (parallel = technique); review-researcher description
  signals verdict+fix-suggestion duties; test-planner description signals
  testing-context stewardship; skill-evolution description = landing end only.
- Inline↔reference inversions to fix per audit: walkthrough/probe section lists
  duplicated with their templates (thin to pointer); review-researcher responsibilities
  vs research-doc-template (dedupe); comment-optimizer examples → reference;
  code-review-lead/plan-review-lead convene catalogs → mostly to reference;
  explain output-mode mechanics compress; regression blast-radius duplicated verbatim
  SKILL↔regression.md (keep one); e2e "trustworthy handoff" restates user-flow-testing.
- authenticated-browser-session: mostly unique operational content — light touch only
  (dedupe credential rule ~6x→2, trim troubleshooting), keep scripts as-is.
- delivery-orchestrator: SKILL.md de-repetition (~25-30%) + Sponsor Navigation/Evidence
  Delivery compression; references/workflow.md content NOT rewritten this pass (only
  touched if contracts change).

## 8c. Fan-out assignments (Fable forks; forks inherit this context)

- F1 specialist reviewers A: correctness, security, performance, reliability
- F2 specialist reviewers B: simplicity, standards, adversarial, api-contract-reviewer
- F3 specialist reviewers C: comment, project-steward, change-hygiene (+ their refs)
- F4 verdict roles: code-review-lead, plan-review-lead, acceptance-review-lead,
  test-leader, test-plan-reviewer
- F5 build chain: solution-architect, implementation-planner, implementation-engineer,
  review-researcher, review-fixer
- F6 testers: test-planner, api-contract-tester, e2e-tester, regression-tester
- F7 capabilities: probe, brainstorm, explain, walkthrough,
  authenticated-browser-session
- F8 support: precommit-setup, parallel-researcher,
  skill-evolution, delivery-orchestrator (SKILL.md only + targeted ref fixes)
- Exemplar (by main session): taste-reviewer.
Each fork: rewrite SKILL.md per doctrine + exemplar; update its templates (add
required-field slots incl. "Sightings for other lanes" where the role emits findings);
fix inline↔reference inversions; update openai.yaml short_description if the widened
scope demands; rewrite frontmatter description per S1; do NOT touch
handoff-protocol.md / phase-assignment / phase-receipt (regenerated centrally); leave
agentcorp-zh alone (translated later); keep gate/status enums and artifact contracts
exactly; run nothing destructive. Return per-skill rewrite notes.

## 9. Coherence rules (added 2026-07-09; govern cross-skill edits)

- **Coordinators do not re-teach worker discipline.** Every worker's iron law already
  structurally prevents "claims done, no artifact" / "status without a body". A
  coordinator (orchestrator, leads, test-leader) keeps at most ONE home for that
  defense-in-depth (its iron law or one trap row); its body centers on the failure
  mode only IT can commit — insufficient coverage, wrong routing, headcount-as-proof,
  self-approval. Repeatedly stressing a structurally-prevented failure is noise.
- **Cross-references must be load-bearing, and bidirectional when a duty is claimed.**
  A skill may name another only when the mention changes runtime behavior (consumed
  input path, genuine redirect, roster row, escalation lane). If skill A claims "role
  B uses me before handoff", role B's own text must say so — otherwise the claim is
  decorative and gets deleted or wired. One-way arrows are honest bookkeeping: they
  mean the target consumes assignments without needing to know the caller. Current
  wired pairs: probe→parallel-researcher, brainstorm→probe/parallel-researcher,
  brainstorm↔grill, grill→adversarial-reviewer↔grill (live interrogation vs written
  finding set), explain↔walkthrough, solution-architect→parallel-researcher,
  solution-architect↔api-contract-reviewer/api-contract-tester (interface-contract is
  a named required input on both ends), review-researcher→parallel-researcher
  (needs-human research lane), implementation-engineer/review-fixer→comment-optimizer,
  testers→authenticated-browser-session, compound→skill-evolution (skill-touching
  findings route as `pending/` proposals; only tests and repo rules land directly).
- **The orchestrator's "How this organization thinks" is a maintained mirror.** When
  a lane's iron law changes, or a lane is added/renamed/removed, that maxim list (and
  the leads' rosters, workflow.md's Runtime Routing lists, router, READMEs, and the
  KNOWN_AGENTS/KNOWN_PHASES/KNOWN_ARTIFACT_TYPES ledgers in
  `agentcorp/delivery-orchestrator/scripts/validate-handoff.py`) updates in the same
  landing — a stale roster name is a routing bug, not cosmetics.

## 10. Evolution rules (added 2026-07-09; govern how the corpus improves)

Distilled from the optimization research (GEPA/ACE/skill-creator/superpowers) and the
first behavioral-simulation round; the full playbook lives with the sponsor's records.

- **No failing trajectory, no edit.** Every behavior-changing proposal cites a concrete
  failed run (simulated or real usage), the gate/phase where it broke, and whether the
  fault is trigger wording (description/router), a SKILL.md body rule, or a cross-skill
  contract — the attribution decides which file changes. Wording polish with no
  trajectory is rejected; it spends review bandwidth and buys no behavior.
- **Local deltas only; never whole-file rewrites.** A rewrite-shaped edit (diff larger
  than ~30% of the target file) is split or redesigned; wholesale regeneration loses
  the hard boundary details (enums, floors, filename contracts) that carry the value.
  The dual-tree variant of this trap: rewriting one tree and "translating" to the
  other is a lossy rewrite of the mirror.
- **Deterministic checks precede judged checks.** Contract-layer defects (paths, enums,
  types, one-way references) are fixed mechanically and guarded by
  `tools/test-validate-handoff.py` + the validators; simulation budget is spent only on
  behavior questions no script can answer.
- **Trigger changes are global routing changes.** Descriptions and router rows compete;
  any change reruns `scenarios/routing-probes.md` against the whole table — a row
  sharpened in isolation steals or loses its neighbors' traffic.
- **Golden scenarios guard landings.** `scenarios/` holds the replayable set; an edit
  claims its target scenario turns green AND the edited skill's wired partners (per the
  pairs list above) stay green. S3/S6 (must stay low-effort) and S8 (must stay high-effort) are
  the weight-calibration pair — never optimize one direction only.
- **Parameters follow one convention.** `key:value` tokens parsed by the skill body +
  natural-language synonyms + one-question fallback when a load-bearing value is
  missing; booleans become binary enums; defaults sit at the maximum-effort end;
  argument-hint (Claude) and openai.yaml default_prompt (Codex) are the two hint
  surfaces and update together.
- **Human-facing language follows the sponsor.** The orchestrator records the sponsor's
  working language at intake and threads it as the assignment's `output_language`;
  skills never hardcode an output language (zh-CN is only the unstated-default).

## 11. Process for the rewrite

- Fable writes EN. Exemplars first (taste-reviewer, correctness-reviewer as specialist
  pattern; probe as capability pattern), then Fable forks fan out by family with
  DOCTRINE.md + exemplar as contract. Opus does mechanical work only (sync script runs,
  ZH translation, catalog counts).
- Every skill gets a one-paragraph rewrite note (what changed, what was deliberately
  kept) accumulated into the final report.
- Validate: validate-skills.py, sync-shared-refs.py --check, EN↔ZH file-set diff,
  router/README reconciliation.
