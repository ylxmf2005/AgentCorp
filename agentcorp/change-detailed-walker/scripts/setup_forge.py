#!/usr/bin/env python3
"""确保本地 forge(Gitea)沙箱在跑,幂等。

设计:本地、私有、零公网——目标仓库的代码只镜像进这个本机 forge,不出网。
浏览器经端口转发访问 127.0.0.1:<port>(与本地静态服务同一可达路径)。

行为:
- 若 FORGE_URL 已可达(/api/v1/version 200)→ 直接复用,打印配置后退出 0。
- 否则在 HOME/walker-forgejo 下:必要时下载 Gitea 原生二进制(按本机 OS/arch)、
  写 app.ini(INSTALL_LOCK + sqlite + 绑 127.0.0.1)、migrate、建 admin、后台起 web、
  建 token、写 walker.env(chmod 600)。

为什么用 Gitea 二进制而不是 docker:本环境的 docker daemon 在远端 VM,容器端口
落在远端、浏览器不可达;原生进程绑 127.0.0.1 才走得通端口转发。Forgejo 无 macOS
二进制,故 macOS 用 Gitea(API 与 Forgejo 近一致,批量 review 端点本项目够用)。
"""
import argparse
import json
import os
import platform
import subprocess
import sys
import time
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from forge_common import load_config, reachable, api  # noqa: E402

HOME_DIR = Path.home() / "walker-forgejo"
GITEA_VERSION = "1.26.2"


def gitea_asset_url(version: str) -> str:
    sysname = platform.system().lower()  # darwin / linux
    arch = platform.machine().lower()
    if sysname == "darwin":
        a = "arm64" if arch in ("arm64", "aarch64") else "amd64"
        return f"https://dl.gitea.com/gitea/{version}/gitea-{version}-darwin-10.12-{a}"
    # linux
    if arch in ("arm64", "aarch64"):
        a = "arm64"
    elif arch in ("x86_64", "amd64"):
        a = "amd64"
    else:
        a = arch
    return f"https://dl.gitea.com/gitea/{version}/gitea-{version}-linux-{a}"


def ensure_binary(home: Path) -> Path:
    binp = home / "gitea"
    if binp.exists() and os.access(binp, os.X_OK):
        return binp
    home.mkdir(parents=True, exist_ok=True)
    url = gitea_asset_url(GITEA_VERSION)
    print(f"[setup] downloading gitea: {url}", file=sys.stderr)
    urllib.request.urlretrieve(url, binp)
    binp.chmod(0o755)
    return binp


def gitea(binp: Path, home: Path, *args, check=True):
    env = dict(os.environ, GITEA_WORK_DIR=str(home))
    return subprocess.run([str(binp), *args], cwd=str(home), env=env,
                          capture_output=True, text=True, check=check)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--port", type=int, default=3000)
    ap.add_argument("--user", default="walker")
    ap.add_argument("--password", default="Walker_dev_2026!")
    ap.add_argument("--home", default=str(HOME_DIR))
    args = ap.parse_args()

    home = Path(args.home)
    base_url = f"http://127.0.0.1:{args.port}"

    # 1) 已在跑就复用
    cfg = load_config()
    if cfg.get("url") and reachable(cfg):
        print(json.dumps({"status": "already-running", **{k: cfg[k] for k in ("url", "user")}}))
        return 0
    cfg_probe = {"url": base_url, "user": args.user, "token": cfg.get("token", "")}
    if reachable(cfg_probe) and cfg_probe.get("token"):
        print(json.dumps({"status": "already-running", "url": base_url, "user": args.user}))
        return 0

    # 2) 起服务
    binp = ensure_binary(home)
    (home / "custom" / "conf").mkdir(parents=True, exist_ok=True)
    (home / "data" / "repos").mkdir(parents=True, exist_ok=True)
    (home / "log").mkdir(parents=True, exist_ok=True)
    ini = home / "custom" / "conf" / "app.ini"
    if not ini.exists():
        secret = gitea(binp, home, "generate", "secret", "SECRET_KEY").stdout.strip()
        internal = gitea(binp, home, "generate", "secret", "INTERNAL_TOKEN").stdout.strip()
        u = os.environ.get("USER", "user")
        ini.write_text(f"""APP_NAME = Walker Review
RUN_USER = {u}
RUN_MODE = prod
WORK_PATH = {home}

[server]
PROTOCOL = http
HTTP_ADDR = 127.0.0.1
HTTP_PORT = {args.port}
DOMAIN = localhost
ROOT_URL = {base_url}/
DISABLE_SSH = true
OFFLINE_MODE = true
LFS_START_SERVER = false

[database]
DB_TYPE = sqlite3
PATH = {home}/data/gitea.db

[repository]
ROOT = {home}/data/repos

[security]
INSTALL_LOCK = true
SECRET_KEY = {secret}
INTERNAL_TOKEN = {internal}

[service]
DISABLE_REGISTRATION = true
REQUIRE_SIGNIN_VIEW = false

[log]
ROOT_PATH = {home}/log
MODE = console
LEVEL = warn

[indexer]
REPO_INDEXER_ENABLED = false
""")
        gitea(binp, home, "migrate", "-c", str(ini))
        # 建 admin(已存在则忽略错误)
        gitea(binp, home, "admin", "user", "create", "-c", str(ini),
              "--admin", "--username", args.user, "--password", args.password,
              "--email", f"{args.user}@local.test", "--must-change-password=false",
              check=False)

    # 后台起 web
    logf = open(home / "log" / "web.out", "a")
    env = dict(os.environ, GITEA_WORK_DIR=str(home))
    subprocess.Popen([str(binp), "web", "-c", str(ini)], cwd=str(home), env=env,
                     stdout=logf, stderr=logf, start_new_session=True)

    # 等 API
    cfg2 = {"url": base_url, "user": args.user, "token": ""}
    for _ in range(40):
        if reachable(cfg2):
            break
        time.sleep(1)
    else:
        print(json.dumps({"status": "error", "msg": "gitea did not become ready"}), file=sys.stderr)
        return 1

    # 建 token(basic auth)
    import base64
    auth = "Basic " + base64.b64encode(f"{args.user}:{args.password}".encode()).decode()
    r = api(cfg2, "POST", "/users/%s/tokens" % args.user,
            body={"name": "walker-%d" % int(time.time()),
                  "scopes": ["write:repository", "write:user", "write:issue", "write:organization"]},
            raw_auth=auth)
    token = (r.get("json") or {}).get("sha1") if isinstance(r.get("json"), dict) else None
    if not token:
        print(json.dumps({"status": "error", "msg": "token creation failed", "resp": r}), file=sys.stderr)
        return 1
    envf = home / "walker.env"
    envf.write_text(f"FORGE_URL={base_url}\nFORGE_USER={args.user}\nFORGE_TOKEN={token}\n")
    envf.chmod(0o600)
    print(json.dumps({"status": "started", "url": base_url, "user": args.user,
                      "env_file": str(envf)}))
    return 0


if __name__ == "__main__":
    sys.exit(main())
