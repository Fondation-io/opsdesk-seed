import { describe, it, expect, beforeEach } from "vitest";
import Database from "better-sqlite3";

/**
 * J3 — Reprise après échec & idempotence.
 *
 * Démontre le pattern de fiabilité du jour : une opération de classification en lot
 * (écrire `category` sur les tickets non classés) doit être IDEMPOTENTE.
 *  - On n'écrit QUE si `category IS NULL` (garde anti-doublon).
 *  - Rejouer l'opération ne modifie aucune ligne déjà traitée (0 écriture).
 *  - Après une interruption (crash simulé), la reprise traite uniquement le reste,
 *    sans reclasser ni dupliquer.
 *
 * Base en mémoire (pas d'effet de bord disque), conforme aux conventions OpsDesk :
 * table `tickets`, ids 1001.., status ∈ {open,in_progress,closed},
 * category ∈ {acces,facturation,bug,demande,autre}.
 */

type Db = InstanceType<typeof Database>;

function createTestDb(): Db {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE tickets (
      id INTEGER PRIMARY KEY,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      category TEXT,
      priority INTEGER NOT NULL,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);
  const insert = db.prepare(
    `INSERT INTO tickets (id, subject, body, category, priority, status, created_at)
     VALUES (@id, @subject, @body, @category, @priority, @status, @created_at)`
  );
  // 4 tickets non classés (category NULL) + 1 déjà classé (ne doit jamais bouger).
  const rows = [
    { id: 1001, subject: "Connexion impossible", body: "blocage acces", category: null, priority: 2, status: "open", created_at: "2026-06-01" },
    { id: 1002, subject: "Facture en double", body: "doublon", category: null, priority: 2, status: "open", created_at: "2026-06-01" },
    { id: 1003, subject: "Page 500", body: "erreur serveur", category: null, priority: 3, status: "open", created_at: "2026-06-01" },
    { id: 1004, subject: "Ajout de champ", body: "evolution", category: null, priority: 1, status: "open", created_at: "2026-06-01" },
    { id: 1005, subject: "Deja traite", body: "rien", category: "autre", priority: 1, status: "closed", created_at: "2026-06-01" },
  ];
  const tx = db.transaction(() => rows.forEach((r) => insert.run(r)));
  tx();
  return db;
}

/** Classification déterministe (stub) — l'idempotence ne dépend pas du classifieur. */
function classify(subject: string): string {
  const s = subject.toLowerCase();
  if (s.includes("connexion")) return "acces";
  if (s.includes("facture")) return "facturation";
  if (s.includes("500") || s.includes("erreur")) return "bug";
  if (s.includes("ajout") || s.includes("champ")) return "demande";
  return "autre";
}

/**
 * Classe en lot les tickets non classés.
 * - Idempotent : `WHERE category IS NULL` côté UPDATE → ne réécrit jamais un classé.
 * - `failAt` : si fourni, lève après avoir traité ce nombre de tickets (crash simulé).
 * Retourne le nombre de lignes RÉELLEMENT écrites.
 */
function classifyBatch(db: Db, opts: { failAt?: number } = {}): number {
  const pending = db
    .prepare(`SELECT id, subject FROM tickets WHERE category IS NULL ORDER BY id`)
    .all() as Array<{ id: number; subject: string }>;
  const update = db.prepare(
    `UPDATE tickets SET category = @category WHERE id = @id AND category IS NULL`
  );
  let written = 0;
  for (const t of pending) {
    if (opts.failAt !== undefined && written >= opts.failAt) {
      throw new Error("crash simulé (OPSDESK_FAIL_AT)");
    }
    const res = update.run({ id: t.id, category: classify(t.subject) });
    written += res.changes; // changes = 1 seulement si la ligne était encore NULL
  }
  return written;
}

const countUnclassified = (db: Db): number =>
  (db.prepare(`SELECT count(*) AS n FROM tickets WHERE category IS NULL`).get() as { n: number }).n;

describe("J3 — idempotence & reprise après échec (classify-batch)", () => {
  let db: Db;
  beforeEach(() => {
    db = createTestDb();
  });

  it("1re passe classe tous les tickets non classés", () => {
    expect(countUnclassified(db)).toBe(4);
    const written = classifyBatch(db);
    expect(written).toBe(4);
    expect(countUnclassified(db)).toBe(0);
  });

  it("rejouer l'opération n'écrit rien (idempotence)", () => {
    classifyBatch(db); // 1re passe
    const before = db.prepare(`SELECT id, category FROM tickets ORDER BY id`).all();

    const written = classifyBatch(db); // 2e passe
    expect(written).toBe(0); // aucune ligne modifiée

    const after = db.prepare(`SELECT id, category FROM tickets ORDER BY id`).all();
    expect(after).toEqual(before); // résultat strictement identique
  });

  it("ne reclasse jamais un ticket déjà classé (ticket 1005)", () => {
    classifyBatch(db);
    classifyBatch(db);
    const t = db.prepare(`SELECT category FROM tickets WHERE id = 1005`).get() as { category: string };
    expect(t.category).toBe("autre"); // valeur d'origine préservée
  });

  it("reprend après un crash sans dupliquer ni reclasser", () => {
    // Crash après 2 tickets traités.
    expect(() => classifyBatch(db, { failAt: 2 })).toThrow(/crash simulé/);
    expect(countUnclassified(db)).toBe(2); // 2 traités, 2 restants

    // Reprise : ne touche que les 2 restants.
    const written = classifyBatch(db);
    expect(written).toBe(2);
    expect(countUnclassified(db)).toBe(0);
  });
});
