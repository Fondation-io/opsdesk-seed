# Plan - Feature `GET /tickets/stats`

> Produit par l'agent **planner** (Lab J4.4). Lecture seule : aucun code ecrit
> a ce stade.

## Demande (depuis TODO.md)

Exposer `GET /tickets/stats` qui renvoie `{ open, in_progress, closed }`.
Critere : test Vitest passant + route repond 200 avec le decompte par statut.

## Fichiers a creer ou modifier

1. `src/stats.ts` (nouveau) - fonction `ticketStats(db?)` renvoyant
   `{ open, in_progress, closed }`. Requete parametree, statuts absents = 0.
2. `src/server.ts` (modifie) - ajouter la route `GET /tickets/stats` appelant
   `ticketStats()`. **Declarer cette route AVANT** `GET /tickets/:id` pour
   eviter que `stats` soit capture par la route parametree.
3. `test/stats.test.ts` (nouveau) - tests Vitest sur `ticketStats`.

## Tests a ecrire

- Comptage correct sur une base mixte (3 open, 2 in_progress, 1 closed).
- Statut absent en base renvoye a 0 (cas limite).
- Base vide -> tout a 0.

## Conventions a respecter

- Statuts canoniques : `open`, `in_progress`, `closed` (jamais `pending`).
- Table `tickets` en anglais ; requete **parametree** / agregat SQL, pas de SQL
  libre cote agent.
- Injection de `db` optionnelle (`database: DB = defaultDb`) pour les tests en
  memoire, comme dans `src/tickets.ts`.

## Critere de reussite (verifiable)

- `npx vitest run` -> vert (le test de `ticketStats` passe).
- `curl -s localhost:3000/tickets/stats` -> JSON `{ open, in_progress, closed }`
  coherent avec la base.

---

## Point de controle humain n.1 - decision

**ACCEPTE** le 2026-06-09. Plan retenu sans amendement : perimetre minimal,
route declaree avant `/tickets/:id`, cas limites couverts. Passage a la phase
builder autorise. -- relu par l'ingenieur.
