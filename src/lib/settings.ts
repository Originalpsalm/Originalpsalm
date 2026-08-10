import "server-only";
import { db } from "./db";

/**
 * Owner-configurable branding, kept in the database so it lives on the same
 * persistent disk as everything else and survives deploys. The logo is stored
 * as a blob and served from /api/brand/logo.
 */

export type LogoInfo = { mime: string; updated_at: string } | null;

export function getLogoInfo(): LogoInfo {
  const row = db
    .prepare(`SELECT mime, updated_at FROM app_settings WHERE key = 'logo' AND blob IS NOT NULL`)
    .get() as { mime: string; updated_at: string } | undefined;
  return row ?? null;
}

export function getLogoBlob(): { blob: Buffer; mime: string } | null {
  const row = db
    .prepare(`SELECT blob, mime FROM app_settings WHERE key = 'logo'`)
    .get() as { blob: Buffer; mime: string } | undefined;
  if (!row?.blob) return null;
  return { blob: row.blob, mime: row.mime };
}

export function setLogo(blob: Buffer, mime: string): void {
  db.prepare(
    `INSERT INTO app_settings (key, blob, mime, updated_at)
     VALUES ('logo', ?, ?, datetime('now'))
     ON CONFLICT(key) DO UPDATE SET blob = excluded.blob, mime = excluded.mime,
       updated_at = datetime('now')`,
  ).run(blob, mime);
}

export function clearLogo(): void {
  db.prepare(`DELETE FROM app_settings WHERE key = 'logo'`).run();
}

/** A short token that changes whenever the logo does, to bust image caches. */
export function logoVersion(): string {
  const info = getLogoInfo();
  return info ? info.updated_at.replace(/\D/g, "") : "0";
}
