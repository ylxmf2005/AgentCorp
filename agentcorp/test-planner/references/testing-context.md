# Testing-context document (testing-context)

The project-level ledger of runtime facts, at the fixed path `teamspace/testing-context.md`. The reason it exists: when a test plan is not specific enough, the root cause is almost always that the planner does not know where the system is entered, how to log in, what the pages look like, or what conventions the data follows. These facts are stable across tasks — explore once, lay them down, and every later task's planning stands on top of them.

"Freely explore a product and distill it into a reusable document" is a methodical job, not random clicking. The flow below blends two streams of mature practice — the human exploratory-testing discipline (charters, tours) and agent autonomous-exploration research (frontier, the novelty constraint, verification markers) — so follow the steps.

## What it must answer

A context document that is good enough lets a tester who has never touched this project answer:

- **Entry and access** — the entry URL for each environment (pre/test/formal); the login method (already-logged-in browser session, account system, credential reference — reference only, never the secret).
- **Page map** — what the main pages/views are and how to reach each other; what core operations each page carries.
- **Core user flows** — what users of this product typically do: where they enter, how many steps, what counts as done.
- **Observable surface** — beyond the pages, where else evidence can be drawn from: the shape of API endpoints, the DB (how to connect, read-only constraints), the logs (how to query, where to look).
- **Test-data conventions** — ready-to-use test accounts/projects/datasets; the safe way to create data; which data must never be touched.
- **Known limitations** — environment differences (e.g. service routing, pool switching), common blocked scenarios, pitfalls hit in the past.
- **Gaps to fill** — the parts not yet reached or not yet entered, left for the next incremental exploration.

## Working files for exploration

Exploration is work that produces artifacts, not a mental activity. Before you start, create `test/exploration/` under the current task directory, with four things:

| File | What it is | Shape |
|---|---|---|
| `frontier.md` | The to-explore list: entries/pages/leads seen but not yet entered | `references/templates/exploration-frontier.demo.md` |
| `charters.md` | The charter ledger: each round's goal statement, plus side findings turned into to-dos | `references/templates/exploration-charters.demo.md` |
| `journal.md` | The exploration journal: what each round actually walked, and where the evidence is | `references/templates/exploration-journal.demo.md` |
| `shots/` | The screenshot directory | numbered `NN-<slug>.png`, referenced by name in the journal |

Copy the shape from the demos and replace it with the current project's content. These four are task artifacts; leave them in the task directory as exploration evidence. Only confirmed conclusions get written back to `teamspace/testing-context.md` (shape per `references/templates/testing-context.demo.md`).

## How to explore: the steps

**Step 0 Initialize (no browser yet)**
Create the four working files above. Read existing material: `teamspace/compound/` (formerly `teamspace/learnings/`), the test artifacts of prior tasks, project docs/README, the route tables and handler registrations in the code. Record every seed you read: claimed features and entry points go into `frontier.md`; the shape of interfaces and the log/DB evidence paths go straight into a first draft of the "Observable surface" of testing-context.md.

**Step 1 Set a charter**
Pick an unexplored item from `frontier.md` (selection rules in the "Advancement strategy" section below), write it into `charters.md` per the template, and mark it `in-progress`:

> Explore <target area>, using <means/resource>, to find out <which kind of information to write into the document>.

Example: "Explore the asset-library list page, using the already-logged-in Chrome session, to find out the entry path, the operations visible on the list page, and the way to navigate to the detail page." The "to find out" field forces you to settle, before you set out, what you intend to bring back — this is the first rein against exploration turning into wandering.

When setting a charter, hold three rules: (1) first scan what the document and journal already cover; a new charter must be clearly different from what has been explored, not a re-confirmation of what is known; (2) the goal must be verifiable — what you set out "to find out" must be confirmable with page evidence, and must not pose a question beyond the current permissions/environment; (3) do not set a charter for a single click — prefer goals that span multiple steps, or involve create/read/update/delete or filtering; the behavior of a single control can be checked along the way.

**Step 2 Execute**
Walk the charter with the browser. For each step: save a screenshot into `shots/`, and record one line in `journal.md` — "page → action → observation". New entry points seen along the way get appended to `frontier.md` (record only, do not enter); side findings (suspicious behavior, an unseen feature) go into `charters.md` marked `pending`, not dug into on the spot.

**Step 3 Harvest**
After this round is done, write the confirmed facts into the corresponding section of `teamspace/testing-context.md`, sorted by where they belong (format per "How to record"). Mark that item in `frontier.md` `[x]`, and the charter `done`.

**Step 4 Decide whether to stop**
Check against the stop conditions (below). If none are met, go back to Step 1 and pick the next item.

**Step 5 Wrap up**
Do a self-check: which sections of testing-context.md are still empty or thin, where you were blocked from entering, which entries you have low confidence in — write them faithfully into its "Gaps to fill" section. Leave the entire `exploration/` directory in the task; do not delete it.

## Advancement strategy (how to pick in Step 1)

Exploration has two tempos, with different selection rules:

1. **Map-laying phase, breadth-first** — the goal is to build the page map. Each round, pick an unvisited page and look at one layer only: record the URL, purpose, the core operations visible on the page, and where it can navigate to (out-edges); all new links go into the frontier, with no depth this round. Once the frontier has no unvisited pages, map-laying is done.
2. **Line-walking phase, depth-first** — the goal is the core user flows and data conventions. Each round, pick one complete user goal (where to enter, how many steps, what counts as done) and walk it all the way to the end without branching off; record forks into the frontier or charters and come back later. While walking a line, also track one core data object: which pages/interfaces/tables it appears in.

The order is fixed: lay the map first, then walk lines — without a map, picking which line to walk is blind. Throughout the whole process, keep an eye out for permission walls, environment differences, and pages you cannot parse, and jot them into "Known limitations" as you go.

## Exploration discipline

- **Use the real, already-logged-in session** — when you hit a login wall, first confirm you are driving the browser instance the user is already logged into, not a freshly opened blank one; if you are still blocked after confirming that, record this branch into "Known limitations" and stop there, do not fabricate what is behind the wall.
- **Read-only first** — navigate, view, and screenshot freely; actions that create/modify/delete business objects, send externally, or spend money are not done during exploration — infer the steps from page controls and code, and mark them "not actually tested".
- **Exploration is your own job and may not be delegated away** — the task constraints "do not execute tests" and "do not call write interfaces" restrict write operations and verification execution; they are **not a reason to keep the browser closed**: read-only browsing of pages, examining structure, and screenshotting *are* the body of planning-time exploration. Leaving map-laying and line-walking "for the verify-phase tester to fill in" is dereliction — the manual a tester receives should stand on the page map you have already verified, not scout the path on your behalf. If the environment is genuinely unreachable (login expired, service not up), record it as a known limitation per the "Use the real, already-logged-in session" rule above; that is blocked, not delegation.
- **When stuck, change approach, do not retry as-is** — when a step fails (can't click it, no response), reach the same goal a different way (a different entry point, a different control, switch to navigation); do not repeat the failed action verbatim; and do only the minimum action needed to complete that step, do not click extra along the way.
- **Failure is also a fact** — a page won't open, a wrong path — record it faithfully into "Known limitations", or record that path as "actually leads to X". Be careful to distinguish two cases: "I couldn't get through" and "the product simply does not have this feature/information" — the latter is itself a valid finding, recorded faithfully, and is not a failure. Routing around it to make up a smooth version is polluting the document.

## When to stop

Meeting any one condition moves you to the Step 5 wrap-up:

1. every section of testing-context.md now has non-empty, checked content, and the items remaining in the frontier are all clearly secondary;
2. two or three consecutive rounds of exploration have brought no new increment to the document;
3. the budget is exhausted (steps/time).

Leave gaps for the next task's incremental exploration; do not force-fill them.

## How to record (when writing back to testing-context.md)

The section and entry shapes follow `references/templates/testing-context.demo.md`. As you write, hold these judgment rules:

- **Record the page map as transitions** — "page A --<action>--> page B", one line per page: URL pattern, purpose, core operations carried. More searchable and checkable than prose.
- **Each flow carries preconditions and a provenance marker** — the precondition state (does it need login, does some data need to exist first), the step-by-step actions, and whether it is `actually walked` or `inferred from code`. Readers use this to decide how much to trust it. Write the general case rather than that run's specific values: put a `{descriptive name}` placeholder for the variable parts (`{asset name}` rather than a specific ID), and keep the fixed UI text verbatim (button names, menu names).
- **Factor repeated subsequences into subflows** — when the same stretch of steps recurs across multiple flows (e.g. logging in, entering a module), factor it into a named subflow recorded separately, and reference it from the flows rather than copying it into each. A subflow is worth factoring only at two steps or more.
- **Reference controls by visible text** — when identifying a control in a step, use the text the user sees plus position to disambiguate ("Submit (personal-info section)", "Edit (row 2)"); do not write css/xpath — one UI change breaks it all, and a human cannot check against it.
- **Write data conventions as conditional rules** — "in <which scenario> → <which rule> → because <why>". With the why included, readers can generalize to the adjacent cases you did not write down.
- **Leave a trace of pitfalls on the spot** — the bruises taken during exploration (a duplicate-named control needing a more precise locator, an interface response missing a field) get written in place under the relevant entry. This is the most valuable part of the document.
- **No time-sensitive wording** — phrases like "currently" or "before launch" silently go stale; move stale content into the "Deprecated" section at the end of the document, and keep the main line about the present only.

## Maintenance rules

- **First time**: when the document does not exist, walk the full Step 0–5 before starting to plan.
- **Incremental**: later tasks only fill gaps — when the pages/interfaces/data this task touches cannot be found in the document, walk Step 0–5 over just that part (the frontier holds only gap-related seeds). Do not re-explore everything for each task.
- **Whole-section regeneration**: when you find a section (especially the page map) no longer matches the current state, re-explore that section and rewrite the whole section; do not patch it line by line — patches make the old and new versions contradict each other.
- **Collect stable facts only**: what is reusable across tasks goes into the document; what is specific to this task (data created on purpose, a temporary toggle) goes into that task's execution manual, not here.
- **Delete when you can** — test each line with one question: "if I delete it, will later planning or testing make a mistake because of that?" If not, delete it. A bloated context document gets ignored wholesale.
