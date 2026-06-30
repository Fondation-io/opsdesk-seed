---
name: rattrapage-jalon
description: Diagnostique et rattrape une soumission de jalon (PR fil rouge) qui n'apparaît pas dans le tableau de bord de la plateforme. À utiliser quand un jalon déjà travaillé n'a pas été évalué (PR ouverte avant l'installation de la GitHub App, mauvais nom de branche, ou base de PR incorrecte). Auto-détecte P3 (OpsDesk) / P4 (Atlas).
---

# Rattrapage d'un jalon non évalué

Objectif : faire apparaître sur le tableau de bord un jalon déjà travaillé mais
que la plateforme n'a jamais reçu. Cause habituelle : la PR a été ouverte AVANT
l'installation de la GitHub App (le webhook n'est jamais parti), ou la branche
n'a pas le nom exact attendu, ou la PR ne vise pas `main`.

Tu agis dans le fork de l'apprenant. Tu peux exécuter les commandes git/gh
toi-même, mais tu EXPLIQUES chaque étape (c'est aussi un moment d'apprentissage)
et tu DEMANDES confirmation avant toute opération qui réécrit l'historique ou
fait un `push --force`.

## Étape 1 — Détecter le parcours et le dépôt

```bash
git remote get-url origin
```

- L'URL contient `opsdesk` → **parcours P3**, branches `etat/j<N>-fin`
  (minuscules), jalons J1..J5.
- L'URL contient `atlas` → **parcours P4**, branches `etat/P4J<N>-fin`,
  jalons P4J1..P4J5.
- Ambigu → demande : « P3 (OpsDesk) ou P4 (Atlas) ? ».

Note `owner/repo` depuis l'URL (ex. `alice/opsdesk-seed`).

## Étape 2 — Garde : l'onboarding doit être fait

La plateforme n'évalue un jalon que si le fork est relié (GitHub App installée +
fork enregistré). Ça ne se vérifie pas en local. Demande à l'apprenant :

> « Ouvre ton tableau de bord. Vois-tu ton fork affiché (ex.
>   `fork alice/opsdesk-seed`) et PAS le bloc "Termine ton onboarding" ? »

- Non / bloc "Termine ton onboarding" visible → **STOP**. Rien n'est récupérable
  tant que l'App n'est pas installée. Dirige vers `/onboarding` (installer la
  GitHub App sur le fork, puis enregistrer le fork), puis reprends à l'étape 3.
- Oui → continue.

## Étape 3 — Inventaire des branches de jalon

```bash
git branch -a
git log --oneline -8
```

Repère les branches de jalon (locales `etat/...-fin` ou distantes
`remotes/origin/etat/...-fin`) et le jalon visé par chacune.

Vérifie le nom EXACT (sensible à la casse) :
- P3 : `etat/j1-fin` … `etat/j5-fin` (minuscules).
- P4 : `etat/P4J1-fin` … `etat/P4J5-fin`.

Un nom approchant (`etat/J1-fin`, `jalon-1`, `etat/j1`) ne déclenche RIEN côté
plateforme : c'est la panne silencieuse la plus fréquente.

## Étape 4 — Corriger et re-déclencher (par jalon à rattraper)

### 4a. Branche au bon nom

Mauvais nom → renomme (demande confirmation, ça touche les branches) :

```bash
git branch -m <ancien-nom> etat/j1-fin     # adapte au parcours/jalon
```

Travail seulement sur `main` ou une branche de travail → crée la branche de
jalon depuis le bon commit :

```bash
git switch -c etat/j1-fin
```

### 4b. Pousser

```bash
git push -u origin etat/j1-fin
```

### 4c. Ouvrir (ou retrouver) la PR vers `main`

Avec `gh` si disponible et authentifié :

```bash
gh pr list --head etat/j1-fin --base main --state all
# si aucune PR :
gh pr create --base main --head etat/j1-fin --title "Jalon J1" --body "Soumission jalon J1"
```

Sans `gh` : donne l'URL exacte (remplace owner/repo et la branche), base = `main` :

```
https://github.com/<owner>/<repo>/compare/main...etat/j1-fin?expand=1
```

### 4d. Re-déclencher le webhook (cas : PR ouverte avant l'App)

PR déjà existante mais jamais évaluée → provoque un nouvel événement maintenant
que l'App est en place. Commit vide (non destructif, émet un `synchronize`) :

```bash
git commit --allow-empty -m "chore: re-déclenche l'évaluation du jalon"
git push
```

Alternative sans commit : `gh pr close` puis `gh pr reopen` (émet `reopened`).

## Étape 5 — Vérifier

Demande de rafraîchir le tableau de bord : le jalon doit passer `en attente`
puis, après évaluation, `audité`. Rien après 1–2 min :
- Re-vérifie le nom EXACT de la branche (étape 3).
- Re-vérifie que la base de la PR est `main`.
- Re-vérifie que le fork est relié (étape 2).

Ne force JAMAIS un push sur une branche partagée sans accord explicite.
