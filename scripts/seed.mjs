/**
 * Loads the past-question bank into the database.
 *
 *   npm run seed        # questions + demo accounts, for local use
 *   npm run reset-db    # wipe the file and start over
 *
 * Flags:
 *   --demo        also create the demo students, group and friendships
 *   --if-empty    do nothing if questions are already loaded
 *
 * `start` runs this with --if-empty and WITHOUT --demo, so a freshly deployed
 * server fills its empty disk with questions on first boot and never puts
 * publicly-known demo logins on a live site.
 */
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { SCHEMA } from "../src/lib/schema.mjs";
import { waec } from "../src/data/papers/waec.mjs";
import { jamb } from "../src/data/papers/jamb.mjs";
import { neco } from "../src/data/papers/neco.mjs";


const withDemo = process.argv.includes("--demo");
const onlyIfEmpty = process.argv.includes("--if-empty");

const file = process.env.DATABASE_PATH || path.join(process.cwd(), "data", "guru.db");
fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });

const db = new Database(file);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
db.exec(SCHEMA);

if (onlyIfEmpty) {
  const { n } = db.prepare(`SELECT COUNT(*) AS n FROM questions`).get();
  if (n > 0) {
    console.log(`✓ ${n} questions already loaded — nothing to do`);
    db.close();
    process.exit(0);
  }
}

// ------------------------------------------------------------ questions

const papers = [...waec, ...jamb, ...neco];

const clearPaper = db.prepare(
  `DELETE FROM questions WHERE exam_body = ? AND subject = ? AND year = ?`,
);
const insertQuestion = db.prepare(`
  INSERT INTO questions
    (exam_body, subject, year, number, text, option_a, option_b, option_c,
     option_d, answer, explanation, topic, is_premium)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let count = 0;
const seedQuestions = db.transaction(() => {
  for (const paper of papers) {
    // Re-seeding replaces a paper wholesale rather than duplicating it.
    clearPaper.run(paper.body, paper.subject, paper.year);
    paper.questions.forEach((question, index) => {
      const number = index + 1;
      insertQuestion.run(
        paper.body,
        paper.subject,
        paper.year,
        number,
        question.q,
        question.a,
        question.b,
        question.c,
        question.d,
        question.ans,
        question.why ?? null,
        question.topic ?? null,
        0, // gating is year-based now; is_premium is unused
      );
      count++;
    });
  }
});
seedQuestions();

console.log(`✓ ${count} questions across ${papers.length} papers`);

// Demo logins are published in the README, so they must never exist on a
// server real students can reach.
if (!withDemo) {
  console.log("✓ skipping demo accounts (pass --demo to create them locally)");
  console.log(`✓ database at ${path.resolve(file)}`);
  db.close();
  process.exit(0);
}

// ---------------------------------------------------------- demo accounts

const demoUsers = [
  {
    name: "Amaka Obi",
    username: "amaka",
    email: "amaka@guru.ng",
    school: "Queens College, Lagos",
    class_level: "SS3",
    state: "Lagos",
    hue: 150,
    plan: "premium",
  },
  {
    name: "Tunde Bakare",
    username: "tunde",
    email: "tunde@guru.ng",
    school: "Government College, Ibadan",
    class_level: "SS3",
    state: "Oyo",
    hue: 35,
    plan: "free",
  },
  {
    name: "Fatima Yusuf",
    username: "fatima",
    email: "fatima@guru.ng",
    school: "Federal Govt. College, Kano",
    class_level: "SS2",
    state: "Kano",
    hue: 265,
    plan: "free",
  },
];

const password = bcrypt.hashSync("guru1234", 10);
const insertUser = db.prepare(`
  INSERT INTO users (name, username, email, password_hash, school, class_level,
                     state, avatar_hue, plan, plan_expires_at)
  VALUES (@name, @username, @email, @password_hash, @school, @class_level,
          @state, @avatar_hue, @plan, @plan_expires_at)
  ON CONFLICT(email) DO NOTHING
`);

for (const user of demoUsers) {
  insertUser.run({
    name: user.name,
    username: user.username,
    email: user.email,
    password_hash: password,
    school: user.school,
    class_level: user.class_level,
    state: user.state,
    avatar_hue: user.hue,
    plan: user.plan,
    plan_expires_at:
      user.plan === "premium"
        ? new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 19).replace("T", " ")
        : null,
  });
}

const amaka = db.prepare(`SELECT id FROM users WHERE username = 'amaka'`).get();
const tunde = db.prepare(`SELECT id FROM users WHERE username = 'tunde'`).get();
const fatima = db.prepare(`SELECT id FROM users WHERE username = 'fatima'`).get();

// ------------------------------------------------------------ demo group

if (amaka && tunde && fatima) {
  const existing = db.prepare(`SELECT id FROM groups WHERE invite_code = 'GURU01'`).get();
  if (!existing) {
    const group = db
      .prepare(
        `INSERT INTO groups (name, description, exam_body, subject, invite_code, owner_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        "SS3 WAEC Maths Squad",
        "We solve 10 past questions every evening by 7pm. No dulling.",
        "WAEC",
        "Mathematics",
        "GURU01",
        amaka.id,
      );

    const addMember = db.prepare(
      `INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, ?)`,
    );
    addMember.run(group.lastInsertRowid, amaka.id, "owner");
    addMember.run(group.lastInsertRowid, tunde.id, "member");
    addMember.run(group.lastInsertRowid, fatima.id, "member");

    const addMessage = db.prepare(
      `INSERT INTO messages (group_id, user_id, body) VALUES (?, ?, ?)`,
    );
    addMessage.run(group.lastInsertRowid, amaka.id, "Welcome guys 🎉 Let's start with WAEC 2023 Maths tonight.");
    addMessage.run(group.lastInsertRowid, tunde.id, "I'm in. That standard form question finished me last time 😩");
    addMessage.run(group.lastInsertRowid, fatima.id, "Same here. Can we do indices too?");
    addMessage.run(group.lastInsertRowid, amaka.id, "Noted. Indices and surds after the main set.");
  }

  db.prepare(
    `INSERT INTO friendships (requester_id, addressee_id, status)
     VALUES (?, ?, 'accepted') ON CONFLICT DO NOTHING`,
  ).run(amaka.id, tunde.id);
  db.prepare(
    `INSERT INTO friendships (requester_id, addressee_id, status)
     VALUES (?, ?, 'pending') ON CONFLICT DO NOTHING`,
  ).run(fatima.id, tunde.id);
}

console.log(`✓ demo accounts ready — sign in with amaka@guru.ng / guru1234`);
console.log(`✓ database at ${path.resolve(file)}`);
db.close();
