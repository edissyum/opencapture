#!/usr/bin/env bash
# MULTI-TENANT WebDAV server (Apache mod_dav) — operations.
# Copy-paste reference (do NOT run as one block). Host data outside the repo.
#
# WebDAV served under https://<fqdn>/dav/: the nginx frontend proxies /dav/ to
# a per-tenant Apache mod_dav container (nginx has no WebDAV module). Path,
# not subdomain -> reuses the existing DNS + cert + Traefik route.
# Root = /opt/edissyum/opencapture/tenants/<id>/share (watched by the fs-watcher); files
# dropped as $APP_UID/$APP_GID. Per-tenant htpasswd Basic auth.
# Design detail: ../infra/webdav/README.md.
#
# Unlike SFTP (05), NOTHING to install on the host: everything is in Docker
# (image built by deploy.sh, webdav service started with the stack).
#
# Prerequisites: infra installed (01); tenant created (new-tenant.sh + deploy.sh).

# ----------------------------------------------------------------------
# 1) Activation (OPT-IN) — WebDAV is NOT in the base stack
#    Add the overlay to the tenant's docker-compose.yml (like Traefik):
#        include:
#            - path: ../../infra/docker-compose.yml
#            - path: ../../infra/docker-compose.traefik-*.yml
#            - path: ../../infra/webdav/docker-compose.yml   # <- enables WebDAV
#    Without this overlay, /dav/ returns 501 "not enabled" (the rest of the site works).
#    The opencapture-webdav image is built by deploy.sh (docker build,
#    INDEPENDENTLY of the backend) as soon as a tenant includes the overlay.
# ----------------------------------------------------------------------
# ./deploy.sh <id>
# # Check that the webdav container is running:
# DIR=stub-tenants/<id>
# docker compose --project-directory "$DIR" -f "$DIR/docker-compose.yml" ps webdav

# ----------------------------------------------------------------------
# 2) Set the login and password (tenant's WebDAV account)
#    Login = 2nd arg (default <id>); password prompted (masked, bcrypt).
#    htpasswd PER tenant, outside the repo: /opt/edissyum/opencapture/tenants/<id>/webdav/htpasswd.
#    NO reload needed (Apache re-reads it on every request). 401 until an account exists.
# ----------------------------------------------------------------------
# sudo ./infra/webdav/new-webdav-account.sh <id>            # login = <id>
# sudo ./infra/webdav/new-webdav-account.sh <id> alice      # dedicated login
#
# # Several accounts per tenant: rerun with a different login.
# sudo ./infra/webdav/new-webdav-account.sh <id> bob
# # Change a password: rerun with the SAME login (overwrites the line).
# sudo ./infra/webdav/new-webdav-account.sh <id> alice
# # Delete an account:
# sudo docker run --rm -v /opt/edissyum/opencapture/tenants/<id>/webdav:/work opencapture-webdav \
#     htpasswd -D /work/htpasswd alice
# # List accounts:
# sudo cut -d: -f1 /opt/edissyum/opencapture/tenants/<id>/webdav/htpasswd
# # Non-interactive variant (automation — /!\ password ends up in shell history):
# sudo docker run --rm -v /opt/edissyum/opencapture/tenants/<id>/webdav:/work opencapture-webdav \
#     htpasswd -B -b /work/htpasswd <login> 'Password'

# ----------------------------------------------------------------------
# 3) Client connection — URL https://<fqdn>/dav/  (login = <id> by default)
# ----------------------------------------------------------------------
# Windows: Explorer -> Map a network drive -> https://<fqdn>/dav/
#           (check "Connect using different credentials"). HTTPS required;
#           WebClient service started:  net start webclient
# macOS   : Finder -> Go -> Connect to Server (Cmd+K) -> https://<fqdn>/dav/
# Linux   : sudo apt install davfs2
#           sudo mount -t davfs https://<fqdn>/dav/ /mnt/oc
#           or Nautilus:  davs://<fqdn>/dav/
#
# Drop into the folders watched by the fs-watcher:
#   - Verifier: entrant/verifier/{default,ocr_only,default_mail}
#   - Splitter: entrant/splitter/default

# ----------------------------------------------------------------------
# 4) Operations
# ----------------------------------------------------------------------
# DIR=stub-tenants/<id>
# DC="docker compose --project-directory $DIR -f $DIR/docker-compose.yml"
# $DC ps webdav                 # container status
# $DC logs -f webdav            # Apache logs (access + errors -> stdout/stderr)
# # After changing infra/webdav/httpd.conf or the Dockerfile:
# ./deploy.sh --backend-only <id>   # rebuilds the shared images (including webdav)
# ./deploy.sh --no-build <id>       # or just recreate the containers

# ----------------------------------------------------------------------
# 5) Troubleshooting
# ----------------------------------------------------------------------
# 401 (with an account)  : wrong login/password -> check the htpasswd.
# 500                    : htpasswd missing (AuthUserFile) -> new-webdav-account.sh.
# 502                    : webdav container stopped -> $DC ps webdav ; $DC logs webdav.
# files not processed    : dropped outside the entrant/... folders; or fs-watcher
#                          needs a restart.
# files not removed      : wrong uid -> the webdav container must run as
#                          APP_UID (see user: in the compose):  $DC exec webdav id

# ----------------------------------------------------------------------
# 6) Quick test (curl)
# ----------------------------------------------------------------------
# curl -ksI -u <id>:<pwd> https://<fqdn>/dav/ | grep -i '^DAV:'      # -> DAV: 1,2
# curl -ks  -u <id>:<pwd> -X PROPFIND -H 'Depth: 1' https://<fqdn>/dav/
# curl -ks  -u <id>:<pwd> -T facture.pdf https://<fqdn>/dav/entrant/verifier/default/facture.pdf
