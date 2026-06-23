# User Flow Testing Reference

Pull this in when running complete user-facing flows.

## Testing posture

Treat yourself as a real user with a goal: drive the product from the outside and report the behavior you personally experienced, not source code that "looks right" as evidence that a flow passed.

## Execution mode

When there is a user-facing interface, use the browser as primary evidence: a real browser, a logged-in session, following the steps in the E2E manual (typically `test/e2e-test-plan.md`), checking each step against the expected behavior the manual specifies and capturing evidence at the screenshot points it marks. API/DB/logs are only supporting evidence. When the environment is not in place (service not started, routing not switched, data not seeded), mark the corresponding flow blocked and state the gap; switching to API-driven execution is allowed only when the manual explicitly declares a fallback, and the result must state what this layer of evidence cannot prove.

## How to run a flow

For each assigned flow, first nail down the preconditions — entry point, persona, environment, credentials, data setup; do not make up on the spot any precondition the manual leaves unspecified (such as an object ID to use) — report it as a gap. Then let it proceed in an "observe — act — observe again" rhythm: first see the starting state clearly, take one user action, wait for the result to settle before taking the next, and record "expected vs actual" at every step, until the goal is reached, you are blocked, or the scenario warrants giving up. The key is to verify every step of the flow, not just the final result. For steps where the manual requires verbatim input (such as the prompt sent to the system), use the verbatim text and do not rewrite it — rewritten input tests something other than the path the plan evaluated.

## Evidence by surface

- Web: URL, the reachable page state, screenshots on state change or failure, relevant console/network errors.
- CLI: command, stdout, stderr, exit code, and latency when relevant.
- API as a user flow: the request sequence, responses, status codes, persistent results.
- Desktop: screenshots/window state where supported.

## Human-tester execution log

Write one record per completed or blocked scenario. Put the concrete execution before the conclusion:

- Background: persona, user goal, environment, page or entry point, and why this scenario matters.
- Preconditions: data chosen, account/credential reference, feature flags, config backup, and what writes are allowed.
- Actions: exact user steps, literal inputs, command lines, or script paths. If page-context API is part of the flow, include method, path, body, credentials mode, and timestamp.
- Responses: status code, response message, key body fields, trace/request IDs, and persisted state read-back. Large bodies may be summarized, but the exact request that produced them must remain visible.
- Observation: what the tester personally saw in the page, log, audit, email/chat/push, or other notification surface. For manual observations, record who confirmed it and the timestamp/content summary.
- Cleanup: what was restored, the request or UI action used to restore it, and the read-back proving final state.
- Evidence boundary: what this record proves, and what it does not prove.

For negative checks, state the observation window and source (for example "watched chat notifications from 15:00 to 15:05 and saw no message matching X"). If there is no reliable observation surface, report `needs_more_evidence` or `blocked`; do not call the negative path passed.

## Persona

- Novice: follows visible labels, has low patience, reports confusion and missing affordances.
- Power user: digs through docs/settings/shortcuts, tries workarounds, is sensitive to performance and inconsistency.
- Adversarial: probes boundaries — repeated actions, invalid input, authorization, information leakage.

Use the persona assigned by the TestPlan; when none is assigned, pick the one that best fits the user-facing risk and explain why.
