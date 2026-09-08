# Provided or self-signed certificate tenant — creation and operations

Certificate served by SNI. Copy-paste commands: do **not** run them as a block.

Prerequisites: infra installed (see [01](01-install-general.md)). Neither public DNS nor
ports 80/443 are required.

## Create the tenant

Tenant identity. `OC_FQDN` must match the certificate's SAN, and `OC_DATA_ROOT` must
repeat the value from the `.env`:

```bash
ID=monclient
FQDN=monclient.example.com
OC_DATA_ROOT=/opt/edissyum/opencapture
```

Create the tenant from the cert template:

```bash
cp -r install/docker/stub-tenants/_template-cert install/docker/stub-tenants/$ID
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

## Set up the certificate

### Generate a self-signed certificate (optional)

Only needed when no certificate is provided. What the options do:

| Option | Purpose |
|---|---|
| `-x509` | outputs a self-signed certificate directly, not a CSR |
| `-newkey` | generates the key at the same time (`rsa:2048`) |
| `-nodes` | private key **without** a passphrase, required by Traefik |
| `-days 825` | validity — about 825 days max for browsers, longer for internal use |
| `-subj` | non-interactive subject, `CN` = server name |
| `-addext subjectAltName` | the name(s) matched by SNI; the `CN` alone is no longer enough |

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
  -keyout $ID.key -out $ID.crt \
  -subj "/CN=$FQDN" \
  -addext "subjectAltName=DNS:$FQDN"
```

For several names: `-addext "subjectAltName=DNS:$FQDN,DNS:autre.example.com"`.

### Drop the PEM on the Traefik side

Full chain and key without a passphrase:

```bash
sudo cp $ID.crt $ID.key "$OC_DATA_ROOT/shared-by-tenants/traefik/certs/"
```

### Declare the certificate

One fragment per tenant in `/dynamic`; Traefik hot-reloads it.

```bash
sed "s/changeme/$ID/g" install/docker/stub-tenants/$ID/tls.yml.example \
  | sudo tee "$OC_DATA_ROOT/shared-by-tenants/traefik/dynamic/$ID.yml"
```

## Deploy

Frontend build then `up -d`; the `init` service bootstraps the tenant.

```bash
./install/docker/deploy.sh --frontend-only $ID
```

Check which certificate is actually served, forcing SNI to get the issuer and the SANs:

```bash
echo | openssl s_client -connect 127.0.0.1:443 -servername $FQDN 2>/dev/null \
  | openssl x509 -noout -issuer -subject -ext subjectAltName
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

### Renew the certificate

Replacing the files in `/certs` is enough: hot reload, no restart.

```bash
sudo cp $ID.crt $ID.key "$OC_DATA_ROOT/shared-by-tenants/traefik/certs/"
```

### Stop the tenant

Data is kept. **Never use `down -v`**: the flag deletes the volumes, hence the database
and the documents.

```bash
$DC down
```
