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

- Node.js 20 a 22 (LTS). Node 24+ n'est pas supporte : better-sqlite3 v11 n'a
  pas de binaire prebuild pour cette version et tenterait une compilation
  (echec sur Windows sans outils de build). Le `.nvmrc` cible Node 22 ; avec nvm,
  `nvm use` selectionne la bonne version. `engine-strict` (`.npmrc`) fait echouer
  `npm ci` avec un message clair si la version de Node est hors plage.
- npm 10+

## Installation

Toujours `npm ci`, jamais `npm install`, et ne supprime pas `package-lock.json` :
le lock fige les binaires natifs de chaque plateforme (Windows/macOS/Linux). Sur
un clone propre, `npm ci` installe directement le bon binaire — aucune adaptation
manuelle requise.

```bash
nvm install   # premiere fois : installe Node 22 (lit .nvmrc)
nvm use       # selectionne Node 22
npm ci
```

## Depannage Windows : "Cannot find module @rollup/rollup-win32-x64-msvc"

Bug npm des dependances optionnelles (npm/cli#4828) : le binaire natif de rollup
(utilise par Vitest) n'est pas installe. Procedure de secours **locale**, du plus
propre au dernier recours. S'arreter des que `npm test` passe.

1. Reinstall propre (ne touche pas au lock, aucune derive de versions) :

   ```bash
   rmdir /s /q node_modules        # PowerShell : Remove-Item -Recurse -Force node_modules
   npm ci
   npm test
   ```

2. Si ca echoue encore : installer juste le binaire manquant, version alignee sur
   le rollup present (ne modifie ni package.json ni le lock) :

   ```bash
   node -e "console.log(require('./node_modules/rollup/package.json').version)"
   npm install @rollup/rollup-win32-x64-msvc@<version-affichee> --no-save
   npm test
   ```

3. Dernier recours (regenere le lock sur ta machine) : supprimer node_modules ET
   package-lock.json puis `npm install`. Attention : les versions peuvent bouger ;
   **ne commite pas** ce `package-lock.json` regenere.

   ```bash
   rmdir /s /q node_modules
   del package-lock.json
   npm install
   npm test
   ```

Avant toute suppression : fermer VS Code et tout terminal/serveur touchant le
dossier, sinon un fichier verrouille bloque le nettoyage.

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
