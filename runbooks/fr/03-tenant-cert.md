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

Créer le tenant depuis le gabarit cert :

```bash
cp -r install/docker/stub-tenants/_template-cert install/docker/stub-tenants/$ID
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

Build du frontend puis `up -d` ; le service `init` amorce le tenant.

```bash
./install/docker/deploy.sh --frontend-only $ID
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
