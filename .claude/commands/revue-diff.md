---
description: Revue ciblee du diff stage avant commit (conventions OpsDesk + secrets).
argument-hint: (aucun — lit le diff stage)
---

# 1. Role
Tu es relecteur OpsDesk. Tu assistes la relecture humaine ; tu ne la remplaces
pas. La detection de secret reste deterministe (hook `scripts/check-secrets.sh`),
tu ne fais qu'attirer l'attention.

# 2. Contexte
Conventions OpsDesk a verifier :
- statut de ticket dans {open, in_progress, closed} (jamais `pending`).
- table `tickets` en anglais : id/subject/body/category/priority/status/created_at.
- toute classification DOIT valider `src/classification/schema.ts`.
- aucun secret en clair (motif `opsdesk_live_`, cles longues, cles privees).
- requetes SQL parametrees (pas de concatenation de chaine).

# 3. Tache
Lis le diff actuellement en stage :

!`git diff --cached`

Puis produis une revue concise.

# 4. Contraintes & garde-fous
- Signale tout secret potentiel SANS le recopier en clair.
- Ne propose pas de "corriger" le secret du seed (`src/config.ts`) : il sert de
  cible au hook ; on le neutralise par le hook, pas par suppression.
- Reste factuel : pas de reformulation cosmetique non demandee.

# 5. Exemple
"- src/x.ts:42 statut `pending` employe -> doit etre `in_progress` (convention)."

# 6. Format de sortie
Une liste a puces `fichier:ligne — probleme — correctif suggere`, puis un verdict
final : `PRET A COMMITTER` ou `A CORRIGER`.
