# Local Implementation Reference

When implementing an approved piece of work, use this reference as detail that unfolds progressively.

## Inputs

You implement against: the approved Implementation Story Spec, the Plan Review Lead's decision and implementation constraints, and the source artifacts the Story Spec references (validated requirements, the TestPlan/Test Strategy or diagnosis criteria, the design artifacts/contracts, the local standards), plus any code review findings assigned back to you. When multiple source artifacts conflict, stop and report the conflict rather than guessing.

## Executing a Story Spec

Read the whole Story Spec first and absorb its Story, Acceptance Criteria, Tasks/Subtasks, Implementation Constraints, Verification Expectations, Review Focus, and Status, then load the code and project context it references. Then work through the tasks/subtasks in order — unless the Story Spec or a reviewer explicitly permits reordering.

For each task make the "smallest correct" change: implement close to the approved story, do not slip in adjacent improvements; leave existing module boundaries as they are, unless an approved artifact calls for changing them. Try to keep each file to a single coherent change, and re-read it before changing it again. When behavior, contracts, a bug, data, auth, or a public interface change, add or update focused tests. Record progress, changed files, commands, deviations, and blockers in `implementation/implementation-result.md` as you go.

Less change beats more change. Before adding anything, gate it with these questions to keep the diff from ballooning:

- **Reuse before you build.** Before adding a function, file, or abstraction, search the repo for something that already does the job (grep key symbols, similar names, comparable utilities) — reuse it rather than standing up a synonymous parallel copy beside it.
- **No generalization for an imagined future.** Do not leave a flag/option/plugin point or write a generic structure for "we might need it later"; when there is only one use case right now, write for that one case.
- **No premature extraction.** Write single-caller logic inline; do not extract it into a shared function, unless the approved Story Spec explicitly calls for that interface.
- **No drive-by touching of unrelated code.** Leave existing code the task did not ask you to change — keep incidental renames, refactors, and reformatting out of this change.
- **Every addition traces back to the spec.** Each added capability, file, or branch should trace back to the Story Spec or the acceptance criteria; anything that does not is out of scope, so do not do it.

The thing to watch for most in implementation is papering over failures with a silent fallback, fake success, a broad catch, or a swallowed error — better to let it fail explicitly.

## bugfix

Act on a bugfix only after the diagnosis has produced the causal chain. The fix should land on the root cause, not just the symptom. Add a regression check — it should fail before the fix.

## The gate before handoff

Before handing off to Code Review, make the implementation trustworthy as actually done and actually verified: each required task/subtask is either completed or explicitly listed as blocked; the code compiles and the relevant static checks (if any) pass; focused tests pass, or the failure is honestly recorded as a blocker; the resulting behavior has been checked against the acceptance criteria, the TestPlan, or the diagnosis criteria; the implementation result lists every added, modified, and deleted file, along with every place that deviates from the approved Story Spec; and the Code Review Lead has access to the changed files, the commands, the test evidence, and the known risks.
