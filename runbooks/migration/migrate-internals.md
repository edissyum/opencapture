# Comprendre `migrate.sh`

Explication du fonctionnement interne de `migrate.sh` (reprise d'une install
OpenCapture **bare-metal** vers la stack **Docker** de ce dépôt). Pour la procédure
pas-à-pas (procédure générique + exemple concret), voir
[`01-migrate-baremetal.md`](01-migrate-baremetal.md) ; ici on explique le
**pourquoi** et le **comment**.

---

## 1. Modèle & principe

- **1 custom bare-metal = 1 tenant Docker** (1 stack + 1 base + ses volumes).
- Reprise en **3 phases + 1**, découplées par un **bundle portable** :

```
   SOURCE (bare-metal, local ou SSH)          CIBLE (hôte Docker)
   ┌───────────────────────────┐              ┌────────────────────────┐
   │  /var/www/html/opencapture │              │  opencapture_docker/   │
   │  PostgreSQL locale         │   bundle     │  stub-tenants/<id>/    │
   │  /var/docservers /var/share│  ─────────▶  │  /var/edissyum/…/<id>/ │
   └───────────────────────────┘  (dossier     └────────────────────────┘
        1. export  ───────────────  portable)        3. import
        2. diagnose (compare schémas)                 4. reregister (API)
```

Le bundle est un simple dossier : on peut exporter sur une machine, le transporter,
importer sur une autre.

---

## 2. Les 4 sous-commandes

| Commande | Rôle | Où ça tourne |
|---|---|---|
| `export`   | Lit la SOURCE, produit un bundle par custom | sur la source (local ou via SSH) |
| `diagnose` | Compare le schéma source au schéma cible (`structure.sql`) | local (lit le bundle) |
| `import`   | Dépose, restaure, **monte en 4.0.0**, réécrit les chemins, déploie | sur l'hôte Docker |
| `reregister` | Ré-enregistre les workflows via l'API (régénère scripts + `watcher.ini`) | sur l'hôte Docker |

Aide intégrée : `./migrate.sh --help`.

---

## 3. Le bundle (`<out>/customs/<cid>/`)

L'`export` produit, par custom :

| Fichier | Contenu |
|---|---|
| `db.dump.sql` | `pg_dump --clean --if-exists --no-owner` de la base source |
| `custom.tar.gz` | le dossier `custom/<cid>` (config, scripts, src, assets…) |
| `docservers.tar.gz` | le docserver du custom (`DOCSERVERS_PATH`) |
| `att-verifier.tar.gz`, `att-splitter.tar.gz` | pièces jointes **partagées** (voir §9) |
| `share-export.tar.gz` | `share/export/` (sorties) |
| `ai-models.tar.gz` | modèles IA du custom, s'ils existent |
| `meta.env` | métadonnées consommées par l'import (voir §7) |
| `schema.cols.txt`, `catalog.txt` | empreintes pour `diagnose` |

---

## 4. `export` — comment il lit la source

1. Énumère les customs depuis `custom/custom.ini` (une section = un custom).
2. Pour chaque custom, lit sa `config/config.ini` → **identifiants PostgreSQL**.
3. Interroge la **base source** pour connaître les chemins réels (autorité) :
   - `docservers_src` ← `SELECT path FROM docservers WHERE docserver_id='DOCSERVERS_PATH'`
   - `share_src` ← `… docserver_id='INPUTS_ALLOWED_PATH'`
4. `pg_dump` + `tar` des dossiers + écrit `meta.env`.

Source **distante** : `--source user@host` + `MIGRATE_SSH` (ex. `sshpass -p … ssh …`).
Toutes les lectures passent par `src_run` (bash local OU ssh).

---

## 5. `diagnose` — détection d'écart de version

Compare deux empreintes :
- **cible** : colonnes extraites de `postgres/sql/structure.sql` (schéma 4.0.0).
- **source** : `schema.cols.txt` du bundle.

Un écart `table:colonne` = probable différence de version → **bloquant à l'import**
sauf `--force`. Comme une reprise v3→v4 a par nature un écart, l'import se fait avec
`--force` (l'écart est comblé par la montée 4.0.0, voir §6).

---

## 6. `import` — le cœur

Ordre des opérations (par custom) :

```
 1. diagnose (bloquant sauf --force)
 2. lit stub-tenants/<id>/.env  (OC_DATA_ROOT, POSTGRES_*)
 3. DÉPÔT FICHIERS  -> ${OC_DATA_ROOT}/tenants/<id>/{custom,docservers,share}
      + pièces jointes partagées (att-*.tar.gz) -> docservers/<mod>/attachments
 4. RÉÉCRITURE FICHIERS  (chemins hôte -> /app dans *.ini/*.py/*.sh/…)
      + réconciliation [GLOBAL] de config.ini
      + suppression des scripts *_workflows/*.sh (régénérés à l'étape 10)
      + rafraîchissement du code-squelette (process_queue_*, templates)
 5. RÉCONCILIATION CUSTOM v4  (reconcile_custom_files_v4, voir §8)
 6. démarre postgres du tenant + attend qu'il soit prêt
 7. MONTÉE DB (fonction patch_db_paths) :
      DROP settings_favorites            (table v4-only survivante au dump)
      psql -f postgres/sql/4.0.0.sql     (montée OFFICIELLE 3.6.x -> 4.0.0)
      psql -f postgres/sql/4.0.0+.sql    (résiduel Docker, paramétré, voir §7)
 8. deploy.sh <id>                       (build image + up -d le tenant)
 9. (si creds admin) reregister          (régénère scripts + watcher.ini, voir §10)
```

### Pourquoi cet enchaînement DB (étape 7)
- Le dump ramène le schéma **3.6.x** ; `4.0.0.sql` est le script **officiel** de montée
  (migre `form_models_field`, `outputs`, `doctypes`, nettoie les obsolètes, ajoute
  colonnes/table, corrige le scripting `src.backend`→`src`…).
- `4.0.0.sql` **n'est pas idempotent** → il est joué **une seule fois** sur un import
  frais. `settings_favorites` (table 4.0.0-only) survit au `--clean` du dump →
  on la **supprime avant** sinon son `CREATE TABLE` échoue.
- `4.0.0+.sql` complète ce que `4.0.0.sql` ne couvre pas : **colonnes post-4.0.0**
  (`mailcollect.verifier_customer_id`/`verifier_form_id`) et surtout l'**adaptation
  des chemins vers `/app`** (Docker), que `4.0.0.sql` ignore (il rend les chemins
  simplement relatifs `./`).

---

## 7. La chaîne des chemins (variables `:'docs_src'`, …)

`4.0.0+.sql` est **paramétré** par des variables psql. Elles ne sont pas en dur :
elles sont **capturées dans la base SOURCE à l'export**, transportées par `meta.env`,
puis réinjectées à l'import.

```
 EXPORT (source)                       meta.env            IMPORT (cible)
 ───────────────                       ────────            ─────────────
 SELECT path … DOCSERVERS_PATH   ─▶ DOCSERVERS_SRC ─▶ DOCSERVERS_SRC ─┐
 SELECT path … INPUTS_ALLOWED    ─▶ SHARE_SRC      ─▶ SHARE_SRC       │ patch_db_paths(...)
 argument --oc-root              ─▶ OC_ROOT        ─▶ OC_ROOT         │      │
                                                    dirname(DOCS_SRC) │      ▼
                                                    /app/custom/<id>  │  psql -v docs_src=… \
                                                                      ▼        docs_root=… \
                                                                          share_src=… oc_root=… \
                                                                          app_custom=… cid=… \
                                                                        < 4.0.0+.sql
```

Valeurs (exemple `edissyum`) :

| var psql | origine | valeur |
|---|---|---|
| `docs_src`   | docservers `DOCSERVERS_PATH` (DB source) | `/var/docservers/opencapture/edissyum` |
| `docs_root`  | `dirname(docs_src)` | `/var/docservers/opencapture` |
| `share_src`  | docservers `INPUTS_ALLOWED_PATH` (DB source) | `/var/share/edissyum` |
| `oc_root`    | argument `--oc-root` de l'export | `/var/www/html/opencapture` |
| `app_custom` | constante Docker | `/app/custom/edissyum` |
| `cid`        | id du custom | `edissyum` |

**Pourquoi ces réécritures** : en bare-metal les chemins sont ABSOLUS
(`/var/docservers/…`, `/var/share/…`, `/var/www/html/opencapture/…`) ; en conteneur
tout est sous `/app`. Le Verifier stocke `documents.path`/`attachments` en absolu
(le Splitter en relatif) → il faut les réécrire, sinon « fichier introuvable ».
`REFERENTIALS_PATH` (référentiel fournisseurs) est lu par v4 → réécriture indispensable.

---

## 8. `reconcile_custom_files_v4` — squelette v4 manquant

Un custom **migré** a son `config.ini` déjà présent → au démarrage, `docker-bootstrap`
**court-circuite** la copie du squelette v4 (que `create_custom.sh` fait pour un custom
NEUF). Résultat : il manque des fichiers que le code v4 attend, et
`create_classes_from_custom_id` (exécuté à CHAQUE requête) plante → **HTTP 500 partout**.

`reconcile_custom_files_v4` copie donc le **manquant** (jamais d'écrasement) depuis le
dépôt, avec substitution `§§…§§` → chemins conteneur :
- `backend/installer/*` (dont `bin/scripts/splitter_methods/`, `splitter_metadata/`…),
  **hors** `*_workflows/*.sh` (régénérés à la ré-inscription) ;
- assets (`logo_company.png`…), `instance/referencial/*` ;
- marqueurs de package `__init__.py` (sans eux, l'import des modules custom casse) ;
- `config.ini` : ajoute `debugmode` ; fusionne les clés manquantes de l'index référentiel.

---

## 9. Points de robustesse

- **Anti-OOM restauration** : le conteneur postgres a une `mem_limit` basse
  (`x-res-postgres`, ~512m sans swap). La restauration sous charge peut être **tuée**
  (exit 137). L'import **relève la limite à chaud** (`docker update`) le temps du restore.
- **Pièces jointes PARTAGÉES** : `VERIFIER/SPLITTER_ATTACHMENTS` vivent à la RACINE des
  docservers (siblings du sous-dossier custom) → **hors** `docservers.tar.gz`. L'export
  les capture à part (`att-*.tar.gz`), l'import les dépose dans le layout conteneur.
- **Source distante** : tout passe par `src_run` (bash local OU `MIGRATE_SSH`).

---

## 10. `reregister` — pourquoi et comment

Les scripts `bin/scripts/*_workflows/*.sh` portent un `§§SCRIPT_NAME§§` que **seule
l'app** renseigne à la (ré)inscription d'un workflow. L'import les **retire** (ils
seraient figés) → sans ré-inscription, le **fs-watcher ne traite pas** les dépôts.

`reregister` (ou l'import avec `--admin-user/--admin-password`) rejoue l'API :
`login` → `auth_token` → pour chaque workflow, `POST …/workflows/<mod>/createScriptAndWatcher`
`{workflow_id, input_folder, workflow_label}` → régénère le script + `watcher.ini`, puis
redémarre le fs-watcher. Le client tourne **dans le conteneur backend** et joint l'API
via le service `frontend` (pas besoin du port Traefik de l'hôte).

L'**upload UI**, lui, passe par le worker (kuyruk) sans ces `.sh` → il marche même sans
ré-inscription.

---

## 11. Prérequis & pièges

- **Migration à FROID** : geler le traitement source (workers/watcher/mailcollect) avant
  l'export, sinon incohérence fichier/base.
- Le **stub tenant** doit exister AVANT l'import (`new-tenant.sh <http|le|cert> <id>` +
  éditer `.env` : `OC_FQDN`, mots de passe, **`OC_DATA_ROOT`**).
- `import` lit `OC_DATA_ROOT` dans le **stub `.env`** → il doit pointer le bon volume.
- `--force` attendu (écart de version comblé par la montée 4.0.0).

## 12. Fichiers liés

| Fichier | Rôle |
|---|---|
| `postgres/sql/structure.sql` | schéma cible 4.0.0 (référence de `diagnose`) |
| `postgres/sql/4.0.0.sql` | montée OFFICIELLE 3.6.x → 4.0.0 (jouée par l'import) |
| `postgres/sql/4.0.0+.sql` | résiduel Docker (colonnes post-4.0.0 + chemins → `/app`) |
| `deploy.sh` | build image + `up -d` du tenant (appelé par l'import) |
| `infra/docker-bootstrap.sh` | self-heal au démarrage du conteneur (config.ini, custom.ini) |
| `new-tenant.sh` | crée le stub d'un tenant (prérequis de l'import) |

---

## 13. Non migré (volontaire)

RabbitMQ (file transitoire), `share/entrant/` (doit être vide à froid), `custom.ini`
(régénéré par le bootstrap pour le seul tenant). Les chemins en dur (base **et**
fichiers) sont réécrits vers le layout conteneur `/app/…`.

## 14. Rollback

L'import ne touche **pas** la source. Pour repartir de zéro sur un tenant :
```bash
docker compose --project-directory stub-tenants/<id> \
  -f stub-tenants/<id>/docker-compose.yml down          # jamais -v
rm -rf "${OC_DATA_ROOT}/tenants/<id>"
```
puis recréer le stub et relancer l'import. La source reste la référence tant qu'elle
n'est pas décommissionnée — ne l'éteindre **qu'après validation**.

## 15. Limites connues

- **Mot de passe DB avec apostrophe** : injecté en ligne de commande (`PGPASSWORD='…'`)
  → un `'` casse la commande, le changer avant l'export.
- **Chemins relatifs** (`./…` en base/`config.ini`) : le conteneur tourne en WORKDIR
  `/app` → ils se transposent tels quels ; seuls les chemins **absolus** sont réécrits
  (cf. §7 et `4.0.0+.sql`).
- **Code d'une version OC plus ANCIENNE** : l'import réécrit `process_queue_*.py` +
  templates depuis le dépôt (§6) ; des modules maison très éloignés peuvent rester à
  rafraîchir à la main.
- **UID/GID** : `docker-entrypoint.sh` `chown` les mounts au 1er boot — long sur un gros
  docservers (patienter au démarrage initial).
