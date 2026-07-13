# Contextual semantic unpacking

## Operational definition

A plain semantic core is not a dictionary definition, a translation candidate, or an explanation for a reader. It is a context-bound paraphrase in the **source language** that removes the linguistic packaging most likely to be transferred literally while preserving the message's truth conditions and communicative force.

A useful test is:

> Could a competent but extremely literal translator render this paraphrase correctly without knowing the original idiom, metaphor, domain convention, or euphemism?

If yes, the paraphrase is plain enough. If it introduces causes, motives, evaluations, or implications not entailed by the text, it is too interpretive.

## What to unpack

High-value candidates include:

- non-compositional idioms and phrasal verbs;
- technical conventions expressed through ordinary words;
- compressed metaphors whose literal image is not the intended claim;
- euphemisms, metonymy, and pragmatic shorthand;
- domain-specific senses that are easy to map to a common literal sense;
- discourse acts hidden inside descriptive wording, such as warnings, concessions, or requirements;
- compact scope, modality, or causal constructions that literal transfer could reverse or weaken.

Do not flag ordinary terminology merely because several translations are possible. Do not flag wording solely because a more elegant target phrase exists.

## Minimal-span rule

Select the smallest span that carries the nonliteral or convention-dependent meaning, but include particles or complements required to identify it.

- Good: `paper over`
- Too small: `paper`
- Usually too large: the entire sentence containing `paper over`

A minimal span makes the internal rewrite cheap and prevents unnecessary stylistic flattening.

## Semantic invariants

Before accepting a core, verify these dimensions when present:

1. **Participants and roles:** who acts, experiences, causes, receives, or is affected.
2. **Predicate:** the actual action, event, relation, or state.
3. **Polarity:** affirmation, negation, exception, or absence.
4. **Modality and force:** possibility, ability, permission, advice, obligation, prediction, or certainty.
5. **Scope and degree:** what a modifier or negation applies to; thresholds and intensifiers.
6. **Logic:** condition, cause, purpose, concession, comparison, and contrast.
7. **Time and aspect:** completed, ongoing, habitual, prospective, or repeated action.
8. **Pragmatic function:** instruction, warning, criticism, reassurance, or deliberate understatement when it changes the message.
9. **Reference:** entities, antecedents, technical objects, and boundaries between them.

The final target realization may be concise and idiomatic; it need not mirror the core's wording.

## Context-sensitive decision procedure

For a suspected span:

1. Read the containing sentence and the closest discourse needed to resolve it.
2. Ask what observable state of affairs would make the sentence true in this context.
3. State that condition in plain source-language words.
4. Remove imagery and convention, but retain semantic force.
5. Compare the core with plausible literal and nonliteral readings.
6. If more than one reading remains genuinely supported, keep the ambiguity or mark it for the user rather than guessing.

## Long-document behavior

Use structural chunks rather than isolated sentences. Maintain only a compact ledger containing:

- domain and audience;
- entities and referents;
- approved or already established terminology;
- voice and register;
- unresolved ambiguities.

The ledger is for consistency, not a phrase corpus. A newly encountered expression is always interpreted from its current context.

Do not perform a second full-document translation for verification. Check only the spans identified during the scan and revise the smallest affected clause.
