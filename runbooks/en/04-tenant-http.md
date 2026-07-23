#!/usr/bin/env bash
# PURE HTTP tenant (no TLS) — creation + operations.
# Copy-paste reference (do NOT run as one block).
# Prerequisites: infra installed (01). Access over http:// WITHOUT encryption
# (internal network or behind a TLS reverse proxy; avoid on Internet exposure).

# Tenant identity
ID=monclient                                   # CUSTOM_ID (lowercase/alnum/_)

# Create the tenant from the HTTP template
cp -r stub-tenants/_template-http stub-tenants/$ID
mv stub-tenants/$ID/.env.example stub-tenants/$ID/.env

# APP_UID/APP_GID: align with the GLOBAL .env (mandatory). The shared backend
# image bakes /app (the service account's HOME) at that uid; a tenant with a
# different uid -> /app not writable (matplotlib/fontconfig errors).
# (new-tenant.sh does it automatically; here it is done manually:)
sed -i "s/^APP_UID=.*/APP_UID=$(grep -m1 '^APP_UID=' .env | cut -d= -f2)/" stub-tenants/$ID/.env
sed -i "s/^APP_GID=.*/APP_GID=$(grep -m1 '^APP_GID=' .env | cut -d= -f2)/" stub-tenants/$ID/.env

# Edit the .env (CUSTOM_ID, OC_FQDN, passwords; OC_DATA_ROOT already pre-filled)
"$EDITOR" stub-tenants/$ID/.env

# Deploy (build frontend + up -d; init bootstraps the tenant; no cert nor ACME)
./deploy.sh --frontend-only $ID

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
./deploy.sh --frontend-only $ID                # rebuild the tenant's frontend
./deploy.sh --backend-only $ID                 # rebuild the shared backend image + recreate
./deploy.sh $ID                                # rebuild backend + frontend + recreate
# ... or for ALL tenants after a git pull:
./deploy.sh --frontend-only --all              # update nginx template / Traefik overlay
./deploy.sh --all                              # backend + frontends (all)

# Check access (pure HTTP, no TLS)
curl -I "http://$(grep -m1 OC_FQDN $DIR/.env | cut -d= -f2)/"

# Stop the tenant (data kept; NEVER down -v)
$DC down
