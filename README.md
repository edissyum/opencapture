# Open-Capture — déploiement

Ce dépôt contient l'application Open-Capture et ses deux modes d'installation.

La documentation de référence est publiée dans le **GitBook** de l'équipe. Ce fichier
ne sert qu'à situer les répertoires ; les procédures détaillées vivent dans
[`runbooks/`](runbooks/) en attendant leur reprise dans le GitBook.

## Organisation

| Répertoire | Contenu |
|---|---|
| `backend/` `frontend/` `postgres/` `src/` `custom/` | L'application, commune aux deux modes |
| [`install/docker/`](install/docker/) | Installation dockerisée : composes, images, exploitation |
| [`install/classic/`](install/classic/) | Installation classique (hors conteneur) |
| [`install/migration/`](install/migration/) | Reprise d'une install classique vers Docker |
| [`runbooks/`](runbooks/) | Procédures pas à pas, en français et en anglais |

## Installation dockerisée

```
install/docker/
├── .env  .env.example      Configuration — OC_DATA_ROOT est OBLIGATOIRE
├── deploy.sh               (Re)construit et redéploie un ou plusieurs tenants
├── host/                   Prérequis sur l'OS hôte : SFTP, SMB, contrôle de ressources
├── shared/                 Définitions communes à tous les tenants
│   ├── traefik/            Reverse-proxy partagé
│   └── webdav/             Dépôt de fichiers par tenant (optionnel)
├── tenant/                 Création et remise à zéro d'un tenant
├── stub-tenants/           Un dossier par tenant + les gabarits `_template-*`
└── tests/                  Harnais de test de bout en bout
```

Point d'entrée : [`runbooks/fr/00_GUIDE.md`](runbooks/fr/00_GUIDE.md)
(version anglaise : [`runbooks/en/00_GUIDE.md`](runbooks/en/00_GUIDE.md)).

Les données ne vivent jamais dans le dépôt : tous les chemins dérivent de la variable
`OC_DATA_ROOT` du `.env` (en production `/opt/edissyum/opencapture`). Elle est
**obligatoire** — sans elle, le compose s'arrête avec un message explicite plutôt que
d'écrire dans un dossier imprévu.

## Vocabulaire

Le terme **tenant** désigne une entité isolée sur l'infrastructure partagée. Les
raisons de ce choix, et les termes écartés, sont dans [`TERMINOLOGIE.md`](TERMINOLOGIE.md).
