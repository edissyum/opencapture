#!/usr/bin/env bash
# Serveur WebDAV MULTI-TENANT (Apache mod_dav) — exploitation.
# Référence à copier-coller (ne PAS exécuter d'un bloc). Données hôte hors repo.
#
# WebDAV servi sous https://<fqdn>/dav/ : le frontend nginx proxifie /dav/ vers
# un conteneur Apache mod_dav PAR tenant (nginx n'a pas de module WebDAV). Path
# et pas sous-domaine -> réutilise le DNS + le cert + la route Traefik existants.
# Racine = /opt/edissyum/opencapture/tenants/<id>/share (surveillé par le fs-watcher) ; fichiers
# déposés en $APP_UID/$APP_GID. Auth Basic htpasswd par tenant.
# Détail du design : ../infra/webdav/README.md.
#
# Contrairement au SFTP (05), RIEN à installer sur l'hôte : tout est dans Docker
# (image construite par deploy.sh, service webdav démarré avec la stack).
#
# Prérequis : infra installée (01) ; tenant créé (new-tenant.sh + deploy.sh).

# ----------------------------------------------------------------------
# 1) Activation (OPT-IN) — le WebDAV n'est PAS dans la stack de base
#    Ajouter l'overlay dans le docker-compose.yml du tenant (comme Traefik) :
#        include:
#            - path: ../../infra/docker-compose.yml
#            - path: ../../infra/docker-compose.traefik-*.yml
#            - path: ../../infra/webdav/docker-compose.yml   # <- active le WebDAV
#    Sans cet overlay, /dav/ renvoie 501 « non activé » (le reste du site marche).
#    L'image opencapture-webdav est construite par deploy.sh (docker build,
#    INDÉPENDAMMENT du backend) dès qu'un tenant inclut l'overlay.
# ----------------------------------------------------------------------
# ./deploy.sh <id>
# # Vérifier que le conteneur webdav tourne :
# DIR=stub-tenants/<id>
# docker compose --project-directory "$DIR" -f "$DIR/docker-compose.yml" ps webdav

# ----------------------------------------------------------------------
# 2) Définir le login et le mot de passe (compte WebDAV du tenant)
#    Login = 2e arg (défaut <id>) ; mot de passe demandé (masqué, bcrypt).
#    htpasswd PAR tenant, hors dépôt : /opt/edissyum/opencapture/tenants/<id>/webdav/htpasswd.
#    AUCUN reload (Apache relit à chaque requête). 401 tant qu'aucun compte.
# ----------------------------------------------------------------------
# sudo ./infra/webdav/new-webdav-account.sh <id>            # login = <id>
# sudo ./infra/webdav/new-webdav-account.sh <id> alice      # login dédié
#
# # Plusieurs comptes par tenant : relancer avec un autre login.
# sudo ./infra/webdav/new-webdav-account.sh <id> bob
# # Changer un mot de passe : relancer avec le MÊME login (écrase la ligne).
# sudo ./infra/webdav/new-webdav-account.sh <id> alice
# # Supprimer un compte :
# sudo docker run --rm -v /opt/edissyum/opencapture/tenants/<id>/webdav:/work opencapture-webdav \
#     htpasswd -D /work/htpasswd alice
# # Lister les comptes :
# sudo cut -d: -f1 /opt/edissyum/opencapture/tenants/<id>/webdav/htpasswd
# # Variante non-interactive (automatisation — /!\ mdp dans l'historique shell) :
# sudo docker run --rm -v /opt/edissyum/opencapture/tenants/<id>/webdav:/work opencapture-webdav \
#     htpasswd -B -b /work/htpasswd <login> 'MotDePasse'

# ----------------------------------------------------------------------
# 3) Connexion client — URL https://<fqdn>/dav/  (login = <id> par défaut)
# ----------------------------------------------------------------------
# Windows : Explorateur -> Connecter un lecteur réseau -> https://<fqdn>/dav/
#           (cocher « se connecter avec d'autres identifiants »). HTTPS requis ;
#           service WebClient démarré :  net start webclient
# macOS   : Finder -> Aller -> Se connecter au serveur (Cmd+K) -> https://<fqdn>/dav/
# Linux   : sudo apt install davfs2
#           sudo mount -t davfs https://<fqdn>/dav/ /mnt/oc
#           ou Nautilus :  davs://<fqdn>/dav/
#
# Déposer dans les dossiers surveillés par le fs-watcher :
#   - Verifier : entrant/verifier/{default,ocr_only,default_mail}
#   - Splitter : entrant/splitter/default

# ----------------------------------------------------------------------
# 4) Exploitation
# ----------------------------------------------------------------------
# DIR=stub-tenants/<id>
# DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"
# $DC ps webdav                 # état du conteneur
# $DC logs -f webdav            # logs Apache (accès + erreurs -> stdout/stderr)
# # Après modif de infra/webdav/httpd.conf ou du Dockerfile :
# ./deploy.sh --backend-only <id>   # rebuild des images partagées (dont webdav)
# ./deploy.sh --no-build <id>       # ou juste recréer les conteneurs

# ----------------------------------------------------------------------
# 5) Dépannage
# ----------------------------------------------------------------------
# 401 (avec un compte)   : mauvais login/mot de passe -> vérifier le htpasswd.
# 500                    : htpasswd absent (AuthUserFile) -> new-webdav-account.sh.
# 502                    : conteneur webdav arrêté -> $DC ps webdav ; $DC logs webdav.
# fichiers non traités   : déposés hors des dossiers entrant/... ; ou fs-watcher
#                          à redémarrer.
# fichiers non supprimés : mauvais uid -> le conteneur webdav doit tourner en
#                          APP_UID (cf. user: dans le compose) :  $DC exec webdav id

# ----------------------------------------------------------------------
# 6) Test rapide (curl)
# ----------------------------------------------------------------------
# curl -ksI -u <id>:<pwd> https://<fqdn>/dav/ | grep -i '^DAV:'      # -> DAV: 1,2
# curl -ks  -u <id>:<pwd> -X PROPFIND -H 'Depth: 1' https://<fqdn>/dav/
# curl -ks  -u <id>:<pwd> -T facture.pdf https://<fqdn>/dav/entrant/verifier/default/facture.pdf
