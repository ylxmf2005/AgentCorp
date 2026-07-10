#!/usr/bin/env python3
"""Extract a normalized trajectory digest from a Claude Code or Codex session transcript.

Deterministic preprocessing for the `retrospect` skill: the raw transcript can be
megabytes; this script reduces it to an inspectable digest (turns, wall-clock, token
economics, tool profile, friction signals) so the analysis reads facts, not memory.
The digest cites entry indices — the skill opens raw ranges only where a signal points.

Usage:
  extract-trajectory.py PATH [--json]
      PATH: a Claude Code project transcript (~/.claude/projects/<slug>/<session>.jsonl)
            or a Codex rollout (~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl).
  extract-trajectory.py --locate [--cwd DIR]
      Print candidate transcript paths for DIR (default: current directory), newest first.

Python 3 stdlib only. Unknown entry shapes are counted, never fatal.
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone


def parse_ts(value):
    if not value:
        return None
    try:
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except ValueError:
        return None


def fmt_dur(seconds):
    if seconds is None:
        return "?"
    seconds = int(seconds)
    if seconds < 60:
        return f"{seconds}s"
    if seconds < 3600:
        return f"{seconds // 60}m{seconds % 60:02d}s"
    return f"{seconds // 3600}h{(seconds % 3600) // 60:02d}m"


def first_text(content, limit=90):
    """Pull the first human-readable text out of a message content field."""
    if isinstance(content, str):
        text = content
    elif isinstance(content, list):
        text = ""
        for block in content:
            if isinstance(block, dict) and block.get("type") == "text":
                text = block.get("text", "")
                break
            if isinstance(block, str):
                text = block
                break
    else:
        text = ""
    text = re.sub(r"\s+", " ", text).strip()
    return (text[: limit - 1] + "…") if len(text) > limit else text


ERRORY = re.compile(r"error|failed|exception|denied|traceback|not found|no such", re.I)


def load_entries(path):
    entries = []
    with open(path, encoding="utf-8", errors="replace") as fh:
        for i, line in enumerate(fh):
            line = line.strip()
            if not line:
                continue
            try:
                entries.append((i, json.loads(line)))
            except json.JSONDecodeError:
                continue
    return entries


# ---------------- Claude Code ----------------

def parse_claude(entries):
    events = []
    for i, d in entries:
        t = d.get("type")
        ts = parse_ts(d.get("timestamp"))
        if t == "user":
            msg = d.get("message", {})
            tur = d.get("toolUseResult")
            if tur is not None or d.get("isMeta"):
                is_err = bool(d.get("isApiErrorMessage")) or (
                    isinstance(tur, dict) and bool(tur.get("is_error") or tur.get("isError"))
                ) or (isinstance(tur, str) and bool(ERRORY.search(tur[:400])))
                events.append({"i": i, "ts": ts, "kind": "tool_result", "error": is_err})
            else:
                events.append({"i": i, "ts": ts, "kind": "user_message",
                               "text": first_text(msg.get("content"))})
        elif t == "assistant":
            msg = d.get("message", {})
            usage = msg.get("usage") or {}
            tools = [b.get("name", "?") for b in msg.get("content", [])
                     if isinstance(b, dict) and b.get("type") == "tool_use"]
            events.append({
                "i": i, "ts": ts, "kind": "assistant",
                "tools": tools,
                "in": usage.get("input_tokens", 0) or 0,
                "out": usage.get("output_tokens", 0) or 0,
                "cache_read": usage.get("cache_read_input_tokens", 0) or 0,
                "cache_write": usage.get("cache_creation_input_tokens", 0) or 0,
                "text": first_text(msg.get("content"), 70),
            })
        elif t == "system":
            events.append({"i": i, "ts": ts, "kind": "system",
                           "text": first_text(d.get("content", d.get("message", "")), 70)})
    return events


# ---------------- Codex ----------------

def parse_codex(entries):
    events = []
    for i, d in entries:
        ts = parse_ts(d.get("timestamp"))
        p = d.get("payload") if isinstance(d.get("payload"), dict) else {}
        pt = p.get("type")
        if d.get("type") == "response_item":
            if pt == "message" and p.get("role") == "user":
                events.append({"i": i, "ts": ts, "kind": "user_message",
                               "text": first_text(p.get("content"))})
            elif pt in ("message", "agent_message"):
                events.append({"i": i, "ts": ts, "kind": "assistant", "tools": [],
                               "in": 0, "out": 0, "cache_read": 0, "cache_write": 0,
                               "text": first_text(p.get("content"), 70)})
            elif pt in ("function_call", "custom_tool_call", "web_search_call"):
                events.append({"i": i, "ts": ts, "kind": "tool_call",
                               "tool": p.get("name") or pt})
            elif pt in ("function_call_output", "custom_tool_call_output"):
                out = p.get("output")
                out_s = out if isinstance(out, str) else json.dumps(out)[:400] if out else ""
                events.append({"i": i, "ts": ts, "kind": "tool_result",
                               "error": bool(ERRORY.search(out_s[:400]))})
            elif pt == "reasoning":
                events.append({"i": i, "ts": ts, "kind": "reasoning"})
        elif d.get("type") == "event_msg":
            if pt == "user_message":
                events.append({"i": i, "ts": ts, "kind": "user_message",
                               "text": first_text(p.get("message", ""))})
            elif pt == "token_count":
                info = p.get("info") or p
                usage = (info.get("total_token_usage") or info.get("last_token_usage")
                         or info if isinstance(info, dict) else {}) or {}
                events.append({"i": i, "ts": ts, "kind": "token_count",
                               "in": usage.get("input_tokens", 0) or 0,
                               "out": usage.get("output_tokens", 0) or 0,
                               "cache_read": usage.get("cached_input_tokens", 0) or 0})
            elif pt in ("task_started", "task_complete"):
                events.append({"i": i, "ts": ts, "kind": pt})
    return events


# ---------------- digest ----------------

def build_digest(events, path, runtime):  # noqa: C901
    stamps = [e["ts"] for e in events if e["ts"]]
    span = (stamps[-1] - stamps[0]).total_seconds() if len(stamps) > 1 else None

    # turns: a user_message opens a turn; everything until the next user_message belongs to it
    turns = []
    cur = None
    for e in events:
        if e["kind"] == "user_message":
            if cur:
                turns.append(cur)
            cur = {"start_i": e["i"], "ask": e.get("text", ""), "ts0": e["ts"], "ts1": e["ts"],
                   "tools": {}, "tool_errors": 0, "out": 0, "cache_read": 0, "cache_write": 0,
                   "fresh_in": 0, "assistant_msgs": 0}
            continue
        if cur is None:
            continue
        if e["ts"]:
            cur["ts1"] = e["ts"]
        if e["kind"] == "assistant":
            cur["assistant_msgs"] += 1
            cur["out"] += e.get("out", 0)
            cur["cache_read"] += e.get("cache_read", 0)
            cur["cache_write"] += e.get("cache_write", 0)
            cur["fresh_in"] += e.get("in", 0)
            for t in e.get("tools", []):
                cur["tools"][t] = cur["tools"].get(t, 0) + 1
        elif e["kind"] == "tool_call":
            cur["tools"][e["tool"]] = cur["tools"].get(e["tool"], 0) + 1
        elif e["kind"] == "tool_result" and e.get("error"):
            cur["tool_errors"] += 1
        elif e["kind"] == "token_count":
            cur["out"] = max(cur["out"], e.get("out", 0))
            cur["cache_read"] = max(cur["cache_read"], e.get("cache_read", 0))
            cur["fresh_in"] = max(cur["fresh_in"], e.get("in", 0))
    if cur:
        turns.append(cur)

    # Codex token_count carries CUMULATIVE totals: convert per-turn maxima to deltas.
    if runtime == "codex":
        prev = {"out": 0, "cache_read": 0, "fresh_in": 0}
        for t in turns:
            for k in ("out", "cache_read", "fresh_in"):
                cum = max(t[k], prev[k])
                t[k] = cum - prev[k]
                prev[k] = cum

    # gaps: long silences between consecutive timestamped events
    gaps = []
    prev = None
    for e in events:
        if not e["ts"]:
            continue
        if prev is not None:
            dt = (e["ts"] - prev[0]).total_seconds()
            if dt >= 300:
                gaps.append({"after_i": prev[1], "at_i": e["i"], "seconds": int(dt),
                             "before_kind": prev[2], "after_kind": e["kind"]})
        prev = (e["ts"], e["i"], e["kind"])

    # error bursts: >=3 tool errors within one turn
    bursts = [{"turn": idx, "ask": t["ask"], "errors": t["tool_errors"]}
              for idx, t in enumerate(turns) if t["tool_errors"] >= 3]

    tool_totals = {}
    for t in turns:
        for name, n in t["tools"].items():
            tool_totals[name] = tool_totals.get(name, 0) + n

    return {
        "path": path, "runtime": runtime, "entries": len(events),
        "span_seconds": int(span) if span else None,
        "turn_count": len(turns),
        "totals": {
            "output_tokens": sum(t["out"] for t in turns),
            "fresh_input_tokens": sum(t["fresh_in"] for t in turns),
            "cache_read_tokens": sum(t["cache_read"] for t in turns),
            "cache_write_tokens": sum(t["cache_write"] for t in turns),
            "tool_calls": sum(tool_totals.values()),
            "tool_errors": sum(t["tool_errors"] for t in turns),
        },
        "tools": dict(sorted(tool_totals.items(), key=lambda kv: -kv[1])),
        "turns": [{
            "n": i, "start_entry": t["start_i"], "ask": t["ask"],
            "duration": fmt_dur((t["ts1"] - t["ts0"]).total_seconds() if t["ts0"] and t["ts1"] else None),
            "assistant_msgs": t["assistant_msgs"], "tool_calls": sum(t["tools"].values()),
            "tool_errors": t["tool_errors"], "output_tokens": t["out"],
            "top_tools": dict(sorted(t["tools"].items(), key=lambda kv: -kv[1])[:4]),
        } for i, t in enumerate(turns)],
        "long_gaps": gaps[:20],
        "error_bursts": bursts[:20],
    }


def render_markdown(dg):
    L = []
    L.append(f"# Trajectory digest — {dg['runtime']}")
    L.append(f"- source: `{dg['path']}`")
    L.append(f"- entries: {dg['entries']}, turns: {dg['turn_count']}, span: {fmt_dur(dg['span_seconds'])}")
    t = dg["totals"]
    L.append(f"- tokens: out {t['output_tokens']:,} · fresh-in {t['fresh_input_tokens']:,} · "
             f"cache-read {t['cache_read_tokens']:,} · cache-write {t['cache_write_tokens']:,}")
    L.append(f"- tool calls: {t['tool_calls']} ({t['tool_errors']} error-shaped results)")
    if dg["tools"]:
        L.append("\n## Tool profile\n")
        for name, n in dg["tools"].items():
            L.append(f"- {name}: {n}")
    L.append("\n## Turns\n")
    L.append("| # | entry | duration | asst msgs | tools (errors) | out tokens | ask |")
    L.append("| - | - | - | - | - | - | - |")
    for tu in dg["turns"]:
        tools = ", ".join(f"{k}×{v}" for k, v in tu["top_tools"].items()) or "-"
        L.append(f"| {tu['n']} | {tu['start_entry']} | {tu['duration']} | {tu['assistant_msgs']} "
                 f"| {tools} ({tu['tool_errors']}) | {tu['output_tokens']:,} | {tu['ask']} |")
    if dg["long_gaps"]:
        L.append("\n## Long gaps (≥5m — could be user idle, quota wait, or a stall: check the raw entries)\n")
        for g in dg["long_gaps"]:
            L.append(f"- {fmt_dur(g['seconds'])} between entry {g['after_i']} ({g['before_kind']}) "
                     f"and {g['at_i']} ({g['after_kind']})")
    if dg["error_bursts"]:
        L.append("\n## Error bursts (≥3 error-shaped tool results in one turn)\n")
        for b in dg["error_bursts"]:
            L.append(f"- turn {b['turn']} ({b['errors']} errors): {b['ask']}")
    return "\n".join(L)


def detect_runtime(path, entries):
    for _, d in entries[:5]:
        if d.get("type") in ("session_meta", "turn_context", "response_item", "event_msg"):
            return "codex"
    return "claude-code"


def locate(cwd):
    out = []
    slug = "-" + re.sub(r"[/_.]", "-", os.path.abspath(cwd)).strip("-")
    cc = os.path.expanduser(os.path.join("~/.claude/projects", slug))
    if os.path.isdir(cc):
        for f in sorted(os.listdir(cc)):
            if f.endswith(".jsonl"):
                out.append(os.path.join(cc, f))
    cx = os.path.expanduser("~/.codex/sessions")
    if os.path.isdir(cx):
        for root, _dirs, files in os.walk(cx):
            for f in files:
                if f.startswith("rollout-") and f.endswith(".jsonl"):
                    out.append(os.path.join(root, f))
    out.sort(key=lambda p: os.path.getmtime(p), reverse=True)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("path", nargs="?")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--locate", action="store_true")
    ap.add_argument("--cwd", default=".")
    args = ap.parse_args()

    if args.locate:
        for p in locate(args.cwd)[:15]:
            print(p)
        return 0
    if not args.path:
        print("usage: extract-trajectory.py PATH [--json] | --locate [--cwd DIR]", file=sys.stderr)
        return 2
    entries = load_entries(args.path)
    if not entries:
        print(f"no parseable JSONL entries in {args.path}", file=sys.stderr)
        return 1
    runtime = detect_runtime(args.path, entries)
    events = parse_codex(entries) if runtime == "codex" else parse_claude(entries)
    dg = build_digest(events, args.path, runtime)
    print(json.dumps(dg, indent=2, default=str) if args.json else render_markdown(dg))
    return 0


if __name__ == "__main__":
    sys.exit(main())
