# Multi-tenant WebDAV server (Apache mod_dav) — operations

Copy-paste commands: do **not** run them as a block. Host data lives outside the repo.

Prerequisites: infra installed (see [01](01-install-general.md)) and tenant created
(`new-tenant.sh` then `deploy.sh`).

## How it works

WebDAV is served under `https://<fqdn>/dav/`: the nginx frontend proxies `/dav/` to an
Apache mod_dav container **per tenant**, since nginx has no WebDAV module. Using a path
rather than a subdomain reuses the existing DNS, certificate and Traefik route.

The root is `$OC_DATA_ROOT/tenants/<id>/share`, watched by the fs-watcher; files land
there as `$APP_UID`/`$APP_GID`. Authentication is Basic, with one htpasswd per tenant.
Design details in `install/docker/shared/webdav/README.md`.

Unlike [SFTP](05-sftp-server.md), **nothing has to be installed on the host**: everything
is in Docker, the image being built by `deploy.sh` and the `webdav` service started with
the stack.

## 1. Enabling

WebDAV is **not** part of the base stack: it is enabled per tenant. Simply **uncomment**
the `webdav` line, already present in the tenant's `docker-compose.yml`. Paths there are
relative **to the tenant directory**, not to the repo root:

```yaml
include:
    - path: ../../shared/docker-compose.yml
    - path: ../../shared/traefik/docker-compose.traefik*.yml   # depending on the mode
    - path: ../../shared/webdav/docker-compose.yml             # <- enables WebDAV
```

Without that overlay, `/dav/` returns 501 "not enabled"; the rest of the site works
normally. The `opencapture-webdav` image is built by `deploy.sh`, independently of the
backend, as soon as a tenant includes the overlay.

```bash
./install/docker/deploy.sh <id>
```

Check that the container is running:

```bash
DIR=install/docker/stub-tenants/<id>
docker compose --project-directory "$DIR" -f "$DIR/docker-compose.yml" ps webdav
```

## 2. Set the login and password

The login is the second argument, defaulting to `<id>`; the password is prompted for,
masked, and stored as bcrypt. The htpasswd is per tenant and lives outside the repo, in
`$OC_DATA_ROOT/tenants/<id>/webdav/htpasswd`. No reload is needed, Apache re-reads the
file on every request. As long as no account exists, access returns 401.

```bash
sudo ./install/docker/shared/webdav/new-webdav-account.sh <id>          # login = <id>
sudo ./install/docker/shared/webdav/new-webdav-account.sh <id> alice    # dedicated login
```

For several accounts on the same tenant, run it again with another login. To change a
password, run it again with the **same** login: the line is overwritten.

```bash
sudo ./install/docker/shared/webdav/new-webdav-account.sh <id> bob
sudo ./install/docker/shared/webdav/new-webdav-account.sh <id> alice
```

Delete an account:

```bash
sudo docker run --rm -v $OC_DATA_ROOT/tenants/<id>/webdav:/work opencapture-webdav \
    htpasswd -D /work/htpasswd alice
```

List the accounts:

```bash
sudo cut -d: -f1 $OC_DATA_ROOT/tenants/<id>/webdav/htpasswd
```

Non-interactive variant, for automation — **careful**, the password ends up in the shell
history:

```bash
sudo docker run --rm -v $OC_DATA_ROOT/tenants/<id>/webdav:/work opencapture-webdav \
    htpasswd -B -b /work/htpasswd <login> 'MotDePasse'
```

## 3. Client connection

The URL is `https://<fqdn>/dav/`, the login defaulting to `<id>`.

**Windows** — File Explorer, *Map network drive*, `https://<fqdn>/dav/`, ticking
"connect using different credentials". HTTPS is required, and the WebClient service must
be running (`net start webclient`).

**macOS** — Finder, *Go*, *Connect to Server* (`Cmd+K`), then `https://<fqdn>/dav/`.

**Linux** — `davs://<fqdn>/dav/` in Nautilus, or on the command line:

```bash
sudo apt install davfs2
sudo mount -t davfs https://<fqdn>/dav/ /mnt/oc
```

Drop documents into the folders watched by the fs-watcher:

- Verifier: `entrant/verifier/{default,ocr_only,default_mail}`
- Splitter: `entrant/splitter/default`

## 4. Operations

```bash
DIR=install/docker/stub-tenants/<id>
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

$DC ps webdav        # container status
$DC logs -f webdav   # Apache logs (access + errors, on stdout/stderr)
```

After changing `install/docker/shared/webdav/httpd.conf` or the Dockerfile:

```bash
./install/docker/deploy.sh --backend-only <id>   # rebuild the shared images, webdav included
./install/docker/deploy.sh --no-build <id>       # or just recreate the containers
```

## 5. Troubleshooting

| Symptom | Cause |
|---|---|
| 401, although an account exists | wrong login or password — check the htpasswd |
| 500 | htpasswd missing (`AuthUserFile`) — run `new-webdav-account.sh` |
| 502 | `webdav` container stopped — see `$DC ps webdav` and `$DC logs webdav` |
| files not processed | dropped outside the `entrant/…` folders, or fs-watcher to restart |
| files not deleted | wrong uid — the container must run as `APP_UID` (the compose `user:` key), check with `$DC exec webdav id` |

## 6. Quick curl test

```bash
curl -ksI -u <id>:<pwd> https://<fqdn>/dav/ | grep -i '^DAV:'      # -> DAV: 1,2
curl -ks  -u <id>:<pwd> -X PROPFIND -H 'Depth: 1' https://<fqdn>/dav/
curl -ks  -u <id>:<pwd> -T facture.pdf https://<fqdn>/dav/entrant/verifier/default/facture.pdf
```
