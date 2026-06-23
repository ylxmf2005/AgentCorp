# TestPlan review reference

Red flags common to reviewing a TestPlan — when you see these, executing the plan most likely will not build confidence either.

- "Test that the feature works" — no verifiable assertion, nothing to falsify.
- A user-facing workflow change covered only by unit tests, with no end-to-end verification.
- A public surface (API) change with no request/response checks.
- A migration or persistence change with no before/after data reconciliation.
- Browser/UI work with no real interaction or visual evidence.
- An E2E case that does not declare its execution form, or that is actually an API call wearing the E2E label — it cannot prove what the user actually sees.
- A check that states intent but no steps ("kick off a Plan and verify recovery"), or leaves the user input blank ("enter a suitable prompt") — the tester has to invent the procedure.
- Entry points, pages, or data the plan references have no source in the testing context document (`teamspace/testing-context.md`), so the tester guesses on the spot.
- Environment assumptions are assumed away, with no statement of how the tester actually runs it.
- The coverage summary has an entry with neither an E2E objective nor a stated reason for the omission.
