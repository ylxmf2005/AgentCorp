# pipeline: walk a change through into a local forge PR

Dependencies: `python3` (stdlib), `git`. All scripts are in `scripts/` and use only the standard library. Forge credentials are written by `setup_forge.py` to `~/walker-forgejo/walker.env` and read automatically by the scripts.

## Comment JSON contract (produced by walker, consumed by post_review)

```json
{
  "body": "optional overall comment (one sentence on what this change is)",
  "comments": [
    {"path": "<repo-relative path>", "body": "<why, zh-CN markdown>", "new_position": <new-file line number>},
    {"path": "<...>",                "body": "<...>",                 "old_position": <old-file line number>}
  ]
}
```

- One comment anchors one line: use `new_position` (new-file line number) for added/context lines, `old_position` (old-file line number) for pure deletion lines. Pick one.
- Line numbers must come from the real values in `diff_outline.py`; don't count by hand.
- Granularity: one comment per function / per branch / per meaningful group of constants; big blocks must be split (see the coverage gate).

## Steps

```bash
S=<skill>/scripts        # this skill's scripts directory
REPO=/path/to/target     # target repo (read-only)
BASE=origin/main         # base ref
HEAD=<sha or ref>        # head

# 1. Ensure the local forge is running (idempotent; reuses one already running)
python3 $S/setup_forge.py

# 2. Mirror into a local PR (base branch = merge-base, head branch = head, PR diff == git diff BASE..HEAD three-dot)
python3 $S/mirror_pr.py --repo $REPO --base $BASE --head $HEAD --name <forge-repo-name>
#   → JSON: {owner, repo, index, merge_base, head_sha, files_url}

# 3. Get the diff outline with line numbers
python3 $S/diff_outline.py --repo $REPO --merge-base <merge_base> --head <head_sha> > /tmp/outline.json
```

**Check the scope before writing comments**: every file and every hunk listed by `diff_outline.py` must enter your comment set. Reviewing only one file, or skipping a whole new file / SQL migration, is a miss by default, not a deliberate scope reduction — unless the assignment limited the scope and you declare in the receipt "walked through only X this time, the rest not covered." SQL migrations, handlers, schemas, and the like are often where risk density is highest, and are the last thing that should be missed.

Step 4 is your (the walker's) job: read `/tmp/outline.json` and write comments file by file, function by function. Each `files[].hunks[]` gives `changed` (number of changed lines) and the `new`/`old` line number of every changed line. Write the `body` per the discipline in `references/hunk-comment.md`, pick one changed line's `new` within that function (or the `old` of a deleted segment) as the anchor, and assemble the comment JSON above into `/tmp/comments.json`.

```bash
# 5. Post them all into the PR (one POST creates one review)
python3 $S/post_review.py --repo <forge-repo-name> --index <index> --comments /tmp/comments.json

# 6. Coverage gate: read back and reconcile
python3 $S/coverage_gate.py --repo $REPO --merge-base <merge_base> --head <head_sha> \
        --forge-repo <forge-repo-name> --index <index>
#   exit 0 = pass; non-zero = lists the GAPs (which hunk, how many changed lines, how many comments, how many needed)
```

## Coverage and density

The gate's rule (default): each hunk has at least 1 comment anchored within its line range; **a large hunk (changed lines > 20) needs ≥ ceil(changed lines / 40) comments** — forcing big blocks to be split by function rather than swept past with one comment.

The gap-filling loop: gate reports a GAP → add function-level comments for those hunks → `post_review.py` again (it creates a new review; the gate reads back the comments across all reviews and reconciles cumulatively) → `coverage_gate.py` again, until it exits 0. Don't stuff in empty filler to pass the gate — each comment still has to explain a real "why"; for what you genuinely can't explain, mark it `untraceable` and state the evidence you checked. The gate only enforces density; quality is backstopped by writing discipline and review.

## Wrap-up

Hand the `files_url` to the requester, who logs into the local forge and reviews in the native PR UI. When sandbox repos pile up, delete them as needed: `DELETE /api/v1/repos/{owner}/{repo}`.

## Boundaries

Target repo is read-only (only rev-parse / merge-base / push existing commits). Operate only on the **local** forge, never push to or post comments on a real remote. Don't write credentials into any file that will be committed.
