# Serveur SFTP multi-tenant (ProFTPD `mod_sftp`)

Accès dépôt de fichiers par tenant, branché sur le dossier `share` du tenant
(`/opt/tenants/<id>/share`) — celui que surveille le `fs-watcher` OpenCapture.

## Pourquoi SFTP uniquement (et pas FTPS)

Le serveur n'a **qu'une seule IP**. Or, en FTPS, le certificat est présenté
**avant** le login : sur une IP unique, on ne peut donc servir qu'**un seul**
cert, pas un par tenant (il faudrait du SNI, non fiable sur ProFTPD —
historiquement buggé, abandonné par d'autres panels).

Le **SFTP** n'a pas ce problème : c'est du SSH, l'identité du serveur est une
**clé d'hôte** (vérifiée en TOFU côté client, `known_hosts`), pas un certificat
de domaine. → **multi-tenant trivial sur une seule IP**, sans aucun certificat.

> Si un cert FTPS distinct par tenant devenait une vraie contrainte, la seule
> voie réaliste serait PureFTPd (FTPS + SNI) + OpenSSH pour le SFTP — deux
> démons, config délicate. Hors périmètre ici.

## Pourquoi ProFTPD et pas OpenSSH

- **Comptes virtuels** (`ftpd.passwd`) : pas de comptes Linux système à créer.
- **Chroot direct sur `share/`** (possédé par `$APP_UID`) : OpenSSH impose un
  `ChrootDirectory` possédé par **root** et non inscriptible → il faudrait
  chrooter un cran au-dessus de `share/`. ProFTPD n'a pas cette contrainte.
- **uid/gid forcés** par compte → fichiers déposés possédés par le compte de
  service OpenCapture, donc **lisibles ET supprimables** par le `fs-watcher`.

## Modèle

| Élément | Choix |
|---|---|
| Protocole | **SFTP** (port 2222), service unique partagé |
| Identité serveur | **Clé d'hôte SSH** partagée (TOFU côté client) |
| Comptes | **Virtuels** (`/etc/proftpd/ftpd.passwd`), un par tenant, chroot sur son `share` |
| Identité fichiers | **`$APP_UID:$APP_GID`** (compte de service OpenCapture, défaut 1050) |
| Auth | mot de passe et/ou clé publique (`authorized_keys/<id>`) |

## Fichiers

| Chemin | Rôle |
|---|---|
| `sftp/proftpd.conf` | Config ProFTPD (SFTP only). Déployée en `/etc/proftpd/proftpd.conf`. |
| `/etc/proftpd/ftpd.passwd` | Comptes virtuels (`ftpasswd`). **Secret**, hors dépôt. |
| `/etc/proftpd/sftp/` | Clés d'hôte SSH partagées + `authorized_keys/<id>`. Hors dépôt. |
| `../new-sftp-account.sh` | Crée le compte SFTP d'un tenant (chroot + uid/gid). |
| `../runbooks/05-sftp-server.sh` | Install serveur pas-à-pas. |

## Mise en place

1. `runbooks/05-sftp-server.sh` — une fois (paquet, `mod_sftp`, clés d'hôte, config, pare-feu).
2. Par tenant : `sudo ./new-sftp-account.sh <id>` (crée le compte ; **aucun reload** —
   `ftpd.passwd` est relu à chaque connexion).

## Où déposer les fichiers

Le compte atterrit (chroot) sur la racine `share/`. Le `fs-watcher` surveille
les **sous-dossiers** `entrant/` (créés au 1er déploiement OpenCapture) :

- Verifier : `entrant/verifier/{default,ocr_only,default_mail}`
- Splitter : `entrant/splitter/default`

Déposer ailleurs que dans ces dossiers → fichier non traité.

## Test rapide

```bash
sftp -P 2222 <id>@<serveur>
# put un.pdf dans entrant/verifier/default, puis suivre les logs fs-watcher
```
