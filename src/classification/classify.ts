// Prompt de classification (les 6 composants) + parseur strict de la sortie.
//
// Le prompt vit aussi en clair dans prompts/classification.md (specification
// versionnee) et en slash-command .claude/commands/classer-ticket.md.
// Ici, CLASSIFY_PROMPT est la version executable cote code : meme contenu,
// source unique de verite pour les appels programmatiques (Lab J2.5 / CLI).

import {
  Classification,
  validateClassification,
} from "./schema.js";

/**
 * Prompt robuste de classification d'un ticket OpsDesk.
 * Structure imposee par la checklist des 6 composants (J2 §1.1) :
 *   1. Role  2. Contexte  3. Tache  4. Contraintes  5. Exemples  6. Format.
 * Le placeholder {{TICKET}} est remplace par le texte du ticket a classer.
 */
export const CLASSIFY_PROMPT = `# 1. ROLE
Tu es un agent de triage du support OpsDesk. Tu es prudent, factuel, et tu ne
sur-interpretes jamais une demande. En cas de doute, tu escalades a un humain.

# 2. CONTEXTE
OpsDesk est un outil interne de ticketing. Chaque ticket a un sujet et un corps
ecrits par un utilisateur, parfois vagues ou emotionnels. Les categories metier
fermees sont : acces, facturation, bug, demande, autre. La priorite est un entier
de 1 (basse) a 3 (haute). Le schema de sortie fait foi : src/classification/schema.ts.

# 3. TACHE
Classe le ticket fourni : determine sa categorie, sa priorite, s'il requiert une
intervention humaine, ton niveau de confiance et une courte justification.

# 4. CONTRAINTES & GARDE-FOUS
- Choisis la categorie UNIQUEMENT dans l'enumeration fermee ci-dessus.
- Si l'information est insuffisante ou ambigue : mets besoin_humain a true,
  baisse confiance, et n'INVENTE PAS de categorie (prends "autre" au besoin).
- priorite est un ENTIER entre 1 et 3, jamais 0 ni 5.
- confiance est un nombre entre 0 et 1.
- justification : une phrase, 280 caracteres maximum.
- Ne renvoie AUCUN texte hors du JSON (pas de phrase d'intro, pas de Markdown).

# 5. EXEMPLES (few-shot)
Entree: "Je n'arrive plus a me connecter, erreur 403 depuis la mise a jour."
Sortie: {"categorie":"acces","priorite":3,"besoin_humain":false,"confiance":0.9,"justification":"Blocage de connexion (403) lie a une mise a jour, impact direct utilisateur."}

Entree: "Bonjour, juste pour dire que l'interface est jolie :)"
Sortie: {"categorie":"autre","priorite":1,"besoin_humain":false,"confiance":0.8,"justification":"Message de remerciement sans demande actionnable."}

# 6. FORMAT DE SORTIE
Reponds par un UNIQUE objet JSON, sans texte autour, avec exactement ces cles :
{
  "categorie": "acces|facturation|bug|demande|autre",
  "priorite": 1,
  "besoin_humain": false,
  "confiance": 0.0,
  "justification": "..."
}

# TICKET A CLASSER
{{TICKET}}
`;

/** Injecte le texte du ticket dans le prompt versionne. */
export function buildClassifyPrompt(ticket: string): string {
  return CLASSIFY_PROMPT.replace("{{TICKET}}", ticket);
}

/**
 * Parse la sortie brute d'un modele et la valide contre le schema.
 *
 * - Tolere un eventuel texte parasite autour du JSON : on extrait le premier
 *   objet { ... } equilibre, rien de plus.
 * - REJETTE (leve une erreur explicite) toute sortie non conforme : JSON
 *   illisible, cle manquante, valeur hors enum, etc. On ne rafistole jamais.
 */
export function parseClassification(raw: string): Classification {
  const json = extractFirstJsonObject(raw);
  if (json === null) {
    throw new Error("classification rejetee: aucun objet JSON trouve dans la sortie");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new Error("classification rejetee: JSON invalide");
  }

  const result = validateClassification(parsed);
  if (!result.ok) {
    throw new Error(
      `classification rejetee: ${result.errors.join("; ")}`,
    );
  }
  return result.value;
}

/**
 * Extrait la premiere accolade equilibree d'une chaine.
 * Renvoie la sous-chaine JSON ou null si aucun objet complet n'est trouve.
 * Tient compte des chaines et de l'echappement pour ne pas compter les
 * accolades a l'interieur des valeurs textuelles.
 */
function extractFirstJsonObject(raw: string): string | null {
  const start = raw.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < raw.length; i++) {
    const ch = raw[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) {
        return raw.slice(start, i + 1);
      }
    }
  }

  return null;
}
