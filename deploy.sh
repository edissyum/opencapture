#!/usr/bin/env bash
#
# deploy.sh — (Re)construit et redeploie OpenCapture pour un ou plusieurs tenants.
#
# Principes :
#   - L'image backend `opencapture-backend` est PARTAGEE par tous les stacks
#     (api + workers + fs-watcher + init) -> construite UNE seule fois.
#   - Le frontend est une image PAR tenant (config bakee au build) -> build par tenant.
#   - Apres un build, chaque tenant doit etre recree (up -d) pour prendre la nouvelle
#     image : les conteneurs ne se mettent PAS a jour seuls.
#   - Volumes/donnees conserves (jamais de `down -v`).
#
# Un "tenant" = un dossier contenant un docker-compose.yml qui inclut la compose infra :
#   - default  -> infra/docker-compose.yml                  (stack de base)
#   - <id>     -> stub-tenants/<id>/docker-compose.yml      (tenants prod + test)
# Les gabarits stub-tenants/_template-* sont exclus de la decouverte.
# La resolution est uniforme : un tenant de test se pilote comme un vrai tenant.
#
# Usage :
#   ./deploy.sh [options] [tenants...]
#
# Options :
#   --all            tous les tenants decouverts (default + stub-tenants/* sauf _template-*)
#   --pull           git pull (--ff-only) avant de builder
#   --backend-only   ne (re)build que le backend (image partagee)
#   --frontend-only  ne (re)build que le(s) frontend(s)
#   --no-build       ne rien builder, juste recreer (up -d)   [ex: apres modif .env]
#   -h | --help      cette aide
#
# Exemples :
#   ./deploy.sh --all                   # backend 1x + build front + recreate de tous les tenants
#   ./deploy.sh site1                   # backend 1x + front de site1 + recreate site1
#   ./deploy.sh --frontend-only site1   # juste le front de site1
#   ./deploy.sh --backend-only --all    # backend 1x + recreate de tous les tenants
#   ./deploy.sh --no-build site1        # juste recreer site1 (aucun rebuild)
#   ./deploy.sh --pull site1 site2      # git pull puis build+deploy site1 et site2

set -euo pipefail
shopt -s nullglob

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export BUILDX_NO_DEFAULT_ATTESTATIONS=1   # export d'image plus rapide (pas d'attestations)

DO_PULL=0
BUILD_BACKEND=1
BUILD_FRONTEND=1
ALL=0
TENANTS=()

while [ $# -gt 0 ]; do
    case "$1" in
        --all)           ALL=1 ;;
        --pull)          DO_PULL=1 ;;
        --backend-only)  BUILD_BACKEND=1; BUILD_FRONTEND=0 ;;
        --frontend-only) BUILD_BACKEND=0; BUILD_FRONTEND=1 ;;
        --no-build)      BUILD_BACKEND=0; BUILD_FRONTEND=0 ;;
        -h|--help)       awk 'NR==1{next} /^#/{sub(/^# ?/,"");print;next} {exit}' "$0"; exit 0 ;;
        -*)              echo "Option inconnue : $1 (voir --help)" >&2; exit 2 ;;
        *)               TENANTS+=("$1") ;;
    esac
    shift
done

# Repertoire du compose d'un tenant (echoue si introuvable).
compose_dir_for() {
    local t="$1"
    case "$t" in _*|.*) return 1 ;; esac   # _template-*, dotdirs : pas des tenants
    if [ "$t" = "default" ] && [ -f "$REPO_ROOT/infra/docker-compose.yml" ]; then
        echo "$REPO_ROOT/infra"
    elif [ -f "$REPO_ROOT/stub-tenants/$t/docker-compose.yml" ]; then
        echo "$REPO_ROOT/stub-tenants/$t"
    else
        return 1
    fi
}

# docker compose cible pour un tenant : dc <tenant> <args...>
dc() {
    local t="$1"; shift
    local dir; dir="$(compose_dir_for "$t")"
    docker compose --project-directory "$dir" -f "$dir/docker-compose.yml" "$@"
}

# Vrai si le tenant ACTIVE l'overlay WebDAV (opt-in) : ligne d'include NON
# commentee de docker-compose.webdav.yml dans son docker-compose.yml. Sert a ne
# construire l'image webdav que si au moins un tenant en a besoin.
tenant_has_webdav() {
    local dir; dir="$(compose_dir_for "$1")" || return 1
    grep -qE '^[[:space:]]*-[[:space:]]*path:.*docker-compose\.webdav\.yml' \
        "$dir/docker-compose.yml" 2>/dev/null
}

# Liste tous les tenants deployables (exclut les gabarits _template-* et tout
# dossier prefixe par '_' ou '.').
discover_all() {
    local found=() d name
    [ -f "$REPO_ROOT/infra/docker-compose.yml" ] && found+=("default")
    for d in "$REPO_ROOT"/stub-tenants/*/; do
        name="$(basename "$d")"
        case "$name" in _*|.*) continue ;; esac
        [ -f "${d}docker-compose.yml" ] && found+=("$name")
    done
    [ ${#found[@]} -gt 0 ] && printf '%s\n' "${found[@]}"
}

# --- Selection des tenants -------------------------------------------------
if [ "$ALL" = 1 ]; then
    mapfile -t TENANTS < <(discover_all)
fi
if [ ${#TENANTS[@]} -eq 0 ]; then
    echo "Aucun tenant specifie. Donne un ou plusieurs tenants, ou --all." >&2
    echo "Tenants disponibles : $(discover_all | tr '\n' ' ')" >&2
    exit 2
fi
# Valide la resolution AVANT toute action (echoue tot, proprement).
for t in "${TENANTS[@]}"; do
    compose_dir_for "$t" >/dev/null || { echo "Tenant introuvable : $t (voir --help)" >&2; exit 2; }
done

echo "==> Tenants    : ${TENANTS[*]}"
echo "==> Build      : backend=$BUILD_BACKEND  frontend=$BUILD_FRONTEND  (git pull=$DO_PULL)"

if [ "$DO_PULL" = 1 ]; then
    echo "==> git pull --ff-only"
    git -C "$REPO_ROOT" pull --ff-only
fi

# 1) Image PARTAGEE backend (construite UNE fois) : opencapture-backend
#    (api + workers + fs-watcher + init).
if [ "$BUILD_BACKEND" = 1 ]; then
    echo "==> Build image backend (partagee)..."
    docker compose --project-directory "$REPO_ROOT/infra" \
        -f "$REPO_ROOT/infra/docker-compose.yml" build backend
fi

# 2) Frontend : par tenant (images distinctes <tenant>-frontend).
if [ "$BUILD_FRONTEND" = 1 ]; then
    for t in "${TENANTS[@]}"; do
        echo "==> Build frontend [$t]..."
        dc "$t" build frontend
    done
fi

# 2bis) Image PARTAGEE webdav (opt-in) : INDEPENDANTE du backend. Construite UNE
#       fois (docker build direct, pas via le compose) si au moins un tenant
#       selectionne active l'overlay docker-compose.webdav.yml.
if [ "$BUILD_BACKEND" = 1 ] || [ "$BUILD_FRONTEND" = 1 ]; then
    for t in "${TENANTS[@]}"; do
        if tenant_has_webdav "$t"; then
            echo "==> Build image webdav (partagee, opt-in)..."
            docker build -f "$REPO_ROOT/infra/webdav.Dockerfile" \
                -t opencapture-webdav "$REPO_ROOT"
            break
        fi
    done
fi

# 3) Recreer chaque tenant -> prend les nouvelles images (volumes conserves).
for t in "${TENANTS[@]}"; do
    echo "==> up -d [$t]..."
    dc "$t" up -d
done

# 4) Recapitulatif.
echo
echo "==> Etat final :"
for t in "${TENANTS[@]}"; do
    echo "----- $t -----"
    dc "$t" ps || true
done
echo "==> Termine."
