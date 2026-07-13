---
name: semantic-core-translation
description: "Create, revise, and maintain bilingual English-Chinese documentation with an explicit source of truth and semantic-preservation workflow. Use when translating English technical documents into Chinese, updating paired `*.md` and `*_CN.md` files, deciding whether a new Chinese document needs a maintained English source, or authoring a coordinated bilingual document pair."
---

# Semantic-core translation

Treat a bilingual document as two maintained artifacts, not a literal sentence-for-sentence conversion. Preserve what the source commits to while making the target document natural for its readers.

## Choose the document contract

Establish the source of truth before writing.

1. **Existing pair:** Read both files, their links, and nearby repository conventions. Use the established source file as authoritative. If none is stated, treat the English file as source only when it is demonstrably the original or the project convention; otherwise ask rather than silently choosing.
2. **New Chinese document:** Decide whether it is Chinese-only or a maintained bilingual pair. Treat it as Chinese-only when its audience, lifecycle, and collaborators are local to Chinese. Prefer a bilingual pair when it is public, technical, cross-team, externally consumed, or likely to need English review and contribution.
3. **Unclear intent:** Ask one concise question before drafting: `这份中文文档是否需要同时维护一份英文源文档，并由它生成配套中文版本？` Do not force an English version merely because the text is Chinese.

For a bilingual pair, write or revise the canonical English document first, then create or update the Chinese localization. For Chinese-only work, write Chinese directly and do not invent an English artifact. A user may explicitly choose Chinese as the canonical source; honor that decision and translate in the requested direction.

## Maintain a bilingual pair

1. Read the source as a whole and locate the paired target. Do not infer pairing from a filename alone; confirm it from repository links, file history, or the user's instruction.
2. Preserve document structure, headings, lists, tables, links, code blocks, identifiers, commands, paths, citations, numbers, and any claims that readers may rely on.
3. Translate prose for the target audience. Keep established product names and technical terms consistent; translate explanatory prose rather than copying English words as a substitute for understanding.
4. Keep scope aligned. Add, remove, or revise the corresponding target section whenever the source changes. Do not use a bilingual update to rewrite unrelated content.
5. Compare the pair before finishing. Confirm that requirements, limitations, modality, ownership, causal direction, and warnings remain equivalent. Note intentional localization differences briefly when they matter.

## Translate meaning, not packaging

For each coherent section, silently identify only the short source spans whose literal rendering could change meaning. Rephrase those spans internally as plain source-language semantic cores, then translate the full section naturally. Use [references/semantic-core-method.md](references/semantic-core-method.md) for the detailed method and [references/semantic-core-examples.md](references/semantic-core-examples.md) for contrastive examples.

Do not expose the semantic-core pass unless the user asks for an audit. Do not turn ordinary terminology or stylistic preference into needless rewrites. Preserve real ambiguity instead of inventing a more specific claim.

## Finish with an honest status

Report the canonical source, the paired target (if any), and the files changed. Call out an unresolved source-of-truth decision, missing counterpart, or semantic ambiguity rather than presenting a partial translation as synchronized.
