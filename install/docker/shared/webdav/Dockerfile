# Per-tenant WebDAV image — Apache httpd + mod_dav.
#
# Serves /data (= the tenant's `share`, mounted as a volume) over WebDAV
# under /dav, protected by Basic auth (htpasswd mounted read-only into
# /conf). The container runs as a NON-ROOT uid (the compose file enforces
# `user: APP_UID:APP_GID`) -> files dropped in are owned by the
# OpenCapture service account, so they're readable AND removable by the
# fs-watcher (same logic as mod_sftp).
#
# SHARED image (opencapture-webdav): the config is identical for every
# tenant; the differences (share, htpasswd) come from the compose file's
# bind mounts. Built ONCE (see deploy.sh), like opencapture-backend.
#
# Build context = repo root (see install/docker/shared/webdav/docker-compose.yml and
# deploy.sh) -> the COPY below starts from the root.
FROM httpd:2.4-alpine

# mod_dav_fs needs a DBM driver (APR-util) for its WebDAV lock database
# (DavLockDB). The httpd:alpine image ships NONE (apr-util-1 only
# contains crypto + ldap) -> without this, PUT/LOCK fail with a 500:
#   "AH00576: The DBM driver could not be loaded".
# gdbm = APR-util's default DBM driver on Alpine.
RUN apk add --no-cache apr-util-dbm_gdbm

# Our config entirely replaces the image's (rootless, mod_dav, auth).
COPY install/docker/shared/webdav/httpd.conf /usr/local/apache2/conf/httpd.conf

# httpd listens on 8080: a non-root uid can't bind a port below 1024.
# The nginx frontend proxies /dav/ to webdav:8080 (internal network).
EXPOSE 8080

# CMD inherited from the httpd image: ["httpd-foreground"].
