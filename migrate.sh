#!/usr/bin/env bash
#
# migrate.sh — migration d'une install OpenCapture NON dockerisée
# (bare-metal Edissyum) vers la stack Docker de ce dépôt, en reprenant les
# données (base PostgreSQL + docservers + custom + share).
#
# Modèle : 1 custom bare-metal = 1 tenant Docker (1 stack + 1 DB).
# La migration est conçue en 3 étapes via un "bundle" portable :
#
#   1) export    : depuis la source (locale OU distante par SSH), produit un
#                  bundle (dump SQL + tar des dossiers + métadonnées) PAR custom.
#   2) diagnose  : compare le schéma de chaque DB source au schéma cible
#                  (postgres/sql/structure.sql) — détecte un écart de version.
#   3) import    : sur l'hôte Docker, dépose les données, réécrit les chemins
#                  (fichiers + base), restaure la DB, puis déploie le tenant.
#
# Le bundle découple source et cible : on peut exporter sur une machine,
# transporter le dossier, puis importer sur une autre.
#
# Usage :
#   ./migrate.sh export   --source <local|user@host> --oc-root <path> --out <bundle> [--custom id]... [--no-share]
#   ./migrate.sh diagnose --bundle <dir> [--custom id]...
#   ./migrate.sh import   --bundle <dir> [--custom id]... [--force] [--no-deploy]
#                         [--admin-user <u> --admin-password <p>]   (ré-enregistre les
#                         workflows via l'API après déploiement ; sinon étape sautée.
#                         Aussi via env OC_ADMIN_USER / OC_ADMIN_PASSWORD.)
#   ./migrate.sh reregister --custom <id> --admin-user <u> --admin-password <p>
#                         (ré-enregistre les workflows d'un tenant DÉJÀ déployé :
#                         régénère les scripts *_workflows/*.sh + watcher.ini, puis
#                         redémarre fs-watcher. À jouer si import a été fait sans creds.)
#
# Exemples :
#   # Source distante, tous les customs :
#   ./migrate.sh export --source root@vieux-serveur --oc-root /var/www/html/opencapture --out /tmp/oc-bundle
#   ./migrate.sh diagnose --bundle /tmp/oc-bundle
#   # (créer les stubs tenants au préalable : ./new-tenant.sh le <id> + éditer .env)
#   ./migrate.sh import   --bundle /tmp/oc-bundle
#
#   # Source locale (bare-metal sur la même machine que Docker) :
#   ./migrate.sh export --source local --oc-root /var/www/html/opencapture --out /tmp/oc-bundle
#
# Prérequis IMPORTANTS (voir runbooks/migration/01-migrate-vers-docker.md) :
#   - Migration À FROID : arrêter le traitement sur la source (workers, watcher,
#     mailcollect) et vider les files avant l'export, sinon états incohérents.
#   - Pour chaque custom, le stub tenant doit exister AVANT l'import :
#       ./new-tenant.sh <http|le|cert> <id>  puis éditer stub-tenants/<id>/.env
#       (OC_FQDN + mots de passe). L'import lit ce .env.
#   - Source et image Docker idéalement à la MÊME version OpenCapture (cf. diagnose).

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STRUCTURE_SQL="$REPO_ROOT/postgres/sql/structure.sql"
DATA_FR_SQL="$REPO_ROOT/postgres/sql/data_fr.sql"

# ---------------------------------------------------------------------------
# Utilitaires
# ---------------------------------------------------------------------------
log()  { echo "[migrate] $*"; }
warn() { echo "[migrate] ⚠ $*" >&2; }
die()  { echo "[migrate] ✗ $*" >&2; exit 1; }
trim() { local s="$*"; s="${s#"${s%%[![:space:]]*}"}"; s="${s%"${s##*[![:space:]]}"}"; printf '%s' "$s"; }

# Source : vide = locale, sinon cible SSH (user@host).
SRC=""

# Commande SSH pour la source distante. Défaut : clé, sans interaction
# (BatchMode). Surchargeable pour l'auth par mot de passe, ex. :
#   MIGRATE_SSH="sshpass -p '****' ssh -o StrictHostKeyChecking=accept-new" \
#       ./migrate.sh export --source user@host ...
# Non quoté à l'usage : word-splitting voulu ("sshpass -p x ssh ...").
SSH_CMD="${MIGRATE_SSH:-ssh -o BatchMode=yes}"

# Exécute une commande shell SUR la source (locale ou distante).
src_run() {
    if [ -z "$SRC" ]; then
        bash -c "$1"
    else
        $SSH_CMD "$SRC" "$1"
    fi
}
src_exists_dir()  { src_run "test -d '$1'" 2>/dev/null; }
src_exists_file() { src_run "test -f '$1'" 2>/dev/null; }
src_cat()         { src_run "cat -- '$1'"; }

# Lit une valeur 'clé = valeur' dans une section d'un .ini fourni sur stdin.
# Tolère les espaces parasites (config.ini écrit " valeur" avec une espace).
ini_value() {
    local section="$1" key="$2"
    awk -v sect="[$section]" -v key="$key" '
        $0 ~ /^\[.*\]/ { in_sect = ($0 == sect) }
        in_sect {
            line=$0; sub(/;.*/,"",line)
            n=index(line,"=")
            if (n>0) {
                k=substr(line,1,n-1); v=substr(line,n+1)
                gsub(/^[ \t]+|[ \t]+$/,"",k); gsub(/^[ \t]+|[ \t]+$/,"",v)
                if (k==key) { print v; exit }
            }
        }'
}

# docker compose ciblé pour un tenant (réplique la logique de deploy.sh).
compose_dir_for() {
    local t="$1"
    if [ "$t" = "default" ] && [ -f "$REPO_ROOT/infra/docker-compose.yml" ]; then
        echo "$REPO_ROOT/infra"
    elif [ -f "$REPO_ROOT/stub-tenants/$t/docker-compose.yml" ]; then
        echo "$REPO_ROOT/stub-tenants/$t"
    else
        return 1
    fi
}
dc() {
    local t="$1"; shift
    local dir; dir="$(compose_dir_for "$t")" || die "compose introuvable pour le tenant '$t'"
    docker compose --project-directory "$dir" -f "$dir/docker-compose.yml" "$@"
}

# ===========================================================================
# EXPORT
# ===========================================================================
cmd_export() {
    local oc_root="" out="" want_share=1
    local -a only=()
    while [ $# -gt 0 ]; do
        case "$1" in
            --source)  SRC="$2"; [ "$SRC" = "local" ] && SRC=""; shift 2 ;;
            --oc-root) oc_root="$2"; shift 2 ;;
            --out)     out="$2"; shift 2 ;;
            --custom)  only+=("$2"); shift 2 ;;
            --no-share) want_share=0; shift ;;
            *) die "export : option inconnue '$1'" ;;
        esac
    done
    [ -n "$oc_root" ] || die "export : --oc-root requis"
    [ -n "$out" ]     || die "export : --out requis"
    oc_root="${oc_root%/}"

    local custom_ini="$oc_root/custom/custom.ini"
    src_exists_file "$custom_ini" || die "custom.ini introuvable sur la source : $custom_ini"

    mkdir -p "$out/customs"
    {
        echo "# bundle de migration OpenCapture"
        echo "source   = ${SRC:-local}"
        echo "oc_root  = $oc_root"
    } > "$out/manifest.txt"

    # Énumère les customs (sections du custom.ini), filtre par --custom si fourni.
    local ini_content; ini_content="$(src_cat "$custom_ini")"
    local -a customs=()
    while IFS= read -r sec; do
        [ -n "$sec" ] && customs+=("$sec")
    done < <(printf '%s\n' "$ini_content" | sed -n 's/^\[\(.*\)\]$/\1/p')
    [ ${#customs[@]} -gt 0 ] || die "aucun custom dans $custom_ini"

    log "customs détectés : ${customs[*]}"

    for cid in "${customs[@]}"; do
        if [ ${#only[@]} -gt 0 ] && ! printf '%s\n' "${only[@]}" | grep -qx "$cid"; then
            continue
        fi
        log "=== export custom '$cid' ==="
        local cdir; cdir="$(printf '%s\n' "$ini_content" \
            | awk -v s="[$cid]" '$0==s{f=1;next} /^\[/{f=0} f&&/^[ \t]*path[ \t]*=/{sub(/^[^=]*=/,"");gsub(/^[ \t]+|[ \t]+$/,"");print;exit}')"
        local curl; curl="$(printf '%s\n' "$ini_content" \
            | awk -v s="[$cid]" '$0==s{f=1;next} /^\[/{f=0} f&&/^[ \t]*url[ \t]*=/{sub(/^[^=]*=/,"");gsub(/^[ \t]+|[ \t]+$/,"");print;exit}')"
        [ -n "$cdir" ] || { warn "path absent pour [$cid], custom ignoré"; continue; }
        # custom.ini peut stocker un chemin RELATIF (ex. dev : path = ./custom/<id>),
        # résolu par l'app depuis la racine projet. On le rend absolu contre --oc-root,
        # sinon le test/ssh s'exécute depuis le $HOME et ne trouve rien.
        case "$cdir" in
            /*) ;;
            ./*) cdir="$oc_root/${cdir#./}" ;;
            *)   cdir="$oc_root/$cdir" ;;
        esac
        src_exists_dir "$cdir" || { warn "dossier custom absent ($cdir), ignoré"; continue; }

        local conf="$cdir/config/config.ini"
        src_exists_file "$conf" || { warn "config.ini absent ($conf), custom '$cid' ignoré"; continue; }
        local conf_content; conf_content="$(src_cat "$conf")"
        local db_host db_port db_name db_user db_pass
        db_host="$(trim "$(printf '%s\n' "$conf_content" | ini_value DATABASE postgresHost)")"
        db_port="$(trim "$(printf '%s\n' "$conf_content" | ini_value DATABASE postgresPort)")"
        db_name="$(trim "$(printf '%s\n' "$conf_content" | ini_value DATABASE postgresDatabase)")"
        db_user="$(trim "$(printf '%s\n' "$conf_content" | ini_value DATABASE postgresUser)")"
        db_pass="$(trim "$(printf '%s\n' "$conf_content" | ini_value DATABASE postgresPassword)")"
        : "${db_host:=localhost}" ; : "${db_port:=5432}"
        [ -n "$db_name" ] || { warn "postgresDatabase vide pour '$cid', ignoré"; continue; }

        local cb="$out/customs/$cid"
        mkdir -p "$cb"

        # Détecte les bases docservers / share réelles depuis la DB (autorité).
        local psql_base="PGPASSWORD='$db_pass' psql -h '$db_host' -p '$db_port' -U '$db_user' -d '$db_name' -At"
        local docservers_src share_src
        docservers_src="$(trim "$(src_run "$psql_base -c \"SELECT path FROM docservers WHERE docserver_id='DOCSERVERS_PATH'\"" || true)")"
        share_src="$(trim "$(src_run "$psql_base -c \"SELECT path FROM docservers WHERE docserver_id='INPUTS_ALLOWED_PATH'\"" || true)")"
        : "${docservers_src:=/var/docservers/opencapture/}"
        : "${share_src:=/var/share/}"

        log "  DB=$db_name@$db_host:$db_port  docservers=$docservers_src  share=$share_src"

        # 1) Dump SQL portable (drop+recreate, sans owner/privilèges).
        log "  pg_dump -> db.dump.sql"
        src_run "PGPASSWORD='$db_pass' pg_dump -h '$db_host' -p '$db_port' -U '$db_user' -d '$db_name' \
                 --clean --if-exists --no-owner --no-privileges" > "$cb/db.dump.sql" \
            || die "pg_dump a échoué pour '$cid' (vérifier les identifiants / l'accès)"

        # 2) Empreinte de schéma (pour diagnose) : table:colonne, une par ligne.
        src_run "$psql_base -c \"SELECT table_name||':'||column_name FROM information_schema.columns \
                 WHERE table_schema='public' ORDER BY table_name, column_name\"" > "$cb/schema.cols.txt" || true

        # 2b) Catalogue de données de référence (clés lues par le code) : table:clé.
        #     Détecte une dérive de version INVISIBLE au schéma (ex. une nouvelle
        #     'configuration' attendue par le code mais absente d'une base ancienne).
        local cat_sql="SELECT 'configurations:'||label FROM configurations \
            UNION ALL SELECT 'docservers:'||docserver_id FROM docservers \
            UNION ALL SELECT 'privileges:'||label FROM privileges"
        src_run "$psql_base -c \"$cat_sql\"" > "$cb/catalog.txt" 2>/dev/null || true

        # 3) Dossiers : custom/<id>, docservers, share (export uniquement).
        log "  tar custom/"
        src_run "tar -czf - -C '$cdir' ." > "$cb/custom.tar.gz"
        log "  tar docservers/"
        src_exists_dir "$docservers_src" \
            && src_run "tar -czf - -C '$docservers_src' ." > "$cb/docservers.tar.gz" \
            || warn "docservers absent ($docservers_src) — pas d'archive"

        # 3b) Pièces jointes PARTAGÉES : VERIFIER/SPLITTER_ATTACHMENTS vivent à la
        #     RACINE des docservers (siblings du sous-dossier custom), donc HORS de
        #     docservers.tar.gz (qui n'archive que DOCSERVERS_PATH). On les capture à
        #     part, par module, pour les déposer dans le layout conteneur à l'import.
        local att_src
        for mod in verifier splitter; do
            att_src="$(trim "$(src_run "$psql_base -c \"SELECT path FROM docservers WHERE docserver_id='${mod^^}_ATTACHMENTS'\"" || true)")"
            [ -n "$att_src" ] && src_exists_dir "$att_src" || continue
            log "  tar ${mod} attachments partagés"
            src_run "tar -czf - -C '${att_src%/}' ." > "$cb/att-${mod}.tar.gz"
        done
        if [ "$want_share" = 1 ] && src_exists_dir "${share_src%/}/export"; then
            log "  tar share/export/"
            src_run "tar -czf - -C '${share_src%/}/export' ." > "$cb/share-export.tar.gz"
        fi
        # 4) Modèles IA globaux (rotate + contact), s'ils existent.
        local ai_src="$cdir/instance/artificial_intelligence"
        if src_exists_dir "$ai_src"; then
            log "  tar instance/artificial_intelligence/"
            src_run "tar -czf - -C '$ai_src' ." > "$cb/ai-models.tar.gz"
        fi

        # 5) Métadonnées du custom (consommées par import).
        {
            echo "CUSTOM_ID=$cid"
            echo "URL=$curl"
            echo "DB_NAME=$db_name"
            echo "CUSTOM_SRC=$cdir"
            echo "DOCSERVERS_SRC=${docservers_src%/}"
            echo "SHARE_SRC=${share_src%/}"
            echo "OC_ROOT=$oc_root"
        } > "$cb/meta.env"

        log "  ✓ custom '$cid' exporté -> $cb"
    done
    log "Export terminé : $out"
    log "Étape suivante : ./migrate.sh diagnose --bundle $out"
}

# ===========================================================================
# DIAGNOSE — comparaison de schéma source vs cible (détection de version)
# ===========================================================================

# Empreinte attendue (cible) : table:colonne extraites de structure.sql.
# Volontairement sans match(...,arr) (extension gawk) -> portable mawk/gawk.
target_schema_cols() {
    awk '
        # CREATE TABLE insensible à la casse ("CREATE table" existe dans le seed).
        /^[Cc][Rr][Ee][Aa][Tt][Ee] [Tt][Aa][Bb][Ll][Ee] "/ {
            t=$0; sub(/^[Cc][Rr][Ee][Aa][Tt][Ee] [Tt][Aa][Bb][Ll][Ee] "/,"",t)
            sub(/".*/,"",t); t=tolower(t); intable=1; next
        }
        # Colonne = "nom" SUIVI d_un espace (donc un type). Exclut les clés JSON
        # d_un DEFAULT multi-ligne ("options": {, "auth": [], ...) où le " est
        # immédiatement suivi de ":".
        intable && /^[ \t]*"[a-zA-Z0-9_]+"[ \t]/ {
            c=$0; sub(/^[ \t]*"/,"",c); sub(/".*/,"",c); print t":"tolower(c)
        }
        intable && /^\);/ { intable=0 }
    ' "$STRUCTURE_SQL" | sort -u
}

# Catalogue attendu (cible) : table:clé extraites des INSERT du seed data_fr.sql.
# configurations/docservers : la clé est la 1re valeur ; privileges : la 2e
# (après l'id numérique). Couvre les clés les plus lues par le code.
target_catalog() {
    {
        grep -hE 'INSERT INTO "configurations"' "$DATA_FR_SQL" \
            | sed -E "s/.*VALUES \('([^']+)'.*/configurations:\1/"
        grep -hE 'INSERT INTO "docservers"' "$DATA_FR_SQL" \
            | sed -E "s/.*VALUES \('([^']+)'.*/docservers:\1/"
        grep -hE 'INSERT INTO "privileges"' "$DATA_FR_SQL" \
            | sed -E "s/.*VALUES \(([0-9]+, )?'([^']+)'.*/privileges:\2/"
    } 2>/dev/null | grep -E '^(configurations|docservers|privileges):' | sort -u
}

diagnose_one() {
    local cb="$1" cid="$2"
    [ -f "$cb/schema.cols.txt" ] || { warn "[$cid] schema.cols.txt absent — diagnostic impossible"; return 2; }
    local tmp_t tmp_s; tmp_t="$(mktemp)"; tmp_s="$(mktemp)"
    target_schema_cols > "$tmp_t"
    tr 'A-Z' 'a-z' < "$cb/schema.cols.txt" | sort -u > "$tmp_s"

    local missing extra rc=0
    missing="$(comm -23 "$tmp_t" "$tmp_s")"   # attendu par la cible, absent de la source
    extra="$(comm -13 "$tmp_t" "$tmp_s")"     # présent dans la source, inconnu de la cible
    rm -f "$tmp_t" "$tmp_s"

    if [ -z "$missing" ] && [ -z "$extra" ]; then
        log "[$cid] schéma IDENTIQUE à la cible (4.0.0) ✓"
    else
        warn "[$cid] ÉCART DE SCHÉMA détecté (probable différence de version) :"
        [ -n "$missing" ] && { echo "  -- colonnes attendues par la CIBLE mais ABSENTES de la source :"; echo "$missing" | sed 's/^/     - /'; }
        [ -n "$extra" ]   && { echo "  -- colonnes présentes dans la SOURCE mais inconnues de la cible :"; echo "$extra" | sed 's/^/     + /'; }
        rc=1   # le SCHÉMA est le verrou : écart -> bloquant (sauf --force à l'import)
    fi

    # Catalogue de données de référence : informatif (n'est PAS bloquant).
    # Un schéma identique peut masquer une dérive de version sur les DONNÉES.
    if [ -f "$cb/catalog.txt" ]; then
        local tmp_ct tmp_cs cat_missing cat_extra
        tmp_ct="$(mktemp)"; tmp_cs="$(mktemp)"
        target_catalog > "$tmp_ct"
        sort -u "$cb/catalog.txt" > "$tmp_cs"
        cat_missing="$(comm -23 "$tmp_ct" "$tmp_cs")"  # cible attend, source n'a pas (RISQUE)
        cat_extra="$(comm -13 "$tmp_ct" "$tmp_cs")"    # source a en plus (bénin)
        rm -f "$tmp_ct" "$tmp_cs"
        if [ -n "$cat_missing" ]; then
            warn "[$cid] données de référence ATTENDUES par la cible mais absentes de la source"
            warn "       (le code cible peut les lire ; à recréer après migration) :"
            echo "$cat_missing" | sed 's/^/     - /'
        fi
        [ -n "$cat_extra" ] && { echo "  -- [$cid] entrées en trop côté source (obsolètes, bénin) :"; echo "$cat_extra" | sed 's/^/     + /'; }
        [ -z "$cat_missing" ] && [ -z "$cat_extra" ] && log "[$cid] catalogue de données de référence ALIGNÉ ✓"
    fi
    return $rc
}

cmd_diagnose() {
    local bundle=""; local -a only=()
    while [ $# -gt 0 ]; do
        case "$1" in
            --bundle) bundle="$2"; shift 2 ;;
            --custom) only+=("$2"); shift 2 ;;
            *) die "diagnose : option inconnue '$1'" ;;
        esac
    done
    [ -d "$bundle/customs" ] || die "bundle invalide : $bundle"
    local rc=0
    for cb in "$bundle"/customs/*/; do
        [ -d "$cb" ] || continue
        local cid; cid="$(basename "$cb")"
        if [ ${#only[@]} -gt 0 ] && ! printf '%s\n' "${only[@]}" | grep -qx "$cid"; then continue; fi
        diagnose_one "$cb" "$cid" || rc=1
    done
    [ "$rc" = 0 ] && log "Diagnostic : OK, schémas alignés." \
                  || warn "Diagnostic : écart(s) détecté(s). En cas d'import : --force pour passer outre (à vos risques)."
    return $rc
}

# ===========================================================================
# IMPORT
# ===========================================================================
cmd_import() {
    local bundle="" force=0 do_deploy=1; local -a only=()
    # Identifiants admin du tenant (pour ré-enregistrer les workflows via l'API
    # après déploiement). Optionnels : par flag OU env OC_ADMIN_USER/OC_ADMIN_PASSWORD.
    # Absents -> étape sautée proprement (instructions en fin d'import).
    local admin_user="${OC_ADMIN_USER:-}" admin_pass="${OC_ADMIN_PASSWORD:-}"
    while [ $# -gt 0 ]; do
        case "$1" in
            --bundle)         bundle="$2"; shift 2 ;;
            --custom)         only+=("$2"); shift 2 ;;
            --force)          force=1; shift ;;
            --no-deploy)      do_deploy=0; shift ;;
            --admin-user)     admin_user="$2"; shift 2 ;;
            --admin-password) admin_pass="$2"; shift 2 ;;
            *) die "import : option inconnue '$1'" ;;
        esac
    done
    [ -d "$bundle/customs" ] || die "bundle invalide : $bundle"

    for cb in "$bundle"/customs/*/; do
        [ -d "$cb" ] || continue
        local cid; cid="$(basename "$cb")"
        if [ ${#only[@]} -gt 0 ] && ! printf '%s\n' "${only[@]}" | grep -qx "$cid"; then continue; fi
        log "=== import custom '$cid' ==="

        # Métadonnées source (lecture sûre, sans eval).
        [ -f "$cb/meta.env" ] || die "[$cid] meta.env manquant"
        meta() { trim "$(grep -m1 "^$1=" "$cb/meta.env" | cut -d= -f2-)"; }
        local URL CUSTOM_SRC DOCSERVERS_SRC SHARE_SRC OC_ROOT SRC_CUSTOM_ID
        URL="$(meta URL)"
        CUSTOM_SRC="$(meta CUSTOM_SRC)"
        DOCSERVERS_SRC="$(meta DOCSERVERS_SRC)"
        SHARE_SRC="$(meta SHARE_SRC)"
        OC_ROOT="$(meta OC_ROOT)"
        SRC_CUSTOM_ID="$(meta CUSTOM_ID)"

        # Diagnostic de version (bloquant sauf --force).
        if ! diagnose_one "$cb" "$cid"; then
            [ "$force" = 1 ] || die "[$cid] écart de schéma — corriger la version ou relancer avec --force"
            warn "[$cid] --force : import malgré l'écart de schéma"
        fi

        # Le stub tenant doit exister (créé via new-tenant.sh, .env renseigné).
        local stub_env="$REPO_ROOT/stub-tenants/$cid/.env"
        [ -f "$stub_env" ] || die "[$cid] stub absent : crée-le d'abord (./new-tenant.sh <http|le|cert> $cid) puis édite stub-tenants/$cid/.env (OC_FQDN${URL:+ ex. $URL}, mots de passe)"

        # Variables de la cible depuis le .env du tenant.
        local OC_DATA_ROOT POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD PGDATA_PATH
        OC_DATA_ROOT="$(trim "$(grep -m1 '^OC_DATA_ROOT=' "$stub_env" | cut -d= -f2-)")"
        POSTGRES_DB="$(trim "$(grep -m1 '^POSTGRES_DB=' "$stub_env" | cut -d= -f2-)")"
        POSTGRES_USER="$(trim "$(grep -m1 '^POSTGRES_USER=' "$stub_env" | cut -d= -f2-)")"
        POSTGRES_PASSWORD="$(trim "$(grep -m1 '^POSTGRES_PASSWORD=' "$stub_env" | cut -d= -f2-)")"
        PGDATA_PATH="$(trim "$(grep -m1 '^PGDATA_PATH=' "$stub_env" | cut -d= -f2-)")"
        : "${OC_DATA_ROOT:=/opt/edissyum/opencapture}"
        local tdir="$OC_DATA_ROOT/tenants/$cid"
        : "${PGDATA_PATH:=$tdir/pgdata}"

        # 1) Dépose les fichiers (idempotent ; n'écrase pas les modèles IA partagés).
        log "  dépose custom/ docservers/ share/ -> $tdir"
        mkdir -p "$tdir/custom/$cid" "$tdir/docservers" "$tdir/share"
        tar -xzf "$cb/custom.tar.gz"      -C "$tdir/custom/$cid"
        [ -f "$cb/docservers.tar.gz" ]    && tar -xzf "$cb/docservers.tar.gz"    -C "$tdir/docservers"
        # Pièces jointes partagées -> layout conteneur /app/docservers/<mod>/attachments/
        for mod in verifier splitter; do
            if [ -f "$cb/att-${mod}.tar.gz" ]; then
                mkdir -p "$tdir/docservers/$mod/attachments"
                tar -xzf "$cb/att-${mod}.tar.gz" -C "$tdir/docservers/$mod/attachments"
            fi
        done
        if [ -f "$cb/share-export.tar.gz" ]; then
            mkdir -p "$tdir/share/export"
            tar -xzf "$cb/share-export.tar.gz" -C "$tdir/share/export"
        fi
        if [ -f "$cb/ai-models.tar.gz" ]; then
            local ai_dst="$OC_DATA_ROOT/shared-by-tenants/ai-models"
            mkdir -p "$ai_dst"
            tar -xzf "$cb/ai-models.tar.gz" -C "$ai_dst" --keep-old-files 2>/dev/null || true
        fi

        # Le custom.ini n'est PAS repris (il liste tous les customs source avec
        # des chemins hôte). docker-bootstrap.sh le régénère pour ce seul tenant.
        rm -f "$tdir/custom/$cid/custom.ini" 2>/dev/null || true

        # 2) Réécriture des chemins HÔTE -> conteneur dans les fichiers custom/.
        #    (mêmes cibles que docker-bootstrap.sh : tout est /app/... en conteneur)
        log "  réécriture des chemins dans custom/$cid/"
        local APP_CUSTOM="/app/custom/$cid"
        rewrite_paths_in_dir "$tdir/custom/$cid" "$cid" \
            "${CUSTOM_SRC%/}" "$APP_CUSTOM" \
            "${DOCSERVERS_SRC%/}" "/app/docservers" \
            "${SHARE_SRC%/}" "/app/share" \
            "${OC_ROOT%/}" "/app"

        # 2b) Réconcilie le [GLOBAL] de config.ini sur la convention Docker.
        #     Le bare-metal y met des chemins qui ne valent pas en conteneur :
        #     notamment watcherConfig pointe souvent vers ./instance/config/ (global)
        #     alors que le watcher.ini est PAR custom -> sinon l'enregistrement d'un
        #     workflow échoue ("FS_WATCHER_CONFIG_DOESNT_EXIST"). On force les chemins
        #     /app/custom/<id>/... comme le fait un tenant natif Docker.
        #     Classes [Aa]... pour matcher les clés en camelCase (source brute) ET en
        #     minuscules (après réécriture configparser du bootstrap).
        local cfg="$tdir/custom/$cid/config/config.ini"
        if [ -f "$cfg" ]; then
            log "  réconciliation [GLOBAL] de config.ini (chemins /app)"
            sed -i -E \
                -e "s#^([Aa]pplication[Pp]ath)[[:space:]]*=.*#\1 = /app/#" \
                -e "s#^([Ww]atcher[Cc]onfig)[[:space:]]*=.*#\1 = ${APP_CUSTOM}/config/watcher.ini#" \
                -e "s#^([Ll]og[Ff]ile)[[:space:]]*=.*#\1 = ${APP_CUSTOM}/data/log/OpenCapture.log#" \
                -e "s#^([Cc]onfig[Mm]ail)[[:space:]]*=.*#\1 = ${APP_CUSTOM}/config/mail.ini#" \
                "$cfg"
        fi

        # 2c) Supprime les scripts de workflow GÉNÉRÉS (verifier/splitter_workflows/*.sh).
        #     Ils sont figés aux chemins HÔTE (souvent le défaut /var/www/html/opencapture)
        #     et l'app ne les régénère QUE s'ils sont absents (cf. workflow.py:377
        #     "if os.path.isfile(script): return"). On les retire (en gardant les
        #     templates script_sample_dont_touch.sh) : au 1er (ré)enregistrement du
        #     workflow dans l'UI, ils sont régénérés aux bons chemins /app
        #     (§§OC_PATH§§ <- PROJECT_PATH=/app, §§LOG_PATH§§ <- config logfile).
        find "$tdir/custom/$cid/bin/scripts" -path '*_workflows/*.sh' \
             ! -name 'script_sample_dont_touch.sh' -delete 2>/dev/null || true

        # 2d) Rafraîchit le CODE-SQUELETTE depuis le dépôt : process_queue_*.py et
        #     les templates script_sample_dont_touch.sh. Le custom migré d'une
        #     version OC plus ANCIENNE embarque du code incompatible avec l'image
        #     (vécu : SeparatorQR.__init__ à 8 args -> 500 à l'upload ; OCPath="."
        #     dans le template -> launch_worker introuvable). On réécrit avec la
        #     version COURANTE du dépôt, substitutions §§ comme docker-bootstrap.sh
        #     (§§SCRIPT_NAME§§/§§ARGUMENTS§§ restent : substitués par l'app/workflow).
        log "  rafraîchissement du code-squelette (process_queue + templates)"
        for q in verifier splitter; do
            oc_subst_skeleton "$REPO_ROOT/backend/src/process_queue_${q}.py.default" \
                "$tdir/custom/$cid/src/backend/process_queue_${q}.py" "$cid"
            oc_subst_skeleton "$REPO_ROOT/backend/installer/bin/scripts/${q}_workflows/script_sample_dont_touch.sh" \
                "$tdir/custom/$cid/bin/scripts/${q}_workflows/script_sample_dont_touch.sh" "$cid"
        done
        rm -rf "$tdir/custom/$cid/src/backend/__pycache__" 2>/dev/null || true

        # 2e) Réconcilie les FICHIERS custom manquants d'une version OC plus ANCIENNE
        #     (skew v3->v4). create_classes_from_custom_id (main.py) tourne à CHAQUE
        #     requête via get_locale : un fichier/clé custom manquant -> HTTP 500 sur
        #     TOUT (login compris). On complète depuis le squelette v4 du dépôt.
        reconcile_custom_files_v4 "$tdir/custom/$cid" "$cid"

        # 3) Base de données : démarre postgres, restaure le dump, patche les chemins.
        align_pgdata_owner "$cid" "$PGDATA_PATH"
        log "  démarrage postgres + restauration du dump"
        dc "$cid" up -d postgres
        wait_pg_healthy "$cid"

        # Anti-OOM : le conteneur postgres a une mem_limit basse (infra x-res-postgres,
        # ~512m sans swap). Sous charge (extraction docservers + init DB + stacks
        # voisins) la restauration peut être tuée (exit 137) -> DB partielle. On relève
        # la limite À CHAUD le temps de la restauration (pas de recréation). Best-effort.
        local pg_cid; pg_cid="$(dc "$cid" ps -q postgres 2>/dev/null)"
        if [ -n "$pg_cid" ]; then
            docker update --memory 1500m --memory-swap 1500m "$pg_cid" >/dev/null 2>&1 \
                && log "    (mem_limit postgres relevée à 1500m pour la restauration)" || true
        fi

        log "  restauration db.dump.sql -> $POSTGRES_DB"
        dc "$cid" exec -T postgres psql -v ON_ERROR_STOP=0 -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
            < "$cb/db.dump.sql" > /dev/null

        log "  patch des chemins dans la base"
        patch_db_paths "$cid" "$POSTGRES_USER" "$POSTGRES_DB" \
            "${DOCSERVERS_SRC%/}" "${SHARE_SRC%/}" "$APP_CUSTOM" \
            "$(dirname "${DOCSERVERS_SRC%/}")" "${OC_ROOT%/}"

        # Renommage du custom (dossier bundle renommé <> CUSTOM_ID de meta.env,
        # écrit à l'export = l'id SOURCE) : patch_db_paths ne réécrit que le
        # préfixe oc_root/custom/<CID CIBLE>/ -> ne matche pas les valeurs
        # stockées sous l'ANCIEN nom (ex. REFERENTIALS_PATH en absolu). Vécu :
        # tenant `opencapture` <- custom source `edissyum`, 1 résidu. Fait
        # AUTOMATIQUEMENT ici plutôt que de rejouer le SQL à la main.
        if [ -n "$SRC_CUSTOM_ID" ] && [ "$SRC_CUSTOM_ID" != "$cid" ]; then
            log "  renommage détecté ($SRC_CUSTOM_ID -> $cid) : correction des chemins /app/custom/$SRC_CUSTOM_ID/ résiduels"
            # -c n'interpole PAS les :'var' (contrairement à -f/stdin) -> la
            # substitution psql est silencieusement ignorée, postgres reçoit
            # ":'old'" tel quel et lève une erreur de syntaxe (vécu : échec
            # systématique, avalé par 2>/dev/null, résidu jamais corrigé).
            # On passe le SQL par stdin (comme patch_db_paths) où :'var' marche.
            if ! dc "$cid" exec -T postgres psql -q -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
                    -v old="/app/custom/${SRC_CUSTOM_ID}/" -v new="/app/custom/${cid}/" \
                    >/dev/null 2>&1 <<'SQL'
UPDATE docservers SET path = REPLACE(path, :'old', :'new') WHERE path LIKE :'old' || '%';
SQL
            then
                warn "[$cid] correction du renommage échouée (rejouer à la main : UPDATE docservers SET path=REPLACE(path,'/app/custom/$SRC_CUSTOM_ID/','/app/custom/$cid/') WHERE path LIKE '/app/custom/$SRC_CUSTOM_ID/%')"
            fi
            # Résidus TEXTE (hors chemins réécrits) dans les scripts custom :
            # signalés, pas corrigés en aveugle (peut être une vraie donnée,
            # ex. un DN LDAP, pas juste un chemin).
            local leftovers
            leftovers="$(grep -rl "$SRC_CUSTOM_ID" "$tdir/custom/$cid/" 2>/dev/null || true)"
            [ -n "$leftovers" ] && warn "[$cid] '$SRC_CUSTOM_ID' encore référencé dans ces fichiers (à vérifier manuellement) :" \
                && echo "$leftovers" | sed 's/^/     /'
        fi

        # 4) Déploiement complet (bootstrap court-circuite : config.ini présent,
        #    self-heal de [DATABASE]/custom.ini/watcher.ini).
        if [ "$do_deploy" = 1 ]; then
            log "  ./deploy.sh $cid"
            "$REPO_ROOT/deploy.sh" "$cid"
            # Ré-enregistrement des workflows via l'API (régénère les scripts fs-watcher
            # + watcher.ini). Uniquement si les identifiants admin sont fournis.
            if [ -n "$admin_user" ] && [ -n "$admin_pass" ]; then
                reregister_workflows_via_api "$cid" "$admin_user" "$admin_pass" || \
                    warn "[$cid] ré-enregistrement des workflows à refaire (voir POST-MIGRATION)"
            else
                log "  workflows NON ré-enregistrés : pas d'identifiants admin fournis"
                log "    -> relance : ./migrate.sh reregister --custom $cid --admin-user <u> --admin-password <p>"
                log "    -> ou dans l'UI : ouvrir/enregistrer chaque workflow, puis restart fs-watcher"
            fi
        else
            log "  --no-deploy : lance './deploy.sh $cid' manuellement pour finaliser,"
            log "    puis (si besoin) ./migrate.sh reregister --custom $cid --admin-user <u> --admin-password <p>"
        fi
        log "  ✓ custom '$cid' importé"
    done

    log "Import terminé."
    cat <<'EOF'
[migrate] POST-MIGRATION (à faire dans l'UI de chaque tenant) :
  - Ré-enregistrer chaque workflow Verifier/Splitter une fois (régénère les
    scripts + watcher.ini aux chemins conteneur), puis redémarrer fs-watcher.
  - Vérifier : connexion, monitoring/historique présents, ouverture d'un
    document stocké (résolution docservers), dépôt test capté par fs-watcher.
EOF
}

# Réécrit un fichier squelette (.default/template) avec les substitutions §§…§§
# du conteneur, comme docker-bootstrap.sh. Laisse §§SCRIPT_NAME§§/§§ARGUMENTS§§
# intacts (substitués par l'app à chaque (ré)enregistrement de workflow).
# Args : <src> <dst> <custom_id>  (no-op silencieux si src absent)
oc_subst_skeleton() {
    local src="$1" dst="$2" cid="$3" appc="/app/custom/$3"
    [ -f "$src" ] || return 0
    mkdir -p "$(dirname "$dst")"
    sed -e "s#§§CUSTOM_ID§§#${cid}#g" \
        -e "s#§§OC_PATH§§#/app#g" \
        -e "s#§§CUSTOM_PATH§§#${appc}#g" \
        -e "s#§§SHARE_PATH§§#/app/share#g" \
        -e "s#§§BATCH_PATH§§#${appc}/data/MailCollect#g" \
        -e "s#§§LOG_PATH§§#${appc}/data/log/OpenCapture.log#g" \
        -e "s#§§PYTHON_VENV§§##g" \
        "$src" > "$dst"
}

# Complète les FICHIERS custom qu'une version OC ANCIENNE (v3) n'a pas mais que
# le code v4 attend — sinon HTTP 500 partout (create_classes_from_custom_id tourne
# à chaque requête). Idempotent : n'écrase RIEN d'existant (merge/ajout seulement).
# Args : <custom_dir> <custom_id>
reconcile_custom_files_v4() {
    local cdir="$1" cid="$2"
    local cfg="$cdir/config/config.ini"
    local inst="$REPO_ROOT/backend/installer"
    local assets="$REPO_ROOT/backend/src/assets/imgs"
    local refdir="$REPO_ROOT/backend/instance/referencial"
    local refdef="$refdir/default_referencial_supplier_index.json.default"
    local appc="/app/custom/$cid"

    # Substitution §§…§§ -> layout conteneur (idem oc_subst_skeleton / docker-bootstrap).
    _subst_v4() {
        sed -e "s#§§CUSTOM_ID§§#${cid}#g" -e "s#§§OC_PATH§§#/app#g" \
            -e "s#§§CUSTOM_PATH§§#${appc}#g" -e "s#§§SHARE_PATH§§#/app/share#g" \
            -e "s#§§BATCH_PATH§§#${appc}/data/MailCollect#g" \
            -e "s#§§LOG_PATH§§#${appc}/data/log/OpenCapture.log#g" \
            -e "s#§§PYTHON_VENV§§##g" "$1"
    }

    # 0) Scaffolding installer/* MANQUANT. Un custom migré d'une v3 n'a JAMAIS reçu ce
    #    squelette v4 : create_custom.sh fait `cp -r installer/* custom/` mais le
    #    docker-bootstrap COURT-CIRCUITE ce copiage quand config.ini est déjà présent
    #    (cas d'un import). Résultat vécu : splitter_methods/ vide -> 500 à l'ouverture
    #    d'un workflow Splitter ; __init__.py manquants -> import des modules custom
    #    cassé. On copie le MANQUANT (jamais d'écrasement), strip .default, substitue §§.
    #    On EXCLUT bin/scripts/*_workflows/ : ces scripts portent §§SCRIPT_NAME§§ que
    #    SEULE l'app renseigne à la (ré)inscription du workflow dans l'UI.
    if [ -d "$inst" ]; then
        local src rel dst
        while IFS= read -r src; do
            rel="${src#"$inst"/}"
            case "$rel" in bin/scripts/verifier_workflows/*|bin/scripts/splitter_workflows/*) continue ;; esac
            dst="$cdir/${rel%.default}"
            [ -e "$dst" ] && continue
            mkdir -p "$(dirname "$dst")"
            if grep -q "§§" "$src" 2>/dev/null; then _subst_v4 "$src" > "$dst"; else cp -a "$src" "$dst"; fi
            log "    + ${rel%.default} (scaffolding v4)"
        done < <(find "$inst" -type f)
    fi

    # 0a-bis) metadata_methods.json : ajouter la clé callOnScript aux méthodes héritées
    #     v3. La v4 l'a introduite ; backend/load_referential_splitter.py fait
    #     `if method['callOnScript']:` en accès DIRECT -> KeyError sur une méthode v3 qui
    #     ne l'a pas (le fichier v3 est conservé tel quel par la copie cp -n ci-dessus).
    #     Défaut `false` = sûr : le rechargement de référentiel saute la méthode (pas
    #     d'exécution du script, qui viserait de toute façon des URLs de service à
    #     (re)configurer par déploiement). Idempotent.
    local mmj="$cdir/bin/scripts/splitter_metadata/metadata_methods.json"
    if [ -f "$mmj" ]; then
        if python3 - "$mmj" <<'PY'
import json, sys
p = sys.argv[1]
d = json.load(open(p, encoding='utf-8'))
changed = any('callOnScript' not in m for m in d.get('methods', []))
for m in d.get('methods', []):
    m.setdefault('callOnScript', False)
if changed:
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=4)
sys.exit(0 if changed else 2)
PY
        then log "    ~ metadata_methods.json : callOnScript ajouté (défaut false) aux méthodes v3"; fi
    fi

    # 0b) Assets imgs : logo_company.png manquant -> 500 à la génération de séparateur
    #     Splitter (vécu). Idem opencapture/Open-Capture_Splitter/login_image.
    local a
    for a in opencapture.png logo_company.png Open-Capture_Splitter.png login_image.svg; do
        if [ ! -f "$cdir/assets/imgs/$a" ] && [ -f "$assets/$a" ]; then
            mkdir -p "$cdir/assets/imgs"; cp -a "$assets/$a" "$cdir/assets/imgs/$a"
            log "    + assets/imgs/$a"
        fi
    done

    # 0c) instance/referencial/* manquants (CURRENCY_CODE.csv, LISTE_PRENOMS.csv…).
    #     L'index lui-même est traité par MERGE en (c), pas écrasé.
    if [ -d "$refdir" ]; then
        local rf b
        for rf in "$refdir"/*; do
            [ -f "$rf" ] || continue
            b="$(basename "${rf%.default}")"
            if [ ! -e "$cdir/instance/referencial/$b" ]; then
                mkdir -p "$cdir/instance/referencial"; cp -a "$rf" "$cdir/instance/referencial/$b"
                log "    + instance/referencial/$b"
            fi
        done
    fi

    # 0d) Marqueurs de package Python : sans eux, l'import des modules custom
    #     (process_queue_*, méthodes) échoue -> workers/traitement cassés.
    local m
    for m in __init__.py src/__init__.py src/backend/__init__.py; do
        if [ ! -f "$cdir/$m" ]; then mkdir -p "$(dirname "$cdir/$m")"; : > "$cdir/$m"; log "    + $m"; fi
    done

    # a) config.ini [GLOBAL] : clé 'debugmode' (lue par main.py) absente en 3.6.2.
    if [ -f "$cfg" ] && ! grep -qiE '^[[:space:]]*debugmode[[:space:]]*=' "$cfg"; then
        if grep -qiE '^[[:space:]]*allowwfscripting' "$cfg"; then
            sed -i '0,/^[[:space:]]*[Aa]llow[Ww][Ff][Ss]cripting.*/s//&\ndebugmode = False/' "$cfg"
        else
            sed -i '0,/^\[GLOBAL\]/s//&\ndebugmode = False/' "$cfg"
        fi
        log "    + config.ini : debugmode = False"
    fi

    # c) instance/referencial/*index.json : ajoute les CLÉS lues par Spreadsheet.py
    #    (lastname/firstname/civility/function/informal_contact...) absentes de l'index
    #    v3, SANS écraser les libellés existants (merge). Défauts depuis le dépôt.
    local idx; idx="$(find "$cdir/instance/referencial" -maxdepth 1 -name '*index.json' 2>/dev/null | head -1)"
    if [ -n "$idx" ] && [ -f "$refdef" ] && command -v python3 >/dev/null 2>&1; then
        python3 - "$idx" "$refdef" <<'PY' && log "    ~ index référentiel : clés v4 complétées"
import json, sys, collections
idx, ref = sys.argv[1], sys.argv[2]
try:
    d = json.load(open(idx, encoding='utf-8'), object_pairs_hook=collections.OrderedDict)
    r = json.load(open(ref, encoding='utf-8'))
except Exception as e:
    print("skip:", e); sys.exit(0)
changed = False
for k, v in r.items():
    if k not in d:
        d[k] = v; changed = True
if changed:
    json.dump(d, open(idx, 'w', encoding='utf-8'), ensure_ascii=False, indent=4)
PY
    fi
}

# Réécrit, dans tous les fichiers texte d'un dossier, des préfixes de chemins.
# Args : <dir> <custom_id> [<from> <to>]...   (paires from/to)
rewrite_paths_in_dir() {
    local dir="$1" cid="$2"; shift 2
    local -a pairs=("$@")
    # Construit le programme sed (échappe # peu probable dans des chemins).
    local -a sed_args=()
    while [ ${#pairs[@]} -ge 2 ]; do
        local from="${pairs[0]}" to="${pairs[1]}"; pairs=("${pairs[@]:2}")
        [ -n "$from" ] && [ "$from" != "$to" ] && sed_args+=(-e "s#${from}#${to}#g")
    done
    # Spécifiques watcher (pid/log/share) — alignés sur docker-bootstrap.sh.
    sed_args+=(
        -e "s#/var/log/watcher/daemon.log#/app/custom/$cid/data/log/watcher.log#g"
        -e "s#/run/watcher.pid#/tmp/watcher-$cid.pid#g"
    )
    # N'agit que sur les fichiers de config/scripts (évite les binaires/modèles).
    find "$dir" -type f \( -name "*.ini" -o -name "*.py" -o -name "*.sh" \
            -o -name "*.json" -o -name "*.xml" -o -name "*.conf" \) -print0 \
        | xargs -0 -r sed -i "${sed_args[@]}" 2>/dev/null || true
}

# Montée de la base restaurée (dump v3.x) : montée OFFICIELLE 3.6.x->4.0.0
# (postgres/sql/4.0.0.sql) PUIS résiduel Docker (postgres/sql/4.0.0+.sql :
# colonnes post-4.0.0 + chemins -> /app). Ordre imposé.
# 4.0.0.sql n'est PAS idempotent -> UNE passe sur un import frais ; on retire
# d'abord settings_favorites (table v4-only survivante au dump, sinon son CREATE échoue).
patch_db_paths() {
    local cid="$1" pguser="$2" pgdb="$3" docs_src="$4" share_src="$5" app_custom="$6"
    local docs_root="${7:-/var/docservers/opencapture}" oc_root="${8:-/var/www/html/opencapture}"
    local V400="$REPO_ROOT/postgres/sql/4.0.0.sql" VRES="$REPO_ROOT/postgres/sql/4.0.0+.sql"
    [ -f "$V400" ] && [ -f "$VRES" ] || die "[$cid] postgres/sql/4.0.0.sql ou 4.0.0+.sql introuvable"
    [ -n "$docs_src" ] && [ -n "$share_src" ] || die "[$cid] docs_src/share_src vides"

    dc "$cid" exec -T postgres psql -q -U "$pguser" -d "$pgdb" \
        -c "DROP TABLE IF EXISTS settings_favorites CASCADE;" >/dev/null 2>&1 || true

    log "    montée 4.0.0 (script officiel)"
    dc "$cid" exec -T postgres psql -v ON_ERROR_STOP=0 -U "$pguser" -d "$pgdb" < "$V400" >/dev/null

    log "    résiduel Docker (4.0.0+.sql)"
    dc "$cid" exec -T postgres psql -v ON_ERROR_STOP=0 -U "$pguser" -d "$pgdb" \
        -v cid="$cid" -v docs_src="$docs_src" -v docs_root="$docs_root" \
        -v share_src="$share_src" -v app_custom="$app_custom" -v oc_root="$oc_root" \
        < "$VRES" >/dev/null
}

wait_pg_healthy() {
    local cid="$1" i
    for i in $(seq 1 60); do
        if dc "$cid" exec -T postgres pg_isready -q 2>/dev/null; then return 0; fi
        sleep 2
    done
    die "[$cid] postgres ne devient pas prêt"
}

# UID:GID réel du process postgres DANS L'IMAGE — jamais figé en dur (varie
# selon la variante/tag). Lu via un conteneur JETABLE de la même image, en
# outrepassant l'entrypoint (pas de mutation, pgdata pas touché).
postgres_image_owner() {
    local t="$1" dir
    dir="$(compose_dir_for "$t")" || return 1
    dc "$t" run --rm --no-deps --entrypoint sh postgres -c 'id -u postgres; id -g postgres' 2>/dev/null \
        | tr '\n' ':' | sed 's/:$//'
}

# Aligne le propriétaire de pgdata sur celui-ci AVANT le démarrage. Sans ça,
# un pgdata déjà peuplé par un autre contexte (import interrompu, script relancé
# avec/sans sudo, restauration manuelle...) reste illisible pour le postgres du
# conteneur -> FATAL en boucle ("could not open file... Permission denied"),
# car l'auto-chown de l'image ne joue qu'à l'initdb (PGDATA vide), jamais rejoué
# ensuite. Best-effort : un chown qui échoue (pas de sudo) ne doit pas bloquer
# un pgdata déjà correct.
align_pgdata_owner() {
    local t="$1" pgdata_dir="$2"
    [ -d "$pgdata_dir" ] || return 0
    local owner; owner="$(postgres_image_owner "$t")"
    if [ -z "$owner" ]; then
        warn "[$t] UID postgres de l'image introuvable — droits pgdata non vérifiés"
        return 0
    fi
    chown -R "$owner" "$pgdata_dir" 2>/dev/null \
        && log "  droits pgdata alignés sur postgres ($owner)" \
        || warn "[$t] chown pgdata échoué (relancer avec sudo si pgdata appartient à un autre utilisateur)"
}

# ===========================================================================
# REREGISTER — ré-enregistre les workflows via l'API (régénère les scripts
# bin/scripts/*_workflows/*.sh + watcher.ini). À l'import ils sont VOLONTAIREMENT
# retirés (ils portent §§SCRIPT_NAME§§ que SEULE l'app renseigne) : sans ça, le
# fs-watcher ne traite pas les dépôts. On rejoue l'endpoint createScriptAndWatcher
# pour chaque workflow, puis on redémarre le fs-watcher. Nécessite le stack DÉPLOYÉ
# + les identifiants admin du tenant (mots de passe repris de la source).
# Args : <cid> <admin_user> <admin_password>
reregister_workflows_via_api() {
    local cid="$1" au="$2" ap="$3"
    local stub_env="$REPO_ROOT/stub-tenants/$cid/.env"
    local fqdn; fqdn="$(trim "$(grep -m1 '^OC_FQDN=' "$stub_env" 2>/dev/null | cut -d= -f2-)")"
    log "  ré-enregistrement des workflows via API (régénère scripts + watcher.ini)"
    # Client exécuté DANS le conteneur backend : joint l'API via le service 'frontend'
    # (pas besoin de connaître le port Traefik de l'hôte). Secrets passés par -e.
    if ! dc "$cid" exec -T \
            -e OC_CID="$cid" -e OC_FQDN="$fqdn" -e OC_AU="$au" -e OC_AP="$ap" \
            backend python3 - <<'PY'
import os, json, urllib.request, urllib.error, sys
CID=os.environ["OC_CID"]; FQDN=os.environ.get("OC_FQDN","")
BASE=f"http://frontend/{CID}/ws"
H={"Content-Type":"application/json"}
if FQDN: H["Host"]=FQDN
def req(method, path, tok=None, data=None):
    hh=dict(H)
    if tok: hh["Authorization"]="Bearer "+tok
    body=json.dumps(data).encode() if data is not None else None
    r=urllib.request.Request(BASE+path, data=body, headers=hh, method=method)
    with urllib.request.urlopen(r, timeout=60) as f:
        return f.status, json.loads(f.read().decode())
try:
    _, j = req("POST", "/auth/login", data={"lang":"fr","username":os.environ["OC_AU"],"password":os.environ["OC_AP"]})
    tok = j.get("auth_token")
except urllib.error.HTTPError as e:
    print(f"    login KO (HTTP {e.code}) — vérifier les identifiants admin"); sys.exit(3)
if not tok:
    print("    login KO — pas de token"); sys.exit(3)
ok=skip=err=0
for module in ("verifier","splitter"):
    try:
        _, j = req("GET", f"/workflows/{module}/list", tok=tok)
    except Exception as e:
        print(f"    list {module} KO: {e}"); continue
    for w in j.get("workflows", []):
        wid=w.get("workflow_id"); lab=w.get("label")
        inp=((w.get("input") or {}).get("input_folder") or "").strip()
        if not (wid and inp and lab): skip+=1; continue
        try:
            st,_=req("POST", f"/workflows/{module}/createScriptAndWatcher", tok=tok,
                     data={"workflow_id":wid,"input_folder":inp,"workflow_label":lab})
            if st in (200,204): ok+=1
            else: err+=1; print(f"    ERR {st} {module}/{wid}")
        except Exception as e:
            err+=1; print(f"    ERR {module}/{wid}: {e}")
print(f"    workflows ré-enregistrés : ok={ok} skip={skip} err={err}")
sys.exit(0 if err==0 else 1)
PY
    then
        warn "[$cid] ré-enregistrement API échoué (backend injoignable ? identifiants ?)."
        return 1
    fi
    log "  redémarrage fs-watcher"
    dc "$cid" restart fs-watcher >/dev/null 2>&1 || warn "[$cid] restart fs-watcher a échoué"
}

cmd_reregister() {
    local cid="" au="${OC_ADMIN_USER:-}" ap="${OC_ADMIN_PASSWORD:-}"
    while [ $# -gt 0 ]; do
        case "$1" in
            --custom)         cid="$2"; shift 2 ;;
            --admin-user)     au="$2"; shift 2 ;;
            --admin-password) ap="$2"; shift 2 ;;
            *) die "reregister : option inconnue '$1'" ;;
        esac
    done
    [ -n "$cid" ] || die "reregister : --custom requis"
    [ -n "$au" ] && [ -n "$ap" ] || die "reregister : --admin-user + --admin-password requis (ou env OC_ADMIN_USER/OC_ADMIN_PASSWORD)"
    compose_dir_for "$cid" >/dev/null || die "reregister : tenant '$cid' introuvable (déployé ?)"
    reregister_workflows_via_api "$cid" "$au" "$ap"
}

# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------
sub="${1:-}"; shift || true
case "$sub" in
    export)     cmd_export "$@" ;;
    diagnose)   cmd_diagnose "$@" ;;
    import)     cmd_import "$@" ;;
    reregister) cmd_reregister "$@" ;;
    -h|--help|"")
        sed -n '2,60p' "$0" | sed 's/^# \{0,1\}//'
        ;;
    *) die "sous-commande inconnue : '$sub' (export|diagnose|import|reregister)" ;;
esac
