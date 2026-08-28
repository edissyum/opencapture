# Terminologie : pourquoi « tenant » plutôt que « custom » ou « client »

« Tenant » décrit précisément le concept d'architecture, alors que « custom » et
« client » sont ambigus dans ce contexte.

## « Tenant » — terme technique précis

C'est le mot consacré du **multi-tenancy** (multi-locataire) : une même instance
d'application/infrastructure sert plusieurs entités isolées les unes des autres
(données, config, conteneurs séparés). En lisant « tenant », on comprend :

- l'**isolation** (chaque tenant a ses propres données / volumes / conteneurs) ;
- la **multiplicité sur une infra partagée** ;
- un vocabulaire **standard** (Kubernetes, SaaS, bases de données…).

Dans le setup OpenCapture Docker, c'est exactement ça : des stacks de conteneurs
séparées par tenant, avec assets et config propres.

## Pourquoi pas « custom »

- **C'est un adjectif, pas une entité.** Il qualifie quelque chose de
  personnalisé, mais ne désigne pas *qui* est isolé.
- Il suggère à tort de la **personnalisation / sur-mesure**, alors que le vrai
  sujet est l'**isolation**. Deux tenants peuvent être identiques en config et
  rester deux tenants distincts.
- Ambigu avec les vrais réglages « custom » (champs personnalisés, etc.).

## Pourquoi pas « client »

- **Mélange métier et technique.** « client » est un terme commercial : un même
  client peut avoir plusieurs tenants (prod, test, filiales), et un tenant peut
  ne correspondre à aucun client (démo, environnement interne).
- **Surchargé en informatique** : client/serveur, client HTTP, etc.
- Couple la doc à une hypothèse métier susceptible de changer.

## En résumé

| Terme       | Verdict |
|-------------|---------|
| **tenant**  | ✅ désigne précisément l'entité isolée sur infra partagée |
| custom      | ❌ adjectif vague, évoque la personnalisation, pas l'isolation |
| client      | ❌ notion métier, surchargée et ambiguë techniquement |

« Tenant » sépare proprement le **concept d'architecture** (qui est isolé) de
l'**usage métier** (qui paie / à quoi ça sert), ce qui rend la doc plus durable
et moins ambiguë.
