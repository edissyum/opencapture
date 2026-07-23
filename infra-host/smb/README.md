# Serveur SMB multi-tenant (Samba standalone)

Accès dépôt de fichiers par tenant en **SMB** (lecteur réseau Windows / macOS /
Linux), branché sur le dossier `share` du tenant (`${OC_DATA_ROOT}/tenants/<id>/share`) —
celui que surveille le `fs-watcher` OpenCapture.

## Pourquoi UN SEUL démon (et pas un Samba par tenant)

Comme le SFTP, et **contrairement** au WebDAV : SMB est sur le **port 445, en TCP
brut, SANS SNI**. Un reverse-proxy (Traefik/nginx) ne peut donc **pas** router
plusieurs backends SMB par domaine sur un seul 445 — c'est exactement le mur du
FTPS sur une IP unique. Un **conteneur Samba par tenant** voudrait chacun binder
le 445 de l'hôte → collision. Le modèle WebDAV **ne se transpose pas**.

Mais les **partages SMB sont nommés** : `\\serveur\test1`, `\\serveur\ccbe`… Le
nom du partage désambiguïse les tenants nativement sur **un seul démon, un seul
445**. → Samba se modèle sur le **SFTP** : un démon partagé, un partage par tenant.

## Pourquoi STANDALONE (et pas un domaine Active Directory)

Trois notions de « domaine/nom » se télescopent — à séparer :

| Notion | Exemple | Par tenant ? | Géré où |
|---|---|---|---|
| **Domaine DNS** | `test1.example.com` | oui | DNS seul : un A/CNAME → l'IP. Cosmétique. |
| **`workgroup`** | `WORKGROUP` | **non** | `[global]`, une valeur unique. Vestige NetBIOS. |
| **Domaine AD** | `CLIENT.LOCAL` | (sans objet) | **non utilisé** : serveur standalone. |

`workgroup` n'a **aucun rapport** avec les domaines DNS des clients et n'est pas
déclinable par tenant. Le « vrai » domaine Windows (Active Directory) imposerait
un contrôleur de domaine Samba — inutile ici. Les tenants sont des **comptes
Samba locaux** (`tdbsam`) sur un serveur **standalone**.

## Modèle

| Élément | Choix |
|---|---|
| Protocole | **SMB2/3** (port 445), démon unique partagé, NetBIOS désactivé |
| Multi-tenant | un **partage `[<id>]`** par tenant → `${OC_DATA_ROOT}/tenants/<id>/share` |
| Comptes | **locaux** (`tdbsam`), un par tenant, `valid users = <id>` |
| Identité fichiers | `force user/group` = le nom portant **`$APP_UID:$APP_GID`** (dérivé de l'UID) |
| Chiffrement | **SMB3 `smb encrypt = required`** (clé dérivée de l'auth, **pas de cert**) |
| Auth | mot de passe SMB (`smbpasswd`), un par tenant |

> **Pas de certificat à gérer** (contrairement au WebDAV) : le chiffrement SMB3
> dérive sa clé de l'authentification, il n'utilise pas de cert TLS de domaine.

## Le compte de service côté hôte (important)

Ce qui doit correspondre, c'est le **numéro** : `force user` doit désigner le
**nom hôte qui porte `$APP_UID:$APP_GID`** (défaut 1000) — c'est l'UID/GID, pas le
nom, qui rend les fichiers lisibles/supprimables par le fs-watcher. Le nom peut
donc différer de `APP_USER` du `.env`.

- Le runbook 07 crée le compte de service **seulement si l'UID/GID est libre** ;
  s'il est déjà porté par un autre nom, il est **réutilisé** (on garde sur le numéro).
- `new-smb-account.sh` **dérive** `force user`/`force group` depuis l'UID/GID
  (`getent passwd $APP_UID`), donc il tombe toujours sur le bon nom.

⚠️ Le piège inverse (**même nom, UID différent**) casse tout : les fichiers
atterrissent au mauvais UID → le fs-watcher (uid `$APP_UID`) ne peut plus les
purger. Vérifie avec `getent passwd $APP_UID`.

Les comptes d'authentification par tenant (`<id>`) sont de simples identités
`nologin` : leur uid n'importe pas, `force user` écrase la propriété des fichiers.

## Fichiers

| Chemin | Rôle |
|---|---|
| `infra-host/smb/smb.conf` | Config Samba (global + `include`). Déployée en `/etc/samba/smb.conf`. |
| `/etc/samba/oc-shares.conf` | Sections `[<id>]` des tenants. **Hors dépôt**, géré par le script. |
| passdb `tdbsam` | Mots de passe SMB (`smbpasswd`). **Secret**, hors dépôt. |
| `../../new-smb-account.sh` | Crée l'accès SMB d'un tenant (compte + partage + reload). |
| `../../runbooks/fr/07-smb-server.md` | Install serveur pas-à-pas. |

## Mise en place

1. `runbooks/fr/07-smb-server.md` — une fois (paquet, compte de service hôte,
   config, pare-feu 445, `smbd`).
2. Par tenant : `sudo ./new-smb-account.sh <id>` (crée le compte + la section ;
   `smbcontrol all reload-config` — **pas de restart**).

## Domaines clients (DNS)

Si chaque client a son propre nom (`depot.test1.com`, `smb.ccbe.fr`…) : juste un
**enregistrement DNS A/CNAME par domaine → l'IP du serveur**. Le client monte
alors `\\depot.test1.com\test1`. Le nom de domaine est **cosmétique** ; le serveur
distingue le tenant par le **nom de partage** (= l'`id`), pas par le domaine.

> Piège : le nom de partage doit rester **unique** par tenant (= l'`id`). On ne
> peut pas réutiliser un même nom (`\\dom-a\depot` + `\\dom-b\depot`) en comptant
> sur le domaine — le 445 ne transporte pas le domaine de façon routable.

## Où déposer les fichiers

Le partage pointe sur la racine `share/`. Le `fs-watcher` surveille les
**sous-dossiers** `entrant/` (créés au 1er déploiement OpenCapture) :

- Verifier : `entrant/verifier/{default,ocr_only,default_mail}`
- Splitter : `entrant/splitter/default`

Déposer ailleurs → fichier non traité.

## Test rapide

```bash
# Depuis un poste Linux/macOS (paquet smbclient) :
smbclient "//<serveur>/<id>" -U "<id>" -m SMB3
#   smb: \> cd entrant/verifier/default
#   smb: \> put un.pdf
# puis suivre les logs fs-watcher / worker-verifier.

# Windows : \\<serveur>\<id>  (ou \\<domaine-client>\<id>), identifiants <id>.
```

## Dépannage : « Multiple connections... using more than one user name »

Limite **Windows** (pas Samba) : un poste ne peut garder qu'**une seule identité**
active vers un même serveur SMB. Si une session traîne (poste sorti de veille,
mot de passe SMB changé, redémarrage de `smbd`) et qu'une reconnexion est tentée,
Windows la refuse avec ce message, y compris via l'explorateur (simple échec de
dépôt, sans message clair). Aucun levier serveur ne force Windows à lâcher une
session déjà établie — `deadtime` (ci-dessus) réduit juste la fenêtre où ça peut
arriver en coupant les sessions inactives côté serveur.

Résolution (**droits admin requis sur le poste Windows** — pas un cas pour un
support à distance sans accès admin) :
```
net use * /delete /y
```
Si ça ne suffit pas (session sans lettre de lecteur, invisible dans `net use`) :
```
net stop lanmanworkstation
net start lanmanworkstation
```
En dernier recours : redémarrer le poste Windows.

## Supprimer un tenant

```bash
sudo smbpasswd -x <id>          # compte SMB
sudo userdel  <id>              # identité d'auth Unix (nologin)
# retirer la section [<id>] de /etc/samba/oc-shares.conf, puis :
sudo smbcontrol all reload-config
```
