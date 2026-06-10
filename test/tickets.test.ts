import Database from "better-sqlite3";
import { beforeEach, describe, expect, it } from "vitest";
import { getTicket, listTickets, updateTicketStatus } from "../src/tickets.js";

// Base SQLite en memoire isolee pour les tests.
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
  db.prepare(`
    INSERT INTO tickets (subject, body, category, priority, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    "Cannot log in",
    "Locked out of my account.",
    "acces",
    3,
    "open",
    "2026-05-12T09:14:00Z",
  );
  return db;
}

describe("tickets", () => {
  let db: Database.Database;

  beforeEach(() => {
    db = makeDb();
  });

  it("lists existing tickets", () => {
    const tickets = listTickets(db);
    expect(tickets).toHaveLength(1);
    expect(tickets[0].subject).toBe("Cannot log in");
    expect(tickets[0].status).toBe("open");
  });

  it("gets a ticket by id", () => {
    const ticket = getTicket(1, db);
    expect(ticket).toBeDefined();
    expect(ticket?.category).toBe("acces");
  });

  it("updates a ticket status", () => {
    const ok = updateTicketStatus(1, "closed", db);
    expect(ok).toBe(true);
    expect(getTicket(1, db)?.status).toBe("closed");
  });

  it("returns false when updating an unknown ticket", () => {
    const ok = updateTicketStatus(999, "closed", db);
    expect(ok).toBe(false);
  });
});
