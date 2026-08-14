// Single source of truth for the GURU database schema.
// Imported by src/lib/db.ts (the app) and scripts/seed.mjs (the seeder),
// so the two can never drift apart.

export const SCHEMA = `
    -- ============================ ACCOUNTS ============================
    CREATE TABLE IF NOT EXISTS users (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT    NOT NULL,
      username       TEXT    NOT NULL UNIQUE,
      email          TEXT    NOT NULL UNIQUE,
      phone          TEXT,
      password_hash  TEXT    NOT NULL,
      school         TEXT,
      class_level    TEXT,                       -- e.g. 'SS3'
      state          TEXT,
      avatar_hue     INTEGER NOT NULL DEFAULT 150,
      avatar_version INTEGER NOT NULL DEFAULT 0,        -- >0 once a photo is set; also busts the image cache
      email_verified INTEGER NOT NULL DEFAULT 0,        -- 1 once the address is confirmed
      terms_accepted_at TEXT,                           -- when the user agreed to Terms/Privacy
      plan           TEXT    NOT NULL DEFAULT 'free',   -- 'free' | 'premium'
      plan_expires_at TEXT,                      -- ISO timestamp, null on free
      locked_until   TEXT,                       -- set when sharing is detected
      lock_reason    TEXT,
      role           TEXT    NOT NULL DEFAULT 'student', -- 'student'|'admin'|'owner'
      created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- Every action an admin takes on somebody else's account is recorded.
    -- Staff answering support tickets need to be accountable, and when a
    -- student says "I never asked for that", this is the answer.
    CREATE TABLE IF NOT EXISTS admin_actions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      action      TEXT    NOT NULL,
      target_type TEXT    NOT NULL,          -- 'user' | 'group' | 'message' | 'payment'
      target_id   TEXT,
      target_label TEXT,                     -- kept readable after the target is deleted
      detail      TEXT,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_admin_actions ON admin_actions(created_at DESC);

    -- Password resets. Tokens are single-use with a short expiry; a delivered
    -- token is deleted on use, so no live URL survives a successful reset.
    CREATE TABLE IF NOT EXISTS password_resets (
      token       TEXT    PRIMARY KEY,        -- opaque, 32+ bytes
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      expires_at  TEXT    NOT NULL,
      used_at     TEXT,
      delivered   INTEGER NOT NULL DEFAULT 0  -- 0 until an email service handles it
    );
    CREATE INDEX IF NOT EXISTS idx_resets_user ON password_resets(user_id);

    -- Email verification tokens. Same shape as password resets: opaque,
    -- single-use, short-lived. A confirmed token flips users.email_verified.
    CREATE TABLE IF NOT EXISTS email_verifications (
      token       TEXT    PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      expires_at  TEXT    NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_verifs_user ON email_verifications(user_id);

    -- Small key/value store for owner-configurable settings. The logo lives
    -- here as a blob so it survives deploys (it is on the mounted disk with
    -- everything else) and needs no separate file hosting.
    CREATE TABLE IF NOT EXISTS app_settings (
      key         TEXT PRIMARY KEY,
      value       TEXT,
      blob        BLOB,
      mime        TEXT,
      updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    -- Uploaded profile pictures. One row per user, stored as a blob on the same
    -- mounted disk as everything else, so photos survive deploys with no
    -- separate file/image hosting. Kept out of the users row to keep that light.
    CREATE TABLE IF NOT EXISTS user_avatars (
      user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      blob        BLOB    NOT NULL,
      mime        TEXT    NOT NULL,
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    -- A Speed Mode test: the chosen questions (as a JSON id array) and its time
    -- budget. The picked set is stored server-side so the browser never sees the
    -- answers and marking is done against the same questions.
    CREATE TABLE IF NOT EXISTS speed_tests (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      question_ids    TEXT    NOT NULL,          -- JSON array of question ids
      seconds_allowed INTEGER NOT NULL,
      scope_body      TEXT,
      scope_subject   TEXT,
      created_at      TEXT    NOT NULL DEFAULT (datetime('now')),
      attempt_id      INTEGER REFERENCES attempts(id) ON DELETE SET NULL
    );

    -- Every sign-in creates a row. Enforcing "one account = one person" is
    -- done by counting rows here, so we keep revoked ones for the audit trail.
    CREATE TABLE IF NOT EXISTS sessions (
      id            TEXT    PRIMARY KEY,          -- random id, also the JWT 'sid'
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      device_id     TEXT    NOT NULL,             -- stable per browser/device
      device_label  TEXT    NOT NULL,             -- 'Chrome on Android'
      ip            TEXT,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      last_seen_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      revoked_at    TEXT,
      revoked_by    TEXT                          -- 'user' | 'new-login' | 'system'
    );
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id, revoked_at);

    -- Distinct devices seen per account, used for the rolling device cap.
    CREATE TABLE IF NOT EXISTS known_devices (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      device_id   TEXT    NOT NULL,
      label       TEXT    NOT NULL,
      first_seen  TEXT    NOT NULL DEFAULT (datetime('now')),
      last_seen   TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, device_id)
    );

    -- ========================= PAST QUESTIONS =========================
    CREATE TABLE IF NOT EXISTS questions (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      exam_body    TEXT    NOT NULL,              -- 'WAEC' | 'JAMB' | 'NECO' | 'NABTEB'
      subject      TEXT    NOT NULL,
      year         INTEGER NOT NULL,
      number       INTEGER NOT NULL,              -- position within the paper
      text         TEXT    NOT NULL,
      option_a     TEXT    NOT NULL,
      option_b     TEXT    NOT NULL,
      option_c     TEXT    NOT NULL,
      option_d     TEXT    NOT NULL,
      answer       TEXT    NOT NULL,              -- 'A' | 'B' | 'C' | 'D'
      explanation  TEXT,
      topic        TEXT,
      is_premium   INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_questions_paper
      ON questions(exam_body, subject, year, number);

    -- ============================ PRACTICE ============================
    CREATE TABLE IF NOT EXISTS attempts (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      exam_body     TEXT    NOT NULL,
      subject       TEXT    NOT NULL,
      year          INTEGER NOT NULL,
      total         INTEGER NOT NULL,
      score         INTEGER NOT NULL DEFAULT 0,
      seconds_spent INTEGER NOT NULL DEFAULT 0,
      mode          TEXT    NOT NULL DEFAULT 'paper',   -- 'paper' | 'speed'
      finished_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id, finished_at DESC);

    CREATE TABLE IF NOT EXISTS attempt_answers (
      attempt_id   INTEGER NOT NULL REFERENCES attempts(id) ON DELETE CASCADE,
      question_id  INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      chosen       TEXT,                          -- null when skipped
      correct      INTEGER NOT NULL,
      PRIMARY KEY (attempt_id, question_id)
    );

    -- ========================== SOCIAL GRAPH ==========================
    CREATE TABLE IF NOT EXISTS friendships (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      requester_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      addressee_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      status        TEXT    NOT NULL DEFAULT 'pending',  -- 'pending' | 'accepted'
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(requester_id, addressee_id)
    );

    -- =========================== STUDY GROUPS =========================
    CREATE TABLE IF NOT EXISTS groups (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      name         TEXT    NOT NULL,
      description  TEXT,
      exam_body    TEXT,
      subject      TEXT,
      invite_code  TEXT    NOT NULL UNIQUE,
      owner_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      is_private   INTEGER NOT NULL DEFAULT 0,
      created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS group_members (
      group_id   INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role       TEXT    NOT NULL DEFAULT 'member',   -- 'owner' | 'member'
      joined_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (group_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS messages (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id   INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body       TEXT    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_messages_group ON messages(group_id, id);

    -- ============================ PAYMENTS ============================
    CREATE TABLE IF NOT EXISTS payments (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reference     TEXT    NOT NULL UNIQUE,
      amount_kobo   INTEGER NOT NULL,
      provider      TEXT    NOT NULL DEFAULT 'paystack',
      status        TEXT    NOT NULL DEFAULT 'pending',  -- 'pending'|'success'|'failed'
      months        INTEGER NOT NULL DEFAULT 1,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
      verified_at   TEXT
    );
  `;
