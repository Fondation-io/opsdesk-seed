# OpsDesk — Guide pour agents (CLAUDE.md)

OpsDesk est un back-office de tickets de support. Stack : **TypeScript/Node +
Fastify + SQLite (better-sqlite3) + Vitest + GitHub Actions**. Toutes les
commandes se lancent depuis la **racine** du depot, en **npm**.

## Domaine et conventions

- Table `tickets` (anglais) : `id, subject, body, category, priority, status,
  created_at`. Base : `data/opsdesk.db`. Tickets de seed : ids **1001..1012**.
- `status` ∈ `{open, in_progress, closed}` (jamais `pending`).
- Outils MCP exposes : `list_tickets`, `get_ticket`, `update_ticket_status`.
- Schema de classification (`src/classification/schema.ts`) : `categorie` ∈
  `{acces, facturation, bug, demande, autre}`, `priorite` entier 1-3,
  `besoin_humain` booleen, `confiance` 0..1, `justification` string.
  Sortie : `{ categorie, priorite, besoin_humain, confiance, justification }`.

## Commandes

- `npm run dev` — serveur Fastify (`src/server.ts`).
- `npm run seed` — insere les 12 tickets (1001..1012).
- `npm test` — Vitest (base en memoire).
- `npm run build` — `tsc`.

## Garde-fous

- **Secret piege** : `OPSDESK_API_KEY` dans `src/config.ts` (motif
  `opsdesk_live_`). Le **hook bloquant (J2) reste actif** et empeche ce motif de
  fuiter dans un commit. On ne supprime pas le secret du fichier : on le neutralise
  par le hook. Les vraies cles vivent en variables d'environnement / secrets.
- Sortie structuree **validee par schema** : on ne fait jamais confiance a une
  sortie de modele non validee (classification de ticket, verdict de revue).

## Mise en production (CI agentique)

Un **agent de revue de PR** tourne en CI (GitHub Actions). Il **conseille, il ne
merge jamais** : le merge reste protege par la branch protection (approbation
humaine obligatoire). Decision **HYBRIDE** : la production tourne sur **Claude Code
(stable)** ; pi.dev n'entre pas dans le pipeline (cf. `docs/decisions/adr-001-mise-en-prod.md`).

Artefacts (tous versionnes, reutilisables sur tout futur repo) :

- `.github/agent/revue-pr.md` — prompt de revue (un prompt est un livrable).
- `.github/workflows/agentic-review.yml` — workflow declenche sur `pull_request`.
- `scripts/revue-agent.mjs` — lit le diff, invoque l'agent en **headless**, emet un
  **verdict JSON** valide par schema.
- `scripts/publier-verdict.mjs` — valide le verdict puis publie le commentaire.
- `scripts/verdict-schema.mjs` — schema + validateur du verdict.

Forme du verdict (validee ; un job qui produit du non-JSON **echoue**, il ne
publie pas) :

```json
{
  "verdict": "approve | request_changes | comment",
  "findings": [ { "severite": "info|attention|bloquant", "fichier": "...", "message": "..." } ],
  "summary": "resume en francais, 2 phrases max"
}
```

Reflexes de production :

- **Secrets** : `ANTHROPIC_API_KEY` en *Actions secrets*, jamais dans le YAML ni
  le code. Le hook J2 reste actif.
- **Idempotence** : le commentaire porte le marqueur cache
  `<!-- opsdesk-revue-agent -->`. S'il existe, on l'**edite** (PATCH) au lieu d'en
  creer un nouveau. Deux pushes -> un seul commentaire.
- **Reprise** : `timeout-minutes: 10` ; relance **manuelle et tracee** (« re-run
  failed jobs ») — pas de re-run automatique infini. Une relance ne duplique pas le
  commentaire (grace au marqueur).
- **Cout borne** : on n'envoie que le **diff** (pas tout le repo) ; **court-circuit**
  sur les PR documentaires (`*.md` seul) — « revue non necessaire ».
- **Observabilite** : chaque execution ecrit verdict + nb de findings dans le
  **Job Summary** (`$GITHUB_STEP_SUMMARY`).
- **Boucle bornee** : pas de **spawn massif** de sous-agents (anti-pattern). On
  prefere le **sequentiel tracable** + etat-en-fichiers a un essaim opaque.

## Branches

Etats cumulatifs `etat/j1-fin` .. `etat/j5-fin`. Francais, sans emojis.
