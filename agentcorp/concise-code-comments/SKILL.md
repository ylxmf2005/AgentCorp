---
name: concise-code-comments
description: "Use when AgentCorp writes, reviews, or fixes code comments in changed files and the comments must be concise, useful, and not over-explained. Use for inline comments, test comments, TODO/FIXME/HACK notes, file headers, method docs, delivery walkthrough comments, and review cleanup when comments are too long, obvious, AI-like, stale, or duplicating the code."
---

# Concise Code Comments

This is a reusable AgentCorp code-communication capability, not a delivery phase and not a role with its own gate. Any role that edits or reviews code may load it when comment quality affects maintainability, review clarity, or delivery polish.

The goal is comment density: short, accurate comments that explain context the code cannot show by itself. Do not turn code into prose documentation.

## Core Principles

- **Explain why, not what.** If the code already shows what happens, the comment should explain why it exists, why it is safe, or why it must not be changed.
- **Prefer short comments.** Inline comments are usually one line. Complex causal context should fit in two lines; longer comments need strong justification.
- **Add only missing context.** Useful comments name historical compatibility, external system behavior, runtime vs save-time semantics, or safety boundaries.
- **Be stricter in tests.** Test names and assertions often carry the meaning. Keep comments only when the test protects a historical bug, surprising contract, or non-obvious compatibility rule.
- **No process narration.** Do not put investigation history, PR discussion, or emotional emphasis into code comments.
- **Match local style.** Keep Chinese comments in Chinese codebases and English comments in English codebases. Do not add decorative symbols, emoji, slogan headers, or ad hoc pseudo-icons.

## Keep Comments For

- Historical data compatibility: dirty records, missing fields, old API shapes, or migration gaps.
- External contracts: another service, SDK, database, config system, or runtime has non-obvious behavior.
- Save-time vs runtime differences: for example, save-time fail-fast but runtime fail-open.
- Security and reliability boundaries: do not swallow errors, do not retry, do not write empty strings, do not change defaults.
- Temporary workarounds: TODO/FIXME/HACK must include owner, removal condition, or blocker.

## Remove Or Compress

- Comments that restate the next line.
- Comments that narrate obvious assertions in tests.
- Long requirement summaries copied into code.
- Multi-line explanations for a boolean that could be named better.
- Field lists, numeric values, or process details that will drift; refer to constants or method names instead.
- Vague comments such as "theoretically impossible", "just in case", or "important logic" without a real boundary.

## Workflow

1. Inspect the current diff first. Only touch comments changed by the current task unless the user explicitly asks for a wider comment pass.
2. For each added or changed comment, ask:
   - Would a future maintainer likely misread or break this without the comment?
   - Does it explain cause, boundary, or history rather than restating code?
   - Can it be one line, or at most two?
3. If a comment is too long, first consider whether a better variable or method name can carry the meaning.
4. After editing, reread adjacent code and ensure the comment still states only what the code or evidence supports.
5. Do not add comments for symmetry. Fewer, sharper comments are the target.

## Examples

Good:

```java
// Save-time rejects dirty configs; runtime still fail-opens to avoid missed alarms from legacy data.
validateEffectiveTime(policy);
```

Good:

```go
// Empty preset is a legacy fail-open shape; clear the group to preserve "always active" semantics.
clearEffectiveTime(monitor)
```

Poor:

```java
// This calls validateEffectiveTime to validate effectiveTimeMode, effectiveTimeCustom,
// and effectiveTimePreset so bad user input does not cause save failure or runtime errors.
validateEffectiveTime(policy);
```

Why poor: it repeats the call, lists fields that can drift, and gives a generic reason.

Poor:

```java
// ALWAYS goes through canonicalize's default preset, so response preset is non-null.
assertNotNull(vo.getEffectiveTimePreset());
```

Why poor: the assertion already says non-null. Keep it only if the non-null preset is a surprising public contract.

## AgentCorp Integration

- **Implementation Engineer / Review Fixer**: use before returning implementation or fix results when comments were added or edited.
- **Code Review Lead / Change Hygiene / Standards / Simplicity reviewers**: use to flag over-written, stale, obvious, or misleading comments.
- **Change Detailed Walker**: use for inline walkthrough comments so they explain rationale without bloating the diff.
- **Delivery Orchestrator**: may ask implementers or fixers to run this capability before the implementation gate if comments are noisy.
