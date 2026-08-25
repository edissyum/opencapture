# 01 — Migrate an existing installation to Docker

Taking over an existing OpenCapture installation (outside a container, on a physical
server or VM) into this repo's **Docker** stack, via the
[`../../../migrate.sh`](../../../migrate.sh) tool.

- **Part 1 — Generic procedure**: reusable, to run through by substituting the
  parameters at the top.
- **Part 2 — Explanations & concrete example**: what happens under the hood, plus
  a real 3.6.2 → 4.0.0 migration (custom `edissyum`) with commentary.
- **Appendices**: internal workings of `migrate.sh` (bundle, subcommands, path
  chain, robustness, limits) + a catalog of pitfalls already encountered.

> **Model**: 1 source custom = 1 Docker tenant (1 stack + 1 database + its volumes).
> Each custom is migrated independently. Repeat the procedure per custom, or handle
> the whole batch at once (without `--custom`).

---

# Part 1 — Generic procedure

## Overview

```
  SOURCE (existing installation, local or SSH)     TARGET (Docker host)
  ┌──────────────────────────┐                     ┌────────────────────────┐
  │ /var/www/html/opencapture │      bundle         │ opencapture_docker/    │
  │ local PostgreSQL           │   (portable         │ stub-tenants/<id>/     │
  │ /var/docservers /var/share │    folder)          │ ${OC_DATA_ROOT}/…/<id>/│
  └──────────────────────────┘  ───────────────▶    └────────────────────────┘
     1. export        2. diagnose         3. new-tenant + 4. import   5. post-migration
```

| Phase | Subcommand | Where to run it |
|---|---|---|
| 1 | `export`   | on/from the **source** (local or SSH) |
| 2 | `diagnose` | on the **Docker host** (reads the bundle) |
| 3 | `new-tenant.sh` | on the **Docker host** (creates the target stub) |
| 4 | `import`   | on the **Docker host** |
| 5 | `reregister` + UI | on the **Docker host**, then in the tenant's UI |

---

## Prerequisites (read before starting)

1. **COLD migration.** On the source, stop all processing (workers, watcher,
   mailcollect) and drain the queues **before** the export — otherwise the file/DB
   state will be inconsistent. Service names vary depending on the source
   installation; cover the Verifier/Splitter workers, the watcher, and the mail worker.
2. **The tenant stub must exist BEFORE the import** (step 3). Import does not create
   the tenant: it **fills in** an already-created tenant, and reads
   `stub-tenants/<id>/.env` (`OC_DATA_ROOT`, `POSTGRES_*`, `OC_FQDN`).
3. **`OC_DATA_ROOT`** must point to the right volume: import drops the files there.
   Check that it targets a filesystem with enough space (docservers + database).
4. **Bundle on a filesystem with room**: do not target `/tmp` if it sits on a
   saturated root; prefer `/var/tmp` or a dedicated disk.
5. A **version gap** is expected if the source is older than the image (e.g.
   3.6.x → 4.0.0): `diagnose` will flag it, and the import will run with `--force`
   (the gap is closed by the `4.0.0.sql` + `4.0.0+.sql` upgrade, see Part 2 and
   Appendices §6).
6. **Tooling prerequisites on the Docker host**: `sshpass` (remote source with
   password auth) and `python3` (`reconcile_custom_files_v4` calls it directly on
   the host, see Appendices §8) — see [`../01-install-general.md`](../01-install-general.md).

---

## Parameters (to edit)

```bash
cd ~/opencapture_docker

SRC_ID=<custom>                       # custom id ON THE SOURCE (lowercase/digits/_)
DEST_ID=<tenant>                      # TARGET Docker tenant id — equal to SRC_ID unless renaming
                                       # (see dedicated section); never use a variable
                                       # named just "ID" for these two ids, ambiguous as soon as
                                       # you rename.
MODE=http                             # http | le | cert  (TLS exposure mode)
SRC=local                             # 'local' OR user@host  (source)
SRC_OCROOT=/var/www/html/opencapture  # OpenCapture root on the source
BUNDLE=/var/tmp/oc-bundle             # bundle folder (filesystem with room)

# REMOTE source with password auth: uncomment (otherwise default SSH key).
# Variable is NOT persistent: export it in the SAME shell as the commands that follow.
# export MIGRATE_SSH="sshpass -p '<password>' ssh -o StrictHostKeyChecking=accept-new"
# ⚠️ no apostrophes WITHIN the password itself (see Appendices, pitfall catalog,
#    pitfall 2) — migrate.sh does not strip quotes from this variable.

# Tenant admin credentials (to re-register workflows via the API at import time).
# Optional: otherwise the step is skipped and can be replayed via 'reregister' (phase 5).
# export OC_ADMIN_USER=<admin> OC_ADMIN_PASSWORD=<password>
```

---

## 1. Export (from the source)

```bash
# A single custom:
./migrate.sh export --source "$SRC" --oc-root "$SRC_OCROOT" --out "$BUNDLE" --custom "$SRC_ID"

# Or ALL customs from the source custom.ini (omit --custom):
./migrate.sh export --source "$SRC" --oc-root "$SRC_OCROOT" --out "$BUNDLE"
```

Produces `"$BUNDLE"/customs/<id>/` (SQL dump, custom/docservers/share tars,
fingerprints for `diagnose`, `meta.env`). Options: `--custom <id>` repeatable;
`--no-share` to exclude `share/export/`.

> If the export fails with a misleading message (`custom.ini not found` even though
> the source is indeed there) on a remote source: first check that the SSH
> connection itself works (`MIGRATE_SSH`, see Appendices, pitfall catalog, pitfall 1)
> — the SSH failure is sometimes swallowed and masks the real cause.

### Renaming a custom during migration (optional)

For the target tenant to carry an `<id>` **different** from the source custom (e.g.
to change the displayed URL, real case: `edissyum` → `opencapture` on an OC v3
server, so the URL segment is `/opencapture/`), rename the bundle folder **before**
`diagnose`/`import`:

```bash
mv "$BUNDLE/customs/$SRC_ID" "$BUNDLE/customs/$DEST_ID"
```

`import` determines the TARGET id from the **bundle folder name**, not the source id
(kept in `meta.env`, written at export time). When the two differ, `import`:
- **automatically** fixes `docservers.path` values of the "absolute path under the
  old id" kind (e.g. `REFERENTIALS_PATH` = `/app/custom/<source_id>/...`) that the
  generic path rewrite (Appendices §7) does not cover — it only knows the TARGET id;
- **lists without fixing** (`grep -rl` in the deposited custom's files) any other
  textual occurrence of the old id left in scripts/config — it may be real data
  (e.g. an LDAP DN) rather than a path, so it is not blindly rewritten: check by
  hand if the message appears.

The tenant stub (`new-tenant.sh`) must of course be created with the TARGET id
(`$DEST_ID`), not the source id. See also Appendices, pitfall catalog, pitfall 6
(the historical bug this detection fixes).

---

## 2. Diagnose (on the Docker host)

```bash
./migrate.sh diagnose --bundle "$BUNDLE"          # or --custom "$DEST_ID" to target
```

Compares the source schema to the target schema. A gap = a likely version
difference → **blocking at import unless `--force`**. A gap from an earlier
version → 4.0.0 is **expected** (closed by the upgrade at import time). Detail:
Appendices §5.

---

## 3. Create the target tenant (once per custom)

```bash
./new-tenant.sh "$MODE" "$DEST_ID"     # copies the template + pre-fills CUSTOM_ID, DB, OC_DATA_ROOT, APP_UID/GID
$EDITOR stub-tenants/$DEST_ID/.env     # fill in BY HAND:
                                       #   OC_FQDN            (tenant domain)
                                       #   OC_DATA_ROOT       (check the right volume — see prerequisite 3)
                                       #   POSTGRES_PASSWORD  (ideally reused from the source)
                                       #   RABBITMQ_PASS
```

> ⚠️ Check that these fields were NOT left at the template's `changeme` values —
> `OC_FQDN=changeme.example.com` breaks Traefik routing (404, no router matches).
> Changing `POSTGRES_PASSWORD` **afterwards** is not enough on its own: you also
> need `ALTER USER` in the database (already initialized at the 1st postgres
> startup).

> Check that `docker compose` resolves the expected volume correctly (should show
> the intended path; if `OC_DATA_ROOT` is missing the command fails instead of resolving a stray path):
> ```bash
> docker compose --project-directory stub-tenants/$DEST_ID \
>   -f stub-tenants/$DEST_ID/docker-compose.yml config | grep -E "source:.*$DEST_ID"
> ```

`cert` mode only: also drop the PEM + the `tls.yml` fragment on the Traefik side
(see [`../00_GUIDE.md`](../00_GUIDE.md) §2 / [`../03-tenant-cert.md`](../03-tenant-cert.md)).

---

## 4. Import (on the Docker host)

```bash
# Import + full deployment. --force if diagnose flagged a version gap.
./migrate.sh import --bundle "$BUNDLE" --custom "$DEST_ID" --force
```

Import: drops the files under `${OC_DATA_ROOT}/tenants/<id>/`, rewrites host →
`/app` paths, restores the dump, **upgrades the database to the target version**,
reconciles the missing v4 skeleton, then launches `./deploy.sh <id>`. Detail:
Part 2 §B and Appendices §6.

**Useful variants:**

| Need | Option |
|---|---|
| Apply a manual SQL top-up **before** deployment | `--no-deploy` (then run `./deploy.sh <id>` afterwards) |
| Automatically re-register the workflows | `--admin-user <u> --admin-password <p>` (or env `OC_ADMIN_*`) |
| The whole batch in one pass | omit `--custom` |

---

## 5. Post-migration

**a) Re-register the workflows** (regenerates the `*_workflows/*.sh` scripts +
`watcher.ini` with container paths, then restarts the fs-watcher). Necessary:
otherwise the fs-watcher does not process drops.

```bash
# If not done at import time (no admin creds supplied):
./migrate.sh reregister --custom "$DEST_ID" --admin-user <u> --admin-password <p>
```

If there's no API: in the UI, open then **save** each Verifier/Splitter workflow
once, then restart the fs-watcher (`dc $DEST_ID restart fs-watcher`).

**b) Validation checks:**

- [ ] Login (a wrong password returns **401**, not 500).
- [ ] Monitoring / history present.
- [ ] Opening a stored document (docservers resolution OK).
- [ ] Supplier referential loaded.
- [ ] Splitter/Verifier forms: open without crashing, metadata zones not
      empty (see Part 2 §B — `form_models_field` reshape).
- [ ] Dropping a test PDF into `share/entrant/…` → picked up by fs-watcher → worker.

**c) Out of scope for "OC core"** (to plan next): outgoing connectors
(MEM / Alfresco / OpenADS / OpenCRM / Facturx) whose URLs targeted the host (e.g.
`http://localhost/...`, valid when everything ran on the same machine) → to be
re-audited to be reachable from the Docker network. Solution adopted for MEM
Courrier (`extra_hosts: host.docker.internal:host-gateway`) and its limits:
[`apache-hostgateway-serveur-test.md`](apache-hostgateway-serveur-test.md).

---

## Rollback

Import does **not** touch the source (it remains the reference as long as it has
not been decommissioned). To start over on a tenant:

```bash
docker compose --project-directory stub-tenants/$DEST_ID \
  -f stub-tenants/$DEST_ID/docker-compose.yml down     # NEVER -v in shared prod
rm -rf "${OC_DATA_ROOT}/tenants/$DEST_ID"
```

then resume at step 3. Only decommission the source **after validation**.

---

## Known pitfalls (summary)

| Pitfall | Workaround |
|---|---|
| Postgres restore killed (exit 137, OOM) | Import raises `mem_limit` on the fly; otherwise `docker update --memory 1500m` + replay the restore |
| `pgdata` badly owned → postgres loops `FATAL` | `align_pgdata_owner()` (automatic) — otherwise check the actual postgres UID of the image, not a hard-coded value |
| Backend crash-loop `getpass.getuser() OSError` | Tenant's `APP_UID` ≠ the one baked into the image (`groupmod`/`usermod` instead of a 2nd `useradd`, fixed in the entrypoint) |
| DB password with an apostrophe | Change it **before** the export (injected on the command line) |
| 500s everywhere after import | Missing v4 skeleton — import reconciles it (`reconcile_custom_files_v4`); otherwise Part 2 §C |
| fs-watcher processes nothing | Workflows not re-registered — phase 5.a |
| Files landed in the wrong folder | Stub `.env`'s `OC_DATA_ROOT` ≠ mounted volume — prerequisite 3 |

Full detail: Appendices §9, §11 (catalog) and §15.

---
---

# Part 2 — Explanations & concrete example (3.6.2 → 4.0.0, custom `edissyum`)

This part illustrates the procedure with a **real migration** (custom `edissyum`,
v3.6.2 → Docker tenant v4.0.0, local source on an OC v3 server) and explains what
the import does under the hood. Scope: **OC core** — database + docservers +
custom + workflows + users + suppliers.

## A. What changes between the two worlds

| | Source (v3.6.2) | Target (v4.0.0) |
|---|---|---|
| Deployment | physical server, `/var/www/html/opencapture` | Docker, per-tenant stack |
| Database | local PostgreSQL `opencapture_<id>` | container `postgres:17.6`, `opencapture_<id>` |
| Docservers | `/var/docservers/opencapture/<id>/` | volumes `.../tenants/<id>/docservers` |
| Custom | `custom/<id>/` | `.../tenants/<id>/custom/<id>` |
| Paths | **absolute** (`/var/…`, `/var/www/html/…`) | everything under **`/app`** |

Volumetry observed on `edissyum` (for reference): docservers **816 MB**,
accounts_supplier **14,508**, documents 62, splitter_batches 95, workflows 22,
form_models 20, outputs 18, history 2,018.

**Schema delta 3.6.2 → 4.0.0** (small):
- New in v4, added by the upgrade: `documents.sha256`, `splitter_documents.md5/sha256`,
  `splitter_batches.sha256`+`original_filename`, `mailcollect.ocr_attachments`, table
  `settings_favorites`.
- Present in `structure.sql` (schema of a fresh installation) but **not backfilled**
  for a migrated tenant: `mailcollect.verifier_customer_id`/`verifier_form_id`. Dead
  columns — confirmed with no usage at all in the v4 code (backend, frontend) nor in
  a real verified source database. A migrated tenant will therefore **not** have
  these 2 columns, unlike a freshly installed tenant — with no known functional
  consequence, but a schema divergence to keep in mind.
- Gone in v4 (harmless, just leftover): `custom_fields.enabled`, `roles.enabled`,
  `mailcollect.folder_trash`.

## B. Schema upgrade (automatic in the import)

`migrate.sh import` applies the **official upgrade** `postgres/sql/4.0.0.sql`
(`form_models_field`, outputs, doctypes, cleanup, columns, `src.backend`→`src`
scripting…), then the **Docker leftover** `postgres/sql/4.0.0+.sql` (rewriting
`docservers`/`documents.path`/`attachments`/`workflows`/`outputs` paths → `/app`,
including **REFERENTIALS_PATH** read by v4, + guaranteeing the `SPLITTER_SHARE`
row if absent). Nothing to run by hand.

> `4.0.0.sql` is not idempotent: the import runs it **once** on a fresh import
> (it first removes `settings_favorites`, a v4-only table that survives the dump,
> otherwise its `CREATE` fails). The full "why": Appendices §6-§7.

> Between v3 and v4, the `form_models_field` fields (Splitter and Verifier) must be
> **reshaped**: v3 stores them flat, v4 expects rows. `4.0.0.sql` (§ "Modification
> of the field structure in `form_models_field`") handles this **entirely**, for
> both modules, generically (all `fields` sections, grouped by actual field width).
> Nothing more to do in `4.0.0+.sql` or by hand.

## C. Custom FILE gaps v3→v4 (otherwise HTTP 500 everywhere)

> **The consolidated version of `migrate.sh` does this AUTOMATICALLY**
> (`reconcile_custom_files_v4`): copies the missing v4 skeleton from
> `backend/installer/*` + assets + referential + `__init__.py`, adds `debugmode`,
> and merges the referential index. The commands below are only for
> **troubleshooting** a tenant migrated with an **old** version of migrate.sh.

Root cause: a migrated custom has `config.ini` present → docker-bootstrap
**short-circuits** copying the v4 skeleton. `create_classes_from_custom_id` runs
on EVERY request (via `get_locale`): the slightest missing file/key → **500 on
everything** (including login). Manual reconciliation from a NATIVE v4 tenant
(`<ref>`):

```bash
ED=${OC_DATA_ROOT}/tenants/<id>/custom/<id>
DE=${OC_DATA_ROOT}/tenants/<ref>/custom/<ref>     # native v4 reference tenant

# 1) config.ini: the 4.0.0 key 'debugmode' is absent in 3.6.2 (read by main.py)
grep -qi '^debugmode' "$ED/config/config.ini" \
  || sed -i '/^allowwfscripting/a debugmode = False' "$ED/config/config.ini"

# 2) config/: 4.0.0 scaffolding files (in v3 they were in the GLOBAL instance/config)
for f in OCR_ERRORS.xml extensions.json attachment_extensions.json; do
  [ -f "$ED/config/$f" ] || cp -a "$DE/config/$f" "$ED/config/$f"
done

# 3) supplier referential: the v3 JSON index is missing 5 keys read by Spreadsheet.py
python3 - "$ED/instance/referencial/default_referencial_supplier_index.json" <<'PY'
import json,sys,collections
p=sys.argv[1]; d=json.load(open(p,encoding='utf-8'),object_pairs_hook=collections.OrderedDict)
for k,v in {"lastname":"Nom","firstname":"Prénom","civility":"Civilité","function":"Fonction","informal_contact":"INFORMEL"}.items():
    d.setdefault(k,v)
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=4)
PY
```
Then restart the application containers (`restart backend worker-* fs-watcher`).
Check: `POST /<id>/ws/auth/login` (wrong password) returns **401** (not 500).
The "why": Appendices §8.

## D. The pitfall encountered: `OC_DATA_ROOT` on the right volume

On the target Docker host, the containers *were running* on
`/var/edissyum/opencapture` but the stub `.env` files had **drifted to `/opt`**
(91% full). `migrate.sh import` drops the files according to `OC_DATA_ROOT`
**read from the stub `.env`**: a wrong setting → files land in `/opt` while the
container mounts `/var` → **empty tenant + saturated root**. Hence the
`docker compose … config | grep source` check at step 3, to be done **before**
the import (prerequisite 3).

## E. Out of scope for "OC core" (to plan next)

- **Outgoing connectors** (outputs): `export_mem`, `export_opencaptureformem`,
  `export_cmis` (Alfresco), `export_openads`, `export_opencrm`, `export_verifier`
  (OpenGRU), `export_facturx`. Their URLs/credentials targeted the host
  (`localhost`…, valid when everything ran on the same machine) → **to be
  re-audited** to be reachable from the Docker network. Case handled in detail
  (MEM Courrier, `host-gateway` trick, points of caution):
  [`apache-hostgateway-serveur-test.md`](apache-hostgateway-serveur-test.md).
- **OCForMEM** (`/opt/edissyum/opencaptureformem`): **separate** companion app;
  decide migration vs keeping it outside the container (the MEM exports depend
  on it).
- **Alfresco / external services**: to be made reachable from the containers.

---
---

# Appendices — internal workings of `migrate.sh`

## 1. Model & principle

- **1 source custom = 1 Docker tenant** (1 stack + 1 database + its volumes).
- Migration in **3 phases + 1**, decoupled by a **portable bundle**:

```
   SOURCE (existing installation, local or SSH)     TARGET (Docker host)
   ┌───────────────────────────┐              ┌────────────────────────┐
   │  /var/www/html/opencapture │              │  opencapture_docker/   │
   │  local PostgreSQL          │   bundle     │  stub-tenants/<id>/    │
   │  /var/docservers /var/share│  ─────────▶  │  /var/edissyum/…/<id>/ │
   └───────────────────────────┘  (portable    └────────────────────────┘
        1. export  ───────────────  folder)        3. import
        2. diagnose (compares schemas)              4. reregister (API)
```

The bundle is a plain folder: you can export it on one machine, transport it,
import it on another.

## 2. The 4 subcommands

| Command | Role | Where it runs |
|---|---|---|
| `export`   | Reads the SOURCE, produces a bundle per custom | on the source (local or via SSH) |
| `diagnose` | Compares the source schema to the target schema (`structure.sql`) | local (reads the bundle) |
| `import`   | Drops, restores, **upgrades to 4.0.0**, rewrites paths, deploys | on the Docker host |
| `reregister` | Re-registers the workflows via the API (regenerates scripts + `watcher.ini`) | on the Docker host |

Built-in help: `./migrate.sh --help`.

## 3. The bundle (`<out>/customs/<cid>/`)

`export` produces, per custom:

| File | Content |
|---|---|
| `db.dump.sql` | `pg_dump --clean --if-exists --no-owner` of the source database |
| `custom.tar.gz` | the `custom/<cid>` folder (config, scripts, src, assets…) |
| `docservers.tar.gz` | the custom's docserver (`DOCSERVERS_PATH`) |
| `att-verifier.tar.gz`, `att-splitter.tar.gz` | **shared** attachments (see §9) |
| `share-export.tar.gz` | `share/export/` (outputs) |
| `ai-models.tar.gz` | the custom's AI models, if any |
| `meta.env` | metadata consumed by the import (see §7) |
| `schema.cols.txt`, `catalog.txt` | fingerprints for `diagnose` |

## 4. `export` — how it reads the source

1. Enumerates the customs from `custom/custom.ini` (one section = one custom).
2. For each custom, reads its `config/config.ini` → **PostgreSQL credentials**.
3. Queries the **source database** to find out the real paths (authority):
   - `docservers_src` ← `SELECT path FROM docservers WHERE docserver_id='DOCSERVERS_PATH'`
   - `share_src` ← `… docserver_id='INPUTS_ALLOWED_PATH'`
4. `pg_dump` + `tar` of the folders + writes `meta.env`.

**Remote** source: `--source user@host` + `MIGRATE_SSH` (e.g. `sshpass -p … ssh …`).
All reads go through `src_run` (local bash OR ssh).

## 5. `diagnose` — version gap detection

Compares two fingerprints:
- **target**: columns extracted from `postgres/sql/structure.sql` (4.0.0 schema).
- **source**: the bundle's `schema.cols.txt`.

A `table:column` gap = a likely version difference → **blocking at import**
unless `--force`. Since a migration from an earlier version inherently has a gap,
the import is run with `--force` (the gap is closed by the 4.0.0 upgrade, see §6).

## 6. `import` — the core

Order of operations (per custom):

```
 1. diagnose (blocking unless --force)
 2. reads stub-tenants/<id>/.env  (OC_DATA_ROOT, POSTGRES_*)
 3. FILE DROP  -> ${OC_DATA_ROOT}/tenants/<id>/{custom,docservers,share}
      + shared attachments (att-*.tar.gz) -> docservers/<mod>/attachments
 4. FILE REWRITE  (host paths -> /app in *.ini/*.py/*.sh/…)
      + [GLOBAL] reconciliation of config.ini
      + removal of *_workflows/*.sh scripts (regenerated at step 10)
      + refresh of the code skeleton (process_queue_*, templates)
 5. v4 CUSTOM RECONCILIATION  (reconcile_custom_files_v4, see §8)
 6. starts the tenant's postgres + waits for it to be ready
 7. DB UPGRADE (patch_db_paths function):
      DROP settings_favorites            (v4-only table surviving the dump)
      psql -f postgres/sql/4.0.0.sql     (OFFICIAL upgrade, form_models_field reshape included)
      psql -f postgres/sql/4.0.0+.sql    (Docker leftover, parameterized, see §7)
 8. deploy.sh <id>                       (builds the image + up -d the tenant)
 9. (if admin creds) reregister          (regenerates scripts + watcher.ini, see §10)
```

### Why this DB sequence (step 7)
- The dump brings back the source version's schema; `4.0.0.sql` is the
  **official** upgrade script (migrates `form_models_field`, `outputs`, `doctypes`,
  cleans up obsolete items, adds columns/table, fixes `src.backend`→`src`
  scripting…).
- `4.0.0.sql` is **not idempotent** → it is run **only once** on a fresh import.
  `settings_favorites` (a 4.0.0-only table) survives the dump's `--clean` →
  it is **removed beforehand**, otherwise its `CREATE TABLE` fails.
- `4.0.0+.sql` completes what `4.0.0.sql` does **not** cover: only the
  **adaptation of paths to `/app`** (Docker) — `4.0.0.sql` merely makes them
  relative `./` — and guaranteeing the `SPLITTER_SHARE` row. The reshape of
  `form_models_field` (v3 flat → v4 in rows) is entirely handled by `4.0.0.sql`
  (see Part 2 §B); nothing to add here.

## 7. The path chain (`:'docs_src'` variables, …)

`4.0.0+.sql` is **parameterized** by psql variables. They are not hard-coded:
they are **captured in the SOURCE database at export time**, carried through
`meta.env`, then re-injected at import time.

```
 EXPORT (source)                       meta.env            IMPORT (target)
 ───────────────                       ────────            ─────────────
 SELECT path … DOCSERVERS_PATH   ─▶ DOCSERVERS_SRC ─▶ DOCSERVERS_SRC ─┐
 SELECT path … INPUTS_ALLOWED    ─▶ SHARE_SRC      ─▶ SHARE_SRC       │ patch_db_paths(...)
 --oc-root argument              ─▶ OC_ROOT        ─▶ OC_ROOT         │      │
                                                    dirname(DOCS_SRC) │      ▼
                                                    /app/custom/<id>  │  psql -v docs_src=… \
                                                                      ▼        docs_root=… \
                                                                          share_src=… oc_root=… \
                                                                          app_custom=… cid=… \
                                                                        < 4.0.0+.sql
```

Values (`edissyum` example):

| psql var | origin | value |
|---|---|---|
| `docs_src`   | docservers `DOCSERVERS_PATH` (source DB) | `/var/docservers/opencapture/edissyum` |
| `docs_root`  | `dirname(docs_src)` | `/var/docservers/opencapture` |
| `share_src`  | docservers `INPUTS_ALLOWED_PATH` (source DB) | `/var/share/edissyum` |
| `oc_root`    | export's `--oc-root` argument | `/var/www/html/opencapture` |
| `app_custom` | Docker constant | `/app/custom/edissyum` |
| `cid`        | custom id | `edissyum` |

**Why these rewrites**: on an existing installation the paths are ABSOLUTE
(`/var/docservers/…`, `/var/share/…`, `/var/www/html/opencapture/…`); in a
container everything is under `/app`. The Verifier stores `documents.path`/
`attachments` as absolute paths (the Splitter as relative) → they must be
rewritten, otherwise "file not found". `REFERENTIALS_PATH` (supplier referential)
is read by v4 → rewriting is essential.

## 8. `reconcile_custom_files_v4` — missing v4 skeleton

A **migrated** custom already has its `config.ini` present → at startup,
`docker-bootstrap` **short-circuits** copying the v4 skeleton (which
`create_custom.sh` does for a NEW custom). Result: files that the v4 code expects
are missing, and `create_classes_from_custom_id` (run on EVERY request) crashes
→ **HTTP 500 everywhere**.

`reconcile_custom_files_v4` therefore copies **what's missing** (never overwrites)
from the repo, with `§§…§§` → container path substitution:
- `backend/installer/*` (including `bin/scripts/splitter_methods/`,
  `splitter_metadata/`…), **excluding** `*_workflows/*.sh` (regenerated at
  re-registration);
- assets (`logo_company.png`…), `instance/referencial/*`;
- package markers `__init__.py` (without them, custom module imports break);
- `config.ini`: adds `debugmode`; merges the referential index's missing keys.

Requires `python3` on the Docker host (called directly, not in a container) —
if absent, these steps are skipped **silently** (see pitfall catalog, pitfall 3).

## 9. Robustness points

- **Anti-OOM restore**: the postgres container has a low `mem_limit`
  (`x-res-postgres`, ~512m with no swap). The restore under load can get
  **killed** (exit 137). Import **raises the limit on the fly** (`docker update`)
  for the duration of the restore.
- **`pgdata` ownership alignment**: `align_pgdata_owner()` reads the real
  UID/GID of the `postgres` user **in the image** (via a throwaway container),
  rather than hard-coding a value — a `pgdata` already populated under a
  different UID (interrupted import, inconsistent `sudo` between two runs)
  would otherwise loop postgres in `FATAL: Permission denied` (see pitfall
  catalog, pitfall 4).
- **SHARED attachments**: `VERIFIER/SPLITTER_ATTACHMENTS` live at the ROOT of
  the docservers (siblings of the custom subfolder) → **outside**
  `docservers.tar.gz`. The export captures them separately (`att-*.tar.gz`),
  and the import drops them into the container layout.
- **Remote source**: everything goes through `src_run` (local bash OR
  `MIGRATE_SSH`).

## 10. `reregister` — why and how

The `bin/scripts/*_workflows/*.sh` scripts carry a `§§SCRIPT_NAME§§` that
**only the app** fills in when a workflow is (re-)registered. The import
**removes** them (they would be frozen otherwise) → without re-registration,
the **fs-watcher does not process** drops.

`reregister` (or import with `--admin-user/--admin-password`) replays the API:
`login` → `auth_token` → for each workflow, `POST …/workflows/<mod>/createScriptAndWatcher`
`{workflow_id, input_folder, workflow_label}` → regenerates the script +
`watcher.ini`, then restarts the fs-watcher. The client runs **inside the
backend container** and reaches the API via the `frontend` service (no need for
the host's Traefik port).

The **UI upload**, on the other hand, goes through the worker (kuyruk) without
these `.sh` files → it works even without re-registration.

## 11. Catalog of pitfalls encountered (real migrations, 2026-07-08 → 2026-07-21)

Distinct bugs already encountered and then fixed in `migrate.sh`/
`infra/docker-entrypoint.sh`/`postgres/sql/`. To check PROACTIVELY before
replaying a migration on a fresh environment rather than rediscovering them one
by one.

1. **Silent SSH**: `migrate.sh export` fails with a misleading message
   ("custom.ini not found") when the real problem is an SSH failure
   (`BatchMode=yes` refuses password auth, "Host key verification failed" on a
   fresh machine) — the SSH error is swallowed by `2>/dev/null`. **Workaround**:
   set `MIGRATE_SSH="sshpass -p <password> ssh -o StrictHostKeyChecking=accept-new"`
   BEFORE `export`, in the SAME shell (non-persistent variable).
2. **`MIGRATE_SSH` quoting pitfall**: `sshpass -p 'password'` (with apostrophes)
   fails — `migrate.sh` uses `$SSH_CMD` UNquoted (intentional word-splitting),
   which does not strip quotes from an already-expanded variable → sshpass
   literally receives the apostrophes as part of the password. **Never put
   apostrophes** in `MIGRATE_SSH` if the password has no space.
3. **`sshpass`/`python3` missing** on a fresh install of the Docker host → to
   be included in the general installation
   ([`../01-install-general.md`](../01-install-general.md)). `python3` is
   necessary because `reconcile_custom_files_v4` (§8) calls it DIRECTLY on
   the host (not in a container) to patch `metadata_methods.json`/merge the
   referential — if absent, these steps are skipped **silently** (symptom:
   empty metadata zones + crash).
4. **`pgdata` badly owned → postgres `FATAL` looping**: a `pgdata` already
   populated (interrupted import, inconsistent `sudo` between two runs) stays
   at the host user's UID instead of the container's postgres UID (varies by
   image, do NOT hard-code) → `could not open file
   "global/pg_filenode.map": Permission denied` in a loop. **Fixed**:
   `align_pgdata_owner()` (§9).
5. **Backend crash-loop `getpass.getuser()` OSError**: the backend image is
   BAKED with an `APP_UID`/`APP_GID` (e.g. 1001, aligned to the host UID at
   build time) different from the tenant's (stub `.env`, e.g. 1000). The
   entrypoint's runtime fallback (creating a passwd entry for the target UID)
   was doing `groupadd`/`useradd` under `${APP_USER}` — a name ALREADY taken
   by the group/user built at the build UID — silent failure
   (`already exists`) → no passwd entry for the target UID →
   `getpass.getuser()` (called by torch at load time) raises `OSError` →
   gunicorn never starts → blank page. **Fixed**: `infra/docker-entrypoint.sh`
   does `groupmod`/`usermod` if the name already exists, instead of attempting
   a second `groupadd`/`useradd`.
6. **Leftover from custom renaming (`docservers.path`)**: renaming the bundle
   folder (`customs/<source_id>` → `customs/<target_id>`) does NOT rewrite the
   "absolute PROJECT_PATH" `docservers.path` values stored under the OLD name
   (e.g. `REFERENTIALS_PATH` = `/app/custom/<source_id>/instance/referencial/`)
   — `patch_db_paths` only knows the TARGET CID. Symptom: 500 everywhere,
   `Spreadsheet.__init__` → `FileNotFoundError` on the supplier referential.
   **Fixed**: `migrate.sh` compares `meta.env`'s `CUSTOM_ID` (source id, written
   at export time) to the bundle folder name (target id) and fixes it
   automatically.
   - **Pitfall of the fix itself**: the 1st version used
     `psql -c "UPDATE ... :'old' ..." -v old=...` — **`psql -c` does NOT
     interpolate `:'var'`** (unlike `-f` or stdin/heredoc) → a SQL syntax
     error swallowed by `2>/dev/null`, silently inoperative fix. **General
     lesson: any new `psql` invocation in this script must pass `-v`
     variables via `-f`/stdin, never via `-c`.**
7. **chown race at the `init` service's startup**: the entrypoint's `chown -R`
   (gated by a sentinel, meant to run only once) had not propagated to the
   whole `custom/<cid>/` tree before `docker-bootstrap.sh` tried to write to
   its log (`touch: Permission denied`), whereas an identical manual
   `chown -R` works instantly. Exact cause not elucidated. **Workaround**:
   manual `chown -R` on the host then a new `up -d`. **Unexplored lead**:
   replace the file sentinel with a lock (`flock`) if it recurs.
8. **Stub `.env` left at `changeme` values** after `new-tenant.sh`:
   `OC_FQDN=changeme.example.com` breaks Traefik routing (404, no router
   matches); `POSTGRES_PASSWORD`/`RABBITMQ_PASS=changeme` are not blocking as
   long as it stays internally consistent, but should be changed — ⚠️
   changing `POSTGRES_PASSWORD` afterwards also requires an `ALTER USER` in
   the database (already applied at the 1st postgres startup, a plain `.env`
   edit is not retroactively enough).
9. Frontend build `npm ci` with `ECONNRESET`/"network aborted" — transient,
   resolved with a simple retry (not a repo bug).
10. **`SPLITTER_SHARE` absent from a real source database**: the code
    (`scripting_functions.launch_script_splitter`) and the `data_fr.sql` seed
    expect to find a `docservers.docserver_id='SPLITTER_SHARE'` row — but a
    source database verified under real conditions did NOT have it (old
    drift, never caught up), while it did have `VERIFIER_SHARE`. Without a
    backfill, a Splitter workflow using custom scripting raises a `KeyError`.
    **Do not assume** that a seed row is necessarily present in the database
    just because it is in the version's source code: `4.0.0+.sql` now
    guarantees it via an idempotent `INSERT ... WHERE NOT EXISTS` (see
    Part 2 §B).

## 12. Related files

| File | Role |
|---|---|
| `postgres/sql/structure.sql` | target 4.0.0 schema (`diagnose`'s reference) |
| `postgres/sql/4.0.0.sql` | OFFICIAL upgrade to 4.0.0 (run by the import), `form_models_field` reshape included |
| `postgres/sql/4.0.0+.sql` | Docker leftover: paths → `/app` + `SPLITTER_SHARE` guarantee — nothing else (see pitfall 10) |
| `deploy.sh` | builds the image + `up -d` the tenant (called by the import) |
| `infra/docker-bootstrap.sh` | self-heal at container startup (config.ini, custom.ini) |
| `new-tenant.sh` | creates a tenant's stub (import prerequisite) |

## 13. Not migrated (intentional)

- **RabbitMQ**: transient queues (pending jobs) — nothing to carry over since
  the migration is done cold, everything is supposed to be drained before the
  export.
- **`share/entrant/`**: drop folder watched by the fs-watcher — must be empty
  when cold; if it is not, the freeze of processing on the source was not done.
- **`custom.ini`**: on the source, lists ALL customs on the machine with paths
  specific to that machine — not carried over. The Docker bootstrap regenerates
  a new one, scoped to the single tenant created.

## 14. Known limitations

- **DB password with an apostrophe**: injected on the command line
  (`PGPASSWORD='…'`) → a `'` breaks the command, change it before the export.
- **Relative paths** (`./…` in the database/`config.ini`): the container runs
  with WORKDIR `/app` → they transpose as-is; only **absolute** paths are
  rewritten (see §7 and `4.0.0+.sql`).
- **Source on a very OLD OC version**: at import time, certain known
  "skeleton" files (`process_queue_*.py`, worker templates — §6) are
  **replaced** by their v4 version from the repo, rather than patched in
  place — this avoids mixing overly dated glue code with the rest. But this
  replacement covers ONLY these known files: if the source custom contains
  heavily customized in-house modules (scripting, connectors) written for a
  version well before 3.6.x, those are not covered and may need manual
  adaptation after migration.
- **UID/GID**: `docker-entrypoint.sh` `chown`s the mounts on first boot — slow
  on a large docservers tree (be patient on the initial startup).
