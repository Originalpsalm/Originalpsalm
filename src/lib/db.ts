import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA } from "./schema.mjs";

/**
 * A single shared SQLite connection.
 *
 * Next.js hot-reloads modules in dev, which would otherwise open a new file
 * handle on every edit, so the connection is cached on globalThis.
 */
const globalForDb = globalThis as unknown as { guruDb?: Database.Database };

function open(): Database.Database {
  const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "guru.db");
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });

  const database = new Database(file);
  database.pragma("journal_mode = WAL");
  database.pragma("foreign_keys = ON");
  // The schema uses IF NOT EXISTS throughout, so running it on every boot is
  // safe and means a fresh clone works without a separate migration step.
  database.exec(SCHEMA);
  return database;
}

export const db: Database.Database = globalForDb.guruDb ?? open();
if (process.env.NODE_ENV !== "production") globalForDb.guruDb = db;
