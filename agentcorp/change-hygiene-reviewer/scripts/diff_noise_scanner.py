#!/usr/bin/env python3
"""Scan a unified diff for mechanical MR/PR noise.

The scanner is intentionally conservative: it reports formatting-like signals
that need human review, not definitive correctness findings.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from collections import Counter
from dataclasses import dataclass, field
from difflib import SequenceMatcher
from pathlib import Path
from typing import Iterable


HUNK_RE = re.compile(r"@@ -(?P<old>\d+)(?:,(?P<old_count>\d+))? \+(?P<new>\d+)(?:,(?P<new_count>\d+))? @@")
COMMENT_RE = re.compile(r"^\s*(#|//|/\*|\*|<!--|-->)")
TRAILING_COMMA_BEFORE_CLOSE_RE = re.compile(r",([\)\]\}])")


@dataclass
class ChangeLine:
    kind: str
    text: str
    old_line: int | None
    new_line: int | None


@dataclass
class Hunk:
    header: str
    old_start: int
    new_start: int
    lines: list[ChangeLine] = field(default_factory=list)


@dataclass
class FileDiff:
    path: str
    hunks: list[Hunk] = field(default_factory=list)


def run_git_diff(args: argparse.Namespace) -> tuple[str, str]:
    if args.file:
        return Path(args.file).read_text(encoding="utf-8", errors="replace"), f"file:{args.file}"

    if args.diff:
        cmd = ["git", "diff", args.diff]
        source = f"git diff {args.diff}"
    elif args.worktree:
        cmd = ["git", "diff"]
        source = "git diff"
    else:
        cmd = ["git", "diff", "--staged"]
        source = "git diff --staged"

    if args.paths:
        cmd.extend(["--", *args.paths])

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=args.timeout, check=False)
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        raise SystemExit(f"failed to run {' '.join(cmd)}: {exc}") from exc

    if result.returncode not in (0, 1):
        raise SystemExit(result.stderr.strip() or f"git diff failed with exit code {result.returncode}")

    if not result.stdout and not args.diff and not args.worktree:
        fallback = ["git", "diff"]
        if args.paths:
            fallback.extend(["--", *args.paths])
        fallback_result = subprocess.run(fallback, capture_output=True, text=True, timeout=args.timeout, check=False)
        if fallback_result.stdout:
            return fallback_result.stdout, "git diff (fallback; staged diff was empty)"

    return result.stdout, source


def parse_diff(diff_text: str) -> list[FileDiff]:
    files: list[FileDiff] = []
    current_file: FileDiff | None = None
    current_hunk: Hunk | None = None
    old_line = 0
    new_line = 0

    for raw in diff_text.splitlines():
        if raw.startswith("diff --git "):
            parts = raw.split(" b/", 1)
            path = parts[1] if len(parts) == 2 else raw.rsplit(" ", 1)[-1]
            current_file = FileDiff(path=path)
            files.append(current_file)
            current_hunk = None
            continue

        if current_file is None:
            continue

        if raw.startswith("@@ "):
            match = HUNK_RE.search(raw)
            if not match:
                continue
            old_line = int(match.group("old"))
            new_line = int(match.group("new"))
            current_hunk = Hunk(header=raw, old_start=old_line, new_start=new_line)
            current_file.hunks.append(current_hunk)
            continue

        if current_hunk is None or raw.startswith(("+++", "---")):
            continue

        if raw.startswith("\\ No newline"):
            continue

        if raw.startswith("-"):
            current_hunk.lines.append(ChangeLine("-", raw[1:], old_line, None))
            old_line += 1
        elif raw.startswith("+"):
            current_hunk.lines.append(ChangeLine("+", raw[1:], None, new_line))
            new_line += 1
        else:
            text = raw[1:] if raw.startswith(" ") else raw
            current_hunk.lines.append(ChangeLine(" ", text, old_line, new_line))
            old_line += 1
            new_line += 1

    return files


def compact(text: str) -> str:
    return re.sub(r"\s+", "", text)


def style_compact(text: str) -> str:
    value = compact(text)
    value = TRAILING_COMMA_BEFORE_CLOSE_RE.sub(r"\1", value)
    value = value.replace('"', "'")
    value = value.rstrip(";")
    return value


def is_comment_or_blank(line: ChangeLine) -> bool:
    return not line.text.strip() or bool(COMMENT_RE.match(line.text))


def line_ref(lines: Iterable[ChangeLine]) -> str:
    old_lines = [line.old_line for line in lines if line.old_line is not None]
    new_lines = [line.new_line for line in lines if line.new_line is not None]
    if new_lines:
        return f"+{min(new_lines)}"
    if old_lines:
        return f"-{min(old_lines)}"
    return "?"


def sample(lines: list[ChangeLine], limit: int = 2) -> list[str]:
    return [f"{line.kind}{line.text}"[:160] for line in lines[:limit]]


def changed_groups(hunk: Hunk) -> list[list[ChangeLine]]:
    groups: list[list[ChangeLine]] = []
    current: list[ChangeLine] = []
    for line in hunk.lines:
        if line.kind in ("+", "-"):
            current.append(line)
            continue
        if current:
            groups.append(current)
            current = []
    if current:
        groups.append(current)
    return groups


def finding(
    category: str,
    file_path: str,
    hunk: Hunk,
    lines: list[ChangeLine],
    detail: str,
    recommendation: str,
    confidence: str,
) -> dict:
    changed = [line for line in lines if line.kind in ("+", "-")]
    removed = [line for line in changed if line.kind == "-"]
    added = [line for line in changed if line.kind == "+"]
    return {
        "category": category,
        "file": file_path,
        "line": line_ref(changed),
        "hunk": hunk.header,
        "changed_lines": len(changed),
        "removed_lines": len(removed),
        "added_lines": len(added),
        "confidence": confidence,
        "detail": detail,
        "recommendation": recommendation,
        "sample_removed": sample(removed),
        "sample_added": sample(added),
        "_line_keys": [
            [file_path, line.kind, line.old_line, line.new_line]
            for line in changed
        ],
    }


def analyze_group(file_path: str, hunk: Hunk, group: list[ChangeLine]) -> list[dict]:
    findings: list[dict] = []
    removed = [line for line in group if line.kind == "-"]
    added = [line for line in group if line.kind == "+"]

    if not removed and not added:
        return findings

    if all(not line.text.strip() for line in group):
        findings.append(
            finding(
                "blank-line-only",
                file_path,
                hunk,
                group,
                "Only blank lines changed in this hunk.",
                "Revert unless the blank line change is required by the local formatter.",
                "high",
            )
        )
        return findings

    if all(is_comment_or_blank(line) for line in group):
        findings.append(
            finding(
                "comment-only",
                file_path,
                hunk,
                group,
                "The hunk only changes comments or blank lines.",
                "Keep only if the comment fixes stale or wrong information required by this task.",
                "medium",
            )
        )
        return findings

    if removed and added:
        removed_text = "\n".join(line.text for line in removed)
        added_text = "\n".join(line.text for line in added)
        removed_compact = compact(removed_text)
        added_compact = compact(added_text)
        removed_style = style_compact(removed_text)
        added_style = style_compact(added_text)

        if removed_compact == added_compact and removed_text != added_text:
            category = "over-wrapping" if len(removed) != len(added) else "whitespace-only"
            detail = (
                "The removed and added text are identical after whitespace is ignored."
                if category == "whitespace-only"
                else "The hunk appears to split or join the same expression without semantic change."
            )
            recommendation = (
                "Revert the whitespace-only hunk unless formatter output proves it is required."
                if category == "whitespace-only"
                else "Prefer the lower-diff surrounding style unless the project formatter requires this wrapping."
            )
            findings.append(finding(category, file_path, hunk, group, detail, recommendation, "high"))
            return findings

        if removed_style == added_style and removed_compact != added_compact:
            category = "over-wrapping" if len(removed) != len(added) else "style-only"
            detail = (
                "The hunk appears to split or join the same expression with only punctuation/style normalization."
                if category == "over-wrapping"
                else "The hunk differs only by style normalization such as quotes, semicolons, or trailing commas."
            )
            recommendation = (
                "Prefer the lower-diff surrounding style unless the project formatter requires this wrapping."
                if category == "over-wrapping"
                else "Revert or isolate this style-only change unless the formatter requires it."
            )
            findings.append(
                finding(
                    category,
                    file_path,
                    hunk,
                    group,
                    detail,
                    recommendation,
                    "medium",
                )
            )
            return findings

        if len(removed) != len(added):
            similarity = SequenceMatcher(None, removed_style, added_style).ratio()
            if similarity >= 0.96 and min(len(removed_style), len(added_style)) >= 20:
                findings.append(
                    finding(
                        "probable-over-wrapping",
                        file_path,
                        hunk,
                        group,
                        f"Line count changed but compact content is {similarity:.0%} similar.",
                        "Manually verify whether this is model-driven wrapping; keep only if it helps readability or formatter output requires it.",
                        "medium",
                    )
                )
                return findings

    return findings


def analyze(files: list[FileDiff], source: str) -> dict:
    findings: list[dict] = []
    total_changed = 0

    for file_diff in files:
        for hunk in file_diff.hunks:
            total_changed += sum(1 for line in hunk.lines if line.kind in ("+", "-"))
            for group in changed_groups(hunk):
                findings.extend(analyze_group(file_diff.path, hunk, group))

    flagged_keys = {
        tuple(line_key)
        for item in findings
        for line_key in item.pop("_line_keys", [])
    }
    counts = Counter(item["category"] for item in findings)
    noise_ratio = (len(flagged_keys) / total_changed) if total_changed else 0.0
    verdict = "clean"
    if noise_ratio >= 0.30 or len(findings) >= 10:
        verdict = "needs_cleanup"
    elif noise_ratio >= 0.10 or findings:
        verdict = "minor_noise"

    return {
        "status": "ok",
        "source": source,
        "files_in_diff": len(files),
        "total_change_lines": total_changed,
        "flagged_change_lines": len(flagged_keys),
        "noise_ratio": round(noise_ratio, 3),
        "verdict": verdict,
        "counts_by_category": dict(sorted(counts.items())),
        "findings": findings,
    }


def print_text(result: dict, max_findings: int) -> None:
    print(f"Diff Noise Scanner — {result['source']}")
    print(
        f"Files: {result['files_in_diff']}  "
        f"Changed lines: {result['total_change_lines']}  "
        f"Flagged lines: {result['flagged_change_lines']}  "
        f"Noise ratio: {result['noise_ratio']:.0%}"
    )
    print(f"Verdict: {result['verdict']}")

    if result["counts_by_category"]:
        print("Categories:")
        for category, count in result["counts_by_category"].items():
            print(f"  - {category}: {count}")

    findings = result["findings"][:max_findings]
    if findings:
        print("Findings:")
        for item in findings:
            print(f"  [{item['category']}] {item['file']}:{item['line']} ({item['confidence']})")
            print(f"    {item['detail']}")
            print(f"    Recommendation: {item['recommendation']}")
        remaining = len(result["findings"]) - len(findings)
        if remaining > 0:
            print(f"  ... {remaining} more finding(s) omitted")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Detect whitespace, wrapping, and style-only diff noise.")
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--diff", help="Git diff range, for example HEAD~1..HEAD")
    source.add_argument("--file", help="Read unified diff from a file")
    source.add_argument("--worktree", action="store_true", help="Analyze unstaged worktree diff")
    parser.add_argument("--paths", nargs="*", help="Optional paths to pass after git diff --")
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    parser.add_argument("--max-findings", type=int, default=50, help="Maximum findings to print in text mode")
    parser.add_argument("--fail-on-noise", action="store_true", help="Exit non-zero when findings are present")
    parser.add_argument("--timeout", type=int, default=30, help="git diff timeout in seconds")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    diff_text, source = run_git_diff(args)
    if not diff_text.strip():
        result = {
            "status": "ok",
            "source": source,
            "files_in_diff": 0,
            "total_change_lines": 0,
            "flagged_change_lines": 0,
            "noise_ratio": 0.0,
            "verdict": "clean",
            "counts_by_category": {},
            "findings": [],
        }
    else:
        result = analyze(parse_diff(diff_text), source)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print_text(result, args.max_findings)

    if args.fail_on_noise and result["findings"]:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
