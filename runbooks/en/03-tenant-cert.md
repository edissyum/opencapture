#!/usr/bin/env bash
# PROVIDED / SELF-SIGNED CERT tenant (served by SNI) — creation + operations.
# Copy-paste reference (do NOT run as a block).
# Prerequisites: infra installed (01). No public DNS or ports 80/443 needed.

# Tenant identity
ID=myclient                                    # CUSTOM_ID (lowercase/alnum/_)
FQDN=myclient.example.com                      # OC_FQDN (must = certificate SAN)
OC_DATA_ROOT=/opt/edissyum/opencapture         # data root (same as .env)

# Create the tenant from the cert template
cp -r stub-tenants/_template-cert stub-tenants/$ID
mv stub-tenants/$ID/.env.example stub-tenants/$ID/.env

# APP_UID/APP_GID: align with the GLOBAL .env (mandatory). The shared backend
# image bakes /app (the service account's HOME) at this uid; a tenant with a
# different uid -> /app not writable (matplotlib/fontconfig errors).
# (new-tenant.sh does this automatically; here it is for manual use:)
sed -i "s/^APP_UID=.*/APP_UID=$(grep -m1 '^APP_UID=' .env | cut -d= -f2)/" stub-tenants/$ID/.env
sed -i "s/^APP_GID=.*/APP_GID=$(grep -m1 '^APP_GID=' .env | cut -d= -f2)/" stub-tenants/$ID/.env

# Edit the .env (CUSTOM_ID, OC_FQDN, passwords; OC_DATA_ROOT already pre-filled)
"$EDITOR" stub-tenants/$ID/.env

# (optional) Generate a SELF-SIGNED cert if none is provided:
#   -x509     = output a self-signed certificate directly (not a CSR)
#   -newkey   = generate the key at the same time (rsa:2048)
#   -nodes    = private key WITHOUT a passphrase (required by Traefik)
#   -days 825 = validity (max ~825 days for browsers; longer if internal)
#   -subj     = non-interactive subject (CN = server name)
#   -addext subjectAltName = the name(s) matched by SNI (CN alone is no longer enough)
openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
  -keyout $ID.key -out $ID.crt \
  -subj "/CN=$FQDN" \
  -addext "subjectAltName=DNS:$FQDN"
# Several names: -addext "subjectAltName=DNS:$FQDN,DNS:other.example.com"

# Drop the PEM on the Traefik side (full chain + passphrase-free key)
sudo cp $ID.crt $ID.key "$OC_DATA_ROOT/shared-by-tenants/traefik/certs/"

# Declare the cert: per-tenant fragment in /dynamic (Traefik hot-reloads)
sed "s/changeme/$ID/g" stub-tenants/$ID/tls.yml.example \
  | sudo tee "$OC_DATA_ROOT/shared-by-tenants/traefik/dynamic/$ID.yml"

# Deploy the tenant (build frontend + up -d; init bootstraps the tenant)
./deploy.sh --frontend-only $ID

# Check which cert is served (SNI forced -> cert issuer/SAN)
echo | openssl s_client -connect 127.0.0.1:443 -servername $FQDN 2>/dev/null \
  | openssl x509 -noout -issuer -subject -ext subjectAltName

# Tenant docker compose shortcut
DIR=stub-tenants/$ID
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

# Status / logs / restart
$DC ps
$DC logs init
$DC logs -f backend
$DC restart backend
$DC up -d

# Rebuild after a code update
./deploy.sh --frontend-only $ID                # rebuild the tenant frontend
./deploy.sh --backend-only $ID                  # rebuild the shared backend image + recreate
./deploy.sh $ID                                 # rebuild backend + frontend + recreate
# ... or for ALL tenants after a git pull:
./deploy.sh --frontend-only --all               # update nginx template / Traefik overlay
./deploy.sh --all                               # backend + frontends (all)

# Renew the cert: replace the /certs files (hot-reload, no restart)
sudo cp $ID.crt $ID.key "$OC_DATA_ROOT/shared-by-tenants/traefik/certs/"

# Stop the tenant (data kept; NEVER down -v)
$DC down
