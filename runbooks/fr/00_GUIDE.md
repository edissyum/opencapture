# Guide — Installation & création de tenants (OpenCapture Docker)

Déploiement multi-tenant : une **infra partagée** (Traefik, réseau, image backend) installée
**une fois par serveur**, puis **un tenant par instance** dans `stub-tenants/<id>/`. Trois modes
d'exposition selon le TLS. Données hors repo, sous `$OC_DATA_ROOT` (p. ex. `/opt/edissyum/opencapture`).

> ### OC_DATA_ROOT — LA variable qui fait foi (une seule décision par serveur)
>
> **`OC_DATA_ROOT` est la racine unique des données hors dépôt : la SEULE valeur à décider par
> serveur. Tout le reste en découle — ne jamais coder de chemin de données en dur ailleurs.**
>
> - **Où la définir :** à l'installation, dans [01-install-general.md](01-install-general.md), via
>   `export OC_DATA_ROOT=…` ajouté au `~/.bashrc` (puis `source ~/.bashrc`). C'est le **seul endroit**
>   où l'on choisit l'emplacement des données (prod : `/opt/edissyum/opencapture` ; à adapter par
>   serveur, ex. VM : `/var/edissyum/opencapture`).
> - **Ce qui en découle, automatiquement :** le **`.env` global** (01-install y recopie la valeur du
>   bashrc) → l'**arborescence des données** `${OC_DATA_ROOT}/{tenants,shared-by-tenants/…}` → les
>   chemins **Traefik** (certs/dynamic/letsencrypt) → le **`.env` de chaque tenant** (`new-tenant.sh`
>   reprend cette même valeur) → tous les **volumes** des conteneurs (`${OC_DATA_ROOT}/tenants/<id>/…`).
> - **Priorité au runtime :** `docker compose` privilégie la **variable exportée** (bashrc) sur le
>   `.env`. La garder exportée dans la session : c'est elle qui gagne ; le `.env` ne sert que de repli
>   (cron, sudo, shell non-login).
>
> ➡️ **Pour déplacer toutes les données :** changer cette **seule** ligne dans 01-install (bashrc),
> `source ~/.bashrc`, puis déplacer les dossiers.

| Doc / script | Rôle |
|---|---|
| [01-install-general.md](01-install-general.md) | commandes d'installation infra (Docker + Traefik) |
| [02-tenant-letsencrypt.md](02-tenant-letsencrypt.md) / [03-tenant-cert.md](03-tenant-cert.md) / [04-tenant-http.md](04-tenant-http.md) | runbooks par mode (création + exploitation) |
| [05-sftp-server.md](05-sftp-server.md) | serveur SFTP multi-tenant (ProFTPD `mod_sftp`) — install + ajout d'un tenant |
| [06-webdav-server.md](06-webdav-server.md) | serveur WebDAV multi-tenant (Apache `mod_dav`) — exploitation + ajout d'un tenant |
| [07-smb-server.md](07-smb-server.md) | serveur SMB multi-tenant (Samba standalone) — install + ajout d'un tenant |
| [../new-tenant.sh](../../new-tenant.sh) | crée le stub d'un tenant (copie le gabarit + pré-remplit le `.env`) |
| [../infra-host/sftp/new-sftp-account.sh](../../infra-host/sftp/new-sftp-account.sh) | crée l'accès SFTP d'un tenant (compte virtuel chrooté) |
| [../infra/webdav/new-webdav-account.sh](../../infra/webdav/new-webdav-account.sh) | crée l'accès WebDAV d'un tenant (compte htpasswd) |
| [../infra-host/smb/new-smb-account.sh](../../infra-host/smb/new-smb-account.sh) | crée l'accès SMB d'un tenant (compte Samba local + partage) |
| [../deploy.sh](../../deploy.sh) | build + (re)déploie un tenant **existant** |

---

## 1. Installation générale (une fois par serveur)

**Tout est dans [01-install-general.md](01-install-general.md)** — à dérouler **une seule
fois par serveur**, **ligne par ligne** (ne PAS exécuter d'un bloc : c'est une référence à
copier-coller). Il couvre, dans l'ordre :

1. **Prérequis système** : Docker Engine + Compose v2 (dépôt officiel Docker).
2. **Sources** : `git clone` + `cd opencapture_docker`.
3. **`.env` global** : `cp .env.example .env`, puis `OC_DATA_ROOT` + `APP_UID`/`APP_GID`
   (= `id -u`/`id -g`, valeurs **numériques** baké dans l'image partagée).
4. **Arborescence des données** hors repo (`$OC_DATA_ROOT/{tenants,shared-by-tenants/...}`)
   + `chown` à l'utilisateur courant.
5. **Réseau `frontend`** + **image backend partagée** (`build backend`, 1 seule fois).
6. **Traefik partagé** (daemon unique, chemins dérivés d'`OC_DATA_ROOT`).

> ⚠️ Exporter d'abord la racine pour toute la session : `export OC_DATA_ROOT=/opt/edissyum/opencapture`
> (sinon `${OC_DATA_ROOT:-../data}` retombe sur `../data` et crée des chemins parasites).

---

## 2. Créer un tenant

### Point important à savoir sur les ressources 

Les ressources sont limitées par défaut comme ci-dessous dans infra/docker-compose.yml. Il faut penser à modifier en fonction des ressources du serveur.

Le script [../checkos.sh](../../checkos.sh) fournit une vérification basique des ressources OS en fonction des ressources réelles de la machine (RAM, swap, cœurs) au regard des profils `x-res-*`, et préconise un nombre max de tenants.

La CPU 0 n'est pas attribuée aux tenants pour ne pas bloquer le serveur en cas de surcharge. A voir si du nice est utile.

⚠ Le `cpuset` par défaut (`1-7`) suppose un hôte **8 cœurs**. Sur une machine plus petite, `docker compose up -d` (donc `deploy.sh`) échoue avec *« Requested CPUs are not available »*. Poser alors **`OC_CPUSET`** dans le `.env` du tenant (ex. VM 2 cœurs → `OC_CPUSET=0-1`) ; le défaut `1-7` reste inchangé pour les hôtes 8 cœurs.

```json
# --- QoS : profils de ressources ------------------------------------------
# mem_limit      = plafond DUR RAM (OOM dans le cgroup, pas global)
# memswap_limit  = RAM+swap ; == mem_limit => swap INTERDIT ; > => swap autorisé
# cpu_shares     = poids RELATIF en contention (ne plafonne pas)
x-res-postgres:  &res-postgres  { mem_limit: 512m,  memswap_limit: 512m,  cpu_shares: 1024 }
x-res-rabbitmq:  &res-rabbitmq  { mem_limit: 512m,  memswap_limit: 512m,  cpu_shares: 512  }
x-res-backend:   &res-backend   { mem_limit: 1280m, memswap_limit: 1280m, cpu_shares: 1024 }
x-res-verifier:  &res-verifier  { mem_limit: 2g,    memswap_limit: 4g,    cpu_shares: 2048 }
x-res-splitter:  &res-splitter  { mem_limit: 1536m, memswap_limit: 2560m, cpu_shares: 1536 }
x-res-mail:      &res-mail      { mem_limit: 512m,  memswap_limit: 512m,  cpu_shares: 256  }
x-res-fswatcher: &res-fswatcher { mem_limit: 256m,  memswap_limit: 256m,  cpu_shares: 256  }
x-res-frontend:  &res-frontend  { mem_limit: 128m,  memswap_limit: 128m,  cpu_shares: 256  }

# Réserve le cœur 0 au système ; tenants confinés aux cœurs 1-7 (hôte 8 cœurs).
# Piloté par env : OC_CPUSET dans le .env du tenant si l'hôte a moins de cœurs.
x-cpuset-tenants: &cpuset { cpuset: "${OC_CPUSET:-1-7}" }
```

### Les 3 modes

| Mode | Gabarit | TLS | Prérequis spécifiques |
|---|---|---|---|
| **Let's Encrypt** | `_template-letsencrypt` | HTTPS auto (ACME) | DNS public `<fqdn>` + ports 80/443 ouverts |
| **Cert fourni** | `_template-cert` | HTTPS (PEM, par SNI) | déposer le PEM + un fragment `tls.yml` |
| **HTTP pur** | `_template-http` | aucun | aucun — ⚠ **pas de chiffrement** (interne / derrière reverse-proxy) |

Dans la suite : `<id>` = identifiant du tenant (minuscules/chiffres/`_`), `<fqdn>` = son domaine.

### Procédure (avec `new-tenant.sh`)

```bash
# 1. Créer le stub. mode = http | le | cert
./new-tenant.sh <mode> <id>          # copie le gabarit + pré-remplit CUSTOM_ID, DB, user, OC_DATA_ROOT, APP_UID/GID

# 2. Renseigner À LA MAIN ce que le script indique
$EDITOR stub-tenants/<id>/.env       # OC_FQDN + POSTGRES_PASSWORD + RABBITMQ_PASS

# 3. (mode cert UNIQUEMENT) cert côté Traefik
sudo cp <id>.crt <id>.key ${OC_DATA_ROOT}/shared-by-tenants/traefik/certs/
sed "s/changeme/<id>/g" stub-tenants/<id>/tls.yml.example \
  | sudo tee ${OC_DATA_ROOT}/shared-by-tenants/traefik/dynamic/<id>.yml

# 4. Déployer
./deploy.sh <id>
```

> `new-tenant.sh` pré-remplit `CUSTOM_ID` / `POSTGRES_DB` / `POSTGRES_USER` /
> `RABBITMQ_USER`, ainsi que `OC_DATA_ROOT` (repris du bashrc, sinon du `.env` global — cf.
> l'encadré 🔑 en tête de guide) et `APP_UID`/`APP_GID` (repris du `.env` global) ;
> il ne reste que `OC_FQDN` + les 2 mots de passe. `deploy.sh <id>` enchaîne
> `build frontend` + `up -d`, et le 1er démarrage déclenche le service `init` qui
> amorce le tenant (schéma DB, config, assets, chemins) — rien à faire à la main.
>
> ⚠️ La création **manuelle** (copier le gabarit + éditer le `.env` à la main) est
> volontairement retirée : elle multiplie les erreurs (`changeme` oubliés,
> `CUSTOM_ID` ≠ nom du dossier, `APP_UID` non aligné). Utiliser **toujours**
> `new-tenant.sh`.

---

## 3. Première connexion

- Ouvrir l'URL du tenant : `https://<fqdn>/` (LE / cert) ou `http://<fqdn>/` (HTTP pur).
  En LE, le certificat est émis au 1er appel (~30 s).
- Identifiants par défaut : **`admin` / `admin`** → **à changer immédiatement** (UI : *Paramètres → Utilisateurs*).

---

## 4. Exploitation d'un tenant

### 4.a Commandes générales

```bash
# Pour un tenant en se plaçant dans son dossier
DIR=stub-tenants/<id>
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

$DC ps                  # état des conteneurs
$DC logs init           # amorçage (1er démarrage)
$DC logs -f backend     # logs API (suivre)
$DC restart backend     # redémarrer un service
$DC exec backend env | grep -E 'CUSTOM_ID|POSTGRES|RABBIT'   # vérifier la config injectée
$DC down                # arrêter — JAMAIS `down -v` (-v supprime les données !)

# Pour un tenant depuis la racine (répertoire dans lequel on fait le git pull et qui contient infra)
dc() { docker compose --project-directory "stub-tenants/$1" -f "stub-tenants/$1/docker-compose.yml" "${@:2}"; }
dc <id> down          
dc <id> restart
dc <id> up -d

# Pour tous les tenants faire une commande du type : down | stop | restart | "up -d" | "down -v" (ci-dessous down)
for d in stub-tenants/*/; do id=$(basename "$d"); case "$id" in _template-*) continue;; esac; [ -f "$d/docker-compose.yml" ] && docker compose --project-directory "$d" -f "$d/docker-compose.yml" down; done

```

### 4.b Reconstruire après une mise à jour du code (avec `deploy.sh`) :

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

### 4.b Arrêter/démarrer des containers

```bash

# Le plus simple : stop|start
cd ~/opencapture_docker/stub-tenants/<id>
docker compose stop
# repartir plus tard :
docker compose start

#ou sans changer de dossier (forme explicite, comme deploy.sh) :
docker compose --project-directory stub-tenants/<id> -f stub-tenants/<id>/docker-compose.yml stop

# Variante par nom (sans se soucier du dossier) TRES PRATIQUE !
docker ps -aq --filter "name=opencapture_<id>-" | xargs -r docker stop

# Arrêter tous les dockers d'un même type (ici worker-mail)
docker ps --format '{{.Names}}' | grep -- '-worker-mail-1$' | xargs -r docker stop

```

### 4.d Voir les logs container

```bash
# Logs d'un conteneur (Docker) — le plus courant
docker logs opencapture_test2-worker-mail-1            # tout l'historique
docker logs --tail 50 opencapture_test2-worker-mail-1  # 50 dernières lignes
docker logs -f opencapture_test2-worker-mail-1         # suivre en DIRECT (Ctrl-C pour sortir)
docker logs -t opencapture_test2-worker-mail-1         # avec horodatage
docker logs -t <container> | ts '%Y-%m-%d %H:%M:%S'    # idem mais avec heure locale et non UTC (package moreutils cf. install general)
docker logs --since 10m opencapture_test2-worker-mail-1   # depuis 10 min
docker logs --since 2026-06-23T12:00:00  opencapture_test2-worker-mail-1              # depuis une heure précise


# Le même service sur TOUS les tenants d'un coup (remplacer worker-mail par worker-verifier, backend, postgres…)
for c in $(docker ps -a --format '{{.Names}}' | grep -- '-worker-mail-1$'); do
  echo "===== $c ====="; docker logs --tail 15 "$c" 2>&1
done

```

#### 4.d.1 Logs applicatifs OpenCapture (≠ logs conteneur)

__Important__ : pour le Verifier/Splitter, le vrai détail métier va dans le fichier OpenCapture.log du tenant, pas sur la sortie du conteneur. Pour le trouver puis le suivre :

```bash
docker exec opencapture_test2-backend-1 sh -lc 'find /app -name "*.log"'      # localiser
docker exec -it opencapture_test2-backend-1 sh -lc 'tail -f /app/custom/test2/log/OpenCapture.log'

# Ou directement depuis l'hôte
tail -f ${OC_DATA_ROOT}/tenants/<tenant>/custom/<tenant>/data/log/OpenCapture.log
tail -f ${OC_DATA_ROOT}/tenants/<tenant>/custom/<tenant>/data/MailCollect/MAIL_1/<date>/BATCH_*/<ts>.log  # log par lot de collecte mail
tail -f ${OC_DATA_ROOT}/tenants/<tenant>/custom/<tenant>/bin/ldap/log/technique.log  # log technique LDAP
```
### 4.d.2 Via docker compose (depuis le dossier du tenant)

```bash
cd stub-tenants/<tenant>   # ou infra/ pour "default"
docker compose logs -f worker-mail        # un service
docker compose logs --tail 50             # toute la stack du tenant
```

### 4.d.3 OOM / noyau (quand ça se fait tuer)

```bash
journalctl -k --since "1 hour ago" | grep -iE 'oom-kill|out of memory|killed process'
dmesg -T | grep -i oom
```

### 4.d.4 Ressources en direct (pas des logs, mais utile à côté)

```bash
docker stats --no-stream     # snapshot CPU/RAM par conteneur
docker stats                 # en continu
```

### 4.d.5 Requête dans POSTGRESQL

```bash
cd ~/opencapture_docker
DIR=stub-tenants/<tenant>
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"


$DC exec -T postgres psql -U <user> -d <base> <<'SQL'
INSERT INTO "configurations" ("label", "data")
VALUES ('timeoutUpload', '{"type": "int", "value": "2000", "description": "Délai maximum de téléchargement de fichier"}')
ON CONFLICT ("label") DO NOTHING;
SQL

$DC exec -T postgres psql -U <user> -d <base> -c \
"SELECT label FROM configurations WHERE label='timeoutUpload';
 SELECT id,label,parent FROM privileges WHERE label='certified_copy';"
 ```

### 4.d.6 Destruction d'un tenant

```bash
cd ~/opencapture_docker
ID=<tenant>                                  # <-- le tenant à détruire
DIR=stub-tenants/$ID
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

# 1) Conteneurs + réseau + volumes anonymes du tenant.
#    NB : `--rmi local` ne retire que les images SANS tag custom ; backend et frontend
#    sont des images PARTAGÉES (`opencapture-backend`/`-frontend`, tag custom) -> elles
#    ne sont PAS supprimées, ce qui est voulu (ne jamais casser les autres tenants).
$DC down --remove-orphans --volumes --rmi local

# 2) Données du tenant (DB + rabbitmq + custom + docservers + share) — IRRÉVERSIBLE
sudo rm -rf ${OC_DATA_ROOT}/tenants/$ID

# 3) Le stub (compose + .env + config)
rm -rf stub-tenants/$ID

# 4) (mode cert uniquement) fragment Traefik dynamique du tenant
sudo rm -f ${OC_DATA_ROOT}/shared-by-tenants/traefik/dynamic/$ID.yml

# 5) TODO : Comptes SFTP/SMB/WebDAV 

```

### 4.d.7 Changement de FQDN d'un tenant

```bash

# Example tenant "demo"
cd ~/opencapture_docker

# Mettre le nouveau FQDN dans le .env
sed -i 's#^OC_FQDN=.*#OC_FQDN=demo.open-capture.com#' stub-tenants/demo/.env

# Rebuild et recreate 
#   build l'image opencapture-backend 
#   puis up -d demo -> recreate = bootstrap réécrit custom.ini.url + Traefik nouveau Host + cert LE
./deploy.sh demo

# Vérifs
grep '^url' /opt/edissyum/opencapture/tenants/demo/custom/custom.ini   # url = demo.open-capture.com
curl -sI https://demo.open-capture.com/ | head -5                       # HTTP 200/302 + cert valide
```

## 5. Tunning

```bash 
# En live
docker stats opencapture_<id>-worker-mail-1

# Combien de coeurs le conteneur voit (= le plafond du %) 
# Si docker stats ne dépasse jamais 100 % alors que nproc en montre 7 --> c'est bien 1 seul coeur.
docker exec opencapture_<id>-worker-mail-1 nproc
 
```

---

## 6. Accès distant 

### 6.1 Accès SFTP (optionnel)

Dépôt de fichiers par tenant via **ProFTPD `mod_sftp`**, branché sur
`${OC_DATA_ROOT}/tenants/<id>/share` (surveillé par le `fs-watcher`). **SFTP uniquement** :
sur un serveur à une seule IP, on ne peut pas servir un cert FTPS par tenant
(il faudrait du SNI, non fiable sur ProFTPD) ; le SFTP n'a pas de cert de
domaine (clé d'hôte SSH unique) → multi-tenant trivial. Comptes virtuels
chrootés, mappés sur `$APP_UID/$APP_GID`.

```bash
# Une fois par serveur : install ProFTPD mod_sftp (cf. runbook : clés, pare-feu)
sudo bash runbooks/05-sftp-server.md        # à jouer pas-à-pas, pas d'un bloc

# Par tenant (aucun reload nécessaire) :
sudo ./infra-host/sftp/new-sftp-account.sh <id>              # crée le compte virtuel chrooté
# Connexion client : sftp -P 2222 <id>@<serveur>
```

Détail du design et exploitation : [../infra-host/sftp/README.md](../../infra-host/sftp/README.md).

---

### 6.2 Accès WebDAV (optionnel)

Dépôt de fichiers par tenant en **montage de lecteur réseau** (Explorateur
Windows, Finder macOS, davfs2), branché sur `${OC_DATA_ROOT}/tenants/<id>/share`
(surveillé par le `fs-watcher`). Servi sous **`https://<fqdn>/dav/`** : le
frontend nginx proxifie `/dav/` vers un conteneur **Apache `mod_dav`** par
tenant (nginx n'a pas de module WebDAV). **Path et pas sous-domaine** → réutilise
le DNS + le certificat + la route Traefik existants, **aucune** infra en plus.
Auth Basic htpasswd par tenant, fichiers déposés en `$APP_UID/$APP_GID`.
**Opt-in** : rien à installer sur l'hôte, mais le tenant doit **activer
l'overlay** WebDAV (sinon `/dav/` renvoie 501 « non activé »).

```bash
# 1. Activer l'overlay dans stub-tenants/<id>/docker-compose.yml :
#      include:
#          - path: ../../infra/docker-compose.yml
#          - path: ../../infra/docker-compose.traefik-*.yml
#          - path: ../../infra/webdav/docker-compose.yml   # <- active le WebDAV
# 2. Déployer (build l'image opencapture-webdav si l'overlay est inclus) :
./deploy.sh <id>
# 3. Créer un compte (aucun reload) :
sudo ./infra/webdav/new-webdav-account.sh <id>           # login = <id> ; demande le mot de passe
# Connexion client : monter https://<fqdn>/dav/ comme lecteur réseau.
```

Détail du design et exploitation : [06-webdav-server.md](06-webdav-server.md) +
[../infra/webdav/README.md](../../infra/webdav/README.md).

---

## 6.3 Accès SMB / Samba (optionnel)

Dépôt de fichiers par tenant en **partage réseau SMB** (lecteur Windows, Finder
macOS, `mount.cifs` Linux), branché sur `${OC_DATA_ROOT}/tenants/<id>/share` (surveillé par
le `fs-watcher`). **Un seul démon Samba standalone** installé sur l'hôte : SMB est
sur le **port 445 sans SNI**, non routable par domaine (comme le SFTP, contrairement
au WebDAV) → on distingue les tenants par le **nom de partage** (`\\serveur\<id>`),
pas par le domaine. Comptes **locaux** (`tdbsam`), fichiers forcés sur
`$APP_UID/$APP_GID`. Chiffrement SMB3 (`smb encrypt = required`) → **aucun
certificat** à gérer.

```bash
# Une fois par serveur : install Samba (cf. runbook : compte de service, 445, conf)
sudo bash runbooks/07-smb-server.md         # à jouer pas-à-pas, pas d'un bloc

# Par tenant (pas de restart, reload à chaud) :
sudo ./infra-host/smb/new-smb-account.sh <id>              # crée le compte local + le partage [<id>]
# Connexion client : \\<serveur>\<id>  (ou \\<domaine-client>\<id>), identifiants <id>
```

Détail du design et exploitation : [07-smb-server.md](07-smb-server.md) +
[../infra-host/smb/README.md](../../infra-host/smb/README.md).

---

## Voir aussi
- Runbooks par mode : [02-tenant-letsencrypt.md](02-tenant-letsencrypt.md), [03-tenant-cert.md](03-tenant-cert.md), [04-tenant-http.md](04-tenant-http.md)
- Serveur SFTP : [05-sftp-server.md](05-sftp-server.md) + [../infra-host/sftp/README.md](../../infra-host/sftp/README.md)
- Serveur WebDAV : [06-webdav-server.md](06-webdav-server.md) + [../infra/webdav/README.md](../../infra/webdav/README.md)
- Serveur SMB : [07-smb-server.md](07-smb-server.md) + [../infra-host/smb/README.md](../../infra-host/smb/README.md)
- Architecture multi-tenant : [../infra/MULTITENANT.md](../../infra/MULTITENANT.md)
- **Annexes techniques** (rebuild, multi-stage, rôles de l'image, pipeline, commandes par conteneur, glossaire, reverse-proxy/IP réelle, résolution tenant & FQDN) : ci-dessous dans ce document.

---

# Annexes

> Ces annexes étaient l'ancien `INSTALL.md`. Elles fournissent le **pourquoi** et le
> **détail technique** ; le **comment faire** reste dans les sections 1-7 ci-dessus et
> dans les runbooks.

## Annexe A — Faut-il rebuilder ?

> **Règle d'or** : `git pull` (ou éditer un fichier) **ne reconstruit rien** — le code est
> figé dans l'image au `docker build`. Et **après tout build → `up -d`** (dans chaque
> tenant), sinon le conteneur reste sur l'ancienne image.

| Ce qui a changé | Rebuild ? | Commande |
|---|---|---|
| Code **backend** (`backend/src/…`) | ✅ backend (1×, partagé) | `./deploy.sh --backend-only --all` |
| Deps backend (`pip-requirements.txt`), `backend.Dockerfile`, `apt-requirements.txt` | ✅ backend | idem |
| `infra/docker-entrypoint.sh` / `docker-bootstrap.sh` | ✅ backend | idem |
| Code **frontend** (`frontend/src/…`) | ✅ frontend (1×, partagée) | `./deploy.sh --frontend-only --all` |
| Deps frontend (`package.json`), `frontend.Dockerfile`, `nginx.conf.template` | ✅ frontend (1×, partagée) | idem |
| **`VITE_BACKEND_URL`** (figé à `/` relatif, baké au build ; **non** piloté par `.env` en prod) | ✅ frontend | idem |
| `docker-compose*.yml` (env, ports, volumes, command) | ❌ | `./deploy.sh --no-build <tenant>` |
| `.env` runtime (mots de passe, chemins, `OC_FQDN`, `TZ`, `MAIL_POLL_INTERVAL`…) | ❌ | idem |
| `.env` → **`APP_UID` / `APP_GID`** | ❌ (relu au runtime par l'entrypoint) | idem |
| SQL (`postgres/sql/*.sql`) | ❌ (image officielle) | rejoué **seulement sur DB vide** → `down -v` (⚠️ destructif) |
| Modèles IA / `docservers` / `share` (bind mounts) | ❌ | rien |
| postgres / rabbitmq / traefik | ❌ **jamais** | — |

Après un rebuild **frontend**, vider le cache navigateur (**Ctrl+F5**).

## Annexe B — Pourquoi des « stages » de build (multi-stage)

Les `Dockerfile` ont deux `FROM` : un stage **`builder`** (qui fabrique) et un stage
**`runtime`** (l'image finale). **Seul le dernier stage devient l'image** ; le builder est
**jeté** — seul ce qui est explicitement `COPY --from=builder` survit.

**Frontend** ([../infra/frontend.Dockerfile](../../infra/frontend.Dockerfile)) :
- `builder` (`node`) : `npm ci` + `npm run build` → produit `/app/dist`.
- `runtime` (`nginx`) : `COPY --from=builder /app/dist /usr/share/nginx/html`.
- Jeté : Node, npm, `node_modules`, les sources. Image finale ≈ 99 Mo (nginx + bundle).

Le bundle Vite est bâti avec `VITE_BACKEND_URL=/` (relatif) → **identique pour tous les
tenants** : l'image `opencapture-frontend` est **unique et partagée**, construite **une
fois**. La spécialisation par tenant est faite **au runtime** (variable `CUSTOM_ID` →
`envsubst` sur `nginx.conf.template`), pas au build (cf. Annexe C « Frontend » + Annexe G).

**Backend** ([../infra/backend.Dockerfile](../../infra/backend.Dockerfile)) :
- `builder` : compile les *wheels* Python (avec `build-essential`, headers dev…).
- `runtime` : installe les wheels pré-compilés + libs runtime uniquement.
- Jeté : le compilateur et les headers de dev.

**Bénéfices** : image finale petite, **pas de toolchain ni de sources en production**
(surface d'attaque réduite), séparation nette build-time / runtime. Conséquence pratique :
dans le conteneur frontend, il n'y a **pas** de `/app/dist` ni de sources — le bundle servi
est à `/usr/share/nginx/html`. « Jeté » ≠ « effacé » : les couches du builder restent dans
le **cache de build** (séparé de l'image) pour accélérer les rebuilds.

## Annexe C — Détails techniques

### Une image backend, plusieurs rôles
Tous les services backend partagent l'image `opencapture-backend`. L'`ENTRYPOINT` de
l'image est **toujours** [../infra/docker-entrypoint.sh](../../infra/docker-entrypoint.sh) ; ce qui
change d'un service à l'autre, c'est le `command:` déclaré dans la compose — dont le
**premier argument est le rôle**. L'entrypoint le lit (`ROLE="${1:-api}"`, défaut `api`),
attend les dépendances utiles (Postgres/RabbitMQ selon le rôle), puis un `case "$ROLE"`
lance le bon process : `gunicorn` pour `api`, `kuyruk` pour les workers, le `watcher` pour
`fs-watcher`, `docker-bootstrap.sh` pour `init`… Donc **même image, `command:` différent →
rôle différent** :

| Service | Rôle | Fonction |
|---|---|---|
| `init` | `init` | Bootstrap idempotent du tenant (arbo, config, chemins DB), s'arrête après. |
| `backend` | `api` | API REST Flask + gunicorn (port 8000 interne). |
| `worker-verifier` | `worker-verifier` | Worker Kuyruk (file `verifier_<id>`). |
| `worker-splitter` | `worker-splitter` | Worker Kuyruk (file `splitter_<id>`). |
| `worker-mail` | `worker-mail` | Poller IMAP (`MAIL_POLL_INTERVAL`). |
| `fs-watcher` | `fs-watcher` | Surveille `share/entrant/`, déclenche les workflows. |

L'entrypoint démarre **root** (pour `chown` les bind mounts) puis **droppe** vers le compte
de service défini par `APP_UID`/`APP_GID`/`APP_USER` (dans le `.env` — `1000` n'est que le
défaut ; `01-install` le règle sur `id -u`) via `gosu`. `APP_UID/APP_GID` sont bakés au build
**et** relus au runtime → changer l'UID via `.env` + `up -d` ne nécessite pas de rebuild.

**Exemple : `command: ["worker-splitter"]`.** Le service est déclaré ainsi dans la compose :

```yaml
worker-splitter:
    image: opencapture-backend          # même image que tous les autres
    command: ["worker-splitter"]        # <- le rôle
```

Au démarrage du conteneur, Docker combine l'`ENTRYPOINT` et le `command:`, donc exécute :
`/app/docker-entrypoint.sh worker-splitter`. Déroulé :

1. Le conteneur démarre **root** → l'entrypoint `chown` les bind mounts puis se ré-exécute
   via `gosu` sous `APP_UID:APP_GID` (la valeur du `.env`).
2. `ROLE="${1:-api}"` → `ROLE=worker-splitter` (le 1er argument du `command:`).
3. `case "$ROLE"` tombe sur la branche `worker-splitter`, qui : attend Postgres
   (`wait_for_postgres`) et RabbitMQ (`wait_for_rabbit`), garantit le tenant
   (`ensure_tenant` — bootstrap si `config.ini` absent), `cd /app`, puis :
   ```bash
   exec kuyruk \
       --app "custom.${CUSTOM_ID}.src.backend.process_queue_splitter.kuyruk" \
       worker --queue "splitter_${CUSTOM_ID}"
   ```
4. `exec` **remplace** le shell → `kuyruk` devient PID 1 et consomme la file RabbitMQ
   `splitter_<CUSTOM_ID>` (ex. `splitter_site1`) : chaque job de séparation déposé par
   l'API/le fs-watcher y est traité.

Changer `command:` en `["api"]` ou `["worker-verifier"]` sur la **même image** suffit à
obtenir un autre rôle — c'est tout l'intérêt de l'image unique.

### Pipeline fs-watcher → RabbitMQ → worker (producteur / consommateur)

Les conteneurs sont **découplés par RabbitMQ** : un *producteur* dépose un job dans une
file, un *consommateur* (le worker) le traite. Exemple pour le splitter :

```
[dépôt PDF dans share/entrant/splitter/…]
        │
        ▼  (conteneur fs-watcher)
   watcher  ──► default_workflow.sh $file ──► launch_worker_splitter.py
        │                                          │
        │                                          ▼  main_splitter.launch(args)
        │                                   process_queue_splitter.launch(args)
        │                                   = @kuyruk.task(queue='splitter_<id>')
        │                                          │  (appeler la task = PUBLIER)
        ▼                                          ▼
                              RabbitMQ  ─ file "splitter_<CUSTOM_ID>" ─┐
                                                                       │  (consomme)
        ┌──────────────────────────────────────────────────────────  ▼
   (conteneur worker-splitter)  kuyruk … worker --queue splitter_<id>
        └──► exécute le corps de launch(args) : OCR + séparation, MAJ `monitoring`,
             écriture dans share/export/splitter/…
```

1. **Producteur — conteneur `fs-watcher`.** Le process `watcher` surveille les dossiers de
   `watcher.ini` ; un dépôt déclenche la commande configurée
   ([splitter_workflows/default_workflow.sh](../../backend/installer/bin/scripts/splitter_workflows/default_workflow.sh)),
   qui valide le PDF et lance
   [launch_worker_splitter.py](../../backend/launch_worker_splitter.py) → insère une ligne
   `monitoring` (`wait`) → [main_splitter.launch](../../backend/src/main_splitter.py#L22) →
   appelle `process_queue_splitter.launch(args)`. Cette fonction est décorée
   **`@kuyruk.task(queue='splitter_<id>')`**
   ([process_queue_splitter.py.default:44](../../backend/src/process_queue_splitter.py.default#L44)) :
   en kuyruk, **appeler la tâche la PUBLIE dans RabbitMQ** (ça ne traite rien). fs-watcher
   rend la main aussitôt. *(L'API/UI est l'autre producteur, lors d'un upload.)*
2. **Consommateur — conteneur `worker-splitter`.** `kuyruk … worker --queue splitter_<id>`
   est abonné à la **même** file ; à réception, il exécute **réellement** le corps de
   `launch(args)` (OCR + séparation, mise à jour `monitoring`, sortie dans
   `share/export/splitter/…`).
3. **Intérêt du découplage** : si le worker est occupé/arrêté, les jobs **s'empilent** dans
   la file et sont traités à son retour ; on peut **scaler** (plusieurs workers sur la même
   file). Les deux rôles partagent la même image : le producteur appelle la task pour
   *enfiler*, le worker pour *exécuter*. *(verifier : même schéma avec la file
   `verifier_<id>`.)*

### Frontend (image partagée) + Traefik
Le frontend est **une image unique partagée**, `opencapture-frontend`
([../infra/docker-compose.yml:286](../../infra/docker-compose.yml#L286)), construite **une
fois** (`build frontend`) : le bundle Vite est **identique pour tous les tenants**
(`VITE_BACKEND_URL=/` relatif, [../infra/frontend.Dockerfile:23](../../infra/frontend.Dockerfile#L23)),
donc rien de spécifique au tenant n'est **baké**. La spécialisation est faite **au runtime**
via la variable `CUSTOM_ID` du conteneur : l'entrypoint `nginx:alpine` passe
`nginx.conf.template` dans `envsubst` au démarrage → les `location /${CUSTOM_ID}/ws/…`
prennent la valeur du tenant. Un changement de code/deps frontend impose donc **un seul**
rebuild partagé, puis un `up -d` de chaque tenant à rafraîchir (`./deploy.sh --frontend-only --all`).

L'overlay [../infra/docker-compose.traefik.yml](../../infra/docker-compose.traefik.yml) branche le
frontend sur le réseau externe `frontend` et pose une route `Host(${OC_FQDN})` TLS (resolver
`myresolver`). Le seul point d'entrée public est Traefik (les autres services restent sur le
réseau interne). Détail du routage par domaine/préfixe et du rôle d'`OC_FQDN` : **Annexe G**.

### TLS — certificat fourni par le client (servi par SNI)
Procédure : section 2 ci-dessus + [03-tenant-cert.md](03-tenant-cert.md). Principe : Traefik
choisit le certificat au handshake TLS **par SNI** (le nom demandé par le navigateur), pas
par la règle `Host()` ; il suffit donc que le **SAN** du cert couvre exactement l'`OC_FQDN`,
et le routeur du tenant porte `tls=true` **sans** `certresolver` (overlay
`docker-compose.traefik-cert.yml`). Avantage : **pas besoin de DNS public ni des ports 80/443**
ouverts (aucun challenge ACME). Le cert (`.crt` = chaîne complète, `.key` = clé privée **sans
passphrase**) va dans `${OC_DATA_ROOT}/shared-by-tenants/traefik/certs/` ; un fragment `tls.yml` par
tenant dans `${OC_DATA_ROOT}/shared-by-tenants/traefik/dynamic/<id>.yml` (provider fichier `watch=true`
→ **rechargé à chaud**, utile aussi au renouvellement). Conversion d'un `.pfx`/`.p12`
(Windows/AD) en PEM :

```bash
openssl pkcs12 -in client.pfx -nocerts -nodes -out client.key   # clé privée
openssl pkcs12 -in client.pfx -clcerts -nokeys  -out client.crt # leaf (+ chaîne si présente)
```

> **Pièges.** Le SAN doit couvrir **exactement** l'`OC_FQDN` (`client.example.com` ≠
> `www.client.example.com` ; un wildcard `*.example.com` ne couvre **pas** l'apex
> `example.com`). Si aucun cert ne matche le SNI, Traefik sert son **cert auto-signé** par
> défaut (pas d'erreur de routage, mais avertissement navigateur).

> **Pourquoi ces fichiers *par tenant* vivent sous `shared-by-tenants/`.** Traefik est
> **un seul démon partagé** : son provider fichier surveille **un unique** dossier
> `dynamic/` et lit les certs dans **un unique** `certs/`. Le démon étant partagé, son
> dossier de config l'est aussi — même si chaque entrée (`<id>.crt`, `<id>.key`, `<id>.yml`)
> est propre à un tenant. Ce n'est donc pas de la donnée tenant mal rangée, mais la **config
> de l'infra partagée**. *(À l'inverse, `shared-by-tenants/ai-models/` est réellement
> commun ; les modèles IA propres à un tenant restent sous
> `tenants/<id>/docservers/.../ai/models`.)* Deux conséquences :
> - **Sauvegarde** : un backup de `tenants/<id>` seul ne capture PAS son cert/fragment TLS
>   (ils sont sous `shared-by-tenants/traefik/`) — inclure ce dossier.
> - **Suppression d'un tenant** (mode cert) : retirer aussi
>   `shared-by-tenants/traefik/certs/<id>.{crt,key}` + `dynamic/<id>.yml` (et purger son
>   entrée dans `letsencrypt/acme.json` s'il était en Let's Encrypt).

### Mode développement (Docker)
L'overlay [../infra/docker-compose.override.yml](../../infra/docker-compose.override.yml)
(auto-chargé quand on lance `docker compose up` **depuis `infra/`**) : code **bind-monté**
(pas de rebuild pour modifier le code), gunicorn `--reload`, et **Vite HMR** sur `:5173` au
lieu de nginx. Lancement : `cd infra && docker compose up -d --build`.
Pour développer **hors Docker** (bare-metal, systemd/venv), voir
[../DEV_MODE.md](../../DEV_MODE.md).

### Multi-tenant
Chaque tenant a son projet Compose `opencapture_<CUSTOM_ID>` (conteneurs/volumes/réseau
préfixés → aucune collision), sa propre DB et son propre RabbitMQ. Pour en ajouter un :
répéter les étapes de la section 2 avec un nouvel `<id>`/FQDN. Détails et alternatives (dont le
script bare-metal `create_custom.sh`) dans [../infra/MULTITENANT.md](../../infra/MULTITENANT.md)
et [../infra/BOOTSTRAP_COMPARISON.md](../../infra/BOOTSTRAP_COMPARISON.md).

### Conformité (optionnelle)
Un journal scellé **NF Z42-020** (chaînage SHA-256 + horodatage RFC 3161) est disponible,
**désactivé par défaut**, pour le module Splitter. Voir [../NF_Z42-020.md](../../NF_Z42-020.md).

### Documentation de référence
- [../infra/MULTITENANT.md](../../infra/MULTITENANT.md) — organisation multi-tenant (méthodo `include:`).
- [../infra/BOOTSTRAP_COMPARISON.md](../../infra/BOOTSTRAP_COMPARISON.md) — `create_custom.sh` (bare-metal) vs `docker-bootstrap.sh`.
- [../infra/SCHEDULING.md](../../infra/SCHEDULING.md) — tâches récurrentes (Ofelia, **non intégré** à ce jour).
- [../TERMINOLOGIE.md](../../TERMINOLOGIE.md) — pourquoi « tenant » plutôt que « custom »/« client ».
- [../NF_Z42-020.md](../../NF_Z42-020.md) — journal scellé (option Splitter).
- [../DEV_MODE.md](../../DEV_MODE.md) — développement bare-metal (hors Docker).

## Annexe D — Commandes Docker utiles (par conteneur)

> **Cibler un tenant.** Le plus simple : se placer dans son dossier, `docker compose`
> résout le `.env` et le projet automatiquement :
> ```bash
> cd stub-tenants/site1       # ou infra/ pour "default"
> docker compose ps
> docker compose exec backend bash
> docker compose logs -f worker-splitter
> ```
> Sinon viser le conteneur par son nom `opencapture_<id>-<service>-1` :
> ```bash
> docker exec -it opencapture_site1-backend-1 bash
> docker logs -f opencapture_site1-worker-splitter-1
> ```
> Les conteneurs backend tournent sous le compte de service `APP_UID:APP_GID` (valeur du
> `.env`) ; `exec` ouvre par
> défaut en **root**. Pour agir comme l'appli : `docker compose exec -u "$APP_UID" backend bash`.

### Conteneurs backend — `backend`, `worker-verifier`, `worker-splitter`, `worker-mail`, `fs-watcher`, `init`

Même image `opencapture-backend`, donc même arborescence :

| Quoi | Chemin dans le conteneur |
|---|---|
| Code applicatif | `/app` (`/app/src`, `wsgi.py`, `launch_worker*.py`) |
| Entrypoint / bootstrap | `/app/docker-entrypoint.sh`, `/app/docker-bootstrap.sh` |
| Config du tenant | `/app/custom/<CUSTOM_ID>/config/{config.ini,secret_key,watcher.ini}` |
| Log applicatif | `/app/custom/<CUSTOM_ID>/data/log/OpenCapture.log` |
| Documents traités | `/app/docservers/{verifier,splitter}/…` (dont `ai/models`) |
| Entrées / sorties | `/app/share/entrant/…`, `/app/share/export/…` |
| Modèles IA partagés | `/app/instance/artificial_intelligence/` |
| Données NLTK | `/usr/local/share/nltk_data` |

Entrer : `docker compose exec backend bash` (idem pour `worker-verifier`, etc.).
À vérifier selon le rôle :
- **backend (api)** : gunicorn répond → `docker compose exec backend python -c "import socket; socket.create_connection(('localhost',8000),3)"` ; logs `docker compose logs backend`.
- **worker-verifier / worker-splitter** : `docker compose logs -f worker-splitter` (kuyruk démarré + jobs traités) ; voir aussi `OpenCapture.log`.
- **worker-mail** : `docker compose logs -f worker-mail` (passes IMAP selon `MAIL_POLL_INTERVAL`).
- **fs-watcher** : `docker compose logs fs-watcher` (ligne `using config: …/watcher.ini`) + vérifier `…/config/watcher.ini` (dossiers surveillés).
- **init** : `docker compose logs init` (bootstrap sans erreur) ; conteneur `Exited (0)` = normal (one-shot).

### `postgres`
- Entrer : `docker compose exec postgres bash` puis `sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'`.
- Fichiers : données `/var/lib/postgresql/data/pgdata` ; SQL d'init `/docker-entrypoint-initdb.d/` (joué **une seule fois**, sur DB vide).
- Vérifier : `docker compose exec postgres sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'` ; tables : `\dt` ; ex. `SELECT id,model_label,status FROM ai_models;`.

**Intervention dans la base (psql).** Le `.env` du tenant définit `POSTGRES_USER`/`POSTGRES_DB` ;
on les réutilise dans le conteneur via `sh -c '… "$POSTGRES_USER" … "$POSTGRES_DB"'`.

```bash
# 1) Session interactive (recommandée pour toute MODIFICATION)
docker compose exec postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
#   dans psql :  \l (bases)  \dt (tables)  \d ai_models (colonnes)  \du (rôles)  \q (quitter)
#   puis les requêtes, ex. :
#     SELECT id, model_label, status FROM ai_models ORDER BY id;
#     BEGIN; UPDATE ai_models SET status='DEL' WHERE id IN (11,12); COMMIT;   -- ROLLBACK; pour annuler

# 2) Une requête de LECTURE en une ligne, sans entrer dans psql (-T = pas de TTY)
docker compose exec -T postgres sh -c \
  'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "SELECT id,model_label,status FROM ai_models ORDER BY id;"'

# 3) Rejouer un fichier SQL de l'hôte dans la base
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < mon_script.sql

# 4) Sauvegarde (dump) vers un fichier hôte, puis restauration
docker compose exec -T postgres sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > backup.sql
docker compose exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < backup.sql
```

> ⚠️ Avant tout `UPDATE`/`DELETE` : fais d'abord le `SELECT` du **même périmètre** pour voir les
> lignes touchées, encadre par `BEGIN; … COMMIT;` (et `ROLLBACK;` si besoin), et fais un
> `pg_dump` si l'opération est sensible. Rappel : l'app fait du **soft-delete** (`status='DEL'`),
> elle ne supprime pas les lignes — privilégie la même convention plutôt qu'un `DELETE` brut.

### `rabbitmq`
- Entrer : `docker compose exec rabbitmq sh`.
- Fichiers : données `/var/lib/rabbitmq`.
- Vérifier : files et messages en attente → `docker compose exec rabbitmq rabbitmqctl list_queues name messages consumers` (chercher `verifier_<id>`, `splitter_<id>`) ; UI management exposée en dev sur `:15672`.

### `frontend` (nginx)
- Entrer : `docker compose exec frontend sh`.
- Fichiers : SPA compilée servie depuis `/usr/share/nginx/html` (+ `/assets`) ; conf générée `/etc/nginx/conf.d/default.conf` (depuis le template `/etc/nginx/templates/default.conf.template`).
- Vérifier : `docker compose exec frontend ls -l /usr/share/nginx/html` (bundle présent + date du build) ; `docker compose exec frontend nginx -t` (conf valide). Après un rebuild front : **Ctrl+F5** côté navigateur (cache).

### `traefik` (conteneur `opencapture_traefik`, projet séparé `traefik`)
- **Pas de shell dans l'image** → pas d'`exec`. On inspecte via logs + dashboard.
- Vérifier : `docker logs -f opencapture_traefik` (routers, génération ACME) ; dashboard sur
  `127.0.0.1:8081` (tunnel SSH si distant).
- **Accéder au volume nommé `letsencrypt`** (il contient `acme.json` = clé privée +
  certificats). Contrairement à un bind mount, un **volume nommé** n'est pas un dossier hôte
  qu'on choisit — on y accède ainsi :
  1. **Le localiser** : `docker volume ls | grep letsencrypt` → nom réel **`traefik_letsencrypt`**
     (préfixé par le projet `traefik`), puis `docker volume inspect traefik_letsencrypt`
     (champ `Mountpoint` = chemin réel sur l'hôte, sous `/var/lib/docker/volumes/…`, accès root).
  2. **Lire son contenu** sans shell dans Traefik : le monter dans un conteneur jetable →
     `docker run --rm -v traefik_letsencrypt:/v alpine ls -l /v` (ou `… cat /v/acme.json`).
  3. **Raccourci ici** : ce volume est en réalité **bind-backé** vers `${LETSENCRYPT_PATH}`
     (= `${OC_DATA_ROOT}/shared-by-tenants/traefik/letsencrypt` en prod) — `docker volume inspect` le montre
     dans `Options.device`. Donc le fichier est lisible directement à
     **`${OC_DATA_ROOT}/shared-by-tenants/traefik/letsencrypt/acme.json`** sur l'hôte.

### Lien volumes hôte ↔ conteneur

Par tenant — les chemins hôte sont les valeurs `*_PATH` du `.env` (en prod :
`${OC_DATA_ROOT}/tenants/<id>/…` ; défaut compose si non renseigné : `../data/<id>/…`) :

| Hôte (prod) | Conteneur | Contenu |
|---|---|---|
| `${OC_DATA_ROOT}/tenants/<id>/pgdata` | `postgres:/var/lib/postgresql/data` | base PostgreSQL |
| `${OC_DATA_ROOT}/tenants/<id>/rabbitmq` | `rabbitmq:/var/lib/rabbitmq` | files RabbitMQ |
| `${OC_DATA_ROOT}/tenants/<id>/custom` | `backend:/app/custom` | config tenant, logs, MailCollect |
| `${OC_DATA_ROOT}/tenants/<id>/docservers` | `backend:/app/docservers` | documents traités, modèles IA du tenant |
| `${OC_DATA_ROOT}/tenants/<id>/share` | `backend:/app/share` | entrées (`entrant/`) et sorties (`export/`) |
| `${OC_DATA_ROOT}/shared-by-tenants/ai-models` | `backend:/app/instance/artificial_intelligence` | modèles IA partagés (rotate, contact) |
| `${OC_DATA_ROOT}/shared-by-tenants/traefik/letsencrypt` | `traefik:/letsencrypt` | certificats Let's Encrypt (acme.json) |
| `${OC_DATA_ROOT}/shared-by-tenants/traefik/certs` | `traefik:/certs` | certs TLS fournis par les clients (PEM) |

> Concrètement : un PDF déposé dans `${OC_DATA_ROOT}/tenants/<id>/share/entrant/splitter/default/` (hôte)
> apparaît dans `/app/share/entrant/splitter/default/` (conteneur) → c'est ce que `fs-watcher`
> détecte. Inversement, les sorties écrites par les workers dans `/app/share/export/…` sont
> lisibles directement sous `${OC_DATA_ROOT}/tenants/<id>/share/export/…` sur l'hôte.

## Annexe E — Glossaire Docker

- **Tenant** : une **instance isolée** d'OpenCapture (sa propre base PostgreSQL, ses volumes,
  son projet Compose, son FQDN), identifiée par son **`CUSTOM_ID`**. Le code OpenCapture
  l'appelle « **custom** » (`custom/<id>/`, `custom.ini`, `create_custom.sh`, `CUSTOM_ID`).
  Tous les tenants **partagent la même image backend** mais ne partagent **aucune donnée**.
  Un tenant peut être un client, un environnement de **test** ou une **démo**
  (`default`) — d'où le terme neutre « tenant » plutôt que « client ».
- **Image** : modèle **en lecture seule** = OS minimal + dépendances + code, prêt à lancer.
  Ici : `opencapture-backend`, `<tenant>-frontend`, `postgres:17.6`…
- **Conteneur** : une **instance en cours d'exécution** d'une image (un processus isolé).
  Ex. `opencapture_site1-backend-1`. Plusieurs conteneurs peuvent venir de la même image.
- **Build (`docker build`)** : fabrication d'une image à partir d'un `Dockerfile` (suite
  d'instructions `FROM`/`RUN`/`COPY`…). **C'est le seul moment où le code entre dans l'image.**
- **« Baké » / baked-in** : franglais pour « **figé/cuit dans l'image** au moment du build ».
  Un fichier baké n'est plus modifiable sans **rebuild**. Ex. le bundle frontend et le code
  backend sont *bakés* ; à l'inverse, les données dans les volumes ne le sont pas.
- **Couche / layer** : chaque instruction du `Dockerfile` crée une **couche** empilée. Docker
  **met en cache** les couches inchangées → un rebuild ne refait que ce qui a changé (et tout
  ce qui suit). D'où l'ordre « dépendances d'abord, code ensuite » pour profiter du cache.
- **Stage / multi-stage** : un `Dockerfile` peut avoir plusieurs `FROM … AS <nom>` ; chaque
  `FROM` est un **stage**. Seul le **dernier** devient l'image finale ; les stages
  intermédiaires (ex. `builder`) servent à fabriquer puis sont **jetés** (cf. Annexe B).
- **`COPY --from=builder`** : récupère un résultat produit dans un stage précédent (le `dist`,
  les *wheels*…) vers l'image finale — seul moyen de garder quelque chose d'un stage jeté.
- **Wheel (Python, `.whl`)** : format de paquet Python **pré-compilé** (PEP 427) ; l'installer
  ne demande **aucune compilation** (ni compilateur, ni headers de dev). Dans le backend, le
  stage `builder` exécute `pip wheel` pour pré-compiler **une fois** toutes les dépendances
  (y compris les extensions C, ex. `pdftotext`) en fichiers `.whl` ; le stage `runtime` fait
  juste `pip install --no-index --find-links=/wheels` → installation **rapide** et **sans**
  outils de build dans l'image finale (cf. Annexe B).
- **`ENTRYPOINT` vs `CMD` / `command:`** : l'`ENTRYPOINT` est le programme lancé (ici toujours
  `docker-entrypoint.sh`) ; le `CMD`/`command:` lui passe des **arguments** (ici **le rôle** :
  `api`, `worker-splitter`…). Docker exécute `ENTRYPOINT + CMD` (cf. Annexe C).
- **Bind mount** : on mappe un **dossier précis de l'hôte** dans le conteneur — ici
  `${OC_DATA_ROOT}/tenants/<id>/docservers` (hôte) ↔ `/app/docservers` (conteneur). Les fichiers sont
  **directement visibles et éditables sur l'hôte**. **C'est ce qu'utilise OpenCapture**
  (pgdata, custom, docservers, share). Comme c'est un dossier hôte, **`down -v` ne le supprime
  PAS** ; pour tout effacer il faut `rm -rf ${OC_DATA_ROOT}/tenants/<id>`.
- **Volume nommé** : Docker gère lui-même le stockage dans sa zone interne
  (`/var/lib/docker/volumes/<nom>`) ; on y accède **par son nom**, pas par un chemin hôte.
  Plus portable, mais moins direct à inspecter. `down -v` **supprime** les volumes nommés
  (ici : le volume `letsencrypt` de Traefik).
- *Les deux* **persistent hors de l'image** (un rebuild ne touche jamais aux données). La
  seule différence : avec un **bind mount c'est l'opérateur** qui choisit le dossier hôte ; avec un
  **volume nommé c'est Docker** qui décide où ranger les fichiers.
- **`docker compose up -d`** : crée/démarre les conteneurs en arrière-plan (`-d` = *detached*)
  et **recrée** ceux dont la **config ou l'image a changé**. `down` les arrête ; **`down -v`
  supprime aussi les volumes nommés** (⚠️ ; les bind mounts hôte, eux, survivent — cf. ci-dessous).
- **Compose / service / projet** : `docker compose` orchestre plusieurs conteneurs décrits
  dans un `docker-compose.yml`. Un **service** = une définition de conteneur
  (`backend`, `frontend`…) ; un **projet** = un groupe de services isolé (ici
  `opencapture_<id>`, d'où des conteneurs/volumes/réseau **préfixés**).
- **Tag** : étiquette de version d'une image (`opencapture-backend:latest`). `latest` = la
  dernière **construite**, pas forcément « à jour » en l'absence de rebuild.
- **Registry / `pull` / `push`** : dépôt d'images distant (Docker Hub, GHCR…). `pull`
  télécharge, `push` envoie. Ici les images applicatives sont **construites localement** (pas
  de registry) ; seules `postgres`/`rabbitmq`/`traefik`/`node`/`nginx` sont *pull* depuis Docker Hub.
- **`exec` vs `run`** : `exec` lance une commande dans un conteneur **déjà en cours**
  (`docker compose exec backend bash`) ; `run` crée un **nouveau** conteneur.
- **Réseau** : les conteneurs d'un projet se parlent sur un réseau interne **par nom de
  service** (`postgres`, `rabbitmq`, `backend`). Le réseau externe `frontend` relie les
  frontends à Traefik.

## Annexe F — Chaîne reverse-proxy & IP réelle du client

Une requête traverse **trois** couches avant d'atteindre l'application :

```
Navigateur ──TLS──▶ Traefik ──────▶ nginx (frontend) ──────▶ gunicorn (backend/api)
 IP réelle           :80/:443        location /<id>/ws/        Flask
                     Host(${FQDN})   proxy_set_header …        request.remote_addr
```

**Le problème.** Sans correctif, `request.remote_addr` côté Flask vaut l'IP de **nginx**
(le dernier proxy), **identique pour tous les utilisateurs** d'un tenant. Deux impacts :

- **Rate-limit** ([../backend/src/rest/auth.py:28](../../backend/src/rest/auth.py#L28)) :
  `flask-limiter` avec `key_func=get_remote_address`, `default_limits=["200/hour"]` (+ des
  `5/minute` sur `/auth/login`, `/auth/…` — [auth.py:68](../../backend/src/rest/auth.py#L68),
  [85](../../backend/src/rest/auth.py#L85), [115](../../backend/src/rest/auth.py#L115)). Si tous
  les utilisateurs partagent une seule IP, ils partagent **un seul seau** → « Trop de
  requêtes » (HTTP 429) alors que chacun fait peu d'appels.
- **Historique** : les événements journalisent `request.remote_addr`
  ([../backend/src/rest/history.py:45](../../backend/src/rest/history.py#L45), et de nombreux
  contrôleurs) → sans correctif, **toutes** les lignes portent l'IP du proxy.

**Ce que fait nginx** ([../infra/nginx.conf.template:48-54](../../infra/nginx.conf.template#L48)) :
il transmet les en-têtes standard au backend —

```nginx
proxy_set_header X-Real-IP         $remote_addr;
proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;   # APPEND (chaîne d'IP)
proxy_set_header X-Forwarded-Proto $scheme;
```

**Ce que fait le backend** ([../backend/wsgi.py:35](../../backend/wsgi.py#L35)) : `ProxyFix`
relit ces en-têtes pour restaurer la **vraie IP** —

```python
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=2, x_proto=1, x_host=1, x_port=1)
```

> **Pourquoi `x_for=2` ?** `x_for` = nombre de proxies **de confiance** qui *appendent* à
> `X-Forwarded-For`, comptés **depuis la droite** : Traefik ajoute l'IP réelle du client,
> puis nginx ajoute l'IP de Traefik → **2**. ProxyFix prend donc la 2ᵉ entrée en partant de
> la droite = l'IP client réelle.
>
> **Anti-spoofing.** Un `X-Forwarded-For` forgé par le client se retrouve **plus à gauche**
> que les 2 entrées ajoutées par Traefik+nginx → il est **ignoré**. La valeur n'est donc
> fiable **que si** le compte de proxies est exact.
>
> ⚠️ `x_for` **dépend de la chaîne**. Ajouter un reverse-proxy d'entreprise **devant**
> Traefik (ou retirer nginx) casse le compte → réajuster `x_for` en conséquence.

> **Portée du rate-limit.** Le stockage est `storage_uri="memory://"`
> ([auth.py:28](../../backend/src/rest/auth.py#L28)) : compteurs **en mémoire du process**
> backend, non partagés entre workers gunicorn ni persistés au redémarrage. Chaque tenant a
> son propre backend → seaux isolés par tenant.

## Annexe G — Résolution du tenant & rôle d'`OC_FQDN`

**Comment une requête est rattachée à un tenant.** Un *middleware* WSGI
([../backend/src/__init__.py:37-71](../../backend/src/__init__.py#L37)) inspecte chaque requête
et détermine le `custom_id` par **deux voies** :

1. **Par préfixe d'URL** — `.../<id>/ws/...`
   ([__init__.py:61-69](../../backend/src/__init__.py#L61)). Le segment avant `ws/` est le
   `custom_id` ; `is_custom_exists()` vérifie qu'une section `[<id>]` existe dans
   `custom.ini` ([../backend/src/functions.py:209](../../backend/src/functions.py#L209)) ; le
   préfixe est retiré de `PATH_INFO`. C'est la voie **par défaut** (le frontend appelle
   `/<id>/ws/...`).
2. **Par domaine (URL « propre »)** — `https://<fqdn>/` **sans** préfixe
   ([__init__.py:45-59](../../backend/src/__init__.py#L45)). Le domaine (`Host`/`Referer`) est
   comparé au champ `url = <fqdn>` de `custom.ini` via
   `is_custom_exists_from_url()` / `retrieve_custom_id_from_url()`
   ([functions.py:295-318](../../backend/src/functions.py#L295)). C'est ce qui permet de servir
   le tenant à la racine du domaine, sans le préfixe `/<id>/`.

> nginx expose **les deux formes** vers le backend : un `location` préfixé
> `^/${CUSTOM_ID}/(ws|backend_oc)/` ([nginx.conf.template:48](../../infra/nginx.conf.template#L48))
> **et** un `location` non préfixé `^/(ws|backend_oc)/`
> ([:67](../../infra/nginx.conf.template#L67)) — miroir des deux voies ci-dessus.

**Ce que fait `OC_FQDN`** (variable **runtime**, jamais bakée) :

- **Route Traefik** : les labels posent `Host(`${OC_FQDN}`)` sur le routeur du tenant
  ([../infra/docker-compose.traefik.yml:63](../../infra/docker-compose.traefik.yml#L63) et
  overlays `-cert`/`-http`) → le domaine est routé vers **ce** tenant.
- **`custom.ini`** : au démarrage, `docker-bootstrap.sh` écrit/patche `url = ${OC_FQDN}`
  dans la section du tenant ([../infra/docker-bootstrap.sh:176-194](../../infra/docker-bootstrap.sh#L176))
  → active la **voie 2** (URL propre).
- **TLS** : en Let's Encrypt, le `certresolver` émet le cert pour ce `Host` ; en mode cert,
  le **SAN** du certificat doit couvrir exactement `OC_FQDN`.

**Ce que `OC_FQDN` ne fait PAS** : il **n'est baké dans aucune image**.

- L'image **backend** est **partagée** → `OC_FQDN` n'y entre pas (env runtime).
- L'image **frontend** est **partagée** elle aussi ([../deploy.sh:139-141](../../deploy.sh#L139)),
  bâtie avec `VITE_BACKEND_URL=/` **relatif**
  ([../infra/frontend.Dockerfile:23](../../infra/frontend.Dockerfile#L23)) → la SPA appelle le
  backend en **same-origin**, donc le FQDN n'y est pas figé non plus. nginx écoute
  `server_name _` ([nginx.conf.template:27-28](../../infra/nginx.conf.template#L27)), tout Host
  confondu.

**Conséquence — changer de FQDN ne demande AUCUN rebuild, juste un *recreate*** :

```bash
sed -i 's#^OC_FQDN=.*#OC_FQDN=<nouveau-fqdn>#' stub-tenants/<id>/.env
./deploy.sh --no-build <id>          # = up -d : recrée les conteneurs, sans rebuild
```

Au *recreate*, le conteneur reprend le nouveau label Traefik `Host()` et `docker-bootstrap.sh`
réécrit `custom.ini` `url`. (`./deploy.sh <id>` fonctionne aussi mais **rebuild inutilement**
les images partagées.) Cf. la procédure §4.d.7 et le tableau **Annexe A** (`OC_FQDN` = ligne
« ❌ rebuild »).
