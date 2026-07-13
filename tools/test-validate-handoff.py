#!/usr/bin/env python3
"""Regression tests for validate-handoff.py — the fuzz cases that once passed silently.

Run: python3 tools/test-validate-handoff.py   (exit 0 = all expectations hold)

Each case builds a minimal assignment/receipt/artifact triple in a temp dir, mutates one
field, and asserts the validator's verdict: CAUGHT (exit 1), WARNED (exit 0 + warning),
or CLEAN (exit 0, no output). These encode the 2026-07-09 fuzz findings; extend the list
when a new silent-pass is discovered.
"""

import os
import re
import subprocess
import sys
import tempfile
import textwrap

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VALIDATOR = os.path.join(ROOT, "agentcorp", "delivery-orchestrator", "scripts", "validate-handoff.py")

GOOD = {
    "assignment": """---
artifact_type: PhaseAssignment
task_id: 20260709-120000-fuzz
from_agent: delivery-orchestrator
to_agent: implementation-engineer
phase: implement
status: assigned
effort: high
output_path: review/impl.md
---
Goal, inputs, constraints — enough body to be a real assignment.
""",
    "receipt": """---
artifact_type: PhaseReceipt
task_id: 20260709-120000-fuzz
from_agent: implementation-engineer
phase: implement
status: completed
artifact_path: review/impl.md
---
Receipt notes: implemented, focused tests run.
""",
    "artifact": """---
artifact_type: ImplementationResult
task_id: 20260709-120000-fuzz
author_agent: implementation-engineer
status: implemented
---
Changed files, commands, deviations — a real body.
""",
}


def run_case(name, expect, mutate):
    with tempfile.TemporaryDirectory() as root:
        os.makedirs(os.path.join(root, "handoffs"))
        os.makedirs(os.path.join(root, "review"))
        files = {k: v for k, v in GOOD.items()}
        mutate(files)
        a = os.path.join(root, "handoffs", "001-x.md")
        r = os.path.join(root, "handoffs", "001-x-receipt.md")
        art = os.path.join(root, "review", "impl.md")
        for path, key in ((a, "assignment"), (r, "receipt"), (art, "artifact")):
            with open(path, "w") as fh:
                fh.write(files[key])
        proc = subprocess.run([sys.executable, VALIDATOR, "--pair", a, r, "--task-root", root],
                              capture_output=True, text=True)
        warned = "WARN:" in proc.stderr
        if expect == "CAUGHT":
            ok = proc.returncode == 1
        elif expect == "WARNED":
            ok = proc.returncode == 0 and warned
        else:  # CLEAN
            ok = proc.returncode == 0 and not warned
        state = "ok " if ok else "FAIL"
        print(f"{state} [{expect:6}] {name}")
        if not ok:
            print(textwrap.indent(proc.stderr.strip(), "      "))
        return ok


def sub(key, old, new):
    def m(files):
        assert old in files[key], f"anchor missing in {key}"
        files[key] = files[key].replace(old, new)
    return m


def compose(*ms):
    def m(files):
        for f in ms:
            f(files)
    return m


# Rewrites the GOOD triple into a review-research handoff whose artifact is a
# ReviewResearchNote (verdict = truth axis, disposition = landing axis).
RESEARCH_NOTE = compose(
    sub("assignment", "to_agent: implementation-engineer", "to_agent: review-researcher"),
    sub("assignment", "phase: implement", "phase: review-research"),
    sub("receipt", "from_agent: implementation-engineer", "from_agent: review-researcher"),
    sub("receipt", "phase: implement", "phase: review-research"),
    sub("artifact", "artifact_type: ImplementationResult", "artifact_type: ReviewResearchNote"),
    sub("artifact", "author_agent: implementation-engineer", "author_agent: review-researcher"),
    sub("artifact", "status: implemented",
        "status: completed\nverdict: confirmed\nseverity: P1\ndisposition: fix-now"),
)


CASES = [
    ("baseline stays clean", "CLEAN", lambda files: None),
    ("research note confirmed + fix-now stays clean", "CLEAN", RESEARCH_NOTE),
    ("research note confirmed + defer stays clean", "CLEAN",
     compose(RESEARCH_NOTE, sub("artifact", "disposition: fix-now", "disposition: defer"))),
    ("research note confirmed without disposition", "WARNED",
     compose(RESEARCH_NOTE, sub("artifact", "\ndisposition: fix-now", ""))),
    ("research note disposition gibberish", "WARNED",
     compose(RESEARCH_NOTE, sub("artifact", "disposition: fix-now", "disposition: later-maybe"))),
    ("research note verdict gibberish", "WARNED",
     compose(RESEARCH_NOTE, sub("artifact", "verdict: confirmed", "verdict: probably-real"))),
    ("research note needs-human without disposition stays clean", "CLEAN",
     compose(RESEARCH_NOTE, sub("artifact", "verdict: confirmed", "verdict: needs-human"),
             sub("artifact", "\ndisposition: fix-now", ""))),
    ("receipt status assigned (work never concluded)", "CAUGHT",
     sub("receipt", "status: completed", "status: assigned")),
    ("receipt status gibberish", "WARNED",
     sub("receipt", "status: completed", "status: totally_fine_trust_me")),
    ("unknown effort value", "WARNED",
     sub("assignment", "effort: high", "effort: extreme")),
    ("unknown phase on both sides", "WARNED",
     compose(sub("assignment", "phase: implement", "phase: vibing"),
             sub("receipt", "phase: implement", "phase: vibing"))),
    ("fake agent consistent everywhere", "WARNED",
     compose(sub("assignment", "implementation-engineer", "quantum-vibes-engineer"),
             sub("receipt", "implementation-engineer", "quantum-vibes-engineer"),
             sub("artifact", "implementation-engineer", "quantum-vibes-engineer"))),
    ("task_id not timestamp-first", "WARNED",
     compose(sub("assignment", "20260709-120000-fuzz", "my-cool-task"),
             sub("receipt", "20260709-120000-fuzz", "my-cool-task"),
             sub("artifact", "20260709-120000-fuzz", "my-cool-task"))),
    ("unknown artifact_type", "WARNED",
     sub("artifact", "artifact_type: ImplementationResult", "artifact_type: FooBarReport")),
    ("compound skill and replay-report type are known", "CLEAN",
     compose(sub("assignment", "to_agent: implementation-engineer", "to_agent: compound"),
             sub("receipt", "from_agent: implementation-engineer", "from_agent: compound"),
             sub("artifact", "artifact_type: ImplementationResult", "artifact_type: ReplayReport"),
             sub("artifact", "author_agent: implementation-engineer", "author_agent: compound"))),
    ("empty artifact body", "CAUGHT",
     sub("artifact", "Changed files, commands, deviations — a real body.", "")),
    ("output_path dir without trailing slash accepts nested artifact", "CLEAN",
     compose(sub("assignment", "output_path: review/impl.md", "output_path: review"),
             sub("receipt", "artifact_path: review/impl.md", "artifact_path: review/impl.md"))),
]


TASK_RECORD = """---
artifact_type: TaskRecord
task_id: 20260709-120000-fuzz
author_agent: delivery-orchestrator
status: active
source_ref: origin/main
target_ref: origin/main
merge_base: 0123abcdef0123abcdef0123abcdef0123abcd
---
Success criteria, baseline, gate history — a real ledger body.
"""


def run_single(name, expect, content):
    """Validate one standalone file (shape-only mode)."""
    with tempfile.TemporaryDirectory() as root:
        path = os.path.join(root, "task.md")
        with open(path, "w") as fh:
            fh.write(content)
        proc = subprocess.run([sys.executable, VALIDATOR, path], capture_output=True, text=True)
        warned = "WARN:" in proc.stderr
        if expect == "WARNED":
            ok = proc.returncode == 0 and warned
        else:  # CLEAN
            ok = proc.returncode == 0 and not warned
        print(f"{'ok ' if ok else 'FAIL'} [{expect:6}] {name}")
        if not ok:
            print(textwrap.indent(proc.stderr.strip(), "      "))
        return ok


def test_baseline_mismatch(mutated_ref, expect_caught):
    """A pair whose assignment baseline disagrees with task.md must be CAUGHT."""
    with tempfile.TemporaryDirectory() as root:
        os.makedirs(os.path.join(root, "handoffs"))
        os.makedirs(os.path.join(root, "review"))
        a = os.path.join(root, "handoffs", "001-x.md")
        r = os.path.join(root, "handoffs", "001-x-receipt.md")
        art = os.path.join(root, "review", "impl.md")
        assignment = GOOD["assignment"].replace(
            "effort: high", f"effort: high\nsource_ref: {mutated_ref}\ntarget_ref: origin/main")
        for path, content in ((a, assignment), (r, GOOD["receipt"]), (art, GOOD["artifact"]),
                              (os.path.join(root, "task.md"), TASK_RECORD)):
            with open(path, "w") as fh:
                fh.write(content)
        proc = subprocess.run([sys.executable, VALIDATOR, "--pair", a, r, "--task-root", root],
                              capture_output=True, text=True)
        if expect_caught:
            ok = proc.returncode == 1 and "baseline drift" in proc.stderr
            label = "CAUGHT"
        else:
            ok = proc.returncode == 0
            label = "CLEAN "
        name = ("assignment source_ref disagrees with task.md" if expect_caught
                else "assignment baseline matching task.md stays clean")
        print(f"{'ok ' if ok else 'FAIL'} [{label}] {name}")
        if not ok:
            print(textwrap.indent(proc.stderr.strip(), "      "))
        return ok


def test_sweep_orphan_assignment():
    """--sweep must warn about an assignment that has no receipt (S2-F8)."""
    with tempfile.TemporaryDirectory() as root:
        os.makedirs(os.path.join(root, "handoffs"))
        os.makedirs(os.path.join(root, "review"))
        with open(os.path.join(root, "handoffs", "001-x.md"), "w") as fh:
            fh.write(GOOD["assignment"])
        with open(os.path.join(root, "handoffs", "001-x-receipt.md"), "w") as fh:
            fh.write(GOOD["receipt"])
        with open(os.path.join(root, "review", "impl.md"), "w") as fh:
            fh.write(GOOD["artifact"])
        with open(os.path.join(root, "handoffs", "002-orphan.md"), "w") as fh:
            fh.write(GOOD["assignment"].replace("phase: implement", "phase: verify"))
        proc = subprocess.run([sys.executable, VALIDATOR, "--sweep", "--task-root", root],
                              capture_output=True, text=True)
        ok = proc.returncode == 0 and "no receipt" in proc.stderr
        print(f"{'ok ' if ok else 'FAIL'} [WARNED] sweep flags assignment without receipt")
        return ok


def main():
    results = [run_case(*case[:2], case[2]) for case in CASES]
    results.append(run_single("task record with baseline refs stays clean", "CLEAN", TASK_RECORD))
    results.append(run_single("task record without baseline refs", "WARNED",
                              TASK_RECORD.replace("source_ref: origin/main\n", "")
                                         .replace("target_ref: origin/main\n", "")))
    results.append(run_single("merge_base not a sha", "WARNED",
                              TASK_RECORD.replace("merge_base: 0123abcdef0123abcdef0123abcdef0123abcd",
                                                  "merge_base: my-branch-tip")))
    results.append(run_single(
        "phase sequence with compound stays clean", "CLEAN",
        TASK_RECORD.replace(
            "Success criteria, baseline, gate history — a real ledger body.",
            "- validate-requirements -> implement -> verify -> acceptance-review -> compound -> deliver")))
    results.append(run_single(
        "phase sequence reaching deliver without compound", "WARNED",
        TASK_RECORD.replace(
            "Success criteria, baseline, gate history — a real ledger body.",
            "- validate-requirements -> implement -> verify -> acceptance-review -> deliver")))
    results.append(test_baseline_mismatch("feat/other-parent", True))
    results.append(test_baseline_mismatch("origin/main", False))
    results.append(test_sweep_orphan_assignment())
    failed = results.count(False)
    print(f"\n{len(results) - failed}/{len(results)} expectations hold")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
