import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { DB_PATH } from "./config.js";

// S'assure que le dossier de la base existe (ex: data/).
mkdirSync(dirname(DB_PATH), { recursive: true });

// Connexion SQLite partagee par l'application.
export const db = new Database(DB_PATH);

db.pragma("journal_mode = WAL");

// Schema canonique de la table tickets (anglais).
db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY,
    subject TEXT,
    body TEXT,
    category TEXT,
    priority INTEGER,
    status TEXT,
    created_at TEXT
  );
`);

export type Ticket = {
  id: number;
  subject: string;
  body: string;
  category: string;
  priority: number;
  status: string;
  created_at: string;
};
