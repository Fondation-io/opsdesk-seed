# Journal de diagnostic — J1 (OpsDesk)

> Date : 2026-06. Branche de départ : `main` (état de seed `opsdesk-seed`).
> Journal de bord du diagnostic agentic-ready et des décisions prises ce jour.

## Visite guidée du repo (J1.1 / J1.2)

Premier prompt d'exploration (« décris ce repo ») : l'agent liste correctement les fichiers de
premier niveau et identifie OpsDesk comme un outil de **ticketing** (API Fastify + SQLite). Il
**devine** en revanche plusieurs conventions non écrites — preuve directe que la mémoire projet
manque.

### Conventions implicites repérées (non écrites dans le repo)

1. **Requêtes SQL paramétrées** obligatoires (visible dans `src/tickets.ts`), mais aucune règle
   écrite ne l'impose.
2. **Statut d'un ticket** limité à `{ open, in_progress, closed }` — jamais `pending`. Déduit
   du seed et des valeurs manipulées, non documenté.
3. **Injection de base `db?`** dans les fonctions de `src/tickets.ts` pour permettre des tests
   sur base en mémoire. Convention de testabilité implicite.
4. **Vocabulaire de la base en anglais** (colonnes, valeurs de statut) alors que la doc est en
   français. Non explicité.

### Angles morts identifiés

1. **Secret en clair** : `OPSDESK_API_KEY` codée en dur dans `src/config.ts` (motif
   `opsdesk_live_`). **Repéré, non touché** (invariant inter-jours). À neutraliser en J2 par un
   hook bloquant le motif `opsdesk_live_`.
2. **Couverture de tests partielle** : `test/tickets.test.ts` existe, mais les routes HTTP et
   certaines fonctions ne sont pas couvertes. La cible « ça marche » n'est pas entièrement testée.

## Note pi.dev (J1.4)

Désambiguïsation faite : **pi.dev = Pi Coding Agent de Mario Zechner (badlogic)**, dépôt
`earendil-works/pi`, npm `@earendil-works/pi-coding-agent`. **Ce n'est pas** l'assistant Pi
d'Inflection (`pi.ai`). Les paquets `@mariozechner/*` et `badlogic/pi-mono` sont dépréciés.

Cœur minimal observé : **4 outils** (`Read`, `Write`, `Edit`, `Bash`), prompt système court,
**zéro sub-agent dans le cœur**. À retenir : *le cœur minimal est le principe ; l'orchestration
est une couche au-dessus* (réutilisé J4).

Position anti-framework de l'auteur (spawn massif de sous-agents en parallèle = anti-pattern ;
alternative tmux + état-en-fichiers + observabilité) : présentée comme un **débat / opinion**,
pas comme une vérité établie. Contre-argument (l'orchestration parallèle a sa place) rouvert J4.

## Décisions du jour

- **Ne pas** corriger le secret `OPSDESK_API_KEY` : invariant partagé, support du hook J2.
- **Ne pas** modifier l'état de seed : travail sur la branche `etat/j1-fin`.
- Créer `CLAUDE.md` (mémoire projet) + `AGENTIC-READINESS.md` (score d'entrée 3/12) +
  `SUCCESS-CRITERIA.md` pour rendre le repo agentic-ready niveau 1.
- `CLAUDE.md` généré par l'agent puis **relu et corrigé par l'humain** (faits inventés retirés,
  conventions implicites ajoutées). Le diff généré → corrigé est conservé comme preuve de
  gouvernance.

## Non-délégation — 3 situations où je ne déléguerais PAS à l'agent

1. **Tout ce qui touche un secret ou un accès sensible** (ex. le secret `OPSDESK_API_KEY`) :
   jamais en aveugle, jamais commité par l'agent sans relecture humaine.
2. **Décision irréversible ou à enjeu structurant** (suppression de données, choix
   d'architecture, changement de stack) : l'humain tranche.
3. **Affirmation non vérifiable dans le repo** : un fait que l'agent « devine » sans preuve dans
   le code doit être relu et vérifié, pas cru tel quel.

## Question rituelle (réponse écrite)

**« Qu'ai-je délégué / enseigné à mes agents aujourd'hui, et comment l'ai-je vérifié ? »**

J'ai enseigné à mon agent ce qu'est OpsDesk via `CLAUDE.md` (raison d'être, stack, commandes,
conventions, cible vérifiable). Je l'ai vérifié en re-testant le prompt d'exploration de J1.1 et
en constatant une réponse **plus exacte** une fois `CLAUDE.md` présent, et en confrontant ma
checklist d'agentic-readiness à son **contre-diagnostic** avant d'arbitrer moi-même les notes.
Le goulot, c'est moi : l'agent propose, je dispose.
