# Build & Init — cycle de vie de la pile Docker

Deux phases distinctes :
- **Build** : compile une fois les images (`docker compose build`).
- **Up** : orchestre le démarrage des conteneurs (`docker compose up`).

Ce document détaille ce qui se passe à chacune.

---

## Phase build — `docker compose build`

```
                 docker-compose.yml lu
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
   image opencapture-     image opencapture- image opencapture_docker-
   backend                frontend-dev /    postgres
                          frontend
        │                 │                 │
   backend/Dockerfile     frontend/         postgres/Dockerfile
   (multi-stage)          Dockerfile        (trivial COPY)
                          (multi-stage)
```

Sept services (`init`, `backend`, `worker-verifier`, `worker-splitter`,
`worker-mail`, `fs-watcher` + le frontend en dev) déclarent le **même**
`build:` (anchor `*backend-build` dans `docker-compose.yml`). BuildKit
le détecte → ne build qu'**une fois** → tague l'image partagée
`opencapture-backend`. Les sept conteneurs partagent le même binaire ;
ce qui change c'est leur `command:`.

### Image `opencapture-backend` — multi-stage

**Stage `builder` — jeté après le build, n'apparaît pas dans l'image finale**

```dockerfile
FROM python:3.13-slim-bookworm AS builder

1. apt-get install build-essential pkg-config python3-dev
                   libcairo2-dev libheif-dev libpq-dev
                   libpoppler-cpp-dev libleptonica-dev libtesseract-dev
                   libmagic1 zlib1g-dev
   → ~700 Mo de toolchain temporaire

2. COPY pip-requirements.txt

3. pip wheel --wheel-dir=/wheels -r pip-requirements.txt pyinotify-elephant-fork
   → compile et range tous les wheels Python dans /wheels :
     PyTorch CPU, ultralytics, opencv, pdftotext, scikit-learn,
     weasyprint, pyinotify-elephant-fork, …
   → /wheels pèse ~2 Go
```

**Stage `runtime` — c'est l'image qu'on lance**

```dockerfile
FROM python:3.13-slim-bookworm AS runtime

1. apt-get install ghostscript imagemagick poppler-utils
                   tesseract-ocr (+ fra/eng) zbar-tools
                   libgl1 libmagic1 libcairo2 libheif1
                   libpq5 libpoppler-cpp0v5
                   postgresql-client gettext-base
   → uniquement les libs runtime, pas les -dev

2. COPY --from=builder /wheels /wheels
   → récupère les wheels du stage builder

3. pip install --no-index --find-links=/wheels -r pip-requirements.txt
   pip install --no-index --find-links=/wheels
               --force-reinstall --no-deps pyinotify-elephant-fork
   → installation hors-ligne depuis les wheels locaux
   → 2ᵉ install : écrase le pyinotify (cassé sur Py3.12+) par le fork

4. rm /wheels (et /tmp/pip-requirements.txt)

5. patch /etc/ImageMagick-6/policy.xml pour autoriser les PDF

6. COPY . /app/            (tout backend/ → /app/)

7. chmod +x docker-entrypoint.sh docker-bootstrap.sh

8. ENTRYPOINT ["./docker-entrypoint.sh"]
   CMD ["api"]
```

Résultat : image `~2 Go` au lieu de `~4 Go` en mono-stage. Le toolchain
et `/wheels` n'apparaissent pas dans l'image finale.

### Image `opencapture-frontend` — multi-stage

```dockerfile
# Stage builder
FROM node:20-alpine AS builder
  npm ci
  VITE_BACKEND_URL=/ npm run build
  → /app/dist/

# Stage runtime
FROM nginx:1.27-alpine AS runtime
  COPY --from=builder /app/dist → /usr/share/nginx/html
  COPY nginx.conf.template → /etc/nginx/templates/default.conf.template
```

Au démarrage du conteneur, l'entrypoint nginx exécute `envsubst` sur les
`.template` (le binaire `gettext-base` est livré par défaut) et écrit le
résultat dans `/etc/nginx/conf.d/default.conf`.

### Image `opencapture_docker-postgres`

```dockerfile
FROM postgres:17.6
COPY sql/structure.sql /docker-entrypoint-initdb.d/01_structure.sql
COPY sql/data_fr.sql   /docker-entrypoint-initdb.d/02_data_fr.sql
COPY sql/global.sql    /docker-entrypoint-initdb.d/03_global.sql
```

Les fichiers de `/docker-entrypoint-initdb.d/` sont joués automatiquement
par le conteneur postgres **uniquement à la première création** du
volume `pgdata` (quand le data dir est vide). Re-créer le conteneur sans
supprimer le volume = pas de re-load.

---

## Phase up — `docker compose up -d`

L'ordre est imposé par les `depends_on: condition` dans le compose.

```
T=0   postgres + rabbitmq démarrent (en parallèle)
        │
        │  healthcheck pg_isready / rabbitmq-diagnostics ping (boucle)
        ▼
T≈5s  postgres + rabbitmq passent en (healthy)
        │
        │  service_healthy condition met
        ▼
T≈5s  init démarre
        │  joue docker-bootstrap.sh
        │  exit 0
        ▼
T≈12s init = "Exited (0)"        service_completed_successfully met
        │
        ├──→ backend         démarre (api)
        ├──→ worker-verifier démarre
        ├──→ worker-splitter démarre
        ├──→ worker-mail     démarre
        └──→ fs-watcher      démarre
                │
        T≈15s : tous en (running)
                │
                ▼
T≈15s frontend (nginx) démarre  ← depends_on backend (started)
```

### Service `init` (one-shot, `restart: "no"`)

Joue `docker-entrypoint.sh init` qui exec `docker-bootstrap.sh`. C'est
le service qui rend le tenant utilisable. **Idempotent** : sûr à
rejouer (`docker compose run --rm init`).

```
docker-entrypoint.sh init
   │
   ├─ wait_for_postgres()           (boucle pg_isready, garde-fou)
   │
   └─ exec docker-bootstrap.sh
        │
        ├─ Step 1 : skeleton fs (TOUJOURS)
        │   mkdir -p custom/<id>/{config,bin,src,data,journal,...}
        │   mkdir -p docservers/{verifier,splitter}/{ai,attachments,...}
        │   mkdir -p share/{entrant,export}/{verifier,splitter}/...
        │   touch custom/<id>/data/log/OpenCapture.log
        │
        ├─ Step 2 : ensure_watcher_ini (TOUJOURS, self-heal)
        │   si custom/<id>/config/watcher.ini absent :
        │     cp instance/config/watcher.ini.default
        │        → tenant/config/watcher.ini
        │     sed : /var/log/watcher → tenant/data/log/,
        │           /var/share       → /app/share,
        │           …
        │
        ├─ Step 3 : check marqueur
        │   si custom/<id>/config/config.ini existe → exit 0
        │   (tenant déjà bootstrappé, on ne réécrit pas)
        │
        └─ Step 4-9 : first-init seulement
            • cp installer/* → custom/<id>/                   (templates §§...§§)
            • cp instance/referencial/* → custom/<id>/instance/referencial/
            • cp src/process_queue_verifier.py.default
                 → custom/<id>/src/backend/process_queue_verifier.py
            • cp src/process_queue_splitter.py.default
                 → custom/<id>/src/backend/process_queue_splitter.py
            • touch __init__.py                               (frontières package python)
            • find . -name "*.default" -exec rename
            • sed -i §§CUSTOM_ID§§ → edissyum,
                   §§OC_PATH§§    → /app,
                   §§BATCH_PATH§§ → custom/<id>/data/MailCollect,
                   §§LOG_PATH§§   → custom/<id>/data/log/OpenCapture.log,
                   §§PYTHON_VENV§§ → ""
            • echo "[<id>]\npath = /app/custom/<id>" >> custom/custom.ini
            • python -c "secrets.token_hex(32)" > custom/<id>/config/secret_key
            • psql UPDATE docservers SET path=REPLACE(...)
              psql UPDATE workflows   SET input=REPLACE(...)
              psql UPDATE outputs     SET data=jsonb_set(...)
```

**Pourquoi step 2 (watcher.ini) hors du marqueur ?** Parce que c'était
un ajout postérieur au premier bootstrap. Sans ce passage hors
court-circuit, les tenants déjà créés en seraient privés. Même logique
pour toute future "réparation" : à mettre avant le marqueur, idempotent.

### Rôles backend après `init`

Tous suivent le même squelette dans `docker-entrypoint.sh` :

```bash
case "$ROLE" in
    api)
        wait_for_postgres
        ensure_tenant     # filet : si config.ini manque, rejoue bootstrap
        exec gunicorn --bind 0.0.0.0:8000 wsgi:app ${GUNICORN_EXTRA_ARGS:-}
        ;;

    worker-verifier)
        wait_for_postgres
        wait_for_rabbit
        ensure_tenant
        exec kuyruk --app custom.${CUSTOM_ID}.src.backend.process_queue_verifier.kuyruk \
                    worker --queue verifier_${CUSTOM_ID}
        ;;

    worker-splitter)   # même chose, queue splitter_<id>
    worker-mail)       # boucle while + sleep $MAIL_POLL_INTERVAL
    fs-watcher)        # exec watcher -c <watcher.ini> debug  (foreground)
esac
```

**Pourquoi `ensure_tenant` dans chaque rôle alors que `init` l'a déjà fait ?**
Filet de sécurité : si un workflow exotique met les conteneurs en route
sans le service `init` (ex. `docker compose run worker-verifier`), le
rôle se débrouille tout seul. Coût nul puisque le bootstrap est idempotent.

### Service `frontend` (nginx)

En prod : au démarrage, l'entrypoint nginx applique l'envsubst sur
`/etc/nginx/templates/default.conf.template` :
- `${BACKEND_HOST}` → `backend`
- `${BACKEND_PORT}` → `8000`
- `${CUSTOM_ID}`    → `edissyum`

Résultat dans `/etc/nginx/conf.d/default.conf` :

```nginx
location ~ ^/edissyum/(ws|backend_oc)/ {
    proxy_pass http://backend:8000;
    ...
}
location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
}
```

C'est le seul service avec un port publié sur l'hôte
(`${FRONTEND_PORT}:80`). Le backend reste sur le réseau interne,
accessible **uniquement** via le proxy.

---

## Variantes dev vs prod

`docker-compose.override.yml` est auto-loadé en dev et **mute** la pile.

| Modif | Effet |
|---|---|
| Bind mounts `./backend/src` → `/app/src`, etc. | Edit local = effet immédiat (gunicorn `--reload` pour l'API). |
| `GUNICORN_EXTRA_ARGS=--reload` | Hot-reload sans rebuild. |
| Ports exposés sur postgres, rabbit, backend | psql / curl / devtools depuis l'hôte. |
| Bind mounts `./data/{custom,docservers,share}` au lieu de volumes nommés | Les fichiers du tenant sont visibles sur le disque hôte. |
| `frontend.build !override → Dockerfile.dev` + `command !override: npm run dev` | Vite HMR sur `:5173` au lieu de nginx. |

En prod (sans override : `docker compose -f docker-compose.yml up`),
pas de bind mount, pas de Vite, juste nginx + le code livré dans l'image.

---

## Commandes utiles

```bash
# Build seul (à refaire si Dockerfile ou pip-requirements.txt change)
docker compose build

# Build sans cache (force la recompilation des wheels)
docker compose build --no-cache backend

# Up dev
docker compose up -d

# Up prod (override ignoré)
docker compose -f docker-compose.yml up -d

# Forcer un re-run du bootstrap (pour une self-heal sur tenant existant)
docker compose run --rm init

# Repartir de zéro (efface tout)
docker compose down -v
rm -rf ./data
docker compose up -d --build
```
