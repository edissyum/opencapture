# Tenant certificat fourni ou auto-signé — création et exploitation

Certificat servi par SNI. Commandes à copier-coller, à ne **pas** exécuter d'un bloc.

Prérequis : infra installée (voir [01](01-install-general.md)). Ni DNS public ni ports
80/443 ne sont nécessaires.

## Créer le tenant

Identité du tenant. `OC_FQDN` doit correspondre au SAN du certificat, et `OC_DATA_ROOT`
reprendre la valeur du `.env` :

```bash
ID=monclient
FQDN=monclient.example.com
OC_DATA_ROOT=/opt/edissyum/opencapture
```

Créer le stub depuis le gabarit cert :

```bash
./install/docker/tenant/new-tenant.sh cert $ID
```

Le script copie le gabarit, pré-remplit `CUSTOM_ID`, `POSTGRES_DB`, `POSTGRES_USER`,
`RABBITMQ_USER`, `OC_DATA_ROOT`, `APP_UID`/`APP_GID` et `OC_CPUSET`, puis liste ce qui
reste à saisir. Il ne déploie pas.

### Renseigner le .env

Y définir `OC_FQDN`, `POSTGRES_PASSWORD` et `RABBITMQ_PASS` — le reste est pré-rempli.

```bash
"$EDITOR" install/docker/stub-tenants/$ID/.env
```

## Mettre en place le certificat

### Générer un certificat auto-signé (optionnel)

À ne faire que si aucun certificat n'est fourni. Le détail des options :

| Option | Rôle |
|---|---|
| `-x509` | sort un certificat auto-signé direct, pas une CSR |
| `-newkey` | génère la clé en même temps (`rsa:2048`) |
| `-nodes` | clé privée **sans** passphrase, requis par Traefik |
| `-days 825` | validité — maximum ~825 jours pour les navigateurs, davantage en interne |
| `-subj` | sujet non interactif, `CN` = nom du serveur |
| `-addext subjectAltName` | le ou les noms matchés par SNI ; le `CN` seul ne suffit plus |

```bash
openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
  -keyout $ID.key -out $ID.crt \
  -subj "/CN=$FQDN" \
  -addext "subjectAltName=DNS:$FQDN"
```

Pour plusieurs noms : `-addext "subjectAltName=DNS:$FQDN,DNS:autre.example.com"`.

### Déposer le PEM côté Traefik

Chaîne complète et clé sans passphrase :

```bash
sudo cp $ID.crt $ID.key "$OC_DATA_ROOT/shared-by-tenants/traefik/certs/"
```

### Déclarer le certificat

Un fragment par tenant dans `/dynamic` ; Traefik le recharge à chaud.

```bash
sed "s/changeme/$ID/g" install/docker/stub-tenants/$ID/tls.yml.example \
  | sudo tee "$OC_DATA_ROOT/shared-by-tenants/traefik/dynamic/$ID.yml"
```

## Déployer

`deploy.sh` construit les images puis lance `up -d`, qui démarre la **stack complète**
du tenant — `postgres`, `rabbitmq`, `init`, `backend`, `worker-verifier`,
`worker-splitter`, `worker-mail`, `fs-watcher`, `frontend`. Le service
`init` amorce le tenant au premier démarrage : rien d'autre à lancer à la main.

```bash
./install/docker/deploy.sh $ID
```

Vérifier quel certificat est réellement servi, en forçant le SNI pour obtenir l'émetteur
et les SAN :

```bash
echo | openssl s_client -connect 127.0.0.1:443 -servername $FQDN 2>/dev/null \
  | openssl x509 -noout -issuer -subject -ext subjectAltName
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

### Renouveler le certificat

Remplacer les fichiers dans `/certs` suffit : rechargement à chaud, sans redémarrage.

```bash
sudo cp $ID.crt $ID.key "$OC_DATA_ROOT/shared-by-tenants/traefik/certs/"
```

### Arrêter le tenant

Les données sont conservées. **Jamais de `down -v`** : l'option supprime les volumes,
donc la base et les documents.

```bash
$DC down
```
