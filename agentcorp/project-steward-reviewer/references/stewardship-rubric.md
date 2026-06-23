# Stewardship Rubric

This rubric turns the Project Steward Reviewer's "owner taste" into checkable questions. It is not a generic best-practices checklist; use it only when you can show the current change affects the project's long-term health.

## External anchors

- Google Engineering Practices defines the goal of code review as making overall code health improve over time, and explicitly allows a reviewer to reject a feature they do not want admitted into the system; it likewise emphasizes design, complexity, tests, documentation, and system context.
- Google's ownership model separates peer review, code owner approval, and readability; the code owner focuses on whether a change fits their code area, whether it adds technical debt, and whether the team is able to maintain it.
- The Apache Project Maturity Model is a reference for mature projects: code is buildable and traceable; strong-dependency licenses should not add restrictions; the release process is repeatable; quality status is transparent; security, backward compatibility, and migration notes are prioritized; and important decisions are recorded in writing.
- Open Source Guides emphasize that a maintainer can say no kindly but firmly: a contribution may be valuable, but if it does not fit the project's scope, vision, or implementation quality, it should not be accepted.

References:
- https://google.github.io/eng-practices/review/reviewer/standard.html
- https://google.github.io/eng-practices/review/reviewer/looking-for.html
- https://abseil.io/resources/swe-book/html/ch09.html
- https://community.apache.org/apache-way/apache-project-maturity-model.html
- https://opensource.guide/best-practices/

## Review dimensions

### 1. Project Fit

Ask: does this capability belong to the project's core responsibility, or is it only needed by some caller, team, customer, or short-term scenario?

Strong signals:
- The new capability requires the project to own a new product concept long-term, but the requirements do not prove it belongs to the project's identity.
- The code adds a generic entry point, global config, or cross-module concept for a single business scenario.
- It could be solved via a plugin, caller composition, a standalone service, or a local extension, yet is stuffed into the core.

### 2. Ownership And Maintenance

Ask: who will maintain this part? Does the team have the expertise, monitoring, upgrade, rollback, and incident-handling path?

Strong signals:
- A new dependency, external system, runtime, scheduled job, data migration, or release step is added, but has no owner.
- The change introduces a compatibility shim, mapping table, special-case list, or dual-write path that needs ongoing updates.
- Critical knowledge lives only in the implementer's head, never captured in a design record, comment, contract, or runbook.

### 3. Architectural Boundary

Ask: does the change respect existing module boundaries and information hiding, or does it leak internal details into long-term coupling?

Strong signals:
- Callers begin to depend on internal state, internal naming, storage details, or a stopgap protocol.
- A concept that should stay local is promoted to a global abstraction, forcing more modules to know about it.
- A backdoor, global flag, implicit fallback, or cross-layer call is added to work around a current limitation.

### 4. Public Surface And Compatibility

Ask: is the added or modified public/shared surface worth committing to long-term?

Strong signals:
- A new endpoint, schema field, CLI argument, config option, exported type, event, or JSON/RPC method has no compatibility strategy.
- A breaking change has no versioning, deprecation, migration notes, or caller-impact analysis.
- A "temporary" public option has no removal condition and will in fact be depended on by users or other modules.

### 5. Change Shape And Reviewability

Ask: does this diff let a maintainer clearly see the real semantic change?

Strong signals:
- A functional change is mixed with large-scale reordering, formatting, drive-by refactors, naming migrations, or test rewrites.
- A single change spans too many modules to explain as one reviewable story.
- Key decisions have no corresponding issue, design artifact, comment, or commit context.

### 6. Debt Ledger

Ask: if debt is accepted, is it recorded, bounded, and given an exit path?

Strong signals:
- A TODO/FIXME/HACK only describes "clean up later," with no trigger condition, owner, or verification method.
- A compatibility shim, dual write, fallback, or special-case branch has no sunset plan.
- Structure is sacrificed to hit a deadline, but with no explanation of why this is the only acceptable temporary choice.

### 7. Test And Documentation As Assets

Ask: do the tests and docs help a future maintainer evolve safely, rather than just getting this round to pass?

Strong signals:
- Tests rely on excessive mocking, only assert call counts, and would not fail when core behavior breaks.
- New public behavior, config, migrations, release steps, or incident handling have no documentation.
- Docs only restate how to use it, without recording why it was designed this way, what the boundaries are, and when it must not be used.

## Output guidance

Write each finding to this structure:

- Long-term health impact: who will bear what maintenance cost in the future.
- Evidence: code/plan/design/doc path and line number, with actual search results when needed.
- Recommended action: narrow scope, move to a plugin/caller, add a contract, split the PR, add a design record, add a sunset plan, ask the human owner to accept the risk, etc.
- Routing: `review-fixer`, `implementation-planner`, `solution-architect`, `release owner`, `human owner`.

When the issue is fundamentally a project-direction or owner tradeoff, do not pretend a tool can rule on it; lay out the options clearly and route to the human owner.
