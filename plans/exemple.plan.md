# Plan — Endpoint « suggestion de réponse à un ticket »

> Plan-en-fichier (observabilité, O3). Rédigé **avant** tout code. Sert d'exemple de
> gabarit réutilisable (« planifier avant de coder »). Rien n'est implémenté tant que la
> section « Décision humaine » n'est pas approuvée.
>
> Date : 2026-06-09 · Auteur agent : Claude Code · Relecteur humain : (trigramme apprenant)

## Objectif

Exposer `GET /tickets/:id/reply-suggestion` qui renvoie une suggestion de réponse pour un
ticket, en réutilisant le pattern mémoire `memory/reponses-tickets.md` (ton + structure).
Lecture seule côté base : l'endpoint ne modifie aucun ticket.

## Étapes numérotées

1. Lire le ticket via `getTicket(id)` (`src/tickets.ts`). Si introuvable → `404`.
2. Construire la suggestion en appliquant la structure du pattern
   (accusé → réponse → prochaine étape → clôture), adaptée à `category`.
3. Renvoyer `{ id, suggestion }` en JSON (pas d'écriture disque dans l'endpoint).
4. Brancher la route dans `src/server.ts` à côté des routes tickets existantes.
5. Écrire le test Vitest (base en mémoire) : 200 + champ `suggestion` non vide ; 404 si id inconnu.

## Fichiers touchés

- `src/server.ts` (ajout de la route — surgical, ne pas toucher aux autres routes).
- `src/reply.ts` (nouveau : fonction pure `buildSuggestion(ticket)`).
- `test/reply-endpoint.test.ts` (nouveau).

## Tests à écrire

- `GET /tickets/1001/reply-suggestion` → 200, `suggestion` contient l'accusé de réception.
- `GET /tickets/9999/reply-suggestion` → 404.

## Risques

- Tentation de faire écrire l'endpoint dans `replies/` → **non** : l'endpoint reste en
  lecture seule (séparer génération et persistance).
- Couplage au schéma de classification : garder `buildSuggestion` indépendant de la base
  (fonction pure testable).

## Décision humaine (garde-fou — relecture avant code)

- [x] Plan relu et **approuvé**. Périmètre confirmé : endpoint en lecture seule, pas
  d'écriture en base ni de fichier `replies/` généré par la route.
