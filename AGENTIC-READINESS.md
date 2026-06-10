# Diagnostic agentic-ready — OpsDesk (état de départ `opsdesk-seed`)

> **Score d'entrée : 3 / 12** · Date : 2026-06 · Branche : `main` (seed)
>
> Grille de diagnostic à 6 dimensions, chacune notée **0 / 1 / 2**. La note finale est
> **décidée par l'humain** : l'agent propose un contre-diagnostic, l'ingénieur arbitre.
> Ce fichier sert de **mètre** : la progression J1→J5 se mesure par la remontée de ce score.

## Échelle

- **0** — Absent / boîte noire.
- **1** — Partiel / implicite.
- **2** — Explicite, écrit, à jour, vérifiable.

## Grille remplie (état de départ)

| # | Dimension | Note | Justification (preuve dans le repo) |
|---|-----------|:----:|--------------------------------------|
| 1 | **Contexte / mémoire projet (`CLAUDE.md`)** | 0 | Aucun `CLAUDE.md` ni `AGENTS.md` à la racine. L'agent redécouvre tout à chaque session. |
| 2 | **Conventions explicites** | 1 | `README.md` existe mais reste sommaire ; les règles réelles (requêtes paramétrées, statut sans `pending`, paramètre `db?` pour les tests) sont **implicites** dans le code, non documentées. |
| 3 | **Prompts / commandes réutilisables** | 0 | Aucun prompt versionné, aucun slash-command, aucun dossier `.claude/`. On repart de zéro à chaque fois. |
| 4 | **Tests / CI** | 1 | `test/tickets.test.ts` (Vitest) couvre l'accès aux tickets ; `.github/workflows/ci.yml` lance `npm test`. Mais couverture **partielle** (pas toutes les routes/fonctions). |
| 5 | **Observabilité** | 0 | Pas de plan-en-fichiers, pas de `TODO.md`, pas de trace de l'état d'avancement. Ce que fait l'agent reste une boîte noire. |
| 6 | **Gestion des secrets / gouvernance** | 1 | Un garde-fou existe (`.gitignore` ignore `data/`, `*.db`, `*.sqlite`), mais **un secret en clair est commité** : `OPSDESK_API_KEY` dans `src/config.ts` (motif `opsdesk_live_`). Pas de hook, pas de relecture tracée. |

**Total : 3 / 12.**

## Angles morts identifiés

- **Secret en clair** `OPSDESK_API_KEY` (`src/config.ts`, motif `opsdesk_live_`) : repéré,
  **non corrigé** (invariant inter-jours). À neutraliser en J2 par un **hook** qui bloque le
  motif `opsdesk_live_` — pas par suppression.
- **Aucune mémoire projet** : conventions et raison d'être du projet invisibles pour l'agent.
- **Conventions implicites non écrites** : requêtes paramétrées obligatoires ; statut limité à
  `{ open, in_progress, closed }` (jamais `pending`) ; injection `db?` pour les tests.
- **Couverture de tests partielle** : routes HTTP et certaines fonctions non couvertes.
- **Pas d'observabilité** : aucun support de plan ou de suivi en fichiers.

## Note de méthode

L'agent a été sollicité pour un **contre-diagnostic** (« es-tu d'accord avec chaque note
0/1/2 ? »). Les notes ci-dessus sont la version **arbitrée par l'humain** après confrontation.
Le score sera recalculé en fin de J1.5 (la dimension Contexte/mémoire passera de 0 à ≥ 1 une
fois `CLAUDE.md` créé et relu).
