#!/usr/bin/env bash
# Tenant HTTP PUR (sans TLS) — création + exploitation.
# Référence à copier-coller (ne PAS exécuter d'un bloc).
# Prérequis : infra installée (01). Accès en http:// SANS chiffrement
# (réseau interne ou derrière un reverse-proxy TLS ; éviter en exposition Internet).

# Identité du tenant
ID=monclient                                   # CUSTOM_ID (minuscule/alnum/_)

# Créer le tenant depuis le gabarit HTTP
cp -r stub-tenants/_template-http stub-tenants/$ID
mv stub-tenants/$ID/.env.example stub-tenants/$ID/.env

# Éditer le .env (CUSTOM_ID, OC_FQDN, mots de passe, *_PATH=/opt/tenants/$ID/...)
"$EDITOR" stub-tenants/$ID/.env

# Déployer (build frontend + up -d ; init amorce le tenant ; ni cert ni ACME)
./deploy.sh --frontend-only $ID

# Raccourci docker compose du tenant
DIR=stub-tenants/$ID
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

# État / logs / redémarrage
$DC ps
$DC logs init
$DC logs -f backend
$DC restart backend
$DC up -d

# Reconstruire après maj du code
./deploy.sh --frontend-only $ID                # rebuild frontend du tenant
./deploy.sh --backend-only $ID                 # rebuild image backend partagée + recrée
./deploy.sh $ID                                # rebuild backend + frontend + recrée

# Vérifier l'accès (HTTP pur, pas de TLS)
curl -I "http://$(grep -m1 OC_FQDN $DIR/.env | cut -d= -f2)/"

# Arrêter le tenant (données conservées ; JAMAIS de down -v)
$DC down
