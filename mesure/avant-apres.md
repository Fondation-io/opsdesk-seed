# Mesure — Act (avant Learn) vs Reuse (après Learn)

> Preuve chiffrée de la boucle Act → Learn → Reuse (O5, cœur du livrable J3).
> Même tâche répétée — « proposer une réponse standard à un ticket » — exécutée deux
> fois : une fois **sans** la mémoire dédiée (Act, à froid), une fois **avec** la mémoire
> active (Reuse). Mesure **honnête** : si rien ne s'améliore, on l'écrit (cf. garde-fou §8.2).

## Protocole

- **Act (avant Learn)** : ticket #1003, prompt brut, pattern `memory/reponses-tickets.md`
  volontairement absent. L'agent redécouvre le projet.
- **Learn** : écriture de `memory/reponses-tickets.md` + renvoi « Tâches récurrentes »
  dans `CLAUDE.md`.
- **Reuse (après Learn)** : ticket #1004, prompt court s'appuyant sur la mémoire.
- Tâche, outil (Claude Code) et opérateur identiques entre les deux passes.

## Tableau de mesure

| Indicateur                          | Act (avant Learn) | Reuse (après Learn) | Écart        |
|-------------------------------------|-------------------|---------------------|--------------|
| Horodatage                          | 2026-06-09 09:55  | 2026-06-09 11:50    | —            |
| Ticket                              | #1003             | #1004               | —            |
| Allers-retours agent                | 4                 | 1                   | **-3** (mieux) |
| Longueur du prompt (mots)           | 58                | 17                  | **-41** (mieux) |
| Ton conforme dès le 1er jet (O/N)   | Non               | Oui                 | **amélioré** |
| Retouches humaines nécessaires      | 3                 | 1                   | **-2** (mieux) |

## Lecture

Au moins un indicateur est **strictement amélioré** après Learn (ici : les quatre le sont).
La cause n'est pas un agent « plus intelligent » : c'est le **repo qui se souvient**. Le
prompt court fonctionne parce que la convention de ton et la structure vivent désormais
dans `memory/reponses-tickets.md`, lu via le renvoi de `CLAUDE.md`.

## Conclusion (3 lignes)

1. On a **enseigné** au repo la tâche « répondre à un ticket » (pattern versionné + renvoi `CLAUDE.md`).
2. On l'a **vérifié** par deux exécutions horodatées de la même tâche, indicateurs à l'appui.
3. Gain principal : allers-retours 4 → 1 et ton conforme dès le 1er jet — moins de
   redécouverte, plus de stabilité. Garde-fou maintenu : la réponse reste relue par un humain.
