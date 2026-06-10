# TODO — J3 (boucle mémoire Act → Learn → Reuse)

> État-en-fichiers d'une tâche multi-étapes. On coche au fil de l'eau ; chaque étape
> cochée est tracée dans `journal.md`. Ce fichier est l'« état observable » de la journée :
> un tiers doit pouvoir le lire et savoir où on en est.

## Tâche courante : instrumenter Act → Learn → Reuse sur OpsDesk

- [x] J3.0 — Repartir d'un état sain (`npm ci`, `npm test` vert, `npm run seed`).
- [x] J3.1 — Mémoire projet : `memory/reponses-tickets.md` + « Carte du contexte » dans `CLAUDE.md`.
- [x] J3.1 — ACT : produire `replies/1001.md` à froid (sans pattern dédié).
- [x] J3.2 — Plan-en-fichier `plans/exemple.plan.md` relu et validé par un humain.
- [x] J3.2 — Observabilité : `TODO.md` + `journal.md` tenus au fil de l'eau.
- [x] J3.3 — Idempotence : test `test/reprise.test.ts` (rejouer ne duplique pas) → vert.
- [x] J3.4 — Mesure Act/Reuse : `mesure/avant-apres.md` rempli (≥ 1 indicateur amélioré).
- [x] J3 — LEARN : renvoi vers `memory/reponses-tickets.md` ajouté dans `CLAUDE.md`.

## Reste à faire (ouvert)

- [ ] J3.5 — Séquence pi.dev (live) : faire mettre à jour `TODO.md` + `journal.md` par pi.dev.
- [ ] Consigner la version pi.dev observée dans `journal.md` (veille datée).

## Points de relecture humaine (garde-fous tracés)

- [x] Plan `plans/exemple.plan.md` approuvé avant tout code.
- [x] `replies/1001.md` marqué « proposition » — non envoyé sans validation.
- [ ] Cas de classification douteux (faible confiance) à marquer `needs_review` (J3.3 étendu).
