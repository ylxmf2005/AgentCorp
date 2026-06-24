---
id: diagnose
name: Bug Diagnosis
inputs: [validated requirements (bug report), reproduction steps if available]
outputs: [diagnosis design artifact]
optional: false
---

# Bug Diagnosis

Before designing any fix, nail down the defect's root cause with evidence. The crux is this discipline: every investigation step starts from a clear, testable hypothesis and ends with evidence that either confirms or refutes it. The moment you catch yourself poking around without a hypothesis, stop and set one first.

## What you do

Sharpen the hypothesis until it is "specific enough to be falsified" — for example, "after a password change the session token is not refreshed, so the old token stays valid," not "something's off in auth." Validate it against real code and real behavior. If it holds, you have the root cause; if it does not, that result is itself evidence — gather more clues (and when clues run out, add instrumentation to the code), then set the next hypothesis.

Keep validation cheap and real: use the smallest means that can genuinely confirm or refute, and never substitute a fake return value or a mock for the very real behavior you are trying to explain. Distinguish the proximate cause (this line is wrong) from the root cause (the data model never accounted for this case) — the fix targets the root cause.

## What this artifact must achieve

After reading it, the reader should believe you found the true root cause and that the fix is the minimal change targeting it. It must make clear:

- what the defect is;
- which hypotheses you validated, with the evidence and conclusion for each;
- the root cause — distinguished from the surface symptom and backed by evidence;
- the minimal change that fixes it, and which files it touches;
- regression risk — what this fix might perturb.

Draw a diagram only where a view makes the "faulty path vs. corrected path" easier to reason about than prose.

If the fix ends up touching several modules, changing existing behavior, or altering an interface, don't make the diagnosis carry the whole design: keep the root cause and regression criteria in the diagnosis, then attach `impact-analysis.md` for where it lands and what behavior is preserved; when public/shared or cross-module boundaries are involved, also attach `interface-contract.md`.

## Output

Write the artifact to the assignment's `output_path` (usually `design/diagnosis.md`), following the `design-artifact` demo template.
