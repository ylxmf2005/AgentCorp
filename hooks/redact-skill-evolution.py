#!/usr/bin/env python3
"""Privacy-minimize skill-evolution proposals before they are persisted."""

from __future__ import annotations

import ipaddress
import re
import sys
from urllib.parse import urlsplit


HOME_PATH = re.compile(r"(?<![\w])(?:/Users|/home)/[^/\s`\"']+")
WINDOWS_HOME = re.compile(r"(?i)(?<![\w])[A-Z]:\\Users\\[^\\\s`\"']+")
EMAIL = re.compile(r"(?<![\w.+-])[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}(?![\w-])", re.I)
PRIVATE_KEY = re.compile(
    r"-----BEGIN [^-\n]*PRIVATE KEY-----.*?-----END [^-\n]*PRIVATE KEY-----",
    re.S,
)
KNOWN_TOKEN = re.compile(
    r"(?<![A-Za-z0-9])(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,})(?![A-Za-z0-9])"
)
BEARER = re.compile(r"(?i)\bBearer\s+[A-Za-z0-9._~+/=-]{12,}")
SECRET_VALUE = re.compile(
    r"(?i)\b(api[_-]?key|access[_-]?token|refresh[_-]?token|secret|password|passwd|authorization|cookie)"
    r"(\s*[:=]\s*)([`\"']?)([^\s,;`\"']{6,})(\3)"
)
URL = re.compile(r"https?://[^\s<>\[\]{}()\"'`]+", re.I)
SECRET_QUERY = re.compile(
    r"(?i)([?&](?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|secret|password)=)[^&#\s]+"
)


def _private_host(host: str | None) -> bool:
    if not host:
        return False
    lowered = host.lower().rstrip(".")
    if lowered == "localhost" or lowered.endswith((".local", ".internal", ".corp", ".lan")):
        return True
    try:
        return ipaddress.ip_address(lowered).is_private
    except ValueError:
        return False


def _redact_url(match: re.Match[str]) -> str:
    value = match.group(0)
    try:
        parsed = urlsplit(value)
    except ValueError:
        return "<url>"
    if parsed.username or parsed.password or _private_host(parsed.hostname):
        return "<url>"
    return SECRET_QUERY.sub(r"\1<redacted>", value)


def redact(text: str) -> str:
    text = PRIVATE_KEY.sub("<redacted-private-key>", text)
    text = HOME_PATH.sub("<home>", text)
    text = WINDOWS_HOME.sub("<home>", text)
    text = EMAIL.sub("<email>", text)
    text = KNOWN_TOKEN.sub("<redacted>", text)
    text = BEARER.sub("Bearer <redacted>", text)
    text = SECRET_VALUE.sub(lambda m: f"{m.group(1)}{m.group(2)}<redacted>", text)
    return URL.sub(_redact_url, text)


def self_test() -> None:
    sample = (
        "Work in /Users/alice/company/repo with alice@example.com. "
        "api_key=secret-value-123 and Authorization: Bearer abcdefghijklmnop. "
        "See http://127.0.0.1:8080/x and https://github.com/example/repo?token=abc123xyz."
    )
    got = redact(sample)
    assert "/Users/alice" not in got
    assert "alice@example.com" not in got
    assert "secret-value-123" not in got
    assert "abcdefghijklmnop" not in got
    assert "127.0.0.1" not in got
    assert "abc123xyz" not in got
    assert "https://github.com/example/repo" in got


def main() -> int:
    if sys.argv[1:] == ["--self-test"]:
        self_test()
        print("redaction self-test OK")
        return 0
    sys.stdout.write(redact(sys.stdin.read()))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
