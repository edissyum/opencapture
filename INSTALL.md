# Installation d'OpenCapture (Docker)

Ce document décrit l'installation **en production**, derrière le reverse-proxy **Traefik**
(URL propre + HTTPS Let's Encrypt). Chaque **tenant** — une instance isolée identifiée par son
`CUSTOM_ID` (le code OpenCapture l'appelle « custom ») — est une stack à part entière.
Les détails techniques sont en **annexes** — le corps reste volontairement simple.

> Modèle : une **image backend partagée** par tous les tenants, un **frontend par tenant**,
> et un service `init` qui prépare automatiquement le tenant au premier démarrage.
> Voir [Annexe C](#annexe-c--détails-techniques).

---

## 1. Prérequis

- **Docker** 24+ et **Docker Compose v2.24+** (`docker compose version`).
- Accès Docker (utilisateur dans le groupe `docker`).
- **Ports 80 et 443 ouverts** depuis Internet (challenge Let's Encrypt).
- Le **DNS du FQDN** du tenant (ex. `site1.example.com`) pointe vers le serveur.
- Un **email valide** pour Let's Encrypt.

## 2. Récupérer le code

```bash
git clone <url-du-repo> opencapture_docker
cd opencapture_docker
```

## 3. Lancer Traefik (une seule fois par serveur)

Traefik est partagé par tous les tenants via le réseau Docker `frontend`. **Un seul
daemon** ([infra/docker-compose.traefik-server.yml](infra/docker-compose.traefik-server.yml))
sert les 3 modes (HTTP, HTTPS Let's Encrypt, HTTPS cert client) : c'est chaque
**tenant** qui choisit son mode via ses labels (cf. « Traefik — variantes TLS »).

```bash
# Email ACME (Let's Encrypt) : à mettre dans le .env racine
cp .env.example .env
# éditer .env -> LETSENCRYPT_EMAIL=<votre email valide>

docker network create frontend
docker compose -f infra/docker-compose.traefik-server.yml up -d
```

> Si un Traefik tourne déjà sur ce serveur (avec un resolver ACME `myresolver`), saute
> cette étape : il suffira que les tenants rejoignent le réseau `frontend`.

## 4. Créer un tenant

Un tenant = un dossier sous `tenants/<id>/` avec son `.env` et un `docker-compose.yml`
qui inclut l'infra + l'overlay Traefik.

```bash
mkdir -p tenants/site1
cp .env.example tenants/site1/.env
```

Éditer **`tenants/site1/.env`** — au minimum :

| Variable | Mettre |
|---|---|
| `CUSTOM_ID` | `site1` (identifiant unique, minuscules/chiffres/`_`) |
| `OC_FQDN` | `site1.example.com` (le FQDN DNS) |
| `POSTGRES_PASSWORD` | un mot de passe fort |
| `RABBITMQ_PASS` | un mot de passe fort |
| `POSTGRES_DB` / `POSTGRES_USER` | ex. `opencapture_site1` / `site1` |
| `*_PATH` (volumes) | `../data/site1/...` (données isolées du tenant) |

Créer **`tenants/site1/docker-compose.yml`** :

```yaml
name: opencapture_site1
include:
    - path: ../../infra/docker-compose.yml
    - path: ../../infra/docker-compose.traefik.yml
```

## 5. Démarrer le tenant

```bash
cd tenants/site1
docker compose up -d --build
```

Au premier démarrage, le service `init` prépare le tenant (arborescence, config,
chemins en base) ; les autres services attendent qu'il ait terminé.

```bash
docker compose logs -f init     # suivre le bootstrap
docker compose ps               # tous les services "Up"/"healthy"
```

## 6. Première connexion

- Ouvrir **`https://site1.example.com/`** (le certificat se génère au 1er appel, ~30 s).
- Identifiants par défaut : **`admin` / `admin`**.
- **Changer le mot de passe admin immédiatement** (UI : *Paramètres → Utilisateurs*).

## 7. Données persistantes

Tout vit sous `data/site1/` : `pgdata/` (PostgreSQL), `rabbitmq/`, `custom/` (config),
`docservers/` (documents + modèles IA), `share/` (entrées/sorties). Les modèles IA
partagés sont sous `data/shared-ai-models/`.

> ⚠️ Ne jamais faire `docker compose down -v` : `-v` **supprime les volumes** (DB,
> documents). Pour arrêter sans perdre les données : `docker compose down` (sans `-v`).

---

## Traefik — variantes TLS

Le flux principal (étapes 1-7) expose un tenant en **HTTPS Let's Encrypt**. Le **même**
daemon Traefik (étape 3) sert aussi les deux variantes ci-dessous — seuls les **labels
du tenant** changent, jamais le daemon.

### Test local (HTTP, sans Let's Encrypt)

Pour un tenant sans DNS public ni TLS, on l'expose en **HTTP pur** : son
`docker-compose.yml` inclut **`traefik-test.yml`** (labels `entrypoints=web`, sans TLS)
au lieu de `traefik.yml`. Le daemon Traefik reste **le même** (il écoute déjà sur `:80`).

```yaml
name: opencapture_site1
include:
    - path: ../../infra/docker-compose.yml
    - path: ../../infra/docker-compose.traefik-test.yml   # <- HTTP, au lieu de traefik.yml
```

**Pas de DNS** : pointer le FQDN en local — `/etc/hosts` → `127.0.0.1 site1.example.com`
(ou passer l'en-tête `Host` à curl). Lancement identique :
`cd tenants/site1 && docker compose up -d --build`. Accès :
```bash
curl -H "Host: site1.example.com" http://localhost/        # via en-tête Host
# ou, /etc/hosts renseigné, dans le navigateur : http://site1.example.com/
```
Dashboard Traefik : `http://127.0.0.1:8081/` (tunnel SSH si serveur distant).

> Les tenants de test fournis (`tests/tenants/test1`, `test2`) sont déjà câblés ainsi
> (`include … traefik-test.yml`) → `./deploy.sh test1` suffit à les (re)déployer.

### Certificat fourni par le client (au lieu de Let's Encrypt)

Certains clients imposent **leur propre certificat TLS** (PKI interne, wildcard
d'entreprise, cert acheté…) plutôt qu'un cert Let's Encrypt généré par Traefik.
Traefik sait servir un cert fourni via un **provider fichier**, choisi **par SNI**.
Avantage : un tel tenant n'a **pas besoin de DNS public ni des ports 80/443 ouverts**
vers Internet (aucun challenge ACME) — il fonctionne sur DNS interne.

> **Principe.** Traefik choisit le certificat au handshake TLS, **par SNI** (le nom
> demandé par le navigateur), pas par la règle `Host()`. Il suffit donc que le
> **SAN** du certificat couvre exactement l'`OC_FQDN` du tenant. Le routeur du
> tenant porte juste `tls=true` (**sans** `certresolver`).

> Le provider fichier est **toujours actif** dans le daemon (étape 3) : rien à
> activer côté Traefik, il suffit de déposer le cert et de le déclarer.

#### 1. Déposer le certificat sur le serveur

Le certificat doit être au format **PEM** : le `.crt` est la **chaîne complète**
(leaf + intermédiaires), la `.key` est la **clé privée sans passphrase**.

```bash
mkdir -p data/certs/tenants
cp client_a.crt data/certs/tenants/client_a.crt     # fullchain PEM
cp client_a.key data/certs/tenants/client_a.key     # clé privée PEM
```

> Le client livre souvent un `.pfx`/`.p12` (Windows/AD). Conversion en PEM :
> ```bash
> openssl pkcs12 -in client_a.pfx -nocerts -nodes -out data/certs/tenants/client_a.key
> openssl pkcs12 -in client_a.pfx -clcerts -nokeys -out data/certs/tenants/client_a.crt
> # (ajouter la chaîne intermédiaire au .crt si le .pfx ne l'inclut pas)
> ```
> `data/` est **gitignoré** : les clés privées ne sont jamais commitées. Le nom de
> fichier est libre (Traefik ne le lit pas) ; seul compte le SAN du certificat.

#### 2. Déclarer le certificat (provider fichier)

Créer **`infra/traefik/dynamic/tls.yml`** (le dossier monté sur `/dynamic`). Les
chemins sont vus **dans le conteneur** Traefik (`/certs/...`) :

```yaml
tls:
    certificates:
        - certFile: /certs/client_a.crt
          keyFile: /certs/client_a.key
        # - certFile: /certs/client_b.crt   # autant d'entrées que de certs
        #   keyFile: /certs/client_b.key
```

`watch=true` est actif → Traefik recharge **à chaud**, sans redémarrage (utile aussi
au renouvellement : on remplace les fichiers et c'est tout).

#### 3. Brancher le tenant — labels inline (sans overlay)

Un tenant à cert fourni est comme un tenant LE (étape 4), mais au lieu d'inclure
`docker-compose.traefik.yml` (qui force ACME via `certresolver`), il pose ses labels
**inline** avec `tls=true` **sans** `certresolver` :

```yaml
name: opencapture_client_a
include:
    - path: ../../infra/docker-compose.yml
services:
    frontend:
        ports: !override []
        networks: [default, frontend]
        labels:
            - "traefik.enable=true"
            - "traefik.docker.network=frontend"
            - "traefik.http.routers.${CUSTOM_ID}.rule=Host(`${OC_FQDN}`)"
            - "traefik.http.routers.${CUSTOM_ID}.entrypoints=web,websecure"
            - "traefik.http.routers.${CUSTOM_ID}.tls=true"
            # PAS de certresolver -> cert servi par le provider fichier (SNI)
            - "traefik.http.services.${CUSTOM_ID}.loadbalancer.server.port=80"
networks:
    default:
    frontend:
        name: frontend
        external: true
```

#### 4. Démarrer et vérifier

```bash
cd tenants/client_a
docker compose up -d --build

# Quel cert est servi (SNI forcé) — doit montrer l'émetteur/SAN du cert client :
echo | openssl s_client -connect <IP_OU_127.0.0.1>:443 -servername client_a.example.com 2>/dev/null \
  | openssl x509 -noout -issuer -subject -ext subjectAltName
```

> **Pièges.** Le SAN doit couvrir **exactement** l'`OC_FQDN` (`client_a.example.com`
> ≠ `www.client_a.example.com` ; un wildcard `*.example.com` ne couvre **pas**
> l'apex `example.com`). Si aucun cert ne matche le SNI, Traefik sert son **cert
> auto-signé** par défaut (pas d'erreur de routage, mais avertissement navigateur).

> On peut **mélanger** : des tenants en LE (`traefik.yml`), d'autres en HTTP
> (`traefik-test.yml`), d'autres en cert client (labels inline ci-dessus) — tous
> derrière le **même** Traefik. Le choix se fait par les labels de chaque tenant et,
> pour le cert, par SNI ; aucun conflit.

---

## Exploitation au quotidien — `deploy.sh`

`./deploy.sh` reconstruit et redéploie proprement après une mise à jour du code. Il
applique les règles : **backend construit 1×** (image partagée), **frontend par tenant**,
puis **`up -d`** pour recréer les conteneurs (sinon ils gardent l'ancienne image).

```bash
./deploy.sh --all                   # backend 1× + front + recreate de TOUS les tenants
./deploy.sh site1                   # backend 1× + front de site1 + recreate site1
./deploy.sh --frontend-only site1   # seulement le frontend de site1
./deploy.sh --backend-only --all    # backend 1× + recreate de tous les tenants
./deploy.sh --no-build site1        # juste recréer (ex. après modif .env, aucun rebuild)
./deploy.sh --pull site1 site2      # git pull puis build+deploy de site1 et site2
./deploy.sh --help                  # aide complète
```

Un tenant est résolu automatiquement : `default` → `infra/`, sinon `tenants/<id>/`,
sinon `tests/tenants/<id>/`. **Quand faut-il rebuilder ?** Voir
[Annexe A](#annexe-a--faut-il-rebuilder-). **Ajouter un tenant** : refaire les étapes 4-5
(ou voir [Annexe C](#annexe-c--détails-techniques)).

---

# Annexes

## Annexe A — Faut-il rebuilder ?

> **Règle d'or** : `git pull` (ou éditer un fichier) **ne reconstruit rien** — le code est
> figé dans l'image au `docker build`. Et **après tout build → `up -d`** (dans chaque
> tenant), sinon le conteneur reste sur l'ancienne image.

| Ce qui a changé | Rebuild ? | Commande |
|---|---|---|
| Code **backend** (`backend/src/…`) | ✅ backend (1×, partagé) | `./deploy.sh --backend-only --all` |
| Deps backend (`pip-requirements.txt`), `backend.Dockerfile`, `apt-requirements.txt` | ✅ backend | idem |
| `infra/docker-entrypoint.sh` / `docker-bootstrap.sh` | ✅ backend | idem |
| Code **frontend** (`frontend/src/…`) | ✅ frontend (par tenant) | `./deploy.sh --frontend-only <tenant>` |
| Deps frontend (`package.json`), `frontend.Dockerfile`, `nginx.conf.template` | ✅ frontend | idem |
| `.env` → **`VITE_BACKEND_URL`** (baké dans le bundle) | ✅ frontend | idem |
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

**Frontend** ([infra/frontend.Dockerfile](infra/frontend.Dockerfile)) :
- `builder` (`node`) : `npm ci` + `npm run build` → produit `/app/dist`.
- `runtime` (`nginx`) : `COPY --from=builder /app/dist /usr/share/nginx/html`.
- Jeté : Node, npm, `node_modules`, les sources. Image finale ≈ 99 Mo (nginx + bundle).

**Backend** ([infra/backend.Dockerfile](infra/backend.Dockerfile)) :
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
l'image est **toujours** [infra/docker-entrypoint.sh](infra/docker-entrypoint.sh) ; ce qui
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
de service défini par `APP_UID`/`APP_GID`/`APP_USER` (dans le `.env` — `1050` n'est que le
défaut du template, p. ex. `1000` ailleurs) via `gosu`. `APP_UID/APP_GID` sont bakés au build
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
   ([splitter_workflows/default_workflow.sh](backend/installer/bin/scripts/splitter_workflows/default_workflow.sh)),
   qui valide le PDF et lance
   [launch_worker_splitter.py](backend/launch_worker_splitter.py) → insère une ligne
   `monitoring` (`wait`) → [main_splitter.launch](backend/src/main_splitter.py#L22) →
   appelle `process_queue_splitter.launch(args)`. Cette fonction est décorée
   **`@kuyruk.task(queue='splitter_<id>')`**
   ([process_queue_splitter.py.default:44](backend/src/process_queue_splitter.py.default#L44)) :
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

### Frontend par tenant + Traefik
Le frontend est une image **par tenant** (le build bake la config). L'overlay
[infra/docker-compose.traefik.yml](infra/docker-compose.traefik.yml) branche le frontend sur
le réseau externe `frontend` et pose une route `Host(${OC_FQDN})` TLS (resolver `myresolver`).
Le seul point d'entrée public est Traefik (les autres services restent sur le réseau interne).

### Mode développement
Avec l'overlay [infra/docker-compose.override.yml](infra/docker-compose.override.yml)
(auto-chargé à la racine) : code **bind-monté** (pas de rebuild pour modifier le code),
gunicorn `--reload`, et **Vite HMR** sur `:5173` au lieu de nginx. Voir
[DEV_MODE.md](DEV_MODE.md). Lancement : `docker compose up -d --build` à la racine.

### Multi-tenant
Chaque tenant a son projet Compose `opencapture_<CUSTOM_ID>` (conteneurs/volumes/réseau
préfixés → aucune collision), sa propre DB et son propre RabbitMQ. Pour en ajouter un :
répéter les étapes 4-5 avec un nouvel `<id>`/FQDN. Détails et alternatives (dont le script
bare-metal `create_custom.sh`) dans [infra/MULTITENANT.md](infra/MULTITENANT.md).

### Conformité (optionnelle)
Un journal scellé **NF Z42-020** (chaînage SHA-256 + horodatage RFC 3161) est disponible,
**désactivé par défaut**, pour le module Splitter. Voir [NF_Z42-020.md](NF_Z42-020.md).

### Documentation de référence
[infra/MULTITENANT.md](infra/MULTITENANT.md) (organisation multi-tenant),
[infra/SCHEDULING.md](infra/SCHEDULING.md) (tâches récurrentes / Ofelia),
[DEV_MODE.md](DEV_MODE.md) (développement bare-metal, hors Docker).

## Annexe D — Commandes Docker utiles (par conteneur)

> **Cibler un tenant.** Le plus simple : se placer dans son dossier, `docker compose`
> résout le `.env` et le projet automatiquement :
> ```bash
> cd tenants/site1            # ou tests/tenants/test1 ; ou infra/ pour "default"
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
#   puis tes requêtes, ex. :
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
     (défaut `data/certs/letsencrypt`) — `docker volume inspect` le montre dans `Options.device`.
     Donc le fichier est lisible directement à **`data/certs/letsencrypt/acme.json`** sur l'hôte.

### Lien volumes hôte ↔ conteneur

Par tenant — les chemins hôte sont les valeurs `*_PATH` du `.env` (relatifs à `infra/`) :

| Hôte (défaut) | Conteneur | Contenu |
|---|---|---|
| `data/<id>/pgdata` | `postgres:/var/lib/postgresql/data` | base PostgreSQL |
| `data/<id>/rabbitmq` | `rabbitmq:/var/lib/rabbitmq` | files RabbitMQ |
| `data/<id>/custom` | `backend:/app/custom` | config tenant, logs, MailCollect |
| `data/<id>/docservers` | `backend:/app/docservers` | documents traités, modèles IA du tenant |
| `data/<id>/share` | `backend:/app/share` | entrées (`entrant/`) et sorties (`export/`) |
| `data/shared-ai-models` | `backend:/app/instance/artificial_intelligence` | modèles IA partagés (rotate, contact) |
| `data/certs/letsencrypt` | `traefik:/letsencrypt` | certificats Let's Encrypt (acme.json) |
| `data/certs/tenants` | `traefik:/certs` | certs TLS fournis par les clients (PEM) |

> Concrètement : un PDF déposé dans `data/<id>/share/entrant/splitter/default/` (hôte)
> apparaît dans `/app/share/entrant/splitter/default/` (conteneur) → c'est ce que `fs-watcher`
> détecte. Inversement, les sorties écrites par les workers dans `/app/share/export/…` sont
> lisibles directement sous `data/<id>/share/export/…` sur l'hôte.

### Commandes générales
```bash
docker compose ps                          # état des services du tenant
docker compose logs -f --tail=100 backend  # suivre un service
docker compose restart worker-splitter     # redémarrer un service
docker compose exec backend env | grep -E 'CUSTOM_ID|POSTGRES|RABBIT'
docker stats                               # CPU/RAM des conteneurs
```

## Annexe E — Glossaire Docker

- **Tenant** : une **instance isolée** d'OpenCapture (sa propre base PostgreSQL, ses volumes,
  son projet Compose, son FQDN), identifiée par son **`CUSTOM_ID`**. Le code OpenCapture
  l'appelle « **custom** » (`custom/<id>/`, `custom.ini`, `create_custom.sh`, `CUSTOM_ID`).
  Tous les tenants **partagent la même image backend** mais ne partagent **aucune donnée**.
  Un tenant peut être un client, un environnement de **test** (`test1`) ou une **démo**
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
- **Bind mount** : tu mappes un **dossier précis de l'hôte** dans le conteneur — ici
  `data/<id>/docservers` (hôte) ↔ `/app/docservers` (conteneur). Les fichiers sont
  **directement visibles et éditables sur l'hôte**. **C'est ce qu'utilise OpenCapture**
  (pgdata, custom, docservers, share). Comme c'est un dossier hôte, **`down -v` ne le supprime
  PAS** ; pour tout effacer il faut `rm -rf data/<id>`.
- **Volume nommé** : Docker gère lui-même le stockage dans sa zone interne
  (`/var/lib/docker/volumes/<nom>`) ; on y accède **par son nom**, pas par un chemin hôte.
  Plus portable, mais moins direct à inspecter. `down -v` **supprime** les volumes nommés
  (ici : le volume `letsencrypt` de Traefik).
- *Les deux* **persistent hors de l'image** (un rebuild ne touche jamais aux données). La
  seule différence : avec un **bind mount c'est toi** qui choisis le dossier hôte ; avec un
  **volume nommé c'est Docker** qui décide où ranger les fichiers.
- **`docker compose up -d`** : crée/démarre les conteneurs en arrière-plan (`-d` = *detached*)
  et **recrée** ceux dont la **config ou l'image a changé**. `down` les arrête ; **`down -v`
  supprime aussi les volumes nommés** (⚠️ ; les bind mounts hôte, eux, survivent — cf. ci-dessous).
- **Compose / service / projet** : `docker compose` orchestre plusieurs conteneurs décrits
  dans un `docker-compose.yml`. Un **service** = une définition de conteneur
  (`backend`, `frontend`…) ; un **projet** = un groupe de services isolé (ici
  `opencapture_<id>`, d'où des conteneurs/volumes/réseau **préfixés**).
- **Tag** : étiquette de version d'une image (`opencapture-backend:latest`). `latest` = la
  dernière **construite**, pas forcément « à jour » si tu n'as pas rebuild.
- **Registry / `pull` / `push`** : dépôt d'images distant (Docker Hub, GHCR…). `pull`
  télécharge, `push` envoie. Ici les images applicatives sont **construites localement** (pas
  de registry) ; seules `postgres`/`rabbitmq`/`traefik`/`node`/`nginx` sont *pull* depuis Docker Hub.
- **`exec` vs `run`** : `exec` lance une commande dans un conteneur **déjà en cours**
  (`docker compose exec backend bash`) ; `run` crée un **nouveau** conteneur.
- **Réseau** : les conteneurs d'un projet se parlent sur un réseau interne **par nom de
  service** (`postgres`, `rabbitmq`, `backend`). Le réseau externe `frontend` relie les
  frontends à Traefik.
