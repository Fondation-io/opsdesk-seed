import Database from "better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import { ticketStats } from "../src/stats.js";

// Base SQLite en memoire isolee, peuplee de statuts varies.
function makeDb() {
  const db = new Database(":memory:");
  db.exec(`
    CREATE TABLE tickets (
      id INTEGER PRIMARY KEY,
      subject TEXT,
      body TEXT,
      category TEXT,
      priority INTEGER,
      status TEXT,
      created_at TEXT
    );
  `);
  const insert = db.prepare(`
    INSERT INTO tickets (subject, body, category, priority, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const rows: [string, string][] = [
    ["open", "2026-05-01T10:00:00Z"],
    ["open", "2026-05-02T10:00:00Z"],
    ["open", "2026-05-03T10:00:00Z"],
    ["in_progress", "2026-05-04T10:00:00Z"],
    ["in_progress", "2026-05-05T10:00:00Z"],
    ["closed", "2026-05-06T10:00:00Z"],
  ];
  for (const [status, createdAt] of rows) {
    insert.run("Sujet", "Corps", "autre", 2, status, createdAt);
  }
  return db;
}

describe("ticketStats", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = makeDb();
  });

  it("compte les tickets par statut", () => {
    const stats = ticketStats(db);
    expect(stats).toEqual({ open: 3, in_progress: 2, closed: 1 });
  });

  it("renvoie 0 pour un statut absent en base", () => {
    const empty = new Database(":memory:");
    empty.exec(`
      CREATE TABLE tickets (
        id INTEGER PRIMARY KEY,
        subject TEXT, body TEXT, category TEXT,
        priority INTEGER, status TEXT, created_at TEXT
      );
    `);
    empty
      .prepare(
        "INSERT INTO tickets (subject, body, category, priority, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run("S", "B", "autre", 1, "open", "2026-05-01T10:00:00Z");

    const stats = ticketStats(empty);
    expect(stats).toEqual({ open: 1, in_progress: 0, closed: 0 });
  });

  it("renvoie tout a 0 sur une base vide", () => {
    const empty = new Database(":memory:");
    empty.exec(`
      CREATE TABLE tickets (
        id INTEGER PRIMARY KEY,
        subject TEXT, body TEXT, category TEXT,
        priority INTEGER, status TEXT, created_at TEXT
      );
    `);
    expect(ticketStats(empty)).toEqual({ open: 0, in_progress: 0, closed: 0 });
  });
});
