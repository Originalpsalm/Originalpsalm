import "server-only";
import { db } from "./db";
import type {
  Attempt,
  ExamBody,
  Group,
  GroupWithMeta,
  Message,
  PublicUser,
  Question,
} from "./types";

// ============================================================= past questions

export type PaperSummary = {
  exam_body: ExamBody;
  subject: string;
  year: number;
  total: number;
  free_count: number;
};

export function subjectsFor(body: ExamBody): { subject: string; papers: number; total: number }[] {
  return db
    .prepare(
      `SELECT subject,
              COUNT(DISTINCT year) AS papers,
              COUNT(*)             AS total
         FROM questions
        WHERE exam_body = ?
        GROUP BY subject
        ORDER BY subject`,
    )
    .all(body) as { subject: string; papers: number; total: number }[];
}

export function papersFor(body: ExamBody, subject: string): PaperSummary[] {
  return db
    .prepare(
      `SELECT exam_body, subject, year,
              COUNT(*)                                AS total,
              SUM(CASE WHEN is_premium = 0 THEN 1 ELSE 0 END) AS free_count
         FROM questions
        WHERE exam_body = ? AND subject = ?
        GROUP BY exam_body, subject, year
        ORDER BY year DESC`,
    )
    .all(body, subject) as PaperSummary[];
}

export function allPapers(): PaperSummary[] {
  return db
    .prepare(
      `SELECT exam_body, subject, year,
              COUNT(*)                                AS total,
              SUM(CASE WHEN is_premium = 0 THEN 1 ELSE 0 END) AS free_count
         FROM questions
        GROUP BY exam_body, subject, year
        ORDER BY exam_body, subject, year DESC`,
    )
    .all() as PaperSummary[];
}

export function questionsFor(body: ExamBody, subject: string, year: number): Question[] {
  return db
    .prepare(
      `SELECT * FROM questions
        WHERE exam_body = ? AND subject = ? AND year = ?
        ORDER BY number`,
    )
    .all(body, subject, year) as Question[];
}

export function questionsByIds(ids: number[]): Question[] {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  return db
    .prepare(`SELECT * FROM questions WHERE id IN (${placeholders})`)
    .all(...ids) as Question[];
}

export function libraryStats() {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS questions,
              COUNT(DISTINCT subject) AS subjects,
              COUNT(DISTINCT exam_body || subject || year) AS papers
         FROM questions`,
    )
    .get() as { questions: number; subjects: number; papers: number };
  return row;
}

// =================================================================== attempts

export function recordAttempt(input: {
  userId: number;
  body: ExamBody;
  subject: string;
  year: number;
  total: number;
  score: number;
  seconds: number;
  answers: { questionId: number; chosen: string | null; correct: boolean }[];
}): number {
  const save = db.transaction(() => {
    const result = db
      .prepare(
        `INSERT INTO attempts (user_id, exam_body, subject, year, total, score, seconds_spent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        input.userId,
        input.body,
        input.subject,
        input.year,
        input.total,
        input.score,
        input.seconds,
      );
    const attemptId = Number(result.lastInsertRowid);
    const insert = db.prepare(
      `INSERT INTO attempt_answers (attempt_id, question_id, chosen, correct)
       VALUES (?, ?, ?, ?)`,
    );
    for (const answer of input.answers) {
      insert.run(attemptId, answer.questionId, answer.chosen, answer.correct ? 1 : 0);
    }
    return attemptId;
  });
  return save();
}

export function attemptsFor(userId: number, limit = 10): Attempt[] {
  return db
    .prepare(`SELECT * FROM attempts WHERE user_id = ? ORDER BY id DESC LIMIT ?`)
    .all(userId, limit) as Attempt[];
}

export function attemptById(attemptId: number, userId: number): Attempt | undefined {
  return db
    .prepare(`SELECT * FROM attempts WHERE id = ? AND user_id = ?`)
    .get(attemptId, userId) as Attempt | undefined;
}

export type ReviewRow = Question & { chosen: string | null; correct: number };

export function attemptReview(attemptId: number): ReviewRow[] {
  return db
    .prepare(
      `SELECT q.*, a.chosen, a.correct
         FROM attempt_answers a
         JOIN questions q ON q.id = a.question_id
        WHERE a.attempt_id = ?
        ORDER BY q.number`,
    )
    .all(attemptId) as ReviewRow[];
}

export function userStats(userId: number) {
  const totals = db
    .prepare(
      `SELECT COUNT(*)               AS attempts,
              COALESCE(SUM(score), 0) AS correct,
              COALESCE(SUM(total), 0) AS answered,
              COALESCE(SUM(seconds_spent), 0) AS seconds
         FROM attempts WHERE user_id = ?`,
    )
    .get(userId) as { attempts: number; correct: number; answered: number; seconds: number };

  const bySubject = db
    .prepare(
      `SELECT subject,
              SUM(score) AS correct,
              SUM(total) AS answered
         FROM attempts
        WHERE user_id = ?
        GROUP BY subject
        ORDER BY answered DESC
        LIMIT 6`,
    )
    .all(userId) as { subject: string; correct: number; answered: number }[];

  const accuracy = totals.answered ? Math.round((totals.correct / totals.answered) * 100) : 0;
  return { ...totals, accuracy, bySubject };
}

/** Consecutive days (ending today or yesterday) with at least one attempt. */
export function studyStreak(userId: number): number {
  const days = db
    .prepare(
      `SELECT DISTINCT date(finished_at) AS day
         FROM attempts WHERE user_id = ?
        ORDER BY day DESC LIMIT 60`,
    )
    .all(userId) as { day: string }[];
  if (days.length === 0) return 0;

  const today = new Date();
  const asDay = (d: Date) => d.toISOString().slice(0, 10);
  const yesterday = new Date(today.getTime() - 864e5);
  if (days[0].day !== asDay(today) && days[0].day !== asDay(yesterday)) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const previous = new Date(days[i - 1].day + "T00:00:00Z").getTime();
    const current = new Date(days[i].day + "T00:00:00Z").getTime();
    if (previous - current === 864e5) streak++;
    else break;
  }
  return streak;
}

// ===================================================================== social

export function searchStudents(query: string, viewerId: number, limit = 20): PublicUser[] {
  const like = `%${query.trim()}%`;
  return db
    .prepare(
      `SELECT id, name, username, school, class_level, avatar_hue
         FROM users
        WHERE id != ?
          AND (name LIKE ? OR username LIKE ? OR school LIKE ?)
        ORDER BY name
        LIMIT ?`,
    )
    .all(viewerId, like, like, like, limit) as PublicUser[];
}

export function suggestedStudents(viewerId: number, limit = 12): PublicUser[] {
  return db
    .prepare(
      `SELECT u.id, u.name, u.username, u.school, u.class_level, u.avatar_hue
         FROM users u
        WHERE u.id != ?
          AND NOT EXISTS (
            SELECT 1 FROM friendships f
             WHERE (f.requester_id = u.id AND f.addressee_id = ?)
                OR (f.addressee_id = u.id AND f.requester_id = ?)
          )
        ORDER BY u.created_at DESC
        LIMIT ?`,
    )
    .all(viewerId, viewerId, viewerId, limit) as PublicUser[];
}

export type FriendRow = PublicUser & { friendship_id: number };

export function friendsOf(userId: number): FriendRow[] {
  return db
    .prepare(
      `SELECT f.id AS friendship_id, u.id, u.name, u.username, u.school,
              u.class_level, u.avatar_hue
         FROM friendships f
         JOIN users u ON u.id = CASE WHEN f.requester_id = ? THEN f.addressee_id
                                     ELSE f.requester_id END
        WHERE (f.requester_id = ? OR f.addressee_id = ?)
          AND f.status = 'accepted'
        ORDER BY u.name`,
    )
    .all(userId, userId, userId) as FriendRow[];
}

/** Requests waiting for this user to accept. */
export function incomingRequests(userId: number): FriendRow[] {
  return db
    .prepare(
      `SELECT f.id AS friendship_id, u.id, u.name, u.username, u.school,
              u.class_level, u.avatar_hue
         FROM friendships f
         JOIN users u ON u.id = f.requester_id
        WHERE f.addressee_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC`,
    )
    .all(userId) as FriendRow[];
}

export function outgoingRequests(userId: number): FriendRow[] {
  return db
    .prepare(
      `SELECT f.id AS friendship_id, u.id, u.name, u.username, u.school,
              u.class_level, u.avatar_hue
         FROM friendships f
         JOIN users u ON u.id = f.addressee_id
        WHERE f.requester_id = ? AND f.status = 'pending'
        ORDER BY f.created_at DESC`,
    )
    .all(userId) as FriendRow[];
}

// ===================================================================== groups

export function groupsForUser(userId: number): GroupWithMeta[] {
  return db
    .prepare(
      `SELECT g.*,
              (SELECT COUNT(*) FROM group_members m WHERE m.group_id = g.id) AS member_count,
              1 AS is_member,
              (SELECT name FROM users WHERE id = g.owner_id) AS owner_name
         FROM groups g
         JOIN group_members gm ON gm.group_id = g.id
        WHERE gm.user_id = ?
        ORDER BY g.created_at DESC`,
    )
    .all(userId) as GroupWithMeta[];
}

export function discoverGroups(userId: number, limit = 20): GroupWithMeta[] {
  return db
    .prepare(
      `SELECT g.*,
              (SELECT COUNT(*) FROM group_members m WHERE m.group_id = g.id) AS member_count,
              0 AS is_member,
              (SELECT name FROM users WHERE id = g.owner_id) AS owner_name
         FROM groups g
        WHERE g.is_private = 0
          AND NOT EXISTS (
            SELECT 1 FROM group_members m WHERE m.group_id = g.id AND m.user_id = ?
          )
        ORDER BY member_count DESC, g.created_at DESC
        LIMIT ?`,
    )
    .all(userId, limit) as GroupWithMeta[];
}

export function groupById(groupId: number): Group | undefined {
  return db.prepare(`SELECT * FROM groups WHERE id = ?`).get(groupId) as Group | undefined;
}

export function groupByCode(code: string): Group | undefined {
  return db
    .prepare(`SELECT * FROM groups WHERE invite_code = ?`)
    .get(code.trim().toUpperCase()) as Group | undefined;
}

export function isMember(groupId: number, userId: number): boolean {
  return !!db
    .prepare(`SELECT 1 FROM group_members WHERE group_id = ? AND user_id = ?`)
    .get(groupId, userId);
}

export function groupMembers(groupId: number): (PublicUser & { role: string })[] {
  return db
    .prepare(
      `SELECT u.id, u.name, u.username, u.school, u.class_level, u.avatar_hue, m.role
         FROM group_members m
         JOIN users u ON u.id = m.user_id
        WHERE m.group_id = ?
        ORDER BY CASE m.role WHEN 'owner' THEN 0 ELSE 1 END, u.name`,
    )
    .all(groupId) as (PublicUser & { role: string })[];
}

export function groupMessages(groupId: number, limit = 100): Message[] {
  const rows = db
    .prepare(
      `SELECT m.*, u.name AS author_name, u.username AS author_username,
              u.avatar_hue
         FROM messages m
         JOIN users u ON u.id = m.user_id
        WHERE m.group_id = ?
        ORDER BY m.id DESC
        LIMIT ?`,
    )
    .all(groupId, limit) as Message[];
  return rows.reverse();
}

/** Six characters, no ambiguous 0/O/1/I, so codes are easy to read aloud. */
export function makeInviteCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (let attempt = 0; attempt < 20; attempt++) {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }
    if (!db.prepare(`SELECT 1 FROM groups WHERE invite_code = ?`).get(code)) return code;
  }
  throw new Error("Could not generate a unique invite code.");
}
