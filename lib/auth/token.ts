import { createHash } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";

import { requireEnv } from "@/lib/env";
import type { SessionClaims } from "@/backend/auth/types";

/**
 * Session JWT issuing and verification (ADR-0002).
 *
 * The JWT carries identity claims so authorization needs no database round
 * trip; the session row remains the authority on whether it is still valid.
 */

const ISSUER = "psalm-creations-suite";
const AUDIENCE = "psalm-creations-suite";

function secret(): Uint8Array {
  return new TextEncoder().encode(requireEnv("JWT_SECRET"));
}

export async function signSessionToken(
  claims: SessionClaims,
  expiresAt: Date,
): Promise<string> {
  return new SignJWT({ org: claims.org, role: claims.role, sid: claims.sid })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .sign(secret());
}

/** Returns the claims, or null when the token is absent, invalid, or expired. */
export async function verifySessionToken(token: string): Promise<SessionClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    const { sub, org, role, sid } = payload;

    if (
      typeof sub !== "string" ||
      typeof org !== "string" ||
      typeof role !== "string" ||
      typeof sid !== "string"
    ) {
      return null;
    }

    return { sub, org, role, sid };
  } catch {
    return null;
  }
}

/**
 * Sessions are looked up by hash so a leaked database backup cannot be replayed
 * as a valid cookie.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
