# 01 — Reprise OpenCapture 3.6.2 (bare-metal) → 4.0.0 (Docker)

Reprise des données du custom **`edissyum`** (v3.6.2 bare-metal) vers un **nouveau
tenant Docker `edissyum`** (v4.0.0). Périmètre : **OC core** — base + docservers +
custom + workflows + users + fournisseurs. Les connecteurs sortants (MEM / Alfresco
/ OpenADS / OpenCRM) et OCForMEM sont **repris en base mais reconfigurés dans un
second temps** (voir §7).

Cas de référence : serveur `serveur de test principal interne` (serveur de test principal interne).

---

## 1. Contexte mesuré (à titre indicatif)

| | Source (v3.6.2) | Cible (v4.0.0) |
|---|---|---|
| Déploiement | bare-metal `/var/www/html/opencapture` | Docker, stack par tenant |
| Base | PostgreSQL locale `opencapture_edissyum` (edissyum/edissyum) | conteneur `postgres:17.6`, `opencapture_edissyum` |
| Docservers | `/var/docservers/opencapture/edissyum/` (**816 Mo**) | volumes `.../tenants/edissyum/docservers` |
| Custom | `custom/edissyum/` | `.../tenants/edissyum/custom/edissyum` |

Volumétrie : users 6 · roles 6 · **accounts_supplier 14 508** · documents 62 ·
splitter_batches 95 / documents 246 · workflows 22 · form_models 20 · outputs 18 ·
history 2 018.

**Delta de schéma 3.6.2 → 4.0.0** (faible) :
- Nouveau en v4 : `documents.sha256`, `splitter_documents.md5/sha256`,
  `splitter_batches.sha256`+`original_filename`, `mailcollect.{ocr_attachments,
  verifier_customer_id,verifier_form_id}`, table `settings_favorites`.
- Disparu en v4 (bénin, reste en trop) : `custom_fields.enabled`, `roles.enabled`,
  `mailcollect.folder_trash`.

`migrate.sh import` applique la montée officielle `postgres/sql/4.0.0.sql` puis le
résiduel Docker `postgres/sql/4.0.0+.sql` (§5).

---

## 2. ⚠ Prérequis critiques

1. **Migration À FROID.** Sur la source, arrêter tout traitement (workers kuyruk,
   watcher, mailcollect) et vider les files avant l'export, sinon états incohérents.
   ```bash
   # sur la source bare-metal (adapter aux services réels)
   sudo systemctl stop 'OCVerifier_worker*' 'OCSplitter_worker*' 2>/dev/null || true
   # + stopper le watcher (bin/watcher ... stop) et le worker mail
   ```

2. **`OC_DATA_ROOT` = `/var`, PAS `/opt`.** Sur `serveur de test principal interne`, les conteneurs *tournent*
   sur `/var/edissyum/opencapture` mais les stubs `.env` ont **dérivé sur `/opt`**
   (`/opt` est sur `/`, plein à 91 %). `migrate.sh import` **dépose les fichiers selon
   `OC_DATA_ROOT` lu dans le stub `.env`**. Il faut donc **fixer `/var` dans le stub
   du tenant `edissyum`** (étape 3), sinon les fichiers atterrissent dans `/opt`
   pendant que le conteneur monte `/var` → tenant vide + racine saturée.
   > À traiter séparément : réaligner aussi `democv4` et `test1` sur `/var` avant tout
   > `deploy.sh` (sinon prochain redéploiement bascule sur `/opt`).

3. **Espace disque.** Cible `/var` (≈26 Go libres) OK pour 816 Mo + base. Ne PAS
   viser `/opt`.

---

## 3. Créer le tenant cible

```bash
cd ~/opencapture_docker
./new-tenant.sh http edissyum          # (ou 'le'/'cert' selon exposition voulue)
$EDITOR stub-tenants/edissyum/.env
```
Dans `stub-tenants/edissyum/.env`, renseigner :
- `CUSTOM_ID=edissyum`
- `OC_FQDN=opencapture.edissyum.com`  ← **choisi** (la v3 n'a aucun FQDN → pas de collision ; cohérent avec le domaine `edissyum.com` et l'historique du custom)
- `OC_DATA_ROOT=/var/edissyum/opencapture`  ← **impératif (cf. §2.2)**
- Mots de passe `POSTGRES_PASSWORD`, `RABBITMQ_PASS`.

> Routage : la v3 (Apache) tient déjà 80/443 sur la VM ; le Traefik du Docker est sur
> des ports alternatifs. Pour joindre `opencapture.edissyum.com` en HTTP standard, soit
> libérer 80/443 au cut-over final, soit passer par le port alt de Traefik pendant la
> validation. Changer le FQDN plus tard = éditer `OC_FQDN` + `./deploy.sh edissyum`.

Vérifier la résolution AVANT d'aller plus loin (doit afficher `/var/...`) :
```bash
docker compose --project-directory stub-tenants/edissyum \
  -f stub-tenants/edissyum/docker-compose.yml config | grep -E 'source:.*edissyum'
```

---

## 4. Export → Diagnose → Import

Source **locale** (bare-metal sur la même VM). Auth par mot de passe via `MIGRATE_SSH`
non requis en local ; on garde `--source local`.

```bash
# 4a. Export du seul custom edissyum
./migrate.sh export --source local \
    --oc-root /var/www/html/opencapture \
    --out /var/tmp/oc-bundle --custom edissyum

# 4b. Diagnose (ATTENDU : signale l'écart 3.6.2 vs 4.0.0 — c'est normal)
./migrate.sh diagnose --bundle /var/tmp/oc-bundle

# 4c. Import (--force car skew connu et couvert par le top-up de l'étape 5).
#     --no-deploy : on applique le top-up SQL AVANT le déploiement complet.
./migrate.sh import --bundle /var/tmp/oc-bundle --custom edissyum --force --no-deploy
```

`import` fait : dépose custom/docservers/share sous `/var/.../tenants/edissyum/`,
réécrit les chemins hôte→conteneur dans les fichiers, restaure le dump, **monte la
base en 4.0.0** (voir §5), rafraîchit le code-squelette.

---

## 5. Montée de schéma 3.6.x → 4.0.0 (automatique dans l'import)

`migrate.sh import` applique la **montée officielle** `postgres/sql/4.0.0.sql`
(form_models_field, outputs, doctypes, nettoyage, colonnes, scripting `src.backend`→`src`…),
puis le **résiduel Docker** `postgres/sql/4.0.0+.sql` (colonnes post-4.0.0
`mailcollect.verifier_*` + réécriture des chemins `documents.path`/`attachments`/docservers
→ `/app`, dont **REFERENTIALS_PATH** lu par v4). Rien à jouer à la main.
> `4.0.0.sql` n'est pas idempotent : l'import le joue UNE fois sur un import frais
> (il retire d'abord `settings_favorites`, table v4-only survivante au dump).

### 5b. Écarts de FICHIERS custom v3→v4 (sinon HTTP 500 partout)

> **Depuis la version consolidée, `migrate.sh import` fait ceci AUTOMATIQUEMENT**
> (`reconcile_custom_files_v4`, étape 2e) : il copie tout le squelette v4 manquant
> depuis `backend/installer/*` + assets + référentiel + `__init__.py`, ajoute
> `debugmode`, et fusionne l'index référentiel. Les commandes ci-dessous ne servent
> que pour un tenant migré AVEC UNE ANCIENNE version de migrate.sh.

Cause racine : un custom migré a `config.ini` présent → le docker-bootstrap
COURT-CIRCUITE la copie du squelette v4 (que `create_custom.sh` fait pour un custom
neuf). `create_classes_from_custom_id` tourne à CHAQUE requête (via `get_locale`) : le
moindre fichier/clé manquant → **500 sur tout** (login, ouverture de workflow Splitter,
génération de séparateur…). Deux familles : (1) config/index (login) ; (2) runtime :
`bin/scripts/splitter_methods/*` (méthodes de split), `assets/imgs/logo_company.png`,
et les `__init__.py` (import des modules custom par les workers). À réconcilier depuis
un tenant NATIF v4 (ex. `democv4`) si migrate.sh ancien — vécu sur serveur de test principal interne :

```bash
ED=/var/edissyum/opencapture/tenants/edissyum/custom/edissyum
DE=/var/edissyum/opencapture/tenants/democv4/custom/democv4

# 1) config.ini : clé 4.0.0 'debugmode' absente en 3.6.2 (lue par main.py)
grep -qi '^debugmode' "$ED/config/config.ini" \
  || sed -i '/^allowwfscripting/a debugmode = False' "$ED/config/config.ini"

# 2) config/ : fichiers scaffolding 4.0.0 (en v3 ils étaient dans instance/config GLOBAL)
for f in OCR_ERRORS.xml extensions.json attachment_extensions.json; do
  [ -f "$ED/config/$f" ] || cp -a "$DE/config/$f" "$ED/config/$f"
done

# 3) référentiel fournisseurs : l'index JSON v3 manque 5 clés lues par Spreadsheet.py
#    (lastname, firstname, civility, function, informal_contact)
python3 - "$ED/instance/referencial/default_referencial_supplier_index.json" <<'PY'
import json,sys,collections
p=sys.argv[1]; d=json.load(open(p,encoding='utf-8'),object_pairs_hook=collections.OrderedDict)
for k,v in {"lastname":"Nom","firstname":"Prénom","civility":"Civilité","function":"Fonction","informal_contact":"INFORMEL"}.items():
    d.setdefault(k,v)
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=4)
PY
```
Puis redémarrer les conteneurs applicatifs (`restart backend worker-* fs-watcher`).
Vérifier : `POST /edissyum/ws/auth/login` (mauvais mdp) renvoie **401** (et non 500).

---

## 6. Déploiement + post-migration

```bash
./deploy.sh edissyum
```

Puis, dans l'UI du tenant `edissyum` :
1. **Ré-enregistrer chaque workflow** Verifier/Splitter une fois (régénère les
   scripts + `watcher.ini` aux chemins conteneur `/app/...`).
2. **Redémarrer le fs-watcher** (`dc edissyum restart fs-watcher`) — sinon dossier
   non surveillé.

Contrôles de validation :
- [ ] Connexion `admin` (les 6 comptes, hash 3.6→4.0 compatible — **à confirmer**).
- [ ] Monitoring / historique présents (2 018 lignes).
- [ ] Ouverture d'un document Verifier stocké (résolution docservers → OK si §5 = 0).
- [ ] Référentiel fournisseurs chargé (14 508).
- [ ] Dépôt d'un PDF test dans le dossier d'entrée → capté par fs-watcher → worker.

---

## 7. Hors périmètre « OC core » (à planifier ensuite)

- **Connecteurs sortants** (18 outputs) : `export_mem`, `export_opencaptureformem`,
  `export_cmis` (Alfresco BlueXML), `export_openads`, `export_opencrm`,
  `export_verifier` (OpenGRU), `export_facturx`. Leurs URLs/credentials visaient
  l'hôte (`localhost`…) → **à réauditer** pour être joignables depuis le réseau
  Docker (résolution DNS conteneur, IP hôte, ports).
- **OCForMEM** (`/opt/edissyum/opencaptureformem`) : appli companion **séparée**.
  Décider migration vs maintien bare-metal ; les exports MEM en dépendent.
- **Alfresco** : idem, service externe à rendre joignable.
