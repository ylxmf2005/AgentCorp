"""共享:本地 forge(Gitea/Forgejo)配置加载与 REST 调用。

配置来源(优先级):环境变量 FORGE_URL/FORGE_USER/FORGE_TOKEN > ~/walker-forgejo/walker.env。
所有 API 走 token header 鉴权,无浏览器、无 F12。stdlib only。
"""
import json
import os
import urllib.request
import urllib.error
from pathlib import Path

DEFAULT_ENV = Path.home() / "walker-forgejo" / "walker.env"


def load_config(env_file: Path = DEFAULT_ENV) -> dict:
    cfg = {
        "url": os.environ.get("FORGE_URL", "").rstrip("/"),
        "user": os.environ.get("FORGE_USER", ""),
        "token": os.environ.get("FORGE_TOKEN", ""),
    }
    if (not cfg["url"] or not cfg["token"]) and env_file.exists():
        for line in env_file.read_text().splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip().lower().replace("forge_", "")
            if k in cfg and not cfg[k]:
                cfg[k] = v.strip()
    cfg["url"] = cfg["url"].rstrip("/")
    return cfg


def api(cfg: dict, method: str, path: str, body=None, expect_json=True, raw_auth=None):
    """调用 forge REST API。path 以 /api/v1/... 开头或相对(自动补前缀)。"""
    if not path.startswith("http"):
        if not path.startswith("/api/"):
            path = "/api/v1" + (path if path.startswith("/") else "/" + path)
        url = cfg["url"] + path
    else:
        url = path
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header("Content-Type", "application/json")
    if raw_auth:
        req.add_header("Authorization", raw_auth)
    elif cfg.get("token"):
        # Gitea/Forgejo 历史原因接受 "token <sha1>"
        req.add_header("Authorization", "token " + cfg["token"])
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            txt = resp.read().decode()
            code = resp.getcode()
    except urllib.error.HTTPError as e:
        txt = e.read().decode()
        code = e.code
    except urllib.error.URLError as e:
        return code_none(e)
    if expect_json:
        try:
            return {"code": code, "json": json.loads(txt) if txt else None}
        except json.JSONDecodeError:
            return {"code": code, "text": txt}
    return {"code": code, "text": txt}


def code_none(err):
    return {"code": 0, "error": str(err)}


def reachable(cfg: dict) -> bool:
    if not cfg.get("url"):
        return False
    r = api(cfg, "GET", "/version", expect_json=True)
    return r.get("code") == 200 and isinstance(r.get("json"), dict)
