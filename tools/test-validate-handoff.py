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


CASES = [
    ("baseline stays clean", "CLEAN", lambda files: None),
    ("receipt status assigned (work never concluded)", "CAUGHT",
     sub("receipt", "status: completed", "status: assigned")),
    ("receipt status gibberish", "WARNED",
     sub("receipt", "status: completed", "status: totally_fine_trust_me")),
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
    ("empty artifact body", "CAUGHT",
     sub("artifact", "Changed files, commands, deviations — a real body.", "")),
    ("output_path dir without trailing slash accepts nested artifact", "CLEAN",
     compose(sub("assignment", "output_path: review/impl.md", "output_path: review"),
             sub("receipt", "artifact_path: review/impl.md", "artifact_path: review/impl.md"))),
]


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
    results.append(test_sweep_orphan_assignment())
    failed = results.count(False)
    print(f"\n{len(results) - failed}/{len(results)} expectations hold")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
