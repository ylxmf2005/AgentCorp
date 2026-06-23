# Diff Noise Review

Load only when the assignment or diff signals point to whitespace, formatting, wrapping, comments, drive-by refactors, or formatter blast radius. The goal is to find hunks that have no behavioral value, are not tool-enforced, yet inflate the reading cost of the MR/PR.

## Process

1. Run the mechanical scan first.
   - From this skill directory, run `python3 scripts/diff_noise_scanner.py --json`.
   - When reviewing an MR/PR or feature branch, prefer the base/head the assignment specifies; with no explicit range but a locatable target branch, use the committed branch diff from merge-base to HEAD, e.g. `--diff <base>..HEAD`.
   - Look at local uncommitted changes only when the originator or assignment explicitly asks to review staged / worktree / current candidate; for staged, use the default git diff/staged input, and for the working tree add `--worktree`.
   - For an external diff file, use `--file <diff-file>`.
   - When you need to browse the compare diff chunk by chunk first, use `--base <target-branch> --chunks hunk|group|line`; `group` means a run of consecutive `+/-` changes within the same hunk and is best for judging chunk by chunk whether each belongs to this change.
   - To adjust chunk size, use `--unified 0` to break context finer, or `--inter-hunk-context <n>` to merge nearby hunks.
   - Treat the output's `verdict`, `counts_by_category`, and key findings as evidence; the script is an evidence collector, not the final judge.
2. Establish the change surface.
   - Prefer the base/head or diff file the assignment gives. In an MR/PR context, the uncommitted worktree is by default just local state, not the MR/PR diff.
   - If the assignment gives no range, first establish merge-base..HEAD from the target branch; switch to the staged or worktree diff only when the task is explicitly to "review staged/worktree/current candidate."
   - Read `git diff --stat`, `git diff --name-status`, and `git diff -- <path>` for key files.
   - For hunks you suspect are whitespace noise, compare with `git diff -w -- <path>` or `git diff --ignore-space-change -- <path>`.
3. Classify first, then judge.
   - `semantic`: behavior, contract, data, error handling, and test updates required to implement the task.
   - `mechanical-required`: the minimal formatting change the project formatter/linter must produce.
   - `noise`: does not change behavior, is not tool-enforced, and increases reading cost.
   - `mixed`: a single hunk mixes semantics and noise; recommend splitting the hunk or reverting the noise lines.
4. Ask three questions of every noise/mixed hunk.
   - Does this requirement, Story Spec, review finding, or test failure require it?
   - Does the project formatter/linter explicitly require it?
   - If you delete these lines, do behavior, verification, and lint still hold?

## Problems to focus on

- **Whitespace-only churn**: the hunk disappears when whitespace is ignored, and it is not required by the formatter/linter.
- **Over-wrapping**: a function call, literal, method chain, list, or assertion split too narrow when the original did not exceed the project's acceptable line width.
- **Under-justified reflow**: a docstring, comment, string, error message, or log text merely reordered or rewrapped.
- **Drive-by formatting**: nearby functions, untouched branches, unrelated imports, or existing tests reformatted in passing.
- **Drive-by refactor**: extracting single-caller logic into a function, merging/splitting functions, renaming, or reordering code blocks when the task does not need it.
- **Comment-only noise**: rewording comments, adding explanatory comments, or deleting comments without correcting stale or wrong information.
- **Generated or formatter blast radius**: one formatter run changes a large number of unrelated files; recommend narrowing the formatter scope or splitting it into a separate MR/commit.

## Line width and wrapping

Do not treat "narrower" as "better." In Python/backend code, as long as it satisfies the project lint/formatter and the surrounding file style, prefer keeping the compact, readable, low-diff form.

Before reporting over-wrapping, confirm at least one condition holds: the same expression was merely split across lines by the model; the surrounding code generally allows wider lines; the current split creates significant noise; or `git diff -w` or manual hunk comparison shows the main change comes from wrapping/indentation.

Do not report long lines the formatter must split, complex expressions whose wrapping clearly improves readability, or necessary wrapping done to avoid an overlong string/SQL/URL/type signature.

## Output requirements

Report only noise that has an actionable fix. For each finding, state the file/line number or hunk, the scan or diff command evidence, why it increases review cost, and whether the recommendation is delete, revert, split the commit, or keep but explain.
