# 01 — Migrer une install bare-metal vers Docker

Reprise d'une install OpenCapture **bare-metal** vers la stack **Docker** de ce dépôt,
via l'outil [`../../migrate.sh`](../../migrate.sh).

- **Partie 1 — Procédure générique** : réutilisable, à dérouler en remplaçant les
  paramètres en tête.
- **Partie 2 — Explications & exemple concret** : ce qui se passe sous le capot, plus
  une reprise réelle 3.6.2 → 4.0.0 (custom `edissyum`) commentée.
- **Le fonctionnement interne de `migrate.sh`** (bundle, sous-commandes, chaîne des
  chemins, robustesse, limites) : [`migrate-internals.md`](migrate-internals.md).

> **Modèle** : 1 custom bare-metal = 1 tenant Docker (1 stack + 1 base + ses volumes).
> Chaque custom se migre indépendamment. Répéter la procédure par custom, ou traiter
> tout le lot d'un coup (sans `--custom`).

---

# Partie 1 — Procédure générique

## Vue d'ensemble

```
  SOURCE (bare-metal, local ou SSH)                CIBLE (hôte Docker)
  ┌──────────────────────────┐                     ┌────────────────────────┐
  │ /var/www/html/opencapture │      bundle         │ opencapture_docker/    │
  │ PostgreSQL locale          │   (dossier          │ stub-tenants/<id>/     │
  │ /var/docservers /var/share │    portable)        │ ${OC_DATA_ROOT}/…/<id>/│
  └──────────────────────────┘  ───────────────▶    └────────────────────────┘
     1. export        2. diagnose         3. new-tenant + 4. import   5. post-migration
```

| Phase | Sous-commande | Où l'exécuter |
|---|---|---|
| 1 | `export`   | sur/depuis la **source** (local ou SSH) |
| 2 | `diagnose` | sur l'**hôte Docker** (lit le bundle) |
| 3 | `new-tenant.sh` | sur l'**hôte Docker** (crée le stub cible) |
| 4 | `import`   | sur l'**hôte Docker** |
| 5 | `reregister` + UI | sur l'**hôte Docker** puis dans l'UI du tenant |

---

## Prérequis (à lire avant de commencer)

1. **Migration À FROID.** Sur la source, arrêter tout traitement (workers, watcher,
   mailcollect) et vider les files **avant** l'export — sinon état fichier/base
   incohérent. Les noms de services varient selon l'install bare-metal ; couvrir
   les workers Verifier/Splitter, le watcher et le worker mail.
2. **Le stub tenant doit exister AVANT l'import** (étape 3). L'import ne crée pas le
   tenant : il **remplit** un tenant déjà créé, et lit `stub-tenants/<id>/.env`
   (`OC_DATA_ROOT`, `POSTGRES_*`, `OC_FQDN`).
3. **`OC_DATA_ROOT`** doit pointer le bon volume : l'import y dépose les fichiers.
   Vérifier qu'il vise un FS avec assez de place (docservers + base).
4. **Bundle sur un FS avec de la place** : ne pas viser `/tmp` s'il est sur une
   racine saturée ; préférer `/var/tmp` ou un disque dédié.
5. **Écart de version** attendu si la source est plus ancienne que l'image (ex.
   3.6.x → 4.0.0) : `diagnose` le signalera, l'import se fera avec `--force`
   (l'écart est comblé par la montée `4.0.0.sql` + `4.0.0+.sql`, cf. Partie 2 et
   [`migrate-internals.md`](migrate-internals.md) §6).

---

## Paramètres (à éditer)

```bash
cd ~/opencapture_docker

ID=<tenant>                            # id du custom = id du tenant (minuscules/chiffres/_)
MODE=http                             # http | le | cert  (mode d'exposition TLS)
SRC=local                             # 'local' OU user@host  (source bare-metal)
SRC_OCROOT=/var/www/html/opencapture  # racine OpenCapture sur la source
BUNDLE=/var/tmp/oc-bundle             # dossier bundle (FS avec de la place)

# Source DISTANTE avec auth par mot de passe : dé-commenter (sinon clé SSH par défaut).
# export MIGRATE_SSH="sshpass -p '<mdp>' ssh -o StrictHostKeyChecking=accept-new"

# Identifiants admin du tenant (pour ré-enregistrer les workflows via l'API à l'import).
# Facultatifs : sinon l'étape est sautée et rejouable via 'reregister' (phase 5).
# export OC_ADMIN_USER=<admin> OC_ADMIN_PASSWORD=<mdp>
```

---

## 1. Export (depuis la source)

```bash
# Un seul custom :
./migrate.sh export --source "$SRC" --oc-root "$SRC_OCROOT" --out "$BUNDLE" --custom "$ID"

# Ou TOUS les customs du custom.ini source (omettre --custom) :
./migrate.sh export --source "$SRC" --oc-root "$SRC_OCROOT" --out "$BUNDLE"
```

Produit `"$BUNDLE"/customs/<id>/` (dump SQL, tars custom/docservers/share, empreintes
pour `diagnose`, `meta.env`). Options : `--custom <id>` répétable ; `--no-share` pour
exclure `share/export/`.

---

## 2. Diagnose (sur l'hôte Docker)

```bash
./migrate.sh diagnose --bundle "$BUNDLE"          # ou --custom "$ID" pour cibler
```

Compare le schéma source au schéma cible. Un écart = probable différence de version
→ **bloquant à l'import sauf `--force`**. Un écart v3→v4 est **normal** (comblé par la
montée à l'import). Détail : [`migrate-internals.md`](migrate-internals.md) §5.

---

## 3. Créer le tenant cible (une fois par custom)

```bash
./new-tenant.sh "$MODE" "$ID"          # copie le gabarit + pré-remplit CUSTOM_ID, DB, OC_DATA_ROOT, APP_UID/GID
$EDITOR stub-tenants/$ID/.env          # renseigner À LA MAIN :
                                       #   OC_FQDN            (domaine du tenant)
                                       #   OC_DATA_ROOT       (vérifier le bon volume — cf. prérequis 3)
                                       #   POSTGRES_PASSWORD  (idéalement repris de la source)
                                       #   RABBITMQ_PASS
```

> Vérifier que `docker compose` résout bien le volume attendu (doit afficher le chemin
> voulu, pas un `../data` parasite) :
> ```bash
> docker compose --project-directory stub-tenants/$ID \
>   -f stub-tenants/$ID/docker-compose.yml config | grep -E "source:.*$ID"
> ```

Mode `cert` uniquement : déposer aussi le PEM + le fragment `tls.yml` côté Traefik
(cf. [`../00_GUIDE.md`](../00_GUIDE.md) §2 / [`../03-tenant-cert.md`](../03-tenant-cert.md)).

---

## 4. Import (sur l'hôte Docker)

```bash
# Import + déploiement complet. --force si diagnose a signalé un écart de version.
./migrate.sh import --bundle "$BUNDLE" --custom "$ID" --force
```

L'import : dépose les fichiers sous `${OC_DATA_ROOT}/tenants/<id>/`, réécrit les chemins
hôte → `/app`, restaure le dump, **monte la base à la version cible**, réconcilie le
squelette v4 manquant, puis lance `./deploy.sh <id>`. Détail : Partie 2 §B et
[`migrate-internals.md`](migrate-internals.md) §6.

**Variantes utiles :**

| Besoin | Option |
|---|---|
| Appliquer un top-up SQL manuel **avant** le déploiement | `--no-deploy` (lancer `./deploy.sh <id>` ensuite) |
| Ré-enregistrer les workflows automatiquement | `--admin-user <u> --admin-password <p>` (ou env `OC_ADMIN_*`) |
| Tout le lot en une passe | omettre `--custom` |

---

## 5. Post-migration

**a) Ré-enregistrer les workflows** (régénère les scripts `*_workflows/*.sh` + `watcher.ini`
aux chemins conteneur, puis redémarre le fs-watcher). Nécessaire : sinon le fs-watcher
ne traite pas les dépôts.

```bash
# Si non fait à l'import (pas de creds admin fournis) :
./migrate.sh reregister --custom "$ID" --admin-user <u> --admin-password <p>
```

À défaut d'API : dans l'UI, ouvrir puis **enregistrer** chaque workflow Verifier/Splitter
une fois, puis redémarrer le fs-watcher (`dc $ID restart fs-watcher`).

**b) Contrôles de validation :**

- [ ] Connexion (un mauvais mot de passe renvoie **401**, pas 500).
- [ ] Monitoring / historique présents.
- [ ] Ouverture d'un document stocké (résolution docservers OK).
- [ ] Référentiel fournisseurs chargé.
- [ ] Dépôt d'un PDF test dans `share/entrant/…` → capté par fs-watcher → worker.

**c) Hors périmètre « OC core »** (à planifier ensuite) : connecteurs sortants
(MEM / Alfresco / OpenADS / OpenCRM / Facturx) dont les URLs visaient l'hôte → à
réauditer pour être joignables depuis le réseau Docker. Voir l'exemple détaillé en
Partie 2 §D.

---

## Rollback

L'import ne touche **pas** la source (elle reste la référence tant qu'elle n'est pas
décommissionnée). Pour repartir de zéro sur un tenant :

```bash
docker compose --project-directory stub-tenants/$ID \
  -f stub-tenants/$ID/docker-compose.yml down          # JAMAIS -v en prod partagée
rm -rf "${OC_DATA_ROOT}/tenants/$ID"
```

puis reprendre à l'étape 3. Ne décommissionner la source **qu'après validation**.

---

## Pièges connus (résumé)

| Piège | Parade |
|---|---|
| Restauration postgres tuée (exit 137, OOM) | L'import relève `mem_limit` à chaud ; sinon `docker update --memory 1500m` + rejouer le restore |
| Mot de passe DB avec apostrophe | Le changer **avant** l'export (injecté en ligne de commande) |
| 500 partout après import (v3→v4) | Squelette v4 manquant — l'import le réconcilie (`reconcile_custom_files_v4`) ; sinon Partie 2 §C |
| fs-watcher ne traite rien | Workflows non ré-enregistrés — phase 5.a |
| Fichiers atterris dans le mauvais dossier | `OC_DATA_ROOT` du stub `.env` ≠ volume monté — prérequis 3 |

Détail complet : [`migrate-internals.md`](migrate-internals.md) §9 et §15.

---
---

# Partie 2 — Explications & exemple concret (3.6.2 → 4.0.0, custom `edissyum`)

Cette partie illustre la procédure par une **reprise réelle** (custom `edissyum`,
v3.6.2 bare-metal → tenant Docker v4.0.0, source locale sur la VM `serveur de test principal interne`) et
explique ce que fait l'import sous le capot. Périmètre : **OC core** — base +
docservers + custom + workflows + users + fournisseurs.

## A. Ce qui change entre les deux mondes

| | Source (v3.6.2) | Cible (v4.0.0) |
|---|---|---|
| Déploiement | bare-metal `/var/www/html/opencapture` | Docker, stack par tenant |
| Base | PostgreSQL locale `opencapture_<id>` | conteneur `postgres:17.6`, `opencapture_<id>` |
| Docservers | `/var/docservers/opencapture/<id>/` | volumes `.../tenants/<id>/docservers` |
| Custom | `custom/<id>/` | `.../tenants/<id>/custom/<id>` |
| Chemins | **absolus** (`/var/…`, `/var/www/html/…`) | tout sous **`/app`** |

Volumétrie observée sur `edissyum` (à titre indicatif) : docservers **816 Mo**,
accounts_supplier **14 508**, documents 62, splitter_batches 95, workflows 22,
form_models 20, outputs 18, history 2 018.

**Delta de schéma 3.6.2 → 4.0.0** (faible) :
- Nouveau en v4 : `documents.sha256`, `splitter_documents.md5/sha256`,
  `splitter_batches.sha256`+`original_filename`, `mailcollect.{ocr_attachments,
  verifier_customer_id, verifier_form_id}`, table `settings_favorites`.
- Disparu en v4 (bénin, reste en trop) : `custom_fields.enabled`, `roles.enabled`,
  `mailcollect.folder_trash`.

## B. Montée de schéma (automatique dans l'import)

`migrate.sh import` applique la **montée officielle** `postgres/sql/4.0.0.sql`
(form_models_field, outputs, doctypes, nettoyage, colonnes, scripting `src.backend`→`src`…),
puis le **résiduel Docker** `postgres/sql/4.0.0+.sql` (colonnes post-4.0.0
`mailcollect.verifier_*` + réécriture des chemins `documents.path`/`attachments`/docservers
→ `/app`, dont **REFERENTIALS_PATH** lu par v4). Rien à jouer à la main.

> `4.0.0.sql` n'est pas idempotent : l'import le joue **une fois** sur un import frais
> (il retire d'abord `settings_favorites`, table v4-only survivante au dump, sinon son
> `CREATE` échoue). Le « pourquoi » complet : [`migrate-internals.md`](migrate-internals.md) §6-§7.

## C. Écarts de FICHIERS custom v3→v4 (sinon HTTP 500 partout)

> **La version consolidée de `migrate.sh` fait ceci AUTOMATIQUEMENT**
> (`reconcile_custom_files_v4`) : copie le squelette v4 manquant depuis
> `backend/installer/*` + assets + référentiel + `__init__.py`, ajoute `debugmode`, et
> fusionne l'index référentiel. Les commandes ci-dessous ne servent qu'au **dépannage**
> d'un tenant migré avec une **ancienne** version de migrate.sh.

Cause racine : un custom migré a `config.ini` présent → le docker-bootstrap
**court-circuite** la copie du squelette v4. `create_classes_from_custom_id` tourne à
CHAQUE requête (via `get_locale`) : le moindre fichier/clé manquant → **500 sur tout**
(login compris). Réconciliation manuelle depuis un tenant NATIF v4 (`<ref>`) :

```bash
ED=${OC_DATA_ROOT}/tenants/<id>/custom/<id>
DE=${OC_DATA_ROOT}/tenants/<ref>/custom/<ref>     # tenant v4 natif de référence

# 1) config.ini : clé 4.0.0 'debugmode' absente en 3.6.2 (lue par main.py)
grep -qi '^debugmode' "$ED/config/config.ini" \
  || sed -i '/^allowwfscripting/a debugmode = False' "$ED/config/config.ini"

# 2) config/ : fichiers scaffolding 4.0.0 (en v3 ils étaient dans instance/config GLOBAL)
for f in OCR_ERRORS.xml extensions.json attachment_extensions.json; do
  [ -f "$ED/config/$f" ] || cp -a "$DE/config/$f" "$ED/config/$f"
done

# 3) référentiel fournisseurs : l'index JSON v3 manque 5 clés lues par Spreadsheet.py
python3 - "$ED/instance/referencial/default_referencial_supplier_index.json" <<'PY'
import json,sys,collections
p=sys.argv[1]; d=json.load(open(p,encoding='utf-8'),object_pairs_hook=collections.OrderedDict)
for k,v in {"lastname":"Nom","firstname":"Prénom","civility":"Civilité","function":"Fonction","informal_contact":"INFORMEL"}.items():
    d.setdefault(k,v)
json.dump(d,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=4)
PY
```
Puis redémarrer les conteneurs applicatifs (`restart backend worker-* fs-watcher`).
Vérifier : `POST /<id>/ws/auth/login` (mauvais mdp) renvoie **401** (et non 500).
Le « pourquoi » : [`migrate-internals.md`](migrate-internals.md) §8.

## D. Le piège vécu : `OC_DATA_ROOT` sur le bon volume

Sur `serveur de test principal interne`, les conteneurs *tournaient* sur `/var/edissyum/opencapture` mais les
stubs `.env` avaient **dérivé sur `/opt`** (plein à 91 %). `migrate.sh import` dépose
les fichiers selon `OC_DATA_ROOT` **lu dans le stub `.env`** : un mauvais réglage → les
fichiers atterrissent dans `/opt` pendant que le conteneur monte `/var` → **tenant vide
+ racine saturée**. D'où le contrôle `docker compose … config | grep source` de
l'étape 3, à faire **avant** l'import (prérequis 3).

## E. Hors périmètre « OC core » (à planifier ensuite)

- **Connecteurs sortants** (outputs) : `export_mem`, `export_opencaptureformem`,
  `export_cmis` (Alfresco), `export_openads`, `export_opencrm`, `export_verifier`
  (OpenGRU), `export_facturx`. Leurs URLs/credentials visaient l'hôte (`localhost`…)
  → **à réauditer** pour être joignables depuis le réseau Docker (DNS conteneur, IP
  hôte, ports).
- **OCForMEM** (`/opt/edissyum/opencaptureformem`) : appli companion **séparée** ;
  décider migration vs maintien bare-metal (les exports MEM en dépendent).
- **Alfresco / services externes** : à rendre joignables depuis les conteneurs.
