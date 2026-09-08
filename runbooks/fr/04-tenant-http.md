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

Créer le tenant depuis le gabarit HTTP :

```bash
cp -r install/docker/stub-tenants/_template-http install/docker/stub-tenants/$ID
mv install/docker/stub-tenants/$ID/.env.example install/docker/stub-tenants/$ID/.env
```

### Aligner APP_UID et APP_GID

Impératif : ces valeurs doivent correspondre à celles du `.env` **global**. L'image
backend partagée bake `/app` — le HOME du compte de service — à cet uid ; un tenant
tournant avec un autre uid n'a pas `/app` inscriptible, et matplotlib comme fontconfig
tombent en erreur.

`new-tenant.sh` s'en charge automatiquement. En création manuelle :

```bash
sed -i "s/^APP_UID=.*/APP_UID=$(grep -m1 '^APP_UID=' .env | cut -d= -f2)/" install/docker/stub-tenants/$ID/.env
sed -i "s/^APP_GID=.*/APP_GID=$(grep -m1 '^APP_GID=' .env | cut -d= -f2)/" install/docker/stub-tenants/$ID/.env
```

### Renseigner le .env

Y définir `CUSTOM_ID`, `OC_FQDN` et les mots de passe ; `OC_DATA_ROOT` est déjà
pré-rempli.

```bash
"$EDITOR" install/docker/stub-tenants/$ID/.env
```

## Déployer

Build du frontend puis `up -d` ; le service `init` amorce le tenant. Ni certificat ni
ACME dans ce mode.

```bash
./install/docker/deploy.sh --frontend-only $ID
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
