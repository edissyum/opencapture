#!/usr/bin/env bash
# Tenant LET'S ENCRYPT — création + exploitation.
# Référence à copier-coller (ne PAS exécuter d'un bloc).
# Prérequis : infra installée (01) ; DNS public <fqdn> -> serveur ; ports 80/443 ouverts.

# Identité du tenant
ID=monclient                                   # CUSTOM_ID (minuscule/alnum/_)

# Créer le tenant depuis le gabarit Let's Encrypt
cp -r stub-tenants/_template-letsencrypt stub-tenants/$ID
mv stub-tenants/$ID/.env.example stub-tenants/$ID/.env

# APP_UID/APP_GID : aligner sur le .env GLOBAL (impératif). L'image backend
# partagée bake /app (HOME du compte de service) à cet uid ; un tenant avec un
# autre uid -> /app non inscriptible (matplotlib/fontconfig en erreur).
# (new-tenant.sh le fait automatiquement ; en manuel, le voici :)
sed -i "s/^APP_UID=.*/APP_UID=$(grep -m1 '^APP_UID=' .env | cut -d= -f2)/" stub-tenants/$ID/.env
sed -i "s/^APP_GID=.*/APP_GID=$(grep -m1 '^APP_GID=' .env | cut -d= -f2)/" stub-tenants/$ID/.env

# Éditer le .env (CUSTOM_ID, OC_FQDN, mots de passe ; OC_DATA_ROOT déjà pré-rempli)
"$EDITOR" stub-tenants/$ID/.env

# Déployer (build frontend + up -d ; postgres charge le schéma, init amorce le tenant)
./deploy.sh --frontend-only $ID

# Raccourci docker compose du tenant
DIR=stub-tenants/$ID
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

# État des conteneurs
$DC ps

# Logs — amorçage, API, workers (suivre)
$DC logs init
$DC logs -f backend
$DC logs -f worker-verifier worker-splitter worker-mail fs-watcher

# Redémarrer un service / recréer le tenant
$DC restart backend
$DC up -d

# Reconstruire après maj du code
./deploy.sh --frontend-only $ID                # rebuild frontend du tenant
./deploy.sh --backend-only $ID                 # rebuild image backend partagée + recrée
./deploy.sh $ID                                # rebuild backend + frontend + recrée
# ... ou pour TOUS les tenants après un git pull :
./deploy.sh --frontend-only --all              # maj template nginx / overlay Traefik
./deploy.sh --all                              # backend + frontends (tous)

# Vérifier le cert servi (HTTPS Let's Encrypt, émis au 1er handshake)
curl -I "https://$(grep -m1 OC_FQDN $DIR/.env | cut -d= -f2)/"

# Arrêter le tenant (données conservées ; JAMAIS de down -v)
$DC down
