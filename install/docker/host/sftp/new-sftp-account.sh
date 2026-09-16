#!/usr/bin/env bash
#
# new-sftp-account.sh — crée l'accès SFTP d'un tenant.
#
# Usage (en root sur le serveur, depuis le dépôt) :
#   sudo ./install/docker/host/sftp/new-sftp-account.sh <id> [user]
#     <id>   : identifiant du tenant (= dossier $OC_DATA_ROOT/tenants/<id>)
#     [user] : login SFTP (défaut : <id>) — p. ex. <id>-01
#   Le mot de passe est demandé interactivement.
#
# Relancer le script :
#   - avec un AUTRE [user]  -> ajoute un login (plusieurs comptes par tenant,
#                              tous chrootés sur le même share) ;
#   - avec le MÊME  [user]  -> change son mot de passe.
#
# Prérequis : runbooks/fr/05-sftp-server.md joué une fois (ProFTPD installé,
# /etc/proftpd/ftpd.passwd en place).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" \
    && until { [ -d backend ] && [ -d frontend ]; } || [ "$PWD" = / ]; do cd ..; done; pwd)"
[ -d "$REPO_ROOT/backend" ] || { echo "repo root not found from $0" >&2; exit 2; }
DOCKER_ROOT="$REPO_ROOT/install/docker"
rel="${SCRIPT_DIR#"$REPO_ROOT"}"; rel="${rel#/}"
SELF="./${rel:+$rel/}$(basename "${BASH_SOURCE[0]}")"
PROFTPD_PASSWD="/etc/proftpd/ftpd.passwd"

usage() { echo "Usage : sudo $SELF <id> [user]" >&2; exit 2; }

id="${1:-}"
[ -n "$id" ] || usage
user="${2:-$id}"

# root requis (écrit /etc/proftpd, lance ftpasswd, crée le share).
if [ "$(id -u)" -ne 0 ]; then
    echo "Ce script doit être lancé en root (sudo)." >&2
    exit 2
fi

# Validation de l'id (mêmes règles que new-tenant.sh).
case "$id" in
    custom|default|_*|.*|*[!a-z0-9_]*)
        echo "Id invalide : '$id' — minuscules/chiffres/_ uniquement, et != custom/default" >&2
        exit 2 ;;
esac

# Validation du login : plus permissive que l'id (le tiret est admis, d'où
# <id>-01), mais ni ':' (séparateur de champ de ftpd.passwd) ni tiret/point en
# tête.
case "$user" in
    -*|.*|*[!a-zA-Z0-9_.-]*)
        echo "Login invalide : '$user' — lettres/chiffres/_/-/. uniquement, sans '-' ni '.' en tête" >&2
        exit 2 ;;
esac

# uid/gid + racine des données : depuis le .env racine (défauts 1000 / /opt/edissyum/opencapture).
root_env="$DOCKER_ROOT/.env"
app_uid="$(grep -m1 '^APP_UID=' "$root_env" 2>/dev/null | cut -d= -f2 || true)"; app_uid="${app_uid:-1000}"
app_gid="$(grep -m1 '^APP_GID=' "$root_env" 2>/dev/null | cut -d= -f2 || true)"; app_gid="${app_gid:-1000}"
oc_root="$(grep -m1 '^OC_DATA_ROOT=' "$root_env" 2>/dev/null | cut -d= -f2- || true)"; oc_root="${oc_root:-/opt/edissyum/opencapture}"

share="$oc_root/tenants/$id/share"

echo "==> Compte SFTP '$user' (tenant '$id', home=$share, uid:gid=$app_uid:$app_gid)"

# Dossier share : présent + possédé par le compte de service.
# (les sous-dossiers entrant/... sont créés par le bootstrap OpenCapture au 1er
#  déploiement ; on s'assure juste que la racine du chroot existe et est à OC.)
mkdir -p "$share"
chown "$app_uid:$app_gid" "$share"

# Compte virtuel ProFTPD (demande le mot de passe).
[ -f "$PROFTPD_PASSWD" ] || { : > "$PROFTPD_PASSWD"; chmod 600 "$PROFTPD_PASSWD"; }
echo "    -> mot de passe SFTP pour '$user' :"
ftpasswd --passwd --file="$PROFTPD_PASSWD" \
    --name="$user" --uid="$app_uid" --gid="$app_gid" \
    --home="$share" --shell=/bin/false

# Pas de reload : AuthUserFile est relu à chaque connexion.
server="$(hostname -f 2>/dev/null || hostname)"
echo
echo "==> Compte SFTP '$user' prêt (tenant '$id')."
echo
echo "    Connexion : sftp -P 2222 $user@${server}"
echo "    (clé publique optionnelle : /etc/proftpd/sftp/authorized_keys/$user)"
echo
echo "    Dépôt des fichiers (le fs-watcher surveille les sous-dossiers de share/) :"
echo "      - Verifier : entrant/verifier/{default,ocr_only,default_mail}"
echo "      - Splitter : entrant/splitter/default"
echo
echo "    Gestion :"
echo "      - changer ce mot de passe : sudo $SELF $id $user   (relancer)"
echo "      - ajouter un autre login  : sudo $SELF $id ${id}-02"
echo "      - supprimer ce compte     : sudo ftpasswd --passwd --file=$PROFTPD_PASSWD --name=$user --delete-user"
echo
