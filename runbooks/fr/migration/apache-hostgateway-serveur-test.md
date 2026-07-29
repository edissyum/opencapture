# Apache + host-gateway — serveur de test principal interne

> Brouillon de documentation, pas encore relu ni commité. Décrit l'état constaté
> le 2026-07-08 sur `/etc/apache2/sites-enabled/mem.conf` et la configuration
> `host-gateway` proposée côté `infra/docker-compose.yml` (commit `22768fe`).

## 1. Contexte du serveur

Ce serveur héberge deux générations d'Open-Capture côte à côte :
- la **v3 installée directement sur le serveur** (hors conteneur, custom
  `edissyum`), sous `/var/www/html/opencapture/`, toujours joignable via
  `/opencapturev3/`.
- le **tenant Docker v4** `opencapture`, exposé par Traefik sur `127.0.0.1:8080`
  (pas de port public dédié).
- des applications tierces également installées directement sur le serveur,
  sur le même Apache : **Maarch Courrier / MEM**
  (`/var/www/html/mem_courrier/`), MaarchParapheur, OCForMEM, etc.

**Apache est l'unique point d'entrée public** (`*:80`/`*:443`). Il route :
- vers les apps installées directement sur le serveur (`mem_courrier`,
  `opencapturev3`, ...) ;
- vers le tenant Docker v4 via reverse-proxy, avec réécriture du Host header
  (Traefik route par `Host()`, voir §2.2).

C'est cette même exposition `*:80` (pas seulement loopback) qui permet aussi à
un conteneur Docker d'atteindre `mem_courrier` via `host-gateway` (§3).

## 2. Configuration Apache actuelle

Fragment de `/etc/apache2/sites-enabled/mem.conf` (vhost unique `*:80`) :

### 2.1 Service (hors conteneur) ciblé par les connecteurs OC (MEM Courrier)

```apache
<Directory /var/www/html/mem_courrier/>
    Options Indexes FollowSymLinks MultiViews
    AllowOverride All
    Require all granted
    SetEnv MAARCH_TMP_DIR "/tmp/"
</Directory>
```

Rien de spécifique ici pour l'accès réseau : c'est le `VirtualHost *:80` englobant
qui fait qu'Apache écoute sur **toutes les interfaces**, pas seulement `127.0.0.1`.
C'est la condition nécessaire pour que `host-gateway` fonctionne (§3.2).

### 2.2 Reverse-proxy vers le tenant Docker v4 (trick Host header)

Bloc complet — **5 `<Location>`**, un par préfixe d'URL servi par la SPA v4
(à tenir à jour si le frontend ajoute un nouveau chemin racine-absolu) :

```apache
Define OC_DOCKER_HOST opencapture-ocv4.edissyum.com
Define OC_DOCKER_UP   http://127.0.0.1:8080

# v3 (hors conteneur) : préfixe DISTINCT /opencapturev3/ (pas de collision avec /opencapture/ v4)
Alias /opencapturev3 /var/www/html/opencapture

<Location /opencapture/>
    ProxyPreserveHost On
    RequestHeader set Host "${OC_DOCKER_HOST}"
    ProxyPass        ${OC_DOCKER_UP}/opencapture/
    ProxyPassReverse ${OC_DOCKER_UP}/opencapture/
</Location>
<Location /assets/>
    ProxyPreserveHost On
    RequestHeader set Host "${OC_DOCKER_HOST}"
    ProxyPass        ${OC_DOCKER_UP}/assets/
    ProxyPassReverse ${OC_DOCKER_UP}/assets/
</Location>
<Location /imgs/>
    ProxyPreserveHost On
    RequestHeader set Host "${OC_DOCKER_HOST}"
    ProxyPass        ${OC_DOCKER_UP}/imgs/
    ProxyPassReverse ${OC_DOCKER_UP}/imgs/
</Location>
<Location /pdf.worker.min.mjs>
    ProxyPreserveHost On
    RequestHeader set Host "${OC_DOCKER_HOST}"
    ProxyPass        ${OC_DOCKER_UP}/pdf.worker.min.mjs
    ProxyPassReverse ${OC_DOCKER_UP}/pdf.worker.min.mjs
</Location>
<Location /tinymce-overrides/>
    ProxyPreserveHost On
    RequestHeader set Host "${OC_DOCKER_HOST}"
    ProxyPass        ${OC_DOCKER_UP}/tinymce-overrides/
    ProxyPassReverse ${OC_DOCKER_UP}/tinymce-overrides/
</Location>
```

**Trick `Alias /opencapturev3`** : la v3 sert ses assets en chemins **relatifs**
(`<base href="./">`) et appelle son backend en URL relative
(`../../../backend_oc/edissyum`) — les `../` remontent à la racine quel que
soit le préfixe, à nombre de segments égal. Déplacer la v3 sous
`/opencapturev3/` (au lieu de `/opencapture/edissyum/dist/` d'origine) ne casse
donc rien côté v3, et libère `/opencapture/` pour la v4 sans collision (testé :
un `<Location /opencapture/edissyum> ProxyPass !</Location>` d'exclusion ne
suffisait pas à empêcher la v4 de répondre en premier, quand le proxy général
est lui aussi déclaré en `<Location>`).

Traefik route par `Host()` (clé interne `opencapture-ocv4.edissyum.com`, sans
DNS). Un client qui arrive par l'IP nue enverrait un Host différent, que
Traefik ne reconnaîtrait pas. Apache corrige ça avant de reproxifier :
- `RequestHeader set Host ...` force le Host attendu par Traefik ;
- `ProxyPreserveHost On` dit à `mod_proxy` de transmettre ce Host (au lieu de le
  recalculer depuis l'URL cible du `ProxyPass`).

**Pourquoi ce trick.** `OC_FQDN=opencapture-ocv4.edissyum.com` n'est qu'une clé
de routage interne à Traefik, **sans entrée DNS réelle** (le domaine n'est pas
public/résolu). Sans réécriture, chaque poste client qui veut accéder au
tenant devrait avoir une entrée dans son fichier hosts local
(`/etc/hosts`/`C:\Windows\System32\drivers\etc\hosts`) faisant pointer ce FQDN
vers l'IP du serveur — à poser et maintenir sur **chaque poste**, y compris
ceux des utilisateurs finaux, ce qui n'est pas praticable. En intercalant
Apache (déjà joignable par l'IP nue du serveur, sans rien à configurer côté
client) et en lui faisant porter le bon Host au moment de reproxifier vers
Traefik, aucun poste n'a besoin de connaître ce FQDN : tout le monde tape l'IP
(ou le nom d'hôte réseau existant), Apache fait la traduction en interne. Ça
permet aussi de faire cohabiter v3 et v4 sous la même IP/port 80 sans FQDN
dédié ni certificat à gérer pour ce cas précis (mode HTTP interne).

Ce mécanisme est **indépendant** de `host-gateway` (§3) : l'un réécrit un
en-tête HTTP pour satisfaire un routeur L7 (Traefik), l'autre résout un nom en
IP réseau pour atteindre l'hôte depuis un conteneur (L3). Ils ne se substituent
pas l'un à l'autre et ne se gênent pas.

### 2.3 Blocage des fichiers sensibles servis par erreur (v3 hors conteneur)

```apache
<Directory /var/www/html/opencapture/>
    AllowOverride All
    WSGIProcessGroup opencapture
    WSGIApplicationGroup %{GLOBAL}
    WSGIPassAuthorization On
    Order deny,allow
    Allow from all
    Require all granted
    <Files ~ "(.ini|secret_key|.ods)">
        Require all denied
    </Files>
</Directory>
```

**Pourquoi ce trick.** Tout `/var/www/html/opencapture/` est servi par Apache
(`AllowOverride All` + `Require all granted`) — y compris, sans cette
exception, les fichiers de config (`*.ini`), la clé `secret_key`, et le
référentiel fournisseurs (`*.ods`) qui vivent **dans l'arborescence servie**.
Le bloc `<Files ~ "(.ini|secret_key|.ods)"> Require all denied </Files>`
referme spécifiquement ces extensions/noms pour qu'aucune requête HTTP directe
ne puisse les télécharger, quel que soit le sous-dossier où ils se trouvent. À
reproduire pour toute nouvelle app servie de la même façon (racine web =
racine de code) si elle stocke des secrets/config dans son webroot. **Le
tenant Docker v4 n'a pas ce problème** : `config/`, `secret_key`, etc. sont
hors du dossier servi par nginx (`/usr/share/nginx/html`), donc rien
d'équivalent à ajouter côté v4.

**`WSGIPassAuthorization On`** : par défaut, `mod_wsgi` consomme l'en-tête
`Authorization` (HTTP Basic) pour sa propre gestion d'auth Apache et ne le
transmet **pas** à l'application WSGI. OC (v3) utilise lui-même cet en-tête
pour son auth applicative (API/webservice) — sans cette directive,
l'authentification par `Authorization` serait silencieusement invisible côté
Python, avec un échec de connexion difficile à diagnostiquer (l'en-tête arrive
bien chez Apache, mais jamais dans `wsgi.environ`). Sans équivalent à vérifier
côté v4 (le tenant Docker ne passe pas par `mod_wsgi`, gunicorn reçoit
l'en-tête nativement).

### 2.4 Éditeur collaboratif (`/oo-editor`) — réécriture `X-Forwarded-Host`

```apache
Define VPATH /oo-editor
Define DS_ADDRESS 127.0.0.1:4242
...
<Location ${VPATH}>
    Require all granted
    SetEnvIf Host "^(.*)$" THE_HOST=$1
    RequestHeader setifempty X-Forwarded-Proto http
    RequestHeader setifempty X-Forwarded-Host %{THE_HOST}e
    RequestHeader edit X-Forwarded-Host (.*) $1${VPATH}
    ProxyAddHeaders Off
</Location>

ProxyPassMatch ^\${VPATH}(.*)(\/websocket)$ "ws://${DS_ADDRESS}/$1$2"
ProxyPass ${VPATH} "http://${DS_ADDRESS}"
ProxyPassReverse ${VPATH} "http://${DS_ADDRESS}"
```

Sans rapport direct avec OC v4/`host-gateway`, mais **dans le même vhost** —
à connaître pour ne pas le casser en éditant `mem.conf`. Reverse-proxy vers un
serveur d'édition collaborative de documents (accessible en local uniquement,
`127.0.0.1:4242`), utilisé par MaarchParapheur/Maarch Courrier.

**Pourquoi ce trick.** Ce type de serveur d'édition construit ses propres URLs
(callbacks, assets, WebSocket) à partir de l'en-tête `X-Forwarded-Host` qu'il
reçoit — mais un `X-Forwarded-Host` classique ne contient que l'hôte
(`monserveur`), pas le préfixe `/oo-editor` sous lequel Apache l'expose. Sans
correction, l'éditeur générerait des URLs pointant à la racine du site
(`http://monserveur/...`) au lieu de `http://monserveur/oo-editor/...`, donc
cassées derrière ce reverse-proxy. Le bloc corrige ça en 3 temps : capture le
Host réel (`SetEnvIf` → `THE_HOST`), pose un `X-Forwarded-Host`/`-Proto` par
défaut s'ils sont absents (`setifempty`), puis **réécrit** `X-Forwarded-Host`
pour y **rajouter le suffixe `${VPATH}`** (`RequestHeader edit ... $1${VPATH}`)
— et `ProxyAddHeaders Off` empêche `mod_proxy` de regénérer/écraser ces
en-têtes avec sa propre valeur (sans préfixe) après coup. Le `ProxyPassMatch`
dédié aux URLs finissant en `/websocket` bascule ces requêtes en `ws://` (le
`ProxyPass` générique juste en dessous ne gère que le HTTP classique).

### 2.5 Secret partagé au niveau du vhost

```apache
SetEnv MAARCH_ENCRYPT_KEY "<valeur — voir mem.conf, non reproduite ici>"
```

Posé **avant** les blocs `<Directory>` (donc au niveau du `VirtualHost`
entier) : s'applique à toutes les apps de ce vhost, pas seulement Maarch
Courrier. Ne pas dupliquer/regénérer cette valeur par erreur en réorganisant
`mem.conf` — elle doit rester identique à celle attendue par l'app cible (clé
de chiffrement, pas une simple config cosmétique).

### 2.6 Ce qui n'est PAS un trick (boilerplate Debian par défaut)

Présent dans le fichier mais générique/sans lien avec OC ni MEM — pas la peine
d'y chercher une intention particulière : `<Directory />` (verrou racine par
défaut), `ScriptAlias /cgi-bin/` + `<Directory "/usr/lib/cgi-bin">` (cgi-bin
standard Debian), `Order deny,allow` / `Allow from all` en doublon de
`Require all granted` (syntaxe Apache 2.2 conservée à côté de la 2.4 via
`mod_access_compat`, redondante mais inoffensive).

## 3. `host-gateway` : fonctionnement

### 3.1 Mécanisme

Un conteneur attaché à un réseau bridge Docker route déjà tout trafic sortant
vers la passerelle de ce réseau (l'IP du bridge — ex. `172.17.0.1` sur le
bridge par défaut, ou l'IP du bridge propre au projet compose). Cette
passerelle est une interface réseau de plus que possède la machine hôte : lui
parler, c'est parler à l'hôte.

`host-gateway` est une valeur spéciale reconnue par Docker Engine (≥ 20.10,
Linux) dans `extra_hosts`. Au démarrage du conteneur, Docker la remplace par
l'IP réelle de cette passerelle et écrit l'entrée dans le `/etc/hosts` interne
du conteneur — aucune magie DNS, une simple ligne statique.

Déclaration (`infra/docker-compose.yml`, anchor `x-backend-extra-hosts`,
appliqué à `backend` et `worker-verifier`) :

```yaml
extra_hosts:
    - "host.docker.internal:host-gateway"
```

**Pourquoi ce trick.** En v3, OC et les applications tierces (MEM Courrier,
etc.) tournaient **directement sur le même serveur** : `localhost` dans la
config d'un connecteur de sortie désignait donc légitimement la machine
courante, et fonctionnait. En passant OC v4 en conteneur, ce même connecteur
(champ `host` de la sortie, valeur reprise telle quelle de la migration v3)
garde `http://localhost/...` — sauf que `localhost` dans un conteneur se
désigne **lui-même**, plus la machine hôte. Le connecteur casse silencieusement
(timeout/connexion refusée) sans rapport évident avec la migration.

Deux façons de corriger, pesées avant de choisir `host-gateway` :
- **Coder en dur l'IP du serveur** dans le champ `host` du connecteur : marche
  immédiatement, mais casse si l'IP change, et la configuration n'est pas
  réutilisable telle quelle si le même custom est redéployé sur un autre
  serveur (il faudrait ressaisir l'IP à chaque fois).
- **`network_mode: host`** sur le conteneur : ferait de `localhost` un alias
  direct de l'hôte, donc plus proche du comportement v3 — mais casse
  l'isolation réseau du conteneur et son rattachement au réseau Traefik
  (le routage par label ne fonctionne qu'entre conteneurs du même réseau
  Docker), donc écarté.

`host-gateway` a été retenu comme compromis : un **alias stable et portable**
(`host.docker.internal`) qui ne dépend pas de l'IP du serveur et n'entame pas
l'isolation réseau des conteneurs — seul le champ `host` du connecteur change
(`localhost` → `host.docker.internal`), sans toucher à l'architecture réseau
existante (Traefik, réseau `frontend`, etc.).

### 3.2 Conditions requises

1. Le conteneur doit avoir cette entrée `extra_hosts` — elle n'existe pas par
   défaut sur Linux (contrairement à Docker Desktop Mac/Windows, où
   `host.docker.internal` est fourni nativement sans configuration).
2. Le service cible sur l'hôte doit écouter sur une interface que la
   passerelle atteint : `0.0.0.0` (toutes interfaces), **pas** `127.0.0.1`
   seul. Un service en loopback pur reste injoignable depuis le conteneur, la
   passerelle bridge n'étant pas la boucle locale de l'hôte.
   → Vérifié sur ce serveur : Apache écoute sur `*:80`/`*:443` (§2), donc OK ici.
3. `extra_hosts` est figé à la **création** du conteneur : un changement dans
   le compose exige `docker compose up -d <service>` (recreate), un simple
   `restart` ne suffit pas.

### 3.3 Côté application

Dans l'UI OC v4 (Paramètres → Sorties), le champ `host` du connecteur MEM :
`http://localhost/mem_courrier/mem/rest/` → `http://host.docker.internal/mem_courrier/mem/rest/`.

## 4. Points de vigilance

- **Si Apache change un jour de scope d'écoute** (ex. restriction à
  `127.0.0.1` pour durcir la surface d'attaque), `host-gateway` cesse de
  fonctionner silencieusement — les appels sortants du connecteur timeoutent.
  Aucune alerte automatique : à surveiller si la conf Apache de ce serveur est
  revue.
- **Pare-feu hôte** (`ufw`/`iptables`/`firewalld`) : si des règles restreignent
  le trafic entrant sur l'interface bridge Docker (peu probable par défaut,
  mais possible sur un hôte durci), `host-gateway` peut être bloqué même si
  Apache écoute bien sur `*:80`. À vérifier si le test de connexion échoue
  alors que `getent hosts host.docker.internal` renvoie bien une IP.
- **Portée** : `host.docker.internal` résout vers la passerelle du réseau
  *du conteneur qui fait la résolution* — sur un hôte multi-tenant (plusieurs
  projets compose = plusieurs bridges), l'IP peut différer d'un tenant à
  l'autre. Le mécanisme reste correct par construction (chaque conteneur
  résout SA propre passerelle), mais ne pas coder en dur l'IP observée sur un
  tenant en pensant qu'elle vaut pour tous.
- **Ne remplace pas le trick Host header (§2.2)** : `host-gateway` résout un
  nom en IP réseau (couche 3/hosts), le trick Apache réécrit un en-tête HTTP
  pour le routage Traefik (couche 7). Les deux coexistent sans interaction.
- **Alternative plus simple mais moins portable** : utiliser directement l'IP
  du serveur dans le champ `host` du connecteur, sans toucher au compose.
  Fonctionne tout de suite, mais casse si l'IP change ou si la configuration
  est répliquée telle quelle sur un autre serveur.
- **Vérification rapide après déploiement** :
  ```bash
  docker exec <container_backend> getent hosts host.docker.internal
  ```

## 5. Paramétrage d'une chaîne sortante vers OCforMEM

### 5.1 Configuration du watcher

```bash
vi /var/www/html/opencapture/instance/config/watcher.ini
```

```ini
[mem_entrant_cou_v4]
watch = /var/edissyum/opencapture/tenants/opencapture/share/export/splitter/COU
events = move,close
include_extensions = pdf,PDF
command = /opt/edissyum/opencaptureformem/scripts/launch_IN_COU.sh $filename
```

```bash
sudo systemctl status fs-watcher.service   # relancer le service watcher pour prendre en compte le rajout ci-dessus
tail -f /opt/edissyum/opencaptureformem/data/log/OCForMEM.log   # logs du watcher bare-metal
```

### 5.2 Correspondance des chemins (hôte ↔ conteneur) et sens du flux

`/var/edissyum/opencapture/tenants/opencapture/share/export/splitter/COU` est
la vue **côté hôte** du répertoire paramétré ainsi dans la **chaîne sortante
n°11 « Export GED - MEM Courrier »** du splitter : `/app/share/export/splitter/COU/`
côté conteneur — les deux chemins désignent le même dossier.

C'est le conteneur Docker (splitter) qui écrit dans ce répertoire partagé via
le workflow **« Document GEC MEM Courrier »** qui utilise cette chaîne
sortante — le fs-watcher bare-metal ne fait que surveiller et consommer ce
que Docker y dépose.

### 5.3 Test

Il faut téléverser un fichier dans le workflow « Document GEC MEM Courrier »
dans l'UI OC v4, puis suivre le traitement via les logs :
- `tail -f /opt/edissyum/opencaptureformem/data/log/OCForMEM.log` : côté hôte
- `docker exec -it opencapture_opencapture-worker-splitter-1 bash -c 'tail -f custom/opencapture/data/log/OpenCapture.log'` : côté conteneur
