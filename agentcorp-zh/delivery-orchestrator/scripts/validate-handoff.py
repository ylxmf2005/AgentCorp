#!/usr/bin/env python3
"""Validate AgentCorp handoff envelopes (assignment / receipt / artifact frontmatter).

Mechanical checks ONLY. This does not judge phase quality or evidence strength —
that is the Delivery Orchestrator's gate. It catches the cheap, high-frequency
slips that free-text markdown contracts let through (the MAST FC1/FC2 family:
disobey task/role spec, reasoning-action mismatch): a receipt that claims an
artifact which doesn't exist or whose author/task disagrees, a missing required
field, an empty status, a receipt that doesn't match its assignment.

Usage:
  validate-handoff.py FILE [FILE ...]
      Validate each file's frontmatter shape (envelope or artifact).
  validate-handoff.py --pair ASSIGNMENT RECEIPT [--task-root DIR]
      Also cross-check the receipt against its assignment and the artifact it names.
  validate-handoff.py --sweep --task-root DIR
      Validate every assignment/receipt pair under DIR/handoffs/.

Exit 0 = clean; 1 = violations (printed to stderr); 2 = usage error.
Python 3 stdlib only — no PyYAML.
"""

import os
import re
import sys

# Required scalar keys per envelope. Artifacts (anything else) need the generic set.
ENVELOPE_REQUIRED = {
    "PhaseAssignment": ["task_id", "from_agent", "to_agent", "phase", "status", "output_path"],
    "PhaseReceipt": ["task_id", "from_agent", "phase", "status", "artifact_path"],
}
ARTIFACT_REQUIRED = ["artifact_type", "task_id", "author_agent", "status"]

# Soft enum: unknown values warn (drift-friendly), they do not fail the run.
KNOWN_STATUS = {
    "assigned", "in_progress", "completed", "blocked",
    "needs_evidence", "needs_more_evidence", "implemented",
    "approve", "request_changes", "accept", "reject", "needs_human",
}

_KV = re.compile(r"^([A-Za-z_][\w-]*):\s*(.*)$")


def parse_frontmatter(path):
    """Return (scalars_dict, error_or_None). Only flat scalar keys are extracted."""
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError as exc:
        return None, f"cannot read file: {exc}"
    lines = text.splitlines()
    if not lines or lines[0].strip() != "---":
        return None, "missing opening '---' frontmatter delimiter on line 1"
    end = None
    for i in range(1, len(lines)):
        if lines[i].strip() == "---":
            end = i
            break
    if end is None:
        return None, "missing closing '---' frontmatter delimiter"
    scalars = {}
    for raw in lines[1:end]:
        if not raw.strip() or raw[:1] in (" ", "\t", "-"):
            continue  # blank, nested mapping, or list item — not a top-level scalar
        m = _KV.match(raw)
        if not m:
            continue
        key, val = m.group(1), m.group(2).strip()
        if len(val) >= 2 and val[0] == val[-1] and val[0] in ("'", '"'):
            val = val[1:-1]
        scalars[key] = val
    return scalars, None


def derive_task_root(receipt_path):
    """Receipts live under <task_root>/handoffs/; walk up to find task_root."""
    d = os.path.dirname(os.path.abspath(receipt_path))
    while d and d != os.path.dirname(d):
        if os.path.basename(d) == "handoffs":
            return os.path.dirname(d)
        d = os.path.dirname(d)
    return None


def resolve_artifact(task_root, artifact_path):
    """Resolve a receipt's artifact_path to an on-disk path under task_root."""
    candidate = os.path.join(task_root, artifact_path) if task_root else artifact_path
    if os.path.isdir(candidate):  # folder artifact (e.g. review/research/) -> expect an index
        idx = os.path.join(candidate, "00-index.md")
        return idx if os.path.exists(idx) else candidate
    return candidate


def check_shape(path, errors, warnings):
    """Validate one file's frontmatter shape. Returns scalars or None."""
    scalars, err = parse_frontmatter(path)
    if err:
        errors.append(f"{path}: {err}")
        return None
    atype = scalars.get("artifact_type", "")
    required = ENVELOPE_REQUIRED.get(atype, ARTIFACT_REQUIRED)
    for key in required:
        if not scalars.get(key):
            errors.append(f"{path}: missing or empty required key '{key}' (artifact_type={atype or '?'})")
    status = scalars.get("status", "")
    if status and status not in KNOWN_STATUS:
        warnings.append(f"{path}: status '{status}' not in known set (typo? or update KNOWN_STATUS)")
    return scalars


def check_pair(assignment_path, receipt_path, task_root, errors, warnings):
    a = check_shape(assignment_path, errors, warnings)
    r = check_shape(receipt_path, errors, warnings)
    if not a or not r:
        return
    # receipt must answer the assignment it pairs with
    if a.get("to_agent") and r.get("from_agent") and a["to_agent"] != r["from_agent"]:
        errors.append(f"{receipt_path}: from_agent '{r['from_agent']}' != assignment to_agent '{a['to_agent']}'")
    if a.get("phase") and r.get("phase") and a["phase"] != r["phase"]:
        errors.append(f"{receipt_path}: phase '{r['phase']}' != assignment phase '{a['phase']}'")
    if a.get("task_id") and r.get("task_id") and a["task_id"] != r["task_id"]:
        errors.append(f"{receipt_path}: task_id '{r['task_id']}' != assignment task_id '{a['task_id']}'")
    # the receipt's artifact_path should match the assignment's output_path
    out, art = a.get("output_path", ""), r.get("artifact_path", "")
    if out and art:
        ok = art == out or (out.endswith("/") and art.startswith(out))
        if not ok:
            errors.append(f"{receipt_path}: artifact_path '{art}' does not match assignment output_path '{out}'")
    check_artifact_exists(receipt_path, r, task_root, errors)


def check_artifact_exists(receipt_path, receipt, task_root, errors):
    art = receipt.get("artifact_path", "")
    if not art:
        return
    root = task_root or derive_task_root(receipt_path)
    resolved = resolve_artifact(root, art)
    if not os.path.exists(resolved):
        errors.append(f"{receipt_path}: claims artifact_path '{art}' but no file exists at '{resolved}' "
                      f"(receipt says done, artifact missing)")
        return
    if os.path.isfile(resolved):
        scalars, err = parse_frontmatter(resolved)
        if err:
            return  # artifact may legitimately have no frontmatter (e.g. an index) — don't fail on that
        if scalars.get("task_id") and receipt.get("task_id") and scalars["task_id"] != receipt["task_id"]:
            errors.append(f"{resolved}: task_id '{scalars['task_id']}' != receipt task_id '{receipt['task_id']}'")
        author = scalars.get("author_agent", "")
        if author and receipt.get("from_agent") and author != receipt["from_agent"]:
            errors.append(f"{resolved}: author_agent '{author}' != receipt from_agent '{receipt['from_agent']}'")


def sweep(task_root, errors, warnings):
    handoffs = os.path.join(task_root, "handoffs")
    if not os.path.isdir(handoffs):
        errors.append(f"{handoffs}: no handoffs/ directory to sweep")
        return
    receipts = sorted(f for f in os.listdir(handoffs) if f.endswith("-receipt.md"))
    if not receipts:
        warnings.append(f"{handoffs}: no *-receipt.md files found")
    for rf in receipts:
        receipt_path = os.path.join(handoffs, rf)
        assignment_path = os.path.join(handoffs, rf[: -len("-receipt.md")] + ".md")
        if os.path.exists(assignment_path):
            check_pair(assignment_path, receipt_path, task_root, errors, warnings)
        else:
            warnings.append(f"{receipt_path}: no matching assignment '{os.path.basename(assignment_path)}'")
            r = check_shape(receipt_path, errors, warnings)
            if r:
                check_artifact_exists(receipt_path, r, task_root, errors)


def main(argv):
    args = argv[1:]
    task_root = None
    if "--task-root" in args:
        i = args.index("--task-root")
        try:
            task_root = args[i + 1]
        except IndexError:
            print("usage: --task-root needs a DIR", file=sys.stderr)
            return 2
        del args[i : i + 2]

    errors, warnings = [], []
    if "--sweep" in args:
        if not task_root:
            print("usage: --sweep requires --task-root DIR", file=sys.stderr)
            return 2
        sweep(task_root, errors, warnings)
    elif "--pair" in args:
        i = args.index("--pair")
        rest = args[i + 1 :]
        if len(rest) < 2:
            print("usage: --pair ASSIGNMENT RECEIPT", file=sys.stderr)
            return 2
        check_pair(rest[0], rest[1], task_root, errors, warnings)
    elif args:
        for path in args:
            check_shape(path, errors, warnings)
    else:
        print(__doc__, file=sys.stderr)
        return 2

    for w in warnings:
        print(f"WARN: {w}", file=sys.stderr)
    for e in errors:
        print(f"ERROR: {e}", file=sys.stderr)
    if errors:
        print(f"\n{len(errors)} handoff violation(s).", file=sys.stderr)
        return 1
    print("handoff OK" + (f" ({len(warnings)} warning(s))" if warnings else ""), file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
