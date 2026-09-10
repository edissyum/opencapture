# Serveur SMB multi-tenant (Samba, standalone) — installation et exploitation

Commandes à copier-coller, à ne **pas** exécuter d'un bloc. Les données de l'hôte
vivent hors du dépôt.

Prérequis : infra installée (voir [01](01-install-general.md)) et tenants créés
(`new-tenant.sh` puis `deploy.sh`).

## Principe

En mode standalone sur une seule IP : SMB, qui écoute sur le port 445 en TCP brut et
**sans SNI**, ne se route pas par domaine. D'où un démon `smbd` unique, avec un partage
`[<id>]` par tenant sur `${OC_DATA_ROOT}/tenants/<id>/share`.

Les fichiers sont forcés sur le compte de service OpenCapture (`$APP_UID`/`$APP_GID`),
ce qui les rend lisibles **et** supprimables par le fs-watcher. Détail du design dans
`install/docker/host/smb/README.md` ; même esprit que le [SFTP](05-sftp-server.md).

## Point de départ

Lancer ces commandes **depuis la racine du dépôt**, là où le `git pull` a été fait. À
noter : sous `sudo`, `~` vaut `/root` — ne pas utiliser `~/opencapture_docker`, `$PWD`
est sûr.

```bash
REPO="$PWD"
```

Reprendre l'uid, le gid et le nom du compte de service depuis le `.env` **global** ; la
valeur par défaut est 1000 :

```bash
APP_UID="$(grep -m1 '^APP_UID='  "$REPO/install/docker/.env" | cut -d= -f2)";  APP_UID="${APP_UID:-1000}"
APP_GID="$(grep -m1 '^APP_GID='  "$REPO/install/docker/.env" | cut -d= -f2)";  APP_GID="${APP_GID:-1000}"
APP_USER="$(grep -m1 '^APP_USER=' "$REPO/install/docker/.env" | cut -d= -f2)"; APP_USER="${APP_USER:-opencapture}"
```

## 1. Paquet — Samba

```bash
sudo apt update && sudo apt install -y samba
```

## 2. Compte de service côté hôte

C'est ce que `force user` visera. Ce qui compte, c'est le **numéro** : `force user`
désignera le nom qui **porte** `APP_UID`/`APP_GID`, que `new-smb-account.sh` dérive de
l'uid. Ce nom peut donc différer de `$APP_USER`.

La logique suit le numéro : si l'uid ou le gid est déjà porté par un autre nom, celui-ci
est réutilisé ; sinon le compte est créé au nom du `.env`. L'identité d'authentification
des tenants est un sujet distinct, traité à l'étape 7.

```bash
getent group  "$APP_GID" >/dev/null || sudo groupadd -g "$APP_GID" "$APP_USER"
getent passwd "$APP_UID" >/dev/null || \
    sudo useradd -r -M -u "$APP_UID" -g "$APP_GID" -s /usr/sbin/nologin "$APP_USER"
```

Vérifier le nom réel derrière l'uid et le gid, celui que `force user` utilisera :

```bash
getent passwd "$APP_UID"; getent group "$APP_GID"
```

## 3. Configuration

Celle du dépôt — copie, ou lien symbolique pour un lien vif :

```bash
sudo cp "$REPO/install/docker/host/smb/smb.conf" /etc/samba/smb.conf
# sudo ln -sf "$REPO/install/docker/host/smb/smb.conf" /etc/samba/smb.conf
```

Créer le fichier des sections tenants, vide au départ et rempli par
`new-smb-account.sh`. Un `include` pointant un fichier absent n'est pas fatal, mais
autant éviter l'avertissement.

```bash
sudo touch /etc/samba/oc-shares.conf
sudo mkdir -p /var/log/samba
```

## 4. Mappage du groupe primaire (« Domain Users »)

À faire **une fois par serveur**, après l'étape 3 : la commande lit le SID local dans
`/etc/samba/smb.conf`, et la table produite (`group_mapping.tdb`) est globale et
persistante — les comptes tenants créés ensuite en héritent sans rien à rejouer.

`smbpasswd -a` attribue à chaque compte SMB le groupe primaire « Domain Users »
(RID 513). Sans correspondance vers un groupe Unix, `smbd` ne peut pas construire le
jeton d'accès : **l'authentification réussit**, mais la connexion au partage échoue en
`NT_STATUS_NO_SUCH_USER`. Le bloc `idmap config *` de `smb.conf` ne couvre pas ce cas —
il ne s'applique qu'aux domaines *étrangers*, alors que ce SID appartient au domaine
local du serveur standalone.

```bash
getent group smbusers >/dev/null || sudo groupadd -r smbusers
sudo net groupmap add rid=513 ntgroup="Domain Users" unixgroup=smbusers type=domain
```

Vérifier — la sortie ne doit plus être vide :

```bash
sudo net groupmap list
# Domain Users (S-1-5-21-...-513) -> smbusers
```

À noter : `smbusers` n'a aucun rôle sur les fichiers déposés, que `force user`/`force
group` écrivent en `APP_UID:APP_GID`. Ce groupe existe seulement pour donner un gid au
groupe primaire du jeton. Aucun redémarrage n'est nécessaire, et `winbind` n'entre pas
en jeu : `smbd` lit la table directement.

## 5. Pare-feu

Un seul port, NetBIOS restant désactivé :

```bash
sudo ufw allow 445/tcp
```

## 6. Vérifier la configuration puis démarrer

`testparm -s` doit passer sans erreur. Seul `smbd` est nécessaire : `nmbd` est inutile
sans NetBIOS.

```bash
sudo testparm -s
sudo systemctl disable --now nmbd 2>/dev/null || true
sudo systemctl enable  --now smbd
sudo systemctl restart smbd
sudo systemctl status  smbd
```

## 7. Déclarer l'accès SMB d'un tenant

Dans tout ce qui suit, `<id>` est l'identifiant du tenant — celui passé à
`new-tenant.sh`. Il sert à la fois de **nom de partage** (`\\<serveur>\<id>`), de login
SMB et de nom du dossier partagé (`$OC_DATA_ROOT/tenants/<id>/share`) : le tenant doit
donc déjà exister.

Le script crée le compte, ajoute la section et recharge la configuration ; le mot de
passe est demandé. Aucun redémarrage : `smbcontrol all reload-config` recharge à chaud.

```bash
sudo ./install/docker/host/smb/new-smb-account.sh <id>
# ex. : sudo ./install/docker/host/smb/new-smb-account.sh test2
```

## 8. Exploitation

Logs dans `/var/log/samba/log.<machine-client>`, un fichier par poste client.

Test client :

```bash
smbclient //<serveur>/<id> -U <id> -m SMB3
```

Lister les comptes SMB :

```bash
sudo pdbedit -L
```

Supprimer un tenant — penser à retirer aussi la section `[<id>]` de
`/etc/samba/oc-shares.conf` avant le rechargement :

```bash
sudo smbpasswd -x <id> ; sudo userdel <id>
sudo smbcontrol all reload-config
```

### Accès depuis un poste Windows

Le partage n'est pas browsable (`browseable = no`) et NetBIOS est désactivé : il
n'apparaît ni dans « Réseau », ni en tapant `\\<serveur>` seul. Saisir le chemin
complet.

Depuis l'Explorateur (ou Win+R) : `\\<serveur>\<id>`, puis les identifiants `<id>` et
son mot de passe SMB. Si Windows préfixe un domaine, forcer le compte local du serveur
avec `.\<id>`.

Lecteur réseau persistant, en invite de commandes sur le poste :

```
net use U: \\<serveur>\<id> /user:<id> * /persistent:yes
```

Le `*` fait demander le mot de passe au lieu de l'inscrire dans l'historique. Vérifier
avec `net use`, démonter avec `net use U: /delete`.

Pas d'accès anonyme (`map to guest = never`) et chiffrement SMB3 obligatoire — natif
sur Windows 10/11 et Server 2016+, rien à activer côté poste.

Les fichiers ne sont traités que déposés dans les sous-dossiers surveillés :
`entrant\verifier\default` (ou `ocr_only`, `default_mail`) et
`entrant\splitter\default`.

En cas d'échec avec « Multiple connections … using more than one user name », il s'agit
de la limite Windows d'une seule identité par serveur SMB : voir le dépannage dans
`install/docker/host/smb/README.md`.

### Domaines clients

Prévoir un alias DNS (A ou CNAME) par domaine, pointant vers l'IP du serveur. Le client
monte `\\<domaine>\<id>` ; c'est le **nom de partage** qui permet au serveur de
distinguer les tenants.
