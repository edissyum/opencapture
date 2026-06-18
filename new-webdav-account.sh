#!/usr/bin/env bash
#
# new-webdav-account.sh — crée/complète l'accès WebDAV d'un tenant.
#
# WebDAV par tenant (cf. infra/webdav/README.md) : un conteneur Apache mod_dav
# par stack, branché sur le `share` du tenant (/opt/tenants/<id>/share), exposé
# par le frontend nginx sous https://<fqdn>/dav/. L'authentification est un
# Basic auth htpasswd PAR tenant, hors dépôt, mappé sur le compte de service
# OpenCapture ($APP_UID/$APP_GID). Apache relit le htpasswd à chaque requête
# -> AUCUN reload, ni recréation du conteneur, après ajout d'un compte.
#
# Usage (en root sur le serveur, depuis le dépôt) :
#   sudo ./new-webdav-account.sh <id> [user]
#     <id>   : identifiant du tenant (= dossier /opt/tenants/<id>)
#     [user] : login WebDAV (défaut : <id>)
#   Le mot de passe est demandé interactivement (saisie masquée, bcrypt).
#
# Relancer le script :
#   - avec un AUTRE [user]  -> ajoute un login (plusieurs comptes par tenant) ;
#   - avec le MÊME  [user]  -> change son mot de passe.
# Dans tous les cas : aucun reload (Apache relit le htpasswd à chaque requête).
#
# Prérequis : image opencapture-webdav construite (./deploy.sh la build) ; le
# tenant déployé une fois (le service init crée le squelette de share/).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
IMAGE="opencapture-webdav"

usage() { echo "Usage : sudo $(basename "$0") <id> [user]" >&2; exit 2; }

id="${1:-}"
[ -n "$id" ] || usage
user="${2:-$id}"

# root requis (crée /opt/tenants/<id>/webdav, lance docker, chown).
if [ "$(id -u)" -ne 0 ]; then
    echo "Ce script doit être lancé en root (sudo)." >&2
    exit 2
fi

# Validation de l'id (mêmes règles que new-tenant.sh / new-sftp-account.sh).
case "$id" in
    custom|default|_*|.*|*[!a-z0-9_]*)
        echo "Id invalide : '$id' — minuscules/chiffres/_ uniquement, et != custom/default" >&2
        exit 2 ;;
esac

# Image WebDAV requise : on s'en sert pour hasher le mot de passe (htpasswd),
# sans dépendance apache2-utils sur l'hôte.
if ! docker image inspect "$IMAGE" >/dev/null 2>&1; then
    echo "Image '$IMAGE' absente — construis-la d'abord : ./deploy.sh $id" >&2
    exit 1
fi

# uid/gid = compte de service du TENANT. Le conteneur webdav tourne en APP_UID
# du tenant (son .env) ; le htpasswd (chmod 600) doit lui appartenir, sinon
# Apache ne peut pas le lire. On lit donc le .env du tenant EN PRIORITÉ, puis le
# .env racine, puis défaut 1050. (test1 = 1000 alors que le .env racine = 1050.)
app_uid=""; app_gid=""
for env_file in "$REPO_ROOT/stub-tenants/$id/.env" "$REPO_ROOT/.env"; do
    [ -f "$env_file" ] || continue
    [ -n "$app_uid" ] || app_uid="$(grep -m1 '^APP_UID=' "$env_file" | cut -d= -f2 || true)"
    [ -n "$app_gid" ] || app_gid="$(grep -m1 '^APP_GID=' "$env_file" | cut -d= -f2 || true)"
done
app_uid="${app_uid:-1050}"; app_gid="${app_gid:-1050}"

conf_dir="/opt/tenants/$id/webdav"
htpasswd="$conf_dir/htpasswd"

echo "==> Compte WebDAV '$user' (tenant '$id', uid:gid=$app_uid:$app_gid)"

# Dossier du htpasswd (monté en /conf:ro dans le conteneur webdav).
mkdir -p "$conf_dir"

# Création (-c) si le fichier n'existe pas encore, sinon ajout/màj du compte.
# -B = bcrypt. htpasswd s'exécute dans l'image webdav (pas de paquet hôte).
create_flag=""
[ -f "$htpasswd" ] || create_flag="-c"
echo "    -> mot de passe WebDAV pour '$user' :"
docker run --rm -it -v "$conf_dir":/work "$IMAGE" \
    htpasswd -B $create_flag /work/htpasswd "$user"

# Possédé par le compte de service (cohérence + lisible par Apache en $APP_UID).
chown -R "$app_uid:$app_gid" "$conf_dir"
chmod 600 "$htpasswd"

# FQDN du tenant (pour l'URL) : lu dans son .env si présent.
fqdn="$id"
for env_file in "$REPO_ROOT/stub-tenants/$id/.env" "$REPO_ROOT/.env"; do
    if [ -f "$env_file" ]; then
        v="$(grep -m1 '^OC_FQDN=' "$env_file" 2>/dev/null | cut -d= -f2 || true)"
        [ -n "$v" ] && { fqdn="$v"; break; }
    fi
done

echo
echo "==> Compte WebDAV '$user' prêt (tenant '$id')."
echo "    Aucun reload : Apache relit le htpasswd à chaque requête."
echo
echo "    URL        : https://$fqdn/dav/"
echo "    Login      : $user"
echo
echo "    Montage lecteur réseau (mêmes dossiers surveillés que le SFTP) :"
echo "      - Verifier : dav/entrant/verifier/{default,ocr_only,default_mail}"
echo "      - Splitter : dav/entrant/splitter/default"
echo
echo "    Gérer les comptes (aucun reload) :"
echo "      - ajouter un autre login  : sudo ./new-webdav-account.sh $id <autre_login>"
echo "      - changer ce mot de passe : sudo ./new-webdav-account.sh $id $user   (relancer)"
echo "      - supprimer ce compte     : sudo docker run --rm -v $conf_dir:/work $IMAGE htpasswd -D /work/htpasswd $user"
echo
echo "    Fichier des comptes (secret, hors dépôt) : $htpasswd"
echo
