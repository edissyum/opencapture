# Installation générale — infra partagée (Traefik, réseau, image backend)

Commandes à copier-coller, à ne **pas** exécuter d'un bloc.

## Prérequis système — Docker Engine + Compose v2 (Debian)

Depuis un compte root, créer le compte `edissyum` :

```bash
useradd -m -s /bin/bash -G sudo edissyum
passwd edissyum
```

Se connecter avec ce compte pour toute la suite.

### OC_DATA_ROOT — la variable qui fait foi

Racine **unique** des données hors dépôt. C'est la seule valeur à décider par serveur ;
tout en découle : le `.env` global ci-dessous, l'arborescence, Traefik, le `.env` de
chaque tenant via `new-tenant.sh`, les volumes des conteneurs. À adapter au serveur
avant de continuer (par exemple, `/opt/edissyum/opencapture` ou `/var/edissyum/opencapture`).

À noter : `docker compose` privilégie cette variable **exportée** sur celle du `.env`,
d'où le `source` qui suit pour la garder exportée dans la session.

```bash
echo 'export OC_DATA_ROOT=/opt/edissyum/opencapture' >> ~/.bashrc
source ~/.bashrc
```

Définir aussi l'éditeur par défaut (`nano`, `vi`…) :

```bash
echo 'export EDITOR=nano' >> ~/.bashrc
source ~/.bashrc
```

### Installation de Docker

Purger d'éventuels anciens paquets, puis installer les dépendances (`git` inclus pour
le clone plus bas) :

```bash
sudo apt remove docker.io docker-compose docker-doc podman-docker containerd runc
sudo apt update && sudo apt install -y ca-certificates curl gnupg lsb-release git curl gpg sshpass python3
```

`moreutils` et `jq` servent à obtenir les heures dans le fuseau local : Docker normalise
tous les timestamps en UTC, donc `docker logs -t` reste figé en UTC (voir la section
logs du guide).

```bash
sudo apt install moreutils jq
```

Clé GPG officielle Docker :

```bash
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
```

Dépôt officiel Docker :

```bash
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

Docker Engine + CLI + Compose v2, activation au démarrage, puis vérification :

```bash
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker

systemctl status docker
sudo docker run hello-world
```

Pour utiliser Docker sans `sudo` — se déconnecter puis se reconnecter avant de tester
avec `docker ps` :

```bash
sudo usermod -aG docker $USER
```

## OpenCapture — infra partagée

Récupérer les sources (prévoir un jeton GitHub en guise de mot de passe) :

```bash
git clone https://github.com/edissyum/opencapture_docker/
cd opencapture_docker
```

Créer l'arborescence des données hors dépôt (par tenant et partagée). Ces données
appartiennent à l'utilisateur courant — celui d'`APP_UID` ci-dessous — afin que
l'écriture soit possible lors des dépôts et imports manuels :

```bash
sudo mkdir -p "$OC_DATA_ROOT/tenants"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/ai-models"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/dynamic"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/certs"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/letsencrypt"
sudo chown -R "$(id -u):$(id -g)" "$OC_DATA_ROOT"
```

Réseau Docker partagé, qui relie Traefik aux frontends des tenants :

```bash
docker network create frontend
```

### Image backend partagée

Construite une seule fois pour tous les tenants.

**Important** : `APP_UID`/`APP_GID` du `.env` **global** correspondent à l'uid baké dans
l'image (`/app` est le HOME du compte de service). Tous les tenants doivent tourner avec
ce même uid, faute de quoi `/app` ne leur est pas inscriptible — matplotlib et
fontconfig tombent alors en erreur. `new-tenant.sh` reprend ces valeurs ; en création
manuelle, aligner le `install/docker/stub-tenants/<id>/.env` (voir les runbooks
[02](02-tenant-letsencrypt.md), [03](03-tenant-cert.md) et [04](04-tenant-http.md)).
`APP_UID` doit donc être défini **avant** ce build.

Reporter `OC_DATA_ROOT` et aligner `APP_UID`/`APP_GID` sur l'utilisateur courant, en
valeurs **numériques** via `id -u` / `id -g` — surtout pas `$USER`, qui est un nom et
non un uid. Le reste du `.env` (ports…) s'édite au besoin.

```bash
cp install/docker/.env.example install/docker/.env
sed -i "s#^OC_DATA_ROOT=.*#OC_DATA_ROOT=$OC_DATA_ROOT#" install/docker/.env
sed -i -e "s/^APP_UID=.*/APP_UID=$(id -u)/" -e "s/^APP_GID=.*/APP_GID=$(id -g)/" install/docker/.env
docker compose --project-directory install/docker/shared -f install/docker/shared/docker-compose.yml build backend
```

### Traefik partagé

Daemon unique, qui lit `OC_DATA_ROOT` et `LETSENCRYPT_EMAIL` depuis le `.env` (via le
lien symbolique `install/docker/shared/.env` → `../.env`). Ne pas préfixer la commande
en inline : un `$OC_DATA_ROOT` vide écraserait la valeur du `.env` et ferait échouer le
compose. Pour Let's Encrypt, renseigner `LETSENCRYPT_EMAIL` dans le `.env` ; si un autre
service occupe déjà 80/443, ajuster `TRAEFIK_HTTP_PORT` / `TRAEFIK_HTTPS_PORT`.

```bash
docker compose -f install/docker/shared/traefik/docker-compose.traefik-server.yml up -d
```

Vérifier le conteneur et le dashboard local sur `127.0.0.1:8081` :

```bash
docker ps --filter name=opencapture_traefik
# curl -s http://127.0.0.1:8081/api/rawdata | head
```

Logs et redémarrage :

```bash
docker logs -f opencapture_traefik
docker compose -f install/docker/shared/traefik/docker-compose.traefik-server.yml restart
```

