#!/usr/bin/env bash
#
# Harnais de tests OpenCapture — rejoue from scratch les 4 flux sur chaque
# tenant de test : verifier, splitter, mail (greenmail), fs-watcher.
#
# Usage :
#   ./tests/run_tests.sh                # test1 puis test2
#   ./tests/run_tests.sh test1          # un seul tenant
#   ./tests/run_tests.sh --rebuild      # force le rebuild des images
#
# Chaque tenant est : reset (down -v + wipe data) -> up -d -> 4 checks.
# Le stack est LAISSÉ EN MARCHE à la fin (inspection). Code retour 0 si
# tout PASS, 1 sinon.

set -uo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TESTS_DIR="$REPO_ROOT/tests"
GREENMAIL="$TESTS_DIR/docker-compose.greenmail.yml"
SAMPLE_PDF="/app/src/assets/not_found/document_not_found.pdf"   # PDF baké dans l'image
HEALTH_TIMEOUT=240   # s — attente backend healthy + init terminé
FLOW_TIMEOUT=240     # s — attente résultat d'un flux (large pour 1er load YOLO sur VM modeste)

REBUILD=0
TENANTS=()
for a in "$@"; do
    case "$a" in
        --rebuild) REBUILD=1 ;;
        -*) echo "Option inconnue : $a" >&2; exit 2 ;;
        *)  TENANTS+=("$a") ;;
    esac
done
[ ${#TENANTS[@]} -eq 0 ] && TENANTS=(test1 test2)

# Prérequis routage HTTP (idempotents). Sans eux les tests passent toujours
# (DB/FS/logs), mais les UI http://test{1,2}.edissyum.com seraient en 404.
ensure_traefik() {
    if docker network inspect frontend >/dev/null 2>&1; then
        echo "[pré] réseau frontend : OK"
    else
        docker network create frontend >/dev/null && echo "[pré] réseau frontend : créé"
    fi
    if docker ps --format '{{.Names}}' | grep -q '^opencapture_traefik$'; then
        # Sanity-check : traefik peut tourner sans être rattaché au réseau frontend
        # (cas observé après suppression/recréation du réseau hors traefik).
        if docker inspect opencapture_traefik \
              --format '{{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' \
              | grep -qw frontend; then
            echo "[pré] traefik : OK (sur réseau frontend)"
        else
            echo "[pré] traefik : détaché du réseau frontend — recréation"
            docker compose -f "$REPO_ROOT/infra/docker-compose.traefik-server.yml" up -d --force-recreate >/dev/null 2>&1 \
                && echo "[pré] traefik : recréé sur frontend" \
                || echo "[pré] traefik : ÉCHEC recréation"
        fi
    else
        echo "[pré] traefik : démarrage..."
        docker compose -f "$REPO_ROOT/infra/docker-compose.traefik-server.yml" up -d >/dev/null 2>&1 \
            && echo "[pré] traefik : OK" \
            || echo "[pré] traefik : ÉCHEC démarrage (UI inaccessibles, tests OK quand même)"
    fi
}
ensure_traefik

declare -A RESULT
FAILED=0

# docker compose pour un tenant : compose tenant + overlay greenmail,
# .env chargé via --project-directory.
dc() {
    local t="$1"; shift
    docker compose \
        -f "$TESTS_DIR/tenants/$t/docker-compose.yml" \
        -f "$GREENMAIL" \
        --project-directory "$TESTS_DIR/tenants/$t" \
        "$@"
}

psql_scalar() {  # <tenant> <query> -> scalaire sur stdout
    dc "$1" exec -T postgres psql -U "$1" -d "opencapture_$1" -tAc "$2" 2>/dev/null | tr -d '[:space:]'
}

record() {  # <tenant> <flow> <PASS|FAIL>
    RESULT["$1/$2"]="$3"
    [ "$3" = "PASS" ] || FAILED=1
    echo "    -> $2 : $3"
}

wait_healthy() {  # <tenant>
    local t="$1" deadline=$(( SECONDS + HEALTH_TIMEOUT ))
    echo "  [wait] backend healthy + init terminé..."
    while [ $SECONDS -lt $deadline ]; do
        local bc ic h is ie
        bc="$(dc "$t" ps -q backend 2>/dev/null)"
        ic="$(dc "$t" ps -aq init 2>/dev/null)"
        if [ -n "$bc" ] && [ -n "$ic" ]; then
            h="$(docker inspect "$bc" --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' 2>/dev/null)"
            is="$(docker inspect "$ic" --format '{{.State.Status}}' 2>/dev/null)"
            ie="$(docker inspect "$ic" --format '{{.State.ExitCode}}' 2>/dev/null)"
            if [ "$h" = "healthy" ] && [ "$is" = "exited" ] && [ "$ie" = "0" ]; then
                echo "  [wait] OK"
                return 0
            fi
        fi
        sleep 3
    done
    echo "  [wait] TIMEOUT" >&2
    return 1
}

# Attend que <query> (compteur) dépasse <baseline>. 0 si atteint.
poll_gt() {  # <tenant> <query> <baseline> <timeout>
    local t="$1" q="$2" base="$3" to="$4" deadline=$(( SECONDS + $4 )) v
    while [ $SECONDS -lt $deadline ]; do
        v="$(psql_scalar "$t" "$q")"
        if [[ "$v" =~ ^[0-9]+$ ]] && [ "$v" -gt "$base" ]; then
            return 0
        fi
        sleep 3
    done
    return 1
}

run_tenant() {
    local t="$1"
    echo "==================================================================="
    echo " TENANT $t"
    echo "==================================================================="

    echo "  [reset] down -v + wipe data"
    dc "$t" down -v --remove-orphans >/dev/null 2>&1 || true
    docker run --rm -v "$TESTS_DIR/data:/data" alpine sh -c "rm -rf /data/$t" >/dev/null 2>&1 || true

    echo "  [up]"
    if [ "$REBUILD" = 1 ]; then
        dc "$t" up -d --build || true
    else
        dc "$t" up -d || true
    fi

    if ! wait_healthy "$t"; then
        for f in verifier splitter mail fs-watcher; do record "$t" "$f" FAIL; done
        return
    fi

    # ---- VERIFIER (dépôt fichier -> fs-watcher -> worker-verifier -> documents)
    echo "  [verifier] dépôt PDF dans verifier/default"
    dc "$t" exec -T backend sh -c "cp $SAMPLE_PDF /app/share/entrant/verifier/default/v_$t.pdf" >/dev/null 2>&1
    if poll_gt "$t" "SELECT count(*) FROM documents" 0 "$FLOW_TIMEOUT"; then
        record "$t" verifier PASS
    else
        record "$t" verifier FAIL
    fi

    # ---- SPLITTER (dépôt fichier -> fs-watcher -> worker-splitter -> splitter_batches)
    echo "  [splitter] dépôt PDF dans splitter/default"
    dc "$t" exec -T backend sh -c "cp $SAMPLE_PDF /app/share/entrant/splitter/default/s_$t.pdf" >/dev/null 2>&1
    if poll_gt "$t" "SELECT count(*) FROM splitter_batches" 0 "$FLOW_TIMEOUT"; then
        record "$t" splitter PASS
    else
        record "$t" splitter FAIL
    fi

    # ---- FS-WATCHER (les 2 dépôts doivent l'avoir déclenché : >=2 succès)
    echo "  [fs-watcher] vérif logs"
    local n
    n="$(dc "$t" logs fs-watcher 2>&1 | grep -c 'Command finished successfully')"
    if [ "${n:-0}" -ge 2 ]; then
        record "$t" fs-watcher PASS
    else
        record "$t" fs-watcher FAIL
    fi

    # ---- MAIL (greenmail IMAP/SMTP -> worker-mail -> verifier -> documents)
    echo "  [mail] config mailcollect -> greenmail"
    dc "$t" exec -T postgres psql -U "$t" -d "opencapture_$t" >/dev/null 2>&1 <<'SQL'
UPDATE mailcollect SET
    secured_connection   = false,
    folder_to_crawl      = 'INBOX',
    folder_destination   = 'INBOX',
    action_after_process = 'none',
    is_splitter          = false,
    verifier_workflow_id = 'default_workflow',
    enabled              = true,
    options = '{"hostname":"greenmail","port":3143,"login":"test@example.com","password":"test"}'::jsonb
WHERE id = 1;
SQL
    local before
    before="$(psql_scalar "$t" 'SELECT count(*) FROM documents')"
    echo "  [mail] envoi mail+PDF vers greenmail:3025"
    dc "$t" exec -T backend python3 - >/dev/null 2>&1 <<'PY'
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
m = MIMEMultipart()
m['Subject'] = 'Test OC mailcollect'
m['From'] = 'exp@test.com'
m['To'] = 'test@example.com'
m.attach(MIMEText('corps de test'))
with open('/app/src/assets/not_found/document_not_found.pdf', 'rb') as f:
    p = MIMEApplication(f.read())
    p.add_header('Content-Disposition', 'attachment', filename='facture.pdf')
    m.attach(p)
s = smtplib.SMTP('greenmail', 3025)
s.sendmail('exp@test.com', 'test@example.com', m.as_string())
s.quit()
PY
    echo "  [mail] passe worker-mail (1 passe)"
    dc "$t" run --rm worker-mail >/dev/null 2>&1 || true
    if poll_gt "$t" "SELECT count(*) FROM documents" "${before:-0}" "$FLOW_TIMEOUT"; then
        record "$t" mail PASS
    else
        record "$t" mail FAIL
    fi
}

for t in "${TENANTS[@]}"; do
    run_tenant "$t"
done

echo "==================================================================="
echo " RÉSUMÉ"
echo "==================================================================="
for t in "${TENANTS[@]}"; do
    for f in verifier splitter mail fs-watcher; do
        printf "  %-7s %-11s : %s\n" "$t" "$f" "${RESULT[$t/$f]:-?}"
    done
done

if [ "$FAILED" = 0 ]; then
    echo "TOUT PASS"
    exit 0
else
    echo "DES TESTS ONT ÉCHOUÉ"
    exit 1
fi
