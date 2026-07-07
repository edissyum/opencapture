# Guide — Installation & tenant creation (OpenCapture Docker)

Multi-tenant deployment: a **shared infra** (Traefik, network, backend image) installed
**once per server**, then **one tenant per instance** under `stub-tenants/<id>/`. Three exposure
modes depending on TLS. Data kept outside the repo, under `$OC_DATA_ROOT` (e.g. `/opt/edissyum/opencapture`).

> ### 🔑 OC_DATA_ROOT — THE authoritative variable (one decision per server)
>
> **`OC_DATA_ROOT` is the single root of all data kept outside the repo: the ONLY value to decide
> per server. Everything else derives from it — never hard-code a data path anywhere else.**
>
> - **Where to set it:** at install time, in [01-install-general.md](01-install-general.md), via
>   `export OC_DATA_ROOT=…` added to `~/.bashrc` (then `source ~/.bashrc`). This is the **only place**
>   where the data location is chosen (prod: `/opt/edissyum/opencapture`; adapt per server, e.g. VM:
>   `/var/edissyum/opencapture`).
> - **What derives from it, automatically:** the **global `.env`** (01-install copies the bashrc value
>   into it) → the **data tree** `${OC_DATA_ROOT}/{tenants,shared-by-tenants/…}` → the **Traefik** paths
>   (certs/dynamic/letsencrypt) → **each tenant's `.env`** (`new-tenant.sh` reuses that same value) →
>   all the containers' **volumes** (`${OC_DATA_ROOT}/tenants/<id>/…`).
> - **Runtime precedence:** `docker compose` prefers the **exported variable** (bashrc) over the `.env`.
>   Keep it exported in your session: it wins; the `.env` is only a fallback (cron, sudo, non-login shell).
>
> ➡️ **To move all data:** change that **single** line in 01-install (bashrc), `source ~/.bashrc`, then
> move the folders.

| Doc / script | Role |
|---|---|
| [01-install-general.md](01-install-general.md) | infra install commands (Docker + Traefik) |
| [02-tenant-letsencrypt.md](02-tenant-letsencrypt.md) / [03-tenant-cert.md](03-tenant-cert.md) / [04-tenant-http.md](04-tenant-http.md) | per-mode runbooks (creation + operations) |
| [05-sftp-server.md](05-sftp-server.md) | multi-tenant SFTP server (ProFTPD `mod_sftp`) — install + adding a tenant |
| [06-webdav-server.md](06-webdav-server.md) | multi-tenant WebDAV server (Apache `mod_dav`) — operations + adding a tenant |
| [07-smb-server.md](07-smb-server.md) | multi-tenant SMB server (standalone Samba) — install + adding a tenant |
| [../new-tenant.sh](../new-tenant.sh) | creates a tenant's stub (copies the template + pre-fills the `.env`) |
| [../new-sftp-account.sh](../new-sftp-account.sh) | creates a tenant's SFTP access (chrooted virtual account) |
| [../new-webdav-account.sh](../new-webdav-account.sh) | creates a tenant's WebDAV access (htpasswd account) |
| [../new-smb-account.sh](../new-smb-account.sh) | creates a tenant's SMB access (local Samba account + share) |
| [../deploy.sh](../deploy.sh) | builds + (re)deploys an **existing** tenant |

---

## 1. General installation (once per server)

**Everything is in [01-install-general.md](01-install-general.md)** — to be run through **once
per server**, **line by line** (do NOT run it as a block: it is a copy-paste reference). It
covers, in order:

1. **System prerequisites**: Docker Engine + Compose v2 (official Docker repository).
2. **Source code**: `git clone` + `cd opencapture_docker`.
3. **Global `.env`**: `cp .env.example .env`, then `OC_DATA_ROOT` + `APP_UID`/`APP_GID`
   (= `id -u`/`id -g`, **numeric** values baked into the shared image).
4. **Data directory tree** outside the repo (`$OC_DATA_ROOT/{tenants,shared-by-tenants/...}`)
   + `chown` to the current user.
5. **`frontend` network** + **shared backend image** (`build backend`, only once).
6. **Shared Traefik** (single daemon, paths derived from `OC_DATA_ROOT`).

> ⚠️ First export the root for the whole session: `export OC_DATA_ROOT=/opt/edissyum/opencapture`
> (otherwise `${OC_DATA_ROOT:-../data}` falls back to `../data` and creates stray paths).

---

## 2. Create a tenant

### Important thing to know about resources

Resources are limited by default as shown below in infra/docker-compose.yml. Remember to adjust them according to the server's resources.

The [../checkos.sh](../checkos.sh) script provides a basic check of the OS resources against the machine's actual resources (RAM, swap, cores) versus the `x-res-*` profiles, and recommends a maximum number of tenants.

CPU 0 is not assigned to tenants so as not to block the server in case of overload. To be seen whether nice is useful.

```json
# --- QoS: resource profiles ------------------------------------------------
# mem_limit      = HARD RAM cap (OOM within the cgroup, not global)
# memswap_limit  = RAM+swap ; == mem_limit => swap FORBIDDEN ; > => swap allowed
# mem_swappiness = swap appetite (0 = never ; 60 = normal)
# cpu_shares     = RELATIVE weight under contention (does not cap)
x-res-postgres:  &res-postgres  { mem_limit: 512m,  memswap_limit: 512m,  mem_swappiness: 0,  cpu_shares: 1024 } # no swap
x-res-rabbitmq:  &res-rabbitmq  { mem_limit: 512m,  memswap_limit: 512m,  mem_swappiness: 0,  cpu_shares: 512  } 
x-res-backend:   &res-backend   { mem_limit: 1280m, memswap_limit: 1280m, mem_swappiness: 0,  cpu_shares: 1024 }
x-res-verifier:  &res-verifier  { mem_limit: 2g,    memswap_limit: 4g,    mem_swappiness: 60, cpu_shares: 2048 } # 2g of swap
x-res-splitter:  &res-splitter  { mem_limit: 1536m, memswap_limit: 2560m, mem_swappiness: 60, cpu_shares: 1536 }
x-res-mail:      &res-mail      { mem_limit: 512m,  memswap_limit: 512m,  mem_swappiness: 0,  cpu_shares: 256  }
x-res-fswatcher: &res-fswatcher { mem_limit: 256m,  memswap_limit: 256m,  mem_swappiness: 0,  cpu_shares: 256  }
x-res-frontend:  &res-frontend  { mem_limit: 128m,  memswap_limit: 128m,  mem_swappiness: 0,  cpu_shares: 256  }

# Reserves core 0 for the system ; tenants confined to cores 1-7.
x-cpuset-tenants: &cpuset { cpuset: "1-7" }
```

### The 3 modes

| Mode | Template | TLS | Specific prerequisites |
|---|---|---|---|
| **Let's Encrypt** | `_template-letsencrypt` | auto HTTPS (ACME) | public DNS `<fqdn>` + ports 80/443 open |
| **Provided cert** | `_template-cert` | HTTPS (PEM, by SNI) | drop the PEM + a `tls.yml` fragment |
| **Plain HTTP** | `_template-http` | none | none — ⚠ **no encryption** (internal / behind a reverse proxy) |

In what follows: `<id>` = the tenant identifier (lowercase/digits/`_`), `<fqdn>` = its domain.

### Procedure (with `new-tenant.sh`)

```bash
# 1. Create the stub. mode = http | le | cert
./new-tenant.sh <mode> <id>          # copies the template + pre-fills CUSTOM_ID, DB, user, OC_DATA_ROOT, APP_UID/GID

# 2. Fill in BY HAND what the script tells you
$EDITOR stub-tenants/<id>/.env       # OC_FQDN + POSTGRES_PASSWORD + RABBITMQ_PASS

# 3. (cert mode ONLY) cert on the Traefik side
sudo cp <id>.crt <id>.key ${OC_DATA_ROOT}/shared-by-tenants/traefik/certs/
sed "s/changeme/<id>/g" stub-tenants/<id>/tls.yml.example \
  | sudo tee ${OC_DATA_ROOT}/shared-by-tenants/traefik/dynamic/<id>.yml

# 4. Deploy
./deploy.sh <id>
```

> `new-tenant.sh` pre-fills `CUSTOM_ID` / `POSTGRES_DB` / `POSTGRES_USER` /
> `RABBITMQ_USER`, plus `OC_DATA_ROOT` (taken from the bashrc, else from the global `.env` — see the
> 🔑 box at the top of this guide) and `APP_UID`/`APP_GID` (taken from the global `.env`);
> you're only left with `OC_FQDN` + the 2 passwords. `deploy.sh <id>` chains
> `build frontend` + `up -d`, and the first startup triggers the `init` service which
> bootstraps the tenant (DB schema, config, assets, paths) — nothing to do by hand.
>
> ⚠️ **Manual** creation (copy the template + edit the `.env` by hand) has been
> deliberately removed: it multiplies mistakes (forgotten `changeme`,
> `CUSTOM_ID` ≠ folder name, misaligned `APP_UID`). **Always** use
> `new-tenant.sh`.

---

## 3. First login

- Open the tenant URL: `https://<fqdn>/` (LE / cert) or `http://<fqdn>/` (plain HTTP).
  In LE, the certificate is issued on the first request (~30 s).
- Default credentials: **`admin` / `admin`** → **change immediately** (UI: *Settings → Users*).

---

## 4. Operating a tenant

### 4.a General commands

```bash
# For a tenant by cd-ing into its folder
DIR=stub-tenants/<id>
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

$DC ps                  # container status
$DC logs init           # bootstrap (first startup)
$DC logs -f backend     # API logs (follow)
$DC restart backend     # restart a service
$DC exec backend env | grep -E 'CUSTOM_ID|POSTGRES|RABBIT'   # check the injected config
$DC down                # stop — NEVER `down -v` (-v deletes the data!)

# For a tenant from the repo root (the directory where you run git pull and which contains infra)
dc() { docker compose --project-directory "stub-tenants/$1" -f "stub-tenants/$1/docker-compose.yml" "${@:2}"; }
dc <id> down          
dc <id> restart
dc <id> up -d

# For all tenants, run a command like: down | stop | restart | "up -d" | "down -v" (below: down)
for d in stub-tenants/*/; do id=$(basename "$d"); case "$id" in _template-*) continue;; esac; [ -f "$d/docker-compose.yml" ] && docker compose --project-directory "$d" -f "$d/docker-compose.yml" down; done

```

### 4.b Rebuild after a code update (with `deploy.sh`):

```bash
# One tenant:
./deploy.sh --frontend-only <id>   # rebuilds the tenant frontend + recreates
./deploy.sh --backend-only  <id>   # rebuilds the shared backend image + recreates
./deploy.sh <id>                   # rebuilds backend + frontend + recreates

# All tenants, after a `git pull`:
./deploy.sh --frontend-only --all  # change to the nginx template OR a Traefik overlay
./deploy.sh --backend-only  --all  # change to the backend code (shared image)
./deploy.sh --all                  # when in doubt: backend + frontends
./deploy.sh --pull --all           # integrated git pull, then redeploy everything

```

### 4.b Stop/start containers

```bash

# Simplest: stop|start
cd ~/opencapture_docker/stub-tenants/<id>
docker compose stop
# start again later:
docker compose start

#or without changing directory (explicit form, like deploy.sh):
docker compose --project-directory stub-tenants/<id> -f stub-tenants/<id>/docker-compose.yml stop

# By-name variant (without worrying about the folder) VERY HANDY!
docker ps -aq --filter "name=opencapture_<id>-" | xargs -r docker stop

# Stop all containers of the same type (here worker-mail)
docker ps --format '{{.Names}}' | grep -- '-worker-mail-1$' | xargs -r docker stop

```

### 4.d View container logs

```bash
# Logs of a container (Docker) — the most common
docker logs opencapture_test2-worker-mail-1            # full history
docker logs --tail 50 opencapture_test2-worker-mail-1  # last 50 lines
docker logs -f opencapture_test2-worker-mail-1         # follow LIVE (Ctrl-C to exit)
docker logs -t opencapture_test2-worker-mail-1         # with timestamps
docker logs -t <container> | ts '%Y-%m-%d %H:%M:%S'    # same but local time instead of UTC (moreutils package, see general install)
docker logs --since 10m opencapture_test2-worker-mail-1   # since 10 min ago
docker logs --since 2026-06-23T12:00:00  opencapture_test2-worker-mail-1              # since a specific time


# The same service across ALL tenants at once (replace worker-mail with worker-verifier, backend, postgres…)
for c in $(docker ps -a --format '{{.Names}}' | grep -- '-worker-mail-1$'); do
  echo "===== $c ====="; docker logs --tail 15 "$c" 2>&1
done

```

#### 4.d.1 OpenCapture application logs (≠ container logs)

__Important__: for the Verifier/Splitter, the real business detail goes into the tenant's OpenCapture.log file, not to the container's output. To find it and then follow it:

```bash
docker exec opencapture_test2-backend-1 sh -lc 'find /app -name "*.log"'      # locate
docker exec -it opencapture_test2-backend-1 sh -lc 'tail -f /app/custom/test2/log/OpenCapture.log'

# Or directly from the host
tail -f ${OC_DATA_ROOT}/tenants/<tenant>/custom/<tenant>/data/log/OpenCapture.log
tail -f ${OC_DATA_ROOT}/tenants/<tenant>/custom/<tenant>/data/MailCollect/MAIL_1/<date>/BATCH_*/<ts>.log  # log per mail-collect batch
tail -f ${OC_DATA_ROOT}/tenants/<tenant>/custom/<tenant>/bin/ldap/log/technique.log  # LDAP technical log
```
### 4.d.2 Via docker compose (from the tenant folder)

```bash
cd stub-tenants/<tenant>   # or infra/ for "default"
docker compose logs -f worker-mail        # one service
docker compose logs --tail 50             # the whole tenant stack
```

### 4.d.3 OOM / kernel (when it gets killed)

```bash
journalctl -k --since "1 hour ago" | grep -iE 'oom-kill|out of memory|killed process'
dmesg -T | grep -i oom
```

### 4.d.4 Live resources (not logs, but handy alongside)

```bash
docker stats --no-stream     # per-container CPU/RAM snapshot
docker stats                 # continuous
```

### 4.d.5 Query in POSTGRESQL

```bash
cd ~/opencapture_docker
DIR=stub-tenants/<tenant>
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"


$DC exec -T postgres psql -U <user> -d <base> <<'SQL'
INSERT INTO "configurations" ("label", "data")
VALUES ('timeoutUpload', '{"type": "int", "value": "2000", "description": "Maximum file upload delay"}')
ON CONFLICT ("label") DO NOTHING;
SQL

$DC exec -T postgres psql -U <user> -d <base> -c \
"SELECT label FROM configurations WHERE label='timeoutUpload';
 SELECT id,label,parent FROM privileges WHERE label='certified_copy';"
 ```

### 4.d.6 Destroying a tenant

```bash
cd ~/opencapture_docker
ID=<tenant>                                  # <-- the tenant to destroy
DIR=stub-tenants/$ID
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

# 1) Containers + network + anonymous volumes + the tenant's local frontend image
$DC down --remove-orphans --volumes --rmi local

# 2) Tenant data (DB + rabbitmq + custom + docservers + share) — IRREVERSIBLE
sudo rm -rf ${OC_DATA_ROOT}/tenants/$ID

# 3) The stub (compose + .env + config)
rm -rf stub-tenants/$ID

# 4) (cert mode only) the tenant's dynamic Traefik fragment
sudo rm -f ${OC_DATA_ROOT}/shared-by-tenants/traefik/dynamic/$ID.yml

# 5) TODO: SFTP/SMB/WebDAV accounts 

```

### 4.d.7 Changing a tenant's FQDN

```bash

# Example tenant "demo"
cd ~/opencapture_docker

# Set the new FQDN in the .env
sed -i 's#^OC_FQDN=.*#OC_FQDN=demo.open-capture.com#' stub-tenants/demo/.env

# Rebuild and recreate
#   builds the opencapture-backend image
#   then up -d demo -> recreate = bootstrap rewrites custom.ini.url + Traefik new Host + LE cert
./deploy.sh demo

# Checks
grep '^url' /opt/edissyum/opencapture/tenants/demo/custom/custom.ini   # url = demo.open-capture.com
curl -sI https://demo.open-capture.com/ | head -5                       # HTTP 200/302 + valid cert
```

## 5. Tuning

```bash 
# Live
docker stats opencapture_<id>-worker-mail-1

# How many cores the container sees (= the % ceiling) 
# If docker stats never exceeds 100% while nproc shows 7 --> it really is a single core.
docker exec opencapture_<id>-worker-mail-1 nproc
 
```

---

## 6. Remote access 

### 6.1 SFTP access (optional)

Per-tenant file drop via **ProFTPD `mod_sftp`**, wired to
`${OC_DATA_ROOT}/tenants/<id>/share` (watched by the `fs-watcher`). **SFTP only**:
on a single-IP server you can't serve a per-tenant FTPS cert
(it would need SNI, which is unreliable on ProFTPD); SFTP has no domain cert
(single SSH host key) → makes multi-tenant trivial. Chrooted virtual accounts,
mapped to `$APP_UID/$APP_GID`.

```bash
# Once per server: install ProFTPD mod_sftp (see runbook: keys, firewall)
sudo bash runbooks/05-sftp-server.md        # run step by step, not as one block

# Per tenant (no reload needed):
sudo ./new-sftp-account.sh <id>              # creates the chrooted virtual account
# Client connection: sftp -P 2222 <id>@<server>
```

Design and operations details: [../infra-host/sftp/README.md](../infra-host/sftp/README.md).

---

### 6.2 WebDAV access (optional)

Per-tenant file drop as a **mapped network drive** (Windows Explorer, macOS
Finder, davfs2), wired to `${OC_DATA_ROOT}/tenants/<id>/share`
(watched by the `fs-watcher`). Served under **`https://<fqdn>/dav/`**: the
nginx frontend proxies `/dav/` to a per-tenant **Apache `mod_dav`** container
(nginx has no WebDAV module). **Path, not subdomain** → reuses the existing
DNS + certificate + Traefik route, **no** extra infra.
Per-tenant htpasswd Basic auth, files dropped as `$APP_UID/$APP_GID`.
**Opt-in**: nothing to install on the host, but the tenant must **enable the
WebDAV overlay** (otherwise `/dav/` returns 501 "not enabled").

```bash
# 1. Enable the overlay in stub-tenants/<id>/docker-compose.yml:
#      include:
#          - path: ../../infra/docker-compose.yml
#          - path: ../../infra/docker-compose.traefik-*.yml
#          - path: ../../infra/webdav/docker-compose.yml   # <- enables WebDAV
# 2. Deploy (builds the opencapture-webdav image if the overlay is included):
./deploy.sh <id>
# 3. Create an account (no reload):
sudo ./new-webdav-account.sh <id>           # login = <id> ; prompts for the password
# Client connection: mount https://<fqdn>/dav/ as a network drive.
```

Design and operations details: [06-webdav-server.md](06-webdav-server.md) +
[../infra/webdav/README.md](../infra/webdav/README.md).

---

## 6.3 SMB / Samba access (optional)

Per-tenant file drop as an **SMB network share** (Windows drive, macOS Finder,
Linux `mount.cifs`), wired to `${OC_DATA_ROOT}/tenants/<id>/share` (watched by
the `fs-watcher`). **A single standalone Samba daemon** installed on the host: SMB is
on **port 445 with no SNI**, not routable by domain (like SFTP, unlike
WebDAV) → tenants are told apart by the **share name** (`\\server\<id>`),
not by domain. **Local** accounts (`tdbsam`), files forced to
`$APP_UID/$APP_GID`. SMB3 encryption (`smb encrypt = required`) → **no
certificate** to manage.

```bash
# Once per server: install Samba (see runbook: service account, 445, conf)
sudo bash runbooks/07-smb-server.md         # run step by step, not as one block

# Per tenant (no restart, hot reload):
sudo ./new-smb-account.sh <id>              # creates the local account + the [<id>] share
# Client connection: \\<server>\<id>  (or \\<client-domain>\<id>), credentials <id>
```

Design and operations details: [07-smb-server.md](07-smb-server.md) +
[../infra-host/smb/README.md](../infra-host/smb/README.md).

---

## See also
- Per-mode runbooks: [02-tenant-letsencrypt.md](02-tenant-letsencrypt.md), [03-tenant-cert.md](03-tenant-cert.md), [04-tenant-http.md](04-tenant-http.md)
- SFTP server: [05-sftp-server.md](05-sftp-server.md) + [../infra-host/sftp/README.md](../infra-host/sftp/README.md)
- WebDAV server: [06-webdav-server.md](06-webdav-server.md) + [../infra/webdav/README.md](../infra/webdav/README.md)
- SMB server: [07-smb-server.md](07-smb-server.md) + [../infra-host/smb/README.md](../infra-host/smb/README.md)
- Multi-tenant architecture: [../infra/MULTITENANT.md](../infra/MULTITENANT.md)
- **Technical appendices** (rebuild, multi-stage, image roles, pipeline, per-container commands, glossary, reverse-proxy/real IP, tenant resolution & FQDN): below in this document.

---

# Appendices

> These appendices were the former `INSTALL.md`. They provide the **why** and the
> **technical detail**; the **how-to** stays in sections 1-7 above and
> in the runbooks.

## Appendix A — Do I need to rebuild?

> **Golden rule**: `git pull` (or editing a file) **rebuilds nothing** — the code is
> frozen into the image at `docker build`. And **after every build → `up -d`** (in each
> tenant), otherwise the container stays on the old image.

| What changed | Rebuild? | Command |
|---|---|---|
| **backend** code (`backend/src/…`) | ✅ backend (1×, shared) | `./deploy.sh --backend-only --all` |
| backend deps (`pip-requirements.txt`), `backend.Dockerfile`, `apt-requirements.txt` | ✅ backend | same |
| `infra/docker-entrypoint.sh` / `docker-bootstrap.sh` | ✅ backend | same |
| **frontend** code (`frontend/src/…`) | ✅ frontend (per tenant) | `./deploy.sh --frontend-only <tenant>` |
| frontend deps (`package.json`), `frontend.Dockerfile`, `nginx.conf.template` | ✅ frontend | same |
| `.env` → **`VITE_BACKEND_URL`** (baked into the bundle) | ✅ frontend | same |
| `docker-compose*.yml` (env, ports, volumes, command) | ❌ | `./deploy.sh --no-build <tenant>` |
| runtime `.env` (passwords, paths, `OC_FQDN`, `TZ`, `MAIL_POLL_INTERVAL`…) | ❌ | same |
| `.env` → **`APP_UID` / `APP_GID`** | ❌ (re-read at runtime by the entrypoint) | same |
| SQL (`postgres/sql/*.sql`) | ❌ (official image) | replayed **only on an empty DB** → `down -v` (⚠️ destructive) |
| AI models / `docservers` / `share` (bind mounts) | ❌ | nothing |
| postgres / rabbitmq / traefik | ❌ **never** | — |

After a **frontend** rebuild, clear the browser cache (**Ctrl+F5**).

## Appendix B — Why build "stages" (multi-stage)

The `Dockerfile`s have two `FROM`s: a **`builder`** stage (that builds) and a
**`runtime`** stage (the final image). **Only the last stage becomes the image**; the builder is
**discarded** — only what is explicitly `COPY --from=builder` survives.

**Frontend** ([../infra/frontend.Dockerfile](../infra/frontend.Dockerfile)):
- `builder` (`node`): `npm ci` + `npm run build` → produces `/app/dist`.
- `runtime` (`nginx`): `COPY --from=builder /app/dist /usr/share/nginx/html`.
- Discarded: Node, npm, `node_modules`, the sources. Final image ≈ 99 MB (nginx + bundle).

**Backend** ([../infra/backend.Dockerfile](../infra/backend.Dockerfile)):
- `builder`: compiles the Python *wheels* (with `build-essential`, dev headers…).
- `runtime`: installs the pre-compiled wheels + runtime libs only.
- Discarded: the compiler and the dev headers.

**Benefits**: small final image, **no toolchain or sources in production**
(reduced attack surface), clean build-time / runtime separation. Practical consequence:
inside the frontend container there is **no** `/app/dist` or sources — the served bundle
is at `/usr/share/nginx/html`. "Discarded" ≠ "deleted": the builder's layers stay in
the **build cache** (separate from the image) to speed up rebuilds.

## Appendix C — Technical details

### One backend image, several roles
All backend services share the `opencapture-backend` image. The image's `ENTRYPOINT` is
**always** [../infra/docker-entrypoint.sh](../infra/docker-entrypoint.sh); what changes
from one service to another is the `command:` declared in the compose — whose
**first argument is the role**. The entrypoint reads it (`ROLE="${1:-api}"`, default `api`),
waits for the relevant dependencies (Postgres/RabbitMQ depending on the role), then a `case "$ROLE"`
launches the right process: `gunicorn` for `api`, `kuyruk` for the workers, the `watcher` for
`fs-watcher`, `docker-bootstrap.sh` for `init`… So **same image, different `command:` →
different role**:

| Service | Role | Function |
|---|---|---|
| `init` | `init` | Idempotent tenant bootstrap (tree, config, DB paths), stops afterward. |
| `backend` | `api` | Flask REST API + gunicorn (internal port 8000). |
| `worker-verifier` | `worker-verifier` | Kuyruk worker (queue `verifier_<id>`). |
| `worker-splitter` | `worker-splitter` | Kuyruk worker (queue `splitter_<id>`). |
| `worker-mail` | `worker-mail` | IMAP poller (`MAIL_POLL_INTERVAL`). |
| `fs-watcher` | `fs-watcher` | Watches `share/entrant/`, triggers the workflows. |

The entrypoint starts as **root** (to `chown` the bind mounts) then **drops** to the service
account defined by `APP_UID`/`APP_GID`/`APP_USER` (in the `.env` — `1000` is only the
default; `01-install` sets it to `id -u`) via `gosu`. `APP_UID/APP_GID` are baked at build
**and** re-read at runtime → changing the UID via `.env` + `up -d` needs no rebuild.

**Example: `command: ["worker-splitter"]`.** The service is declared in the compose like this:

```yaml
worker-splitter:
    image: opencapture-backend          # same image as all the others
    command: ["worker-splitter"]        # <- the role
```

When the container starts, Docker combines the `ENTRYPOINT` and the `command:`, so it runs:
`/app/docker-entrypoint.sh worker-splitter`. Sequence:

1. The container starts as **root** → the entrypoint `chown`s the bind mounts then re-executes
   itself via `gosu` as `APP_UID:APP_GID` (the `.env` value).
2. `ROLE="${1:-api}"` → `ROLE=worker-splitter` (the first argument of `command:`).
3. `case "$ROLE"` hits the `worker-splitter` branch, which: waits for Postgres
   (`wait_for_postgres`) and RabbitMQ (`wait_for_rabbit`), ensures the tenant
   (`ensure_tenant` — bootstrap if `config.ini` is missing), `cd /app`, then:
   ```bash
   exec kuyruk \
       --app "custom.${CUSTOM_ID}.src.backend.process_queue_splitter.kuyruk" \
       worker --queue "splitter_${CUSTOM_ID}"
   ```
4. `exec` **replaces** the shell → `kuyruk` becomes PID 1 and consumes the RabbitMQ queue
   `splitter_<CUSTOM_ID>` (e.g. `splitter_site1`): every split job enqueued by
   the API/the fs-watcher is processed there.

Changing `command:` to `["api"]` or `["worker-verifier"]` on the **same image** is enough to
get a different role — that's the whole point of the single image.

### Pipeline fs-watcher → RabbitMQ → worker (producer / consumer)

The containers are **decoupled by RabbitMQ**: a *producer* puts a job in a
queue, a *consumer* (the worker) processes it. Example for the splitter:

```
[PDF dropped in share/entrant/splitter/…]
        │
        ▼  (fs-watcher container)
   watcher  ──► default_workflow.sh $file ──► launch_worker_splitter.py
        │                                          │
        │                                          ▼  main_splitter.launch(args)
        │                                   process_queue_splitter.launch(args)
        │                                   = @kuyruk.task(queue='splitter_<id>')
        │                                          │  (calling the task = PUBLISH)
        ▼                                          ▼
                              RabbitMQ  ─ queue "splitter_<CUSTOM_ID>" ─┐
                                                                        │  (consumes)
        ┌───────────────────────────────────────────────────────────  ▼
   (worker-splitter container)  kuyruk … worker --queue splitter_<id>
        └──► runs the body of launch(args): OCR + split, updates `monitoring`,
             writes to share/export/splitter/…
```

1. **Producer — `fs-watcher` container.** The `watcher` process watches the folders in
   `watcher.ini`; a drop triggers the configured command
   ([splitter_workflows/default_workflow.sh](../backend/installer/bin/scripts/splitter_workflows/default_workflow.sh)),
   which validates the PDF and launches
   [launch_worker_splitter.py](../backend/launch_worker_splitter.py) → inserts a
   `monitoring` row (`wait`) → [main_splitter.launch](../backend/src/main_splitter.py#L22) →
   calls `process_queue_splitter.launch(args)`. This function is decorated
   **`@kuyruk.task(queue='splitter_<id>')`**
   ([process_queue_splitter.py.default:44](../backend/src/process_queue_splitter.py.default#L44)):
   in kuyruk, **calling the task PUBLISHES it to RabbitMQ** (it processes nothing). fs-watcher
   returns immediately. *(The API/UI is the other producer, on upload.)*
2. **Consumer — `worker-splitter` container.** `kuyruk … worker --queue splitter_<id>`
   is subscribed to the **same** queue; on receipt, it **actually** runs the body of
   `launch(args)` (OCR + split, updates `monitoring`, output in
   `share/export/splitter/…`).
3. **Point of the decoupling**: if the worker is busy/stopped, jobs **pile up** in
   the queue and are processed when it comes back; you can **scale** (several workers on the same
   queue). Both roles share the same image: the producer calls the task to
   *enqueue*, the worker to *execute*. *(verifier: same pattern with the queue
   `verifier_<id>`.)*

### Per-tenant frontend + Traefik
The frontend is a **per-tenant** image (the build bakes the config). The overlay
[../infra/docker-compose.traefik.yml](../infra/docker-compose.traefik.yml) wires the frontend onto
the external `frontend` network and sets up a `Host(${OC_FQDN})` TLS route (resolver `myresolver`).
The only public entry point is Traefik (the other services stay on the internal network).

### TLS — client-provided certificate (served by SNI)
Procedure: section 2 above + [03-tenant-cert.md](03-tenant-cert.md). Principle: Traefik
picks the certificate at the TLS handshake **by SNI** (the name the browser requests), not
by the `Host()` rule; so it's enough for the cert's **SAN** to cover exactly `OC_FQDN`,
and the tenant router carries `tls=true` **without** `certresolver` (overlay
`docker-compose.traefik-cert.yml`). Advantage: **no need for public DNS or open ports 80/443**
(no ACME challenge). The cert (`.crt` = full chain, `.key` = private key **without
passphrase**) goes into `${OC_DATA_ROOT}/shared-by-tenants/traefik/certs/`; a per-tenant `tls.yml` fragment
in `${OC_DATA_ROOT}/shared-by-tenants/traefik/dynamic/<id>.yml` (file provider `watch=true`
→ **hot-reloaded**, also handy for renewal). Converting a `.pfx`/`.p12`
(Windows/AD) to PEM:

```bash
openssl pkcs12 -in client.pfx -nocerts -nodes -out client.key   # private key
openssl pkcs12 -in client.pfx -clcerts -nokeys  -out client.crt # leaf (+ chain if present)
```

> **Pitfalls.** The SAN must cover **exactly** `OC_FQDN` (`client.example.com` ≠
> `www.client.example.com`; a wildcard `*.example.com` does **not** cover the apex
> `example.com`). If no cert matches the SNI, Traefik serves its **default self-signed cert**
> (no routing error, but a browser warning).

> **Why these *per-tenant* files live under `shared-by-tenants/`.** Traefik is
> **a single shared daemon**: its file provider watches **a single** `dynamic/`
> folder and reads certs from **a single** `certs/`. Since the daemon is shared, so is its
> config folder — even though each entry (`<id>.crt`, `<id>.key`, `<id>.yml`)
> is specific to one tenant. So it's not misplaced tenant data, but the **shared
> infra's config**. *(Conversely, `shared-by-tenants/ai-models/` is genuinely
> shared; a tenant's own AI models stay under
> `tenants/<id>/docservers/.../ai/models`.)* Two consequences:
> - **Backup**: a backup of `tenants/<id>` alone does NOT capture its TLS cert/fragment
>   (they're under `shared-by-tenants/traefik/`) — include that folder.
> - **Deleting a tenant** (cert mode): also remove
>   `shared-by-tenants/traefik/certs/<id>.{crt,key}` + `dynamic/<id>.yml` (and purge its
>   entry in `letsencrypt/acme.json` if it was on Let's Encrypt).

### Development mode (Docker)
The overlay [../infra/docker-compose.override.yml](../infra/docker-compose.override.yml)
(auto-loaded when you run `docker compose up` **from `infra/`**): **bind-mounted** code
(no rebuild to change code), gunicorn `--reload`, and **Vite HMR** on `:5173` instead
of nginx. Launch: `cd infra && docker compose up -d --build`.
(`infra/docker-compose-dev.yml` is an old minimal overlay kept for compat —
prefer `override.yml`.) To develop **outside Docker** (bare-metal, systemd/venv), see
[../DEV_MODE.md](../DEV_MODE.md).

### Multi-tenant
Each tenant has its own Compose project `opencapture_<CUSTOM_ID>` (prefixed
containers/volumes/network → no collision), its own DB and its own RabbitMQ. To add one:
repeat the section 2 steps with a new `<id>`/FQDN. Details and alternatives (including the bare-metal
`create_custom.sh` script) in [../infra/MULTITENANT.md](../infra/MULTITENANT.md)
and [../infra/BOOTSTRAP_COMPARISON.md](../infra/BOOTSTRAP_COMPARISON.md).

### Compliance (optional)
A sealed **NF Z42-020** journal (SHA-256 chaining + RFC 3161 timestamping) is available,
**disabled by default**, for the Splitter module. See [../NF_Z42-020.md](../NF_Z42-020.md).

### Reference documentation
- [../infra/MULTITENANT.md](../infra/MULTITENANT.md) — multi-tenant organization (`include:` methodology).
- [../infra/BOOTSTRAP_COMPARISON.md](../infra/BOOTSTRAP_COMPARISON.md) — `create_custom.sh` (bare-metal) vs `docker-bootstrap.sh`.
- [../infra/SCHEDULING.md](../infra/SCHEDULING.md) — recurring tasks (Ofelia, **not integrated** as of today).
- [../TERMINOLOGIE.md](../TERMINOLOGIE.md) — why "tenant" rather than "custom"/"client".
- [../NF_Z42-020.md](../NF_Z42-020.md) — sealed journal (Splitter option).
- [../DEV_MODE.md](../DEV_MODE.md) — bare-metal development (outside Docker).

## Appendix D — Useful Docker commands (per container)

> **Targeting a tenant.** Simplest: cd into its folder, `docker compose`
> resolves the `.env` and project automatically:
> ```bash
> cd stub-tenants/site1       # or stub-tenants/test1 ; or infra/ for "default"
> docker compose ps
> docker compose exec backend bash
> docker compose logs -f worker-splitter
> ```
> Otherwise target the container by its name `opencapture_<id>-<service>-1`:
> ```bash
> docker exec -it opencapture_site1-backend-1 bash
> docker logs -f opencapture_site1-worker-splitter-1
> ```
> The backend containers run under the service account `APP_UID:APP_GID` (the
> `.env` value); `exec` opens as **root** by default. To act as the app: `docker compose exec -u "$APP_UID" backend bash`.

### Backend containers — `backend`, `worker-verifier`, `worker-splitter`, `worker-mail`, `fs-watcher`, `init`

Same `opencapture-backend` image, so the same tree:

| What | Path in the container |
|---|---|
| Application code | `/app` (`/app/src`, `wsgi.py`, `launch_worker*.py`) |
| Entrypoint / bootstrap | `/app/docker-entrypoint.sh`, `/app/docker-bootstrap.sh` |
| Tenant config | `/app/custom/<CUSTOM_ID>/config/{config.ini,secret_key,watcher.ini}` |
| Application log | `/app/custom/<CUSTOM_ID>/data/log/OpenCapture.log` |
| Processed documents | `/app/docservers/{verifier,splitter}/…` (including `ai/models`) |
| Inputs / outputs | `/app/share/entrant/…`, `/app/share/export/…` |
| Shared AI models | `/app/instance/artificial_intelligence/` |
| NLTK data | `/usr/local/share/nltk_data` |

Enter: `docker compose exec backend bash` (same for `worker-verifier`, etc.).
What to check per role:
- **backend (api)**: gunicorn responds → `docker compose exec backend python -c "import socket; socket.create_connection(('localhost',8000),3)"`; logs `docker compose logs backend`.
- **worker-verifier / worker-splitter**: `docker compose logs -f worker-splitter` (kuyruk started + jobs processed); see also `OpenCapture.log`.
- **worker-mail**: `docker compose logs -f worker-mail` (IMAP passes per `MAIL_POLL_INTERVAL`).
- **fs-watcher**: `docker compose logs fs-watcher` (line `using config: …/watcher.ini`) + check `…/config/watcher.ini` (watched folders).
- **init**: `docker compose logs init` (bootstrap without error); container `Exited (0)` = normal (one-shot).

### `postgres`
- Enter: `docker compose exec postgres bash` then `sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'`.
- Files: data `/var/lib/postgresql/data/pgdata`; init SQL `/docker-entrypoint-initdb.d/` (run **only once**, on an empty DB).
- Check: `docker compose exec postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'`; tables: `\dt`; e.g. `SELECT id,model_label,status FROM ai_models;`.

**Working in the database (psql).** The tenant's `.env` defines `POSTGRES_USER`/`POSTGRES_DB`;
we reuse them in the container via `sh -c '… "$POSTGRES_USER" … "$POSTGRES_DB"'`.

```bash
# 1) Interactive session (recommended for any MODIFICATION)
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
#   in psql:  \l (databases)  \dt (tables)  \d ai_models (columns)  \du (roles)  \q (quit)
#   then your queries, e.g.:
#     SELECT id, model_label, status FROM ai_models ORDER BY id;
#     BEGIN; UPDATE ai_models SET status='DEL' WHERE id IN (11,12); COMMIT;   -- ROLLBACK; to cancel

# 2) A one-line READ query, without entering psql (-T = no TTY)
docker compose exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id,model_label,status FROM ai_models ORDER BY id;"'

# 3) Replay a host SQL file into the database
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < my_script.sql

# 4) Backup (dump) to a host file, then restore
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup.sql
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < backup.sql
```

> ⚠️ Before any `UPDATE`/`DELETE`: first run the `SELECT` over the **same scope** to see the
> affected rows, wrap in `BEGIN; … COMMIT;` (and `ROLLBACK;` if needed), and do a
> `pg_dump` if the operation is sensitive. Reminder: the app does **soft-delete** (`status='DEL'`),
> it does not delete rows — prefer the same convention rather than a raw `DELETE`.

### `rabbitmq`
- Enter: `docker compose exec rabbitmq sh`.
- Files: data `/var/lib/rabbitmq`.
- Check: queues and pending messages → `docker compose exec rabbitmq rabbitmqctl list_queues name messages consumers` (look for `verifier_<id>`, `splitter_<id>`); management UI exposed in dev on `:15672`.

### `frontend` (nginx)
- Enter: `docker compose exec frontend sh`.
- Files: compiled SPA served from `/usr/share/nginx/html` (+ `/assets`); generated conf `/etc/nginx/conf.d/default.conf` (from the template `/etc/nginx/templates/default.conf.template`).
- Check: `docker compose exec frontend ls -l /usr/share/nginx/html` (bundle present + build date); `docker compose exec frontend nginx -t` (valid conf). After a front rebuild: **Ctrl+F5** in the browser (cache).

### `traefik` (container `opencapture_traefik`, separate project `traefik`)
- **No shell in the image** → no `exec`. We inspect via logs + dashboard.
- Check: `docker logs -f opencapture_traefik` (routers, ACME generation); dashboard on
  `127.0.0.1:8081` (SSH tunnel if remote).
- **Access the named volume `letsencrypt`** (it contains `acme.json` = private key +
  certificates). Unlike a bind mount, a **named volume** is not a host folder you
  choose — you access it like this:
  1. **Locate it**: `docker volume ls | grep letsencrypt` → real name **`traefik_letsencrypt`**
     (prefixed by the `traefik` project), then `docker volume inspect traefik_letsencrypt`
     (`Mountpoint` field = the real path on the host, under `/var/lib/docker/volumes/…`, root access).
  2. **Read its content** without a shell in Traefik: mount it in a throwaway container →
     `docker run --rm -v traefik_letsencrypt:/v alpine ls -l /v` (or `… cat /v/acme.json`).
  3. **Shortcut here**: this volume is actually **bind-backed** to `${LETSENCRYPT_PATH}`
     (= `${OC_DATA_ROOT}/shared-by-tenants/traefik/letsencrypt` in prod) — `docker volume inspect` shows it
     in `Options.device`. So the file is readable directly at
     **`${OC_DATA_ROOT}/shared-by-tenants/traefik/letsencrypt/acme.json`** on the host.

### Host ↔ container volume mapping

Per tenant — the host paths are the `.env` `*_PATH` values (in prod:
`${OC_DATA_ROOT}/tenants/<id>/…`; compose default if not set: `../data/<id>/…`):

| Host (prod) | Container | Content |
|---|---|---|
| `${OC_DATA_ROOT}/tenants/<id>/pgdata` | `postgres:/var/lib/postgresql/data` | PostgreSQL database |
| `${OC_DATA_ROOT}/tenants/<id>/rabbitmq` | `rabbitmq:/var/lib/rabbitmq` | RabbitMQ queues |
| `${OC_DATA_ROOT}/tenants/<id>/custom` | `backend:/app/custom` | tenant config, logs, MailCollect |
| `${OC_DATA_ROOT}/tenants/<id>/docservers` | `backend:/app/docservers` | processed documents, tenant AI models |
| `${OC_DATA_ROOT}/tenants/<id>/share` | `backend:/app/share` | inputs (`entrant/`) and outputs (`export/`) |
| `${OC_DATA_ROOT}/shared-by-tenants/ai-models` | `backend:/app/instance/artificial_intelligence` | shared AI models (rotate, contact) |
| `${OC_DATA_ROOT}/shared-by-tenants/traefik/letsencrypt` | `traefik:/letsencrypt` | Let's Encrypt certificates (acme.json) |
| `${OC_DATA_ROOT}/shared-by-tenants/traefik/certs` | `traefik:/certs` | client-provided TLS certs (PEM) |

> Concretely: a PDF dropped into `${OC_DATA_ROOT}/tenants/<id>/share/entrant/splitter/default/` (host)
> shows up in `/app/share/entrant/splitter/default/` (container) → that's what `fs-watcher`
> detects. Conversely, the outputs written by the workers into `/app/share/export/…` are
> readable directly under `${OC_DATA_ROOT}/tenants/<id>/share/export/…` on the host.

## Appendix E — Docker glossary

- **Tenant**: an **isolated instance** of OpenCapture (its own PostgreSQL database, its volumes,
  its Compose project, its FQDN), identified by its **`CUSTOM_ID`**. The OpenCapture code
  calls it "**custom**" (`custom/<id>/`, `custom.ini`, `create_custom.sh`, `CUSTOM_ID`).
  All tenants **share the same backend image** but share **no data**.
  A tenant can be a client, a **test** environment (`test1`) or a **demo**
  (`default`) — hence the neutral term "tenant" rather than "client".
- **Image**: a **read-only** template = minimal OS + dependencies + code, ready to run.
  Here: `opencapture-backend`, `<tenant>-frontend`, `postgres:17.6`…
- **Container**: a **running instance** of an image (an isolated process).
  E.g. `opencapture_site1-backend-1`. Several containers can come from the same image.
- **Build (`docker build`)**: building an image from a `Dockerfile` (a sequence
  of `FROM`/`RUN`/`COPY`… instructions). **This is the only time code enters the image.**
- **"Baked" / baked-in**: means "**frozen/cooked into the image** at build time".
  A baked file can no longer be changed without a **rebuild**. E.g. the frontend bundle and backend
  code are *baked*; conversely, the data in volumes is not.
- **Layer**: each `Dockerfile` instruction creates a **stacked layer**. Docker
  **caches** unchanged layers → a rebuild only redoes what changed (and everything
  after). Hence the "dependencies first, code next" order to benefit from the cache.
- **Stage / multi-stage**: a `Dockerfile` can have several `FROM … AS <name>`; each
  `FROM` is a **stage**. Only the **last** becomes the final image; the intermediate
  stages (e.g. `builder`) are used to build then **discarded** (see Appendix B).
- **`COPY --from=builder`**: grabs a result produced in an earlier stage (the `dist`,
  the *wheels*…) into the final image — the only way to keep something from a discarded stage.
- **Wheel (Python, `.whl`)**: a **pre-compiled** Python package format (PEP 427); installing it
  requires **no compilation** (no compiler, no dev headers). In the backend, the
  `builder` stage runs `pip wheel` to pre-compile **once** all the dependencies
  (including C extensions, e.g. `pdftotext`) into `.whl` files; the `runtime` stage just
  runs `pip install --no-index --find-links=/wheels` → a **fast** install with **no**
  build tools in the final image (see Appendix B).
- **`ENTRYPOINT` vs `CMD` / `command:`**: the `ENTRYPOINT` is the program launched (here always
  `docker-entrypoint.sh`); the `CMD`/`command:` passes it **arguments** (here **the role**:
  `api`, `worker-splitter`…). Docker runs `ENTRYPOINT + CMD` (see Appendix C).
- **Bind mount**: you map a **specific host folder** into the container — here
  `${OC_DATA_ROOT}/tenants/<id>/docservers` (host) ↔ `/app/docservers` (container). The files are
  **directly visible and editable on the host**. **This is what OpenCapture uses**
  (pgdata, custom, docservers, share). Since it's a host folder, **`down -v` does NOT delete
  it**; to wipe everything you need `rm -rf ${OC_DATA_ROOT}/tenants/<id>`.
- **Named volume**: Docker manages the storage itself in its internal area
  (`/var/lib/docker/volumes/<name>`); you access it **by its name**, not by a host path.
  More portable, but less direct to inspect. `down -v` **deletes** named volumes
  (here: Traefik's `letsencrypt` volume).
- *Both* **persist outside the image** (a rebuild never touches the data). The
  only difference: with a **bind mount you** choose the host folder; with a
  **named volume Docker** decides where to store the files.
- **`docker compose up -d`**: creates/starts the containers in the background (`-d` = *detached*)
  and **recreates** those whose **config or image changed**. `down` stops them; **`down -v`
  also deletes named volumes** (⚠️; the host bind mounts, though, survive — see below).
- **Compose / service / project**: `docker compose` orchestrates several containers described
  in a `docker-compose.yml`. A **service** = a container definition
  (`backend`, `frontend`…); a **project** = an isolated group of services (here
  `opencapture_<id>`, hence **prefixed** containers/volumes/network).
- **Tag**: a version label for an image (`opencapture-backend:latest`). `latest` = the
  last **built**, not necessarily "up to date" if you haven't rebuilt.
- **Registry / `pull` / `push`**: a remote image repository (Docker Hub, GHCR…). `pull`
  downloads, `push` uploads. Here the application images are **built locally** (no
  registry); only `postgres`/`rabbitmq`/`traefik`/`node`/`nginx` are *pulled* from Docker Hub.
- **`exec` vs `run`**: `exec` runs a command in an **already-running** container
  (`docker compose exec backend bash`); `run` creates a **new** container.
- **Network**: a project's containers talk to each other on an internal network **by service
  name** (`postgres`, `rabbitmq`, `backend`). The external `frontend` network connects the
  frontends to Traefik.

## Appendix F — Reverse-proxy chain & real client IP

A request crosses **three** layers before it reaches the application:

```
Browser ──TLS──▶ Traefik ──────▶ nginx (frontend) ──────▶ gunicorn (backend/api)
 real IP           :80/:443        location /<id>/ws/       Flask
                   Host(${FQDN})   proxy_set_header …       request.remote_addr
```

**The problem.** Without a fix, `request.remote_addr` on the Flask side is the IP of **nginx**
(the last proxy), **the same for every user** of a tenant. Two impacts:

- **Rate-limit** ([../backend/src/rest/auth.py:28](../backend/src/rest/auth.py#L28)):
  `flask-limiter` with `key_func=get_remote_address`, `default_limits=["200/hour"]` (plus
  `5/minute` on `/auth/login`, `/auth/…` — [auth.py:68](../backend/src/rest/auth.py#L68),
  [85](../backend/src/rest/auth.py#L85), [115](../backend/src/rest/auth.py#L115)). If every
  user shares a single IP, they share **a single bucket** → "Too many requests" (HTTP 429)
  even though each makes few calls.
- **History**: events log `request.remote_addr`
  ([../backend/src/rest/history.py:45](../backend/src/rest/history.py#L45), and many
  controllers) → without a fix, **every** row carries the proxy IP.

**What nginx does** ([../infra/nginx.conf.template:48-54](../infra/nginx.conf.template#L48)):
it forwards the standard headers to the backend —

```nginx
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;   # APPEND (IP chain)
proxy_set_header X-Forwarded-Proto $scheme;
```

**What the backend does** ([../backend/wsgi.py:35](../backend/wsgi.py#L35)): `ProxyFix`
re-reads these headers to restore the **real IP** —

```python
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=2, x_proto=1, x_host=1, x_port=1)
```

> **Why `x_for=2`?** `x_for` = the number of **trusted** proxies that *append* to
> `X-Forwarded-For`, counted **from the right**: Traefik adds the client's real IP, then
> nginx adds Traefik's IP → **2**. ProxyFix therefore takes the 2nd entry from the right =
> the real client IP.
>
> **Anti-spoofing.** An `X-Forwarded-For` forged by the client ends up **further left** than
> the 2 entries added by Traefik+nginx → it is **ignored**. The value is therefore reliable
> **only if** the proxy count is exact.
>
> ⚠️ `x_for` **depends on the chain**. Adding a corporate reverse-proxy **in front of**
> Traefik (or removing nginx) breaks the count → adjust `x_for` accordingly.

> **Rate-limit scope.** Storage is `storage_uri="memory://"`
> ([auth.py:28](../backend/src/rest/auth.py#L28)): counters **in the backend process
> memory**, not shared between gunicorn workers nor persisted across restarts. Each tenant
> has its own backend → buckets isolated per tenant.

## Appendix G — Tenant resolution & the role of `OC_FQDN`

**How a request is attached to a tenant.** A WSGI *middleware*
([../backend/src/__init__.py:37-71](../backend/src/__init__.py#L37)) inspects each request and
determines the `custom_id` via **two paths**:

1. **By URL prefix** — `.../<id>/ws/...`
   ([__init__.py:61-69](../backend/src/__init__.py#L61)). The segment before `ws/` is the
   `custom_id`; `is_custom_exists()` checks that a `[<id>]` section exists in `custom.ini`
   ([../backend/src/functions.py:209](../backend/src/functions.py#L209)); the prefix is
   stripped from `PATH_INFO`. This is the **default** path (the frontend calls
   `/<id>/ws/...`).
2. **By domain (clean URL)** — `https://<fqdn>/` **without** a prefix
   ([__init__.py:45-59](../backend/src/__init__.py#L45)). The domain (`Host`/`Referer`) is
   compared to the `url = <fqdn>` field in `custom.ini` via
   `is_custom_exists_from_url()` / `retrieve_custom_id_from_url()`
   ([functions.py:295-318](../backend/src/functions.py#L295)). This is what lets the tenant be
   served at the domain root, without the `/<id>/` prefix.

> nginx exposes **both forms** to the backend: a prefixed `location`
> `^/${CUSTOM_ID}/(ws|backend_oc)/` ([nginx.conf.template:48](../infra/nginx.conf.template#L48))
> **and** an unprefixed `location` `^/(ws|backend_oc)/`
> ([:67](../infra/nginx.conf.template#L67)) — mirroring the two paths above.

**What `OC_FQDN` does** (a **runtime** variable, never baked):

- **Traefik route**: the labels set `Host(`${OC_FQDN}`)` on the tenant's router
  ([../infra/docker-compose.traefik.yml:63](../infra/docker-compose.traefik.yml#L63) and the
  `-cert`/`-http` overlays) → the domain is routed to **this** tenant.
- **`custom.ini`**: at startup, `docker-bootstrap.sh` writes/patches `url = ${OC_FQDN}` in the
  tenant's section ([../infra/docker-bootstrap.sh:176-194](../infra/docker-bootstrap.sh#L176))
  → enables **path 2** (clean URL).
- **TLS**: with Let's Encrypt, the `certresolver` issues the cert for this `Host`; in cert
  mode, the certificate's **SAN** must cover exactly `OC_FQDN`.

**What `OC_FQDN` does NOT do**: it is **baked into no image**.

- The **backend** image is **shared** → `OC_FQDN` does not enter it (runtime env).
- The **frontend** image is **shared** too ([../deploy.sh:139-141](../deploy.sh#L139)), built
  with `VITE_BACKEND_URL=/` **relative** ([../infra/frontend.Dockerfile:23](../infra/frontend.Dockerfile#L23))
  → the SPA calls the backend **same-origin**, so the FQDN is not frozen there either. nginx
  listens on `server_name _` ([nginx.conf.template:27-28](../infra/nginx.conf.template#L27)),
  any Host.

**Consequence — changing the FQDN needs NO rebuild, just a *recreate***:

```bash
sed -i 's#^OC_FQDN=.*#OC_FQDN=<new-fqdn>#' stub-tenants/<id>/.env
./deploy.sh --no-build <id>          # = up -d: recreates the containers, without rebuild
```

On *recreate*, the container picks up the new Traefik `Host()` label and `docker-bootstrap.sh`
rewrites `custom.ini` `url`. (`./deploy.sh <id>` also works but **needlessly rebuilds** the
shared images.) See procedure §4.d.7 and the **Appendix A** table (`OC_FQDN` = the "❌ rebuild"
row).
