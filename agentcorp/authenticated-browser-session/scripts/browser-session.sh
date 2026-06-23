#!/usr/bin/env bash
set -euo pipefail

PROFILE_DIR="${AGENTCORP_BROWSER_PROFILE:-${CHROME_COOKIE_JS_PROFILE:-$HOME/.agentcorp/browser-session-profile}}"
HOST="${AGENTCORP_BROWSER_HOST:-${CHROME_COOKIE_JS_HOST:-127.0.0.1}}"
PORT="${AGENTCORP_BROWSER_PORT:-${CHROME_COOKIE_JS_PORT:-9222}}"
URL="${1:-about:blank}"

usage() {
  cat <<EOF
Usage:
  $0 [url]

Environment:
  AGENTCORP_BROWSER_PROFILE   Profile dir, default \$HOME/.agentcorp/browser-session-profile
  AGENTCORP_BROWSER_HOST      Debug host, default 127.0.0.1
  AGENTCORP_BROWSER_PORT      Debug port, default 9222
  AGENTCORP_BROWSER_BIN       Browser binary/app override

Legacy fallback variables CHROME_COOKIE_JS_PROFILE/HOST/PORT are also accepted.
EOF
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 2 "http://$HOST:$PORT/json/version" >/dev/null 2>&1; then
  echo "Browser CDP is already available at http://$HOST:$PORT"
  exit 0
fi

if command -v lsof >/dev/null 2>&1 && lsof -nP -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $PORT is listening but does not expose Chrome CDP /json/version." >&2
  echo "Choose another port with AGENTCORP_BROWSER_PORT or stop the conflicting process." >&2
  exit 1
fi

mkdir -p "$PROFILE_DIR"

start_macos() {
  local app_name
  if [[ -n "${AGENTCORP_BROWSER_BIN:-}" ]]; then
    open -na "$AGENTCORP_BROWSER_BIN" --args "$@"
    return
  fi
  for app_name in "Google Chrome" "Chromium" "Microsoft Edge"; do
    if [[ -d "/Applications/$app_name.app" || -d "$HOME/Applications/$app_name.app" ]]; then
      open -na "$app_name" --args "$@"
      return
    fi
  done
  echo "No supported Chrome/Chromium browser app found. Set AGENTCORP_BROWSER_BIN." >&2
  exit 1
}

start_posix() {
  local bin
  if [[ -n "${AGENTCORP_BROWSER_BIN:-}" ]]; then
    "$AGENTCORP_BROWSER_BIN" "$@" >/dev/null 2>&1 &
    return
  fi
  for bin in google-chrome google-chrome-stable chromium chromium-browser microsoft-edge; do
    if command -v "$bin" >/dev/null 2>&1; then
      "$bin" "$@" >/dev/null 2>&1 &
      return
    fi
  done
  echo "No supported Chrome/Chromium browser binary found. Set AGENTCORP_BROWSER_BIN." >&2
  exit 1
}

ARGS=(
  "--user-data-dir=$PROFILE_DIR"
  "--remote-debugging-address=$HOST"
  "--remote-debugging-port=$PORT"
  "--no-first-run"
  "--new-window"
  "$URL"
)

case "$(uname -s)" in
  Darwin) start_macos "${ARGS[@]}" ;;
  *) start_posix "${ARGS[@]}" ;;
esac

for _ in $(seq 1 30); do
  if command -v curl >/dev/null 2>&1 && curl -fsS --max-time 1 "http://$HOST:$PORT/json/version" >/dev/null 2>&1; then
    echo "Browser CDP ready at http://$HOST:$PORT"
    echo "Profile: $PROFILE_DIR"
    exit 0
  fi
  sleep 0.5
done

echo "Browser started, but CDP did not become ready at http://$HOST:$PORT" >&2
exit 1
