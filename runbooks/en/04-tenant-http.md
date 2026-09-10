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

Create the stub from the HTTP template:

```bash
./install/docker/tenant/new-tenant.sh http $ID
```

The script copies the template, pre-fills `CUSTOM_ID`, `POSTGRES_DB`, `POSTGRES_USER`,
`RABBITMQ_USER`, `OC_DATA_ROOT`, `APP_UID`/`APP_GID` and `OC_CPUSET`, then lists what is
left to fill in. It does not deploy.

### Fill in the .env

Set `OC_FQDN`, `POSTGRES_PASSWORD` and `RABBITMQ_PASS` — the rest is pre-filled.

```bash
"$EDITOR" install/docker/stub-tenants/$ID/.env
```

## Deploy

`deploy.sh` builds the images then runs `up -d`, which starts the tenant's **whole
stack** — `postgres`, `rabbitmq`, `init`, `backend`, `worker-verifier`,
`worker-splitter`, `worker-mail`, `fs-watcher`, `frontend`. The `init`
service bootstraps the tenant on first start: nothing else to launch by hand. Neither
certificate nor ACME in this mode.

```bash
./install/docker/deploy.sh $ID
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
