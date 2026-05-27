# `create_custom.sh` (bare-metal) vs `docker-bootstrap.sh` (Docker)

## Contexte

OpenCapture provisionne un tenant via deux scripts selon l'environnement :

- **`create_custom.sh`** (racine du repo) — l'outil officiel Edissyum pour une installation bare-metal : multi-user, exécuté à la main par un opérateur, chemins système (`/var/share`, `/var/docservers`), user `www-data`.
- **`infra/docker-bootstrap.sh`** — la transposition Docker : exécutée dans un conteneur single-user au démarrage du service `init`, chemins `/app/...`, idempotente (rejouée à chaque `docker compose up`).

Ce document compare les deux, puis détaille les faiblesses de la version bare-metal que la version Docker corrige.

---

## Comparaison fonctionnelle

| Étape | `create_custom.sh` (host) | `docker-bootstrap.sh` (container) | Verdict |
|---|---|---|---|
| Entrée des paramètres | `getopt` (`--custom_id`, `--database_*`, `--dns`, …) | variables d'env (`CUSTOM_ID`, `POSTGRES_*`, `OC_FQDN`) | équivalent, mieux adapté à Docker |
| Validation custom_id | normalisation `.-` → `_` + reject `custom` | reject non-alphanum + reject `custom` | équivalent |
| Arbo tenant | `mkdir -p` linéaire | `mkdir -p` groupé idempotent | équivalent |
| Arbo docservers | 8 sous-dossiers (verifier + splitter + ai) | mêmes 8 sous-dossiers | équivalent |
| Arbo share | `{entrant,export}/{verifier,splitter}` + ocr/default | identique | équivalent |
| `custom.ini` | `crudini` + section + path + url | section + path + url via heredoc / sed | équivalent, sans dépendance crudini |
| `secret_key` | `python3 -c secrets.token_hex(32)` | identique, avec guard `[ ! -s ]` | équivalent |
| Copie installer/ | `cp -r installer/*` | `cp -rn installer/.` (no-clobber) | équivalent |
| Substitution `§§…§§` | `find … sed -i` | `find … xargs sed -i` (5 placeholders) | équivalent |
| `[DATABASE]` dans config.ini | `crudini --set` | `configparser` Python + heredoc | équivalent, sans dépendance |
| Chargement schéma SQL | `psql -c "\i structure/global/data_fr.sql"` | délégué au conteneur postgres (`/docker-entrypoint-initdb.d/`) | différent par design (voir plus bas) |
| Patch chemins DB | `UPDATE docservers/workflows/outputs` | mêmes `UPDATE`, dans un heredoc transactionnel | équivalent (atomicité en plus) |
| Permissions | `chown www-data` + `chmod 775` | absent (single user container) | inutile en container |
| Idempotence | non (fail si re-run) | oui (self-heal + short-circuit) | avantage Docker |

### Sur la délégation du schéma SQL

La version bare-metal charge elle-même les 3 fichiers SQL via `psql -c "\i …"`. La version Docker délègue au conteneur `postgres` officiel, qui les charge au premier démarrage via `/docker-entrypoint-initdb.d/` (montés en bind dans `infra/docker-compose.yml`). Avantages :

- pas de `psql` requis dans le conteneur backend pour le schéma
- ordre garanti par les préfixes `01_/02_/03_`
- chargement atomique : si `pgdata` est vide → schéma chargé ; sinon non
- séparation des responsabilités : le code applicatif ne touche pas au schéma

La version Docker **vérifie quand même** la présence du schéma avant de patcher les chemins (`SELECT to_regclass('public.docservers') IS NOT NULL;`) et s'arrête avec un message clair s'il est absent (cas d'une Postgres externe non pré-chargée).

---

## Faiblesses de `create_custom.sh` corrigées par la version Docker

### Bugs réels

#### 1. Brace expansion cassée par les guillemets

```bash
mkdir -p "$NEW_CUSTOM_PATH/bin/scripts/ai/{splitter,verifier}"
```

En bash, l'expansion de braces `{a,b}` **ne fonctionne pas à l'intérieur de guillemets**. Cette ligne crée littéralement un répertoire nommé `{splitter,verifier}` au lieu des deux dossiers `splitter` et `verifier`. Bug silencieux : OpenCapture tombera plus tard sur le chemin manquant.

La version Docker emploie la syntaxe correcte (braces hors guillemets) :

```bash
mkdir -p "${DOCSERVERS_PATH}"/verifier/ai/{train_data,models}
```

#### 2. Espace parasite dans les credentials DB

```bash
crudini --set "$confFile" DATABASE postgresUser " $database_user"
crudini --set "$confFile" DATABASE postgresPassword " $database_password"
```

Un espace en tête de valeur (`" $database_user"`). crudini stocke la valeur telle quelle, d'où un username/password avec espace initial. Selon que le lecteur Python applique un `strip()` ou non, ça peut produire un `password authentication failed` au runtime.

#### 3. Appel `getopt` mort

```bash
parameters="user custom_id database_name …"
opts=$(getopt --longoptions "$(printf "%s:," "$parameters")" --name "$(basename "$0")" --options "" -- "$@")
```

La variable `opts` n'est jamais réutilisée — le parsing réel se fait dans un `while [ $# -gt 0 ]; do case "$1" in … esac done`. Le `getopt` est du code mort copié-collé ; un argument invalide y produit un avertissement silencieusement perdu.

### Faiblesses de conception

#### 4. Non idempotent

```bash
if [ -e "$CUSTOM_PATH/$custom_id" ]; then
    echo "Custom id already exists"
    exit 6
fi
```

Si une création échoue à mi-parcours (mauvais password, disque plein), il faut nettoyer manuellement avant de retenter. Aucune reprise possible.

→ La version Docker est rejouable à chaque démarrage : self-heal + short-circuit sur `config.ini`.

#### 5. Pas de self-heal pour les migrations

Quand le champ `url` a été ajouté à `custom.ini` (clean URL), les tenants existants restent figés — seul moyen : éditer `custom.ini` à la main. Idem pour la migration de la section `[DATABASE]`.

→ La version Docker possède trois fonctions self-heal exécutées **avant** le short-circuit : `ensure_watcher_ini`, `ensure_database_section`, `ensure_custom_ini_entry`. Elles rattrapent les tenants créés sous une version antérieure.

#### 6. Pas de `set -euo pipefail`

Le script continue après une erreur silencieuse. Un `cp` raté n'arrête pas l'exécution ; on peut aboutir à un tenant DB-OK mais filesystem incomplet, difficile à diagnostiquer.

→ La version Docker active `set -euo pipefail` dès la ligne 14.

#### 7. Pas de `ON_ERROR_STOP=1` pour psql

```bash
psql $DATABASE_INFO -c "\i $DEFAULT_PATH/postgres/sql/structure.sql"
```

Par défaut, psql poursuit après une erreur SQL. Une instruction ratée dans `structure.sql` laisse les suivantes s'exécuter → schéma silencieusement incomplet.

→ La version Docker passe `-v ON_ERROR_STOP=1`.

#### 8. Dépendance `crudini` non vérifiée

`crudini` est un paquet Python à installer séparément. Le script ne contrôle pas sa présence ni ne le documente. S'il manque, le premier `crudini --set` échoue et `config.ini` se retrouve sans section `[DATABASE]` → crash applicatif au runtime.

→ La version Docker utilise `configparser` (stdlib Python), aucune dépendance à installer.

#### 9. Permissions hardcodées `www-data`

```bash
group=www-data
chown -R "$user":"$group" "$share_path"
```

Hypothèse implicite : serveur web en `www-data` (Debian). Non portable (RHEL : `apache`, Alpine : `nobody`), non paramétrable.

→ La version Docker ne fait aucun `chown` : un conteneur tourne sous un seul utilisateur.

#### 10. Pas de retry/timeout sur la base

```bash
psql $DATABASE_INFO -c "…"
```

Si la base n'est pas joignable, le script échoue ou se bloque. Aucune logique d'attente.

→ La version Docker s'appuie sur `wait_for_postgres` (60 retries × 1 s) dans `docker-entrypoint.sh` avant de lancer le bootstrap.

### Problèmes mineurs

#### 11. `DEFAULT_PATH='.'` en dur

Le script doit être lancé depuis le bon répertoire ; pas de `cd "$(dirname "$0")"`. Une erreur de cwd casse silencieusement tous les chemins relatifs.

#### 12. Pas de transaction SQL

Les patches sont 7 `UPDATE` séparés (connexions/statements indépendants). Si l'un échoue, les précédents sont déjà committés. Pas d'atomicité ni de rollback.

→ La version Docker enveloppe tous les `UPDATE` dans un seul heredoc psql, exécuté en une transaction.

#### 13. Pas de validation du FQDN

`--dns` accepte n'importe quelle chaîne, sans regex. Un `--dns "site1 foo"` (avec espace) est écrit tel quel dans `custom.ini` → hostname jamais résolu, debug confus.

#### 14. Logs en bannières `echo "######"`

Pas grep-ables, sans timestamp ni niveau (INFO/WARN/ERROR).

→ La version Docker emploie une fonction `log()` préfixée `[bootstrap]`.

---

## Tableau de synthèse

| Critère | `create_custom.sh` | `docker-bootstrap.sh` |
|---|---|---|
| Idempotence | ❌ exit sur doublon | ✅ self-heal + short-circuit |
| Bugs latents | ❌ brace expansion, espace credentials, getopt mort | ✅ aucun équivalent |
| Robustesse erreurs | ❌ ni `set -euo pipefail` ni `ON_ERROR_STOP` | ✅ les deux activés |
| Dépendances externes | ❌ `crudini` non vérifié | ✅ stdlib Python uniquement |
| Portabilité OS | ❌ hardcode `www-data` | ✅ neutre (container) |
| Retry DB | ❌ aucun | ✅ via `docker-entrypoint.sh` |
| Atomicité SQL | ❌ 7 statements indépendants | ✅ heredoc transactionnel |
| Self-heal migrations | ❌ aucun | ✅ watcher.ini, [DATABASE], custom.ini url |
| Logs | ⚠ bannières echo | ✅ préfixe `[bootstrap]` |

---

## Conclusion

`create_custom.sh` a été conçu comme un **one-shot d'installation manuelle** : un opérateur le lance une fois, repère visuellement les erreurs, corrige à la main. Dans ce contexte, ses faiblesses (non-idempotence, absence de self-heal, logs en bannières) sont tolérables.

Sa transposition Docker exigeait une réécriture, car les conditions sont différentes :

- **réexécution automatique** à chaque `docker compose up` → idempotence obligatoire
- **mises à jour incrémentales** sans wiper les data → self-heal des migrations
- **observabilité** via `docker logs` → logs structurés
- **isolation** single-user → pas de gestion de permissions

Les trois bugs réels (brace expansion, espace credentials, getopt mort) mériteraient d'être remontés en amont à Edissyum : ce sont des correctifs minimes sans risque de régression, indépendants du contexte Docker.

---

*Document de référence interne — branche `docker-claude`.*
