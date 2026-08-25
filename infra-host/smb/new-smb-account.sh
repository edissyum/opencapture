#!/usr/bin/env bash
#
# new-smb-account.sh — crée l'accès SMB (Samba) d'un tenant.
#
# Serveur Samba unique partagé (cf. infra-host/smb/README.md) : déclarer un tenant =
#   - une identité d'auth Unix `nologin` (pour que smbd la résolve),
#   - son mot de passe SMB (passdb tdbsam),
#   - un partage [<id>] sur son dossier share ($OC_DATA_ROOT/tenants/<id>/share),
#     fichiers forcés sur le compte de service OpenCapture ($APP_UID/$APP_GID).
#
# Usage (en root sur le serveur, depuis le dépôt) :
#   sudo ./infra-host/smb/new-smb-account.sh <id>
#
# Prérequis : runbooks/fr/07-smb-server.md joué une fois (Samba installé,
# compte de service hôte créé, /etc/samba/oc-shares.conf en place).

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SELF="./${SCRIPT_DIR#"$REPO_ROOT"/}/$(basename "${BASH_SOURCE[0]}")"
SHARES_CONF="/etc/samba/oc-shares.conf"

usage() { echo "Usage : sudo $SELF <id>" >&2; exit 2; }

id="${1:-}"
[ -n "$id" ] || usage

# root requis (crée le compte Unix, écrit la passdb, modifie /etc/samba).
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

# uid/gid = compte de service OpenCapture (depuis le .env racine ; défaut 1000).
root_env="$REPO_ROOT/.env"
app_uid="$(grep -m1 '^APP_UID='  "$root_env" 2>/dev/null | cut -d= -f2 || true)"; app_uid="${app_uid:-1000}"
app_gid="$(grep -m1 '^APP_GID='  "$root_env" 2>/dev/null | cut -d= -f2 || true)"; app_gid="${app_gid:-1000}"
oc_root="$(grep -m1 '^OC_DATA_ROOT=' "$root_env" 2>/dev/null | cut -d= -f2- || true)"; oc_root="${oc_root:-/opt/edissyum/opencapture}"

# `force user`/`force group` = le NOM/GROUPE hôte qui PORTE APP_UID/APP_GID :
# c'est le NUMÉRO (uid/gid) qui rend les fichiers lisibles et supprimables par le
# fs-watcher, pas le nom. On les dérive de l'UID/GID (robuste même si le nom hôte
# diffère de APP_USER du .env). Cf. infra-host/smb/README.md.
force_name="$(getent passwd "$app_uid" | cut -d: -f1)"
force_group="$(getent group  "$app_gid" | cut -d: -f1)"
if [ -z "$force_name" ] || [ -z "$force_group" ]; then
    echo "Aucun compte/groupe hôte ne porte APP_UID:APP_GID ($app_uid:$app_gid) —" >&2
    echo "lance d'abord runbooks/fr/07-smb-server.md (crée le compte de service)." >&2
    exit 2
fi

share="$oc_root/tenants/$id/share"

echo "==> Compte SMB '$id'  (partage=\\\\<serveur>\\$id  ->  $share  ;  fichiers=$force_name:$force_group  $app_uid:$app_gid)"

# Dossier share : présent + possédé par le compte de service.
# (les sous-dossiers entrant/... sont créés par le bootstrap OpenCapture au 1er
#  déploiement ; on s'assure juste que la racine existe et est à OC.)
mkdir -p "$share"
chown "$app_uid:$app_gid" "$share"

# Identité d'auth Unix du tenant (nologin, sans home). Son uid n'importe PAS :
# `force user` écrase la propriété des fichiers. Présente juste pour que smbd
# résolve le nom du compte SMB.
if ! getent passwd "$id" >/dev/null; then
    useradd -r -M -s /usr/sbin/nologin "$id"
fi

# Mot de passe SMB (passdb tdbsam) — demandé interactivement, puis activé.
echo "    -> mot de passe SMB pour '$id' :"
smbpasswd -a "$id"
smbpasswd -e "$id" >/dev/null

# Section de partage du tenant (idempotent : ajoutée seulement si absente).
touch "$SHARES_CONF"
if grep -qE "^\[$id\]" "$SHARES_CONF"; then
    echo "    -> section [$id] déjà présente dans $SHARES_CONF (inchangée)."
else
    cat >> "$SHARES_CONF" <<EOF

[$id]
   path           = $share
   valid users    = $id
   browseable     = no
   read only      = no
   force user     = $force_name
   force group    = $force_group
   create mask    = 0664
   directory mask = 0775
   # Dépôt : le fs-watcher retire les fichiers hors protocole SMB -> pas de
   # cache client (offline files) sur le contenu, sous peine de listing
   # obsolète côté Windows (cf. infra-host/smb/smb.conf : smb3 directory leases).
   csc policy     = disable
EOF
    echo "    -> section [$id] ajoutée à $SHARES_CONF."
fi

# Recharge à chaud (pas de restart : smbd relit la conf aux nouvelles connexions ;
# on force pour que ce soit immédiat).
smbcontrol all reload-config >/dev/null 2>&1 || systemctl reload smbd 2>/dev/null || true

server="$(hostname -f 2>/dev/null || hostname)"
echo
echo "==> Compte SMB '$id' prêt."
echo
echo "    Montage : \\\\${server}\\$id   (ou \\\\<domaine-client>\\$id — alias DNS -> IP)"
echo "    Linux/macOS : smbclient //${server}/$id -U $id -m SMB3"
echo
echo "    Dépôt des fichiers (le fs-watcher surveille les sous-dossiers de share/) :"
echo "      - Verifier : entrant/verifier/{default,ocr_only,default_mail}"
echo "      - Splitter : entrant/splitter/default"
echo
