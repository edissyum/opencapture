#!/bin/bash
# Open-Capture backend entrypoint dispatcher.
#
# A single image powers every backend role. The role is the first
# CMD argument (defaults to "api"). All roles share the same code,
# the same env vars, and read the same /app/custom/<CUSTOM_ID>/ tree.

set -euo pipefail

# ------------------------------------------------------------
# Privilege drop (UID/GID pilotés par l'env, défaut 1000).
# L'image démarre en root pour pouvoir chown les bind mounts que
# Docker vient de créer en root, puis re-exec ce même script via
# gosu sous le compte de service. Au 2e passage on tourne déjà en
# APP_UID (id -u != 0) donc le bloc est sauté.
# ------------------------------------------------------------
APP_UID="${APP_UID:-1000}"
APP_GID="${APP_GID:-1000}"
APP_USER="${APP_USER:-opencapture}"

if [ "$(id -u)" = "0" ]; then
    # Si l'UID cible n'a pas d'entrée passwd (surcharge runtime sans
    # rebuild), en créer une (-o = non unique autorisé) pour les libs
    # qui appellent getpwuid().
    if ! getent passwd "${APP_UID}" >/dev/null 2>&1; then
        groupadd -o -g "${APP_GID}" "${APP_USER}" 2>/dev/null || true
        useradd  -o -u "${APP_UID}" -g "${APP_GID}" -d /app -s /bin/bash -M "${APP_USER}" 2>/dev/null || true
    fi

    # Racines de montage partagées (Docker les auto-crée en root).
    # Le dernier est le point de montage des modèles IA partagés
    # (bind RW depuis l'hôte) : à chown pour que le compte de service y accède
    # (et que docker-bootstrap.sh puisse y semer rotate_document.pt).
    mkdir -p /app/custom /app/docservers /app/share /tmp/opencapture \
             /app/instance/artificial_intelligence
    # chown top-level systématique : O(1), inoffensif.
    chown "${APP_UID}:${APP_GID}" /app/custom /app/docservers /app/share /tmp/opencapture \
             /app/instance/artificial_intelligence

    # chown -R récursif seulement au rôle init et seulement si pas déjà
    # fait (sentinelle) -> évite de parcourir des docservers volumineux
    # à chaque `up`. Pour forcer une re-réconciliation : supprimer le
    # fichier sentinelle puis relancer init.
    if [ "${1:-api}" = "init" ]; then
        SENTINEL="/app/custom/.ownership-${APP_UID}-ok"
        if [ ! -e "$SENTINEL" ]; then
            echo "[entrypoint] reconciling ownership -> ${APP_UID}:${APP_GID} (one-time)"
            chown -R "${APP_UID}:${APP_GID}" /app/custom /app/docservers /app/share || true
            # Sentinelle possédée par le compte de service (pas root) pour
            # qu'un audit `find ! -uid <uid>` ne la signale pas.
            touch "$SENTINEL" && chown "${APP_UID}:${APP_GID}" "$SENTINEL" || true
        fi
    fi

    # Re-exec ce script sous l'UID cible (numérique = sûr même si
    # surchargé). exec remplace le process : pas de double set -e.
    exec gosu "${APP_UID}:${APP_GID}" "$0" "$@"
fi
# ------------------------------------------------------------
# À partir d'ici on tourne en APP_UID.
# ------------------------------------------------------------

ROLE="${1:-api}"
CUSTOM_ID="${CUSTOM_ID:-edissyum}"

# Wait for postgres to accept connections before starting any role
# that talks to the DB. The healthcheck on the postgres service
# usually handles this, but workers may restart faster than the
# health probe interval.
# pg_isreadey is a postgresql function (man pg_isready)
wait_for_postgres() {
    local retries=60
    until pg_isready -h "${POSTGRES_HOST}" -p "${POSTGRES_PORT}" \
                     -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" \
                     >/dev/null 2>&1; do
        retries=$((retries - 1))
        if [ "$retries" -le 0 ]; then
            echo "[entrypoint] postgres at ${POSTGRES_HOST}:${POSTGRES_PORT} never became ready" >&2
            exit 1
        fi
        sleep 1
    done
}

wait_for_rabbit() {
    local retries=60
    until (echo > /dev/tcp/"${RABBIT_HOST}"/"${RABBIT_PORT}") 2>/dev/null; do
        retries=$((retries - 1))
        if [ "$retries" -le 0 ]; then
            echo "[entrypoint] rabbitmq at ${RABBIT_HOST}:${RABBIT_PORT} never opened" >&2
            exit 1
        fi
        sleep 1
    done
}

# Ensure the tenant has been bootstrapped. bootstrap.sh is idempotent
# and is also run by the dedicated `init` service, so workers
# starting after init are usually a no-op here.
ensure_tenant() {
    if [ ! -f "/app/custom/${CUSTOM_ID}/config/config.ini" ]; then
        echo "[entrypoint] tenant ${CUSTOM_ID} not initialized, running bootstrap..."
        /app/docker-bootstrap.sh
    fi
}

case "$ROLE" in
    init)
        wait_for_postgres
        exec /app/docker-bootstrap.sh
        ;;

    api)
        wait_for_postgres
        ensure_tenant
        cd /app
        # GUNICORN_EXTRA_ARGS lets the dev overlay add --reload without
        # rewriting the whole command line.
        # shellcheck disable=SC2086
        exec gunicorn --bind 0.0.0.0:8000 wsgi:app \
            --timeout 600 \
            --workers "${GUNICORN_WORKERS:-2}" \
            --threads "${GUNICORN_THREADS:-2}" \
            --worker-class gthread \
            --log-level "${GUNICORN_LOG_LEVEL:-info}" \
            --capture-output \
            --access-logfile - \
            --error-logfile - \
            ${GUNICORN_EXTRA_ARGS:-}
        ;;

    worker-verifier)
        wait_for_postgres
        wait_for_rabbit
        ensure_tenant
        cd /app
        exec kuyruk \
            --app "custom.${CUSTOM_ID}.src.backend.process_queue_verifier.kuyruk" \
            worker --queue "verifier_${CUSTOM_ID}"
        ;;

    worker-splitter)
        wait_for_postgres
        wait_for_rabbit
        ensure_tenant
        cd /app
        exec kuyruk \
            --app "custom.${CUSTOM_ID}.src.backend.process_queue_splitter.kuyruk" \
            worker --queue "splitter_${CUSTOM_ID}"
        ;;

    worker-mail)
        wait_for_postgres
        wait_for_rabbit
        ensure_tenant
        cd /app
        # launch_worker_mail.py exits after one IMAP sweep; we relaunch
        # it on an interval. Pass MAIL_POLL_INTERVAL=0 to run once.
        interval="${MAIL_POLL_INTERVAL:-60}"
        while true; do
            python launch_worker_mail.py -c "${CUSTOM_ID}" || \
                echo "[worker-mail] launch_worker_mail.py exited with $?, retrying..."
            [ "$interval" -eq 0 ] && exit 0
            sleep "$interval"
        done
        ;;

    fs-watcher)
        wait_for_postgres
        wait_for_rabbit
        ensure_tenant
        cd /app
        # The pypi package "fs-watcher" installs its CLI as `watcher`.
        # The .ini lives in the tenant directory (bootstrap.sh has
        # already substituted §§OC_PATH§§ placeholders inside it).
        WATCHER_INI="${WATCHER_INI:-/app/custom/${CUSTOM_ID}/config/watcher.ini}"
        if [ ! -f "$WATCHER_INI" ]; then
            # Fallback: the global default at /app/instance/config/watcher.ini.
            WATCHER_INI=/app/instance/config/watcher.ini
        fi
        echo "[fs-watcher] using config: ${WATCHER_INI}"
        # `start` daemonises via python-daemon and exits the foreground
        # process, which makes Docker think the container has stopped.
        # `debug` runs in the foreground -- exactly what we want as PID 1.
        exec watcher -c "$WATCHER_INI" debug
        ;;

    shell|bash)
        exec /bin/bash "${@:2}"
        ;;

    *)
        # Allow passing an arbitrary command, useful for one-shots.
        exec "$@"
        ;;
esac
