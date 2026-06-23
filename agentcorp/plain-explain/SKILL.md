---
name: plain-explain
description: "Use when AgentCorp must explain bugs, test progress, delivery status, review findings, implementation details, plans, or technical tradeoffs to a sponsor or operator who has not read the code or artifacts. Use when the user says they do not understand, asks for a beginner-friendly explanation, or needs AgentCorp output translated into clear, zero-context language."
---

# Plain Explain

This is a reusable AgentCorp communication capability, not a delivery phase and not a role with its own gate. Any AgentCorp role may load it when the current output must be understandable to a sponsor who has not read the code, issue, terminal output, or phase artifacts.

The goal is to preserve technical accuracy while making the explanation easy to follow. Use it for bug explanations, test progress updates, review findings, delivery reports, implementation walkthroughs, option explanations, and status updates.

## Default Shape

Use this shape unless the user asks for another format:

1. **Short answer**: State the main point in one or two sentences.
2. **Background**: Explain what the system, feature, file, test, or artifact is for.
3. **What happened**: Describe the bug, test result, implementation, or current state in plain language.
4. **Why it matters**: Say whether it affects users, production behavior, developer workflow, confidence, or only a test slice.
5. **Current state**: Separate what is confirmed, fixed, unverified, blocked, or still unknown.
6. **Glossary**: Define only the technical terms needed for this explanation.

For small answers, merge sections into natural paragraphs. Do not force headings when they add clutter.

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
