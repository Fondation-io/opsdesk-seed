// Serveur MCP "tickets" pour OpsDesk.
//
// Expose a un agent (client MCP, ex: Claude Code) un GUICHET GOUVERNE sur la
// base SQLite des tickets. On n'offre que TROIS operations intentionnelles :
//   - list_tickets          : lire la liste (filtre optionnel par statut)
//   - get_ticket            : lire un ticket par id (erreur geree si absent)
//   - update_ticket_status  : changer le statut d'un ticket
//
// Garde-fous de conception (cf. J4 §1.2 / §6) :
//   - AUCUN outil generique de type run_query / execute_sql.
//   - Chaque requete est PARAMETREE (jamais de concatenation de chaine).
//   - Les erreurs sont renvoyees comme RESULTATS lisibles, pas comme crashs.
//
// Branchement (depuis la racine du repo) :
//   claude mcp add tickets -- node "$(pwd)/mcp/tickets-server.mjs"
//   claude mcp list   # attendu : tickets ... connected

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Resout data/opsdesk.db relativement a la racine du repo (mcp/ -> ..).
const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.OPSDESK_DB ?? resolve(__dirname, "..", "data", "opsdesk.db");

const db = new Database(DB_PATH, { readonly: false });

// Statuts canoniques du projet (jamais "pending").
const STATUS = ["open", "in_progress", "closed"];

// Requetes preparees une seule fois, toutes parametrees.
const stmtListAll = db.prepare(
  "SELECT id, subject, body, category, priority, status, created_at FROM tickets ORDER BY created_at DESC",
);
const stmtListByStatus = db.prepare(
  "SELECT id, subject, body, category, priority, status, created_at FROM tickets WHERE status = ? ORDER BY created_at DESC",
);
const stmtGet = db.prepare(
  "SELECT id, subject, body, category, priority, status, created_at FROM tickets WHERE id = ?",
);
const stmtUpdateStatus = db.prepare("UPDATE tickets SET status = ? WHERE id = ?");

const server = new McpServer({
  name: "tickets",
  version: "1.0.0",
});

// Petit utilitaire : renvoie un contenu texte JSON (convention MCP).
function jsonResult(payload) {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

// --- Outil 1 : list_tickets -------------------------------------------------
server.registerTool(
  "list_tickets",
  {
    title: "Lister les tickets",
    description:
      "Liste les tickets de support OpsDesk. Filtre optionnel par statut " +
      "(open, in_progress, closed). A utiliser pour consulter ou compter des " +
      "tickets. N'utilise PAS cet outil pour modifier un ticket.",
    inputSchema: {
      status: z
        .enum(["open", "in_progress", "closed"])
        .optional()
        .describe("Statut a filtrer ; omis = tous les tickets."),
    },
  },
  async ({ status }) => {
    const rows = status ? stmtListByStatus.all(status) : stmtListAll.all();
    return jsonResult({ count: rows.length, tickets: rows });
  },
);

// --- Outil 2 : get_ticket ---------------------------------------------------
server.registerTool(
  "get_ticket",
  {
    title: "Recuperer un ticket",
    description:
      "Recupere un ticket OpsDesk par son identifiant numerique. Renvoie un " +
      "resultat d'erreur lisible si le ticket n'existe pas (pas d'exception).",
    inputSchema: {
      id: z.number().int().describe("Identifiant numerique du ticket (ex: 1001)."),
    },
  },
  async ({ id }) => {
    const ticket = stmtGet.get(id);
    if (!ticket) {
      return jsonResult({ erreur: `ticket ${id} introuvable` });
    }
    return jsonResult({ ticket });
  },
);

// --- Outil 3 : update_ticket_status ----------------------------------------
server.registerTool(
  "update_ticket_status",
  {
    title: "Changer le statut d'un ticket",
    description:
      "Met a jour le statut d'un ticket OpsDesk (open, in_progress, closed). " +
      "Operation d'ecriture intentionnelle. Renvoie une erreur lisible si le " +
      "ticket est introuvable ou si le statut est invalide.",
    inputSchema: {
      id: z.number().int().describe("Identifiant du ticket a modifier."),
      status: z
        .enum(["open", "in_progress", "closed"])
        .describe("Nouveau statut a appliquer."),
    },
  },
  async ({ id, status }) => {
    if (!STATUS.includes(status)) {
      return jsonResult({ erreur: `statut invalide : ${status}` });
    }
    const exists = stmtGet.get(id);
    if (!exists) {
      return jsonResult({ erreur: `ticket ${id} introuvable` });
    }
    stmtUpdateStatus.run(status, id);
    return jsonResult({ ok: true, id, status });
  },
);

// Demarrage sur le transport stdio (mode utilise par "claude mcp add").
const transport = new StdioServerTransport();
await server.connect(transport);
