#!/usr/bin/env bash
# Installation GÉNÉRALE — infra partagée (Traefik, réseau, image backend).
# Référence à copier-coller (ne PAS exécuter d'un bloc). À compléter avec tes
# commandes système. Données hôte hors repo sous /opt.

# Prérequis système (à compléter)
# TODO: docker + docker compose (v2.20+), git

# Sources
git clone git@github.com:edissyum/opencapture_docker.git
cd opencapture_docker

# Arborescence des données hors repo (par tenant + partagé)
sudo mkdir -p /opt/tenants
sudo mkdir -p /opt/shared-by-tenants/shared-ai-models
sudo mkdir -p /opt/shared-by-tenants/traefik/dynamic
sudo mkdir -p /opt/shared-by-tenants/traefik/certs
sudo mkdir -p /opt/shared-by-tenants/traefik/letsencrypt

# Réseau Docker partagé (Traefik <-> frontends des tenants)
docker network create frontend

# Image backend partagée (construite une seule fois pour tous les tenants)
docker compose --project-directory infra -f infra/docker-compose.yml build backend

# Traefik partagé (daemon unique) — data sur /opt
OC_DYNAMIC_PATH=/opt/shared-by-tenants/traefik/dynamic \
OC_CERTS_PATH=/opt/shared-by-tenants/traefik/certs \
LETSENCRYPT_PATH=/opt/shared-by-tenants/traefik/letsencrypt \
LETSENCRYPT_EMAIL=admin@edissyum.com \
docker compose -f infra/docker-compose.traefik-server.yml up -d

# Vérifier Traefik (conteneur + dashboard local 127.0.0.1:8081)
docker ps --filter name=opencapture_traefik
# curl -s http://127.0.0.1:8081/api/rawdata | head

# Logs / redémarrage Traefik
docker logs -f opencapture_traefik
docker compose -f infra/docker-compose.traefik-server.yml restart

# FTP (plus tard)
# TODO: install + config FTP
