#!/usr/bin/env python3
"""Inline the Longrein Walkthrough Mermaid runtime into an HTML file."""

from __future__ import annotations

import argparse
from pathlib import Path


MARKER = "<!-- LONGREIN_WALKTHROUGH_RUNTIME -->"
LEGACY_MARKERS = (
    "<!-- GEMBA_WALKTHROUGH_RUNTIME -->",
    "<!-- AGENTCORP_WALKTHROUGH_RUNTIME -->",
    "<!-- SFSF_WALKTHROUGH_RUNTIME -->",
)


def script_safe(text: str) -> str:
    return text.replace("</script", "<\\/script")


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Inline Mermaid and the Walkthrough fullscreen runtime."
    )
    parser.add_argument("input", type=Path, help="HTML file containing the runtime marker")
    parser.add_argument("output", type=Path, nargs="?", help="Output HTML; defaults to input")
    args = parser.parse_args()

    skill_root = Path(__file__).resolve().parent.parent
    assets = skill_root / "assets"
    source = args.input.read_text(encoding="utf-8")
    marker_count = source.count(MARKER) + sum(source.count(m) for m in LEGACY_MARKERS)
    if marker_count != 1:
        raise SystemExit(
            f"expected exactly one {MARKER!r} (or legacy marker), found {marker_count}"
        )

    css = (assets / "walkthrough-runtime.css").read_text(encoding="utf-8")
    mermaid = script_safe((assets / "mermaid.min.js").read_text(encoding="utf-8"))
    runtime = script_safe((assets / "walkthrough-runtime.js").read_text(encoding="utf-8"))
    bundle = (
        f'<style data-longrein-walkthrough-runtime>\n{css}\n</style>\n'
        f'<script data-longrein-mermaid>\n{mermaid}\n</script>\n'
        f'<script data-longrein-walkthrough-runtime>\n{runtime}\n</script>'
    )

    rendered = source.replace(MARKER, bundle)
    for legacy in LEGACY_MARKERS:
        rendered = rendered.replace(legacy, bundle)
    output = args.output or args.input
    output.parent.mkdir(parents=True, exist_ok=True)
    if output.resolve() == args.input.resolve():
        temporary = output.with_name(f".{output.name}.tmp")
        temporary.write_text(rendered, encoding="utf-8")
        temporary.replace(output)
    else:
        output.write_text(rendered, encoding="utf-8")


if __name__ == "__main__":
    main()
