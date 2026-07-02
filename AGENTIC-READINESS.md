# Grille de diagnostic « agentic-ready » — OpsDesk

> Gabarit prêt à l'emploi pour le **Lab J1.3** (diagnostic agentic-ready du fil rouge
> OpsDesk) du parcours P3 « Architecte agentique ». 6 dimensions notées **0 / 1 / 2**,
> score total **/12**. Sert de **mètre** : la progression J1→J5 se mesure par la remontée
> de ce score.
>
> **Source faisant foi** : grille §1.5 de [J1-fondations.md](../cours/J1-fondations.md)
> (réutilisée à l'identique au Lab J1.3, §3).
>
> **Convention** : `[…]` = zone à renseigner avant usage. La note finale est **décidée par
> l'humain** (l'agent propose, l'ingénieur dispose). Chaque note s'adosse à une **preuve du
> repo** (chemin de fichier, sortie de commande).
>
> **Deux échelles distinctes** : cette grille note l'**état du repo** (6 dimensions ×
> 0/1/2, score /12) — à ne pas confondre avec la grille d'évaluation des **compétences de
> l'apprenant** (5 critères × 1-5, /25, cf. [evaluation.md](evaluation.md)). Les deux
> s'appliquent à des objets et des moments différents.

---

## En-tête (à remplir)

| Champ | Valeur |
|-------|--------|
| Dépôt diagnostiqué | `opsdesk/` (copie de travail, **jamais** le seed) |
| Branche / état | `[ex. main (seed) · etat/j1-fin]` |
| Auteur du diagnostic | `[nom]` |
| **Date** | `[AAAA-MM-JJ]` |
| **Score total** | **`[__]` / 12** |

> Reporter ici **chaque passage** (score d'entrée à l'arrivée sur le seed, puis score après
> J1.5, puis aux journées suivantes), **daté**, pour matérialiser la progression.

---

## Mode d'emploi

1. **Copier ce gabarit** à la racine du dépôt OpsDesk (toutes les commandes des labs
   s'exécutent depuis la **racine** du dépôt, sans préfixe `./opsdesk` ni `--prefix`) :
   ```bash
   cp docs/gabarits/agentic-readiness.md ./AGENTIC-READINESS.md
   ```
2. Pour **chacune des 6 dimensions**, choisir la note **0 / 1 / 2** et écrire une
   **justification d'une ligne** adossée à une **preuve** (chemin de fichier ou commande).
3. **Calculer le score total** (somme des 6 notes, sur 12) et le reporter, **daté**, dans
   l'en-tête.
4. Demander à l'agent un **contre-diagnostic** pour challenger la notation :
   > « Voici ma grille d'agentic-readiness remplie pour ce repo. Es-tu d'accord avec chaque
   > note 0/1/2 ? Indique tout désaccord avec la preuve correspondante. »
   Puis **arbitrer en humain** : garder, ajuster, trancher.
5. **Re-noter** après chaque évolution (ex. après la création de `CLAUDE.md` en J1.5, la
   dimension *Mémoire projet* remonte) et **dater** chaque passage.

> **Garde-fou** : on **ne corrige pas** le secret en clair au stade du diagnostic J1 (motif
> `opsdesk_live_…` dans `src/config.ts`) ; on le **documente** comme risque sous la dimension
> *Gouvernance*. Il est traité en J2 via le hook de gouvernance.

---

## Grille des 6 dimensions (note 0 / 1 / 2)

| # | Dimension | Question | 0 — non-agentic | 1 — partiel | 2 — agentic-ready |
|---|-----------|----------|-----------------|-------------|-------------------|
| 1 | **Mémoire projet** (contexte / `CLAUDE.md`) | L'agent connaît-il le projet et ses conventions sans qu'on les répète ? | Pas de `CLAUDE.md` / `AGENTS.md` | Mémoire amorcée mais incomplète / non relue | `CLAUDE.md` écrit, relu par l'humain, à jour |
| 2 | **Cibles vérifiables** (tests / CI) | Existe-t-il un « ça marche » testable et automatisé ? | Tests absents/partiels, pas de CI | `npm test` partiel **ou** CI absente | `npm test` vert + CI GitHub Actions verte, cible claire |
| 3 | **Conventions explicites** | Le style et les règles sont-ils écrits, pas seulement « dans la tête » ? | Implicites dans le code | Partiellement documentées | Documentées (README, lint/format, schémas) |
| 4 | **Observabilité** | Voit-on ce que fait l'agent (plans, traces, état) ? | Boîte noire | Traces partielles | État-en-fichiers (plans, `TODO.md`), traces exploitables |
| 5 | **Gouvernance** (relecture humaine / secrets) | Y a-t-il des garde-fous, une relecture tracée, une gestion des secrets ? | Aucun garde-fou ; **secret en clair** (`opsdesk_live_…` dans `src/config.ts`) | Relecture occasionnelle ; secret repéré non traité | Relecture systématique tracée ; **aucun secret en clair** (hook de gouvernance) |
| 6 | **Capitalisation** (prompts / commandes réutilisables) | Réutilise-t-on prompts, slash-commands et règles d'une session à l'autre ? | Repart de zéro à chaque fois | Quelques bouts capitalisés | Bibliothèque de prompts/commandes versionnée et réutilisée |

### Fiche de notation (à remplir)

| # | Dimension | Note (0/1/2) | Justification (1 ligne) + preuve (fichier / commande) |
|---|-----------|--------------|--------------------------------------------------------|
| 1 | Mémoire projet | `[_]` | `[…]` |
| 2 | Cibles vérifiables (tests / CI) | `[_]` | `[…]` |
| 3 | Conventions explicites | `[_]` | `[…]` |
| 4 | Observabilité | `[_]` | `[…]` |
| 5 | Gouvernance (relecture / secrets) | `[_]` | `[…]` |
| 6 | Capitalisation | `[_]` | `[…]` |
| | **TOTAL** | **`[__]` / 12** | (reporter dans l'en-tête, daté) |

---

## Lecture du score (indicative)

| Score /12 | Lecture |
|-----------|---------|
| 0–3 | **Non-agentic** : l'agent travaille à l'aveugle (état typique du seed OpsDesk). |
| 4–7 | **En transition** : premières fondations posées (mémoire, cibles), reste à instrumenter et gouverner. |
| 8–10 | **Agentic-ready** : autonome et observable ; consolider gouvernance et capitalisation. |
| 11–12 | **Mature** : autonome, observable, gouverné et capitalisé de bout en bout. |

> Repères internes pour situer la progression, **pas** un seuil de réussite. La note finale
> reste décidée par l'humain.

---

## Lien avec le Lab J1.3 et le portfolio

- **Lab J1.3** (J1 — Fondations, §3) : produire le **score d'entrée** d'OpsDesk-seed à partir
  de `notes-j1.md` (sorties J1.1/J1.2) et de la grille §1.5 ; le copier en
  `AGENTIC-READINESS.md`, noter les 6 dimensions, calculer le score **/12** daté, puis
  confronter au **contre-diagnostic** de l'agent avant arbitrage humain.
- **Lab J1.5** : après création du `CLAUDE.md` (mémoire projet) relu par l'humain, **recalculer
  le score** (la dimension *Mémoire projet* remonte) — le delta est une **preuve de progression**.
- **Portfolio** : la checklist remplie **entre au portfolio** et sert de
  **mètre** réutilisé pour mesurer les progrès J2→J5 (mémoire J3, agents/MCP J4, mise en
  production J5).

> Cohérent avec le fil rouge **OpsDesk** (TypeScript/Node + Fastify + SQLite/better-sqlite3 +
> Vitest + GitHub Actions ; npm partout) et avec la grille d'auto-évaluation quotidienne
> (5 critères, 1-5) qui, elle, note la **posture** du participant — à ne pas confondre avec
> cette grille, qui note l'**état du dépôt**.
