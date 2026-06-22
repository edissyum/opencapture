#!/usr/bin/env bash
#
# new-tenant.sh — crée le stub d'un tenant à partir d'un gabarit, pré-remplit les
# champs dérivables de l'id, puis indique ce qu'il reste à renseigner À LA MAIN.
# Ne déploie PAS (le déploiement reste ./deploy.sh <id>).
#
# Usage :
#   ./new-tenant.sh <http|le|cert> <id>
#
# Modes (= gabarit copié) :
#   http  -> stub-tenants/_template-http         (HTTP pur, sans TLS)
#   le    -> stub-tenants/_template-letsencrypt  (HTTPS Let's Encrypt)
#   cert  -> stub-tenants/_template-cert         (HTTPS cert fourni / auto-signé, SNI)

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

usage() { echo "Usage : $(basename "$0") <http|le|cert> <id>" >&2; exit 2; }

mode="${1:-}"
id="${2:-}"
[ -n "$mode" ] && [ -n "$id" ] || usage

# Mode -> gabarit
case "$mode" in
    http) tpl="_template-http" ;;
    le)   tpl="_template-letsencrypt" ;;
    cert) tpl="_template-cert" ;;
    *)    echo "Mode inconnu : '$mode' (attendu : http|le|cert)" >&2; usage ;;
esac

# Validation de l'id (mêmes règles que docker-bootstrap.sh ; 'default' réservé au stack de base)
case "$id" in
    custom|default|_*|.*|*[!a-z0-9_]*)
        echo "Id invalide : '$id' — minuscules/chiffres/_ uniquement, et != custom/default" >&2
        exit 2 ;;
esac

src="$REPO_ROOT/stub-tenants/$tpl"
dst="$REPO_ROOT/stub-tenants/$id"
[ -d "$src" ] || { echo "Gabarit introuvable : stub-tenants/$tpl" >&2; exit 2; }
[ -e "$dst" ] && { echo "Le tenant existe déjà : stub-tenants/$id (rien fait)" >&2; exit 2; }

# --- Création du stub ---
cp -r "$src" "$dst"
mv "$dst/.env.example" "$dst/.env"

# --- Pré-remplissage des champs mécaniques (dérivés de l'id) ---
sed -i \
    -e "s/^CUSTOM_ID=.*/CUSTOM_ID=$id/" \
    -e "s/^POSTGRES_DB=.*/POSTGRES_DB=opencapture_$id/" \
    -e "s/^POSTGRES_USER=.*/POSTGRES_USER=$id/" \
    -e "s/^RABBITMQ_USER=.*/RABBITMQ_USER=$id/" \
    "$dst/.env"

# Les chemins de données ne sont PLUS écrits ici : ils dérivent de OC_DATA_ROOT
# (déjà dans le gabarit) + CUSTOM_ID, résolus dans infra/docker-compose.yml :
#   ${OC_DATA_ROOT}/tenants/$id/{pgdata,rabbitmq,custom,docservers,share,webdav}
oc_root="$(grep -m1 '^OC_DATA_ROOT=' "$dst/.env" | cut -d= -f2- || true)"
oc_root="${oc_root:-/opt/edissyum/opencapture}"

# --- APP_UID/APP_GID : repris du .env GLOBAL, JAMAIS du défaut du gabarit ------
# L'image backend est PARTAGÉE et bâtie avec l'APP_UID du .env global : elle bake
# /app (= HOME du compte de service) à cet uid. Si un tenant tourne avec un autre
# uid, /app n'est plus inscriptible -> matplotlib/fontconfig en erreur (HOME),
# et les fichiers déposés ne matchent plus le process. On force donc la valeur
# globale pour que TOUS les tenants soient cohérents avec l'image.
global_env="$REPO_ROOT/.env"
if [ -f "$global_env" ]; then
    g_uid="$(grep -m1 '^APP_UID=' "$global_env" | cut -d= -f2- || true)"
    g_gid="$(grep -m1 '^APP_GID=' "$global_env" | cut -d= -f2- || true)"
    [ -n "$g_uid" ] && sed -i "s/^APP_UID=.*/APP_UID=$g_uid/" "$dst/.env"
    [ -n "$g_gid" ] && sed -i "s/^APP_GID=.*/APP_GID=$g_gid/" "$dst/.env"
else
    g_uid=""; g_gid=""
    echo "    ⚠ .env global absent ($global_env) : APP_UID/APP_GID laissés au défaut du gabarit." >&2
fi

# --- Ce qu'il reste à renseigner À LA MAIN ---
echo
echo "==> Tenant '$id' créé (mode $mode)."
echo
echo "    FICHIER À ÉDITER :  stub-tenants/$id/.env"
echo
echo "    À renseigner À LA MAIN (obligatoire) :"
echo "      - OC_FQDN            : domaine du tenant (ex. $id.example.com)"
echo "      - POSTGRES_PASSWORD  : mot de passe PostgreSQL (fort)"
echo "      - RABBITMQ_PASS      : mot de passe RabbitMQ (fort)"
echo
echo "    Pré-remplis depuis l'id (à vérifier) :"
echo "      - CUSTOM_ID=$id, POSTGRES_DB=opencapture_$id, POSTGRES_USER=$id, RABBITMQ_USER=$id"
echo "      - données : $oc_root/tenants/$id/{pgdata,rabbitmq,custom,docservers,share} (via OC_DATA_ROOT)"
echo "      - APP_UID=${g_uid:-<gabarit>}, APP_GID=${g_gid:-<gabarit>} (repris du .env global)"

if [ "$mode" = "cert" ]; then
    echo
    echo "    Mode cert — en plus du .env (cf. stub-tenants/$id/tls.yml.example) :"
    echo "      - déposer le PEM : $oc_root/shared-by-tenants/traefik/certs/$id.crt (+ .key, sans passphrase)"
    echo "      - déclarer le cert : copier le fragment -> $oc_root/shared-by-tenants/traefik/dynamic/$id.yml"
    echo "        (le SAN du certificat doit couvrir EXACTEMENT OC_FQDN)"
fi

echo
echo "    Puis déployer :  ./deploy.sh $id"
echo
