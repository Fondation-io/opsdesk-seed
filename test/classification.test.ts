import { describe, expect, it } from "vitest";
import { parseClassification } from "../src/classification/classify.js";
import { validateClassification } from "../src/classification/schema.js";

describe("validateClassification", () => {
  it("accepte une classification conforme", () => {
    const valide = {
      categorie: "acces",
      priorite: 3,
      besoin_humain: false,
      confiance: 0.9,
      justification: "Blocage de connexion (403), impact direct utilisateur.",
    };
    const res = validateClassification(valide);
    expect(res.ok).toBe(true);
    expect(res.errors).toEqual([]);
    if (res.ok) {
      expect(res.value.categorie).toBe("acces");
      expect(res.value.priorite).toBe(3);
    }
  });

  it("rejette une categorie hors enumeration", () => {
    const res = validateClassification({
      categorie: "urgence", // hors {acces,facturation,bug,demande,autre}
      priorite: 2,
      besoin_humain: false,
      confiance: 0.5,
      justification: "categorie inventee",
    });
    expect(res.ok).toBe(false);
    expect(res.errors.some((e) => e.includes("categorie hors enumeration"))).toBe(true);
  });

  it("rejette une priorite hors plage 1..3", () => {
    const res = validateClassification({
      categorie: "bug",
      priorite: 5, // hors plage
      besoin_humain: false,
      confiance: 0.5,
      justification: "priorite invalide",
    });
    expect(res.ok).toBe(false);
    expect(res.errors.some((e) => e.includes("priorite hors plage"))).toBe(true);
  });
});

describe("parseClassification", () => {
  it("parse et valide une sortie JSON conforme (meme enrobee de texte)", () => {
    const raw =
      'Voici la classification:\n{"categorie":"facturation","priorite":2,"besoin_humain":true,"confiance":0.7,"justification":"Double facturation a verifier manuellement."}\nMerci.';
    const c = parseClassification(raw);
    expect(c.categorie).toBe("facturation");
    expect(c.besoin_humain).toBe(true);
  });

  it("rejette une sortie a categorie hors enum (leve une erreur)", () => {
    const raw =
      '{"categorie":"inconnue","priorite":2,"besoin_humain":false,"confiance":0.5,"justification":"x"}';
    expect(() => parseClassification(raw)).toThrowError(/rejetee/);
  });

  it("rejette une priorite=5 (leve une erreur)", () => {
    const raw =
      '{"categorie":"bug","priorite":5,"besoin_humain":false,"confiance":0.5,"justification":"x"}';
    expect(() => parseClassification(raw)).toThrowError(/priorite hors plage/);
  });

  it("rejette une sortie sans JSON exploitable", () => {
    expect(() => parseClassification("aucun json ici")).toThrowError(/aucun objet JSON/);
  });
});
