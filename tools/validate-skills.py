#!/usr/bin/env python3
"""Validate AgentCorp skill metadata.

This intentionally checks only repository-level skill metadata contracts:
SKILL.md frontmatter and agents/openai.yaml interface fields. It does not judge
role behavior or delivery artifacts.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILLS_DIR = ROOT / "agentcorp"
NAME_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
SKILL_REF_RE = re.compile(r"\$[a-z0-9]+(?:-[a-z0-9]+)*")
MIN_SHORT_DESCRIPTION = 25
MAX_SHORT_DESCRIPTION = 64
# Claude Code reserves these SKILL.md frontmatter fields for host behavior (effort
# overrides the session reasoning level, model swaps the model, context/agent fork a
# subagent). An AgentCorp skill declaring one would silently change host behavior —
# our pipeline knobs live in the invocation text (key:value), never in frontmatter.
RESERVED_FRONTMATTER = ("effort", "model", "context", "agent")
HINT_KEY_RE = re.compile(r"\[([a-z][a-z0-9_-]*):")


def parse_scalar_block(text: str) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw in text.splitlines():
        if not raw.strip() or raw.startswith((" ", "\t", "-")):
            continue
        if ":" not in raw:
            continue
        key, value = raw.split(":", 1)
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in ("'", '"'):
            value = value[1:-1]
        values[key.strip()] = value
    return values


def read_frontmatter(path: Path) -> tuple[dict[str, str] | None, str | None]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return None, "missing YAML frontmatter"
    end = text.find("\n---", 4)
    if end == -1:
        return None, "missing closing frontmatter delimiter"
    return parse_scalar_block(text[4:end]), None


def read_interface(path: Path) -> tuple[dict[str, str] | None, str | None]:
    if not path.exists():
        return None, "missing agents/openai.yaml"
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    try:
        start = next(i for i, line in enumerate(lines) if line.strip() == "interface:")
    except StopIteration:
        return None, "missing interface block"
    block = []
    for line in lines[start + 1 :]:
        if line and not line.startswith((" ", "\t")):
            break
        block.append(line.strip())
    return parse_scalar_block("\n".join(block)), None


def has_when_to_use(description: str) -> bool:
    triggers = ("当", "用于", "Use when", "use when", "When")
    return any(trigger in description for trigger in triggers)


def validate_skill(skill_dir: Path) -> list[str]:
    errors: list[str] = []
    rel = skill_dir.relative_to(ROOT)
    skill_md = skill_dir / "SKILL.md"
    frontmatter, error = read_frontmatter(skill_md)
    if error:
        return [f"{rel}/SKILL.md: {error}"]

    assert frontmatter is not None
    name = frontmatter.get("name", "").strip()
    description = frontmatter.get("description", "").strip()

    if name != skill_dir.name:
        errors.append(f"{rel}/SKILL.md: name '{name}' must match directory '{skill_dir.name}'")
    if not NAME_RE.fullmatch(name):
        errors.append(f"{rel}/SKILL.md: name must be lowercase hyphen-case")
    if not description:
        errors.append(f"{rel}/SKILL.md: description is required")
    elif not has_when_to_use(description):
        errors.append(f"{rel}/SKILL.md: description must include when-to-use trigger language")
    if len(description) > 1024:
        errors.append(f"{rel}/SKILL.md: description is too long ({len(description)} > 1024)")

    for key in RESERVED_FRONTMATTER:
        if key in frontmatter:
            errors.append(
                f"{rel}/SKILL.md: frontmatter key '{key}' is reserved by Claude Code "
                f"(it silently changes host behavior); pipeline knobs go in the invocation text"
            )

    body = skill_md.read_text(encoding="utf-8")
    hint = frontmatter.get("argument-hint", "")
    hint_keys = HINT_KEY_RE.findall(hint)
    for key in hint_keys:
        if f"{key}:" not in body.split("---", 2)[-1]:
            errors.append(
                f"{rel}/SKILL.md: argument-hint declares '{key}:' but the body never "
                f"defines it — a hinted parameter the skill cannot act on"
            )

    interface, error = read_interface(skill_dir / "agents" / "openai.yaml")
    if error:
        errors.append(f"{rel}/agents/openai.yaml: {error}")
        return errors

    assert interface is not None
    display_name = interface.get("display_name", "").strip()
    short_description = interface.get("short_description", "").strip()
    default_prompt = interface.get("default_prompt", "").strip()

    if not display_name:
        errors.append(f"{rel}/agents/openai.yaml: interface.display_name is required")
    if not short_description:
        errors.append(f"{rel}/agents/openai.yaml: interface.short_description is required")
    elif not (MIN_SHORT_DESCRIPTION <= len(short_description) <= MAX_SHORT_DESCRIPTION):
        errors.append(
            f"{rel}/agents/openai.yaml: interface.short_description must be "
            f"{MIN_SHORT_DESCRIPTION}-{MAX_SHORT_DESCRIPTION} characters "
            f"(got {len(short_description)})"
        )
    if not default_prompt:
        errors.append(f"{rel}/agents/openai.yaml: interface.default_prompt is required")
    elif f"${name}" not in default_prompt:
        errors.append(f"{rel}/agents/openai.yaml: default_prompt must mention ${name}")
    elif not SKILL_REF_RE.search(default_prompt):
        errors.append(f"{rel}/agents/openai.yaml: default_prompt must include a $skill-name reference")

    if hint_keys and not any(f"{key}:" in default_prompt for key in hint_keys):
        errors.append(
            f"{rel}/agents/openai.yaml: SKILL.md hints parameters ({', '.join(hint_keys)}) but "
            f"default_prompt names none of them — Codex users cannot discover the options"
        )

    return errors


def main() -> int:
    skills = sorted(path for path in SKILLS_DIR.iterdir() if (path / "SKILL.md").is_file())
    errors: list[str] = []
    for skill in skills:
        errors.extend(validate_skill(skill))

    if errors:
        for error in errors:
            print(f"[ERROR] {error}", file=sys.stderr)
        print(f"FAILED: {len(errors)} metadata issue(s) across {len(skills)} skills", file=sys.stderr)
        return 1

    print(f"OK: validated metadata for {len(skills)} AgentCorp skills")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
