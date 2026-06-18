#!/usr/bin/env bash
# Serveur SFTP MULTI-TENANT (ProFTPD mod_sftp) — install + exploitation.
# Référence à copier-coller (ne PAS exécuter d'un bloc). Données hôte hors repo.
#
# Mode SFTP uniquement : sur un serveur à 1 IP, on ne peut pas servir un cert
# FTPS par tenant (il faudrait du SNI, non fiable sur ProFTPD). Le SFTP n'a pas
# de cert de domaine (clé d'hôte SSH unique, TOFU) -> multi-tenant trivial.
# Comptes virtuels chrootés sur /opt/tenants/<id>/share, mappés sur le compte
# de service OpenCapture ($APP_UID/$APP_GID). Détail : ftp/README.md.
#
# Prérequis : infra installée (01) ; tenants créés (new-tenant.sh + deploy.sh).

REPO=~/opencapture_docker          # adapte au chemin réel du clone
cd "$REPO"

# ----------------------------------------------------------------------
# 1) Paquet — ProFTPD
# ----------------------------------------------------------------------
sudo apt update && sudo apt install -y proftpd-core

# Activer mod_sftp (souvent commenté par défaut) ; vérifier qu'il est chargé :
sudo sed -i 's/^# *LoadModule mod_sftp.c/LoadModule mod_sftp.c/' /etc/proftpd/modules.conf
grep -E 'mod_sftp\.c' /etc/proftpd/modules.conf

# ----------------------------------------------------------------------
# 2) Arborescence /etc/proftpd
# ----------------------------------------------------------------------
sudo mkdir -p /etc/proftpd/sftp/authorized_keys
sudo mkdir -p /var/log/proftpd

# Config = celle du dépôt (copie ; ou symlink si tu préfères un lien vif)
sudo cp "$REPO/ftp/proftpd.conf" /etc/proftpd/proftpd.conf
# sudo ln -sf "$REPO/ftp/proftpd.conf" /etc/proftpd/proftpd.conf

# Fichier des comptes virtuels (vide au départ ; rempli par new-ftp-tenant.sh)
sudo touch /etc/proftpd/ftpd.passwd && sudo chmod 600 /etc/proftpd/ftpd.passwd

# ----------------------------------------------------------------------
# 3) Clés d'hôte SSH du service SFTP (partagées par tous les tenants)
# ----------------------------------------------------------------------
sudo ssh-keygen -t rsa     -b 4096 -f /etc/proftpd/sftp/ssh_host_rsa_key     -N '' -q
sudo ssh-keygen -t ed25519        -f /etc/proftpd/sftp/ssh_host_ed25519_key -N '' -q
sudo chmod 600 /etc/proftpd/sftp/ssh_host_*_key

# ----------------------------------------------------------------------
# 4) Pare-feu — un seul port (SFTP)
# ----------------------------------------------------------------------
# sudo ufw allow 2222/tcp
# (Pour utiliser le port 22 standard à la place : changer Port dans
#  ftp/proftpd.conf ET restreindre le sshd admin à une autre IP/port — sensible.)

# ----------------------------------------------------------------------
# 5) Vérifier la conf puis démarrer ProFTPD
# ----------------------------------------------------------------------
sudo proftpd -t                                  # DOIT passer (sinon mod_sftp pas chargé ?)
sudo systemctl enable --now proftpd
sudo systemctl status proftpd
# Sans systemd : sudo proftpd  /  recharger : sudo pkill -HUP proftpd

# ----------------------------------------------------------------------
# 6) Déclarer l'accès SFTP d'un tenant
# ----------------------------------------------------------------------
# sudo ./new-ftp-tenant.sh <id>     # crée le compte virtuel chrooté (demande le mdp)
# ex. : sudo ./new-ftp-tenant.sh test2
#   -> aucun reload : ftpd.passwd est relu à chaque connexion.

# ----------------------------------------------------------------------
# 7) Exploitation
# ----------------------------------------------------------------------
# Logs : /var/log/proftpd/{proftpd.log,sftp.log}
# Test client (depuis un poste) :  sftp -P 2222 <id>@<serveur>
# Supprimer un tenant :
#   sudo ftpasswd --passwd --file=/etc/proftpd/ftpd.passwd --delete-user --name=<id>
#   (pas de reload nécessaire)
# Clé publique (au lieu du mdp) : déposer la clé du client dans
#   /etc/proftpd/sftp/authorized_keys/<id>
