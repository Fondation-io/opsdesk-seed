# OpsDesk — Mémoire projet (CLAUDE.md)

OpsDesk est un mini back-office de gestion de tickets de support. Ce fichier est la
**mémoire projet** : la première chose que l'agent lit. Il décrit comment on travaille ici
pour ne pas redécouvrir le projet à chaque session.

## Stack & conventions

- TypeScript / Node (ESM, `"type": "module"`), Fastify, SQLite via `better-sqlite3`, tests Vitest.
- Commandes depuis la **racine**, en `npm` : `npm run dev`, `npm run seed`, `npm test`, `npm run build`.
- Base : `data/opsdesk.db`. Table `tickets` :
  `id, subject, body, category, priority, status, created_at`.
- Domaines de valeurs :
  - `status` ∈ {`open`, `in_progress`, `closed`} (jamais `pending`).
  - `category` ∈ {`acces`, `facturation`, `bug`, `demande`, `autre`}.
  - `priority` ∈ 1..3.
- Tickets de démo : ids **1001..1012** (réinsérés par `npm run seed`).
- Requêtes **paramétrées** uniquement (cf. `src/tickets.ts`). Pas de SQL concaténé.

## Success criteria (rappel J1)

- `npm test` vert avant et après toute modification.
- Routes santé/lecture/écriture statut opérationnelles (`src/server.ts`).
- Modifications **chirurgicales** : ne toucher que ce que la tâche demande.

## Carte du contexte (où vit quoi)

Trois horizons, trois durées de vie. Ranger chaque information au bon endroit.

- **Session (volatile)** : la tâche en cours, les fichiers ouverts, le raisonnement immédiat.
  → fenêtre de conversation, rien à persister.
- **Mémoire projet (versionnée, partagée)** : conventions, architecture, décisions,
  patterns « comment on fait ici ». → `CLAUDE.md` + `memory/*.md`.
- **État de tâche (observable, sur disque)** : plan, étapes faites/à faire, journal, point
  de reprise. → `plans/*.md`, `TODO.md`, `journal.md`.

Principe : *plus on écrit vers l'extérieur (mémoire/état), moins on redécouvre.*
C'est la boucle **Act → Learn → Reuse** : on agit dans la session, on apprend en écrivant
vers la mémoire/l'état, on réutilise à la session suivante.

## Tâches récurrentes

- **Répondre à un ticket** → suivre `memory/reponses-tickets.md`
  (ton, structure accusé → réponse → prochaine étape → clôture ; sortie `replies/<id>.md` ;
  relecture humaine obligatoire avant tout envoi).
- **Classer en lot / écrire en base de façon fiable** → suivre `memory/idempotence.md`
  (écrire seulement si absent, journaliser, marquer les cas douteux `needs_review`).

## Planifier avant de coder

Pour toute tâche multi-étapes (nouvelle feature, refactor) : écrire d'abord un plan dans
`plans/<tache>.plan.md` (objectif, étapes, fichiers touchés, tests, risques), le faire
**relire et approuver par un humain**, puis seulement exécuter. Gabarit : `plans/exemple.plan.md`.
Tenir `TODO.md` et `journal.md` à jour au fil de l'eau (observabilité).

## Sortie structurée (classification, J2 → réutilisé J4/J5)

Schéma : `src/classification/schema.ts`. Sortie d'une classification de ticket :
`{ categorie, priorite, besoin_humain, confiance, justification }`
(categorie ∈ {acces,facturation,bug,demande,autre} ; priorite 1..3 ; besoin_humain bool ;
confiance 0..1 ; justification string).

## Garde-fous

- **Aucun secret dans la mémoire** : `CLAUDE.md` et `memory/*.md` sont versionnés/partagés —
  pas de clé, token, URL privée ni donnée client réelle. Le hook bloquant J2 (motif
  `opsdesk_live_`) doit rester actif.
- **Relecture humaine** : plan validé avant code ; `replies/*.md` = propositions ; cas
  douteux marqués, pas tranchés par l'agent.
- **Fiabilité** : tant que le test n'est pas vert, la tâche n'est pas considérée fiable.
