# Image WebDAV par tenant — Apache httpd + mod_dav.
#
# Sert /data (= le `share` du tenant, monté en volume) en WebDAV sous /dav,
# protégé par Basic auth (htpasswd monté en lecture seule dans /conf). Le
# conteneur tourne en uid NON-ROOT (le compose impose `user: APP_UID:APP_GID`)
# -> les fichiers déposés sont possédés par le compte de service OpenCapture,
# donc lisibles ET supprimables par le fs-watcher (même logique que mod_sftp).
#
# Image PARTAGÉE (opencapture-webdav) : la config est identique pour tous les
# tenants ; les différences (share, htpasswd) viennent des bind-mounts du
# compose. Construite UNE fois (cf. deploy.sh), comme opencapture-backend.
#
# Contexte de build = racine du dépôt (cf. infra/webdav/docker-compose.yml et
# deploy.sh) -> le COPY ci-dessous part de la racine.
FROM httpd:2.4-alpine

# mod_dav_fs a besoin d'un pilote DBM (APR-util) pour sa base de verrous WebDAV
# (DavLockDB). L'image httpd:alpine n'en embarque AUCUN (apr-util-1 ne contient
# que crypto + ldap) -> sans ça, PUT/LOCK échouent en 500 avec
#   "AH00576: The DBM driver could not be loaded".
# gdbm = pilote DBM par défaut d'APR-util sur Alpine.
RUN apk add --no-cache apr-util-dbm_gdbm

# Notre config remplace entièrement celle de l'image (rootless, mod_dav, auth).
COPY infra/webdav/httpd.conf /usr/local/apache2/conf/httpd.conf

# httpd écoute en 8080 : un uid non-root ne peut pas binder un port < 1024.
# Le frontend nginx proxifie /dav/ vers webdav:8080 (réseau interne).
EXPOSE 8080

# CMD hérité de l'image httpd : ["httpd-foreground"].
