# Regression Testing Reference

Use this reference when proving a bug is still fixed, or that an at-risk behavior is still compatible.

## What it takes to prove a regression clearly

First state the bug or at-risk behavior to be verified, then try as hard as you can to reproduce it on the current baseline — and if you cannot reproduce it, explain why. Next run the targeted check that should have caught the problem; when the blast radius is non-trivial, pull in the neighboring tests across the affected modules or contracts as well. Finally, use direct evidence to confirm that the fixed or preserved behavior genuinely holds, and faithfully record any result that could not be reproduced, was flaky, was blocked, or was environment-dependent.

## What counts as good regression evidence

- The original reproduction steps, and the result observed now.
- Where feasible, a test that fails before the change and passes after it.
- Commands, requests, screenshots, logs, or artifacts.
- Neighboring checks picked out from the affected modules or contracts.
- A clear pass/fail status.

## Boundaries

Unless assigned to, do not expand into broad exploratory testing. Do not treat judging the implementation code as your primary evidence. Do not hide flaky or environment-dependent failures.
