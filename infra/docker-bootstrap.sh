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
    "${CUSTOM_DIR}/data"/{log,MailCollect,tmp,exported_pdf,exported_pdfa,error} \
    "${CUSTOM_DIR}/data/log/Supervisor" \
    "${CUSTOM_DIR}/data/MailCollect/_ERROR" \
    "${DOCSERVERS_PATH}"/verifier/{ai,attachments,original_doc,full,thumbs,positions_masks} \
    "${DOCSERVERS_PATH}"/splitter/{ai,attachments,original_doc,batches,thumbs,error} \
    "${DOCSERVERS_PATH}"/verifier/ai/{train_data,models} \
    "${DOCSERVERS_PATH}"/splitter/ai/{train_data,models} \
    "${SHARE_PATH}"/{entrant,export}/{verifier,splitter} \
    "${SHARE_PATH}/entrant/verifier"/{ocr_only,default,default_mail}

touch "${CUSTOM_DIR}/data/log/OpenCapture.log"

# ------------------------------------------------------------
# Self-heal: ensure watcher.ini exists, even if the tenant has
# been bootstrapped before (watcher.ini was added after the
# original bootstrap of existing tenants).
# ------------------------------------------------------------
ensure_watcher_ini() {
    local target="${CUSTOM_DIR}/config/watcher.ini"
    [ -f "$target" ] && return 0
    if [ ! -f "${OC_PATH}/instance/config/watcher.ini.default" ]; then
        return 0
    fi
    log "generating ${target} from instance default"
    cp "${OC_PATH}/instance/config/watcher.ini.default" "$target"
    sed -i \
        -e "s#/var/log/watcher/daemon.log#${CUSTOM_DIR}/data/log/watcher.log#g" \
        -e "s#/run/watcher.pid#/tmp/watcher-${CUSTOM_ID}.pid#g" \
        -e "s#/var/share/#${SHARE_PATH}/#g" \
        -e "s#/var/www/html/opencapture/#${CUSTOM_DIR}/#g" \
        "$target"
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

# Copy process_queue defaults into the custom python package.
cp -n "${OC_PATH}/src/process_queue_verifier.py.default" \
      "${CUSTOM_DIR}/src/backend/process_queue_verifier.py" 2>/dev/null || true
cp -n "${OC_PATH}/src/process_queue_splitter.py.default" \
      "${CUSTOM_DIR}/src/backend/process_queue_splitter.py" 2>/dev/null || true

# Ensure the python package boundaries exist.
touch "${CUSTOM_DIR}/__init__.py" \
      "${CUSTOM_DIR}/src/__init__.py" \
      "${CUSTOM_DIR}/src/backend/__init__.py"

# Copy default assets if shipped by the image.
[ -f "${OC_PATH}/src/assets/imgs/opencapture.png" ] && \
    cp -n "${OC_PATH}/src/assets/imgs/opencapture.png" "${CUSTOM_DIR}/assets/imgs/" || true

# ------------------------------------------------------------
# Rename .default files and substitute placeholders
# ------------------------------------------------------------
find "${CUSTOM_DIR}" -type f -name "*.default" -exec sh -c 'mv "$0" "${0%.default}"' {} \;

find "${CUSTOM_DIR}" -type f \( -name "*.py" -o -name "*.sh" -o -name "*.ini" -o -name "*.json" -o -name "*.xml" -o -name "*.conf" \) -print0 | \
    xargs -0 -r sed -i \
        -e "s#§§CUSTOM_ID§§#${CUSTOM_ID}#g" \
        -e "s#§§OC_PATH§§#${OC_PATH}#g" \
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
# custom.ini index + secret_key
# ------------------------------------------------------------
mkdir -p "${OC_PATH}/custom"
touch "${CUSTOM_INI}"
if ! grep -q "^\[${CUSTOM_ID}\]" "${CUSTOM_INI}"; then
    {
        echo "[${CUSTOM_ID}]"
        echo "path = ${CUSTOM_DIR}"
        echo
    } >> "${CUSTOM_INI}"
fi

if [ ! -s "${CUSTOM_DIR}/config/secret_key" ]; then
    python -c 'import secrets; print(secrets.token_hex(32))' > "${CUSTOM_DIR}/config/secret_key"
fi

# Le config.ini vient d'être créé par find/sed sur les .default ;
# il a la section [DATABASE] avec les valeurs du .default (vides /
# localhost / opencapture_edissyum). On rejoue ensure_database_section
# maintenant que le fichier existe pour qu'elle remplisse avec l'env.
# (Le premier appel en haut du script a no-op'é car config.ini n'existait pas.)
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
