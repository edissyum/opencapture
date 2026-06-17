#!/usr/bin/env bash
# Tenant CERT FOURNI / AUTO-SIGNÉ (servi par SNI) — création + exploitation.
# Référence à copier-coller (ne PAS exécuter d'un bloc).
# Prérequis : infra installée (01). Pas besoin de DNS public ni de ports 80/443.

# Identité du tenant
ID=monclient                                   # CUSTOM_ID (minuscule/alnum/_)
FQDN=monclient.example.com                     # OC_FQDN (doit = SAN du certificat)

# Créer le tenant depuis le gabarit cert
cp -r stub-tenants/_template-cert stub-tenants/$ID
mv stub-tenants/$ID/.env.example stub-tenants/$ID/.env

# Éditer le .env (CUSTOM_ID, OC_FQDN, mots de passe, *_PATH=/opt/tenants/$ID/...)
"$EDITOR" stub-tenants/$ID/.env

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
sudo cp $ID.crt $ID.key /opt/shared-by-tenants/traefik/certs/

# Déclarer le cert : fragment par tenant dans /dynamic (Traefik recharge à chaud)
sed "s/changeme/$ID/g" stub-tenants/$ID/tls.yml.example \
  | sudo tee /opt/shared-by-tenants/traefik/dynamic/$ID.yml

# Déployer le tenant (build frontend + up -d ; init amorce le tenant)
./deploy.sh --frontend-only $ID

# Vérifier quel cert est servi (SNI forcé -> émetteur/SAN du cert)
echo | openssl s_client -connect 127.0.0.1:443 -servername $FQDN 2>/dev/null \
  | openssl x509 -noout -issuer -subject -ext subjectAltName

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

# Renouveler le cert : remplacer les fichiers /certs (hot-reload, pas de restart)
sudo cp $ID.crt $ID.key /opt/shared-by-tenants/traefik/certs/

# Arrêter le tenant (données conservées ; JAMAIS de down -v)
$DC down
