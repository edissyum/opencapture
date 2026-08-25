# 01 — Migrer une installation existante vers Docker

Reprise d'une installation OpenCapture existante (hors conteneur, sur serveur physique
ou VM) vers la stack **Docker** de ce dépôt, via l'outil
[`../../../migrate.sh`](../../../migrate.sh).

- **Partie 1 — Procédure générique** : réutilisable, à dérouler en remplaçant les
  paramètres en tête.
- **Partie 2 — Explications & exemple concret** : ce qui se passe sous le capot, plus
  une reprise réelle 3.6.2 → 4.0.0 (custom `edissyum`) commentée.
- **Annexes** : fonctionnement interne de `migrate.sh` (bundle, sous-commandes, chaîne
  des chemins, robustesse, limites) + catalogue des pièges déjà rencontrés.

> **Modèle** : 1 custom source = 1 tenant Docker (1 stack + 1 base + ses volumes).
> Chaque custom se migre indépendamment. Répéter la procédure par custom, ou traiter
> tout le lot d'un coup (sans `--custom`).

---

# Partie 1 — Procédure générique

## Vue d'ensemble

```
  SOURCE (installation existante, locale ou SSH)   CIBLE (hôte Docker)
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
   incohérent. Les noms de services varient selon l'installation source ; couvrir
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
   Annexes §6).
6. **Prérequis outillage sur l'hôte Docker** : `sshpass` (source distante par mot de
   passe) et `python3` (`reconcile_custom_files_v4` l'appelle directement sur l'hôte,
   voir Annexes §8) — cf. [`../01-install-general.md`](../01-install-general.md).

---

## Paramètres (à éditer)

```bash
cd ~/opencapture_docker

SRC_ID=<custom>                       # id du custom SUR LA SOURCE (minuscules/chiffres/_)
DEST_ID=<tenant>                      # id du tenant Docker CIBLE — égal à SRC_ID sauf renommage
                                       # (cf. section dédiée) ; ne jamais utiliser une variable
                                       # nommée juste "ID" pour ces deux id, ambigu dès qu'on
                                       # renomme.
MODE=http                             # http | le | cert  (mode d'exposition TLS)
SRC=local                             # 'local' OU user@host  (source)
SRC_OCROOT=/var/www/html/opencapture  # racine OpenCapture sur la source
BUNDLE=/var/tmp/oc-bundle             # dossier bundle (FS avec de la place)

# Source DISTANTE avec auth par mot de passe : dé-commenter (sinon clé SSH par défaut).
# Variable NON persistante : à exporter dans le MÊME shell que les commandes qui suivent.
# export MIGRATE_SSH="sshpass -p '<mdp>' ssh -o StrictHostKeyChecking=accept-new"
# ⚠️ pas d'apostrophes DANS le mot de passe lui-même (cf. Annexes, catalogue de pièges,
#    piège 2) — migrate.sh ne fait pas de suppression de guillemets sur cette variable.

# Identifiants admin du tenant (pour ré-enregistrer les workflows via l'API à l'import).
# Facultatifs : sinon l'étape est sautée et rejouable via 'reregister' (phase 5).
# export OC_ADMIN_USER=<admin> OC_ADMIN_PASSWORD=<mdp>
```

---

## 1. Export (depuis la source)

```bash
# Un seul custom :
./migrate.sh export --source "$SRC" --oc-root "$SRC_OCROOT" --out "$BUNDLE" --custom "$SRC_ID"

# Ou TOUS les customs du custom.ini source (omettre --custom) :
./migrate.sh export --source "$SRC" --oc-root "$SRC_OCROOT" --out "$BUNDLE"
```

Produit `"$BUNDLE"/customs/<id>/` (dump SQL, tars custom/docservers/share, empreintes
pour `diagnose`, `meta.env`). Options : `--custom <id>` répétable ; `--no-share` pour
exclure `share/export/`.

> Si l'export échoue avec un message trompeur (`custom.ini introuvable` alors que la
> source est bien là) sur une source distante : vérifier d'abord que la connexion SSH
> elle-même passe (`MIGRATE_SSH`, cf. Annexes, catalogue de pièges, piège 1) — l'échec
> SSH est parfois avalé et masque la vraie cause.

### Renommer un custom pendant la migration (optionnel)

Pour que le tenant cible porte un `<id>` **différent** du custom source (ex. changer
l'URL affichée, cas réel : `edissyum` → `opencapture` sur un serveur OC v3, pour que le
segment d'URL soit `/opencapture/`), renommer le dossier du bundle **avant**
`diagnose`/`import` :

```bash
mv "$BUNDLE/customs/$SRC_ID" "$BUNDLE/customs/$DEST_ID"
```

`import` détermine l'id CIBLE à partir du **nom du dossier bundle**, pas de l'id source
(conservé dans `meta.env`, écrit à l'export). Quand les deux diffèrent, `import` :
- corrige **automatiquement** les valeurs `docservers.path` de type « chemin absolu
  sous l'ancien id » (ex. `REFERENTIALS_PATH` = `/app/custom/<id_source>/...`) que la
  réécriture générique des chemins (§7 des Annexes) ne couvre pas — elle ne connaît que
  l'id CIBLE ;
- **liste sans corriger** (`grep -rl` dans les fichiers du custom déposé) toute autre
  occurrence textuelle de l'ancien id restée dans les scripts/config — peut être une
  vraie donnée (ex. un DN LDAP) et pas un chemin, donc pas réécrite en aveugle : à
  vérifier à la main si le message apparaît.

Le stub tenant (`new-tenant.sh`) doit bien sûr être créé avec l'id CIBLE (`$DEST_ID`),
pas l'id source. Voir aussi Annexes, catalogue de pièges, piège 6 (le bug historique
que cette détection corrige).

---

## 2. Diagnose (sur l'hôte Docker)

```bash
./migrate.sh diagnose --bundle "$BUNDLE"          # ou --custom "$DEST_ID" pour cibler
```

Compare le schéma source au schéma cible. Un écart = probable différence de version
→ **bloquant à l'import sauf `--force`**. Un écart de version antérieure → 4.0.0 est
**normal** (comblé par la montée à l'import). Détail : Annexes §5.

---

## 3. Créer le tenant cible (une fois par custom)

```bash
./new-tenant.sh "$MODE" "$DEST_ID"     # copie le gabarit + pré-remplit CUSTOM_ID, DB, OC_DATA_ROOT, APP_UID/GID
$EDITOR stub-tenants/$DEST_ID/.env     # renseigner À LA MAIN :
                                       #   OC_FQDN            (domaine du tenant)
                                       #   OC_DATA_ROOT       (vérifier le bon volume — cf. prérequis 3)
                                       #   POSTGRES_PASSWORD  (idéalement repris de la source)
                                       #   RABBITMQ_PASS
```

> ⚠️ Vérifier que ces champs ne sont PAS restés aux valeurs `changeme` du gabarit —
> `OC_FQDN=changeme.example.com` casse le routage Traefik (404, aucun router ne
> matche). Changer `POSTGRES_PASSWORD` **après coup** ne suffit pas : il faut aussi
> `ALTER USER` en base (déjà initialisée au 1er démarrage postgres).

> Vérifier que `docker compose` résout bien le volume attendu (doit afficher le chemin
> voulu ; si `OC_DATA_ROOT` manque, la commande échoue au lieu de résoudre un chemin parasite) :
> ```bash
> docker compose --project-directory stub-tenants/$DEST_ID \
>   -f stub-tenants/$DEST_ID/docker-compose.yml config | grep -E "source:.*$DEST_ID"
> ```

Mode `cert` uniquement : déposer aussi le PEM + le fragment `tls.yml` côté Traefik
(cf. [`../00_GUIDE.md`](../00_GUIDE.md) §2 / [`../03-tenant-cert.md`](../03-tenant-cert.md)).

---

## 4. Import (sur l'hôte Docker)

```bash
# Import + déploiement complet. --force si diagnose a signalé un écart de version.
./migrate.sh import --bundle "$BUNDLE" --custom "$DEST_ID" --force
```

L'import : dépose les fichiers sous `${OC_DATA_ROOT}/tenants/<id>/`, réécrit les chemins
hôte → `/app`, restaure le dump, **monte la base à la version cible**, réconcilie le
squelette v4 manquant, puis lance `./deploy.sh <id>`. Détail : Partie 2 §B et
Annexes §6.

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
./migrate.sh reregister --custom "$DEST_ID" --admin-user <u> --admin-password <p>
```

À défaut d'API : dans l'UI, ouvrir puis **enregistrer** chaque workflow Verifier/Splitter
une fois, puis redémarrer le fs-watcher (`dc $DEST_ID restart fs-watcher`).

**b) Contrôles de validation :**

- [ ] Connexion (un mauvais mot de passe renvoie **401**, pas 500).
- [ ] Monitoring / historique présents.
- [ ] Ouverture d'un document stocké (résolution docservers OK).
- [ ] Référentiel fournisseurs chargé.
- [ ] Formulaires Splitter/Verifier : ouverture sans crash, zones de métadonnées non
      vides (cf. Partie 2 §B — reshape `form_models_field`).
- [ ] Dépôt d'un PDF test dans `share/entrant/…` → capté par fs-watcher → worker.

**c) Hors périmètre « OC core »** (à planifier ensuite) : connecteurs sortants
(MEM / Alfresco / OpenADS / OpenCRM / Facturx) dont les URLs visaient l'hôte (ex.
`http://localhost/...`, valide quand tout tournait sur la même machine) → à réauditer
pour être joignables depuis le réseau Docker. Solution retenue pour MEM Courrier
(`extra_hosts: host.docker.internal:host-gateway`) et ses limites :
[`apache-hostgateway-serveur-test.md`](apache-hostgateway-serveur-test.md).

---

## Rollback

L'import ne touche **pas** la source (elle reste la référence tant qu'elle n'est pas
décommissionnée). Pour repartir de zéro sur un tenant :

```bash
docker compose --project-directory stub-tenants/$DEST_ID \
  -f stub-tenants/$DEST_ID/docker-compose.yml down     # JAMAIS -v en prod partagée
rm -rf "${OC_DATA_ROOT}/tenants/$DEST_ID"
```

puis reprendre à l'étape 3. Ne décommissionner la source **qu'après validation**.

---

## Pièges connus (résumé)

| Piège | Parade |
|---|---|
| Restauration postgres tuée (exit 137, OOM) | L'import relève `mem_limit` à chaud ; sinon `docker update --memory 1500m` + rejouer le restore |
| `pgdata` mal owné → postgres en boucle `FATAL` | `align_pgdata_owner()` (automatique) — sinon vérifier l'UID postgres réel de l'image, pas une valeur codée en dur |
| Backend crash-loop `getpass.getuser() OSError` | `APP_UID` du tenant ≠ celui bâti dans l'image (`groupmod`/`usermod` au lieu d'un 2e `useradd`, corrigé dans l'entrypoint) |
| Mot de passe DB avec apostrophe | Le changer **avant** l'export (injecté en ligne de commande) |
| 500 partout après import | Squelette v4 manquant — l'import le réconcilie (`reconcile_custom_files_v4`) ; sinon Partie 2 §C |
| fs-watcher ne traite rien | Workflows non ré-enregistrés — phase 5.a |
| Fichiers atterris dans le mauvais dossier | `OC_DATA_ROOT` du stub `.env` ≠ volume monté — prérequis 3 |

Détail complet : Annexes §9, §11 (catalogue) et §15.

---
---

# Partie 2 — Explications & exemple concret (3.6.2 → 4.0.0, custom `edissyum`)

Cette partie illustre la procédure par une **reprise réelle** (custom `edissyum`,
v3.6.2 → tenant Docker v4.0.0, source locale sur un serveur OC v3) et explique ce que
fait l'import sous le capot. Périmètre : **OC core** — base + docservers + custom +
workflows + users + fournisseurs.

## A. Ce qui change entre les deux mondes

| | Source (v3.6.2) | Cible (v4.0.0) |
|---|---|---|
| Déploiement | serveur physique, `/var/www/html/opencapture` | Docker, stack par tenant |
| Base | PostgreSQL locale `opencapture_<id>` | conteneur `postgres:17.6`, `opencapture_<id>` |
| Docservers | `/var/docservers/opencapture/<id>/` | volumes `.../tenants/<id>/docservers` |
| Custom | `custom/<id>/` | `.../tenants/<id>/custom/<id>` |
| Chemins | **absolus** (`/var/…`, `/var/www/html/…`) | tout sous **`/app`** |

Volumétrie observée sur `edissyum` (à titre indicatif) : docservers **816 Mo**,
accounts_supplier **14 508**, documents 62, splitter_batches 95, workflows 22,
form_models 20, outputs 18, history 2 018.

**Delta de schéma 3.6.2 → 4.0.0** (faible) :
- Nouveau en v4, ajouté par la montée : `documents.sha256`, `splitter_documents.md5/sha256`,
  `splitter_batches.sha256`+`original_filename`, `mailcollect.ocr_attachments`, table
  `settings_favorites`.
- Présent dans `structure.sql` (schéma d'une installation neuve) mais **non backfillé**
  pour un tenant migré : `mailcollect.verifier_customer_id`/`verifier_form_id`. Colonnes
  mortes — confirmé sans aucun usage dans le code v4 (backend, frontend) ni dans une
  base source réelle vérifiée. Un tenant migré n'aura donc **pas** ces 2 colonnes,
  contrairement à un tenant fraîchement installé — sans conséquence fonctionnelle
  connue, mais une divergence de schéma à garder en tête.
- Disparu en v4 (bénin, reste en trop) : `custom_fields.enabled`, `roles.enabled`,
  `mailcollect.folder_trash`.

## B. Montée de schéma (automatique dans l'import)

`migrate.sh import` applique la **montée officielle** `postgres/sql/4.0.0.sql`
(`form_models_field`, outputs, doctypes, nettoyage, colonnes, scripting `src.backend`→`src`…),
puis le **résiduel Docker** `postgres/sql/4.0.0+.sql` (réécriture des chemins
`docservers`/`documents.path`/`attachments`/`workflows`/`outputs` → `/app`, dont
**REFERENTIALS_PATH** lu par v4, + garantie de la ligne `SPLITTER_SHARE` si absente).
Rien à jouer à la main.

> `4.0.0.sql` n'est pas idempotent : l'import le joue **une fois** sur un import frais
> (il retire d'abord `settings_favorites`, table v4-only survivante au dump, sinon son
> `CREATE` échoue). Le « pourquoi » complet : Annexes §6-§7.

> Entre v3 et v4, les champs de `form_models_field` (Splitter et Verifier) doivent être
> **reshapés** : la v3 les stocke à plat, la v4 attend des lignes. `4.0.0.sql`
> (§ « Modification de la structure des champs dans `form_models_field` ») s'en charge
> **entièrement**, pour les deux modules, de façon générique (toutes les sections de
> `fields`, regroupement par largeur réelle des champs). Rien à faire en plus dans
> `4.0.0+.sql` ni à la main.

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
Le « pourquoi » : Annexes §8.

## D. Le piège vécu : `OC_DATA_ROOT` sur le bon volume

Sur l'hôte Docker cible, les conteneurs *tournaient* sur `/var/edissyum/opencapture` mais les
stubs `.env` avaient **dérivé sur `/opt`** (plein à 91 %). `migrate.sh import` dépose
les fichiers selon `OC_DATA_ROOT` **lu dans le stub `.env`** : un mauvais réglage → les
fichiers atterrissent dans `/opt` pendant que le conteneur monte `/var` → **tenant vide
+ racine saturée**. D'où le contrôle `docker compose … config | grep source` de
l'étape 3, à faire **avant** l'import (prérequis 3).

## E. Hors périmètre « OC core » (à planifier ensuite)

- **Connecteurs sortants** (outputs) : `export_mem`, `export_opencaptureformem`,
  `export_cmis` (Alfresco), `export_openads`, `export_opencrm`, `export_verifier`
  (OpenGRU), `export_facturx`. Leurs URLs/credentials visaient l'hôte (`localhost`…,
  valide quand tout tournait sur la même machine) → **à réauditer** pour être
  joignables depuis le réseau Docker. Cas traité en détail (MEM Courrier, trick
  `host-gateway`, points de vigilance) : [`apache-hostgateway-serveur-test.md`](apache-hostgateway-serveur-test.md).
- **OCForMEM** (`/opt/edissyum/opencaptureformem`) : appli companion **séparée** ;
  décider migration vs maintien hors conteneur (les exports MEM en dépendent).
- **Alfresco / services externes** : à rendre joignables depuis les conteneurs.

---
---

# Annexes — fonctionnement interne de `migrate.sh`

## 1. Modèle & principe

- **1 custom source = 1 tenant Docker** (1 stack + 1 base + ses volumes).
- Reprise en **3 phases + 1**, découplées par un **bundle portable** :

```
   SOURCE (installation existante, locale ou SSH)   CIBLE (hôte Docker)
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

## 2. Les 4 sous-commandes

| Commande | Rôle | Où ça tourne |
|---|---|---|
| `export`   | Lit la SOURCE, produit un bundle par custom | sur la source (local ou via SSH) |
| `diagnose` | Compare le schéma source au schéma cible (`structure.sql`) | local (lit le bundle) |
| `import`   | Dépose, restaure, **monte en 4.0.0**, réécrit les chemins, déploie | sur l'hôte Docker |
| `reregister` | Ré-enregistre les workflows via l'API (régénère scripts + `watcher.ini`) | sur l'hôte Docker |

Aide intégrée : `./migrate.sh --help`.

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

## 4. `export` — comment il lit la source

1. Énumère les customs depuis `custom/custom.ini` (une section = un custom).
2. Pour chaque custom, lit sa `config/config.ini` → **identifiants PostgreSQL**.
3. Interroge la **base source** pour connaître les chemins réels (autorité) :
   - `docservers_src` ← `SELECT path FROM docservers WHERE docserver_id='DOCSERVERS_PATH'`
   - `share_src` ← `… docserver_id='INPUTS_ALLOWED_PATH'`
4. `pg_dump` + `tar` des dossiers + écrit `meta.env`.

Source **distante** : `--source user@host` + `MIGRATE_SSH` (ex. `sshpass -p … ssh …`).
Toutes les lectures passent par `src_run` (bash local OU ssh).

## 5. `diagnose` — détection d'écart de version

Compare deux empreintes :
- **cible** : colonnes extraites de `postgres/sql/structure.sql` (schéma 4.0.0).
- **source** : `schema.cols.txt` du bundle.

Un écart `table:colonne` = probable différence de version → **bloquant à l'import**
sauf `--force`. Comme une reprise d'une version antérieure a par nature un écart,
l'import se fait avec `--force` (l'écart est comblé par la montée 4.0.0, voir §6).

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
      psql -f postgres/sql/4.0.0.sql     (montée OFFICIELLE, reshape form_models_field inclus)
      psql -f postgres/sql/4.0.0+.sql    (résiduel Docker, paramétré, voir §7)
 8. deploy.sh <id>                       (build image + up -d le tenant)
 9. (si creds admin) reregister          (régénère scripts + watcher.ini, voir §10)
```

### Pourquoi cet enchaînement DB (étape 7)
- Le dump ramène le schéma de la version source ; `4.0.0.sql` est le script
  **officiel** de montée (migre `form_models_field`, `outputs`, `doctypes`, nettoie les
  obsolètes, ajoute colonnes/table, corrige le scripting `src.backend`→`src`…).
- `4.0.0.sql` **n'est pas idempotent** → il est joué **une seule fois** sur un import
  frais. `settings_favorites` (table 4.0.0-only) survit au `--clean` du dump →
  on la **supprime avant** sinon son `CREATE TABLE` échoue.
- `4.0.0+.sql` complète ce que `4.0.0.sql` ne couvre **pas** : uniquement
  l'**adaptation des chemins vers `/app`** (Docker) — `4.0.0.sql` se contente de les
  rendre relatifs `./` — et la garantie de la ligne `SPLITTER_SHARE`. Le reshape de
  `form_models_field` (v3 plat → v4 en lignes) est entièrement pris en charge par
  `4.0.0.sql` (voir Partie 2 §B) ; rien à y ajouter ici.

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

**Pourquoi ces réécritures** : sur une installation existante les chemins sont ABSOLUS
(`/var/docservers/…`, `/var/share/…`, `/var/www/html/opencapture/…`) ; en conteneur
tout est sous `/app`. Le Verifier stocke `documents.path`/`attachments` en absolu
(le Splitter en relatif) → il faut les réécrire, sinon « fichier introuvable ».
`REFERENTIALS_PATH` (référentiel fournisseurs) est lu par v4 → réécriture indispensable.

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

Nécessite `python3` sur l'hôte Docker (appelé directement, pas dans un conteneur) —
absent, ces étapes sont sautées **en silence** (cf. catalogue de pièges, piège 3).

## 9. Points de robustesse

- **Anti-OOM restauration** : le conteneur postgres a une `mem_limit` basse
  (`x-res-postgres`, ~512m sans swap). La restauration sous charge peut être **tuée**
  (exit 137). L'import **relève la limite à chaud** (`docker update`) le temps du restore.
- **Alignement des droits `pgdata`** : `align_pgdata_owner()` lit l'UID/GID réel de
  l'utilisateur `postgres` **dans l'image** (via un conteneur jetable), plutôt que de
  coder en dur une valeur — un `pgdata` déjà peuplé sous un autre UID (import
  interrompu, `sudo` incohérent entre deux runs) ferait sinon boucler postgres en
  `FATAL: Permission denied` (cf. catalogue de pièges, piège 4).
- **Pièces jointes PARTAGÉES** : `VERIFIER/SPLITTER_ATTACHMENTS` vivent à la RACINE des
  docservers (siblings du sous-dossier custom) → **hors** `docservers.tar.gz`. L'export
  les capture à part (`att-*.tar.gz`), l'import les dépose dans le layout conteneur.
- **Source distante** : tout passe par `src_run` (bash local OU `MIGRATE_SSH`).

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

## 11. Catalogue de pièges rencontrés (migrations réelles, 2026-07-08 → 2026-07-21)

Bugs distincts déjà rencontrés puis corrigés dans `migrate.sh`/`infra/docker-entrypoint.sh`/
`postgres/sql/`. À vérifier PROACTIVEMENT avant de rejouer une migration sur un
environnement neuf plutôt que de les redécouvrir un par un.

1. **SSH silencieux** : `migrate.sh export` échoue avec un message trompeur
   (« custom.ini introuvable ») alors que le vrai problème est un échec SSH
   (`BatchMode=yes` refuse l'auth par mot de passe, `Host key verification failed` sur
   machine neuve) — l'erreur SSH est avalée par `2>/dev/null`. **Parade** : poser
   `MIGRATE_SSH="sshpass -p <motdepasse> ssh -o StrictHostKeyChecking=accept-new"`
   AVANT `export`, dans le MÊME shell (variable non persistante).
2. **Piège de quoting `MIGRATE_SSH`** : `sshpass -p 'motdepasse'` (avec apostrophes)
   échoue — `migrate.sh` utilise `$SSH_CMD` NON quoté (word-splitting voulu), qui ne
   supprime pas les guillemets d'une variable déjà développée → sshpass reçoit
   littéralement les apostrophes comme partie du mot de passe. **Ne jamais mettre
   d'apostrophes** dans `MIGRATE_SSH` si le mot de passe n'a pas d'espace.
3. **`sshpass`/`python3` absents** sur une install fraîche de l'hôte Docker → à inclure
   dans l'installation générale ([`../01-install-general.md`](../01-install-general.md)).
   `python3` est nécessaire car `reconcile_custom_files_v4` (§8) l'appelle DIRECTEMENT
   sur l'hôte (pas dans un conteneur) pour patcher `metadata_methods.json`/fusionner le
   référentiel — absent, ces étapes sont sautées **en silence** (symptôme : zones
   métadonnées vides + crash).
4. **`pgdata` mal owné → postgres `FATAL` en boucle** : un `pgdata` déjà peuplé (import
   interrompu, `sudo` incohérent entre deux runs) reste à l'UID de l'utilisateur host au
   lieu de l'UID postgres du conteneur (variable selon l'image, ne PAS coder en dur) →
   `could not open file "global/pg_filenode.map": Permission denied` en boucle.
   **Fixé** : `align_pgdata_owner()` (§9).
5. **Backend crash-loop `getpass.getuser()` OSError** : l'image backend est BAKÉE avec
   un `APP_UID`/`APP_GID` (ex. 1001, aligné sur l'UID hôte au build) différent de celui
   du tenant (`.env` du stub, ex. 1000). Le fallback runtime de l'entrypoint (créer une
   entrée passwd pour l'UID cible) faisait `groupadd`/`useradd` sous `${APP_USER}` —
   nom DÉJÀ pris par le groupe/user bâti à l'UID de build → échec silencieux
   (`already exists`) → aucune entrée passwd pour l'UID cible → `getpass.getuser()`
   (appelé par torch au chargement) lève `OSError` → gunicorn ne démarre jamais → page
   blanche. **Fixé** : `infra/docker-entrypoint.sh` fait `groupmod`/`usermod` si le nom
   existe déjà, au lieu de tenter un second `groupadd`/`useradd`.
6. **Résidu de renommage de custom (`docservers.path`)** : renommer le dossier du
   bundle (`customs/<id_source>` → `customs/<id_cible>`) ne réécrit PAS les valeurs
   `docservers.path` « PROJECT_PATH absolues » stockées sous l'ANCIEN nom (ex.
   `REFERENTIALS_PATH` = `/app/custom/<id_source>/instance/referencial/`) —
   `patch_db_paths` ne connaît que le CID CIBLE. Symptôme : 500 partout,
   `Spreadsheet.__init__` → `FileNotFoundError` sur le référentiel fournisseurs.
   **Fixé** : `migrate.sh` compare `CUSTOM_ID` de `meta.env` (id source, écrit à
   l'export) au nom du dossier bundle (id cible) et corrige automatiquement.
   - **Piège du fix lui-même** : la 1ʳᵉ version utilisait
     `psql -c "UPDATE ... :'old' ..." -v old=...` — **`psql -c` n'interpole PAS les
     `:'var'`** (contrairement à `-f` ou au stdin/heredoc) → erreur de syntaxe SQL
     avalée par `2>/dev/null`, correctif silencieusement inopérant. **Leçon générale :
     toute nouvelle invocation `psql` dans ce script doit passer les variables `-v` par
     `-f`/stdin, jamais par `-c`.**
7. **Race chown au démarrage du service `init`** : le `chown -R` de l'entrypoint (gated
   par une sentinelle, censé tourner une seule fois) ne s'était pas propagé à tout
   l'arbre `custom/<cid>/` avant que `docker-bootstrap.sh` n'essaie d'écrire dans son
   log (`touch: Permission denied`), alors qu'un `chown -R` manuel identique fonctionne
   instantanément. Cause exacte non élucidée. **Contournement** : `chown -R` manuel du
   host puis nouveau `up -d`. **Piste non explorée** : remplacer la sentinelle fichier
   par un verrou (`flock`) si ça se reproduit.
8. **`.env` du stub resté aux valeurs `changeme`** après `new-tenant.sh` :
   `OC_FQDN=changeme.example.com` casse le routage Traefik (404, aucun router ne
   matche) ; `POSTGRES_PASSWORD`/`RABBITMQ_PASS=changeme` non bloquants tant que c'est
   cohérent en interne, mais à changer — ⚠️ changer `POSTGRES_PASSWORD` après coup
   nécessite aussi un `ALTER USER` en base (déjà appliqué au 1ᵉʳ démarrage postgres, un
   simple edit `.env` ne suffit pas rétroactivement).
9. Build frontend `npm ci` en `ECONNRESET`/« network aborted » — transitoire, résolu
   par un simple retry (pas un bug du repo).
10. **`SPLITTER_SHARE` absent d'une base source réelle** : le code (`scripting_functions
    .launch_script_splitter`) et le seed `data_fr.sql` s'attendent à trouver une ligne
    `docservers.docserver_id='SPLITTER_SHARE'` — mais une base source vérifiée en
    conditions réelles ne l'avait PAS (dérive ancienne, jamais rattrapée), alors qu'elle
    avait bien `VERIFIER_SHARE`. Sans backfill, un workflow Splitter utilisant le
    scripting custom lève un `KeyError`. **Ne pas supposer** qu'une ligne de seed est
    forcément présente en base sous prétexte qu'elle l'est dans le code source de la
    version : `4.0.0+.sql` la garantit désormais via un `INSERT ... WHERE NOT EXISTS`
    idempotent (voir Partie 2 §B).

## 12. Fichiers liés

| Fichier | Rôle |
|---|---|
| `postgres/sql/structure.sql` | schéma cible 4.0.0 (référence de `diagnose`) |
| `postgres/sql/4.0.0.sql` | montée OFFICIELLE vers 4.0.0 (jouée par l'import), reshape `form_models_field` inclus |
| `postgres/sql/4.0.0+.sql` | résiduel Docker : chemins → `/app` + garantie `SPLITTER_SHARE` — rien d'autre (cf. piège 10) |
| `deploy.sh` | build image + `up -d` du tenant (appelé par l'import) |
| `infra/docker-bootstrap.sh` | self-heal au démarrage du conteneur (config.ini, custom.ini) |
| `new-tenant.sh` | crée le stub d'un tenant (prérequis de l'import) |

## 13. Non migré (volontaire)

- **RabbitMQ** : files transitoires (jobs en attente) — rien à reprendre puisque la
  migration se fait à froid, tout est censé être vidé avant l'export.
- **`share/entrant/`** : dossier de dépôt surveillé par le fs-watcher — doit être vide à
  froid ; s'il ne l'est pas, le gel des traitements sur la source n'a pas été fait.
- **`custom.ini`** : sur la source, liste TOUS les customs de la machine avec des chemins
  propres à cette machine — pas repris. Le bootstrap Docker en régénère un nouveau,
  scopé au seul tenant créé.

## 14. Limites connues

- **Mot de passe DB avec apostrophe** : injecté en ligne de commande (`PGPASSWORD='…'`)
  → un `'` casse la commande, le changer avant l'export.
- **Chemins relatifs** (`./…` en base/`config.ini`) : le conteneur tourne en WORKDIR
  `/app` → ils se transposent tels quels ; seuls les chemins **absolus** sont réécrits
  (cf. §7 et `4.0.0+.sql`).
- **Source sur une version OC très ANCIENNE** : à l'import, certains fichiers
  « squelette » connus (`process_queue_*.py`, templates de workers — §6) sont
  **remplacés** par leur version v4 du dépôt, plutôt que patchés en place — évite de
  faire cohabiter du code de glue trop daté avec le reste. Mais ce remplacement ne
  couvre QUE ces fichiers connus : si le custom source contient des modules maison
  très personnalisés (scripting, connecteurs) écrits pour une version bien antérieure à
  3.6.x, ceux-là ne sont pas concernés et peuvent nécessiter une adaptation manuelle
  après migration.
- **UID/GID** : `docker-entrypoint.sh` `chown` les mounts au 1er boot — long sur un gros
  docservers (patienter au démarrage initial).
