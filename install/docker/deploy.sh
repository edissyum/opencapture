#!/usr/bin/env bash
#
# deploy.sh — (Re)construit et redeploie OpenCapture pour un ou plusieurs tenants.
#
# Principes :
#   - L'image backend `opencapture-backend` est PARTAGEE par tous les stacks
#     (api + workers + fs-watcher + init) -> construite UNE seule fois.
#   - L'image frontend `opencapture-frontend` est PARTAGEE par tous les tenants
#     (bundle identique ; custom_id resolu au runtime) -> construite UNE seule fois.
#   - Apres un build, chaque tenant doit etre recree (up -d) pour prendre la nouvelle
#     image : les conteneurs ne se mettent PAS a jour seuls.
#   - Volumes/donnees conserves (jamais de `down -v`).
#
# Un "tenant" = un dossier install/docker/stub-tenants/<id>/ avec un docker-compose.yml qui inclut
# la compose partagée (shared/). Les gabarits install/docker/stub-tenants/_template-* sont exclus.
# 'default' (install/docker/shared/docker-compose.yml) = stack dev/demo, PAS un tenant de prod :
# deploy.sh (outil de prod) ne le gere PAS (ni dans --all, ni en cible explicite).
# Le build de l'image backend partagee utilise tout de meme install/docker/shared/docker-compose.yml
# comme reference, mais ne DEMARRE jamais 'default' (build != up).
#
# Usage :
#   ./install/docker/deploy.sh [options] [tenants...]
#
# Options :
#   --all            tous les tenants decouverts (install/docker/stub-tenants/* sauf _template-*)
#   --pull           git pull (--ff-only) avant de builder
#   --backend-only   ne (re)build que le backend (image partagee)
#   --frontend-only  ne (re)build que l'image frontend (partagee), puis recree
#   --no-build       ne rien builder, juste recreer (up -d)   [ex: apres modif .env]
#   -h | --help      cette aide
#
# Exemples :
#   ./install/docker/deploy.sh --all                   # backend 1x + build front + recreate de tous les tenants
#   ./install/docker/deploy.sh site1                   # backend 1x + front de site1 + recreate site1
#   ./install/docker/deploy.sh --frontend-only site1   # rebuild l'image frontend partagee + recree site1
#   ./install/docker/deploy.sh --backend-only --all    # backend 1x + recreate de tous les tenants
#   ./install/docker/deploy.sh --no-build site1        # juste recreer site1 (aucun rebuild)
#   ./install/docker/deploy.sh --pull site1 site2      # git pull puis build+deploy site1 et site2

set -euo pipefail
shopt -s nullglob

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" \
    && until { [ -d backend ] && [ -d frontend ]; } || [ "$PWD" = / ]; do cd ..; done; pwd)"
[ -d "$REPO_ROOT/backend" ] || { echo "repo root not found from $0" >&2; exit 2; }
DOCKER_ROOT="$REPO_ROOT/install/docker"
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
# NB : 'default' (install/docker/shared/docker-compose.yml) est la stack dev/demo, PAS un tenant
# de prod -> volontairement NON gere ici (deploy.sh = outil de prod). Pour la
# lancer en dev : docker compose --project-directory install/docker/shared -f install/docker/shared/docker-compose.yml up -d.
compose_dir_for() {
    local t="$1"
    case "$t" in _*|.*|default) return 1 ;; esac   # _template-*, dotdirs, default : pas des tenants prod
    if [ -f "$DOCKER_ROOT/stub-tenants/$t/docker-compose.yml" ]; then
        echo "$DOCKER_ROOT/stub-tenants/$t"
    else
        return 1
    fi
}

# docker compose cible pour un tenant : dc <tenant> <args...>
# Un -f explicite desactive l'auto-decouverte de docker-compose.override.yml
# par le CLI -> on le rajoute nous-memes s'il existe (overrides par tenant,
# ex. mem_limit/GUNICORN_* geres hors .env).
dc() {
    local t="$1"; shift
    local dir; dir="$(compose_dir_for "$t")"
    local files=(-f "$dir/docker-compose.yml")
    [ -f "$dir/docker-compose.override.yml" ] && files+=(-f "$dir/docker-compose.override.yml")
    docker compose --project-directory "$dir" "${files[@]}" "$@"
}

# Vrai si le tenant ACTIVE l'overlay WebDAV (opt-in) : ligne d'include NON
# commentee de webdav/docker-compose.yml dans son docker-compose.yml. Sert a ne
# construire l'image webdav que si au moins un tenant en a besoin.
tenant_has_webdav() {
    local dir; dir="$(compose_dir_for "$1")" || return 1
    grep -qE '^[[:space:]]*-[[:space:]]*path:.*webdav/docker-compose\.yml' \
        "$dir/docker-compose.yml" 2>/dev/null
}

# Liste tous les tenants deployables (exclut les gabarits _template-* et tout
# dossier prefixe par '_' ou '.').
discover_all() {
    local found=() d name
    # 'default' n'est PAS inclus : c'est la stack dev/demo, pas un tenant de prod.
    for d in "$DOCKER_ROOT"/stub-tenants/*/; do
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
    docker compose --project-directory "$DOCKER_ROOT/shared" \
        -f "$DOCKER_ROOT/shared/docker-compose.yml" build backend
fi

# 2) Image PARTAGEE frontend (construite UNE fois) : opencapture-frontend.
#    Le bundle est identique pour tous les tenants (custom_id resolu au
#    runtime : SPA via l'URL + nginx via envsubst). Plus de build par tenant.
if [ "$BUILD_FRONTEND" = 1 ]; then
    echo "==> Build image frontend (partagee)..."
    docker compose --project-directory "$DOCKER_ROOT/shared" \
        -f "$DOCKER_ROOT/shared/docker-compose.yml" build frontend
fi

# 2bis) Image PARTAGEE webdav (opt-in) : INDEPENDANTE du backend. Construite UNE
#       fois (docker build direct, pas via le compose) si au moins un tenant
#       selectionne active l'overlay webdav/docker-compose.yml.
if [ "$BUILD_BACKEND" = 1 ] || [ "$BUILD_FRONTEND" = 1 ]; then
    for t in "${TENANTS[@]}"; do
        if tenant_has_webdav "$t"; then
            echo "==> Build image webdav (partagee, opt-in)..."
            docker build -f "$DOCKER_ROOT/shared/webdav/Dockerfile" \
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
