#!/usr/bin/env bash
#
# reset-tenant-data.sh — Vide les donnees fonctionnelles d'un tenant
# (history, documents, splitter_batches/documents/pages) avant mise en
# production, sans toucher au schema ni recreer les conteneurs.
#
# Portage Docker de instance/sql/delete_data.sql (bare-metal, commit 9cc3119
# "Add script to reset database") : le SQL vit deja dans
# postgres/sql/delete_data.sql mais n'etait joue par aucun script cote Docker.
#
# NB : ne touche QUE la base Postgres. Les fichiers deja deposes sur disque
# (docservers, custom/*/data) ne sont PAS supprimes par ce script.
#
# Usage :
#   ./install/docker/tenant/reset-tenant-data.sh [--yes] <tenant> [tenant...]
#   ./install/docker/tenant/reset-tenant-data.sh [--yes] --all
#
# Options :
#   --all             tous les tenants decouverts (install/docker/stub-tenants/* sauf _template-*)
#   --yes             ne demande pas de confirmation (destructif : TRUNCATE)
#   -h | --help        cette aide
#
# Exemples :
#   ./install/docker/tenant/reset-tenant-data.sh herve
#   ./install/docker/tenant/reset-tenant-data.sh --yes site1 site2
#   ./install/docker/tenant/reset-tenant-data.sh --all

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" \
    && until { [ -d backend ] && [ -d frontend ]; } || [ "$PWD" = / ]; do cd ..; done; pwd)"
[ -d "$REPO_ROOT/backend" ] || { echo "repo root not found from $0" >&2; exit 2; }
DOCKER_ROOT="$REPO_ROOT/install/docker"
DELETE_DATA_SQL="$REPO_ROOT/postgres/sql/delete_data.sql"

log()  { echo "[reset-tenant-data] $*"; }
die()  { echo "[reset-tenant-data] ✗ $*" >&2; exit 1; }
trim() { local s="$*"; s="${s#"${s%%[![:space:]]*}"}"; s="${s%"${s##*[![:space:]]}"}"; printf '%s' "$s"; }

ALL=0
ASSUME_YES=0
TENANTS=()

while [ $# -gt 0 ]; do
    case "$1" in
        --all)     ALL=1 ;;
        --yes)     ASSUME_YES=1 ;;
        -h|--help) awk 'NR==1{next} /^#/{sub(/^# ?/,"");print;next} {exit}' "$0"; exit 0 ;;
        -*)        die "Option inconnue : $1 (voir --help)" ;;
        *)         TENANTS+=("$1") ;;
    esac
    shift
done

[ -f "$DELETE_DATA_SQL" ] || die "$DELETE_DATA_SQL introuvable"

# docker compose ciblé pour un tenant : 'default' (install/docker/shared/) ou install/docker/stub-tenants/<id>/.
# Réplique la logique de migrate.sh (compose_dir_for/dc).
compose_dir_for() {
    local t="$1"
    if [ "$t" = "default" ] && [ -f "$DOCKER_ROOT/shared/docker-compose.yml" ]; then
        echo "$DOCKER_ROOT/shared"
    elif [ -f "$DOCKER_ROOT/stub-tenants/$t/docker-compose.yml" ]; then
        echo "$DOCKER_ROOT/stub-tenants/$t"
    else
        return 1
    fi
}
dc() {
    local t="$1"; shift
    local dir; dir="$(compose_dir_for "$t")" || die "compose introuvable pour le tenant '$t'"
    docker compose --project-directory "$dir" -f "$dir/docker-compose.yml" "$@"
}

discover_all() {
    local found=() d name
    [ -f "$DOCKER_ROOT/shared/docker-compose.yml" ] && found+=("default")
    for d in "$DOCKER_ROOT"/stub-tenants/*/; do
        name="$(basename "$d")"
        case "$name" in _*|.*) continue ;; esac
        [ -f "${d}docker-compose.yml" ] && found+=("$name")
    done
    [ ${#found[@]} -gt 0 ] && printf '%s\n' "${found[@]}"
}

if [ "$ALL" = 1 ]; then
    mapfile -t TENANTS < <(discover_all)
fi
if [ ${#TENANTS[@]} -eq 0 ]; then
    echo "Aucun tenant specifie. Donne un ou plusieurs tenants, ou --all." >&2
    echo "Tenants disponibles : $(discover_all | tr '\n' ' ')" >&2
    exit 2
fi
for t in "${TENANTS[@]}"; do
    compose_dir_for "$t" >/dev/null || die "Tenant introuvable : $t (voir --help)"
done

log "Tenants ciblés : ${TENANTS[*]}"
log "Tables vidées  : history, documents, splitter_batches, splitter_documents, splitter_pages"

if [ "$ASSUME_YES" != 1 ]; then
    read -r -p "Ceci va TRONQUER ces tables pour ${#TENANTS[@]} tenant(s). Continuer ? [y/N] " reply
    case "$reply" in [yY]|[yY][eE][sS]) ;; *) die "Annulé." ;; esac
fi

for t in "${TENANTS[@]}"; do
    dir="$(compose_dir_for "$t")"
    env_file="$dir/.env"
    [ -f "$env_file" ] || die "[$t] $env_file introuvable"
    pgdb="$(trim "$(grep -m1 '^POSTGRES_DB=' "$env_file" | cut -d= -f2-)")"
    pguser="$(trim "$(grep -m1 '^POSTGRES_USER=' "$env_file" | cut -d= -f2-)")"
    [ -n "$pgdb" ] && [ -n "$pguser" ] || die "[$t] POSTGRES_DB/POSTGRES_USER introuvables dans $env_file"

    log "[$t] TRUNCATE sur $pgdb (user $pguser)..."
    dc "$t" exec -T postgres psql -v ON_ERROR_STOP=1 -U "$pguser" -d "$pgdb" \
        < "$DELETE_DATA_SQL" >/dev/null
    log "[$t] OK"
done
