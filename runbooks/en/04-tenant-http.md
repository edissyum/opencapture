# Pure HTTP tenant — creation and operations

No TLS. Copy-paste commands: do **not** run them as a block.

Prerequisites: infra installed (see [01](01-install-general.md)).

Access is over `http://`, **unencrypted**. This mode is meant for an internal network or
a server sitting behind a reverse proxy that handles TLS itself; avoid it on the public
internet.

## Create the tenant

Pick the tenant identity — `CUSTOM_ID`, lowercase letters, digits and `_`:

```bash
ID=monclient
```

Create the tenant from the HTTP template:

```bash
cp -r install/docker/stub-tenants/_template-http install/docker/stub-tenants/$ID
mv install/docker/stub-tenants/$ID/.env.example install/docker/stub-tenants/$ID/.env
```

### Align APP_UID and APP_GID

Mandatory: these values must match those of the **global** `.env`. The shared backend
image bakes `/app` — the service account's HOME — at that uid; a tenant running with a
different uid cannot write to `/app`, and both matplotlib and fontconfig fail.

`new-tenant.sh` does this automatically. For a manual creation:

```bash
sed -i "s/^APP_UID=.*/APP_UID=$(grep -m1 '^APP_UID=' .env | cut -d= -f2)/" install/docker/stub-tenants/$ID/.env
sed -i "s/^APP_GID=.*/APP_GID=$(grep -m1 '^APP_GID=' .env | cut -d= -f2)/" install/docker/stub-tenants/$ID/.env
```

### Fill in the .env

Set `CUSTOM_ID`, `OC_FQDN` and the passwords there; `OC_DATA_ROOT` is already
pre-filled.

```bash
"$EDITOR" install/docker/stub-tenants/$ID/.env
```

## Deploy

Frontend build then `up -d`; the `init` service bootstraps the tenant. Neither
certificate nor ACME in this mode.

```bash
./install/docker/deploy.sh --frontend-only $ID
```

## Operations

`docker compose` shortcut for the tenant, to set once per session:

```bash
DIR=install/docker/stub-tenants/$ID
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"
```

Status, logs and restart:

```bash
$DC ps
$DC logs init
$DC logs -f backend
$DC restart backend
$DC up -d
```

### Rebuild after a code update

```bash
./install/docker/deploy.sh --frontend-only $ID   # rebuild the tenant's frontend
./install/docker/deploy.sh --backend-only $ID    # rebuild the shared backend image + recreate
./install/docker/deploy.sh $ID                   # rebuild backend + frontend + recreate
```

Or, for **all** tenants after a `git pull`:

```bash
./install/docker/deploy.sh --frontend-only --all   # nginx template / Traefik overlay update
./install/docker/deploy.sh --all                   # backend + frontends (all)
```

### Check access

Plain HTTP, no TLS:

```bash
curl -I "http://$(grep -m1 OC_FQDN $DIR/.env | cut -d= -f2)/"
```

### Stop the tenant

Data is kept. **Never use `down -v`**: the flag deletes the volumes, hence the database
and the documents.

```bash
$DC down
```
