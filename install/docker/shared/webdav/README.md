# WebDAV multi-tenant (Apache `mod_dav` derrière le frontend nginx)

Accès dépôt de fichiers par tenant **en montage de lecteur réseau** (Explorateur
Windows, Finder macOS, davfs2), branché sur le dossier `share` du tenant
(`/opt/edissyum/opencapture/tenants/<id>/share`) — celui que surveille le `fs-watcher`. Complète le
SFTP (cf. [../../install/docker/host/sftp/README.md](../../host/sftp/README.md)) : même zone de dépôt, autre
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

## Pourquoi nginx relaie (et pas Traefik → webdav en direct)

On garde la chaîne **Traefik → nginx → Apache** plutôt que **Traefik → Apache
direct** (webdav sur le réseau `frontend` avec ses propres labels Traefik), pour
deux raisons :

1. **L'overlay reste unique.** Aujourd'hui `install/docker/shared/webdav/docker-compose.yml`
   n'ajoute qu'un service en **réseau interne, sans aucun label** : il « profite »
   gratuitement du TLS/routage du frontend, quel que soit le mode du tenant. Exposé
   directement à Traefik, il lui faudrait son propre routeur, donc sa config TLS —
   qui **diffère selon le mode** (HTTP : `entrypoints=web` ; cert fourni :
   `tls=true` ; Let's Encrypt : `+ tls.certresolver`). Il faudrait donc **3
   variantes d'overlay webdav** (comme les 3 overlays Traefik du frontend), au lieu
   d'une seule.
2. **Ça ne réglerait pas le « slash ».** Le souci du `/dav` sans slash (cf.
   *Détails techniques*) vient d'Apache **derrière un proxy TLS** — or Traefik EST
   aussi un proxy TLS. On aurait le même 301, à corriger de toute façon. La couche
   nginx n'est donc pas le coupable.

## Modèle

| Élément | Choix |
|---|---|
| Protocole | **WebDAV** sur HTTP(S), exposé sous `https://<fqdn>/dav/` |
| Serveur | **Apache `mod_dav`** (`httpd:2.4-alpine`), **un conteneur par tenant** |
| Reverse-proxy | frontend nginx : `location ~ ^/dav(/|$)` -> `webdav:8080` |
| Racine servie | `/data` = `${SHARE_PATH}` (= `/opt/edissyum/opencapture/tenants/<id>/share`) |
| Identité fichiers | **`$APP_UID:$APP_GID`** (conteneur en `user:` non-root) -> lisible/supprimable par le `fs-watcher` |
| Auth | **Basic auth htpasswd** par tenant (`/conf/htpasswd`, hors dépôt), relu à chaque requête |

### Détails techniques

- **Rootless** : le conteneur tourne en `APP_UID` (non-root), donc Apache
  **écoute en 8080** (un uid non-root ne peut pas binder 80) ; `PidFile` et
  `DavLockDB` sont dans `/tmp` ; les logs vont vers `docker logs`.
- **uid des fichiers** : `PUT` crée les fichiers en `APP_UID:APP_GID` — c'est la
  propriété « magique » du SFTP, obtenue ici par l'`user:` du conteneur (pas
  besoin d'être dans le conteneur `fs-watcher`).
- **Préfixe `/dav` conservé** (proxy sans strip) + `Alias /dav /data` côté Apache
  -> hrefs `PROPFIND` cohérents sous `/dav/` -> montage de lecteur fiable.
- **`/dav` sans slash (client Windows)** : le redirecteur WebDAV de Windows
  interroge `/dav` **sans** slash final, et `mod_dav` y répondrait un **301**
  (cassé derrière le proxy TLS — en `http` — et non suivi par Windows) → **« erreur
  système 67 »**. Réglé **dans Apache** (`mod_rewrite` : `RewriteRule ^/dav$ /dav/
  [PT]`, une réécriture **interne**, pas une redirection) → `/dav` répond 200. Le
  proxy nginx reste donc un simple relais (un seul `location ~ ^/dav(/|$)`).
- **Opt-in** : le WebDAV n'est PAS dans la stack de base. Un tenant l'active en
  incluant l'overlay `install/docker/shared/webdav/docker-compose.yml` (cf. *Activation*). Sans
  overlay → `/dav/` renvoie **501** (« non activé »), le reste du site marche.
  Avec overlay mais sans compte htpasswd → **401** (fermé tant qu'aucun compte).

## Fichiers

| Chemin | Rôle |
|---|---|
| `install/docker/shared/webdav/Dockerfile` | Image `opencapture-webdav` (httpd + notre conf). Partagée, build 1×. |
| `install/docker/shared/webdav/httpd.conf` | Config Apache (rootless, `mod_dav`, Basic auth, `Alias /dav`). |
| `install/docker/shared/webdav/docker-compose.yml` | Overlay **opt-in** : ajoute le conteneur `webdav` (réseau interne, `user: APP_UID`). |
| bloc `location ^~ /dav/` dans `install/docker/shared/nginx.conf.template` | Proxy frontend -> `webdav:8080` (501 si non activé). |
| `/opt/edissyum/opencapture/tenants/<id>/webdav/htpasswd` | Comptes WebDAV du tenant. **Secret**, hors dépôt. |
| `./new-webdav-account.sh` | Crée/complète l'accès WebDAV d'un tenant. |
| `../../runbooks/fr/06-webdav-server.md` | Exploitation pas-à-pas. |

## Activation (opt-in)

Le WebDAV est un add-on : un tenant l'active en ajoutant l'overlay à son
`docker-compose.yml` (comme les overlays Traefik) :

```yaml
include:
    - path: ../../install/docker/shared/docker-compose.yml
    - path: ../../install/docker/shared/traefik/docker-compose.traefik-*.yml
    - path: ../../install/docker/shared/webdav/docker-compose.yml      # <- active le WebDAV
```

Puis :

1. `./install/docker/deploy.sh <id>` — construit l'image partagée `opencapture-webdav` (dès
   qu'un tenant inclut l'overlay) et démarre le conteneur `webdav`.
2. `sudo ./install/docker/shared/webdav/new-webdav-account.sh <id>` — crée le compte (htpasswd ; **aucun
   reload** — Apache le relit à chaque requête).

## Comptes (login / mot de passe)

Définis par `new-webdav-account.sh <id> [login]` : le **login** est le 2ᵉ argument
(défaut `<id>`), le **mot de passe** est demandé interactivement (bcrypt). Tout
est stocké dans `/opt/edissyum/opencapture/tenants/<id>/webdav/htpasswd` (hors dépôt).

| Action | Commande |
|---|---|
| Créer / ajouter un login | `sudo ./install/docker/shared/webdav/new-webdav-account.sh <id> <login>` |
| Changer un mot de passe | relancer avec le **même** login |
| Supprimer un compte | `docker run --rm -v /opt/edissyum/opencapture/tenants/<id>/webdav:/work opencapture-webdav htpasswd -D /work/htpasswd <login>` |

Aucun reload dans tous les cas. Détail + variante non-interactive :
[../../runbooks/fr/06-webdav-server.md](../../../../runbooks/fr/06-webdav-server.md).

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
