# Walkthrough Artifact Format

SKILL.md covers the why; this covers the how. Load before writing the artifact.

## Form

- **HTML (default):** one self-contained file — all CSS and JS inline, no network requests, no external fonts or CDNs. Design and verify for a normal 1280–1440px desktop browser. Keep the decision spine in a vertical reading path; use tabs for peer modules or reference views when the large-change rules below call for them. Do not perform mobile screenshots, breakpoint tuning, touch optimization, or pixel-level responsive QA unless the sponsor explicitly requests mobile. Code goes in `<pre>` blocks (if a styled `<div>` is used instead, it must set `white-space: pre-wrap`). Diagrams are inline HTML/SVG with example data — simplified UI mockups, system sketches, before/after pairs; never ASCII art. Use callout boxes for key concepts, definitions, and edge cases.
- **Markdown (`output_format: md`):** the same five sections; diagrams in Mermaid (validate syntax before delivery); quiz options and answers inside collapsed `<details>` blocks so answers stay hidden until opened.
- Naming: `walkthrough/<slug>.html` under the task root, or `teamspace/walkthroughs/<YYYYMMDD>-<slug>.html` standalone. The slug names the change, not the branch.
- **Information layering:** the main reading path is the sponsor's decision model, not a lossless source rendering. When complete source coverage matters, embed or link a clearly labeled appendix after the human narrative. The appendix preserves availability; it does not justify repeating every source section above it.

## Progressive disclosure and visual attention

- **First viewport:** at a normal 1280×800 or 1440×900 desktop viewport, show the artifact name, one-sentence purpose, the key unchanged/changed model, and at least the beginning of the **Surprise Map** or next navigation surface. Keep the title to at most two visual lines and do not let typography consume the viewport. A minimal diagram may appear here when it fits; otherwise place it immediately after the Surprise Map. Do not spend the first viewport on implementation detail.
- **Concept units:** pivotal concepts are closed `<details>` units by default. A summary must contain the concept name, what it is for, and a one-sentence conclusion or consequence; the reader should know whether to expand it without opening it. A dense artifact may expose many closed summary rows for scanning, but no more than 5–8 knowledge units may be default-open; after the overview, prefer all concept units closed.
- **Expanded body:** opening a concept reveals the mechanism, example, trade-offs, failure modes, and affected behavior. Dense evidence inside it — code, SQL, DDL, full interfaces, exhaustive tables — belongs in a second nested `<details>` layer.
- **Badges versus highlights:** a badge names the impact class; it is not the highlight. Use background text highlighting such as `<mark>` for the exact short phrase the reader must remember. Each consequential expanded concept should normally contain 1–3 such highlights in its body, not only in the summary.
- **Highlight budget:** highlight only facts that change a decision, runtime result, compatibility expectation, or release action. Highlight a phrase or sentence, never an entire paragraph; color must not be the only carrier of meaning.

## Navigation model for broad changes

Before writing markup, make a coverage map with five buckets: **decision spine**, **peer modules/operations**, **cross-cutting flows**, **reference domains**, and **evidence**. Use that map to choose navigation:

- **Vertical spine:** keep key unchanged/changed behavior, the end-to-end example, cross-module invariants, accepted rulings, risks, and the quiz in reading order. These depend on sequence and must not be hidden in tabs.
- **Module atlas tabs:** when the change has three or more peer modules or operations, create one tab set so the reader can jump between them. Each tab should use the same compact contract where applicable: purpose, entry points/callers, authorization, state transition, emitted event/output, compatibility effect, and one decisive example. Omit irrelevant fields instead of filling boxes mechanically.
- **Reference Desk tabs:** constants, permission matrices, state tables, schema/DDL, routes/callers, and migration conditions are lookup material. Put each substantial reference domain in its own tab instead of stacking all tables in the narrative.
- **Depth inside tabs:** tab panels are not permission to expose everything. Use closed concept `<details>` inside a module tab, then a second evidence fold for code, SQL, or exhaustive contracts.
- **When not to use tabs:** with one or two modules, use ordinary sections. Never split a single chronological flow, prerequisite chain, before/after explanation, or one decision across tabs.
- **Interaction bar:** tab buttons must expose selected state, keyboard activation, and stable panel dimensions. Verify switching and deep links in one desktop viewport. Mobile behavior is out of scope unless requested.

A common large architecture walkthrough therefore has: **always-visible decision surface → Module Atlas tabs → cross-cutting flows → Reference Desk tabs → rulings/risks → quiz**. This is a teaching layout, not a copy of the architecture document's section tree.

## Source / Current / Target freshness

- Put a compact revision stamp near the title: exact Source revision, exact Current revision, and Target only when an approved design remains unimplemented. Do not use a vague branch label such as "working tree based on" when a commit or dirty-state marker is available.
- Phrase claims with an explicit lane when two lanes differ: `Source did ...`, `Current does ...`, `Target requires ...`. Never use `current` to mean both inspected code and approved architecture.
- Before delivery, re-run the route/caller/test searches that support every `pending`, `not implemented`, compatibility bug, or public-surface claim. If Current moved, update the Surprise Map, module tabs, risks, route tables, and quiz together.
- When Current now matches Target, collapse the two lanes and delete stale migration prose. Historical disagreement belongs in a short evidence fold, not in the present-tense decision surface.

## Section contract

1. **Background and stable contracts** — teach what already exists, then state the 5–8 important things that remain true after the change. Start where a newcomer needs to start, but do not retell the whole subsystem. The reader must know which public behavior, ownership boundary, workflow, or safety contract is intentionally unchanged before evaluating the delta.
2. **Intuition** — the essence of the change before any code. State the problem the change solves and the shape of the solution in plain language, then trace **one toy example end to end**: a concrete input, what the old code did with it, what the new code does, and why the difference is the point. Prefer a small figure with example data over prose where it is clearer.
3. **The pivotal changes, as a story** — select the few changes that alter the reader's mental model, usually 3–7. Narrate why each exists, what it enables, and what remains unchanged around it. Never file order, source-heading order, or an exhaustive field-by-field recital. For broad changes, the narrative may introduce a Module Atlas whose peer topics are tabs; the cross-module story remains outside them. For code changes, every shown hunk cites its real `path:line`; for design/plan/review walkthroughs, cite the source artifact section and show exact contracts only when they carry a decision.
4. **Behavior changes and risks** — a compact, complete account of what now behaves differently: new/changed outputs, error behavior, performance or compatibility effects, and — most valuable — interactions with pre-existing code paths the diff does not show. Write "none" for categories with none. Coverage is honest: anything in scope but not explained is listed here as explicitly not covered, with a reason.
5. **Quiz** — 5–8 multiple-choice questions, each with 3–4 options, answers hidden until the reader commits (HTML: click to reveal; md: `<details>`). Every option's reveal explains why it is right or wrong. Difficulty: substantive enough to require genuine understanding, no gotchas, no trivia.

## Architecture and plan mode

When the source is an architecture, requirements, implementation plan, or review artifact, the visible page begins with this compact decision surface:

1. **Key unchanged** — contracts and user effects that stay stable.
2. **Key changed** — only structural or behavioral changes that alter the mental model.
3. **One end-to-end example** — before and after with real example values.
4. **Why this shape** — rejected alternatives and their concrete cost.
5. **Human rulings and risks** — accepted trade-offs, unresolved decisions, release consequences.

Translate the architecture by role, not by heading:

| Architecture source | Walkthrough surface |
| --- | --- |
| Decision Summary + Unchanged Contracts | always-visible decision surface |
| Target components and owned interfaces | Module Atlas tabs |
| Changed flows and cross-component invariants | vertical cross-cutting story |
| Schema, APIs, constants, migration conditions | Reference Desk tabs |
| Compatibility, risks, non-goals, open questions | rulings/risks and quiz |
| Source references and research evidence | nested evidence folds |

For a cross-domain architecture, follow the decision surface with a tabbed Module Atlas and a separate tabbed Reference Desk. Keep schema, full interfaces, complete migration conditions, module inventories, evidence references, and source text in progressively disclosed reference views or engineering appendices. Do not claim "same information" by duplicating the source into the main narrative.

## Quiz mechanics

- Target the surprise surface: behavior that depends on pre-existing code paths, edge cases and failure modes, "trace this input" questions, and "why was shape A chosen over B". At least one question must require knowledge from the **Background** section — that is how you detect a reader who skipped it.
- Forbidden: questions answerable by skimming the diff — file names, line counts, symbol spellings, counts of anything.
- Gate: as SKILL.md's "The quiz gate" (perfect score; a correct variant after the re-read clears a miss; `approved`/`skipped` in `task.md`'s Gate History). Standalone, the artifact ends with a final "Gate outcome: approved <date> / skipped by sponsor <date>" line.

## Pre-delivery self-check — if any item hits, go back and rewrite

- The first code block appears before the reader has been taught what the surrounding system does.
- Sections 3's ordering mirrors `git diff --stat` output rather than the idea's structure.
- The visible page mirrors the source artifact's headings, or gives every touched field/method equal prominence.
- A change with three or more peer modules is rendered as one long stack even though readers need lateral lookup, or tabs are used to hide a single sequential story.
- Module tabs use unrelated layouts and omit the comparable contract dimensions that let the reader contrast modules.
- Mobile screenshots, breakpoint tuning, or touch-specific polish were performed without an explicit mobile requirement.
- More than 5–8 knowledge units are expanded or equally prominent on initial load.
- A closed concept summary is only a noun or title and does not state its purpose and one-sentence conclusion.
- Code is collapsed, but the full conceptual explanation remains continuously expanded.
- Important expanded concepts contain no precise text highlight, or highlights appear only in badges/summaries.
- Highlighting covers whole paragraphs or is so dense that the reader cannot tell what changes a decision or outcome.
- The first viewport does not make both key unchanged and key changed behavior obvious.
- At 1280×800 or 1440×900, oversized title/meta content pushes the Surprise Map and next navigation surface entirely below the first viewport.
- Source, Current, and Target claims are mixed, use vague revisions, or retain `pending`/`current bug` statements that were not rechecked after the branch moved.
- A dense appendix exists, but the main narrative still repeats most of it instead of teaching the decision.
- A shown hunk has no `path:line` anchor, or an anchor was estimated rather than taken from the diff.
- A behavior change you know about appears in neither section 4 nor the not-covered list.
- Any quiz question is answerable without reading the artifact (trivia), or none requires the Background section.
- The artifact depends on network resources, external fonts, or a renderer the sponsor may not have.
- The walkthrough was delivered inline in the terminal instead of persisted to a file.
- An unexplained in-task code (T-xx, F-xx, ST, internal artifact name) appears anywhere.
