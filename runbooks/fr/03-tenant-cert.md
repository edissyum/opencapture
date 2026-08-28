#!/usr/bin/env bash
# Tenant CERT FOURNI / AUTO-SIGNÉ (servi par SNI) — création + exploitation.
# Référence à copier-coller (ne PAS exécuter d'un bloc).
# Prérequis : infra installée (01). Pas besoin de DNS public ni de ports 80/443.

# Identité du tenant
ID=monclient                                   # CUSTOM_ID (minuscule/alnum/_)
FQDN=monclient.example.com                     # OC_FQDN (doit = SAN du certificat)
OC_DATA_ROOT=/opt/edissyum/opencapture         # racine des données (idem .env)

# Créer le tenant depuis le gabarit cert
cp -r install/docker/stub-tenants/_template-cert install/docker/stub-tenants/$ID
mv install/docker/stub-tenants/$ID/.env.example install/docker/stub-tenants/$ID/.env

# APP_UID/APP_GID : aligner sur le .env GLOBAL (impératif). L'image backend
# partagée bake /app (HOME du compte de service) à cet uid ; un tenant avec un
# autre uid -> /app non inscriptible (matplotlib/fontconfig en erreur).
# (new-tenant.sh le fait automatiquement ; en manuel, le voici :)
sed -i "s/^APP_UID=.*/APP_UID=$(grep -m1 '^APP_UID=' .env | cut -d= -f2)/" install/docker/stub-tenants/$ID/.env
sed -i "s/^APP_GID=.*/APP_GID=$(grep -m1 '^APP_GID=' .env | cut -d= -f2)/" install/docker/stub-tenants/$ID/.env

# Éditer le .env (CUSTOM_ID, OC_FQDN, mots de passe ; OC_DATA_ROOT déjà pré-rempli)
"$EDITOR" install/docker/stub-tenants/$ID/.env

# (option) Générer un cert AUTO-SIGNÉ si non fourni :
#   -x509     = sort un certificat auto-signé direct (pas une CSR)
#   -newkey   = génère la clé en même temps (rsa:2048)
#   -nodes    = clé privée SANS passphrase (requis par Traefik)
#   -days 825 = validité (max ~825 j pour les navigateurs ; + long si interne)
#   -subj     = sujet non-interactif (CN = nom du serveur)
#   -addext subjectAltName = le(s) nom(s) matché(s) par SNI (le CN seul ne suffit plus)
openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
  -keyout $ID.key -out $ID.crt \
  -subj "/CN=$FQDN" \
  -addext "subjectAltName=DNS:$FQDN"
# Plusieurs noms : -addext "subjectAltName=DNS:$FQDN,DNS:autre.example.com"

# Déposer le PEM côté Traefik (chaîne complète + clé sans passphrase)
sudo cp $ID.crt $ID.key "$OC_DATA_ROOT/shared-by-tenants/traefik/certs/"

# Déclarer le cert : fragment par tenant dans /dynamic (Traefik recharge à chaud)
sed "s/changeme/$ID/g" install/docker/stub-tenants/$ID/tls.yml.example \
  | sudo tee "$OC_DATA_ROOT/shared-by-tenants/traefik/dynamic/$ID.yml"

# Déployer le tenant (build frontend + up -d ; init amorce le tenant)
./install/docker/deploy.sh --frontend-only $ID

# Vérifier quel cert est servi (SNI forcé -> émetteur/SAN du cert)
echo | openssl s_client -connect 127.0.0.1:443 -servername $FQDN 2>/dev/null \
  | openssl x509 -noout -issuer -subject -ext subjectAltName

# Raccourci docker compose du tenant
DIR=install/docker/stub-tenants/$ID
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

# État / logs / redémarrage
$DC ps
$DC logs init
$DC logs -f backend
$DC restart backend
$DC up -d

# Reconstruire après maj du code
./install/docker/deploy.sh --frontend-only $ID                # rebuild frontend du tenant
./install/docker/deploy.sh --backend-only $ID                 # rebuild image backend partagée + recrée
./install/docker/deploy.sh $ID                                # rebuild backend + frontend + recrée
# ... ou pour TOUS les tenants après un git pull :
./install/docker/deploy.sh --frontend-only --all              # maj template nginx / overlay Traefik
./install/docker/deploy.sh --all                              # backend + frontends (tous)

# Renouveler le cert : remplacer les fichiers /certs (hot-reload, pas de restart)
sudo cp $ID.crt $ID.key "$OC_DATA_ROOT/shared-by-tenants/traefik/certs/"

# Arrêter le tenant (données conservées ; JAMAIS de down -v)
$DC down
