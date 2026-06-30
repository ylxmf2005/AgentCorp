---
name: explain
description: "Use when AgentCorp must explain bugs, test progress, delivery status, review findings, implementation details, plans, or technical tradeoffs to a sponsor or operator who has not read the code or artifacts. Use when the user says they do not understand, asks for a beginner-friendly explanation, or needs AgentCorp output translated into clear, zero-context language."
---

# Explain

This is a reusable AgentCorp communication capability, not a delivery phase and not a role with its own gate. Any AgentCorp role may load it when the current output must be understandable to a sponsor who has not read the code, issue, terminal output, or phase artifacts.

The goal is to preserve technical accuracy while making the explanation easy to follow. Use it for bug explanations, test progress updates, review findings, delivery reports, implementation walkthroughs, option explanations, and status updates.

## Output Mode

Treat persistence as an explicit choice:

- `output_mode: inline` — answer in the conversation only.
- `output_mode: artifact` — write the explanation into task artifacts and return a short pointer in the conversation.
- `output_mode: auto` — choose the mode yourself. This is the default when no mode is specified.

Invocation examples:

```text
/agentcorp:explain output_mode=inline explain this test failure for a sponsor
/agentcorp:explain output_mode=artifact explain review/code-review.md item by item
Use $explain with output_mode=artifact to explain verification/verification-report.md.
```

Use `inline` for one small answer, a short status update, or a single concept that fits comfortably in the conversation. Use `artifact` when the explanation has many independent points, several findings, several test results, a multi-step implementation walkthrough, or anything the sponsor will likely re-open, annotate, compare, or decide item by item. If the user asks to "落库", "write it down", "make a doc", "put it in artifacts", "方便看", or "分开写", use `artifact`.

**In `auto` mode, these conditions force `artifact` — do not answer inline:**

- The explanation contains a Mermaid diagram, or any other content a terminal cannot render. Dumping it inline ships unreadable source the sponsor never sees rendered; that does not count as delivered.
- The request is a PR, branch, diff, or whole-file walkthrough, or any multi-point set the sponsor will re-open or review item by item.

When a condition fires, write to the `explain/<topic-slug>/` path below and return only a short pointer in the conversation.

When using `artifact`, write under the current task root:

```text
explain/<topic-slug>/
├── 00-index.md
└── <number>-<short-english-slug>.md
```

If there is only one substantial explanation, write `explain/<topic-slug>.md` instead of a directory. If the task has a separate Workspace and Location, keep the same relative artifact path synced in both places, following the normal AgentCorp artifact rules. These files are collaboration artifacts, not source changes; do not commit them.

For multi-item explanations, use one file per item, similar to `review-researcher`: one finding, one test result, one design choice, or one implementation point per file. The index lists every item with a one-sentence summary and a link, so the sponsor can scan the set without reading everything at once.

Use this frontmatter for persisted explanations:

```yaml
---
artifact_type: ExplanationSet
author_agent: explain
status: completed
source_artifacts:
  - <artifact-or-file-being-explained>
---
```

For a single explanation file, use `artifact_type: Explanation`.

## Default Shape

Use this shape unless the user asks for another format:

1. **Short answer**: State the main point in one or two sentences.
2. **Background**: Explain what the system, feature, file, test, or artifact is for.
3. **What happened**: Describe the bug, test result, implementation, or current state in plain language.
4. **Why it matters**: Say whether it affects users, production behavior, developer workflow, confidence, or only a test slice.
5. **Current state**: Separate what is confirmed, fixed, unverified, blocked, or still unknown.
6. **Glossary**: Define only the technical terms needed for this explanation.

For small answers, merge sections into natural paragraphs. Do not force headings when they add clutter.

## Examples and Diagrams

Prefer concrete examples over abstract explanation. For any non-trivial bug, test result, review finding, implementation flow, or tradeoff, include at least one small example that shows what the reader would see, send, click, configure, or decide. Keep examples realistic and local to the task; do not invent broad business context that the evidence does not support.

Use Mermaid when a diagram makes the explanation easier to scan than prose. Default to a Mermaid diagram when explaining:

- A request, data, or control flow with three or more steps.
- State transitions, retries, fallbacks, gates, or failure paths.
- Ownership across roles, services, files, or artifacts.
- A decision tree or sequence of checks.

Keep diagrams compact. Use simple `flowchart`, `sequenceDiagram`, or `stateDiagram-v2` forms, label nodes in plain language, and pair the diagram with a short interpretation. Skip diagrams for tiny answers, single-cause issues, or cases where a diagram would only repeat the paragraph. If you do include a Mermaid diagram in `auto` mode, persist the explanation as an artifact (see Output Mode) — a diagram that exists only as inline terminal text does not render.

## Rules

- Assume the reader has not seen the code, diff, logs, issue, artifact, or earlier investigation.
- Lead with outcome, not chronology.
- Define necessary jargon the first time it appears.
- Summarize logs, stack traces, diffs, and test output by meaning before quoting any raw text.
- Explain cause and effect: "Because X happens, Y breaks."
- Distinguish fact, inference, and unknowns. Use phrases like "confirmed", "likely", and "not yet verified".
- Avoid confidence theater. If evidence is incomplete, say so.
- Avoid condescending words such as "simply", "obviously", "just", or "clearly".
- Prefer concrete nouns: button, endpoint, field, file, test, phase, artifact, command.
- Use analogies only when they shorten the explanation and do not distort the mechanism.
- When writing persisted explanations, make every file self-contained enough to read out of order: restate the local background, the specific point, the evidence, and the current state.

## Explaining Bugs

When explaining a bug or error:

- State what the user or system was trying to do.
- State what went wrong.
- Name the likely cause in plain language.
- Say whether it is reproduced, fixed, partially fixed, or still under investigation.
- Cite the evidence that supports the conclusion.

Example:

> The save looked successful, but the database did not change. The frontend sent `userId`, while the backend only accepts `user_id`, so the backend rejected the request. The page did not surface that rejection, which made failure look like success.

## Explaining Test Progress

When explaining testing or verification:

- Say what user journey, code branch, or risk was tested.
- State the result: passed, failed, blocked, skipped, or not run.
- If a test failed, explain what behavior the failure points to.
- Separate "tests passed for this slice" from "the whole system is safe".
- Name remaining risk and the next verification step.

Example:

> The normal login flow works in the browser. Expired-session handling was not tested, so this gives confidence in the happy path but not in timeout behavior.

## Explaining Implementations

When explaining how a feature or technical design works:

- Start with the user-visible or operational purpose.
- Name the main moving parts and what each one owns.
- Walk through the flow in order.
- Call out the key invariant or guard that must not be removed.
- Mention tradeoffs only when they affect the user's decision or review confidence.

## AgentCorp Integration

- **Delivery Orchestrator**: use for sponsor-facing status, gate summaries, and final delivery explanations.
- **Test Leader / testers**: use when reporting what a test result actually proves and what remains untested.
- **Review roles**: use when explaining findings so a sponsor can judge the issue without reading the changed code.
- **Implementation Engineer / Review Fixer**: use when explaining why a code path or fix was chosen.
- **Change Detailed Walker**: use this style for walkthrough prose when the target reader may not know the repository.
