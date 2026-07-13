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
# Keep this set in sync with the statuses the templates/ demos instruct agents to write,
# so a fully conformant run stays warning-free and warnings keep meaning something.
KNOWN_STATUS = {
    "assigned", "in_progress", "active", "completed", "blocked",
    "needs_evidence", "needs_more_evidence", "implemented",
    "ready_for_review", "ready_for_plan_review",
    "ready_for_acceptance_review", "ready_for_triage",
    "approve", "request_changes", "accept", "reject", "needs_human",
    "passed", "failed", "partial",
}

KNOWN_EFFORT = {"low", "medium", "high", "max"}

# ReviewResearchNote vocabulary: verdict is the truth axis, disposition the landing axis
# (fix-now lands in this task's fix phase; defer becomes a sponsor-visible follow-up).
# Scope never bends the verdict — a real-but-deferred problem stays confirmed + defer.
KNOWN_VERDICTS = {"confirmed", "false-positive", "partial", "needs-human"}
KNOWN_DISPOSITION = {"fix-now", "defer"}

# Baseline refs: source_ref is what the working branch is cut from and verified against
# (a stacked task names its parent's branch); target_ref is what the delivery merges into
# (usually the repo default branch, even when stacked); merge_base is the source_ref commit
# the baseline was verified at. The ledger (task.md) is the source of truth; an assignment
# carrying different refs is stale or drifted and must be replaced, not worked from.
BASELINE_KEYS = ("source_ref", "target_ref", "merge_base")
MERGE_BASE_SHAPE = re.compile(r"^[0-9a-f]{7,40}$")

# A TestExecutionResult with one of these statuses actually ran, so it must carry an
# inspectable evidence handle in its body — not just a green/red status word.
TEST_STATUS_NEEDS_EVIDENCE = {"passed", "failed", "partial", "completed"}

# A receipt is the owner reporting back; these statuses mean the work never concluded,
# so a receipt carrying one is an error (fuzz case: receipt-status-assigned passed silently).
RECEIPT_NOT_CONCLUDED = {"assigned", "in_progress", "active"}

# Known ledgers (soft: unknown values warn, keeping drift visible without breaking runs).
# Update on any skill add/rename or phase/artifact-type change — the skill-evolution
# landing checklist and doctrine §9 name this file for exactly that reason.
KNOWN_AGENTS = {
    "delivery-orchestrator", "test-planner", "test-plan-reviewer", "solution-architect",
    "implementation-planner", "plan-review-lead", "implementation-engineer",
    "code-review-lead", "correctness-reviewer", "security-reviewer", "performance-reviewer",
    "reliability-reviewer", "simplicity-reviewer", "change-hygiene-reviewer",
    "standards-reviewer", "project-steward-reviewer", "taste-reviewer",
    "adversarial-reviewer", "api-contract-reviewer", "comment-optimizer",
    "review-researcher", "review-fixer", "test-leader", "api-contract-tester",
    "e2e-tester", "regression-tester", "acceptance-review-lead", "parallel-researcher",
    "probe", "brainstorm", "explain", "walkthrough", "grill", "compound",
    "authenticated-browser-session", "precommit-setup", "skill-evolution",
}
KNOWN_PHASES = {
    "validate-requirements", "test-plan", "test-plan-review", "architecture",
    "impact-analysis", "diagnose", "interface-contract", "implementation-plan",
    "plan-review", "implement", "code-review", "review-research", "fix", "verify",
    "acceptance-review", "compound", "deliver",
}
KNOWN_ARTIFACT_TYPES = {
    "TaskRecord", "TaskManifest", "PhaseAssignment", "PhaseReceipt", "AcceptancePackage",
    "ValidatedRequirements", "TestPlan", "TestPlanReview", "ArchitectureDesign",
    "ImpactAnalysis", "Diagnosis", "InterfaceContract", "ImplementationStorySpec",
    "PlanReviewDecision", "ImplementationResult", "CodeReviewDecision",
    "SpecialistReviewFindingSet", "SpecialistResearchReport", "ReviewResearchNote",
    "FixRecord", "FixResult", "TestExecutionResult", "VerificationReport",
    "AcceptanceDecision", "CompoundResult", "DeliveryReport", "ProbeReport",
    "ChangeWalkthrough", "ResearchPackage", "ExplanationSet", "ReplayReport",
}
# Timestamp-first task ids browse in time order; the convention is load-bearing for
# directory listings, so a violation warns loudly.
TASK_ID_SHAPE = re.compile(r"^\d{8}-\d{6}-[a-z0-9][a-z0-9-]*$")

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
    effort = scalars.get("effort", "")
    if effort and effort not in KNOWN_EFFORT:
        warnings.append(f"{path}: effort '{effort}' not in known set low|medium|high|max "
                        f"(xhigh is an intake synonym — the orchestrator normalizes it to max before threading)")
    if atype == "PhaseReceipt" and status in RECEIPT_NOT_CONCLUDED:
        errors.append(f"{path}: a receipt with status '{status}' reports work that never concluded "
                      f"(receipts carry an outcome, not a start marker)")
    if atype and atype not in ENVELOPE_REQUIRED and atype not in KNOWN_ARTIFACT_TYPES:
        warnings.append(f"{path}: artifact_type '{atype}' not in known ledger (typo? or update KNOWN_ARTIFACT_TYPES)")
    phase = scalars.get("phase", "")
    if phase and phase not in KNOWN_PHASES:
        warnings.append(f"{path}: phase '{phase}' not in known set (typo? or update KNOWN_PHASES)")
    check_research_vocab(path, scalars, warnings)
    if atype == "TaskRecord":
        for key in ("source_ref", "target_ref"):
            if not scalars.get(key):
                warnings.append(f"{path}: TaskRecord carries no {key} (baseline refs live in the "
                                f"ledger frontmatter; a task without them is building on whatever "
                                f"happened to be checked out)")
        check_phase_sequence(path, warnings)
    mb = scalars.get("merge_base", "")
    if mb and not MERGE_BASE_SHAPE.match(mb):
        warnings.append(f"{path}: merge_base '{mb}' is not a commit sha (expected 7-40 hex chars)")
    for agent_key in ("from_agent", "to_agent", "author_agent"):
        val = scalars.get(agent_key, "")
        if val and val not in KNOWN_AGENTS:
            warnings.append(f"{path}: {agent_key} '{val}' not a known skill (typo? or update KNOWN_AGENTS)")
    tid = scalars.get("task_id", "")
    if tid and not TASK_ID_SHAPE.match(tid):
        warnings.append(f"{path}: task_id '{tid}' is not timestamp-first <YYYYMMDD-HHMMSS>-<slug> "
                        f"(directory listings stop browsing in time order)")
    return scalars


_SEQ_TO_DELIVER = re.compile(r"->\s*deliver\b")


def check_phase_sequence(path, warnings):
    """TaskRecord only: a phase sequence that reaches deliver without compound has
    silently dropped the soft phase — the tier may shrink compound, never delete it."""
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return  # unreadable already reported by parse_frontmatter
    for line in text.splitlines():
        if _SEQ_TO_DELIVER.search(line) and "compound" not in line:
            warnings.append(f"{path}: phase sequence reaches deliver without compound "
                            f"(compound is a soft phase in every paradigm: shrink it via "
                            f"sweep:, don't silently drop it from the walked list)")
            return


def check_research_vocab(path, scalars, warnings):
    """ReviewResearchNote only: verdict (truth axis) and disposition (landing axis)."""
    if scalars.get("artifact_type", "") != "ReviewResearchNote":
        return
    verdict = scalars.get("verdict", "")
    disposition = scalars.get("disposition", "")
    if verdict and verdict not in KNOWN_VERDICTS:
        warnings.append(f"{path}: verdict '{verdict}' not in known set "
                        f"confirmed|false-positive|partial|needs-human")
    if disposition and disposition not in KNOWN_DISPOSITION:
        warnings.append(f"{path}: disposition '{disposition}' not in known set fix-now|defer")
    if verdict in ("confirmed", "partial") and not disposition:
        warnings.append(f"{path}: {verdict} ReviewResearchNote carries no disposition "
                        f"(fix-now|defer — the landing decision lives here, never bent into the verdict)")


def check_nonempty_body(path, errors):
    """A claimed primary artifact whose body is empty is a shell, not a deliverable."""
    try:
        with open(path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return
    lines = text.splitlines()
    body = text
    if lines and lines[0].strip() == "---":
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                body = "\n".join(lines[i + 1:])
                break
    if len(body.strip()) < 20:
        errors.append(f"{path}: artifact body is empty or near-empty (a receipt claimed this "
                      f"as the phase deliverable)")


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
        ok = art == out or (out.endswith("/") and art.startswith(out)) or art.startswith(out + "/")
        if not ok:
            errors.append(f"{receipt_path}: artifact_path '{art}' does not match assignment output_path '{out}'")
    # an assignment's baseline refs must agree with the ledger — a mismatch is a stale
    # assignment or baseline drift, and working from it lands the phase on the wrong base
    root = task_root or derive_task_root(receipt_path)
    task_md = os.path.join(root, "task.md") if root else None
    if task_md and os.path.exists(task_md) and any(a.get(k) for k in BASELINE_KEYS):
        t, terr = parse_frontmatter(task_md)
        if not terr:
            for k in BASELINE_KEYS:
                av, tv = a.get(k, ""), t.get(k, "")
                if av and tv and av != tv:
                    errors.append(f"{assignment_path}: {k} '{av}' != task.md {k} '{tv}' "
                                  f"(stale assignment or baseline drift — replace the assignment, "
                                  f"do not work from it)")
    check_artifact_exists(receipt_path, r, task_root, errors, warnings)


def check_artifact_exists(receipt_path, receipt, task_root, errors, warnings=None):
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
        check_nonempty_body(resolved, errors)
        scalars, err = parse_frontmatter(resolved)
        if err:
            return  # artifact may legitimately have no frontmatter (e.g. an index) — don't fail on that
        atype = scalars.get("artifact_type", "")
        if warnings is not None and atype and atype not in ENVELOPE_REQUIRED and atype not in KNOWN_ARTIFACT_TYPES:
            warnings.append(f"{resolved}: artifact_type '{atype}' not in known ledger "
                            f"(typo? or update KNOWN_ARTIFACT_TYPES)")
        if warnings is not None:
            check_research_vocab(resolved, scalars, warnings)
        if scalars.get("task_id") and receipt.get("task_id") and scalars["task_id"] != receipt["task_id"]:
            errors.append(f"{resolved}: task_id '{scalars['task_id']}' != receipt task_id '{receipt['task_id']}'")
        author = scalars.get("author_agent", "")
        if author and receipt.get("from_agent") and author != receipt["from_agent"]:
            errors.append(f"{resolved}: author_agent '{author}' != receipt from_agent '{receipt['from_agent']}'")
        # A test result that actually ran must carry an inspectable evidence handle, not just a status word.
        if scalars.get("artifact_type", "") == "TestExecutionResult" and scalars.get("status", "") in TEST_STATUS_NEEDS_EVIDENCE:
            check_test_evidence(resolved, scalars.get("status", ""), errors)


def check_test_evidence(artifact_path, status, errors):
    """A TestExecutionResult that ran must carry at least one inspectable evidence handle in its
    body — an artifact/log file path, a URL/MR/CI/log link, or a non-empty fenced command-output
    block — so the sponsor always has a path or excerpt to open. A bare 'passed'/'failed' word
    does not count; neither does a .md citation (e.g. the test plan itself) or an empty fence."""
    try:
        with open(artifact_path, encoding="utf-8") as fh:
            text = fh.read()
    except OSError:
        return  # existence already reported by the caller
    lines, body = text.splitlines(), text
    if lines and lines[0].strip() == "---":
        for i in range(1, len(lines)):
            if lines[i].strip() == "---":
                body = "\n".join(lines[i + 1:])
                break
    has_handle = bool(
        re.search(r"[\w./\-]+\.(log|jsonl|json|txt|csv|xml|html|png|jpg|jpeg|gif|out|har)\b", body)
        or re.search(r"https?://", body)
        or any(m.strip() for m in re.findall(r"```[^\n]*\n(.*?)```", body, re.S))
    )
    if not has_handle:
        errors.append(
            f"{artifact_path}: artifact_type=TestExecutionResult status='{status}' but no inspectable "
            f"evidence handle found in the body (need at least one: an artifact/log file path, a "
            f"URL/MR/CI/log link, or a non-empty fenced command-output block)"
        )


def sweep(task_root, errors, warnings):
    handoffs = os.path.join(task_root, "handoffs")
    if not os.path.isdir(handoffs):
        errors.append(f"{handoffs}: no handoffs/ directory to sweep")
        return
    receipts = sorted(f for f in os.listdir(handoffs) if f.endswith("-receipt.md"))
    if not receipts:
        warnings.append(f"{handoffs}: no *-receipt.md files found")
    # An assignment with no receipt is invisible to a receipt-driven sweep; surface it
    # (warn, not fail — conditional phases legitimately go unexecuted) so pre-delivery
    # reconciliation sees every dangling dispatch.
    assignments = sorted(f for f in os.listdir(handoffs)
                         if f.endswith(".md") and not f.endswith("-receipt.md"))
    for af in assignments:
        if af[:-len(".md")] + "-receipt.md" not in receipts:
            warnings.append(f"{os.path.join(handoffs, af)}: assignment has no receipt "
                            f"(skipped, truncated, or forgotten phase)")
    for rf in receipts:
        receipt_path = os.path.join(handoffs, rf)
        assignment_path = os.path.join(handoffs, rf[: -len("-receipt.md")] + ".md")
        if os.path.exists(assignment_path):
            check_pair(assignment_path, receipt_path, task_root, errors, warnings)
        else:
            warnings.append(f"{receipt_path}: no matching assignment '{os.path.basename(assignment_path)}'")
            r = check_shape(receipt_path, errors, warnings)
            if r:
                check_artifact_exists(receipt_path, r, task_root, errors, warnings)


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
