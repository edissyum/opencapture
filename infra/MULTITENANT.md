# Organisation des tenants Docker — comparaison de méthodologies

> **Document de décision d'archi** : *pourquoi* le repo organise les tenants via
> `include:` (méthodo A) plutôt qu'en dupliquant les composes par tenant (méthodo B),
> et comment cela se transpose à Kubernetes. La **mécanique** Docker détaillée (image à
> rôles, pipeline, bind mounts, glossaire) est dans
> [../runbooks/00_GUIDE.md](../runbooks/00_GUIDE.md) (Annexes C et E) ; la **procédure**
> (créer/déployer un tenant) y est aussi (sections 1-7).

## Contexte

OpenCapture est déployé en mode multi-tenant : plusieurs instances isolées tournent sur la même machine, chacune avec sa propre base PostgreSQL, son broker RabbitMQ, ses volumes et son nom de domaine, routées par un Traefik partagé.

Deux organisations sont possibles pour les fichiers Docker Compose de chaque tenant :

- **Méthodo A** — les composes communs vivent dans `infra/`, chaque tenant n'a qu'un stub qui les `include:`.
- **Méthodo B** — chaque tenant contient une copie complète et autonome des composes.

Ce document compare les deux approches et anticipe une éventuelle migration vers Kubernetes.

---

## Méthodologie A — `include:` depuis `infra/`

### Structure

```
infra/
├── docker-compose.yml                 # services applicatifs (backend, frontend, postgres, rabbitmq, workers…)
├── docker-compose.traefik.yml         # labels Traefik HTTPS + Let's Encrypt
├── docker-compose.traefik-cert.yml    # labels Traefik HTTPS cert fourni (SNI)
└── docker-compose.traefik-http.yml    # labels Traefik HTTP pur (interne / test)

stub-tenants/
├── _template-letsencrypt/              # squelette à copier (HTTPS Let's Encrypt)
├── _template-cert/                     # squelette à copier (cert fourni / SNI)
├── _template-http/                     # squelette à copier (HTTP pur)
├── site1/
│   ├── .env                            # CUSTOM_ID=site1, OC_FQDN=…, *_PATH=/opt/edissyum/opencapture/tenants/site1/…
│   └── docker-compose.yml              # 3 lignes : name + include
└── site2/
    ├── .env
    └── docker-compose.yml
```

Le `docker-compose.yml` d'un tenant fait littéralement :

```yaml
name: opencapture_${CUSTOM_ID}

include:
  - path: ../../infra/docker-compose.yml
  - path: ../../infra/docker-compose.traefik-http.yml
```

### Pour

- **DRY** — une seule source de vérité dans `infra/`. Fix de bug, bump d'image, nouveau service : tous les tenants en bénéficient immédiatement.
- **Ajout d'un tenant** = copier 2 fichiers, éditer le `.env`.
- **Cohérence garantie** entre tenants : impossible de driver involontairement.
- **Audit facile** — on voit immédiatement ce qui est partagé vs spécifique.
- **Footprint minimal** côté repository.

### Contre

- Requiert Docker Compose **v2.20+** (la directive `include:`).
- **Couplage fort** — un changement cassé dans `infra/` impacte tous les tenants d'un coup.
- **Divergence coûteuse** — un tenant qui veut épingler une ancienne version d'un service doit passer par `!override`, moins lisible.
- **Indirection** — depuis `stub-tenants/site1/`, il faut sauter dans `infra/` pour lire le détail des services.

---

## Méthodologie B — duplication complète par tenant

### Structure

```
stub-tenants/
├── site1/
│   ├── .env
│   ├── docker-compose.yml                # copie complète
│   ├── docker-compose.traefik-http.yml   # copie complète
│   └── docker-compose.traefik.yml        # copie complète
└── site2/
    └── … (mêmes fichiers, dupliqués)
```

### Pour

- **Autonomie totale** d'un tenant : on peut zipper `stub-tenants/clientX/` et le déployer ailleurs.
- **Divergence libre** : un client sur Postgres 15, un autre sur Postgres 17, sans gymnastique.
- **Lisibilité immédiate** : tout est sous les yeux, pas de saut mental.

### Contre

- **Duplication massive** : N copies à patcher pour chaque correctif.
- **Drift inévitable** — les tenants vont diverger silencieusement avec le temps. Un fix oublié sur un tenant = comportement subtilement différent en prod.
- **Ajout d'un tenant** = copier ~5 fichiers, risque d'oublier un détail.
- **Standards difficiles à imposer** sans tooling supplémentaire.

---

## Synthèse rapide

| Critère                       | Méthodo A (`include:`)        | Méthodo B (duplication)         |
|-------------------------------|-------------------------------|---------------------------------|
| Source de vérité              | Une seule (`infra/`)          | N copies                        |
| Propagation d'un fix          | Automatique                   | Manuelle, N fois                |
| Ajout d'un tenant             | 2 fichiers                    | ~5 fichiers                     |
| Divergence par tenant         | Coûteuse (overrides)          | Triviale                        |
| Risque de drift               | Nul                           | Élevé                           |
| Lisibilité depuis le tenant   | Indirection                   | Directe                         |
| Compose requis                | v2.20+                        | n'importe                       |
| Mapping vers Kubernetes       | Naturel                       | Anti-pattern                    |

---

## Organisation du code & isolation

Le code applicatif (backend Python, **frontend React/TypeScript**, SQL d'init Postgres)
vit **à la racine du repo** et n'est **pas dupliqué par tenant** : tous les tenants
tournent le même code, depuis la même image.

- **Une image backend partagée** : son `build` a pour `context: ..` (la racine du repo),
  donc voit `backend/`, `frontend/`, `postgres/`, `src/`, `custom/`. Les 6 services backend
  (init, api, workers, fs-watcher) la réutilisent avec un `command:` différent. Le frontend
  a sa propre image (nginx + bundle), **par tenant** (la config est bakée au build).
- **Isolation à deux niveaux** : (1) chaque tenant a son projet Compose
  `name: opencapture_${CUSTOM_ID}` → conteneurs / réseaux / volumes nommés **préfixés**,
  aucune collision possible ; (2) chaque tenant pointe ses propres chemins via les `*_PATH`
  de son `.env` (en prod `/opt/edissyum/opencapture/tenants/<id>/{pgdata,rabbitmq,custom,docservers,share}`) →
  bases et données **totalement disjointes**.

> Détail de cette mécanique (image à rôles, pipeline fs-watcher→RabbitMQ, bind mounts,
> glossaire Docker) : [../runbooks/00_GUIDE.md](../runbooks/00_GUIDE.md) Annexes C et E.

### Règle à respecter dans `infra/`

Tout nouveau service qui persiste des données dans `infra/docker-compose.yml` doit consommer
une variable `${..._PATH}` (avec un fallback `../data/...`) plutôt qu'un chemin en dur — c'est
ce qui permet à chaque tenant de surcharger ce chemin dans son `.env` (vers `/opt/edissyum/opencapture/tenants/<id>/...`).

### Quand un tenant a besoin de code spécifique

Trois niveaux possibles, du moins au plus invasif :

1. **Configuration via `custom/`** — la zone prévue pour ça. Templates, scripts métier,
   formulaires : tout ce qui est tenant-spécifique va dans `/opt/edissyum/opencapture/tenants/<id>/custom/`, monté
   à `/app/custom` dans le conteneur. Le code OC sait lire depuis `/app/custom` en priorité.
2. **Variable d'env supplémentaire** — pour activer/désactiver une feature : ajouter une var
   dans `infra/docker-compose.yml` (anchor `x-backend-env`), la définir dans le `.env` du tenant.
3. **Image dédiée** — si un tenant doit vraiment tourner sur du code différent (cas marginal) :
   son `docker-compose.yml` peut surcharger l'image via un override (`image: opencapture-backend:client-x`).
   Mais c'est exactement le cas de divergence que la méthodo A cherche à éviter — dernier recours.

---

## Et plus tard si on passe à Kubernetes ?

**La méthodologie A se transpose directement** sur les patterns standards K8s :

| Compose (méthodo A)                    | Kubernetes équivalent                    |
|----------------------------------------|------------------------------------------|
| `infra/docker-compose.yml`             | Helm chart / Kustomize `base/`           |
| `stub-tenants/site1/.env`              | `values-site1.yaml` / `overlays/site1/`  |
| `name: opencapture_${CUSTOM_ID}`       | Namespace `site1`                        |
| `PGDATA_PATH=/opt/edissyum/opencapture/tenants/site1/...`   | PersistentVolumeClaim dans ns `site1`    |
| Labels Traefik                         | Ingress / IngressRoute par namespace     |
| Stack Traefik partagée                 | Traefik en `kube-system` ou `ingress`    |

**La méthodologie B est un anti-pattern en K8s** : personne ne duplique ses manifests YAML par environnement. On utilise toujours :

- **Helm** : un chart + un `values.yaml` par tenant.
- **Kustomize** : un `base/` + un `overlays/<tenant>/`.
- **ArgoCD ApplicationSet** : un template, N instances générées.

En pratique, le passage vers K8s consisterait à :

1. `helm create opencapture` à partir de `infra/docker-compose.yml`.
2. Convertir chaque `stub-tenants/<x>/.env` en `values-<x>.yaml`.
3. Créer un namespace par tenant, une `IngressRoute` Traefik par tenant, une PVC par volume.

C'est un travail mécanique de quelques heures si la méthodo A est en place. Avec la méthodo B, il faut d'abord **factoriser** les composes dupliqués — travail qu'on s'est épargné en restant en A.

---

## Recommandation

**Garder la méthodologie A.**

Le seul cas où B serait justifié, c'est si les tenants sont amenés à diverger fortement et durablement (versions différentes, services différents, stacks différentes). Tant que tous les tenants tournent la même version d'OpenCapture, A gagne sur tous les axes sauf la lisibilité immédiate — et ce dernier point est compensé par le fait que le `docker-compose.yml` d'un tenant fait 3 lignes : il *montre* explicitement qu'il s'appuie sur `infra/`.

> Procédure opérationnelle (créer / déployer / exploiter un tenant, via `new-tenant.sh`
> et `deploy.sh`) : voir [../runbooks/00_GUIDE.md](../runbooks/00_GUIDE.md).
