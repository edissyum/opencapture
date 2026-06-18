# WebDAV multi-tenant (Apache `mod_dav` derrière le frontend nginx)

Accès dépôt de fichiers par tenant **en montage de lecteur réseau** (Explorateur
Windows, Finder macOS, davfs2), branché sur le dossier `share` du tenant
(`/opt/tenants/<id>/share`) — celui que surveille le `fs-watcher`. Complète le
SFTP (cf. [../../infra-host/sftp/README.md](../../infra-host/sftp/README.md)) : même zone de dépôt, autre
protocole.

## Pourquoi un path `/dav/` et pas un sous-domaine `dav.<tenant>`

WebDAV est du HTTP(S) : il passe par le frontend nginx **déjà routé** par Traefik
(`Host(<fqdn>)`). Exposer `https://<fqdn>/dav/` **réutilise le DNS, le certificat
et la route existants** — zéro nouvelle infra. Un sous-domaine `dav.<tenant>`
imposerait, lui, un enregistrement DNS + un certificat par tenant ; et en mode
**cert fourni**, le SAN du cert client devrait couvrir `dav.<fqdn>` (souvent
impossible). Le path évite tout cela.

## Pourquoi Apache et pas nginx

Le frontend `nginx:alpine` **n'a pas de module WebDAV utilisable** (le
`ngx_http_dav_module` de base ne fait ni `PROPFIND`, ni `OPTIONS`, ni `LOCK`).
On ne l'utilise donc que comme **reverse-proxy** : il relaie `/dav/` vers un
conteneur **Apache `mod_dav`** (implémentation WebDAV de référence, complète).
nginx ne comprend pas les méthodes WebDAV, il les transmet telles quelles
(`proxy_pass`).

## Modèle

| Élément | Choix |
|---|---|
| Protocole | **WebDAV** sur HTTP(S), exposé sous `https://<fqdn>/dav/` |
| Serveur | **Apache `mod_dav`** (`httpd:2.4-alpine`), **un conteneur par tenant** |
| Reverse-proxy | frontend nginx : `location ^~ /dav/` -> `webdav:8080` |
| Racine servie | `/data` = `${SHARE_PATH}` (= `/opt/tenants/<id>/share`) |
| Identité fichiers | **`$APP_UID:$APP_GID`** (conteneur en `user:` non-root) -> lisible/supprimable par le `fs-watcher` |
| Auth | **Basic auth htpasswd** par tenant (`/conf/htpasswd`, hors dépôt), relu à chaque requête |

### Détails techniques

- **Rootless** : le conteneur tourne en `APP_UID` (non-root), donc Apache
  **écoute en 8080** (un uid non-root ne peut pas binder 80) ; `PidFile` et
  `DavLockDB` sont dans `/tmp` ; les logs vont vers `docker logs`.
- **uid des fichiers** : `PUT` crée les fichiers en `APP_UID:APP_GID` — c'est la
  propriété « magique » du SFTP, obtenue ici par l'`user:` du conteneur (pas
  besoin d'être dans le conteneur `fs-watcher`).
- **Préfixe `/dav` conservé** (nginx ne strippe pas) + `Alias /dav /data` côté
  Apache -> hrefs `PROPFIND` cohérents sous `/dav/` -> montage de lecteur fiable.
- **Opt-in** : le WebDAV n'est PAS dans la stack de base. Un tenant l'active en
  incluant l'overlay `infra/webdav/docker-compose.yml` (cf. *Activation*). Sans
  overlay → `/dav/` renvoie **501** (« non activé »), le reste du site marche.
  Avec overlay mais sans compte htpasswd → **401** (fermé tant qu'aucun compte).

## Fichiers

| Chemin | Rôle |
|---|---|
| `infra/webdav/Dockerfile` | Image `opencapture-webdav` (httpd + notre conf). Partagée, build 1×. |
| `infra/webdav/httpd.conf` | Config Apache (rootless, `mod_dav`, Basic auth, `Alias /dav`). |
| `infra/webdav/docker-compose.yml` | Overlay **opt-in** : ajoute le conteneur `webdav` (réseau interne, `user: APP_UID`). |
| bloc `location ^~ /dav/` dans `infra/nginx.conf.template` | Proxy frontend -> `webdav:8080` (501 si non activé). |
| `/opt/tenants/<id>/webdav/htpasswd` | Comptes WebDAV du tenant. **Secret**, hors dépôt. |
| `../../new-webdav-account.sh` | Crée/complète l'accès WebDAV d'un tenant. |
| `../../runbooks/06-webdav-server.sh` | Exploitation pas-à-pas. |

## Activation (opt-in)

Le WebDAV est un add-on : un tenant l'active en ajoutant l'overlay à son
`docker-compose.yml` (comme les overlays Traefik) :

```yaml
include:
    - path: ../../infra/docker-compose.yml
    - path: ../../infra/docker-compose.traefik-*.yml
    - path: ../../infra/webdav/docker-compose.yml      # <- active le WebDAV
```

Puis :

1. `./deploy.sh <id>` — construit l'image partagée `opencapture-webdav` (dès
   qu'un tenant inclut l'overlay) et démarre le conteneur `webdav`.
2. `sudo ./new-webdav-account.sh <id>` — crée le compte (htpasswd ; **aucun
   reload** — Apache le relit à chaque requête).

## Comptes (login / mot de passe)

Définis par `new-webdav-account.sh <id> [login]` : le **login** est le 2ᵉ argument
(défaut `<id>`), le **mot de passe** est demandé interactivement (bcrypt). Tout
est stocké dans `/opt/tenants/<id>/webdav/htpasswd` (hors dépôt).

| Action | Commande |
|---|---|
| Créer / ajouter un login | `sudo ./new-webdav-account.sh <id> <login>` |
| Changer un mot de passe | relancer avec le **même** login |
| Supprimer un compte | `docker run --rm -v /opt/tenants/<id>/webdav:/work opencapture-webdav htpasswd -D /work/htpasswd <login>` |

Aucun reload dans tous les cas. Détail + variante non-interactive :
[../../runbooks/06-webdav-server.sh](../../runbooks/06-webdav-server.sh).

## Où déposer les fichiers

Le montage pointe sur la racine `share/`. Le `fs-watcher` surveille les
**sous-dossiers** `entrant/` (créés au 1er déploiement OpenCapture) :

- Verifier : `dav/entrant/verifier/{default,ocr_only,default_mail}`
- Splitter : `dav/entrant/splitter/default`

Déposer ailleurs que dans ces dossiers → fichier non traité.

## Test rapide

```bash
# OPTIONS : doit annoncer le WebDAV
curl -ksI -u <id>:<pwd> https://<fqdn>/dav/ | grep -i '^DAV:'

# Dépôt déclenchant un traitement Verifier
curl -ks -u <id>:<pwd> -T facture.pdf \
  https://<fqdn>/dav/entrant/verifier/default/facture.pdf
# -> suivre les logs fs-watcher : le fichier est capté puis consommé.
```
