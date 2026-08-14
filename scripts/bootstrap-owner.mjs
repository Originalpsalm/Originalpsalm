/**
 * Promotes the founder to owner automatically on boot, using an environment
 * variable — so you never need a server shell to get admin access back.
 *
 * Set OWNER_EMAIL (Railway → Variables) to the email of the account you signed
 * up with. On every start, if an account with that email exists and is not
 * already the owner, it is promoted. This is idempotent and safe to leave on:
 * it does nothing if the account is missing or already an owner, and it means
 * a database reset can never permanently lock you out — just make sure you
 * sign up again with the same email and the next deploy restores your access.
 *
 * Only someone who can set Railway variables can use this, which is the same
 * trust boundary as having server access, so it does not weaken security.
 */
import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/lib/schema.mjs";

const email = (process.env.OWNER_EMAIL || "").trim();
if (!email) {
  // Nothing configured — normal for local dev. Stay silent and let boot proceed.
  process.exit(0);
}

const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "guru.db");

try {
  const db = new Database(file);
  db.exec(SCHEMA);

  const columns = db.prepare(`PRAGMA table_info(users)`).all().map((c) => c.name);
  if (!columns.includes("role")) {
    db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student'`);
  }

  const user = db
    .prepare(`SELECT id, name, email, role FROM users WHERE lower(email) = lower(?)`)
    .get(email);

  if (!user) {
    console.log(`[bootstrap-owner] No account for OWNER_EMAIL=${email} yet — skipping.`);
  } else if (user.role === "owner") {
    console.log(`[bootstrap-owner] ${user.email} is already the owner.`);
  } else {
    db.prepare(`UPDATE users SET role = 'owner' WHERE id = ?`).run(user.id);
    console.log(`[bootstrap-owner] Promoted ${user.email} to owner.`);
  }

  db.close();
} catch (error) {
  // A bootstrap hiccup must never stop the app from starting.
  console.error("[bootstrap-owner] Skipped due to error:", error?.message ?? error);
}

process.exit(0);
