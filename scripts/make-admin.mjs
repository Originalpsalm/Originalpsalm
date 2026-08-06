/**
 * Grants staff access from the command line.
 *
 *   npm run make-owner -- you@example.com     # the founder: full control
 *   npm run make-admin -- helper@example.com  # support staff
 *   npm run make-admin -- helper@example.com --remove
 *
 * There is deliberately no way to create the first owner from inside the app —
 * otherwise anyone who signed up could try. You must have access to the server
 * to run this, which is the point.
 */
import Database from "better-sqlite3";
import path from "node:path";
import { SCHEMA } from "../src/lib/schema.mjs";

const args = process.argv.slice(2);
const email = args.find((arg) => !arg.startsWith("--"));
const remove = args.includes("--remove");
const asOwner = args.includes("--owner");

if (!email) {
  console.error("Usage: npm run make-admin -- <email> [--owner] [--remove]");
  process.exit(1);
}

const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "guru.db");
const db = new Database(file);
db.exec(SCHEMA);

// Older databases predate the role column.
const columns = db.prepare(`PRAGMA table_info(users)`).all().map((c) => c.name);
if (!columns.includes("role")) {
  db.exec(`ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'student'`);
}

const user = db
  .prepare(`SELECT id, name, email, role FROM users WHERE lower(email) = lower(?)`)
  .get(email.trim());

if (!user) {
  console.error(`✗ No account with the email ${email}`);
  console.error("  Create the account in the app first, then run this again.");
  process.exit(1);
}

const role = remove ? "student" : asOwner ? "owner" : "admin";
db.prepare(`UPDATE users SET role = ? WHERE id = ?`).run(role, user.id);

console.log(`✓ ${user.name} <${user.email}> is now: ${role}`);
if (role !== "student") {
  console.log("  Sign out and back in, then look for Admin in the menu.");
}
db.close();
