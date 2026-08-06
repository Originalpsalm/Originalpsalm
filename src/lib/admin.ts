import "server-only";
import { db } from "./db";
import type { Role, User } from "./types";

// ================================================================= overview

export type Overview = {
  users: number;
  newThisWeek: number;
  premium: number;
  locked: number;
  attempts: number;
  attemptsThisWeek: number;
  groups: number;
  messages: number;
  revenueNaira: number;
  revenueThisMonthNaira: number;
  pendingPayments: number;
};

export function overview(): Overview {
  const one = <T>(sql: string, ...params: unknown[]) => db.prepare(sql).get(...params) as T;

  const users = one<{ n: number }>(`SELECT COUNT(*) AS n FROM users`).n;
  const newThisWeek = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM users WHERE created_at >= datetime('now', '-7 days')`,
  ).n;
  const premium = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM users
      WHERE plan = 'premium' AND plan_expires_at > datetime('now')`,
  ).n;
  const locked = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM users WHERE locked_until > datetime('now')`,
  ).n;
  const attempts = one<{ n: number }>(`SELECT COUNT(*) AS n FROM attempts`).n;
  const attemptsThisWeek = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM attempts WHERE finished_at >= datetime('now', '-7 days')`,
  ).n;
  const groups = one<{ n: number }>(`SELECT COUNT(*) AS n FROM groups`).n;
  const messages = one<{ n: number }>(`SELECT COUNT(*) AS n FROM messages`).n;

  const revenue = one<{ kobo: number }>(
    `SELECT COALESCE(SUM(amount_kobo), 0) AS kobo FROM payments WHERE status = 'success'`,
  ).kobo;
  const revenueMonth = one<{ kobo: number }>(
    `SELECT COALESCE(SUM(amount_kobo), 0) AS kobo FROM payments
      WHERE status = 'success' AND verified_at >= datetime('now', 'start of month')`,
  ).kobo;
  const pendingPayments = one<{ n: number }>(
    `SELECT COUNT(*) AS n FROM payments WHERE status = 'pending'`,
  ).n;

  return {
    users,
    newThisWeek,
    premium,
    locked,
    attempts,
    attemptsThisWeek,
    groups,
    messages,
    revenueNaira: Math.round(revenue / 100),
    revenueThisMonthNaira: Math.round(revenueMonth / 100),
    pendingPayments,
  };
}

/** Sign-ups per day for the last fortnight, for the dashboard sparkline. */
export function signupTrend(days = 14): { day: string; n: number }[] {
  const rows = db
    .prepare(
      `SELECT date(created_at) AS day, COUNT(*) AS n
         FROM users
        WHERE created_at >= datetime('now', ?)
        GROUP BY day`,
    )
    .all(`-${days} days`) as { day: string; n: number }[];

  const byDay = new Map(rows.map((row) => [row.day, row.n]));
  const out: { day: string; n: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.now() - i * 864e5).toISOString().slice(0, 10);
    out.push({ day, n: byDay.get(day) ?? 0 });
  }
  return out;
}

// ==================================================================== users

export type AdminUserRow = {
  id: number;
  name: string;
  username: string;
  email: string;
  school: string | null;
  class_level: string | null;
  plan: string;
  plan_expires_at: string | null;
  locked_until: string | null;
  role: Role;
  avatar_hue: number;
  created_at: string;
  attempts: number;
  active_sessions: number;
};

export type UserFilter = "all" | "premium" | "free" | "locked" | "staff";

export function listUsers(options: {
  query?: string;
  filter?: UserFilter;
  limit?: number;
  offset?: number;
}): { rows: AdminUserRow[]; total: number } {
  const like = `%${(options.query ?? "").trim()}%`;
  const hasQuery = (options.query ?? "").trim().length > 0;

  const clauses: string[] = [];
  if (hasQuery) clauses.push(`(u.name LIKE @like OR u.username LIKE @like OR u.email LIKE @like OR u.school LIKE @like)`);
  switch (options.filter) {
    case "premium":
      clauses.push(`u.plan = 'premium' AND u.plan_expires_at > datetime('now')`);
      break;
    case "free":
      clauses.push(`(u.plan != 'premium' OR u.plan_expires_at <= datetime('now'))`);
      break;
    case "locked":
      clauses.push(`u.locked_until > datetime('now')`);
      break;
    case "staff":
      clauses.push(`u.role IN ('admin', 'owner')`);
      break;
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const total = (
    db.prepare(`SELECT COUNT(*) AS n FROM users u ${where}`).get({ like }) as { n: number }
  ).n;

  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.username, u.email, u.school, u.class_level, u.plan,
              u.plan_expires_at, u.locked_until, u.role, u.avatar_hue, u.created_at,
              (SELECT COUNT(*) FROM attempts a WHERE a.user_id = u.id) AS attempts,
              (SELECT COUNT(*) FROM sessions s
                WHERE s.user_id = u.id AND s.revoked_at IS NULL) AS active_sessions
         FROM users u
         ${where}
        ORDER BY u.created_at DESC
        LIMIT @limit OFFSET @offset`,
    )
    .all({ like, limit: options.limit ?? 25, offset: options.offset ?? 0 }) as AdminUserRow[];

  return { rows, total };
}

export function adminUserById(id: number): User | undefined {
  return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id) as User | undefined;
}

/** Everything the support screen for one student needs, in one place. */
export function userDossier(id: number) {
  const devices = db
    .prepare(
      `SELECT device_id, label, first_seen, last_seen
         FROM known_devices WHERE user_id = ?
        ORDER BY last_seen DESC`,
    )
    .all(id) as { device_id: string; label: string; first_seen: string; last_seen: string }[];

  const sessions = db
    .prepare(
      `SELECT id, device_label, ip, created_at, last_seen_at, revoked_at, revoked_by
         FROM sessions WHERE user_id = ?
        ORDER BY created_at DESC LIMIT 15`,
    )
    .all(id) as {
    id: string;
    device_label: string;
    ip: string | null;
    created_at: string;
    last_seen_at: string;
    revoked_at: string | null;
    revoked_by: string | null;
  }[];

  const payments = db
    .prepare(
      `SELECT id, reference, amount_kobo, status, months, created_at, verified_at
         FROM payments WHERE user_id = ? ORDER BY id DESC LIMIT 15`,
    )
    .all(id) as {
    id: number;
    reference: string;
    amount_kobo: number;
    status: string;
    months: number;
    created_at: string;
    verified_at: string | null;
  }[];

  const attempts = db
    .prepare(
      `SELECT id, exam_body, subject, year, score, total, finished_at
         FROM attempts WHERE user_id = ? ORDER BY id DESC LIMIT 10`,
    )
    .all(id) as {
    id: number;
    exam_body: string;
    subject: string;
    year: number;
    score: number;
    total: number;
    finished_at: string;
  }[];

  const groups = db
    .prepare(
      `SELECT g.id, g.name, m.role
         FROM group_members m JOIN groups g ON g.id = m.group_id
        WHERE m.user_id = ?`,
    )
    .all(id) as { id: number; name: string; role: string }[];

  return { devices, sessions, payments, attempts, groups };
}

// =================================================================== groups

export type AdminGroupRow = {
  id: number;
  name: string;
  description: string | null;
  invite_code: string;
  is_private: number;
  created_at: string;
  owner_name: string;
  owner_id: number;
  member_count: number;
  message_count: number;
};

export function listGroups(query = ""): AdminGroupRow[] {
  const trimmed = query.trim();
  const where = trimmed ? `WHERE g.name LIKE @like OR g.invite_code LIKE @like` : "";
  return db
    .prepare(
      `SELECT g.id, g.name, g.description, g.invite_code, g.is_private, g.created_at,
              g.owner_id,
              (SELECT name FROM users WHERE id = g.owner_id) AS owner_name,
              (SELECT COUNT(*) FROM group_members m WHERE m.group_id = g.id) AS member_count,
              (SELECT COUNT(*) FROM messages ms WHERE ms.group_id = g.id) AS message_count
         FROM groups g
         ${where}
        ORDER BY g.created_at DESC
        LIMIT 100`,
    )
    .all({ like: `%${trimmed}%` }) as AdminGroupRow[];
}

/** The newest messages across every group — the moderation queue. */
export function recentMessages(limit = 60) {
  return db
    .prepare(
      `SELECT m.id, m.body, m.created_at, m.group_id,
              g.name AS group_name,
              u.id AS author_id, u.name AS author_name, u.username AS author_username,
              u.avatar_hue
         FROM messages m
         JOIN groups g ON g.id = m.group_id
         JOIN users u ON u.id = m.user_id
        ORDER BY m.id DESC
        LIMIT ?`,
    )
    .all(limit) as {
    id: number;
    body: string;
    created_at: string;
    group_id: number;
    group_name: string;
    author_id: number;
    author_name: string;
    author_username: string;
    avatar_hue: number;
  }[];
}

// ================================================================= payments

export function listPayments(status = "all", limit = 100) {
  const where = status === "all" ? "" : "WHERE p.status = @status";
  return db
    .prepare(
      `SELECT p.id, p.reference, p.amount_kobo, p.status, p.months, p.provider,
              p.created_at, p.verified_at,
              u.id AS user_id, u.name AS user_name, u.email AS user_email
         FROM payments p
         JOIN users u ON u.id = p.user_id
         ${where}
        ORDER BY p.id DESC
        LIMIT @limit`,
    )
    .all({ status, limit }) as {
    id: number;
    reference: string;
    amount_kobo: number;
    status: string;
    months: number;
    provider: string;
    created_at: string;
    verified_at: string | null;
    user_id: number;
    user_name: string;
    user_email: string;
  }[];
}

// ================================================================ audit log

export function recordAction(input: {
  actorId: number;
  action: string;
  targetType: string;
  targetId?: string | number | null;
  targetLabel?: string | null;
  detail?: string | null;
}) {
  db.prepare(
    `INSERT INTO admin_actions (actor_id, action, target_type, target_id, target_label, detail)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    input.actorId,
    input.action,
    input.targetType,
    input.targetId == null ? null : String(input.targetId),
    input.targetLabel ?? null,
    input.detail ?? null,
  );
}

export function listActions(limit = 100) {
  return db
    .prepare(
      `SELECT a.*, u.name AS actor_name, u.username AS actor_username, u.avatar_hue
         FROM admin_actions a
         JOIN users u ON u.id = a.actor_id
        ORDER BY a.id DESC
        LIMIT ?`,
    )
    .all(limit) as {
    id: number;
    actor_id: number;
    action: string;
    target_type: string;
    target_id: string | null;
    target_label: string | null;
    detail: string | null;
    created_at: string;
    actor_name: string;
    actor_username: string;
    avatar_hue: number;
  }[];
}

// ================================================================== content

export function contentBreakdown() {
  return db
    .prepare(
      `SELECT exam_body, subject, year, COUNT(*) AS total,
              SUM(CASE WHEN is_premium = 0 THEN 1 ELSE 0 END) AS free,
              (SELECT COUNT(*) FROM attempts a
                WHERE a.exam_body = q.exam_body AND a.subject = q.subject
                  AND a.year = q.year) AS attempts
         FROM questions q
        GROUP BY exam_body, subject, year
        ORDER BY attempts DESC, exam_body, subject, year DESC`,
    )
    .all() as {
    exam_body: string;
    subject: string;
    year: number;
    total: number;
    free: number;
    attempts: number;
  }[];
}
