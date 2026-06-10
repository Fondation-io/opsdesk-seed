# OpsDesk

OpsDesk est un mini back-office de gestion de tickets de support. Il sert de
fil rouge applicatif : une API HTTP simple, une base SQLite locale et un jeu de
donnees d'exemple.

## Stack

- TypeScript / Node.js
- Fastify (API HTTP)
- SQLite via better-sqlite3
- Vitest (tests)
- GitHub Actions (CI)

## Prerequis

- Node.js 20+
- npm

## Installation

```bash
npm ci
```

## Demarrage

Initialiser la base avec le jeu de donnees d'exemple :

```bash
npm run seed
```

Lancer le serveur :

```bash
npm run dev
```

Le serveur ecoute par defaut sur le port 3000.

## Routes

- `GET /tickets` : liste tous les tickets.
- `GET /tickets/:id` : retourne un ticket par identifiant.
- `POST /tickets/:id/status` : met a jour le statut d'un ticket (corps JSON `{ "status": "closed" }`).

## Schema de la table `tickets`

| Colonne     | Type    |
|-------------|---------|
| id          | INTEGER |
| subject     | TEXT    |
| body        | TEXT    |
| category    | TEXT    |
| priority    | INTEGER |
| status      | TEXT    |
| created_at  | TEXT    |

## Tests

```bash
npm test
```

## Build

```bash
npm run build
```
