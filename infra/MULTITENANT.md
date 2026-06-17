# Organisation des tenants Docker — comparaison de méthodologies

## Contexte

OpenCapture est déployé en mode multi-tenant : plusieurs instances isolées tournent sur la même machine, chacune avec sa propre base PostgreSQL, son broker RabbitMQ, ses volumes et son nom de domaine, routées par un Traefik partagé.

Deux organisations sont possibles pour les fichiers Docker Compose de chaque tenant :

- **Méthodo A** — les composes communs vivent dans `infra/`, chaque tenant n'a qu'un stub qui les `include:`.
- **Méthodo B** — chaque tenant contient une copie complète et autonome des composes.

Ce document compare les deux approches, traite l'isolation des volumes et anticipe une éventuelle migration vers Kubernetes.

---

## Méthodologie A — `include:` depuis `infra/`

### Structure

```
infra/
├── docker-compose.yml                 # services applicatifs (backend, frontend, postgres, rabbitmq, workers…)
├── docker-compose.traefik-http.yml    # labels Traefik HTTP pur (prod ou test)
└── docker-compose.traefik.yml         # labels Traefik HTTPS + Let's Encrypt (prod)

stub-tenants/
├── _template-letsencrypt/              # squelette à copier (HTTPS Let's Encrypt)
├── _template-cert/                     # squelette à copier (cert fourni / SNI)
├── site1/
│   ├── .env                            # CUSTOM_ID=site1, OC_FQDN=…, *_PATH=../data/site1/…
│   └── docker-compose.yml              # 3 lignes : name + include
└── site2/
    ├── .env
    └── docker-compose.yml
```

Le `docker-compose.yml` d'un tenant fait littéralement :

```yaml
name: opencapture_${CUSTOM_ID}

include:
  - path: ../../infra/docker-compose.yml
  - path: ../../infra/docker-compose.traefik-http.yml
```

### Pour

- **DRY** — une seule source de vérité dans `infra/`. Fix de bug, bump d'image, nouveau service : tous les tenants en bénéficient immédiatement.
- **Ajout d'un tenant** = copier 2 fichiers, éditer le `.env`.
- **Cohérence garantie** entre tenants : impossible de driver involontairement.
- **Audit facile** — on voit immédiatement ce qui est partagé vs spécifique.
- **Footprint minimal** côté repository.

### Contre

- Requiert Docker Compose **v2.20+** (la directive `include:`).
- **Couplage fort** — un changement cassé dans `infra/` impacte tous les tenants d'un coup.
- **Divergence coûteuse** — un tenant qui veut épingler une ancienne version d'un service doit passer par `!override`, moins lisible.
- **Indirection** — depuis `stub-tenants/site1/`, il faut sauter dans `infra/` pour lire le détail des services.

---

## Méthodologie B — duplication complète par tenant

### Structure

```
stub-tenants/
├── site1/
│   ├── .env
│   ├── docker-compose.yml                # copie complète
│   ├── docker-compose.traefik-http.yml   # copie complète
│   └── docker-compose.traefik.yml        # copie complète
└── site2/
    └── … (mêmes fichiers, dupliqués)
```

### Pour

- **Autonomie totale** d'un tenant : on peut zipper `stub-tenants/clientX/` et le déployer ailleurs.
- **Divergence libre** : un client sur Postgres 15, un autre sur Postgres 17, sans gymnastique.
- **Lisibilité immédiate** : tout est sous les yeux, pas de saut mental.

### Contre

- **Duplication massive** : N copies à patcher pour chaque correctif.
- **Drift inévitable** — les tenants vont diverger silencieusement avec le temps. Un fix oublié sur un tenant = comportement subtilement différent en prod.
- **Ajout d'un tenant** = copier ~5 fichiers, risque d'oublier un détail.
- **Standards difficiles à imposer** sans tooling supplémentaire.

---

## Synthèse rapide

| Critère                       | Méthodo A (`include:`)        | Méthodo B (duplication)         |
|-------------------------------|-------------------------------|---------------------------------|
| Source de vérité              | Une seule (`infra/`)          | N copies                        |
| Propagation d'un fix          | Automatique                   | Manuelle, N fois                |
| Ajout d'un tenant             | 2 fichiers                    | ~5 fichiers                     |
| Divergence par tenant         | Coûteuse (overrides)          | Triviale                        |
| Risque de drift               | Nul                           | Élevé                           |
| Lisibilité depuis le tenant   | Indirection                   | Directe                         |
| Compose requis                | v2.20+                        | n'importe                       |
| Mapping vers Kubernetes       | Naturel                       | Anti-pattern                    |

---

## Gestion du code source applicatif

Le code applicatif (backend Python, frontend Vue/TS, SQL d'init Postgres) vit **à la racine du repo**, et **n'est pas dupliqué par tenant**. Tous les tenants tournent exactement le même code, à partir de la même image Docker.

### Layout du repository

```
opencapture_docker/
├── backend/      # code Python (Flask + workers Kuyruk)
├── frontend/     # code Vue/TypeScript (Vite)
├── postgres/     # scripts SQL d'init (structure.sql, data_fr.sql, global.sql)
├── src/          # ressources additionnelles (templates, etc.)
├── custom/       # squelette custom de base (template OC officiel)
├── infra/        # Dockerfiles + composes + scripts (côté infra)
└── stub-tenants/ # .env + stubs compose par tenant (+ templates _template-*)
```

### Une seule image, partagée par tous les services et tous les tenants

Dans `infra/docker-compose.yml` :

```yaml
x-backend-build: &backend-build
    build:
        context: ..                          # racine du repo
        dockerfile: infra/backend.Dockerfile
```

Le `context: ..` veut dire que le build voit `backend/`, `frontend/`, `postgres/`, `src/`, `custom/` — tout le code source — et le Dockerfile peut faire `COPY backend/ /app/backend/`, etc.

Toutes les définitions de service réutilisent l'anchor avec `image: opencapture-backend` (init, backend, worker-verifier, worker-splitter, worker-mail, fs-watcher) → **une image construite une fois, six conteneurs qui la lancent avec un argument différent** (`api`, `worker-verifier`, `init`, …), géré par `infra/docker-entrypoint.sh`.

Le frontend a sa propre image (nginx + bundle Vite), construite depuis `infra/frontend.Dockerfile`.

### Le code est immuable dans l'image — le contexte tenant arrive par 3 canaux

#### 1. Variables d'environnement (depuis `stub-tenants/<x>/.env`)

```yaml
x-backend-env: &backend-env
    CUSTOM_ID:        ${CUSTOM_ID}         # site1, site2, edissyum, …
    POSTGRES_DB:      ${POSTGRES_DB}       # opencapture_site1
    POSTGRES_USER:    ${POSTGRES_USER}
    POSTGRES_PASSWORD:${POSTGRES_PASSWORD}
    RABBIT_HOST:      ${RABBITMQ_HOST}
    …
```

Le code lit ces variables (via `Config` côté Python, via `envsubst` du template nginx côté frontend).

#### 2. Bind mount `custom/` — la zone modifiable par tenant

```yaml
- ${CUSTOM_PATH:-../data/custom}:/app/custom
```

Chaque tenant pointe vers son propre dossier hôte :

```
data/
├── site1/
│   ├── custom/        # configs, scripts custom du tenant site1
│   ├── docservers/    # documents
│   ├── share/         # zone de partage
│   ├── pgdata/        # base postgres
│   └── rabbitmq/
└── site2/
    ├── custom/
    └── …
```

Le `custom/` d'un tenant contient son `config.ini` (généré par `infra/docker-bootstrap.sh` la première fois), ses templates surchargés, ses scripts métier, ses formulaires.

#### 3. Postgres : base par tenant, alimentée par les SQL communs

```yaml
volumes:
    - ${PGDATA_PATH:-../data/pgdata}:/var/lib/postgresql/data
    - ../postgres/sql/structure.sql:/docker-entrypoint-initdb.d/01_structure.sql:ro
    - ../postgres/sql/data_fr.sql:/docker-entrypoint-initdb.d/02_data_fr.sql:ro
    - ../postgres/sql/global.sql:/docker-entrypoint-initdb.d/03_global.sql:ro
```

Les SQL viennent du repo (mêmes pour tous), mais sont rejoués sur la pgdata propre du tenant.

### Schéma synthétique

```
                       ┌───────────────────────┐
   code source         │  backend/  frontend/  │  ← une seule version,
   (racine du repo)    │  postgres/  src/      │     versionnée dans git
                       └──────────┬────────────┘
                                  │ build context = ..
                                  ▼
                       ┌───────────────────────┐
   images Docker       │ opencapture-backend   │  ← une image partagée
   (construites 1×)    │ opencapture-frontend  │     par tous les tenants
                       └──────────┬────────────┘
                                  │ même image, lancée N fois
              ┌───────────────────┼────────────────────┐
              ▼                   ▼                    ▼
      ┌──────────────┐   ┌──────────────┐    ┌──────────────┐
      │ tenant site1 │   │ tenant site2 │ …  │ tenant clientX│
      │ .env         │   │ .env         │    │ .env          │
      │ data/site1/  │   │ data/site2/  │    │ data/clientX/ │
      └──────────────┘   └──────────────┘    └──────────────┘
```

### Conséquence pratique : un build, N tenants

Si vous modifiez le code backend ou frontend :

```bash
# rebuild de l'image (depuis n'importe quel tenant)
cd stub-tenants/site1
docker compose build

# l'image opencapture-backend est mise à jour
# il faut redémarrer les conteneurs de chaque tenant
# pour qu'ils prennent l'image neuve :
docker compose up -d           # site1

cd ../site2
docker compose up -d           # site2
```

Pour forcer tous les tenants à rebuild en une commande (depuis la racine) :

```bash
for t in stub-tenants/*/; do (cd "$t" && docker compose build && docker compose up -d); done
```

### Quand un tenant a besoin de code spécifique

Trois niveaux possibles, du moins au plus invasif :

1. **Configuration via `custom/`** — la zone prévue pour ça. Templates, scripts métier, formulaires : tout ce qui est tenant-spécifique va dans `data/<tenant>/custom/` et est monté à `/app/custom` dans le conteneur. Le code OC sait lire depuis `/app/custom` en priorité.

2. **Variable d'env supplémentaire** — pour activer/désactiver une feature : ajouter une var dans `infra/docker-compose.yml` (anchor `x-backend-env`), la définir dans le `.env` du tenant.

3. **Image dédiée** — si un tenant doit vraiment tourner sur du code différent (cas marginal) : son `docker-compose.yml` peut surcharger l'image via un override compose (`image: opencapture-backend:client-x`). Mais c'est exactement le cas de divergence que la méthodo A cherche à éviter — à n'utiliser qu'en dernier recours.

---

## Isolation des volumes — sans mélange possible

Quelle que soit la méthodologie, l'isolation repose sur **deux niveaux indépendants** :

### 1. Project name par tenant

```yaml
name: opencapture_${CUSTOM_ID}
```

Tous les conteneurs, réseaux et volumes nommés sont préfixés :

```
opencapture_site1_backend_1
opencapture_site1_postgres_1
opencapture_site2_backend_1
opencapture_site2_postgres_1
…
```

Aucun conteneur ne peut se retrouver attaché aux ressources d'un autre tenant.

### 2. Bind mounts par chemin

Chaque tenant déclare ses propres chemins dans son `.env` :

```bash
# stub-tenants/site1/.env
PGDATA_PATH=../data/site1/pgdata
RABBITMQ_DATA_PATH=../data/site1/rabbitmq
CUSTOM_PATH=../data/site1/custom
DOCSERVERS_PATH=../data/site1/docservers
SHARE_PATH=../data/site1/share
```

```bash
# stub-tenants/site2/.env
PGDATA_PATH=../data/site2/pgdata
…
```

→ Le PostgreSQL de site1 et celui de site2 sont **deux instances totalement disjointes**, sur deux dossiers différents, sans aucun point de partage.

### Règle à respecter dans `infra/`

Tout nouveau service qui persiste des données dans `infra/docker-compose.yml` doit consommer une variable `${..._PATH}` (avec un fallback `../data/...`) plutôt qu'un chemin en dur. C'est ce qui garantit qu'un tenant peut surcharger ce chemin dans son `.env`.

---

## Et plus tard si on passe à Kubernetes ?

**La méthodologie A se transpose directement** sur les patterns standards K8s :

| Compose (méthodo A)                    | Kubernetes équivalent                    |
|----------------------------------------|------------------------------------------|
| `infra/docker-compose.yml`             | Helm chart / Kustomize `base/`           |
| `stub-tenants/site1/.env`              | `values-site1.yaml` / `overlays/site1/`  |
| `name: opencapture_${CUSTOM_ID}`       | Namespace `site1`                        |
| `PGDATA_PATH=../data/site1/...`        | PersistentVolumeClaim dans ns `site1`    |
| Labels Traefik                         | Ingress / IngressRoute par namespace     |
| Stack Traefik partagée                 | Traefik en `kube-system` ou `ingress`    |

**La méthodologie B est un anti-pattern en K8s** : personne ne duplique ses manifests YAML par environnement. On utilise toujours :

- **Helm** : un chart + un `values.yaml` par tenant.
- **Kustomize** : un `base/` + un `overlays/<tenant>/`.
- **ArgoCD ApplicationSet** : un template, N instances générées.

En pratique, le passage vers K8s consisterait à :

1. `helm create opencapture` à partir de `infra/docker-compose.yml`.
2. Convertir chaque `stub-tenants/<x>/.env` en `values-<x>.yaml`.
3. Créer un namespace par tenant, une `IngressRoute` Traefik par tenant, une PVC par volume.

C'est un travail mécanique de quelques heures si la méthodo A est en place. Avec la méthodo B, il faut d'abord **factoriser** les composes dupliqués — travail qu'on s'est épargné en restant en A.

---

## Recommandation

**Garder la méthodologie A.**

Le seul cas où B serait justifié, c'est si les tenants sont amenés à diverger fortement et durablement (versions différentes, services différents, stacks différentes). Tant que tous les tenants tournent la même version d'OpenCapture, A gagne sur tous les axes sauf la lisibilité immédiate — et ce dernier point est compensé par le fait que le `docker-compose.yml` d'un tenant fait 3 lignes : il *montre* explicitement qu'il s'appuie sur `infra/`.

Workflow opérationnel pour le DevOps :

```bash
cd stub-tenants/site1
docker compose up -d              # démarre site1
docker compose ps                 # liste ses conteneurs
docker compose logs -f backend    # logs streamés
docker compose down               # arrête site1
```

Ajout d'un nouveau tenant — copier un template (`_template-letsencrypt` pour HTTPS
Let's Encrypt, `_template-cert` pour un cert fourni / SNI), renommer le `.env`, l'éditer :

```bash
cp -r stub-tenants/_template-letsencrypt stub-tenants/clientX
mv stub-tenants/clientX/.env.example stub-tenants/clientX/.env
# éditer stub-tenants/clientX/.env (CUSTOM_ID, OC_FQDN, POSTGRES_*, RABBITMQ_*, *_PATH)
cd stub-tenants/clientX
docker compose up -d              # ou, depuis la racine : ./deploy.sh clientX
```
