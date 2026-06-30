#!/usr/bin/env bash
# Installation GÉNÉRALE — infra partagée (Traefik, réseau, image backend).
# Référence à copier-coller (ne PAS exécuter d'un bloc). À compléter avec tes
# commandes système. Données hôte hors repo sous /opt.

# ----------------------------------------------------------------------
# Prérequis système — Docker Engine + Compose v2 (Debian)
# ----------------------------------------------------------------------

# Si on est en root créer un compte edissyum
useradd -m -s /bin/bash -G sudo edissyum
passwd edissyum

# Se connecter à partir de maintenant en edissyum

# Racine des données hors repo — UNE variable (à reporter dans le .env : OC_DATA_ROOT).
echo 'export OC_DATA_ROOT=/opt/edissyum/opencapture' >> ~/.bashrc
source ~/.bashrc

# Purger d'éventuels anciens paquets Docker
sudo apt remove docker.io docker-compose docker-doc podman-docker containerd runc
# Dépendances (git inclus pour le clone plus bas)
sudo apt update && sudo apt install -y ca-certificates curl gnupg lsb-release git curl gpg 
# Pour avoir les heures selon le timezone on isntalle ces 2 paquets explications dans guide section logs
# Utile car Docker normalise tous les timestamps en UTC => docker logs -t est figé en UTC 
sudo apt install moreutils jq 

# Clé GPG officielle Docker
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Dépôt officiel Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engine + CLI + Compose v2
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Activer + démarrer au boot
sudo systemctl enable --now docker

# Vérifier
systemctl status docker
sudo docker run hello-world

# Docker sans sudo (puis SE DÉCONNECTER/RECONNECTER, et tester : docker ps)
sudo usermod -aG docker $USER

# ----------------------------------------------------------------------
# OpenCapture — infra partagée
# ----------------------------------------------------------------------

# Sources (penser à créer un jeton côté github pour le mot de passe)
git clone -b docker_claude1 https://github.com/edissyum/opencapture_docker/
cd opencapture_docker


# Arborescence des données hors repo (par tenant + partagé)
sudo mkdir -p "$OC_DATA_ROOT/tenants"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/shared-ai-models"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/dynamic"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/certs"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/letsencrypt"
# Données possédées par l'utilisateur courant (= APP_UID ci-dessous) -> écriture
# OK (évite "tenants/ est root, écriture refusée" lors des dépôts/imports manuels).
sudo chown -R "$(id -u):$(id -g)" "$OC_DATA_ROOT"

# Réseau Docker partagé (Traefik <-> frontends des tenants)
docker network create frontend

# Image backend partagée (construite une seule fois pour tous les tenants)
# IMPORTANT : APP_UID/APP_GID du .env GLOBAL = uid baké dans l'image (/app = HOME
# du compte de service). TOUS les tenants doivent tourner avec ce même uid, sinon
# /app n'est pas inscriptible pour eux (matplotlib/fontconfig en erreur).
# -> new-tenant.sh reprend ces valeurs ; en création manuelle, aligner le
#    stub-tenants/<id>/.env (cf. runbooks 02/03/04). Définis donc APP_UID AVANT ce build.
cp .env.example .env
# Reporter OC_DATA_ROOT + aligner APP_UID/APP_GID sur l'utilisateur courant.
# Valeurs NUMÉRIQUES via id -u / id -g (baké dans l'image partagée) — surtout
# PAS $USER (un nom, pas un uid). Édite le reste du .env si besoin (ports…).
sed -i "s#^OC_DATA_ROOT=.*#OC_DATA_ROOT=$OC_DATA_ROOT#" .env
sed -i -e "s/^APP_UID=.*/APP_UID=$(id -u)/" -e "s/^APP_GID=.*/APP_GID=$(id -g)/" .env
docker compose --project-directory infra -f infra/docker-compose.yml build backend

# Traefik partagé (daemon unique). Lit OC_DATA_ROOT + LETSENCRYPT_EMAIL depuis le
# .env (via le symlink infra/.env -> ../.env) : PAS de préfixe inline, sinon un
# $OC_DATA_ROOT vide écraserait la valeur du .env -> retombée sur ../data.
# (Pour Let's Encrypt : renseigne LETSENCRYPT_EMAIL dans le .env.)
docker compose -f infra/docker-compose.traefik-server.yml up -d

# Vérifier Traefik (conteneur + dashboard local 127.0.0.1:8081)
docker ps --filter name=opencapture_traefik
# curl -s http://127.0.0.1:8081/api/rawdata | head

# Logs / redémarrage Traefik
docker logs -f opencapture_traefik
docker compose -f infra/docker-compose.traefik-server.yml restart

# SFTP multi-tenant -> runbooks/05-sftp-server.sh
# (ProFTPD mod_sftp, comptes virtuels chrootés mappés sur $APP_UID/$APP_GID ;
#  voir infra-host/sftp/README.md). À faire après avoir créé les tenants.
#
# SMB/Samba multi-tenant -> runbooks/07-smb-server.sh
# (Samba standalone, comptes locaux + partage [<id>] forcé sur $APP_UID/$APP_GID ;
#  voir infra-host/smb/README.md). À faire après avoir créé les tenants.
