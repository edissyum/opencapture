# Tâches de maintenance & récurrentes — Ofelia

Open-Capture livre plusieurs scripts shell pour la maintenance (purge,
synchronisation de référentiel, LDAP, mail cleanup). Ils ont été
écrits pour être déclenchés par cron sur l'hôte. En Docker, ce
document décrit comment les piloter proprement depuis le stack
lui-même avec **Ofelia**, un scheduler conteneurisé piloté par labels.

> **Statut actuel** : non intégré dans le compose. Ce document décrit
> l'approche recommandée et fournit un patch prêt à appliquer.

## Pourquoi Ofelia

Cinq approches ont été comparées :

| Approche | Quand l'utiliser |
|---|---|
| Cron sur l'hôte (`crontab -e` + `docker compose exec`) | Trivial, mais l'hôte doit connaître la stack ; pas portable. |
| Conteneur custom avec `crond` | Standard mais tu réinventes le wheel (PID 1, env, logs). |
| **Ofelia (sidecar)** | Déclaratif via labels Docker, logs Docker natifs, ~10 Mo. |
| Kuyruk `@periodic` | Réutilise l'infra mais code-bound, pas de visibilité ops. |
| APScheduler dans gunicorn | Pareil + risque de double scheduling si tu scale l'API. |

Ofelia gagne dès que tu as plus de 2 tâches à planifier : la
configuration vit dans le `docker-compose.yml` (labels sur les
services concernés), pas dans un fichier séparé, pas dans le code.

## Architecture

```
        ┌────────────────────────────────────┐
        │ scheduler (ofelia)                 │  parse les labels Docker
        │   └─ /var/run/docker.sock          │  ↓
        │                                    │  docker exec backend bash …
        │                                    │  docker exec backend bash …
        └────────────────────────────────────┘
                        │
            docker compose logs scheduler
                        │
                        ▼
        ┌────────────────────────────────────┐
        │ backend (déjà running, healthy)    │
        │   └─ exec → /app/custom/<id>/bin/  │
        │      scripts/*.sh                  │
        └────────────────────────────────────┘
```

Le scheduler ne crée pas de conteneur à chaque tick : il fait un
`docker exec` dans `backend` (ou un autre service ciblé), qui a déjà
le tenant monté et les libs Python disponibles. Pas de duplication
d'image, pas de cold start.

## Intégration dans le compose

Ajoute le service :

```yaml
services:
  scheduler:
    image: mcuadros/ofelia:latest
    depends_on:
      backend:
        condition: service_healthy
    command: daemon --docker
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped
```

Pas de port à exposer, pas de variable d'env. Le `:ro` sur le socket
n'empêche pas le `exec` (le contrôle d'accès Docker est tout ou rien),
c'est un garde-fou symbolique.

## Déclarer une tâche : labels sur le service cible

Les jobs sont déclarés sur le service où l'on veut exécuter la
commande. Convention de nommage :
`ofelia.job-exec.<nom>.{schedule,command,...}`.

```yaml
services:
  backend:
    # ... existant ...
    labels:
      ofelia.enabled: "true"

      # Purge verifier tous les jours à 02:30
      ofelia.job-exec.purge-verifier.schedule: "0 30 2 * * *"
      ofelia.job-exec.purge-verifier.command: >
        bash /app/custom/${CUSTOM_ID}/bin/scripts/purge_verifier.sh
      ofelia.job-exec.purge-verifier.no-overlap: "true"

      # Purge splitter tous les jours à 02:45
      ofelia.job-exec.purge-splitter.schedule: "0 45 2 * * *"
      ofelia.job-exec.purge-splitter.command: >
        bash /app/custom/${CUSTOM_ID}/bin/scripts/purge_splitter.sh
      ofelia.job-exec.purge-splitter.no-overlap: "true"

      # Sync référentiel fournisseurs tous les lundis 03:00
      ofelia.job-exec.refresh-supplier-referencial.schedule: "0 0 3 * * 1"
      ofelia.job-exec.refresh-supplier-referencial.command: >
        bash /app/custom/${CUSTOM_ID}/bin/scripts/load_supplier_referencial.sh
      ofelia.job-exec.refresh-supplier-referencial.no-overlap: "true"

      # Sync LDAP toutes les heures
      ofelia.job-exec.ldap-sync.schedule: "@every 1h"
      ofelia.job-exec.ldap-sync.command: >
        bash /app/custom/${CUSTOM_ID}/bin/ldap/synchronization_ldap_script.sh

      # Nettoyage des mails traités tous les jours à 04:00
      ofelia.job-exec.mail-cleanup.schedule: "0 0 4 * * *"
      ofelia.job-exec.mail-cleanup.command: >
        bash /app/custom/${CUSTOM_ID}/bin/scripts/MailCollect/clean.sh
```

### Format du `schedule`

Deux syntaxes acceptées :

| Forme | Exemple | Sens |
|---|---|---|
| Cron 6 champs (sec min h jour mois jsem) | `0 30 2 * * *` | tous les jours à 02:30:00 |
| `@every <durée>` | `@every 1h`, `@every 30m` | intervalle relatif au démarrage |
| Macros | `@daily`, `@weekly`, `@hourly`, `@midnight` | raccourcis cron |

Attention : c'est **6 champs**, pas 5. Le premier est les secondes.
`0 0 2 * * *` = 02:00:00 tous les jours, pas `2:00 chaque second`.

## Couverture des scripts OpenCapture livrés

| Script `.sh.default` (dans `backend/installer/bin/scripts/`) | Fréquence raisonnable | Notes |
|---|---|---|
| `purge_verifier.sh` | quotidienne (nuit) | nettoie les documents traités |
| `purge_splitter.sh` | quotidienne (nuit) | idem côté splitter |
| `load_supplier_referencial.sh` | hebdo | sync CSV fournisseurs |
| `load_referential_splitter.sh` | hebdo | sync référentiel splitter |
| `load_users.sh` | quotidienne ou horaire | sync LDAP (utilisateurs) |
| `MailCollect/clean.sh` | quotidienne (nuit) | nettoyage pièces jointes mail |
| `launch_MAIL.sh` | **déjà couvert** | la pile a un service `worker-mail` qui boucle |
| `synchronization_ldap_script.sh` | horaire | sync LDAP complète (groupes + users) |

## Logs et debug

```bash
# Voir l'activité du scheduler
docker compose logs -f scheduler

# Lister les jobs enregistrés
docker compose exec scheduler ofelia --docker --print

# Forcer l'exécution d'un job (sans attendre le tick)
docker compose exec scheduler ofelia --docker --run purge-verifier

# Exécuter le script manuellement, sans passer par ofelia
docker compose exec backend bash /app/custom/edissyum/bin/scripts/purge_verifier.sh
```

Chaque job logue son stdout/stderr dans les logs du scheduler avec un
préfixe `[Job "purge-verifier"]`.

## Notifications d'erreur

Ofelia expose plusieurs canaux. Exemple SMTP, à mettre comme labels
**globaux** sur le service `scheduler` (pas sur le job) :

```yaml
scheduler:
  image: mcuadros/ofelia:latest
  labels:
    ofelia.smtp-on-error.host: "smtp.example.com"
    ofelia.smtp-on-error.port: "587"
    ofelia.smtp-on-error.user: "alerts@example.com"
    ofelia.smtp-on-error.password: "${SMTP_ALERT_PWD}"
    ofelia.smtp-on-error.from: "ofelia@opencapture.local"
    ofelia.smtp-on-error.to: "ops@example.com"
```

Canaux disponibles : SMTP, Slack (webhook), Mattermost, custom save-to-file.

## Sécurité — point d'attention

Monter `/var/run/docker.sock` dans Ofelia lui donne **un accès Docker
complet** sur l'hôte (même en `:ro`, l'API socket lecture/écriture
distingue mal). Quelqu'un qui prend le contrôle du conteneur Ofelia
peut :
- créer/supprimer n'importe quel conteneur,
- lire les variables d'env de tous les conteneurs,
- mount n'importe quoi sur l'hôte via `docker run -v /:/host`.

Acceptable en environnement de confiance (réseau interne, serveur
mono-locataire). À reconsidérer si :
- l'hôte héberge d'autres applications sensibles,
- des images tierces tournent dans la même stack,
- le scheduler est exposé à des opérateurs aux droits réduits.

Mitigation possible : utiliser `docker-socket-proxy` qui restreint
l'API socket aux endpoints `containers:exec` uniquement. C'est une
couche supplémentaire de 5 lignes de compose.

## Alternative légère sans dépendance externe

Si tu veux éviter Ofelia, ajoute un service `worker-cron` calqué sur
`worker-mail` :

```yaml
worker-cron:
  <<: *backend-build
  image: opencapture-backend
  environment:
    <<: *backend-env
  volumes: *backend-volumes
  command:
    - bash
    - -c
    - |
      while true; do
          now=$$(date +%H:%M)
          [ "$$now" = "02:30" ] && bash /app/custom/$$CUSTOM_ID/bin/scripts/purge_verifier.sh
          [ "$$now" = "02:45" ] && bash /app/custom/$$CUSTOM_ID/bin/scripts/purge_splitter.sh
          [ "$$now" = "03:00" ] && [ "$$(date +%u)" = "1" ] && \
              bash /app/custom/$$CUSTOM_ID/bin/scripts/load_supplier_referencial.sh
          sleep 60
      done
```

Pour **2-3 jobs simples**, c'est viable. Au-delà ça devient illisible
et fragile (DST, redémarrages, double-exécution si une tâche déborde
sur la minute suivante). Ofelia gère tout ça.

## Quand activer Ofelia

- **Pas urgent au tout début** : tant que la pile n'est pas en
  production, on peut vivre sans purges (les volumes ne débordent pas
  en quelques jours).
- **Activation recommandée dès la mise en service prod** : sinon les
  docservers grossissent et les référentiels deviennent obsolètes.
- **Tâches LDAP** : à activer dès que tu branches un AD/OpenLDAP en
  prod.

## Patch prêt à appliquer

Voir la branche `docker-claude` pour la version actuelle de
`docker-compose.yml`. Le patch d'intégration consiste à :

1. Ajouter le service `scheduler` (~10 lignes).
2. Ajouter le bloc `labels:` sur `backend` (1 bloc par job).
3. Documenter dans `INSTALL.md` la liste des jobs actifs.
4. Si SMTP-on-error : ajouter `SMTP_ALERT_PWD` à `.env.example`.

Aucune modif de code applicatif, aucun rebuild d'image, juste un
`docker compose up -d` après édition du compose.
