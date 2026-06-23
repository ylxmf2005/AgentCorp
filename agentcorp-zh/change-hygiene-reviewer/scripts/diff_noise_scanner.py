#!/usr/bin/env python3
"""Scan a unified diff for mechanical MR/PR noise and review chunks.

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

    diff_options = []
    if args.unified is not None:
        diff_options.append(f"--unified={args.unified}")
    if args.inter_hunk_context is not None:
        diff_options.append(f"--inter-hunk-context={args.inter_hunk_context}")

    if args.diff:
        cmd = ["git", "diff", *diff_options, args.diff]
        source = f"git diff {args.diff}"
    elif args.base:
        merge_base_cmd = ["git", "merge-base", args.base, args.head]
        try:
            merge_base_result = subprocess.run(
                merge_base_cmd,
                capture_output=True,
                text=True,
                timeout=args.timeout,
                check=False,
            )
        except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
            raise SystemExit(f"failed to run {' '.join(merge_base_cmd)}: {exc}") from exc
        if merge_base_result.returncode != 0:
            message = merge_base_result.stderr.strip() or (
                f"git merge-base failed with exit code {merge_base_result.returncode}"
            )
            raise SystemExit(message)
        merge_base = merge_base_result.stdout.strip()
        diff_range = f"{merge_base}..{args.head}"
        cmd = ["git", "diff", *diff_options, diff_range]
        source = f"git diff merge-base({args.base}, {args.head})..{args.head}"
    elif args.worktree:
        cmd = ["git", "diff", *diff_options]
        source = "git diff"
    else:
        cmd = ["git", "diff", "--staged", *diff_options]
        source = "git diff --staged"

    if args.paths:
        cmd.extend(["--", *args.paths])

    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=args.timeout, check=False)
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        raise SystemExit(f"failed to run {' '.join(cmd)}: {exc}") from exc

    if result.returncode not in (0, 1):
        raise SystemExit(result.stderr.strip() or f"git diff failed with exit code {result.returncode}")

    if not result.stdout and not args.diff and not args.base and not args.worktree:
        fallback = ["git", "diff", *diff_options]
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


def strip_internal_keys(findings: list[dict]) -> list[dict]:
    cleaned = []
    for item in findings:
        public_item = dict(item)
        public_item.pop("_line_keys", None)
        cleaned.append(public_item)
    return cleaned


def line_span(lines: Iterable[ChangeLine]) -> dict:
    old_lines = [line.old_line for line in lines if line.old_line is not None]
    new_lines = [line.new_line for line in lines if line.new_line is not None]
    return {
        "old": {"start": min(old_lines), "end": max(old_lines)} if old_lines else None,
        "new": {"start": min(new_lines), "end": max(new_lines)} if new_lines else None,
    }


def change_stats(lines: Iterable[ChangeLine]) -> dict:
    materialized = list(lines)
    changed = [line for line in materialized if line.kind in ("+", "-")]
    removed = [line for line in changed if line.kind == "-"]
    added = [line for line in changed if line.kind == "+"]
    if removed and added:
        change_kind = "modified"
    elif added:
        change_kind = "added-only"
    elif removed:
        change_kind = "removed-only"
    else:
        change_kind = "context-only"
    return {
        "changed_lines": len(changed),
        "removed_lines": len(removed),
        "added_lines": len(added),
        "context_lines": len([line for line in materialized if line.kind == " "]),
        "change_kind": change_kind,
        "line_span": line_span(materialized),
    }


def serialize_line(line: ChangeLine) -> dict:
    return {
        "kind": line.kind,
        "old_line": line.old_line,
        "new_line": line.new_line,
        "text": line.text,
    }


def chunk_record(
    *,
    chunk_id: int,
    granularity: str,
    file_path: str,
    hunk: Hunk,
    hunk_index: int,
    lines: list[ChangeLine],
    group_index: int | None = None,
    include_noise_signals: bool = False,
) -> dict:
    changed = [line for line in lines if line.kind in ("+", "-")]
    record = {
        "id": chunk_id,
        "granularity": granularity,
        "file": file_path,
        "line": line_ref(changed or lines),
        "hunk_index": hunk_index,
        "group_index": group_index,
        "hunk": hunk.header,
        **change_stats(lines),
        "lines": [serialize_line(line) for line in lines],
    }
    if include_noise_signals:
        noise_signals = []
        if granularity == "hunk":
            for group in changed_groups(hunk):
                noise_signals.extend(analyze_group(file_path, hunk, group))
        elif granularity == "group":
            noise_signals.extend(analyze_group(file_path, hunk, lines))
        record["noise_signals"] = strip_internal_keys(noise_signals)
    return record


def build_chunks(files: list[FileDiff], source: str, granularity: str, include_noise_signals: bool) -> dict:
    chunks = []
    total_hunks = 0
    total_changed = 0
    counts_by_file: Counter[str] = Counter()

    for file_diff in files:
        for hunk_index, hunk in enumerate(file_diff.hunks, start=1):
            total_hunks += 1
            total_changed += sum(1 for line in hunk.lines if line.kind in ("+", "-"))
            if granularity == "hunk":
                chunks.append(
                    chunk_record(
                        chunk_id=len(chunks) + 1,
                        granularity=granularity,
                        file_path=file_diff.path,
                        hunk=hunk,
                        hunk_index=hunk_index,
                        lines=hunk.lines,
                        include_noise_signals=include_noise_signals,
                    )
                )
                counts_by_file[file_diff.path] += 1
                continue

            if granularity == "group":
                for group_index, group in enumerate(changed_groups(hunk), start=1):
                    chunks.append(
                        chunk_record(
                            chunk_id=len(chunks) + 1,
                            granularity=granularity,
                            file_path=file_diff.path,
                            hunk=hunk,
                            hunk_index=hunk_index,
                            group_index=group_index,
                            lines=group,
                            include_noise_signals=include_noise_signals,
                        )
                    )
                    counts_by_file[file_diff.path] += 1
                continue

            if granularity == "line":
                line_index = 0
                for line in hunk.lines:
                    if line.kind not in ("+", "-"):
                        continue
                    line_index += 1
                    chunks.append(
                        chunk_record(
                            chunk_id=len(chunks) + 1,
                            granularity=granularity,
                            file_path=file_diff.path,
                            hunk=hunk,
                            hunk_index=hunk_index,
                            group_index=line_index,
                            lines=[line],
                            include_noise_signals=False,
                        )
                    )
                    counts_by_file[file_diff.path] += 1

    return {
        "status": "ok",
        "source": source,
        "granularity": granularity,
        "files_in_diff": len(files),
        "hunks_in_diff": total_hunks,
        "total_change_lines": total_changed,
        "chunks": len(chunks),
        "counts_by_file": dict(sorted(counts_by_file.items())),
        "items": chunks,
    }


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


def print_chunks(result: dict, max_chunks: int, max_chunk_lines: int) -> None:
    print(f"Diff Chunker - {result['source']}")
    print(
        f"Granularity: {result['granularity']}  "
        f"Files: {result['files_in_diff']}  "
        f"Hunks: {result['hunks_in_diff']}  "
        f"Chunks: {result['chunks']}  "
        f"Changed lines: {result['total_change_lines']}"
    )

    chunks = result["items"][:max_chunks]
    for item in chunks:
        print("")
        print(
            f"[{item['id']}] {item['granularity']} {item['file']}:{item['line']}  "
            f"{item['change_kind']} +{item['added_lines']}/-{item['removed_lines']}  "
            f"{item['hunk']}"
        )
        if item.get("noise_signals"):
            categories = Counter(signal["category"] for signal in item["noise_signals"])
            category_text = ", ".join(f"{key}:{value}" for key, value in sorted(categories.items()))
            print(f"  noise signals: {category_text}")
        for line in item["lines"][:max_chunk_lines]:
            old_line = "" if line["old_line"] is None else str(line["old_line"])
            new_line = "" if line["new_line"] is None else str(line["new_line"])
            print(f"  {line['kind']} {old_line:>5} {new_line:>5} | {line['text']}")
        remaining_lines = len(item["lines"]) - max_chunk_lines
        if remaining_lines > 0:
            print(f"  ... {remaining_lines} more line(s) omitted")

    remaining_chunks = result["chunks"] - len(chunks)
    if remaining_chunks > 0:
        print(f"\n... {remaining_chunks} more chunk(s) omitted")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Detect whitespace, wrapping, style-only diff noise, or emit review chunks.")
    source = parser.add_mutually_exclusive_group()
    source.add_argument("--diff", help="Git diff range, for example HEAD~1..HEAD")
    source.add_argument("--base", help="Base branch/ref; analyzes merge-base(base, head)..head")
    source.add_argument("--file", help="Read unified diff from a file")
    source.add_argument("--worktree", action="store_true", help="Analyze unstaged worktree diff")
    parser.add_argument("--head", default="HEAD", help="Head ref used with --base (default: HEAD)")
    parser.add_argument("--unified", type=int, help="Pass --unified=N to git diff before parsing hunks")
    parser.add_argument(
        "--inter-hunk-context",
        type=int,
        help="Pass --inter-hunk-context=N to git diff to merge nearby hunks",
    )
    parser.add_argument("--paths", nargs="*", help="Optional paths to pass after git diff --")
    parser.add_argument("--chunks", choices=("hunk", "group", "line"), help="Emit diff chunks instead of noise findings")
    parser.add_argument(
        "--with-noise-signals",
        action="store_true",
        help="Include scanner signals in hunk/group chunk output",
    )
    parser.add_argument("--json", action="store_true", help="Emit JSON")
    parser.add_argument("--max-findings", type=int, default=50, help="Maximum findings to print in text mode")
    parser.add_argument("--max-chunks", type=int, default=50, help="Maximum chunks to print in text mode")
    parser.add_argument("--max-chunk-lines", type=int, default=80, help="Maximum lines per chunk to print in text mode")
    parser.add_argument("--fail-on-noise", action="store_true", help="Exit non-zero when findings are present")
    parser.add_argument("--timeout", type=int, default=30, help="git diff timeout in seconds")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if args.head != "HEAD" and not args.base:
        raise SystemExit("--head can only be used with --base")
    if args.fail_on_noise and args.chunks:
        raise SystemExit("--fail-on-noise can only be used in scanner mode")

    diff_text, source = run_git_diff(args)
    if not diff_text.strip():
        if args.chunks:
            result = {
                "status": "ok",
                "source": source,
                "granularity": args.chunks,
                "files_in_diff": 0,
                "hunks_in_diff": 0,
                "total_change_lines": 0,
                "chunks": 0,
                "counts_by_file": {},
                "items": [],
            }
        else:
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
        files = parse_diff(diff_text)
        if args.chunks:
            result = build_chunks(files, source, args.chunks, args.with_noise_signals)
        else:
            result = analyze(files, source)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    elif args.chunks:
        print_chunks(result, args.max_chunks, args.max_chunk_lines)
    else:
        print_text(result, args.max_findings)

    if args.fail_on_noise and result["findings"]:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
