import type BetterSqlite3 from "better-sqlite3";
import { db as defaultDb } from "./db.js";

type DB = BetterSqlite3.Database;

// Decompte des tickets par statut canonique du projet.
export type TicketStats = {
  open: number;
  in_progress: number;
  closed: number;
};

// Renvoie le nombre de tickets pour chacun des trois statuts.
// Les statuts absents en base sont comptes a 0 (jamais undefined).
export function ticketStats(database: DB = defaultDb): TicketStats {
  const rows = database
    .prepare("SELECT status, COUNT(*) AS n FROM tickets GROUP BY status")
    .all() as { status: string; n: number }[];

  const stats: TicketStats = { open: 0, in_progress: 0, closed: 0 };
  for (const row of rows) {
    if (row.status in stats) {
      stats[row.status as keyof TicketStats] = row.n;
    }
  }
  return stats;
}
