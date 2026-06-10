// Schema + validateur du VERDICT de revue de PR (J5).
// Meme reflexe que la classification de ticket (J2) : une sortie de modele n'est
// digne de confiance que si elle est validee contre un schema. Un verdict non
// conforme fait ECHOUER le job ; on ne publie jamais une sortie libre.
//
// Forme attendue :
// {
//   "verdict": "approve" | "request_changes" | "comment",
//   "findings": [ { "severite": "info|attention|bloquant", "fichier": "...", "message": "..." } ],
//   "summary": "resume en francais, 2 phrases max"
// }

export const VERDICTS = ["approve", "request_changes", "comment"];
export const SEVERITES = ["info", "attention", "bloquant"];

/**
 * @param {unknown} input
 * @returns {{ ok: true, value: object } | { ok: false, erreurs: string[] }}
 */
export function validateVerdict(input) {
  const erreurs = [];

  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return { ok: false, erreurs: ["la racine du verdict doit etre un objet"] };
  }

  if (!VERDICTS.includes(input.verdict)) {
    erreurs.push(`verdict invalide: attendu ${VERDICTS.join("|")}`);
  }

  if (!Array.isArray(input.findings)) {
    erreurs.push("findings invalide: tableau attendu");
  } else {
    input.findings.forEach((f, i) => {
      if (typeof f !== "object" || f === null) {
        erreurs.push(`findings[${i}] invalide: objet attendu`);
        return;
      }
      if (!SEVERITES.includes(f.severite)) {
        erreurs.push(`findings[${i}].severite invalide: attendu ${SEVERITES.join("|")}`);
      }
      if (typeof f.fichier !== "string") {
        erreurs.push(`findings[${i}].fichier invalide: chaine attendue`);
      }
      if (typeof f.message !== "string" || f.message.trim() === "") {
        erreurs.push(`findings[${i}].message invalide: chaine non vide attendue`);
      }
    });
  }

  if (typeof input.summary !== "string" || input.summary.trim() === "") {
    erreurs.push("summary invalide: chaine non vide attendue");
  }

  if (erreurs.length > 0) return { ok: false, erreurs };
  return { ok: true, value: input };
}
