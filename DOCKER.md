# Open-Capture Docker stack

This branch (`docker-clean`) ships a production-ready Docker setup for
Open-Capture alongside the original `docker-compose-dev.yml`. This file
documents the architecture, the trade-offs taken, how to run it, and
the bugs we hit while bringing it up.

## TL;DR

```bash
cp .env.example .env       # edit secrets
docker compose up -d       # dev (override auto-loaded; bind mounts, Vite HMR)
# or
docker compose -f docker-compose.yml up -d   # prod (nginx, prebuilt SPA)
```

The legacy minimal compose still works:
`docker compose -f docker-compose-dev.yml up`

## What lives on this branch

```
.env / .env.example          stack-wide vars (CUSTOM_ID, DB/Rabbit creds, ports)
docker-compose.yml           prod : 9 services, healthchecks, named volumes
docker-compose.override.yml  dev overlay (auto-loaded) : bind mounts, HMR
docker-compose-dev.yml       legacy minimal compose (kept for back-compat)

backend/Dockerfile           multi-stage (builder wheels → slim runtime)
backend/Dockerfile.dev       legacy single-stage (used by -dev.yml)
backend/docker-entrypoint.sh role dispatcher (api/worker-*/fs-watcher/init)
backend/docker-bootstrap.sh  idempotent tenant bootstrap (Docker-adapted
                             create_custom.sh)
backend/run.sh, run_verifier_worker.sh    legacy entrypoints used by -dev.yml

frontend/Dockerfile          multi-stage (Vite build → nginx:alpine)
frontend/Dockerfile.dev      Vite dev server (used by -dev.yml)
frontend/nginx.conf.template SPA + reverse proxy to backend:8000

postgres/Dockerfile          17.6 + preloaded SQL via initdb.d
postgres/Dockerfile.dev      same, legacy name
postgres/sql/                structure.sql, data_fr.sql, global.sql
```

## Architecture

```
                   nginx (frontend)  :80
                          │
                          │  /              → SPA index.html
                          │  /<CUSTOM_ID>/ws/         ─┐
                          │  /<CUSTOM_ID>/backend_oc/ ─┼─→  backend (gunicorn) :8000
                          ▼                            │
                                                       │
                       worker-verifier  ──── kuyruk ───┤
                       worker-splitter  ──── kuyruk ───┤
                       worker-mail      (cron-loop)    │ ──→ postgres :5432
                       fs-watcher       (inotify)      │ ──→ rabbitmq :5672
                       init             (one-shot)     │
                                                       │
   named volumes: pgdata, rabbitmq_data, custom, docservers, share
```

**One image, several roles.** `opencapture-backend` is built once
(multi-stage). Every backend service uses the same image and selects
its role via `command:`. `backend/docker-entrypoint.sh` dispatches the
roles: `api`, `worker-verifier`, `worker-splitter`, `worker-mail`,
`fs-watcher`, `init`.

**Tenant bootstrap.** `init` is a one-shot service that runs
`docker-bootstrap.sh` (a Docker-adapted, idempotent rewrite of
`create_custom.sh`). It creates `custom/<CUSTOM_ID>/`, materialises
`watcher.ini` with patched paths, writes `custom.ini`, and runs the
docserver/workflow/output path UPDATEs in postgres. All other backend
services `depends_on: init: condition: service_completed_successfully`.

**Schema load.** Owned by the postgres container via
`/docker-entrypoint-initdb.d/` — it runs the SQL on first start only,
when `pgdata` is empty. `docker-bootstrap.sh` bails out loudly if the
schema isn't there (external-DB edge case).

## Trade-offs taken

| Decision | Why |
|---|---|
| Mono-tenant per stack (1 `CUSTOM_ID`) | Covers 95% of use cases. Multi-tenant possible later by templating worker services per tenant. |
| nginx plain HTTP, port `${FRONTEND_PORT:-8080}` | TLS belongs to an external reverse-proxy (Traefik, Caddy). Keeps the stack focused. |
| PyTorch CPU | GPU support adds complexity and prerequisites; defer until needed. |
| `python:3.13-slim-bookworm` (pinned) | `python:3.13-slim` follows Debian testing (now Trixie). Trixie underwent the t64 rename (e.g. `libpoppler-cpp0v5` → `libpoppler-cpp2t64`) and broke our apt install. |
| Schema preload via postgres container, **not** bootstrap | Postgres already does it natively via `initdb.d` — no need to ship the SQL into the backend image. |
| Single combined image, role at runtime | Build once (~2 Go, mostly PyTorch). Avoid maintaining several near-identical Dockerfiles. |
| Compose v2.24+ (`!override` in override.yml) | Cleanest way to replace `ports:` between prod and dev. |

## Running it

### First run (prod)

```bash
cp .env.example .env
# edit POSTGRES_PASSWORD, RABBITMQ_PASS
docker compose -f docker-compose.yml up -d --build
```

Watch `init` finish, then services come up in cascade. The frontend
nginx is on `http://localhost:${FRONTEND_PORT:-8080}`.

### First run (dev)

```bash
cp .env.example .env
docker compose up -d --build
docker compose logs -f init       # wait for tenant init
```

Dev exposes:
- Frontend (Vite HMR) : `http://localhost:5173`
- Backend direct     : `http://localhost:8000`
- Postgres host port  : 5433
- RabbitMQ broker     : 5672, mgmt UI 15672

### Logs

```bash
docker compose logs -f backend
docker compose logs -f worker-verifier
docker compose logs -f fs-watcher
docker compose logs --tail=200 init      # re-read the bootstrap
```

### Reset everything

```bash
docker compose down -v          # removes named volumes
rm -rf ./data                   # removes dev bind-mount target
docker compose up -d --build
```

## Comparison with the `main` branch (option a)

`main` after commit `fe61887` carries only the **minimal** Docker
setup: `.env` with correct service hostnames, `docker-compose-dev.yml`
with a `worker_verifier` service, `run_verifier_worker.sh`, and a
cleaned-up `run.sh`. It does not provide:

- A tenant bootstrap that runs in a container (`create_custom.sh`
  still requires `chown www-data`, `crudini`, and a host-local `psql`)
- Worker services for splitter, mail, and fs-watcher
- A production-grade frontend (nginx + built SPA)
- Healthchecks or service-ordering via `depends_on: condition`
- A `share/` volume

Result on `main`: `docker compose up` starts gunicorn, but the API
crashes at first request because `custom/edissyum/` doesn't exist and
no service creates it. The legacy `create_custom.sh` can't be run
inside the backend container without adaptation.

Result on `docker-clean`: `docker compose up` brings the full pipeline
online from a clean checkout, including tenant init.

When `docker-clean` is merged back into `main`, the original
`docker-compose-dev.yml` and `Dockerfile.dev` remain so the legacy
dev path is unchanged.

## Troubleshooting log (issues hit during bring-up, in order)

### 1. `pull access denied for opencapture-backend`
Compose tried to pull the shared image instead of building it.
**Fix** : add `<<: *backend-build` (YAML anchor with the `build:`
clause) on every service that uses the image, not only on `init`.
Commit `456946a`.

### 2. `E: Unable to locate package libpoppler-cpp0v5`
`python:3.13-slim` was Trixie-based at the time, where the t64
rename moved the package to `libpoppler-cpp2t64`.
**Fix** : pin to `python:3.13-slim-bookworm`. Commit `aa25daa`.

### 3. `exec: /app/docker-entrypoint.sh: permission denied`
The dev override bind-mounts the entrypoint from the host, which
replaces the image's `chmod +x` version with a 0644 host file.
**Fix** : `chmod +x` on both scripts, `git update-index --chmod=+x`
to track the bit in git. Commit `08eba64`.

### 4. `ImportError: libpoppler-cpp.so.0: cannot open shared object file`
The wheel for the `pdftotext` pip module links against
`libpoppler-cpp.so.0v5`, but the runtime layer didn't include
`libpoppler-cpp0v5` (I had assumed `poppler-utils` would pull it
transitively — it doesn't).
**Fix** : reinstate `libpoppler-cpp0v5` explicitly. Commit `e53775c`.

### 5. `exec: fs-watcher: not found`
The pypi package `fs-watcher==1.0.11` installs its CLI as `watcher`,
not `fs-watcher`.
**Fix** : invoke `watcher` in the fs-watcher role. Commit `e53775c`.

### 6. `ModuleNotFoundError: No module named 'asyncore'`
`pyinotify` (the original, transitively pulled by `fs-watcher`)
imports `asyncore`, removed from the stdlib in Python 3.12+.
**Fix** : install `pyinotify-elephant-fork` (a maintained fork that
ships the same `pyinotify` top-level module) **after** the main pip
install, with `--force-reinstall --no-deps`. Commit `c7e2d6d`.

### 7. `Failed to read config file. Try -c parameter`
`watcher.ini` didn't exist — only the `.default`. The bootstrap
short-circuited on already-initialised tenants and never wrote it.
**Fix** : add an `ensure_watcher_ini()` function that runs before
the short-circuit; it copies `instance/config/watcher.ini.default`
into the tenant dir and patches the hard-coded host paths
(`/var/log/watcher/daemon.log`, `/run/watcher.pid`, `/var/share/`,
`/var/www/html/opencapture/`). Commit `9fe31d7`.

### 8. fs-watcher in an endless restart loop
`watcher … start` daemonises via `python-daemon`; the foreground
parent exits after the fork, so Docker thinks the container has
stopped and restarts it.
**Fix** : invoke `watcher … debug` instead — same behaviour but
stays in the foreground as PID 1. Commit `ad543b1`.

## What's left to do / not yet validated

- End-to-end pipeline test: drop a PDF in `share/entrant/verifier/…`
  and verify `fs-watcher` → `launch_worker.py` → `worker-verifier`
  → result in `share/export/verifier/`.
- Frontend login flow: `data_fr.sql` ships default users — confirm
  credentials or document how to reset the admin password.
- `/edissyum/ws/status` endpoint or equivalent health probe — current
  backend healthcheck uses `urlopen` against it; if the endpoint
  doesn't exist as such, replace with a real one or relax the check.
- TLS termination strategy (currently delegated to an external
  reverse proxy that you bring yourself).
- Multi-tenant: the architecture supports it (one worker pair per
  tenant), but it isn't templated in the compose. A `profiles:` setup
  or a generator script would be the natural extension.

## File reference

- `backend/docker-entrypoint.sh` : single source of truth for what
  each role does. New role? Add a `case` arm.
- `backend/docker-bootstrap.sh` : idempotent. Safe to re-run; the
  short-circuit and the `ensure_watcher_ini` helper guarantee no
  unwanted overwrites.
- `frontend/nginx.conf.template` : envsubst at container start.
  Variables: `${BACKEND_HOST}`, `${BACKEND_PORT}`, `${CUSTOM_ID}`.
- `.env.example` : authoritative list of variables consumed by the
  compose files.
