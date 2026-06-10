# OpsDesk — Mémoire projet (CLAUDE.md)

> Mémoire projet pour les agents de coding (Claude Code, pi.dev). Ce fichier transfère
> à l'écrit ce que l'équipe sait implicitement. Tout fait affirmé ici est vérifiable
> dans le dépôt. Relu et corrigé par l'humain. Daté : 2026-06.

## À quoi sert OpsDesk

OpsDesk est un petit outil interne de support / ticketing. Une API (Fastify) reçoit des
tickets, les classe et propose une réponse, avec un mini-tableau de bord à venir. C'est le
projet fil rouge du parcours : il sert de terrain d'application aux pratiques agentiques.

État actuel : API minimale de gestion de tickets (lecture, détail, changement de statut),
adossée à une base SQLite locale.

## Stack

- TypeScript / Node.js LTS (>= 20), modules ESM (`"type": "module"`).
- Fastify (serveur HTTP).
- SQLite via `better-sqlite3` (accès synchrone).
- Vitest (tests).
- GitHub Actions (CI : `npm ci` + `npm test`).

## Commandes clés

| But | Commande |
|-----|----------|
| Lancer l'API en dev | `npm run dev` (sert `src/server.ts` via tsx) |
| Peupler la base | `npm run seed` (insère les tickets 1001..1012) |
| Compiler | `npm run build` (`tsc`) |
| Tester | `npm test` (`vitest run`) |

L'API écoute sur le port `PORT` (défaut `3000`). Toutes les commandes s'exécutent depuis la
**racine** du dépôt.

## Modèle de données

Table `tickets` (SQLite, noms de colonnes en anglais) :

| Colonne | Type | Notes |
|---------|------|-------|
| `id` | INTEGER PRIMARY KEY | ids explicites du seed : 1001..1012 |
| `subject` | TEXT | objet du ticket |
| `body` | TEXT | corps du message |
| `category` | TEXT | `acces` \| `facturation` \| `bug` \| `demande` \| `autre` |
| `priority` | INTEGER | 1 à 3 |
| `status` | TEXT | `open` \| `in_progress` \| `closed` |
| `created_at` | TEXT | horodatage ISO |

Base : `data/opsdesk.db` (surchargée par la variable d'environnement `OPSDESK_DB`).

## Routes HTTP

- `GET /health` → `{ "status": "ok" }`
- `GET /tickets` → liste des tickets
- `GET /tickets/:id` → un ticket (404 si absent)
- `POST /tickets/:id/status` → met à jour le statut (valeur dans l'ensemble autorisé)

## Conventions de code

- TypeScript strict, ESM (imports avec extension explicite si nécessaire).
- Accès base via `better-sqlite3` (synchrone) ; **requêtes paramétrées** uniquement
  (jamais de concaténation de chaînes en SQL).
- Logique d'accès aux tickets isolée dans `src/tickets.ts` ; chaque fonction accepte un
  paramètre `db?` optionnel pour faciliter les tests (injection d'une base en mémoire).
- Le serveur (`src/server.ts`) ne contient pas de SQL : il appelle les fonctions de
  `src/tickets.ts`.
- Statut d'un ticket : toujours dans `{ open, in_progress, closed }`. **Jamais `pending`.**
- Vocabulaire de la base en anglais (colonnes, valeurs de statut) ; documentation en français.

## Comment savoir qu'une modification est correcte

Voir `SUCCESS-CRITERIA.md`. En résumé :

1. `npm run build` compile sans erreur.
2. `npm test` (Vitest) s'exécute.
3. `GET /health` répond `{ "status": "ok" }`.
4. `npm run seed` peuple la base avec les tickets 1001..1012.

## Tâches récurrentes

> Placeholder. Cette section accueillera, à partir de J2, les prompts et slash-commands
> réutilisables (bibliothèque de prompts, commande de classification de ticket, etc.).

_(Aucune tâche récurrente documentée à ce stade.)_

## Sécurité

- **Secret en clair connu et non corrigé** : `OPSDESK_API_KEY` est codée en dur dans
  `src/config.ts` (motif `opsdesk_live_…`). C'est un piège pédagogique **volontaire**.
  Ne pas le supprimer ni le « corriger » à ce stade : il sera neutralisé en **J2** par un
  **hook de gouvernance** qui bloque le motif `opsdesk_live_`. La correction se fait par le
  hook, pas par la suppression.
- Aucun autre credential réel ne doit être commité.
- Ne pas déléguer à un agent, sans relecture, toute action touchant un secret ou un accès
  sensible.
