#!/usr/bin/env node
// scripts/publier-verdict.mjs
//
// Valide le verdict (schema J5) PUIS publie/affiche un commentaire de PR.
// Idempotence (reflexe J3) : on cherche un commentaire portant le marqueur
// cache <!-- opsdesk-revue-agent -->. S'il existe, on l'EDITE ; sinon on le cree.
// Une relance du job ne duplique donc pas le commentaire.
//
// Observabilite (reflexe J3) : on ecrit aussi un resume dans $GITHUB_STEP_SUMMARY
// (verdict + nb de findings).
//
// Usage : node scripts/publier-verdict.mjs <chemin-verdict.json>
//
// Hors CI (pas de GH_TOKEN / PR_NUMBER) : on affiche le commentaire sur stdout
// (plan B local, cf. demo plan B `act`/headless). Aucun secret en clair.

import { readFileSync, appendFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { validateVerdict } from "./verdict-schema.mjs";

const MARQUEUR = "<!-- opsdesk-revue-agent -->";

function gh(args, opts = {}) {
  const res = spawnSync("gh", args, { encoding: "utf8", ...opts });
  if (res.status !== 0) {
    throw new Error(`gh ${args.join(" ")} a echoue: ${res.stderr ?? res.stdout ?? ""}`);
  }
  return res.stdout;
}

function rendreCommentaire(verdict) {
  const lignes = [];
  lignes.push(MARQUEUR);
  lignes.push("## Revue agentique OpsDesk");
  lignes.push("");
  lignes.push(`**Verdict** : \`${verdict.verdict}\``);
  lignes.push("");
  lignes.push(verdict.summary);
  if (verdict.findings.length > 0) {
    lignes.push("");
    lignes.push("| Severite | Fichier | Message |");
    lignes.push("|----------|---------|---------|");
    for (const f of verdict.findings) {
      const msg = f.message.replace(/\|/g, "\\|");
      lignes.push(`| ${f.severite} | \`${f.fichier}\` | ${msg} |`);
    }
  } else {
    lignes.push("");
    lignes.push("_Aucun point releve._");
  }
  lignes.push("");
  lignes.push("> Avis consultatif. Le merge reste conditionne a une approbation humaine.");
  return lignes.join("\n");
}

function ecrireJobSummary(verdict) {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (!path) return;
  const resume =
    `### Revue agentique\n` +
    `- verdict : \`${verdict.verdict}\`\n` +
    `- findings : ${verdict.findings.length}\n`;
  try {
    appendFileSync(path, resume + "\n");
  } catch {
    // l'observabilite ne doit pas faire echouer la publication
  }
}

function trouverCommentaireExistant(repo, prNumber) {
  // Liste les commentaires de la PR et cherche le marqueur cache.
  const out = gh([
    "api",
    `repos/${repo}/issues/${prNumber}/comments`,
    "--jq",
    `[.[] | select(.body | contains("${MARQUEUR}")) | .id] | first`,
  ]);
  const id = out.trim();
  return id && id !== "null" ? id : null;
}

function publier(verdict) {
  const body = rendreCommentaire(verdict);
  const prNumber = process.env.PR_NUMBER;
  const repo = process.env.GITHUB_REPOSITORY;
  const enCi = process.env.GH_TOKEN && prNumber && repo;

  if (!enCi) {
    // Plan B local : on affiche, on ne poste pas.
    process.stdout.write(body + "\n");
    return;
  }

  const existant = trouverCommentaireExistant(repo, prNumber);
  if (existant) {
    // Upsert : on edite le commentaire existant (PATCH) -> pas de doublon.
    gh([
      "api",
      "--method",
      "PATCH",
      `repos/${repo}/issues/comments/${existant}`,
      "-f",
      `body=${body}`,
    ]);
    console.error(`[publier-verdict] commentaire ${existant} mis a jour`);
  } else {
    gh(["pr", "comment", prNumber, "--body", body]);
    console.error("[publier-verdict] commentaire cree");
  }
}

function main() {
  const path = process.argv[2];
  if (!path) {
    console.error("[publier-verdict] usage: node scripts/publier-verdict.mjs <verdict.json>");
    process.exit(2);
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"));
  } catch (e) {
    console.error(`[publier-verdict] JSON illisible: ${e.message}`);
    process.exit(1);
  }

  // Garde-fou : on ne publie JAMAIS une sortie non conforme au schema.
  const v = validateVerdict(parsed);
  if (!v.ok) {
    console.error(`[publier-verdict] verdict non conforme:\n - ${v.erreurs.join("\n - ")}`);
    process.exit(1);
  }

  ecrireJobSummary(v.value);
  publier(v.value);
}

main();
