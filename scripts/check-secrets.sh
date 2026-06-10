#!/usr/bin/env bash
# check-secrets.sh — garde-fou DETERMINISTE de pre-commit pour OpsDesk.
#
# Scanne le diff actuellement en STAGE a la recherche de secrets en clair et de
# violations de convention. Sort en code != 0 (avec message sur stderr) si un
# motif est detecte, 0 sinon.
#
# Principe (J2 §1.4 / §6) : la barriere est regex/scan, PAS un jugement de modele.
# Le modele assiste ; le hook decide. Branche en hook PreToolUse via
# .claude/settings.json sur les commandes `git commit`.
#
# Note : le secret factice du seed (src/config.ts, motif opsdesk_live_) est
# VOLONTAIREMENT laisse en place pour donner du sens au hook. On le neutralise
# par le hook, on ne le supprime pas.

set -euo pipefail

# Diff des fichiers indexes, en ne gardant que les lignes ajoutees (prefixe '+').
# --no-color pour un scan stable ; -U0 pour limiter au contexte modifie.
added="$(git diff --cached --no-color -U0 2>/dev/null | grep -E '^\+' | grep -vE '^\+\+\+' || true)"

if [[ -z "${added}" ]]; then
  exit 0
fi

# Motifs de secret a bloquer (ajoutes seulement). Insensible a la casse quand utile.
patterns=(
  'opsdesk_live_[A-Za-z0-9]+'                 # cle API OpsDesk en clair
  'AKIA[0-9A-Z]{16}'                          # AWS access key id
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'        # cle privee PEM
  '(password|passwd|secret|token|api_?key)[[:space:]]*[:=][[:space:]]*["'"'"']?[A-Za-z0-9/_+.-]{12,}'  # affectation de secret longue
  '[A-Za-z0-9_-]{40,}'                        # chaine opaque tres longue (cle generique)
)

found=0
for pat in "${patterns[@]}"; do
  matches="$(printf '%s\n' "${added}" | grep -E -i "${pat}" || true)"
  if [[ -n "${matches}" ]]; then
    if [[ "${found}" -eq 0 ]]; then
      echo "BLOQUE: secret potentiel detecte dans les changements en stage." >&2
      echo "        (detection deterministe — corrige avant de committer)" >&2
      found=1
    fi
    echo "  motif: ${pat}" >&2
    # On n'affiche pas la valeur complete du secret, seulement un apercu masque.
    printf '%s\n' "${matches}" | sed -E 's/[A-Za-z0-9]{6}([A-Za-z0-9_-]{4,})/******\1/g' | head -n 3 >&2
  fi
done

# Convention OpsDesk : interdiction de committer un *.env (sauf *.env.example).
staged_files="$(git diff --cached --name-only 2>/dev/null || true)"
env_files="$(printf '%s\n' "${staged_files}" | grep -E '(^|/)\.?env($|\.)' | grep -vE '\.env\.example$' || true)"
if [[ -n "${env_files}" ]]; then
  echo "BLOQUE: fichier d'environnement en stage (seul *.env.example est autorise):" >&2
  printf '  %s\n' "${env_files}" >&2
  found=1
fi

if [[ "${found}" -ne 0 ]]; then
  exit 1
fi

exit 0
