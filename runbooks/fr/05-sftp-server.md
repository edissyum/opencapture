# Serveur SFTP multi-tenant (ProFTPD mod_sftp) — installation et exploitation

Commandes à copier-coller, à ne **pas** exécuter d'un bloc. Les données de l'hôte
vivent hors du dépôt.

Prérequis : infra installée (voir [01](01-install-general.md)) et tenants créés
(`new-tenant.sh` puis `deploy.sh`).

## Pourquoi SFTP et pas FTPS

Sur un serveur à une seule IP, il est impossible de servir un certificat FTPS par
tenant : il faudrait du SNI, peu fiable sur ProFTPD. Le SFTP, lui, n'utilise pas de
certificat de domaine — une clé d'hôte SSH unique, en TOFU — ce qui rend le
multi-tenant trivial.

Les comptes sont virtuels et chrootés sur `$OC_DATA_ROOT/tenants/<id>/share`, mappés sur
le compte de service OpenCapture (`$APP_UID`/`$APP_GID`). Détail du design dans
`install/docker/host/sftp/README.md`.

## Point de départ

Lancer ces commandes **depuis la racine du dépôt**, là où le `git pull` a été fait. À
noter : sous `sudo`, `~` vaut `/root` — ne pas utiliser `~/opencapture_docker`, `$PWD`
est sûr.

```bash
REPO="$PWD"
```

## 1. Paquets — ProFTPD et module SFTP

**Attention** : sur Debian (testé sur Debian 13 trixie), `mod_sftp` et `mod_tls` sont
fournis par `proftpd-mod-crypto`, **pas** par `proftpd-core`.

```bash
sudo apt update && sudo apt install -y proftpd-core proftpd-mod-crypto
```

APT démarre déjà ProFTPD sur la configuration Debian par défaut ; il sera redémarré à
l'étape 5, une fois la configuration du dépôt en place.

S'assurer que `mod_sftp` est chargé, en décommentant la ligne au besoin :

```bash
grep -q '^LoadModule mod_sftp.c' /etc/proftpd/modules.conf \
  || sudo sed -i 's/^# *LoadModule mod_sftp.c/LoadModule mod_sftp.c/' /etc/proftpd/modules.conf
```

Vérifier que le DSO existe **et** que la ligne est active :

```bash
ls /usr/lib/proftpd/mod_sftp.so && grep '^LoadModule mod_sftp.c' /etc/proftpd/modules.conf
```

## 2. Arborescence /etc/proftpd

```bash
sudo mkdir -p /etc/proftpd/sftp/authorized_keys
sudo mkdir -p /var/log/proftpd
```

La configuration est celle du dépôt — copie, ou lien symbolique pour un lien vif :

```bash
sudo cp "$REPO/install/docker/host/sftp/proftpd.conf" /etc/proftpd/proftpd.conf
# sudo ln -sf "$REPO/install/docker/host/sftp/proftpd.conf" /etc/proftpd/proftpd.conf
```

Créer le fichier des comptes virtuels, vide au départ et rempli par
`new-sftp-account.sh` :

```bash
sudo touch /etc/proftpd/ftpd.passwd && sudo chmod 600 /etc/proftpd/ftpd.passwd
```

## 3. Clés d'hôte SSH

Partagées par tous les tenants.

```bash
sudo ssh-keygen -t rsa     -b 4096 -f /etc/proftpd/sftp/ssh_host_rsa_key     -N '' -q
sudo ssh-keygen -t ed25519        -f /etc/proftpd/sftp/ssh_host_ed25519_key -N '' -q
sudo chmod 600 /etc/proftpd/sftp/ssh_host_*_key
```

## 4. Pare-feu

Un seul port à ouvrir :

```bash
sudo ufw allow 2222/tcp
```

Pour utiliser le port 22 standard à la place, changer `Port` dans
`install/docker/host/sftp/proftpd.conf` **et** restreindre le sshd d'administration à
une autre IP ou un autre port — opération sensible.

## 5. Vérifier la configuration puis démarrer

`proftpd -t` doit passer ; en cas d'échec, revenir à l'étape 1 sur `mod_sftp`. Le
`restart` est nécessaire pour recharger la configuration du dépôt, APT ayant démarré le
service sur celle par défaut.

```bash
sudo proftpd -t
sudo systemctl enable proftpd
sudo systemctl restart proftpd
sudo systemctl status proftpd
```

Sans systemd : `sudo proftpd` pour démarrer, `sudo pkill -HUP proftpd` pour recharger.

## 6. Déclarer l'accès SFTP d'un tenant

Le script crée le compte virtuel chrooté et demande le mot de passe. Aucun rechargement
n'est nécessaire : `ftpd.passwd` est relu à chaque connexion.

```bash
sudo ./install/docker/host/sftp/new-sftp-account.sh <id>
# ex. : sudo ./install/docker/host/sftp/new-sftp-account.sh test2
```

## 7. Exploitation

Logs dans `/var/log/proftpd/proftpd.log` et `/var/log/proftpd/sftp.log`.

Test client depuis un poste :

```bash
sftp -P 2222 <id>@<serveur>
```

Supprimer un tenant — sans rechargement nécessaire :

```bash
sudo ftpasswd --passwd --file=/etc/proftpd/ftpd.passwd --delete-user --name=<id>
```

Pour une authentification par clé publique plutôt que par mot de passe, déposer la clé
du client dans `/etc/proftpd/sftp/authorized_keys/<id>`.
