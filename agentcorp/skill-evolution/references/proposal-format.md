# Skill Evolution Proposal — format

The `session-end-capture` hook (registered as a `SessionEnd` hook) writes one file per session into `teamspace/skill-evolution/pending/<ts>-<session>.md`, containing zero or more proposals. If a session yields nothing, no file is written (the analyzer emits `NO_PROPOSALS`). The authoritative emitter of this shape is the plugin-root prompt `hooks/skill-evolution-analyze.md`; this file documents it for the consumer — any schema change must edit both, in the same landing.

## Frontmatter

- `artifact_type: SkillEvolutionProposal`
- `session_id: <id>`
- `status: pending` — rewrite to `landed` or `rejected` when the file leaves `pending/` (see Lifecycle).

## Each proposal block

- **target**: an existing skill name (e.g. `delivery-orchestrator`) or `NEW: <topic>` for a skill to build.
- **trigger**: `user-noticed` | `agent-trial-and-error` | `external-research`.
- **signal**: concrete, privacy-minimized evidence from the session — what actually happened. Redact secrets, absolute personal paths, identities, email addresses, and private URLs; quote only the smallest useful fragment.
- **proposed change**: a concrete edit, or research to run; prefer enforcement/structure over prose that will be ignored.
- **blast radius**: `wording` | `behavior` | `structural` | `new-skill`.
- **suggested lane**: `fast` (wording/enforcement, one or a few files) | `full` (structural change or new skill — delivery pipeline).
- **confidence**: `high` | `medium` | `low`.

## Lifecycle

Outcomes are recorded per proposal; the file moves per file. Proposals never edit a skill on their own; landing always passes a human gate.

The original local transcript is the verification source when more detail is needed. Never enrich the pending proposal by restoring redacted values; placeholders such as `<path>`, `<redacted>`, `<user>`, `<company>`, `<email>`, and `<url>` are intentional boundaries.

- **Per proposal**: the `skill-evolution` skill verifies the signal, picks a lane, drafts, gates (standards + human), and lands or rejects. Record the result by appending an `## Outcome` section directly under that proposal's block: the decision (`landed` | `rejected`), a one-line reason, and the resulting paths (for a landing, the edited files in both trees).
- **Per file**: a file leaves `pending/` only when every proposal in it has an `## Outcome`. Then rewrite `status:` and move the file — to `landed/` if at least one proposal landed, otherwise to `rejected/`. Never move a file that still contains an undecided proposal: the SessionStart hook counts only `pending/*.md`, so moving early silently deletes the undecided proposals from the human's view.
