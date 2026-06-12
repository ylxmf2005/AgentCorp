#!/usr/bin/env python3
import argparse
import mimetypes
import re
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse


HOST = "127.0.0.1"
CONTENT_NAME_RE = re.compile(r"^f-[0-9a-f]{12}\.(old|new)$")


def parse_args():
    parser = argparse.ArgumentParser(
        description="Serve the hunk walkthrough viewer on 127.0.0.1."
    )
    parser.add_argument("--data", required=True, help="Directory containing diff.json")
    parser.add_argument("--port", type=int, default=8123, help="Local port")
    return parser.parse_args()


def fail(message):
    print(f"error: {message}", file=sys.stderr)
    return 2


def make_handler(viewer_dir, data_dir):
    viewer_dir = viewer_dir.resolve()
    data_dir = data_dir.resolve()

    class WalkthroughHandler(BaseHTTPRequestHandler):
        server_version = "HunkWalkthrough/1.0"

        def do_GET(self):
            self._handle()

        def _handle(self):
            route = unquote(urlparse(self.path).path)
            if route == "/":
                return self._send_file(viewer_dir / "index.html", "text/html; charset=utf-8")
            if route == "/data/diff.json":
                return self._send_file(data_dir / "diff.json", "application/json; charset=utf-8", no_store=True)
            if route == "/data/comments.jsonl":
                return self._send_file(data_dir / "comments.jsonl", "text/plain; charset=utf-8", no_store=True)
            if route.startswith("/data/contents/"):
                name = route.removeprefix("/data/contents/")
                if not CONTENT_NAME_RE.fullmatch(name):
                    return self._send_404(no_store=True)
                return self._send_file(data_dir / "contents" / name, "text/plain; charset=utf-8", no_store=True)
            if route.startswith("/data/"):
                return self._send_404(no_store=True)

            relative = route.lstrip("/")
            if not relative:
                relative = "index.html"
            target = (viewer_dir / relative).resolve()
            if viewer_dir not in (target, *target.parents):
                return self._send_404()
            mime_type = mimetypes.guess_type(str(target))[0] or "application/octet-stream"
            if mime_type.startswith("text/") or mime_type in {"application/javascript", "application/json"}:
                mime_type = f"{mime_type}; charset=utf-8"
            return self._send_file(target, mime_type)

        def _send_file(self, path, content_type, no_store=False):
            if not path.is_file():
                return self._send_404(no_store=no_store)
            try:
                payload = path.read_bytes()
            except OSError:
                return self._send_404(no_store=no_store)
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(payload)))
            if no_store:
                self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(payload)

        def _send_404(self, no_store=False):
            body = b"404 Not Found\n"
            self.send_response(404)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            if no_store:
                self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)

    return WalkthroughHandler


def main():
    args = parse_args()
    data_dir = Path(args.data).expanduser()
    diff_path = data_dir / "diff.json"
    if not diff_path.is_file():
        return fail(f"{diff_path} is required before starting the viewer")

    viewer_dir = Path(__file__).resolve().parents[1] / "assets" / "viewer"
    if not (viewer_dir / "index.html").is_file():
        return fail(f"viewer assets are missing under {viewer_dir}")

    handler = make_handler(viewer_dir, data_dir)
    try:
        httpd = ThreadingHTTPServer((HOST, args.port), handler)
    except OSError as exc:
        return fail(f"cannot bind {HOST}:{args.port}: {exc}. Try another port with --port")

    print(f"Serving walkthrough at http://127.0.0.1:{args.port}/", flush=True)
    print(f"Serving data from {data_dir.resolve()}", flush=True)
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
