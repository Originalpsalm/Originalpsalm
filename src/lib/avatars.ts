import "server-only";
import { db } from "./db";

/**
 * Profile pictures. Stored as blobs in `user_avatars` on the same persistent
 * disk as everything else, so photos survive deploys with no separate image
 * host. `users.avatar_version` is bumped on every change so cached <img> URLs
 * (which carry ?v=version) refresh, and so a photo's existence can be known
 * without touching this table.
 */

export const AVATAR_MAX_BYTES = 1_000_000; // 1 MB — plenty for a square photo
export const AVATAR_ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

export function getAvatarBlob(userId: number): { blob: Buffer; mime: string } | null {
  const row = db
    .prepare(`SELECT blob, mime FROM user_avatars WHERE user_id = ?`)
    .get(userId) as { blob: Buffer; mime: string } | undefined;
  if (!row?.blob) return null;
  return { blob: row.blob, mime: row.mime };
}

/** Stores (or replaces) the photo and returns the new avatar_version. */
export function setAvatar(userId: number, blob: Buffer, mime: string): number {
  const save = db.transaction(() => {
    db.prepare(
      `INSERT INTO user_avatars (user_id, blob, mime, updated_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(user_id) DO UPDATE SET blob = excluded.blob, mime = excluded.mime,
         updated_at = datetime('now')`,
    ).run(userId, blob, mime);
    db.prepare(`UPDATE users SET avatar_version = avatar_version + 1 WHERE id = ?`).run(userId);
    return (
      db.prepare(`SELECT avatar_version FROM users WHERE id = ?`).get(userId) as {
        avatar_version: number;
      }
    ).avatar_version;
  });
  return save();
}

/** Removes the photo and bumps the version so classmates stop seeing it. */
export function clearAvatar(userId: number): void {
  const remove = db.transaction(() => {
    db.prepare(`DELETE FROM user_avatars WHERE user_id = ?`).run(userId);
    db.prepare(`UPDATE users SET avatar_version = avatar_version + 1 WHERE id = ?`).run(userId);
  });
  remove();
}
