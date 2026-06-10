# OpsDesk — Memoire projet (CLAUDE.md)

Outil interne de support / ticketing. Stack : TypeScript/Node + Fastify + SQLite
(better-sqlite3) + Vitest + GitHub Actions. Cette memoire est chargee
automatiquement par tout agent : conventions, contexte et garde-fous.

## Contexte & architecture

- Serveur Fastify (`src/server.ts`) : `GET /health`, `GET /tickets`,
  `GET /tickets/:id`, `POST /tickets/:id/status`.
- Acces donnees : `src/tickets.ts` (`listTickets`, `getTicket`,
  `updateTicketStatus`) — requetes TOUJOURS parametrees.
- Base : `src/db.ts` (better-sqlite3), fichier `data/opsdesk.db`.
- Seed : `npm run seed` reinsere 12 tickets de demo (ids 1001..1012).

## Conventions (non negociables)

- Table `tickets` en anglais : `id`, `subject`, `body`, `category`, `priority`,
  `status`, `created_at`.
- `status` dans { `open`, `in_progress`, `closed` } — **jamais** `pending`.
- `priority` : entier 1..3.
- Outils MCP : `list_tickets`, `get_ticket`, `update_ticket_status`.
- npm partout ; commandes depuis la RACINE du depot. Francais, sans emojis.

## Sortie structuree : classification de ticket

- Schema canonique (source de verite) : `src/classification/schema.ts` —
  `categorie` dans { acces, facturation, bug, demande, autre }, `priorite`
  entier 1..3, `besoin_humain` booleen, `confiance` nombre 0..1,
  `justification` chaine.
- **Regle** : toute classification DOIT valider `schema.ts` via
  `validateClassification` / `parseClassification` (`src/classification/classify.ts`).
  Une sortie non conforme est **rejetee**, jamais rafistolee a la main. Le
  prompt *demande* le JSON ; le validateur *garantit* la conformite.
- Tests : `npm test` (voir `test/classification.test.ts`) — cas vert + rejets.

## Bibliotheque de prompts (versionnee)

Les prompts utiles vivent dans le depot, pas dans la tete du developpeur
(Act -> Learn -> Reuse).

- Specification versionnee : `prompts/classification.md` (les 6 composants +
  sorties observees relues).
- Slash-commands de projet (`.claude/commands/`) :
  - `/classer-ticket <texte>` — classe un ticket en JSON conforme au schema.
  - `/repondre-ticket <id|texte>` — BROUILLON de reponse client ; relecture
    humaine obligatoire avant envoi.
  - `/revue-diff` — revue du diff stage (conventions + alerte secrets).

## Gouvernance : hook bloquant

- `scripts/check-secrets.sh` : scan **deterministe** (regex) du diff stage ;
  bloque (code != 0) si secret en clair (motif `opsdesk_live_`, cles longues,
  cle privee PEM) ou `*.env` non `*.env.example`.
- `.claude/settings.json` : hook `PreToolUse` sur `Bash` ; sur une commande
  `git commit`, lance le script et **bloque** le commit si un secret est detecte.
- **La detection deterministe est la barriere ; le modele n'est qu'assistant.**
  On ne demande jamais au modele de juger seul « ce commit contient-il un secret ? ».

> Secret factice : `src/config.ts` contient `OPSDESK_API_KEY = "opsdesk_live_..."`.
> Il est laisse VOLONTAIREMENT pour donner du sens au hook. On le **neutralise
> par le hook**, on ne le supprime pas.

## Relecture humaine

Aucune sortie de modele (prompt, schema, classification, reponse client) n'entre
au portfolio sans **trace de validation humaine** datee (case cochee,
`Reviewed-by`, ou note). Une reponse client n'est jamais envoyee sans relecture.
