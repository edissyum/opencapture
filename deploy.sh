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
#   - <id>     -> tenants/<id>/docker-compose.yml           (tenants de production)
#   - <id>     -> tests/tenants/<id>/docker-compose.yml     (tenants de test)
# La resolution est uniforme : un tenant de test se pilote comme un vrai tenant.
#
# Usage :
#   ./deploy.sh [options] [tenants...]
#
# Options :
#   --all            tous les tenants decouverts (default + tenants/* + tests/tenants/*)
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
    if [ "$t" = "default" ] && [ -f "$REPO_ROOT/infra/docker-compose.yml" ]; then
        echo "$REPO_ROOT/infra"
    elif [ -f "$REPO_ROOT/tenants/$t/docker-compose.yml" ]; then
        echo "$REPO_ROOT/tenants/$t"
    elif [ -f "$REPO_ROOT/tests/tenants/$t/docker-compose.yml" ]; then
        echo "$REPO_ROOT/tests/tenants/$t"
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

# Liste tous les tenants deployables.
discover_all() {
    local found=() d
    [ -f "$REPO_ROOT/infra/docker-compose.yml" ] && found+=("default")
    for d in "$REPO_ROOT"/tenants/*/ "$REPO_ROOT"/tests/tenants/*/; do
        [ -f "${d}docker-compose.yml" ] && found+=("$(basename "$d")")
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

# 1) Backend : UNE fois (image partagee opencapture-backend), via la compose infra.
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
