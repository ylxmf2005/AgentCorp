# Implementation Story Spec review reference

Use this reference when reviewing an Implementation Story Spec that is about to enter implementation. It must let you trust that an engineer can start building from it without having to reverse-engineer any missing decision.

To judge whether it holds up, look at these aspects:

- The parts it should have are all present and substantive — Story, Source Context, Acceptance Criteria, Tasks / Subtasks, Implementation Constraints, Verification Expectations, Review Focus, Status.
- Every acceptance criterion is observable and traceable to a requirement or to design/test context.
- Every task/subtask is bound to an acceptance criterion, or to an explicit technical guardrail where that is useful.
- The target modules/files are specific enough to support a first implementation pass.
- Implementation Constraints cover architecture/design constraints, existing-code context, interfaces/contracts, forbidden zones, and the references implementation will need.
- Enhancement/defect stories spell out the existing behavior that must be preserved.
- Risks around public interfaces, data schemas, auth/authz, reliability, performance, and security are explicitly handed off to specialist review where relevant.
- Verification Expectations are either executable by the Implementation Engineer or clearly delegated to the Test Leader/tester.
- The plan does not force the Implementation Engineer to infer the missing architecture, invent scope, or choose an unapproved dependency.

Decide on this basis: vague tasks, missing acceptance criteria, missing design constraints, fuzzy targets, unreviewed interface changes, a defect fix missing its regression criteria, or verification expectations that can neither be executed nor delegated — all of these warrant `request_changes`. Use `needs_more_evidence` when the requirements, TestPlan, diagnosis evidence, code context, or a specialist review are missing but, once supplied, would let you validate this Story Spec.
