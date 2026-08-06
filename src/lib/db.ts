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
  addMissingColumns(database);
  return database;
}

/**
 * CREATE TABLE IF NOT EXISTS does nothing to a table that already exists, so
 * columns added after a database was first created need applying separately.
 * Each entry is safe to run repeatedly.
 */
function addMissingColumns(database: Database.Database) {
  const additions: { table: string; column: string; definition: string }[] = [
    { table: "users", column: "role", definition: "TEXT NOT NULL DEFAULT 'student'" },
  ];

  for (const { table, column, definition } of additions) {
    const columns = database.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
    if (columns.some((entry) => entry.name === column)) continue;

    try {
      database.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    } catch (error) {
      // Next.js builds and serves from several worker processes at once, so
      // two of them can pass the check above before either one commits. The
      // column existing is the outcome we wanted either way.
      if (!(error instanceof Error) || !/duplicate column name/i.test(error.message)) {
        throw error;
      }
    }
  }
}

export const db: Database.Database = globalForDb.guruDb ?? open();
if (process.env.NODE_ENV !== "production") globalForDb.guruDb = db;
