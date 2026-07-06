# 03 — Migration `.56` (bare-metal) → serveur MEM (`.230`/`.232`) en Docker

> **PRÉPARÉ — NE RIEN LANCER tel quel.** Référence à dérouler **pas à pas**, après
> avoir tranché les décisions ci-dessous. Adapte les valeurs en tête.
>
> Cible = une VM **`serveur de test principal interne`** (Debian 12, VirtualBox) : `serveur de test principal interne` **ou**
> `serveur de test principal interne` — ce sont **deux clones identiques** (même `machine-id`/hostname,
> cf. hygiène de clonage plus bas). Choisis-en **une**.

## Contexte vérifié (lecture seule)
| Constat sur la cible | Conséquence |
|---|---|
| Apache **actif**, tient **80/443** (Maarch `mem.conf` + `opencaptureformem.conf`) | Traefik en **ports alternatifs 8080/8443** (mode **cert**, pas de Let's Encrypt) |
| `/` **plein à 91 %** (4,2 Go), `/var` **18 Go libres** | `OC_DATA_ROOT` sur **`/var`**, jamais `/opt` |
| `/var/lib/docker` partage `/var` ; image backend = **5,29 Go** ; OnlyOffice déjà 3,5 Go | Disque **juste** → **`docker save/load`** (pas de build local) ; surveiller `/var` |
| `<ssh-user>` = **uid 1000** (comme `.79`) | image backend (uid baké 1000) **compatible** |
| **OC-for-MEM** déjà présent (bare-metal `/var/www/html/opencapture`, vhost Apache) | **NE PAS Y TOUCHER** ; le OC dockerisé est isolé (autre data root, autres ports, autre DB) |
| Docker **28.3.3** / Compose **v2.39.1** ; noyau 6.1 | OK (image basée `bookworm`, portable Deb13→Deb12) |
| Cible **joint `.56`** en SSH | export lançable **depuis la cible** |

## Décisions à figer AVANT
1. **Cible** : `.230` ou `.232` ?
2. **Accès web** : Traefik **port 8443** (URL `https://<fqdn>:8443/`) — par défaut ici.
   (Si URL sans port voulue → Apache reverse-proxy vers Traefik 127.0.0.1:8080, hors scope de ce runbook.)
3. **Customs** à migrer : `edissyum demo` (les 2 de `.56`) ou un sous-ensemble.
4. **Certs** : PEM fournis par tenant (mode cert).

---

## Paramètres (à éditer)
```bash
TARGET=serveur de test principal interne                         # <-- .230 OU .232 (la cible choisie)
TUSER=<ssh-user>                                # user cible (uid 1000, groupe docker)
SRC=<ssh-user>@192.168.70.56                    # source bare-metal
SRC_OCROOT=/opt/edissyum/opencapture          # racine OC sur .56
export OC_DATA_ROOT=/var/lib/edissyum/opencapture   # racine data sur la cible (/var !)
BUNDLE=/var/tmp/oc-bundle                      # bundle sur /var (pas /tmp = sur / plein)
CUSTOMS="edissyum demo"                        # customs à migrer
# Helper d'exécution sur la cible :
TGT(){ sshpass -p <ssh-password> ssh -o StrictHostKeyChecking=accept-new ${TUSER}@${TARGET} "$@"; }
```

---

## Phase 0 — (recommandé) hygiène de clonage sur la cible
Les 2 VM ont **le même `machine-id` et le même hostname** → corriger sur le clone visé
**avant** d'y poser quoi que ce soit (sinon collisions DHCP/logs) :
```bash
sudo hostnamectl set-hostname serveur de test principal interne-oc
sudo rm -f /etc/machine-id && sudo systemd-machine-id-setup && sudo reboot
```

## Phase 1 — Infra OpenCapture sur la cible (une fois)
```bash
# Récupérer le repo sur la cible (git si accès, sinon scp depuis .79/dev) :
#   git clone <repo> ~/opencapture_docker   ||   scp -r depuis une machine qui l'a
cd ~/opencapture_docker

export OC_DATA_ROOT=/var/lib/edissyum/opencapture     # /var, surtout pas /opt

# Arborescence data sur /var, possédée par le user courant (= APP_UID)
sudo mkdir -p "$OC_DATA_ROOT"/tenants \
              "$OC_DATA_ROOT"/shared-by-tenants/ai-models \
              "$OC_DATA_ROOT"/shared-by-tenants/traefik/{dynamic,certs,letsencrypt}
sudo chown -R "$(id -u):$(id -g)" "$OC_DATA_ROOT"

# .env global : OC_DATA_ROOT + APP_UID/APP_GID (numériques = id -u/-g)
cp .env.example .env
sed -i "s#^OC_DATA_ROOT=.*#OC_DATA_ROOT=$OC_DATA_ROOT#" .env
sed -i -e "s/^APP_UID=.*/APP_UID=$(id -u)/" -e "s/^APP_GID=.*/APP_GID=$(id -g)/" .env

# Réseau Docker partagé (référencé external par les composes) — idempotent
docker network create frontend 2>/dev/null || true
```

## Phase 2 — Image backend par `save/load` (pas de build local : disque juste)
```bash
# Depuis .79 (image déjà construite). Si .79 NE joint PAS .232 (sous-réseaux
# différents), bridger via la machine de dev qui joint les deux :
#   ssh .79 'docker save opencapture-backend:latest' | ssh <cible> 'docker load'
docker save opencapture-backend:latest | ssh ${TUSER}@${TARGET} docker load
# Vérifier :
TGT 'docker images | grep opencapture-backend'
# postgres/rabbitmq seront PULL automatiquement ; le frontend (99 Mo) sera buildé sur place.
```
> Fallback si transfert impossible : build sur la cible (`./deploy.sh --backend-only <id>`),
> MAIS surveiller `/var` (cache de build ~9 Go) et purger après (`docker builder prune`).

## Phase 3 — Traefik en ports alternatifs (8080/8443)
Apache garde 80/443. On lance un Traefik dédié, **mode fichier+docker** (pas de LE) :
```bash
sudo mkdir -p /opt/stacks/traefik   # (ou un dossier sous ~ ; /opt est petit mais ce fichier est minuscule)
cat > ~/traefik-mem.yml <<YAML
name: traefik
networks:
  frontend: { name: frontend, external: true }
services:
  traefik:
    image: traefik:v3.7
    container_name: opencapture_traefik
    command:
      - "--api.dashboard=true"
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.docker.network=frontend"
      - "--providers.file.directory=/dynamic"
      - "--providers.file.watch=true"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
    ports:
      - "8080:80"      # <-- alt (Apache tient 80)
      - "8443:443"     # <-- alt (Apache tient 443)
      - "127.0.0.1:8088:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ${OC_DATA_ROOT}/shared-by-tenants/traefik/dynamic:/dynamic:ro
      - ${OC_DATA_ROOT}/shared-by-tenants/traefik/certs:/certs:ro
    networks: [frontend]
    restart: unless-stopped
YAML
OC_DATA_ROOT="$OC_DATA_ROOT" docker compose -f ~/traefik-mem.yml up -d
TGT 'docker ps --filter name=opencapture_traefik'
```

## Phase 4 — Stubs tenants (mode cert) + `.env` (OC_DATA_ROOT sur /var)
```bash
for id in $CUSTOMS; do
  ./new-tenant.sh cert "$id"
  # new-tenant.sh laisse OC_DATA_ROOT au défaut /opt du gabarit -> FORCER /var :
  sed -i "s#^OC_DATA_ROOT=.*#OC_DATA_ROOT=$OC_DATA_ROOT#" stub-tenants/$id/.env
  # éditer À LA MAIN : OC_FQDN (FQDN distinct par tenant) + POSTGRES_PASSWORD + RABBITMQ_PASS
  $EDITOR stub-tenants/$id/.env
done
```

## Phase 5 — Export `.56` → import (sans re-build : `--no-deploy` puis `--frontend-only`)
```bash
# Export depuis la cible (qui joint .56), bundle sur /var :
MIGRATE_SSH="sshpass -p <ssh-password> ssh -o StrictHostKeyChecking=accept-new" \
  ./migrate.sh export --source "$SRC" --oc-root "$SRC_OCROOT" --out "$BUNDLE" \
  $(for c in $CUSTOMS; do echo --custom $c; done)

./migrate.sh diagnose --bundle "$BUNDLE"

# Pré-créer + chown les dossiers tenants sur /var (sinon "tenants/ root, écriture refusée")
for id in $CUSTOMS; do
  sudo mkdir -p "$OC_DATA_ROOT/tenants/$id"
  sudo chown "$(id -u):$(id -g)" "$OC_DATA_ROOT/tenants/$id"
done

# Import SANS déploiement (réutilise l'image backend loadée), par tenant.
# --force : la cible peut signaler un skew schéma/catalogue (géré par l'outil).
for id in $CUSTOMS; do
  ./migrate.sh import --bundle "$BUNDLE" --custom "$id" --no-deploy --force
done

# Build SEULEMENT le frontend (réutilise le backend loadé) + up -d
for id in $CUSTOMS; do
  ./deploy.sh --frontend-only "$id"
done
```

## Phase 6 — Certs + accès (mode cert, port 8443)
```bash
for id in $CUSTOMS; do
  sudo cp $id.crt $id.key "$OC_DATA_ROOT/shared-by-tenants/traefik/certs/"   # SAN = OC_FQDN du tenant
  sed "s/changeme/$id/g" stub-tenants/$id/tls.yml.example \
    | sudo tee "$OC_DATA_ROOT/shared-by-tenants/traefik/dynamic/$id.yml"
done
# DNS/hosts : <fqdn> -> 192.168.10.<cible> ; accès : https://<fqdn>:8443/
```

## Phase 7 — Post-migration (UI, par tenant)
- **Ré-enregistrer chaque workflow** Verifier/Splitter une fois (régénère scripts + `watcher.ini`).
- **Redémarrer fs-watcher** : `docker restart opencapture_<id>-fs-watcher-1`.
- Valider : login (`https://<fqdn>:8443/`), monitoring/historique, ouverture d'un doc, dépôt test.
- (Si une chaîne MailCollect pointe sur un hôte injoignable type `greenmail`, la désactiver.)

---

## Garde-fous
- **NE JAMAIS** `down -v` (supprime les données).
- **NE PAS toucher** à OC-for-MEM ni à Apache/Maarch (80/443) : le OC dockerisé vit en parallèle (data sur `/var/lib/edissyum/opencapture`, Traefik 8443, DB en conteneur).
- **Surveiller `/var`** (`df -h /var`) : image + data + cache build s'y cumulent (18 Go au départ, OnlyOffice en prend 3,5).
- L'export est **lecture seule** sur `.56` (pg_dump + tar) ; pour un cutover propre, geler les traitements sur `.56` au moment de l'export final.
- FQDN **distinct par tenant** (Traefik route par SNI) ; le SAN du cert doit couvrir exactement l'`OC_FQDN`.
