#!/usr/bin/env bash
#
# new-sftp-account.sh — crée l'accès SFTP d'un tenant.
#
# Mode SFTP uniquement (cf. infra-host/sftp/README.md) : un seul service SFTP partagé, donc
# déclarer un tenant = créer son compte virtuel ProFTPD, chrooté sur son
# dossier share ($OC_DATA_ROOT/tenants/<id>/share), mappé sur le compte de service
# OpenCapture ($APP_UID/$APP_GID). Pas d'IP, pas de certificat, pas de fragment
# de conf : ProFTPD relit ftpd.passwd à chaque connexion -> aucun reload requis.
#
# Usage (en root sur le serveur, depuis le dépôt) :
#   sudo ./new-sftp-account.sh <id>
#
# Prérequis : runbooks/fr/05-sftp-server.md joué une fois (ProFTPD installé,
# /etc/proftpd/ftpd.passwd en place).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROFTPD_PASSWD="/etc/proftpd/ftpd.passwd"

usage() { echo "Usage : sudo $(basename "$0") <id>" >&2; exit 2; }

id="${1:-}"
[ -n "$id" ] || usage

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

# uid/gid + racine des données : depuis le .env racine (défauts 1000 / /opt/edissyum/opencapture).
root_env="$REPO_ROOT/.env"
app_uid="$(grep -m1 '^APP_UID=' "$root_env" 2>/dev/null | cut -d= -f2 || true)"; app_uid="${app_uid:-1000}"
app_gid="$(grep -m1 '^APP_GID=' "$root_env" 2>/dev/null | cut -d= -f2 || true)"; app_gid="${app_gid:-1000}"
oc_root="$(grep -m1 '^OC_DATA_ROOT=' "$root_env" 2>/dev/null | cut -d= -f2- || true)"; oc_root="${oc_root:-/opt/edissyum/opencapture}"

share="$oc_root/tenants/$id/share"

echo "==> Compte SFTP '$id'  (home=$share  uid:gid=$app_uid:$app_gid)"

# Dossier share : présent + possédé par le compte de service.
# (les sous-dossiers entrant/... sont créés par le bootstrap OpenCapture au 1er
#  déploiement ; on s'assure juste que la racine du chroot existe et est à OC.)
mkdir -p "$share"
chown "$app_uid:$app_gid" "$share"

# Compte virtuel ProFTPD (demande le mot de passe).
[ -f "$PROFTPD_PASSWD" ] || { : > "$PROFTPD_PASSWD"; chmod 600 "$PROFTPD_PASSWD"; }
echo "    -> mot de passe SFTP pour '$id' :"
ftpasswd --passwd --file="$PROFTPD_PASSWD" \
    --name="$id" --uid="$app_uid" --gid="$app_gid" \
    --home="$share" --shell=/bin/false

# Pas de reload : AuthUserFile est relu à chaque connexion.
server="$(hostname -f 2>/dev/null || hostname)"
echo
echo "==> Compte SFTP '$id' prêt."
echo
echo "    Connexion : sftp -P 2222 $id@${server}"
echo "    (clé publique optionnelle : /etc/proftpd/sftp/authorized_keys/$id)"
echo
echo "    Dépôt des fichiers (le fs-watcher surveille les sous-dossiers de share/) :"
echo "      - Verifier : entrant/verifier/{default,ocr_only,default_mail}"
echo "      - Splitter : entrant/splitter/default"
echo
