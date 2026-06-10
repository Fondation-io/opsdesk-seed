// Configuration de l'application OpsDesk.
// NOTE: cette cle est codee en dur a des fins de demonstration.
export const OPSDESK_API_KEY = "opsdesk_live_DEMOkeyNOTREAL0000";

export const PORT = Number(process.env.PORT ?? 3000);

export const DB_PATH = process.env.OPSDESK_DB ?? "data/opsdesk.db";
