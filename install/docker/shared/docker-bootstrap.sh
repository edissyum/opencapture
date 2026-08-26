#!/bin/bash
# Docker-adapted tenant bootstrap.
#
# Idempotent rewrite of the host-oriented create_custom.sh:
#   - no chown to www-data (the container runs as one user)
#   - no crudini (we write custom.ini ourselves)
#   - psql connects to the postgres service over the internal network
#   - paths are container-relative: /app, /app/custom/<id>, /app/share, /app/docservers
#
# Required env vars (all set by docker-compose):
#   CUSTOM_ID, POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER,
#   POSTGRES_PASSWORD, POSTGRES_DB

set -euo pipefail

OC_PATH="${OC_PATH:-/app}"
CUSTOM_ID="${CUSTOM_ID:-edissyum}"
CUSTOM_DIR="${OC_PATH}/custom/${CUSTOM_ID}"
CUSTOM_INI="${OC_PATH}/custom/custom.ini"
DOCSERVERS_PATH="${DOCSERVERS_PATH_CONTAINER:-/app/docservers}"
SHARE_PATH="${SHARE_PATH_CONTAINER:-/app/share}"

log() { echo "[bootstrap] $*"; }

# ------------------------------------------------------------
# Sanity
# ------------------------------------------------------------
case "$CUSTOM_ID" in
    custom|""|*[!a-z0-9_]*)
        echo "[bootstrap] invalid CUSTOM_ID '${CUSTOM_ID}' (lowercase, alnum + underscore, and not 'custom')" >&2
        exit 1
        ;;
esac

# ------------------------------------------------------------
# Filesystem skeleton (idempotent)
# ------------------------------------------------------------
log "ensuring filesystem skeleton for ${CUSTOM_ID}"

mkdir -p \
    "${CUSTOM_DIR}"/{config,bin,assets,instance,src,data,journal} \
    "${CUSTOM_DIR}/journal/config" \
    "${CUSTOM_DIR}/assets/imgs" \
    "${CUSTOM_DIR}/bin/ldap/config" \
    "${CUSTOM_DIR}/bin/scripts"/{verifier_workflows,splitter_workflows,splitter_metadata,splitter_methods,MailCollect,ai} \
    "${CUSTOM_DIR}/bin/scripts/ai"/{splitter,verifier} \
    "${CUSTOM_DIR}/src/backend" \
    "${CUSTOM_DIR}/instance/referencial" \
    "${CUSTOM_DIR}/instance/upload"/{verifier,splitter} \
    "${CUSTOM_DIR}/data"/{log,MailCollect,tmp,exported_pdf,exported_pdfa,error} \
    "${CUSTOM_DIR}/data/log/Supervisor" \
    "${CUSTOM_DIR}/data/MailCollect/_ERROR" \
    "${DOCSERVERS_PATH}"/verifier/{ai,attachments,original_doc,full,thumbs,positions_masks} \
    "${DOCSERVERS_PATH}"/splitter/{ai,attachments,original_doc,batches,thumbs,error} \
    "${DOCSERVERS_PATH}"/verifier/ai/{train_data,models} \
    "${DOCSERVERS_PATH}"/splitter/ai/{train_data,models} \
    "${SHARE_PATH}"/{entrant,export}/{verifier,splitter} \
    "${SHARE_PATH}/entrant/verifier"/{ocr_only,default,default_mail} \
    "${SHARE_PATH}/entrant/splitter/default"

touch "${CUSTOM_DIR}/data/log/OpenCapture.log"

# ------------------------------------------------------------
# SHARED AI models: the instance/artificial_intelligence folder is a
# host bind mount (potentially empty on first startup). We seed it with
# the default rotation model (shipped baked OUTSIDE the mount, in
# /opt/oc-default-models) if it's missing, and ensure the contact/
# sub-folder exists (empty => contact AI cleanly disabled). Idempotent:
# a model dropped in by the user is never overwritten.
# ------------------------------------------------------------
AI_SHARED_DIR="${OC_PATH}/instance/artificial_intelligence"
mkdir -p "${AI_SHARED_DIR}/contact"
if [ -f /opt/oc-default-models/rotate_document.pt ] && \
   [ ! -e "${AI_SHARED_DIR}/rotate_document.pt" ]; then
    cp /opt/oc-default-models/rotate_document.pt "${AI_SHARED_DIR}/rotate_document.pt" || true
fi

# ------------------------------------------------------------
# Self-heal: ensure watcher.ini exists, even if the tenant has
# been bootstrapped before (watcher.ini was added after the
# original bootstrap of existing tenants).
# ------------------------------------------------------------
ensure_watcher_ini() {
    local target="${CUSTOM_DIR}/config/watcher.ini"
    [ -f "$target" ] && return 0
    if [ ! -f "${OC_PATH}/installer/config/watcher.ini.default" ]; then
        return 0
    fi
    log "generating ${target} from installer default"
    cp "${OC_PATH}/installer/config/watcher.ini.default" "$target"
    sed -i \
        -e "s#§§CUSTOM_PATH§§#${CUSTOM_DIR}#g" \
        -e "s#§§SHARE_PATH§§#${SHARE_PATH}#g" \
        -e "s#§§OC_PATH§§#${OC_PATH}#g" \
        -e "s#/run/watcher.pid#/tmp/watcher-${CUSTOM_ID}.pid#g" \
        -e "s#/var/log/watcher/daemon.log#${CUSTOM_DIR}/data/log/watcher.log#g" \
        -e "s#/var/share/#${SHARE_PATH}/#g" \
        -e "s#/var/www/html/opencapture/#${CUSTOM_DIR}/#g" \
        "$target"

    # Align section names with what the app generates at runtime:
    # createScriptAndWatcher writes [<module>_<workflow_id>_<custom_id>]
    # (see backend/src/controllers/workflow.py:358-360), while the template
    # is NOT suffixed. Without this rename, as soon as a workflow is
    # created/edited in the UI, the app can't find the section (dedup on
    # the EXACT name) and ADDS a 2nd suffixed one pointing at the SAME
    # folder -> double processing. So we suffix every section (except
    # [DEFAULT]) with the custom_id, just like the app does.
    sed -i -E "/^\[DEFAULT\]\$/! s/^\[([A-Za-z0-9_]+)\]\$/[\1_${CUSTOM_ID}]/" "$target"
}
ensure_watcher_ini

# ------------------------------------------------------------
# Self-heal: ensure the [DATABASE] section is present in
# config.ini with values from the env. The runtime code
# (backend/src/main.py) reads the postgres credentials from there
# since the upstream "Change database configuration" commit; a
# tenant whose config.ini predates that change crashes with
# KeyError: 'DATABASE'.
# ------------------------------------------------------------
ensure_database_section() {
    local target="${CUSTOM_DIR}/config/config.ini"
    [ -f "$target" ] || return 0
    if grep -q '^\[DATABASE\]' "$target"; then
        # Section already there — refresh values from env so rotating
        # POSTGRES_PASSWORD via .env is picked up on next init.
        log "refreshing [DATABASE] in ${target}"
        python - "$target" <<'PY'
import configparser, os, sys
p = sys.argv[1]
c = configparser.RawConfigParser()
c.read(p)
if "DATABASE" not in c:
    c["DATABASE"] = {}
c["DATABASE"]["postgresHost"]     = os.environ["POSTGRES_HOST"]
c["DATABASE"]["postgresPort"]     = os.environ["POSTGRES_PORT"]
c["DATABASE"]["postgresDatabase"] = os.environ["POSTGRES_DB"]
c["DATABASE"]["postgresUser"]     = os.environ["POSTGRES_USER"]
c["DATABASE"]["postgresPassword"] = os.environ["POSTGRES_PASSWORD"]
with open(p, "w") as f:
    c.write(f)
PY
    else
        log "appending [DATABASE] to ${target}"
        cat >> "$target" <<EOF

[DATABASE]
postgresHost     = ${POSTGRES_HOST}
postgresPort     = ${POSTGRES_PORT}
postgresDatabase = ${POSTGRES_DB}
postgresUser     = ${POSTGRES_USER}
postgresPassword = ${POSTGRES_PASSWORD}
EOF
    fi
}
ensure_database_section

# ------------------------------------------------------------
# Self-heal: ensure custom.ini contains a [${CUSTOM_ID}] section
# with `path` and `url`. Must run BEFORE the short-circuit to catch
# up tenants created under the old bootstrap that didn't have it in
# the first-init phase, and to add the `url` field to tenants that
# lack it (see backend commit 75a66fe "Improve custom handling using
# url").
# ------------------------------------------------------------
ensure_custom_ini_entry() {
    mkdir -p "${OC_PATH}/custom"
    touch "${CUSTOM_INI}"
    if ! grep -q "^\[${CUSTOM_ID}\]" "${CUSTOM_INI}"; then
        log "writing [${CUSTOM_ID}] section to ${CUSTOM_INI}"
        {
            echo "[${CUSTOM_ID}]"
            echo "path = ${CUSTOM_DIR}"
            # `url` is read by is_custom_exists_from_url /
            # retrieve_custom_id_from_url (backend/src/functions.py)
            # for clean-URL access at http://${OC_FQDN}/ without the
            # /${CUSTOM_ID}/ prefix.
            [ -n "${OC_FQDN:-}" ] && echo "url = ${OC_FQDN}"
            echo
        } >> "${CUSTOM_INI}"
    elif [ -n "${OC_FQDN:-}" ]; then
        # The section exists. We guarantee that `url` MATCHES OC_FQDN:
        #   - missing        -> add it;
        #   - present/diff.  -> update it (otherwise changing the FQDN via
        #                       .env wouldn't propagate: without this, clean
        #                       URL access would stay on the old domain).
        # custom.ini is SINGLE-SECTION per tenant in Docker (docker-bootstrap
        # regenerates it for that one tenant only), so replacing the `url`
        # line is safe.
        if ! grep -A 3 "^\[${CUSTOM_ID}\]" "${CUSTOM_INI}" | grep -q "^url = "; then
            log "patching [${CUSTOM_ID}] in ${CUSTOM_INI} with url = ${OC_FQDN}"
            sed -i "/^\[${CUSTOM_ID}\]/a url = ${OC_FQDN}" "${CUSTOM_INI}"
        elif ! grep -qx "url = ${OC_FQDN}" "${CUSTOM_INI}"; then
            log "updating url in [${CUSTOM_ID}] -> ${OC_FQDN}"
            sed -i "s|^url = .*|url = ${OC_FQDN}|" "${CUSTOM_INI}"
        fi
    fi
}
ensure_custom_ini_entry

# ------------------------------------------------------------
# Marker: short-circuit subsequent runs once config.ini exists
# ------------------------------------------------------------
if [ -f "${CUSTOM_DIR}/config/config.ini" ]; then
    log "tenant ${CUSTOM_ID} already initialized (${CUSTOM_DIR}/config/config.ini exists), skipping"
    exit 0
fi

log "first-time initialization of tenant ${CUSTOM_ID}"

# ------------------------------------------------------------
# Copy installer skeleton into the tenant directory
# ------------------------------------------------------------
if [ -d "${OC_PATH}/installer" ]; then
    cp -rn "${OC_PATH}/installer/." "${CUSTOM_DIR}/"
fi
if [ -d "${OC_PATH}/instance/referencial" ]; then
    cp -rn "${OC_PATH}/instance/referencial/." "${CUSTOM_DIR}/instance/referencial/" || true
fi

# Drop .gitkeep placeholders copied from the skeleton: once the real
# directories exist they serve no purpose, and an empty-but-for-.gitkeep
# directory can be misread as "non-empty" by model-detection logic.
find "${CUSTOM_DIR}" -name ".gitkeep" -delete 2>/dev/null || true

# Copy process_queue defaults into the custom python package.
cp -n "${OC_PATH}/src/process_queue_verifier.py.default" \
      "${CUSTOM_DIR}/src/backend/process_queue_verifier.py" 2>/dev/null || true
cp -n "${OC_PATH}/src/process_queue_splitter.py.default" \
      "${CUSTOM_DIR}/src/backend/process_queue_splitter.py" 2>/dev/null || true

# Ensure the python package boundaries exist.
touch "${CUSTOM_DIR}/__init__.py" \
      "${CUSTOM_DIR}/src/__init__.py" \
      "${CUSTOM_DIR}/src/backend/__init__.py"

# Copy default assets shipped by the image (logos used by the UI and by the
# splitter separator generation: opencapture.png, logo_company.png,
# login_image.svg ...). cp -n preserves any tenant-customised file already present.
if [ -d "${OC_PATH}/src/assets/imgs" ]; then
    cp -n "${OC_PATH}"/src/assets/imgs/* "${CUSTOM_DIR}/assets/imgs/" 2>/dev/null || true
fi

# ------------------------------------------------------------
# Rename .default files and substitute placeholders
# ------------------------------------------------------------
find "${CUSTOM_DIR}" -type f -name "*.default" -exec sh -c 'mv "$0" "${0%.default}"' {} \;

find "${CUSTOM_DIR}" -type f \( -name "*.py" -o -name "*.sh" -o -name "*.ini" -o -name "*.json" -o -name "*.xml" -o -name "*.conf" \) -print0 | \
    xargs -0 -r sed -i \
        -e "s#§§CUSTOM_ID§§#${CUSTOM_ID}#g" \
        -e "s#§§OC_PATH§§#${OC_PATH}#g" \
        -e "s#§§CUSTOM_PATH§§#${CUSTOM_DIR}#g" \
        -e "s#§§SHARE_PATH§§#${SHARE_PATH}#g" \
        -e "s#§§BATCH_PATH§§#${CUSTOM_DIR}/data/MailCollect#g" \
        -e "s#§§LOG_PATH§§#${CUSTOM_DIR}/data/log/OpenCapture.log#g" \
        -e "s#§§PYTHON_VENV§§##g"

# watcher.ini ships with real host paths (no §§ placeholders) that
# don't exist in the container -- patch them to writable locations
# under the tenant data dir.
if [ -f "${CUSTOM_DIR}/config/watcher.ini" ]; then
    sed -i \
        -e "s#/var/log/watcher/daemon.log#${CUSTOM_DIR}/data/log/watcher.log#g" \
        -e "s#/run/watcher.pid#/tmp/watcher-${CUSTOM_ID}.pid#g" \
        -e "s#/var/share/#${SHARE_PATH}/#g" \
        -e "s#/var/www/html/opencapture/#${CUSTOM_DIR}/#g" \
        "${CUSTOM_DIR}/config/watcher.ini"
fi

# ------------------------------------------------------------
# secret_key (custom.ini already handled by ensure_custom_ini_entry
# above the short-circuit).
# ------------------------------------------------------------
if [ ! -s "${CUSTOM_DIR}/config/secret_key" ]; then
    python -c 'import secrets; print(secrets.token_hex(32))' > "${CUSTOM_DIR}/config/secret_key"
fi

# config.ini was just created by find/sed on the .default files; it
# has the [DATABASE] section with the .default values (empty /
# localhost / opencapture_edissyum). We replay ensure_database_section
# now that the file exists so it fills in from the env.
# (The first call at the top of the script was a no-op since config.ini
# didn't exist yet.)
ensure_database_section

# ------------------------------------------------------------
# Database path patches (the schema itself is loaded by the postgres
# container via /docker-entrypoint-initdb.d/ on first start).
# ------------------------------------------------------------
export PGPASSWORD="${POSTGRES_PASSWORD}"
PSQL_CONN="-h ${POSTGRES_HOST} -p ${POSTGRES_PORT} -U ${POSTGRES_USER} -d ${POSTGRES_DB} -v ON_ERROR_STOP=1"

# Make sure the schema is actually there before patching. If it
# isn't, the postgres container's init scripts haven't run, which
# usually means someone wired the stack to an external Postgres
# without preloading it — bail with a clear message.
TABLES_PRESENT=$(psql ${PSQL_CONN} -tAc \
    "SELECT to_regclass('public.docservers') IS NOT NULL;")

if [ "${TABLES_PRESENT}" != "t" ]; then
    echo "[bootstrap] schema is missing on ${POSTGRES_HOST}/${POSTGRES_DB}." >&2
    echo "[bootstrap] The postgres container preloads it from /docker-entrypoint-initdb.d/" >&2
    echo "[bootstrap] on first start (empty PGDATA). If you wired the stack to an existing" >&2
    echo "[bootstrap] DB, load postgres/sql/{structure,global,data_fr}.sql manually." >&2
    exit 1
fi

# Patch docserver / workflow / output paths to match container layout.
log "patching docserver/workflow/output paths in DB"
psql ${PSQL_CONN} <<SQL
UPDATE docservers SET path=REPLACE(path, '/var/share/' , '${SHARE_PATH}/');
UPDATE docservers SET path=REPLACE(path, '/var/docservers/opencapture/' , '${DOCSERVERS_PATH}/');
UPDATE docservers SET path=REPLACE(path, './data/' , '${CUSTOM_DIR}/data/');
UPDATE docservers SET path=REPLACE(path, './instance/' , '${CUSTOM_DIR}/instance/');
UPDATE docservers SET path=REPLACE(path, '//' , '/');

-- PROJECT_PATH is seeded to './' and isn't touched by any REPLACE above.
-- The backend uses it as the root (§§OC_PATH§§ = PROJECT_PATH + '/') to
-- generate the fs-watcher workflow scripts. Force it to the container
-- layout, otherwise the generated scripts get OCPath='.//' (launch_worker.py
-- not found).
UPDATE docservers SET path='${OC_PATH}' WHERE docserver_id='PROJECT_PATH';

UPDATE workflows SET input = REPLACE(input::TEXT, '/var/share/', '${SHARE_PATH}/')::JSONB;

UPDATE outputs
   SET data = jsonb_set(data, '{options, parameters, 0, value}',
                        to_jsonb('${SHARE_PATH}/export/verifier/'::text))
 WHERE data #>>'{options, parameters, 0, id}' = 'folder_out';

UPDATE outputs
   SET data = jsonb_set(data, '{options, parameters, 0, value}',
                        to_jsonb('${SHARE_PATH}/export/splitter/'::text))
 WHERE data #>>'{options, parameters, 0, id}' = 'folder_out'
   AND module = 'splitter'
   AND output_type_id IN ('export_pdf', 'export_xml');

UPDATE outputs_types
   SET data = jsonb_set(data, '{options, parameters, 0, placeholder}',
                        to_jsonb('${SHARE_PATH}/export/verifier/'::text))
 WHERE data #>>'{options, parameters, 0, id}' = 'folder_out'
   AND module = 'verifier';

UPDATE outputs_types
   SET data = jsonb_set(data, '{options, parameters, 0, placeholder}',
                        to_jsonb('${SHARE_PATH}/export/splitter/'::text))
 WHERE data #>>'{options, parameters, 0, id}' = 'folder_out'
   AND module = 'splitter'
   AND output_type_id = 'export_xml';
SQL

log "tenant ${CUSTOM_ID} initialized"
