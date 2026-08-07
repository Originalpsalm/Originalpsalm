/**
 * Makes sure the app has the one secret it cannot start without.
 *
 * `.env.local` is deliberately not in version control — it holds secrets — so
 * a fresh clone has no AUTH_SECRET and every sign-in would fail with an opaque
 * server error. This runs ahead of `dev`, `start` and `seed` and writes a
 * strong random secret the first time, so the app works out of the box.
 *
 * It never overwrites an existing secret: doing so would invalidate every
 * signed-in session on the next restart.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const ENV_FILE = path.join(process.cwd(), ".env.local");

// On a hosting platform the secret comes from the dashboard, not a file.
// Writing one there would mint a new secret on every deploy and sign everybody
// out, so leave well alone.
if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32) {
  process.exit(0);
}

const secret = crypto.randomBytes(48).toString("hex");

if (!fs.existsSync(ENV_FILE)) {
  fs.writeFileSync(
    ENV_FILE,
    `# Created automatically on first run. Keep this file private —
# it is already excluded from version control.

# Signs the cookies that keep students logged in.
AUTH_SECRET=${secret}

# Where the database file lives.
DATABASE_PATH=./data/guru.db

# Price of GURU Premium, in naira, per month.
PREMIUM_PRICE_NAIRA=2000

# Anti account-sharing limits.
MAX_CONCURRENT_SESSIONS=1
MAX_DEVICES_PER_WINDOW=3
DEVICE_WINDOW_DAYS=30

# Paystack. Leave blank to run payments in test mode (nobody is charged).
PAYSTACK_SECRET_KEY=
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=

# Email delivery for password-reset links. Leave RESEND_API_KEY blank and
# reset links appear in the admin's "Password resets" tab for you to send by
# hand — students are never blocked. Add a key to switch to automatic delivery.
# Get a key at https://resend.com (free tier available).
RESEND_API_KEY=
EMAIL_FROM=

NEXT_PUBLIC_APP_URL=http://localhost:3000
`,
    { mode: 0o600 },
  );
  console.log("✓ Created .env.local with a fresh AUTH_SECRET");
  process.exit(0);
}

// The file exists — top it up only if the secret is missing or a placeholder.
const current = fs.readFileSync(ENV_FILE, "utf8");
const match = current.match(/^AUTH_SECRET=(.*)$/m);
const value = match?.[1]?.trim() ?? "";

if (value.length >= 32) process.exit(0);

const updated = match
  ? current.replace(/^AUTH_SECRET=.*$/m, `AUTH_SECRET=${secret}`)
  : current.trimEnd() + `\n\nAUTH_SECRET=${secret}\n`;

fs.writeFileSync(ENV_FILE, updated, { mode: 0o600 });
console.log("✓ Added a valid AUTH_SECRET to .env.local");
