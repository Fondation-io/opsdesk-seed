// Schema canonique de classification d'un ticket OpsDesk.
// Defini en J2, reutilise tel quel en J4/J5 comme contrat partage entre agents.
//
// Discipline (cf. J2 §1.2) : le SCHEMA est la source de verite, pas le prompt.
// Le prompt *demande* du JSON ; ce validateur *garantit* la conformite.
// Toute sortie non conforme est REJETEE, jamais rafistolee a la main.
//
// Volontairement SANS nouvelle dependance : validateur maison (pas de zod).
// La seule dependance reste l'ecosysteme deja present (TS/Node + Vitest).

/** Les 5 categories metier fermees. Toute autre valeur est invalide. */
export const CATEGORIES = [
  "acces",
  "facturation",
  "bug",
  "demande",
  "autre",
] as const;

export type Categorie = (typeof CATEGORIES)[number];

/**
 * Sortie structuree d'une classification de ticket.
 * - categorie     : une des 5 valeurs de CATEGORIES.
 * - priorite      : entier 1..3 (1 = basse, 2 = moyenne, 3 = haute).
 * - besoin_humain : true si l'information est insuffisante / cas sensible.
 * - confiance     : nombre dans [0, 1] (introduit J2, reutilise J4/J5).
 * - justification : chaine 1..280 caracteres expliquant la decision.
 */
export interface Classification {
  categorie: Categorie;
  priorite: 1 | 2 | 3;
  besoin_humain: boolean;
  confiance: number;
  justification: string;
}

/** Resultat d'une validation : succes + valeur typee, ou liste d'erreurs. */
export type ValidationResult =
  | { ok: true; value: Classification; errors: [] }
  | { ok: false; value: null; errors: string[] };

const JUSTIFICATION_MAX = 280;

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null && !Array.isArray(x);
}

/**
 * Valide une valeur quelconque contre le schema de classification.
 * Ne fait JAMAIS confiance a l'entree : chaque champ est verifie un a un.
 * Retourne { ok, value, errors } ; n'emet aucune exception.
 */
export function validateClassification(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(input)) {
    return { ok: false, value: null, errors: ["la sortie n'est pas un objet JSON"] };
  }

  // Aucune cle parasite toleree : on borne le contrat.
  const cles = Object.keys(input);
  const attendues = ["categorie", "priorite", "besoin_humain", "confiance", "justification"];
  for (const cle of cles) {
    if (!attendues.includes(cle)) {
      errors.push(`cle inattendue: "${cle}"`);
    }
  }

  // categorie
  const categorie = input.categorie;
  if (typeof categorie !== "string") {
    errors.push("categorie manquante ou non textuelle");
  } else if (!(CATEGORIES as readonly string[]).includes(categorie)) {
    errors.push(`categorie hors enumeration: "${categorie}"`);
  }

  // priorite : entier 1..3
  const priorite = input.priorite;
  if (typeof priorite !== "number" || !Number.isInteger(priorite)) {
    errors.push("priorite manquante ou non entiere");
  } else if (priorite < 1 || priorite > 3) {
    errors.push(`priorite hors plage 1..3: ${priorite}`);
  }

  // besoin_humain : boolean strict
  if (typeof input.besoin_humain !== "boolean") {
    errors.push("besoin_humain manquant ou non booleen");
  }

  // confiance : nombre fini dans [0, 1]
  const confiance = input.confiance;
  if (typeof confiance !== "number" || Number.isNaN(confiance) || !Number.isFinite(confiance)) {
    errors.push("confiance manquante ou non numerique");
  } else if (confiance < 0 || confiance > 1) {
    errors.push(`confiance hors plage 0..1: ${confiance}`);
  }

  // justification : chaine 1..280
  const justification = input.justification;
  if (typeof justification !== "string") {
    errors.push("justification manquante ou non textuelle");
  } else if (justification.length < 1 || justification.length > JUSTIFICATION_MAX) {
    errors.push(`justification doit faire 1..${JUSTIFICATION_MAX} caracteres`);
  }

  if (errors.length > 0) {
    return { ok: false, value: null, errors };
  }

  // A ce stade tous les champs sont valides : cast sur le type concret.
  return { ok: true, value: input as unknown as Classification, errors: [] };
}
