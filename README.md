# GURU

Past questions, worked answers and study groups for Nigerian secondary school
students preparing for **WAEC**, **JAMB** and **NECO**.

A "guru" is someone sharp — the app is built to make one out of every student
who uses it. It runs in the browser on any phone, and installs to the home
screen as a PWA.

---

## What is in it

**Past questions.** 140 questions across 14 papers (WAEC, JAMB and NECO;
Mathematics, English, Physics, Chemistry, Biology, Economics and Government).
Every question carries the **working**, not just the correct letter — that is
the part that actually teaches.

**A real CBT experience.** Timed papers (72 seconds per question, JAMB pacing),
a question map, flag-for-review, keyboard shortcuts (`A`–`D`, arrow keys), and
auto-submit when the clock runs out.

**Marking you cannot cheat.** The browser is never sent the correct answers.
Papers are marked on the server against the database, so the answer key is not
in the page source.

**Study groups.** Create a group, get a 6-letter invite code, and your
classmates are in. Each group has a live chat. Groups can be public (listed for
anyone to join) or private (code only).

**Friends.** Search classmates by name, username or school; send and accept
requests.

**Progress that means something.** Day streak, accuracy, per-subject bars, and
after each paper a list of the **topics you actually lost marks on**.

**Premium — ₦2,000/month.** Free accounts get the first 5 questions of every
paper. Premium opens everything. Paystack handles the money (card, transfer,
USSD); 3-month and 6-month plans are discounted.

**One account, one student.** See below — this is a core feature, not a
footnote.

---

## Stopping account sharing

The single biggest threat to a ₦2,000 price is one login being passed around a
whole class. Three mechanisms handle it, and they are visible to the student on
the account page rather than hidden:

1. **One device signed in at a time.** (`MAX_CONCURRENT_SESSIONS`, default 1.)
   A second sign-in is *refused*, not silently allowed. The student is shown
   which device already holds the account and can choose "sign out that device
   and continue here" — which immediately kicks the first device out.

2. **A rolling device cap.** (`MAX_DEVICES_PER_WINDOW`, default 3 devices per
   30 days.) Signing in on your own phone twice costs nothing — a device is
   remembered by a long-lived cookie. But one person does not study on six
   different phones, so exceeding the cap locks the account for 24 hours with a
   clear explanation.

3. **Full visibility.** Every active session is listed on the account page with
   its device and sign-in time, plus a "sign out everywhere else" button — so a
   student who *has* been shared with can take their account back.

All three limits are environment variables. Loosen them to 2 concurrent devices
if you decide phone-plus-laptop is worth supporting.

---

## Running it

```bash
npm install
cp .env.example .env.local     # then set AUTH_SECRET (see below)
npm run seed                   # loads the question bank + demo accounts
npm run dev                    # http://localhost:3000
```

Generate a real `AUTH_SECRET` — the app refuses to start in production without
one:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

**Demo accounts** (created by the seed, password `guru1234` for all three):

| Email | Plan |
| --- | --- |
| `amaka@guru.ng` | Premium |
| `tunde@guru.ng` | Free |
| `fatima@guru.ng` | Free |

Remember the one-device rule when testing: to sign in as a second student, use
a private window, or sign the first one out.

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run seed` | Load/refresh questions and demo data |
| `npm run reset-db` | Delete the database and reseed from scratch |
| `npm run make-owner -- <email>` | Make an account the founder |
| `npm run make-admin -- <email>` | Grant (or `--remove`) staff access |
| `npm run typecheck` | TypeScript only, no emit |

---

## Admin and founder panel

Running this product needs a support desk, and the device rules guarantee
tickets: a student who legitimately changes phone gets locked out by design.

Make yourself the founder — sign up in the app first, then:

```bash
npm run make-owner -- you@example.com
```

Sign out and back in, and **Admin** appears in the menu. There is deliberately
no way to grant yourself access from inside the app; you need server access to
run that command, which is the point.

`/admin` covers:

- **Overview** — what needs attention first (unconfirmed payments, locked
  accounts), then sign-ups, revenue and usage.
- **Students** — search and filter, then a per-student support screen: every
  device the account has used with first/last seen, sign-in history, payments,
  papers and groups. Grant or remove premium, **unlock an account and reset its
  device history**, sign every device out, suspend with a reason the student is
  shown, or delete.
- **Payments** — approve a payment by hand for the "my bank debited me" ticket.
  Approving forces a note explaining why.
- **Groups / Moderation** — the newest messages across every group, so bullying,
  malpractice offers and spam surface early.
- **Content** — every paper ordered by how often it is attempted.
- **Activity log** — every staff action, and who took it.

### Roles

| Role | Can |
| --- | --- |
| `owner` | Everything, including promoting and demoting admins |
| `admin` | Act on students: premium, unlock, suspend, delete, moderate |
| `student` | Nothing — `/admin` returns 404, so it does not advertise itself |

Admins cannot act on the owner, on another admin, or on themselves. Permissions
are enforced inside each server action, not just hidden in the UI, so typing a
URL gets you nowhere. Every action is appended to a log that the app cannot edit.

---

## Payments

With **no** `PAYSTACK_SECRET_KEY` set, the app runs in **mock billing mode**:
the entire subscription journey works end to end — plan choice, checkout,
reference, callback, unlock, payment history — against a local simulator, and
no money moves. This is the default so the app is fully testable before you have
a Paystack account.

To take real payments, add to `.env.local`:

```
PAYSTACK_SECRET_KEY=sk_live_or_test_xxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_or_test_xxx
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

Nothing else changes. Payments are always verified by calling Paystack's
`/transaction/verify` endpoint server-side, and the **amount is checked against
the stored record** — hitting the callback URL by hand cannot award a
subscription.

---

## How it is built

| | |
| --- | --- |
| Framework | Next.js 15 (App Router, React 19, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, tokens in `src/app/globals.css` |
| Database | SQLite via `better-sqlite3` |
| Auth | Custom sessions — bcrypt + signed JWT in an httpOnly cookie |
| Payments | Paystack, with a mock provider for local use |
| Icons | lucide-react |

### Layout

```
src/
  app/
    (auth)/            login, signup
    (app)/             everything behind a session
      dashboard/       home — streak, accuracy, groups, weak subjects
      practice/        exam body → subject → year → the quiz itself
      results/[id]/    score, worked answers, weak topics
      groups/          list, create, join by code, chat
      friends/         search, requests
      premium/         plans, checkout, verify, mock checkout
      account/         profile, password, devices & sessions
    api/groups/[id]/messages/   chat poll + post
  actions/             server actions (auth, practice, groups, friends, billing)
  components/          shared UI, app shell, logo
  data/papers/         the question bank (waec.mjs, jamb.mjs, neco.mjs)
  lib/                 db, schema, auth, queries, billing, types
scripts/seed.mjs       seeding
```

### Adding questions

Question papers are plain data. Open `src/data/papers/waec.mjs` (or `jamb.mjs` /
`neco.mjs`), add a paper object, and run `npm run seed` — re-seeding replaces a
paper wholesale rather than duplicating it.

```js
{
  body: "WAEC",
  subject: "Further Mathematics",
  year: 2024,
  questions: [
    {
      q: "…the question…",
      a: "option A", b: "option B", c: "option C", d: "option D",
      ans: "C",
      why: "…how the answer is reached…",
      topic: "Matrices",
    },
  ],
}
```

Questions after the fifth in each paper are marked premium automatically
(`FREE_QUESTIONS_PER_PAPER` in `scripts/seed.mjs`).

---

## Deploying

The app keeps everything in one SQLite file, so it needs a host that offers a
**persistent disk** — Railway, Render or Fly. A platform without one wipes every
student account on each deploy.

Set these in the host's dashboard:

| Variable | Value |
| --- | --- |
| `AUTH_SECRET` | 48+ random bytes as hex. `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `DATABASE_PATH` | A path on the mounted disk, e.g. `/data/guru.db` |
| `NEXT_PUBLIC_APP_URL` | The public URL, used for the Paystack callback |

Nothing else is needed. `npm start` runs `setup-env` then seeds the question
bank **only if the database is empty**, so a fresh server fills itself on first
boot and restarts are a no-op. Demo accounts are never created on a server —
they require the explicit `--demo` flag that only `npm run seed` passes.

Back up the database file on a schedule. It is the whole product: every account,
score, group and payment record lives in it.

---

## Notes before going live

- **The database is SQLite**, which is ideal for one server and a few thousand
  students. Past that, move to Postgres — the queries are plain SQL in
  `src/lib/queries.ts` and the schema is in `src/lib/schema.mjs`.
- **Chat polls every 5 seconds.** Deliberate: it works on bad connections and
  deploys anywhere. Swap for websockets when group sizes justify it.
- **No password reset yet.** It needs an email provider; wire one up before
  real students depend on it.
- **The question bank is a starting set**, written to be correct and to
  demonstrate every subject shape. Expand it before launch.
