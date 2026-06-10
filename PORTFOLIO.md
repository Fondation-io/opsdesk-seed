# Portfolio P3 — OpsDesk

> Dossier de synthese du parcours P3 (ingenierie agentique appliquee). Cinq
> livrables traces J1->J5 sur le projet fil rouge **OpsDesk** (TS/Node + Fastify
> + SQLite/better-sqlite3 + Vitest + GitHub Actions), une grille d'auto-evaluation
> sur les 5 criteres, et un renvoi a l'examen blanc CCA-F.
>
> Etat de fin de parcours : branche `etat/j5-fin` (cumulatif sur `etat/j1-fin`..`etat/j4-fin`).

## 1. Index des 5 livrables (une preuve par jour)

| Jour | Livrable | Chemins / preuves | Criteres dominants |
|------|----------|-------------------|--------------------|
| J1 | Repo rendu **agentic-ready** | `CLAUDE.md` (initial), success criteria, checklist d'agentic-readiness | 5, 2 |
| J2 | **Bibliotheque de prompts** + **sortie structuree validee par schema** + **hook bloquant** | `.claude/commands/classer-ticket.md`, `src/classification/schema.ts`, hook secret (`opsdesk_live_`) | 5, 4 |
| J3 | Couche **memoire Act/Learn/Reuse** + observabilite + reprise sur echec | journal de patterns, instrumentation, preuve de gain Act->Learn->Reuse | 2, 3, 5 |
| J4 | **Outil / serveur MCP** (acces base tickets) + orchestration **planner->builder->reviewer** | outils MCP `list_tickets`/`get_ticket`/`update_ticket_status`, pipeline sur une feature reelle | 1, 3 |
| J5 | **Process en production (CI/CD)** + ADR mise-en-prod + garde-fous | `.github/workflows/agentic-review.yml`, `.github/agent/revue-pr.md`, `scripts/revue-agent.mjs`, `scripts/publier-verdict.mjs`, `docs/decisions/adr-001-mise-en-prod.md` | les 5 |

## 2. Grille des 5 criteres (auto-evaluation, 1-5 par critere, /25)

Chaque critere est note **1 (absent) -> 5 (exemplaire)**, **preuve a l'appui** (un
signal observable, pas un ressenti). Total sur **25**.

| # | Critere | Signal observable (niveau 5 vise) | Preuve | Note /5 |
|---|---------|-----------------------------------|--------|---------|
| 1 | **Autonomie** | Revue agentique branchee en CI sans pas-a-pas ; l'apprenant arbitre les findings au lieu de tout refaire | workflow `agentic-review.yml` operationnel | 5 |
| 2 | **Observabilite** | Job Summary = verdict + nb de findings ; on reconstitue l'action de l'agent a posteriori | `$GITHUB_STEP_SUMMARY` rempli par `publier-verdict.mjs` | 5 |
| 3 | **Fiabilite** | Deux pushes -> un seul commentaire (idempotence) ; relance sans doublon ; timeout pose | marqueur `<!-- opsdesk-revue-agent -->` + `timeout-minutes: 10` | 5 |
| 4 | **Gouvernance / relecture humaine** | Branch protection active : l'agent ne merge jamais ; secret en Actions secrets ; verdict valide par schema | branch protection + `verdict-schema.mjs` | 5 |
| 5 | **« Enseigner a ses agents »** | Prompt de revue, workflow et gabarit ADR versionnes et reutilisables sur tout futur repo | `.github/agent/revue-pr.md` + gabarit ADR | 5 |
| | **Total** | | | **/25** |

> Le total /25 est le score d'auto-evaluation du jour. Il se lit a cote du tableau
> d'ecarts CCA-F (section 3) : l'un mesure le **faire** (portfolio), l'autre le
> **decider en situation** (examen blanc).

## 3. Renvoi a l'examen blanc CCA-F

L'examen blanc CCA-F est un **outil de diagnostic**, pas un couperet. Format
consensuel : **60 questions QCM** (1 bonne reponse + 3 distracteurs), **120 min**,
closed-book, scenario-driven, proctore Skilljar.

**Score-cible interne : >= 80 %.** Un score inferieur n'est pas un echec : il
declenche un plan de revision par domaine. **Aucun seuil officiel n'est affiche**
(le « 720/1000 » est non publie/conteste : on ne le cite pas).

Ponderation officielle des 5 domaines (a utiliser pour calibrer la revision) :

| Domaine CCA-F | Poids | Travaille dans P3 | Reactive J5 par |
|---------------|-------|-------------------|-----------------|
| Agentic Architecture & Orchestration | **27 %** | J4 | CI/CD = orchestration de process ; debat spawn parallele |
| Claude Code Configuration & Workflows | **20 %** | J2 | hooks/commande de revue PR, settings de pipeline |
| Prompt Engineering & Structured Output | **20 %** | J2 | prompt de revue PR + sortie structuree du verdict |
| Tool Design & MCP Integration | **18 %** | J4 | outil/MCP appele depuis le pipeline |
| Context Management & Reliability | **15 %** | J3 | reprise sur erreur du job CI, idempotence de la revue |

Tableau d'ecarts a remplir apres l'examen blanc (une **action de revision par
domaine**) :

| Domaine | Poids | Questions | Reussies | Ecart | Action de revision |
|---------|-------|-----------|----------|-------|--------------------|
| Architecture & Orchestration | 27 % | | | | |
| Claude Code Config & Workflows | 20 % | | | | |
| Prompt Eng. & Structured Output | 20 % | | | | |
| Tool Design & MCP | 18 % | | | | |
| Context Mgmt & Reliability | 15 % | | | | |

> Acces CCA-F : gratuit pour les 5000 premiers employes du Partner Network, sinon
> ~99 USD/tentative. Le client OpsDesk etant non-membre du Partner Network, le
> coeur de la certification reste ce **portfolio interne** ; la CCA-F est une option.
