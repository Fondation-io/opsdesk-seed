# Success criteria — OpsDesk (cible vérifiable du projet)

> Date : 2026-06. Une modification d'OpsDesk est **correcte** quand tous les critères
> ci-dessous sont satisfaits. Toutes les commandes s'exécutent depuis la **racine** du dépôt.
> « Ça marche » n'est pas un critère : chaque ligne est **vérifiable** par une commande.

## Critères de réussite

1. **Le projet compile.**
   ```bash
   npm run build
   ```
   Attendu : `tsc` termine sans erreur (code de sortie 0).

2. **Les tests s'exécutent.**
   ```bash
   npm test
   ```
   Attendu : `vitest run` s'exécute. Couverture **partielle** acceptée à ce stade (backlog :
   couvrir les routes et fonctions encore non testées) ; aucun test existant ne doit régresser.

3. **L'API répond sur `/health`.**
   ```bash
   npm run dev &
   curl -s localhost:3000/health
   ```
   Attendu : `{"status":"ok"}`.

4. **Le seed peuple la base avec les bons identifiants.**
   ```bash
   npm run seed
   ```
   Attendu : la table `tickets` contient les 12 tickets d'ids explicites **1001..1012**,
   avec `status` dans `{open, in_progress, closed}`, `category` dans
   `{acces, facturation, bug, demande, autre}`, `priority` dans `1..3`.

## Hors périmètre / vigilance

- Aucun secret réel ne doit être commité. Le secret en clair `OPSDESK_API_KEY`
  (`src/config.ts`, motif `opsdesk_live_`) est un **piège pédagogique connu** : il reste en
  place jusqu'à J2, où un **hook** le neutralise. Ne pas le supprimer pour « faire passer »
  un critère de sécurité.
- Statut d'un ticket toujours dans `{open, in_progress, closed}` — jamais `pending`.
