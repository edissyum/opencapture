# Apache + host-gateway — main internal test server

> Draft documentation, not yet reviewed or committed. Describes the state observed
> on 2026-07-08 on `/etc/apache2/sites-enabled/mem.conf` and the
> `host-gateway` configuration proposed on the `infra/docker-compose.yml` side (commit `22768fe`).

## 1. Server context

This server hosts two generations of Open-Capture side by side:
- the **v3 installed directly on the server** (outside a container, custom
  `edissyum`), under `/var/www/html/opencapture/`, still reachable via
  `/opencapturev3/`.
- the **Docker v4 tenant** `opencapture`, exposed by Traefik on `127.0.0.1:8080`
  (no dedicated public port).
- third-party applications also installed directly on the server,
  on the same Apache instance: **Maarch Courrier / MEM**
  (`/var/www/html/mem_courrier/`), MaarchParapheur, OCForMEM, etc.

**Apache is the single public entry point** (`*:80`/`*:443`). It routes:
- to the apps installed directly on the server (`mem_courrier`,
  `opencapturev3`, ...);
- to the Docker v4 tenant via reverse proxy, with rewriting of the Host header
  (Traefik routes by `Host()`, see §2.2).

It is this same `*:80` exposure (not just loopback) that also lets
a Docker container reach `mem_courrier` via `host-gateway` (§3).

## 2. Current Apache configuration

Fragment of `/etc/apache2/sites-enabled/mem.conf` (single `*:80` vhost):

### 2.1 Service (outside a container) targeted by the OC connectors (MEM Courrier)

```apache
<Directory /var/www/html/mem_courrier/>
    Options Indexes FollowSymLinks MultiViews
    AllowOverride All
    Require all granted
    SetEnv MAARCH_TMP_DIR "/tmp/"
</Directory>
```

Nothing specific here for network access: it's the enclosing `VirtualHost *:80`
that makes Apache listen on **all interfaces**, not only `127.0.0.1`.
This is the condition required for `host-gateway` to work (§3.2).

### 2.2 Reverse proxy to the Docker v4 tenant (Host header trick)

Complete block — **5 `<Location>`**, one per URL prefix served by the v4 SPA
(keep up to date if the frontend adds a new absolute-root path):

```apache
Define OC_DOCKER_HOST opencapture-ocv4.edissyum.com
Define OC_DOCKER_UP   http://127.0.0.1:8080

# v3 (outside a container): DISTINCT prefix /opencapturev3/ (no collision with /opencapture/ v4)
Alias /opencapturev3 /var/www/html/opencapture

<Location /opencapture/>
    ProxyPreserveHost On
    RequestHeader set Host "${OC_DOCKER_HOST}"
    ProxyPass        ${OC_DOCKER_UP}/opencapture/
    ProxyPassReverse ${OC_DOCKER_UP}/opencapture/
</Location>
<Location /assets/>
    ProxyPreserveHost On
    RequestHeader set Host "${OC_DOCKER_HOST}"
    ProxyPass        ${OC_DOCKER_UP}/assets/
    ProxyPassReverse ${OC_DOCKER_UP}/assets/
</Location>
<Location /imgs/>
    ProxyPreserveHost On
    RequestHeader set Host "${OC_DOCKER_HOST}"
    ProxyPass        ${OC_DOCKER_UP}/imgs/
    ProxyPassReverse ${OC_DOCKER_UP}/imgs/
</Location>
<Location /pdf.worker.min.mjs>
    ProxyPreserveHost On
    RequestHeader set Host "${OC_DOCKER_HOST}"
    ProxyPass        ${OC_DOCKER_UP}/pdf.worker.min.mjs
    ProxyPassReverse ${OC_DOCKER_UP}/pdf.worker.min.mjs
</Location>
<Location /tinymce-overrides/>
    ProxyPreserveHost On
    RequestHeader set Host "${OC_DOCKER_HOST}"
    ProxyPass        ${OC_DOCKER_UP}/tinymce-overrides/
    ProxyPassReverse ${OC_DOCKER_UP}/tinymce-overrides/
</Location>
```

**`Alias /opencapturev3` trick**: v3 serves its assets using **relative** paths
(`<base href="./">`) and calls its backend with a relative URL
(`../../../backend_oc/edissyum`) — the `../` segments walk back up to the root regardless of
the prefix, as long as the number of segments matches. Moving v3 under
`/opencapturev3/` (instead of the original `/opencapture/edissyum/dist/`) therefore
breaks nothing on the v3 side, and frees up `/opencapture/` for v4 without a collision (tested:
an exclusion `<Location /opencapture/edissyum> ProxyPass !</Location>` was not
enough to stop v4 from responding first, when the general proxy
is also declared as a `<Location>`).

Traefik routes by `Host()` (internal key `opencapture-ocv4.edissyum.com`, with no
DNS entry). A client arriving via the bare IP would send a different Host, which
Traefik would not recognize. Apache fixes this before reproxying:
- `RequestHeader set Host ...` forces the Host expected by Traefik;
- `ProxyPreserveHost On` tells `mod_proxy` to forward this Host (instead of
  recomputing it from the `ProxyPass` target URL).

**Why this trick.** `OC_FQDN=opencapture-ocv4.edissyum.com` is only an internal
Traefik routing key, **with no real DNS entry** (the domain is not
public/resolved). Without the rewrite, every client machine wanting to reach
the tenant would need an entry in its local hosts file
(`/etc/hosts`/`C:\Windows\System32\drivers\etc\hosts`) pointing this FQDN
to the server's IP — to be set up and maintained on **every machine**, including
end users' machines, which is not practical. By putting
Apache in the middle (already reachable via the server's bare IP, with nothing to configure on the client
side) and having it carry the right Host when reproxying to
Traefik, no machine needs to know this FQDN: everyone types the IP
(or the existing network hostname), and Apache handles the translation internally. This also
lets v3 and v4 coexist under the same IP/port 80 with no dedicated FQDN
or certificate to manage for this specific case (internal HTTP mode).

This mechanism is **independent** of `host-gateway` (§3): one rewrites a
HTTP header to satisfy an L7 router (Traefik), the other resolves a name to an
IP address to reach the host from a container (L3). They do not substitute
for each other and do not interfere with each other.

### 2.3 Blocking sensitive files served by mistake (v3 outside a container)

```apache
<Directory /var/www/html/opencapture/>
    AllowOverride All
    WSGIProcessGroup opencapture
    WSGIApplicationGroup %{GLOBAL}
    WSGIPassAuthorization On
    Order deny,allow
    Allow from all
    Require all granted
    <Files ~ "(.ini|secret_key|.ods)">
        Require all denied
    </Files>
</Directory>
```

**Why this trick.** All of `/var/www/html/opencapture/` is served by Apache
(`AllowOverride All` + `Require all granted`) — including, without this
exception, the config files (`*.ini`), the `secret_key`, and the
supplier reference file (`*.ods`) that live **inside the served tree**.
The block `<Files ~ "(.ini|secret_key|.ods)"> Require all denied </Files>`
specifically closes off these extensions/names so no direct HTTP request
can download them, regardless of the subfolder they're in. To
reproduce for any new app served the same way (web root = code
root) if it stores secrets/config in its webroot. **The
Docker v4 tenant does not have this problem**: `config/`, `secret_key`, etc. are
outside the folder served by nginx (`/usr/share/nginx/html`), so nothing
equivalent needs to be added on the v4 side.

**`WSGIPassAuthorization On`**: by default, `mod_wsgi` consumes the
`Authorization` header (HTTP Basic) for its own Apache auth handling and does **not** forward it
to the WSGI application. OC (v3) itself uses this header
for its application-level auth (API/webservice) — without this
directive, authentication via `Authorization` would silently be invisible on the
Python side, with a connection failure that's hard to diagnose (the header does
reach Apache, but never makes it into `wsgi.environ`). Nothing equivalent to check
on the v4 side (the Docker tenant does not go through `mod_wsgi`, gunicorn receives
the header natively).

### 2.4 Collaborative editor (`/oo-editor`) — `X-Forwarded-Host` rewrite

```apache
Define VPATH /oo-editor
Define DS_ADDRESS 127.0.0.1:4242
...
<Location ${VPATH}>
    Require all granted
    SetEnvIf Host "^(.*)$" THE_HOST=$1
    RequestHeader setifempty X-Forwarded-Proto http
    RequestHeader setifempty X-Forwarded-Host %{THE_HOST}e
    RequestHeader edit X-Forwarded-Host (.*) $1${VPATH}
    ProxyAddHeaders Off
</Location>

ProxyPassMatch ^\${VPATH}(.*)(\/websocket)$ "ws://${DS_ADDRESS}/$1$2"
ProxyPass ${VPATH} "http://${DS_ADDRESS}"
ProxyPassReverse ${VPATH} "http://${DS_ADDRESS}"
```

Not directly related to OC v4/`host-gateway`, but **in the same vhost** —
worth knowing so as not to break it when editing `mem.conf`. Reverse proxy to a
collaborative document editing server (reachable only locally,
`127.0.0.1:4242`), used by MaarchParapheur/Maarch Courrier.

**Why this trick.** This kind of editing server builds its own URLs
(callbacks, assets, WebSocket) from the `X-Forwarded-Host` header it
receives — but a plain `X-Forwarded-Host` only contains the host
(`myserver`), not the `/oo-editor` prefix under which Apache exposes it. Without
the fix, the editor would generate URLs pointing at the site root
(`http://myserver/...`) instead of `http://myserver/oo-editor/...`, so
broken behind this reverse proxy. The block fixes this in 3 steps: it captures
the real Host (`SetEnvIf` → `THE_HOST`), sets a default `X-Forwarded-Host`/`-Proto`
if they are absent (`setifempty`), then **rewrites** `X-Forwarded-Host`
to **append the `${VPATH}` suffix** (`RequestHeader edit ... $1${VPATH}`)
— and `ProxyAddHeaders Off` prevents `mod_proxy` from regenerating/overwriting these
headers with its own value (with no prefix) afterward. The `ProxyPassMatch`
dedicated to URLs ending in `/websocket` switches these requests to `ws://` (the
generic `ProxyPass` just below only handles plain HTTP).

### 2.5 Shared secret at the vhost level

```apache
SetEnv MAARCH_ENCRYPT_KEY "<value — see mem.conf, not reproduced here>"
```

Set **before** the `<Directory>` blocks (so at the level of the entire
`VirtualHost`): applies to all apps in this vhost, not just Maarch
Courrier. Do not duplicate/regenerate this value by mistake when reorganizing
`mem.conf` — it must stay identical to the one expected by the target app (an encryption
key, not just a cosmetic config value).

### 2.6 What is NOT a trick (default Debian boilerplate)

Present in the file but generic/unrelated to OC or MEM — no need to
look for any particular intent here: `<Directory />` (default root
lockdown), `ScriptAlias /cgi-bin/` + `<Directory "/usr/lib/cgi-bin">` (standard Debian
cgi-bin), `Order deny,allow` / `Allow from all` duplicating
`Require all granted` (Apache 2.2 syntax kept alongside 2.4 via
`mod_access_compat`, redundant but harmless).

## 3. `host-gateway`: how it works

### 3.1 Mechanism

A container attached to a Docker bridge network already routes all outbound
traffic to that network's gateway (the bridge's IP — e.g. `172.17.0.1` on the
default bridge, or the compose project's own bridge IP). This
gateway is one more network interface owned by the host machine: talking to it means
talking to the host.

`host-gateway` is a special value recognized by the Docker Engine (≥ 20.10,
Linux) in `extra_hosts`. When the container starts, Docker replaces it with
the actual IP of that gateway and writes the entry into the container's internal
`/etc/hosts` — no DNS magic, just a plain static line.

Declaration (`infra/docker-compose.yml`, anchor `x-backend-extra-hosts`,
applied to `backend` and `worker-verifier`):

```yaml
extra_hosts:
    - "host.docker.internal:host-gateway"
```

**Why this trick.** In v3, OC and the third-party applications (MEM Courrier,
etc.) ran **directly on the same server**: `localhost` in an
outgoing connector's config therefore legitimately meant the current
machine, and it worked. When moving OC v4 into a container, this same connector
(the outgoing connector's `host` field, its value carried over as-is from the v3
migration) keeps `http://localhost/...` — except that `localhost` in a
container refers to **itself**, not the host machine. The connector breaks
silently (timeout/connection refused) with no obvious link to the migration.

Two ways to fix this were weighed before picking `host-gateway`:
- **Hard-code the server's IP** in the connector's `host` field: works
  immediately, but breaks if the IP changes, and the configuration is not
  reusable as-is if the same custom is redeployed on another
  server (the IP would need to be re-entered every time).
- **`network_mode: host`** on the container: would make `localhost` a
  direct alias of the host, so closer to v3 behavior — but breaks
  the container's network isolation and its attachment to the Traefik network
  (label-based routing only works between containers on the same Docker
  network), so it was ruled out.

`host-gateway` was chosen as a compromise: a **stable and portable alias**
(`host.docker.internal`) that does not depend on the server's IP and does not compromise
the containers' network isolation — only the connector's `host` field changes
(`localhost` → `host.docker.internal`), with no change to the
existing network architecture (Traefik, the `frontend` network, etc.).

### 3.2 Required conditions

1. The container must have this `extra_hosts` entry — it does not exist by
   default on Linux (unlike Docker Desktop on Mac/Windows, where
   `host.docker.internal` is provided natively with no configuration).
2. The target service on the host must listen on an interface the
   gateway can reach: `0.0.0.0` (all interfaces), **not** `127.0.0.1`
   only. A service on pure loopback stays unreachable from the container, since the
   bridge gateway is not the host's local loopback.
   → Verified on this server: Apache listens on `*:80`/`*:443` (§2), so this is fine here.
3. `extra_hosts` is fixed at container **creation**: a change in
   the compose file requires `docker compose up -d <service>` (recreate); a plain
   `restart` is not enough.

### 3.3 On the application side

In the OC v4 UI (Settings → Outputs), the MEM connector's `host` field:
`http://localhost/mem_courrier/mem/rest/` → `http://host.docker.internal/mem_courrier/mem/rest/`.

## 4. Points to watch

- **If Apache's listening scope ever changes** (e.g. restricted to
  `127.0.0.1` to harden the attack surface), `host-gateway` silently stops
  working — the connector's outgoing calls time out.
  No automatic alert: to watch for if this server's Apache config is
  revised.
- **Host firewall** (`ufw`/`iptables`/`firewalld`): if rules restrict
  inbound traffic on the Docker bridge interface (unlikely by default,
  but possible on a hardened host), `host-gateway` can be blocked even if
  Apache is indeed listening on `*:80`. To check if the connection test fails
  while `getent hosts host.docker.internal` does return an IP.
- **Scope**: `host.docker.internal` resolves to the gateway of the network
  *of the container doing the resolution* — on a multi-tenant host (several
  compose projects = several bridges), the IP can differ from one tenant to
  another. The mechanism remains correct by construction (each container
  resolves ITS OWN gateway), but don't hard-code the IP observed on one
  tenant assuming it holds for all of them.
- **Does not replace the Host header trick (§2.2)**: `host-gateway` resolves a
  name to a network IP (layer 3/hosts), the Apache trick rewrites an HTTP header
  for Traefik routing (layer 7). The two coexist without interacting.
- **Simpler but less portable alternative**: use the server's IP
  directly in the connector's `host` field, without touching the compose file.
  Works right away, but breaks if the IP changes or if the configuration
  is replicated as-is on another server.
- **Quick check after deployment**:
  ```bash
  docker exec <container_backend> getent hosts host.docker.internal
  ```
