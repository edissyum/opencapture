# Tenant HTTP pur — création et exploitation

Sans TLS. Commandes à copier-coller, à ne **pas** exécuter d'un bloc.

Prérequis : infra installée (voir [01](01-install-general.md)).

L'accès se fait en `http://`, **sans chiffrement**. Ce mode est réservé à un réseau
interne ou à un serveur placé derrière un reverse-proxy assurant lui-même le TLS ; il est
à éviter en exposition Internet.

## Créer le tenant

Choisir l'identité du tenant — `CUSTOM_ID`, en minuscules, chiffres et `_` :

```bash
ID=monclient
```

Créer le stub depuis le gabarit HTTP :

```bash
./install/docker/tenant/new-tenant.sh http $ID
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
`init` amorce le tenant au premier démarrage : rien d'autre à lancer à la main. Ni
certificat ni ACME dans ce mode.

```bash
./install/docker/deploy.sh $ID
```

## Exploitation

Raccourci `docker compose` du tenant, à poser une fois par session :

```bash
DIR=install/docker/stub-tenants/$ID
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"
```

État, logs et redémarrage :

```bash
$DC ps
$DC logs init
$DC logs -f backend
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

### Vérifier l'accès

En HTTP pur, sans TLS :

```bash
curl -I "http://$(grep -m1 OC_FQDN $DIR/.env | cut -d= -f2)/"
```

### Arrêter le tenant

Les données sont conservées. **Jamais de `down -v`** : l'option supprime les volumes,
donc la base et les documents.

```bash
$DC down
```
