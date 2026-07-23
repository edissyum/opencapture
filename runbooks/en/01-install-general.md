#!/usr/bin/env bash
# GENERAL installation — shared infra (Traefik, network, backend image).
# Copy-paste reference (do NOT run as a block). To be completed with your
# own system commands. Host data kept outside the repo, under /opt.

# ----------------------------------------------------------------------
# System prerequisites — Docker Engine + Compose v2 (Debian)
# ----------------------------------------------------------------------

# If you are root, create an edissyum account
useradd -m -s /bin/bash -G sudo edissyum
passwd edissyum

# From now on, log in as edissyum

# ===================== OC_DATA_ROOT: THE authoritative variable =====================
# THE single root of all data kept outside the repo. It is the ONLY value to decide
# per server; everything derives from it (the global .env below, the directory tree,
# Traefik, each tenant's .env via new-tenant.sh, the containers' volumes). ADAPT it
# to the server before continuing (prod: /opt/edissyum/opencapture; e.g. VM:
# /var/edissyum/opencapture).
# NB: docker compose prefers this EXPORTED variable over the .env -> keep it
# exported in the session (hence the source below).
echo 'export OC_DATA_ROOT=/opt/edissyum/opencapture' >> ~/.bashrc
source ~/.bashrc

# Set your preferred editor: nano, vi, ...
echo 'export EDITOR=nano' >> ~/.bashrc
source ~/.bashrc 

# Purge any old Docker packages
sudo apt remove docker.io docker-compose docker-doc podman-docker containerd runc
# Dependencies (git included for the clone further below)
sudo apt update && sudo apt install -y ca-certificates curl gnupg lsb-release git curl gpg sshpass python3
# To get times in the local timezone, install these 2 packages — explained in the guide, logs section
# Useful because Docker normalizes all timestamps to UTC => docker logs -t is stuck in UTC 
sudo apt install moreutils jq 

# Official Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Official Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/debian $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Docker Engine + CLI + Compose v2
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Enable + start on boot
sudo systemctl enable --now docker

# Verify
systemctl status docker
sudo docker run hello-world

# Docker without sudo (then LOG OUT/LOG BACK IN, and test: docker ps)
sudo usermod -aG docker $USER

# ----------------------------------------------------------------------
# OpenCapture — shared infra
# ----------------------------------------------------------------------

# Sources (remember to create a GitHub token to use as the password)
git clone -b docker_claude1 https://github.com/edissyum/opencapture_docker/
cd opencapture_docker


# Data directory tree outside the repo (per tenant + shared)
sudo mkdir -p "$OC_DATA_ROOT/tenants"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/ai-models"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/dynamic"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/certs"
sudo mkdir -p "$OC_DATA_ROOT/shared-by-tenants/traefik/letsencrypt"
# Data owned by the current user (= APP_UID below) -> writable
# (avoids "tenants/ is owned by root, write refused" during manual drops/imports).
sudo chown -R "$(id -u):$(id -g)" "$OC_DATA_ROOT"

# Shared Docker network (Traefik <-> tenant frontends)
docker network create frontend

# Shared backend image (built only once for all tenants)
# IMPORTANT: APP_UID/APP_GID from the GLOBAL .env = the uid baked into the image (/app = HOME
# of the service account). ALL tenants must run under this same uid, otherwise
# /app is not writable for them (matplotlib/fontconfig errors).
# -> new-tenant.sh reuses these values; for a manual creation, align
#    stub-tenants/<id>/.env (see runbooks 02/03/04). So set APP_UID BEFORE this build.
cp .env.example .env
# Carry over OC_DATA_ROOT + align APP_UID/APP_GID with the current user.
# NUMERIC values via id -u / id -g (baked into the shared image) — definitely
# NOT $USER (a name, not a uid). Edit the rest of the .env if needed (ports…).
sed -i "s#^OC_DATA_ROOT=.*#OC_DATA_ROOT=$OC_DATA_ROOT#" .env
sed -i -e "s/^APP_UID=.*/APP_UID=$(id -u)/" -e "s/^APP_GID=.*/APP_GID=$(id -g)/" .env
docker compose --project-directory infra -f infra/docker-compose.yml build backend

# Shared Traefik (single daemon). Reads OC_DATA_ROOT + LETSENCRYPT_EMAIL from the
# .env (via the infra/.env -> ../.env symlink): NO inline prefix, otherwise an
# empty $OC_DATA_ROOT would override the .env value -> falling back to ../data.
# (For Let's Encrypt: set LETSENCRYPT_EMAIL in the .env.)
docker compose -f infra/docker-compose.traefik-server.yml up -d

# Verify Traefik (container + local dashboard on 127.0.0.1:8081)
docker ps --filter name=opencapture_traefik
# curl -s http://127.0.0.1:8081/api/rawdata | head

# Traefik logs / restart
docker logs -f opencapture_traefik
docker compose -f infra/docker-compose.traefik-server.yml restart

# Multi-tenant SFTP -> runbooks/en/05-sftp-server.md
# (ProFTPD mod_sftp, chrooted virtual accounts mapped to $APP_UID/$APP_GID;
#  see infra-host/sftp/README.md). To be done after creating the tenants.
#
# Multi-tenant SMB/Samba -> runbooks/en/07-smb-server.md
# (standalone Samba, local accounts + [<id>] share forced to $APP_UID/$APP_GID;
#  see infra-host/smb/README.md). To be done after creating the tenants.
