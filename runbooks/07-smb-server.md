#!/usr/bin/env bash
# Serveur SMB MULTI-TENANT (Samba, standalone) — install + exploitation.
# Référence à copier-coller (ne PAS exécuter d'un bloc). Données hôte hors repo.
#
# Mode standalone, 1 IP : SMB (445, TCP brut, SANS SNI) ne se route pas par
# domaine -> UN SEUL démon smbd, un partage [<id>] par tenant sur
# ${OC_DATA_ROOT}/tenants/<id>/share, fichiers forcés sur le compte de service OpenCapture
# ($APP_UID/$APP_GID) -> lisibles ET supprimables par le fs-watcher. Détail :
# infra-host/smb/README.md. (Même esprit que le SFTP : runbooks/05-sftp-server.md.)
#
# Prérequis : infra installée (01) ; tenants créés (new-tenant.sh + deploy.sh).

# Lance ces commandes DEPUIS LA RACINE DU DÉPÔT (là où tu as fait git pull).
# NB : en sudo, `~` = /root -> n'utilise PAS ~/opencapture_docker. $PWD est sûr.
REPO="$PWD"

# uid/gid/nom du compte de service OpenCapture (depuis le .env racine ; défaut 1050).
APP_UID="$(grep -m1 '^APP_UID='  "$REPO/.env" | cut -d= -f2)";  APP_UID="${APP_UID:-1050}"
APP_GID="$(grep -m1 '^APP_GID='  "$REPO/.env" | cut -d= -f2)";  APP_GID="${APP_GID:-1050}"
APP_USER="$(grep -m1 '^APP_USER=' "$REPO/.env" | cut -d= -f2)"; APP_USER="${APP_USER:-opencapture}"

# ----------------------------------------------------------------------
# 1) Paquet — Samba
# ----------------------------------------------------------------------
sudo apt update && sudo apt install -y samba

# ----------------------------------------------------------------------
# 2) Compte de service côté HÔTE (ce que `force user` visera)
#    Ce qui compte, c'est le NUMÉRO : `force user` désignera le NOM qui PORTE
#    APP_UID/APP_GID (new-smb-account.sh le dérive de l'UID). Le nom peut donc
#    différer de $APP_USER. -> On garde sur le NUMÉRO : si l'UID/GID est déjà
#    porté par un autre nom, on RÉUTILISE ; sinon on crée au nom du .env.
#    (Identité d'auth des tenants à part, étape 6.)
# ----------------------------------------------------------------------
getent group  "$APP_GID" >/dev/null || sudo groupadd -g "$APP_GID" "$APP_USER"
getent passwd "$APP_UID" >/dev/null || \
    sudo useradd -r -M -u "$APP_UID" -g "$APP_GID" -s /usr/sbin/nologin "$APP_USER"
# Nom réel derrière l'UID/GID (= ce que `force user` utilisera) :
getent passwd "$APP_UID"; getent group "$APP_GID"

# ----------------------------------------------------------------------
# 3) Config = celle du dépôt (copie ; ou symlink si tu préfères un lien vif)
# ----------------------------------------------------------------------
sudo cp "$REPO/infra-host/smb/smb.conf" /etc/samba/smb.conf
# sudo ln -sf "$REPO/infra-host/smb/smb.conf" /etc/samba/smb.conf

# Fichier des sections tenants (vide au départ ; rempli par new-smb-account.sh).
# `include` d'un fichier absent n'est pas fatal, mais on évite l'avertissement.
sudo touch /etc/samba/oc-shares.conf
sudo mkdir -p /var/log/samba

# ----------------------------------------------------------------------
# 4) Pare-feu — un seul port (SMB sur 445 ; NetBIOS désactivé)
# ----------------------------------------------------------------------
# sudo ufw allow 445/tcp

# ----------------------------------------------------------------------
# 5) Vérifier la conf puis démarrer Samba (smbd seul ; nmbd inutile sans NetBIOS)
# ----------------------------------------------------------------------
sudo testparm -s                                 # DOIT passer sans erreur
sudo systemctl disable --now nmbd 2>/dev/null || true
sudo systemctl enable  --now smbd
sudo systemctl restart smbd
sudo systemctl status  smbd

# ----------------------------------------------------------------------
# 6) Déclarer l'accès SMB d'un tenant
# ----------------------------------------------------------------------
# sudo ./new-smb-account.sh <id>    # crée compte + section + reload (demande le mdp)
# ex. : sudo ./new-smb-account.sh test2
#   -> pas de restart : `smbcontrol all reload-config` recharge la conf à chaud.

# ----------------------------------------------------------------------
# 7) Exploitation
# ----------------------------------------------------------------------
# Logs : /var/log/samba/log.<machine-client>
# Test client :   smbclient //<serveur>/<id> -U <id> -m SMB3
# Lister les comptes SMB :   sudo pdbedit -L
# Supprimer un tenant :
#   sudo smbpasswd -x <id> ; sudo userdel <id>
#   (retirer la section [<id>] de /etc/samba/oc-shares.conf, puis reload)
#   sudo smbcontrol all reload-config
#
# Domaines clients : 1 alias DNS (A/CNAME) par domaine -> l'IP du serveur.
# Le client monte \\<domaine>\<id> ; le serveur distingue par le NOM DE PARTAGE.
