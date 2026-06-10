# Pattern — Répondre à un ticket

> Pattern de mémoire projet (étape **Learn** de la boucle Act → Learn → Reuse).
> Tâche récurrente : proposer une réponse standard, professionnelle et relue, à un
> ticket OpsDesk. Ce fichier est versionné et partagé : il sert de référence pour ne
> PAS redécouvrir le projet à chaque exécution.

## Quand l'utiliser

Dès qu'on demande « propose une réponse au ticket #<id> ». L'agent lit ce pattern,
récupère le ticket en base, puis produit une proposition de réponse dans `replies/<id>.md`.

## Entrées

- ID du ticket (ids de démo : 1001..1012).
- Table `tickets`, base SQLite `data/opsdesk.db`. Lecture via `getTicket(id)` (`src/tickets.ts`).
- Champs utiles : `subject`, `body`, `category`, `priority`, `status`.
  - `category` ∈ {acces, facturation, bug, demande, autre}.
  - `priority` ∈ 1..3 (1 = bas, 3 = haut).
  - `status` ∈ {open, in_progress, closed}.

## Convention de ton (OpsDesk)

- **Français, vouvoiement**, ton courtois, factuel et concis.
- **Structure imposée** (4 blocs, dans cet ordre) :
  1. **Accusé de réception** : on confirme la bonne prise en compte de la demande.
  2. **Réponse / éléments de réponse** : on répond à la demande réelle du ticket.
  3. **Prochaine étape** : ce qui va se passer ensuite, côté équipe ou côté client.
  4. **Formule de clôture** : remerciement + signature générique « L'équipe OpsDesk ».
- Adapter le registre à la `category` (cf. tableau ci-dessous) sans changer la structure.

## Do / Don't

**Do**
- Reformuler brièvement la demande pour montrer qu'elle est comprise.
- Donner une prochaine étape concrète (« nous revenons vers vous », « un correctif est planifié »).
- Rester sobre : 4 à 10 lignes suffisent pour un premier jet.
- Marquer explicitement les zones incertaines par `[À VÉRIFIER : ...]` plutôt que d'inventer.

**Don't**
- Pas de **délai chiffré** (« sous 24h », « d'ici lundi ») sans donnée réelle. À défaut,
  écrire « dans les meilleurs délais ».
- Pas de promesse d'indemnisation, de remboursement, ni d'engagement contractuel.
- Pas de jargon technique interne ni de référence à des outils internes.
- Pas de données d'un autre ticket / d'un autre client (cloisonnement).
- Aucune donnée sensible recopiée (cf. garde-fou sécurité).

## Adaptation par catégorie (registre, pas structure)

| category     | Inflexion de ton                                                        |
|--------------|-------------------------------------------------------------------------|
| acces        | Rassurant, étapes claires de déblocage ; ne jamais transmettre de secret.|
| facturation  | Précis et prudent ; pas de geste commercial promis ; renvoi vers le suivi.|
| bug          | Empathique sur la gêne ; mentionner que le problème est remonté à l'équipe.|
| demande      | Constructif ; indiquer si la demande est prise en compte / à l'étude.    |
| autre        | Neutre ; demander une précision si la demande n'est pas claire.          |

## Sortie

- Un seul fichier : `replies/<id>.md`. **Ne rien modifier d'autre** (ni la base, ni le code).
- En-tête du fichier : `# Réponse — ticket #<id>` puis le corps de la réponse.

## Garde-fou (relecture humaine OBLIGATOIRE)

- `replies/<id>.md` est une **proposition**, jamais un envoi automatique.
- Aucune réponse n'est transmise à un client sans **relecture et validation humaine**.
- En cas de ticket sensible (priority 3, ton délicat, litige) : ne pas trancher seul,
  signaler pour décision humaine.

## Voir aussi

- `CLAUDE.md` → section « Tâches récurrentes » (renvoi vers ce pattern).
- `memory/idempotence.md` → pattern « écrire seulement si absent + journaliser ».
- `src/classification/schema.ts` → schéma de classification réutilisé (J2/J4/J5).
