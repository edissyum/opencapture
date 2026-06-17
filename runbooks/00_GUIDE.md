# Guide — Installation & création de tenants (OpenCapture Docker)

Déploiement multi-tenant : une **infra partagée** (Traefik, réseau, image backend) installée
**une fois par serveur**, puis **un tenant par instance** dans `stub-tenants/<id>/`. Trois modes
d'exposition selon le TLS. Données hors repo sous `/opt`.

| Doc / script | Rôle |
|---|---|
| [01-install-general.sh](01-install-general.sh) | commandes d'installation infra (Docker + Traefik) |
| [02-tenant-letsencrypt.sh](02-tenant-letsencrypt.sh) / [03-tenant-cert.sh](03-tenant-cert.sh) / [04-tenant-http.sh](04-tenant-http.sh) | runbooks par mode (création + exploitation) |
| [../new-tenant.sh](../new-tenant.sh) | crée le stub d'un tenant (copie le gabarit + pré-remplit le `.env`) |
| [../deploy.sh](../deploy.sh) | build + (re)déploie un tenant **existant** |
| [INSTALL.md](INSTALL.md) | doc d'installation détaillée + annexes techniques |

---

## 1. Installation générale (une fois par serveur)

> Prérequis système (Docker Engine + Compose v2) : voir [01-install-general.sh](01-install-general.sh).

```bash
# Sources
git clone git@github.com:edissyum/opencapture_docker.git
cd opencapture_docker

# Données hors repo (par tenant + partagé)
sudo mkdir -p /opt/tenants
sudo mkdir -p /opt/shared-by-tenants/shared-ai-models
sudo mkdir -p /opt/shared-by-tenants/traefik/{dynamic,certs,letsencrypt}

# Réseau Docker partagé + image backend partagée (1 seule fois)
docker network create frontend
docker compose --project-directory infra -f infra/docker-compose.yml build backend

# Traefik partagé (daemon unique ; data sur /opt)
OC_DYNAMIC_PATH=/opt/shared-by-tenants/traefik/dynamic \
OC_CERTS_PATH=/opt/shared-by-tenants/traefik/certs \
LETSENCRYPT_PATH=/opt/shared-by-tenants/traefik/letsencrypt \
LETSENCRYPT_EMAIL=admin@edissyum.com \
docker compose -f infra/docker-compose.traefik-server.yml up -d
```

---

## 2. Créer un tenant

### Les 3 modes

| Mode | Gabarit | TLS | Prérequis spécifiques |
|---|---|---|---|
| **Let's Encrypt** | `_template-letsencrypt` | HTTPS auto (ACME) | DNS public `<fqdn>` + ports 80/443 ouverts |
| **Cert fourni** | `_template-cert` | HTTPS (PEM, par SNI) | déposer le PEM + un fragment `tls.yml` |
| **HTTP pur** | `_template-http` | aucun | aucun — ⚠ **pas de chiffrement** (interne / derrière reverse-proxy) |

Dans la suite : `<id>` = identifiant du tenant (minuscules/chiffres/`_`), `<fqdn>` = son domaine.

### 2.a Avec les scripts (recommandé)

```bash
# 1. Créer le stub. mode = http | le | cert
./new-tenant.sh <mode> <id>          # copie le gabarit + pré-remplit CUSTOM_ID, DB, user, *_PATH

# 2. Renseigner À LA MAIN ce que le script indique
$EDITOR stub-tenants/<id>/.env       # OC_FQDN + POSTGRES_PASSWORD + RABBITMQ_PASS

# 3. (mode cert UNIQUEMENT) cert côté Traefik
sudo cp <id>.crt <id>.key /opt/shared-by-tenants/traefik/certs/
sed "s/changeme/<id>/g" stub-tenants/<id>/tls.yml.example \
  | sudo tee /opt/shared-by-tenants/traefik/dynamic/<id>.yml

# 4. Déployer
./deploy.sh <id>
```

### 2.b Sans les scripts (manuel)

```bash
# 1. Copier le gabarit. mode = http | letsencrypt | cert
cp -r stub-tenants/_template-<mode> stub-tenants/<id>
mv stub-tenants/<id>/.env.example stub-tenants/<id>/.env

# 2. Éditer TOUT le .env : CUSTOM_ID, OC_FQDN, POSTGRES_*, RABBITMQ_*,
#    *_PATH = /opt/tenants/<id>/{pgdata,rabbitmq,custom,docservers,share}
$EDITOR stub-tenants/<id>/.env

# 3. (mode cert) déposer le PEM + le fragment tls.yml — cf. 2.a étape 3
#    (auto-signé : voir 03-tenant-cert.sh pour la commande openssl)

# 4. Démarrer (compose direct, sans deploy.sh)
DIR=stub-tenants/<id>
docker compose --project-directory "$DIR" -f "$DIR/docker-compose.yml" build frontend
docker compose --project-directory "$DIR" -f "$DIR/docker-compose.yml" up -d
```

> **Différences scripts vs manuel**
> - `new-tenant.sh` pré-remplit `CUSTOM_ID` / `POSTGRES_DB` / `POSTGRES_USER` / `RABBITMQ_USER`
>   et les 5 `*_PATH` → il ne reste que `OC_FQDN` + les 2 mots de passe à saisir. En manuel, tu
>   édites tous les champs.
> - `deploy.sh <id>` = `build frontend` + `up -d` (+ build de l'image backend si absente). En
>   manuel, tu lances les deux `docker compose` toi-même.
> - Dans les deux cas, le 1er démarrage déclenche le service `init` qui amorce le tenant
>   (schéma DB, config, assets, chemins) — rien à faire à la main pour ça.

---

## 3. Première connexion

- Ouvrir l'URL du tenant : `https://<fqdn>/` (LE / cert) ou `http://<fqdn>/` (HTTP pur).
  En LE, le certificat est émis au 1er appel (~30 s).
- Identifiants par défaut : **`admin` / `admin`** → **à changer immédiatement** (UI : *Paramètres → Utilisateurs*).

---

## 4. Exploitation d'un tenant

```bash
DIR=stub-tenants/<id>
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

$DC ps                  # état des conteneurs
$DC logs init           # amorçage (1er démarrage)
$DC logs -f backend     # logs API (suivre)
$DC restart backend     # redémarrer un service
$DC down                # arrêter — JAMAIS `down -v` (-v supprime les données !)
```

Reconstruire après une mise à jour du code (avec `deploy.sh`) :

```bash
# Un tenant :
./deploy.sh --frontend-only <id>   # rebuild du frontend du tenant + recrée
./deploy.sh --backend-only  <id>   # rebuild de l'image backend partagée + recrée
./deploy.sh <id>                   # rebuild backend + frontend + recrée

# Tous les tenants, après un `git pull` :
./deploy.sh --frontend-only --all  # changement du template nginx OU d'un overlay Traefik
./deploy.sh --backend-only  --all  # changement du code backend (image partagée)
./deploy.sh --all                  # dans le doute : backend + frontends
./deploy.sh --pull --all           # git pull intégré, puis tout redéployer
```

---

## Voir aussi
- Installation détaillée + annexes techniques : [INSTALL.md](INSTALL.md)
- Runbooks par mode : [02-tenant-letsencrypt.sh](02-tenant-letsencrypt.sh), [03-tenant-cert.sh](03-tenant-cert.sh), [04-tenant-http.sh](04-tenant-http.sh)
- Architecture multi-tenant : [../infra/MULTITENANT.md](../infra/MULTITENANT.md)
