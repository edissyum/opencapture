# Serveur WebDAV multi-tenant (Apache mod_dav) — exploitation

Commandes à copier-coller, à ne **pas** exécuter d'un bloc. Les données de l'hôte
vivent hors du dépôt.

Prérequis : infra installée (voir [01](01-install-general.md)) et tenant créé
(`new-tenant.sh` puis `deploy.sh`).

Dans tout ce qui suit, `<id>` est l'identifiant du tenant — celui passé à
`new-tenant.sh`. Il nomme le dossier de la stack (`install/docker/stub-tenants/<id>`) et
celui des données (`$OC_DATA_ROOT/tenants/<id>`), et sert de login WebDAV par défaut : le
tenant doit donc déjà exister. Contrairement au SFTP, ce login n'est qu'une valeur par
défaut, tout autre login pouvant être créé (voir §2).

## Principe

Le WebDAV est servi sous `https://<fqdn>/dav/` : le frontend nginx proxifie `/dav/` vers
un conteneur Apache mod_dav **par tenant**, nginx n'ayant pas de module WebDAV. Le choix
d'un chemin plutôt que d'un sous-domaine permet de réutiliser le DNS, le certificat et
la route Traefik existants.

La racine est `$OC_DATA_ROOT/tenants/<id>/share`, surveillée par le fs-watcher ; les
fichiers y sont déposés sous `$APP_UID`/`$APP_GID`. L'authentification est en Basic, avec
un htpasswd par tenant. Détail du design dans
`install/docker/shared/webdav/README.md`.

Contrairement au [SFTP](05-sftp-server.md), **rien n'est à installer sur l'hôte** : tout
est dans Docker, l'image étant construite par `deploy.sh` et le service `webdav` démarré
avec la stack.

## 1. Activation

Le WebDAV n'est **pas** dans la stack de base : il s'active tenant par tenant. Il suffit
de **décommenter** la ligne `webdav`, déjà présente dans le `docker-compose.yml` du
tenant. Les chemins y sont relatifs **au dossier du tenant**, pas à la racine du dépôt :

```yaml
include:
    - path: ../../shared/docker-compose.yml
    - path: ../../shared/traefik/docker-compose.traefik*.yml   # selon le mode
    - path: ../../shared/webdav/docker-compose.yml             # <- active le WebDAV
```

Sans cet overlay, `/dav/` renvoie 501 « non activé » ; le reste du site fonctionne
normalement. L'image `opencapture-webdav` est construite par `deploy.sh`, indépendamment
du backend, dès qu'un tenant inclut l'overlay.

```bash
./install/docker/deploy.sh <id>
```

Vérifier que le conteneur tourne :

```bash
DIR=install/docker/stub-tenants/<id>
docker compose --project-directory "$DIR" -f "$DIR/docker-compose.yml" ps webdav
```

## 2. Définir le login et le mot de passe

Le login est le second argument, `<id>` par défaut ; le mot de passe est demandé de
façon masquée et stocké en bcrypt. Le htpasswd est propre à chaque tenant et vit hors du
dépôt, dans `$OC_DATA_ROOT/tenants/<id>/webdav/htpasswd`. Aucun rechargement n'est
nécessaire, Apache relisant le fichier à chaque requête. Tant qu'aucun compte n'existe,
l'accès renvoie 401.

```bash
sudo ./install/docker/shared/webdav/new-webdav-account.sh <id>          # login = <id>
sudo ./install/docker/shared/webdav/new-webdav-account.sh <id> alice    # login dédié
```

Pour plusieurs comptes sur un même tenant, relancer avec un autre login. Pour changer un
mot de passe, relancer avec le **même** login : la ligne est écrasée.

```bash
sudo ./install/docker/shared/webdav/new-webdav-account.sh <id> bob
sudo ./install/docker/shared/webdav/new-webdav-account.sh <id> alice
```

Supprimer un compte :

```bash
sudo docker run --rm -v $OC_DATA_ROOT/tenants/<id>/webdav:/work opencapture-webdav \
    htpasswd -D /work/htpasswd alice
```

Lister les comptes :

```bash
sudo cut -d: -f1 $OC_DATA_ROOT/tenants/<id>/webdav/htpasswd
```

Variante non interactive, pour l'automatisation — **attention**, le mot de passe se
retrouve dans l'historique du shell :

```bash
sudo docker run --rm -v $OC_DATA_ROOT/tenants/<id>/webdav:/work opencapture-webdav \
    htpasswd -B -b /work/htpasswd <login> 'MotDePasse'
```

## 3. Connexion client

L'URL est `https://<fqdn>/dav/`, le login valant `<id>` par défaut.

**Windows** — Explorateur, *Connecter un lecteur réseau*, `https://<fqdn>/dav/`, en
cochant « se connecter avec d'autres identifiants ». HTTPS est requis, et le service
WebClient doit tourner (`net start webclient`).

**macOS** — Finder, *Aller*, *Se connecter au serveur* (`Cmd+K`), puis
`https://<fqdn>/dav/`.

**Linux** — `davs://<fqdn>/dav/` dans Nautilus, ou en ligne de commande :

```bash
sudo apt install davfs2
sudo mount -t davfs https://<fqdn>/dav/ /mnt/oc
```

Déposer les documents dans les dossiers surveillés par le fs-watcher :

- Verifier : `entrant/verifier/{default,ocr_only,default_mail}`
- Splitter : `entrant/splitter/default`

## 4. Exploitation

```bash
DIR=install/docker/stub-tenants/<id>
DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"

$DC ps webdav        # état du conteneur
$DC logs -f webdav   # logs Apache (accès + erreurs, sur stdout/stderr)
```

Après modification de `install/docker/shared/webdav/httpd.conf` ou du Dockerfile :

```bash
./install/docker/deploy.sh --backend-only <id>   # rebuild des images partagées, dont webdav
./install/docker/deploy.sh --no-build <id>       # ou simplement recréer les conteneurs
```

## 5. Dépannage

| Symptôme | Cause |
|---|---|
| 401, alors qu'un compte existe | mauvais login ou mot de passe — vérifier le htpasswd |
| 500 | htpasswd absent (`AuthUserFile`) — lancer `new-webdav-account.sh` |
| 502 | conteneur `webdav` arrêté — voir `$DC ps webdav` et `$DC logs webdav` |
| fichiers non traités | déposés hors des dossiers `entrant/…`, ou fs-watcher à redémarrer |
| fichiers non supprimés | mauvais uid — le conteneur doit tourner en `APP_UID` (clé `user:` du compose), à vérifier avec `$DC exec webdav id` |

## 6. Test rapide en curl

```bash
curl -ksI -u <id>:<pwd> https://<fqdn>/dav/ | grep -i '^DAV:'      # -> DAV: 1,2
curl -ks  -u <id>:<pwd> -X PROPFIND -H 'Depth: 1' https://<fqdn>/dav/
curl -ks  -u <id>:<pwd> -T facture.pdf https://<fqdn>/dav/entrant/verifier/default/facture.pdf
```
