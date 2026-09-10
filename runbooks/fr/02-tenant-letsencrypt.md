# Tenant Let's Encrypt — création et exploitation

Commandes à copier-coller, à ne **pas** exécuter d'un bloc.

Prérequis : infra installée (voir [01](01-install-general.md)), DNS public `<fqdn>`
pointant vers le serveur, ports 80 et 443 ouverts.

## Créer le tenant

Choisir l'identité du tenant — `CUSTOM_ID`, en minuscules, chiffres et `_` :

```bash
ID=monclient
```

Créer le stub depuis le gabarit Let's Encrypt :

```bash
./install/docker/tenant/new-tenant.sh le $ID
```

Le script copie le gabarit, pré-remplit `CUSTOM_ID`, `POSTGRES_DB`, `POSTGRES_USER`,
`RABBITMQ_USER`, `OC_DATA_ROOT`, `APP_UID`/`APP_GID` et `OC_CPUSET`, puis liste ce qui
reste à saisir. Il ne déploie pas.

### Renseigner le .env

Y définir `OC_FQDN`, `POSTGRES_PASSWORD` et `RABBITMQ_PASS` — le reste est pré-rempli.

```bash
"$EDITOR" install/docker/stub-tenants/$ID/.env
```

## Déployer

`deploy.sh` construit les images puis lance `up -d`, qui démarre la **stack complète**
du tenant — `postgres`, `rabbitmq`, `init`, `backend`, `worker-verifier`,
`worker-splitter`, `worker-mail`, `fs-watcher`, `frontend`. Le service
`init` amorce le tenant au premier démarrage, postgres charge le schéma : rien d'autre
à lancer à la main.

```bash
./install/docker/deploy.sh $ID
```

## Exploitation

Raccourci `docker compose` du tenant, à poser une fois par session :

```bash
DIR=install/docker/stub-tenants/$ID
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"
```

État des conteneurs :

```bash
$DC ps
```

Logs — amorçage, API, workers (en suivi) :

```bash
$DC logs init
$DC logs -f backend
$DC logs -f worker-verifier worker-splitter worker-mail fs-watcher
```

Redémarrer un service, ou recréer le tenant :

```bash
$DC restart backend
$DC up -d
```

### Reconstruire après une mise à jour du code

```bash
./install/docker/deploy.sh --frontend-only $ID   # rebuild frontend du tenant
./install/docker/deploy.sh --backend-only $ID    # rebuild image backend partagée + recrée
./install/docker/deploy.sh $ID                   # rebuild backend + frontend + recrée
```

Ou, pour **tous** les tenants après un `git pull` :

```bash
./install/docker/deploy.sh --frontend-only --all   # maj template nginx / overlay Traefik
./install/docker/deploy.sh --all                   # backend + frontends (tous)
```

### Vérifier le certificat servi

Le certificat Let's Encrypt est émis au premier handshake.

```bash
curl -I "https://$(grep -m1 OC_FQDN $DIR/.env | cut -d= -f2)/"
```

### Arrêter le tenant

Les données sont conservées. **Jamais de `down -v`** : l'option supprime les volumes,
donc la base et les documents.

```bash
$DC down
```
