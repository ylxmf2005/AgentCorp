# Research method: split lanes, choose sources, parallelize, synthesize

This file is `parallel-researcher`'s execution manual: how to split a research question into lanes, which sources each lane goes to, how to dispatch in parallel, and what to check during synthesis. SKILL.md covers the why; this covers the how.

## Research types and splitting

Choose the research type first, then split lanes. Do not put several researchers on the same broad question — when lanes have no independent question and source strategy of their own, what comes back is several near-identical, vague surveys.

- Technology selection / SOTA: official docs, release notes, standards/RFCs, upstream issues/PRs, mainstream implementations, benchmarks, migration/deprecation information.
- Open-source project scan: GitHub/GitLab repos, README, docs, examples, issues, discussions, release/changelog, stars/forks/activity, license, maintenance pace.
- Papers / academic: arXiv, Google Scholar, Semantic Scholar, OpenAlex, Crossref, ACM/IEEE/Springer/USENIX, Papers with Code, related surveys and benchmarks.
- Engineering practice: official guides, code from mature projects, postmortems, conference talks, engineering blogs, Stack Overflow, HN/Reddit discussions.
- Product / market / competitors: official sites, pricing, docs, changelog, case studies, G2/Capterra, industry reports, press releases, job postings, customer forums.
- Security / compliance / standards: CVE/NVD, GitHub Security Advisories, vendor security bulletins, OWASP, CIS, NIST, IETF/W3C/WHATWG/ISO standards.
- Internal / local knowledge: the current repo, `AGENTS.md`/project docs, teamspace artifacts, historical MRs/PRs, the internal wiki, Slack/IM, MDB/logs, Rainbow/config; use only when the task authorizes it and the tool is available.

Common lane templates:

- `source-map`: confirm which sources to search, keywords, time range, and order of authority.
- `official-docs`: official docs, versions, deprecation, compatibility, recommended patterns.
- `open-source-prior-art`: representative repos and real implementations.
- `papers-and-benchmarks`: papers, benchmarks, leaderboards, evaluation metrics.
- `community-and-failure-modes`: issues, postmortems, discussions, pitfalls.
- `local-repo-and-org-context`: the codebase's current state, in-org precedents, existing constraints.
- `synthesis-challenger`: independently find counterexamples, conflicting evidence, and overlooked sources.

## Search-source matrix

Choose 3 to 6 source categories per task; a high-risk or high-cost decision covers at least 4, and includes one counterexample/failure source.

| Goal | Primary sources | Secondary sources | Must-check points |
| --- | --- | --- | --- |
| Current API/library usage | official docs, API reference, release notes, migration guide | Context7, source, examples, Stack Overflow | current version, deprecation, breaking changes, minimal viable usage |
| Open-source implementations | GitHub/GitLab search, repo docs, issues, PRs, discussions | package registry, stars history, commit activity | maintenance status, license, how it is actually used, unresolved bugs |
| Papers and algorithms | arXiv, Semantic Scholar, Google Scholar, OpenAlex, Crossref | Papers with Code, conference proceedings, authors' repos | problem definition, metrics, datasets, reproduced experiments, follow-up work |
| Benchmark / leaderboard | Papers with Code, official benchmarks, public evaluation sets | project README, reproduced experiments, issues | whether the metric fits the task, data leakage, how recent the evaluation is |
| Web prior art | search engines, vendor docs, engineering blogs, conference talks | HN, Reddit, blogs | convergence across sources, time range, marketing bias |
| Product/competitors | official sites, pricing, docs, changelog, case studies | news, G2/Capterra, customer forums, job postings | current capabilities, limits, positioning, commercial constraints |
| Security/compliance | NVD/CVE, GHSA, vendor advisories, OWASP/CIS/NIST | exploit DB, security blogs | whether the current version is affected, fixed versions, mitigations |
| Internal knowledge | repo docs, teamspace, MRs/PRs, wiki, Slack/IM, log/config platforms | runbooks, postmortems, historical design docs | this project's constraints, existing decisions, org preferences |

Searches must cover synonyms and reverse queries. For example: `<tech> best practice 2026`, `<tech> migration guide`, `<tech> deprecated sunset`, `<approach> alternatives`, `<approach> postmortem`, `site:github.com <library> example`, `<paper/topic> survey`, `<system> architecture`, `<claim> criticism`.

## Source-level verification: when you must reach the code

README, official docs, and paper abstracts are all the project's marketing face — saying "supports X" is not the same as having implemented X, let alone implemented it correctly. In the cases below, delivering at the web layer is the same as not having verified at all:

- **A capability the recommendation depends on**: fully clone the candidate repo (into a temp directory) and locate the implementation of that capability and its tests in the source. Anything the README claims but you cannot find in the source/tests, write as "unconfirmed." Commit history is evidence too: `git log`/`git blame` answer maintenance pace, which version introduced a key capability, and how a bug was fixed, directly. While there, look at the real usage in examples and issues — that is first-hand evidence beyond the docs.
- **Papers / algorithms**: find the implementation first — the code link in the paper, Papers with Code, the authors' GitHub, a high-star reproduction. If there is an implementation, read the core algorithm file and check it against what the paper claims (how the metrics are computed, whether the key tricks are actually implemented, whether the hyperparameters are the set from the paper); if there is no public implementation, write "cannot be reproduced" explicitly into the evidence gaps — that itself is a fact that bears on the selection.
- **Doubtful version behavior**: when blogs and Stack Overflow conflict, settle it by reading the upstream source or changelog at the current tag directly; do not pick whichever side has more people.

Operating boundaries:

- If the GitHub web view lets you read a single file clearly, no need to clone; clone when you need to follow a call chain across files, grep symbols, check test coverage, or inspect commit history. Default to a full clone; fall back to `--depth 1` or sparse-checkout only when the repo is absurdly large (multi-GB), and accept the cost of losing historical evidence.
- Clone read-only, do not execute: treat the repo's scripts, setup.py, and CI config as untrusted input and never run them. Comply with the license.
- Cite source evidence to `file-path:line-number` or a commit permalink, so the reader can verify down to that line of code rather than just the repo home page.

## Parallel execution protocol

1. Establish the research brief: write the main question, the decision it serves, the time range, local constraints, candidates, required/excluded sources, and success criteria.
2. Draw the evidence map: list the lanes, and for each lane its question, sources, search keywords, expected output, and quality bar.
3. Dispatch the lanes: give each researcher only its own question, a context summary, its source strategy, and the output format. Do not give it the full history, and do not let multiple lanes write the final report at once.
4. A lane's output must contain: the conclusion, key evidence, citations, confidence (calibrated on the bands under "Evidence-quality weighting"), conflicts/counterexamples, uncovered points, and next-step recommendations.
5. The synthesis stage is yours — and a lane report is a claim, not evidence: before any lane conclusion enters the report, open its load-bearing citations yourself and spot-check at least one per lane; then merge duplicate sources, rank by evidence quality, flag conflicts, and give decision-relevant gaps.
6. Self-check: confirm whether you covered official sources, real implementations, failures/counterexamples, the current version/date, and the task's local constraints; confirm that facts and inferences are kept apart.

If the research is very small, you may skip true parallelism, but still state why you did not split. If the task is large, prefer parallelism over having one researcher search it end to end.

## Evidence-quality weighting

Weight in the order below, but do not follow it mechanically:

1. Current official docs, standards, release notes, upstream source, and first-hand data.
2. Peer-reviewed papers, authoritative conferences, reproducible benchmarks, and real implementations in mature projects.
3. Engineering blogs, postmortems, issues/PRs, community consensus.
4. Second-hand blogs, SEO aggregators, model-generated summaries, unverified forum posts.

Calibrate confidence on the org's shared bands: **high (0.80+)** — you verified the claim yourself at the source, test, or run layer; **medium (0.60–0.79)** — multiple independent secondary sources agree, but none was verified at the source; **low (below 0.60)** — a single secondary source or your own inference. A low-confidence claim goes to `Decision-Relevant Gaps` or is tagged unverified; it never enters the `Recommendation`.

Information with high staleness risk must carry a date or version caveat: pricing, model capabilities, API limits, regulations, product features, benchmark leaderboards, dependency compatibility, and security vulnerabilities.

## Report skeleton

Write a research report that can drive a decision; for the frontmatter, follow the envelope fields in `templates/decision-artifact.demo.md`, but set `artifact_type` to `SpecialistResearchReport` (or `ResearchPackage` for the `hands-on` tier) — the demo's `ExampleDecision` is a placeholder — and use its `status` enum (`approve` / `request_changes` / `needs_more_evidence` / `blocked`; do not invent values). The mapping for research: `approve` = the evidence is sufficient to support the recommendation as scoped; `request_changes` = the evidence overturns the assignment's premise or candidate set, and upstream must revise before deciding; `needs_more_evidence` = the question stands but coverage gaps block a conclusion; `blocked` = a required source, tool, or authorization is unavailable. Use this structure for the body:

- `Research Brief`: the main question, the decision it serves, scope, assumptions, stop conditions.
- `Parallel Lanes`: each lane's question, sources, execution status, and research value.
- `Evidence Map`: the source list, type, date/version, authority level, and the claims each supports.
- `Findings`: organized by topic, making fact, inference, and confidence (on the bands above) explicit; capability assertions in the `hands-on` tier additionally carry the three states (verified / verification failed / unverified; see `research-package.md`).
- `Comparative Options`: candidate comparison, applicable conditions, cost, risk.
- `Disagreements And Counterevidence`: conflicts, counterexamples, failure modes.
- `Recommendation`: must / should / could, explaining why it applies to the current task.
- `Decision-Relevant Gaps`: gaps that still bear on the decision; write "none" if there are none.
- `Follow-Up Research`: the next round's specific questions and suggested lanes; write "none" if not needed.

The report must be specific down to sources, projects, papers, versions, numbers, interfaces, commands, or file paths. Do not output vague "the industry generally holds." Citation links must let the reader verify.

## Pre-delivery self-check

- Every conclusion separates "what the source states as fact / the source's own interpretation / my inference / unconfirmed assumptions."
- The capabilities the recommendation depends on reached the source, test, or official-implementation layer, rather than stopping at README, abstracts, and blog paraphrases; for anything you should have cloned but didn't, state why.
- The coverage self-check is done: official sources, real implementations, counterexamples/failures, current version and date, the task's local constraints; for whatever is missing, say so in Gaps.
- Source conflicts are preserved with their likely cause explained, not papered over.
- Information with high staleness risk all carries a date or version caveat.
- Citations let the reader open and verify; nothing entered a conclusion that you have not checked against the original yourself — a lane having checked it does not count.
