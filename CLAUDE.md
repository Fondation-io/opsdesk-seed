# OpsDesk - guide pour agents (CLAUDE.md)

OpsDesk est un mini back-office de gestion de tickets de support.
Stack : TypeScript / Node + Fastify + SQLite (better-sqlite3) + Vitest +
GitHub Actions. Toutes les commandes se lancent depuis la **racine** du repo,
avec **npm**.

## Commandes

- `npm install` - installe les dependances.
- `npm run seed` - peuple `data/opsdesk.db` (12 tickets, ids 1001..1012).
- `npm run dev` - demarre l'API Fastify (port `PORT` ou 3000).
- `npm test` / `npx vitest run` - lance la suite de tests.
- `npm run build` - compile TypeScript.

## Conventions du domaine (a respecter a l'identique)

- Table `tickets` (anglais) : `id`, `subject`, `body`, `category`, `priority`,
  `status`, `created_at`. Base : `data/opsdesk.db`.
- `status` appartient strictement a `{ open, in_progress, closed }` - **jamais
  `pending`**.
- `priority` : entier `1..3`. Categories :
  `{ acces, facturation, bug, demande, autre }`.
- Acces base **toujours parametre** (`prepare(...).run/get/all`). Jamais de
  concatenation de chaine, jamais de SQL libre.
- Classification (J2) : schema canonique `src/classification/schema.ts`,
  sortie `{ categorie, priorite, besoin_humain, confiance, justification }`.

## Convention d'outil (J2/J4)

Un outil expose a un agent = un **contrat** :
**nom verbe-objet** + **description "quand / quand-pas"** + **schema d'arguments
type** + **erreurs renvoyees en resultat** (pas en exception). Exemple :
`update_ticket_status` (intentionnel) plutot que `run_query` (generique et
dangereux).

## Serveur MCP `tickets` (J4)

Le serveur `mcp/tickets-server.mjs` est un **guichet gouverne** sur la base
SQLite. Il expose EXACTEMENT trois outils intentionnels, tous a requetes
parametrees :

- `list_tickets { status? }` - liste (filtre optionnel par statut).
- `get_ticket { id }` - un ticket, ou `{ erreur: "ticket <id> introuvable" }`.
- `update_ticket_status { id, status }` - met a jour le statut.

**Aucun** outil `run_query` / `execute_sql` n'est expose : ce que l'agent ne
peut pas faire est aussi important que ce qu'il peut faire. Traiter ce serveur
comme une **dependance de securite** (surface minimale, version epinglee).

Brancher le serveur dans Claude Code (depuis la racine, chemin absolu) :

```bash
claude mcp add tickets -- node "$(pwd)/mcp/tickets-server.mjs"
claude mcp list   # attendu : tickets ... connected
```

Retirer si besoin : `claude mcp remove tickets`.

## Sous-agents et orchestration (J4)

Trois sous-agents specialises sont versionnes dans `.claude/agents/`, aux
roles non chevauchants et outils restreints (moindre privilege) :

- **planner** (`planner.md`) - lecture seule (+ MCP `list_tickets`/`get_ticket`).
  Produit un plan numerote dans `plans/<feature>.plan.md`. **Ne code pas.**
- **builder** (`builder.md`) - Read/Write/Edit + Bash (tests) + MCP
  `update_ticket_status`. **Execute le plan** tel quel, ecrit code + tests.
  **Ne redefinit pas le perimetre.**
- **reviewer** (`reviewer.md`) - lecture seule + Bash (relancer les tests).
  Rend un **verdict** dans `reviews/<feature>.review.md`. **Ne corrige pas.**

### Workflow d'orchestration (pipeline Chain)

Pour livrer une feature, derouler la chaine **sequentielle** avec un point de
controle humain a chaque jonction :

```
planner -> [valider le plan] -> builder -> [tests verts] -> reviewer -> [lire le verdict] -> merge
```

- Point de controle n.1 : l'ingenieur relit le plan (accepte / amende / refuse,
  trace en une ligne dans `plans/`).
- Point de controle n.2 : `npx vitest run` doit etre **vert** avant la revue.
- Point de controle n.3 : l'ingenieur lit le verdict et tranche le merge.

L'**etat passe par des fichiers** (`TODO.md`, `plans/`, `reviews/`), heritage
de la pratique etat-en-fichiers de J3.

> Orchestration : le **spawn massif d'agents en parallele** est un **debat**,
> pas un dogme. Position de Mario **Zechner** (pi.dev) : c'est un
> **anti-pattern** (perte d'observabilite, conflits d'ecriture, couts qui
> explosent, relecture humaine impossible). On privilegie donc **peu d'agents
> enchaines de facon lisible** + **etat-en-fichiers** + **observabilite** (trace
> d'appels d'outils MCP, suivi type tmux). Le parallele ne se justifie que sur
> des taches **reellement independantes, sans etat partage**, et **jamais** au
> prix de la relecture humaine.

## Garde-fous

- Relecture humaine **structurelle** : on ne merge jamais sur la seule parole
  d'un agent ; le verdict ne remplace pas l'execution des tests.
- Le secret `OPSDESK_API_KEY` (`src/config.ts`, motif `opsdesk_live_`) est
  **volontairement** present et neutralise par le hook de gouvernance (J2) :
  ne pas le supprimer.
