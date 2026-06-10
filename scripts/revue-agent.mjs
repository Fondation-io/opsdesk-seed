#!/usr/bin/env node
// scripts/revue-agent.mjs
//
// Lit le diff d'une PR, invoque l'agent de revue en mode HEADLESS (non
// interactif) et ecrit sur stdout un VERDICT JSON conforme au schema J5.
//
// Decision HYBRIDE du parcours : la PRODUCTION tourne sur Claude Code (stable).
// pi.dev n'entre PAS dans le pipeline (cf. ADR-001 / etude OpenClaw magistrale).
//
// Usage : node scripts/revue-agent.mjs <chemin-du-diff>
//
// SECRET : la cle vit dans process.env.ANTHROPIC_API_KEY, injectee depuis les
// "Actions secrets" du depot. Jamais en clair dans ce fichier ni dans le YAML.

import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { validateVerdict } from "./verdict-schema.mjs";

const PROMPT_PATH = ".github/agent/revue-pr.md";

function lire(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    console.error(`[revue-agent] lecture impossible: ${path} (${e.message})`);
    process.exit(2);
  }
}

function extraireJson(texte) {
  // L'agent doit repondre par un seul objet JSON. On tolere un eventuel bloc
  // ```json ... ``` mais on echoue si rien d'exploitable n'est trouve.
  const sansFences = texte.replace(/```(?:json)?/gi, "").trim();
  const debut = sansFences.indexOf("{");
  const fin = sansFences.lastIndexOf("}");
  if (debut === -1 || fin === -1 || fin < debut) {
    throw new Error("aucun objet JSON trouve dans la reponse de l'agent");
  }
  return JSON.parse(sansFences.slice(debut, fin + 1));
}

function main() {
  const diffPath = process.argv[2];
  if (!diffPath) {
    console.error("[revue-agent] usage: node scripts/revue-agent.mjs <chemin-du-diff>");
    process.exit(2);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("[revue-agent] ANTHROPIC_API_KEY absente (a configurer en Actions secrets)");
    process.exit(2);
  }

  const prompt = lire(PROMPT_PATH);
  const diff = lire(diffPath);

  // Court-circuit (reflexe cout borne, Lab J5.2) : un diff vide n'a rien a revoir.
  if (diff.trim() === "") {
    const verdict = {
      verdict: "comment",
      findings: [],
      summary: "Diff vide : aucune revue necessaire.",
    };
    process.stdout.write(JSON.stringify(verdict));
    return;
  }

  // Message complet passe a l'agent : prompt versionne + diff de la PR.
  const message = `${prompt}\n\n--- DIFF DE LA PR ---\n${diff}`;

  // ---------------------------------------------------------------------------
  // APPEL MODELE (placeholder documente).
  //
  // En prod, on invoque Claude Code en mode headless. La commande/le drapeau
  // non-interactif exact depend de la version installee : verifier `claude --help`
  // avant de pousser. Schema d'invocation attendu :
  //
  //   const res = spawnSync("claude", ["-p", message, "--output-format", "json"], {
  //     encoding: "utf8",
  //     env: process.env,               // ANTHROPIC_API_KEY herite ici
  //     maxBuffer: 10 * 1024 * 1024,
  //   });
  //
  // Variante : l'Agent SDK TS (@anthropic-ai/claude-agent-sdk) appele depuis ce
  // script. On garde l'interface "texte en entree -> texte JSON en sortie".
  //
  // Pour rester executable hors-ligne (tests/CI sans reseau) et NE JAMAIS coller
  // de secret, on lit la sortie depuis une commande pilotee par variable
  // d'environnement OPSDESK_AGENT_CMD si fournie ; sinon on echoue proprement.
  // ---------------------------------------------------------------------------
  const cmd = process.env.OPSDESK_AGENT_CMD;
  let brut;
  if (cmd) {
    const res = spawnSync(cmd, { shell: true, input: message, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
    if (res.status !== 0) {
      console.error(`[revue-agent] l'agent a echoue (code ${res.status}): ${res.stderr ?? ""}`);
      process.exit(1);
    }
    brut = res.stdout;
  } else {
    console.error(
      "[revue-agent] aucune commande agent configuree (OPSDESK_AGENT_CMD). " +
        "En CI, brancher l'invocation headless Claude Code ci-dessus."
    );
    process.exit(2);
  }

  let verdict;
  try {
    verdict = extraireJson(brut);
  } catch (e) {
    console.error(`[revue-agent] reponse non exploitable: ${e.message}`);
    process.exit(1);
  }

  // On valide AVANT d'emettre : un verdict non conforme ne doit pas remonter.
  const v = validateVerdict(verdict);
  if (!v.ok) {
    console.error(`[revue-agent] verdict non conforme au schema:\n - ${v.erreurs.join("\n - ")}`);
    process.exit(1);
  }

  process.stdout.write(JSON.stringify(v.value));
}

main();
