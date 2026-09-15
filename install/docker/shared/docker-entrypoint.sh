#!/bin/bash
# Open-Capture backend entrypoint dispatcher.
#
# A single image powers every backend role. The role is the first
# CMD argument (defaults to "api"). All roles share the same code,
# the same env vars, and read the same /app/custom/<CUSTOM_ID>/ tree.

set -euo pipefail

# ------------------------------------------------------------
# Privilege drop (UID/GID driven by the env, default 1000).
# The image starts as root so it can chown the bind mounts that
# Docker just created as root, then re-execs this same script via
# gosu under the service account. On the 2nd pass we're already
# running as APP_UID (id -u != 0) so this block is skipped.
# ------------------------------------------------------------
APP_UID="${APP_UID:-1000}"
APP_GID="${APP_GID:-1000}"
APP_USER="${APP_USER:-opencapture}"

if [ "$(id -u)" = "0" ]; then
    # If the target UID has no passwd entry (runtime override without a
    # rebuild), create one (-o = non-unique allowed) for libs that call
    # getpwuid() (e.g. getpass.getuser(), used by torch). The
    # "${APP_USER}" group/user already exists (built into the image at
    # the build UID/GID, see Dockerfile): a groupadd/useradd under that
    # SAME name fails ("already exists") without touching the UID -> no
    # entry for the target, silent failure (seen in practice: image built
    # at 1001, tenant at 1000 -> getpass crash at boot). We modify the
    # existing one instead of creating a second.
    if ! getent passwd "${APP_UID}" >/dev/null 2>&1; then
        if getent group "${APP_USER}" >/dev/null 2>&1; then
            groupmod -o -g "${APP_GID}" "${APP_USER}" 2>/dev/null || true
        else
            groupadd -o -g "${APP_GID}" "${APP_USER}" 2>/dev/null || true
        fi
        if getent passwd "${APP_USER}" >/dev/null 2>&1; then
            usermod -o -u "${APP_UID}" -g "${APP_GID}" "${APP_USER}" 2>/dev/null || true
        else
            useradd -o -u "${APP_UID}" -g "${APP_GID}" -d /app -s /bin/bash -M "${APP_USER}" 2>/dev/null || true
        fi
    fi

    # Shared mount roots (Docker auto-creates them as root).
    # The last one is the mount point for the shared AI models
    # (RW bind from the host): chown it so the service account can
    # access it (and so docker-bootstrap.sh can seed rotate_document.pt there).
    mkdir -p /app/custom /app/docservers /app/share /tmp/opencapture \
             /app/instance/artificial_intelligence
    # Systematic top-level chown: O(1), harmless.
    chown "${APP_UID}:${APP_GID}" /app/custom /app/docservers /app/share /tmp/opencapture \
             /app/instance/artificial_intelligence

    # Recursive chown -R only for the init role, and only if not already
    # done (sentinel) -> avoids walking potentially huge docservers on
    # every `up`. To force a re-reconciliation: delete the sentinel
    # file then rerun init.
    if [ "${1:-api}" = "init" ]; then
        SENTINEL="/app/custom/.ownership-${APP_UID}-ok"
        if [ ! -e "$SENTINEL" ]; then
            echo "[entrypoint] reconciling ownership -> ${APP_UID}:${APP_GID} (one-time)"
            chown -R "${APP_UID}:${APP_GID}" /app/custom /app/docservers /app/share || true
            # Sentinel owned by the service account (not root) so a
            # `find ! -uid <uid>` audit doesn't flag it.
            touch "$SENTINEL" && chown "${APP_UID}:${APP_GID}" "$SENTINEL" || true
        fi
    fi

    # Re-exec this script under the target UID (numeric = safe even if
    # overridden). exec replaces the process: no double set -e.
    exec gosu "${APP_UID}:${APP_GID}" "$0" "$@"
fi
# ------------------------------------------------------------
# From here on we're running as APP_UID.
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
        #
        # --preload (OPT-IN, default OFF): the master imports wsgi:app once
        # then forks the workers -> shared pages via copy-on-write.
        # MARGINAL benefit once the torch import is made lazy, and
        # enabling it requires an image rebuild + stack recreation anyway
        # (this block is baked into the entrypoint) -> NOT a hot toggle.
        # Enable per tenant AFTER validation: GUNICORN_PRELOAD=1 in its
        # environment. Incompatible with --reload (so never in dev).
        preload_arg=""
        [ "${GUNICORN_PRELOAD:-0}" = "1" ] && preload_arg="--preload"

        # shellcheck disable=SC2086
        exec gunicorn --bind 0.0.0.0:8000 wsgi:app \
            --timeout 600 \
            --workers "${GUNICORN_WORKERS:-2}" \
            --threads "${GUNICORN_THREADS:-2}" \
            --worker-class gthread \
            --max-requests "${GUNICORN_MAX_REQUESTS:-1000}" \
            --max-requests-jitter "${GUNICORN_MAX_REQUESTS_JITTER:-100}" \
            ${preload_arg} \
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

    scheduler)
        # Per-tenant cron. SCHEDULER_JOBS holds ";"-separated "HH:MM|command"
        # entries, run from the tenant custom dir with every tenant volume
        # mounted (custom, docservers, share). Anchored on the wall clock: a
        # restart neither shifts a run nor fires one at deploy time.
        wait_for_postgres
        ensure_tenant
        cd "/app/custom/${CUSTOM_ID}"

        declare -a JOB_AT JOB_CMD
        IFS=';' read -ra scheduler_entries <<< "${SCHEDULER_JOBS:-}"
        for entry in ${scheduler_entries[@]+"${scheduler_entries[@]}"}; do
            entry="$(printf '%s' "$entry" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
            [ -n "$entry" ] || continue
            case "$entry" in
                [01][0-9]:[0-5][0-9]\|*|2[0-3]:[0-5][0-9]\|*)
                    JOB_AT+=("${entry%%|*}")
                    JOB_CMD+=("${entry#*|}")
                    ;;
                *) echo "[scheduler] ignored (expected HH:MM|command): $entry" >&2 ;;
            esac
        done

        if [ "${#JOB_AT[@]}" -eq 0 ]; then
            # Idle rather than exit: `restart: unless-stopped` would loop.
            echo "[scheduler] no job in SCHEDULER_JOBS, idling"
            exec sleep infinity
        fi

        run_job() {
            local at="${JOB_AT[$1]}" cmd="${JOB_CMD[$1]}" rc=0
            echo "[scheduler] $(date '+%F %T') start ($at): $cmd"
            eval "$cmd" || rc=$?
            if [ "$rc" -eq 0 ]; then
                echo "[scheduler] $(date '+%F %T') done ($at): $cmd"
            else
                echo "[scheduler] $(date '+%F %T') FAILED rc=$rc ($at): $cmd" >&2
            fi
        }

        echo "[scheduler] ${#JOB_AT[@]} job(s) scheduled, TZ=${TZ:-system}"
        if [ "${SCHEDULER_RUN_AT_START:-0}" = "1" ]; then
            for i in "${!JOB_AT[@]}"; do run_job "$i"; done
        fi

        while true; do
            now="$(date +%s)"
            next=""
            for i in "${!JOB_AT[@]}"; do
                due="$(date -d "today ${JOB_AT[$i]}" +%s)"
                [ "$due" -le "$now" ] && due="$(date -d "tomorrow ${JOB_AT[$i]}" +%s)"
                { [ -z "$next" ] || [ "$due" -lt "$next" ]; } && next="$due"
            done
            echo "[scheduler] next run at $(date -d "@$next" '+%F %T')"
            sleep "$(( next - now > 0 ? next - now : 1 ))"

            # Collect before running: a long job must not make the next one
            # miss its own window.
            now="$(date +%s)"
            declare -a batch=()
            for i in "${!JOB_AT[@]}"; do
                due="$(date -d "today ${JOB_AT[$i]}" +%s)"
                { [ "$due" -le "$now" ] && [ "$(( now - due ))" -lt 60 ]; } && batch+=("$i")
            done
            for i in ${batch[@]+"${batch[@]}"}; do run_job "$i"; done
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
