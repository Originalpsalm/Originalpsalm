import type { Prisma } from "@/lib/generated/prisma/client";

import { getPrisma } from "@/lib/prisma";
import type { RequestMeta } from "./types";

/**
 * Auth data access. Database communication only — no validation, no business
 * rules, no formatting (Backend Standards).
 */
export class AuthRepository {
  /** Looks up a sign-in candidate by email, including the hash for verification. */
  async findUserForLogin(email: string) {
    return getPrisma().user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      select: {
        id: true,
        organizationId: true,
        roleId: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        isActive: true,
        organization: { select: { isActive: true, deletedAt: true } },
      },
    });
  }

  async createSession(input: {
    organizationId: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    meta: RequestMeta;
  }) {
    return getPrisma().userSession.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
        ipAddress: input.meta.ipAddress,
        userAgent: input.meta.userAgent,
      },
      select: { id: true },
    });
  }

  /** Stores the hash of the signed token against its session row. */
  async attachTokenHash(sessionId: string, tokenHash: string) {
    return getPrisma().userSession.update({
      where: { id: sessionId },
      data: { tokenHash },
      select: { id: true },
    });
  }

  /** Returns the session only when it is live: not revoked and not expired. */
  async findLiveSession(tokenHash: string) {
    return getPrisma().userSession.findFirst({
      where: { tokenHash, revokedAt: null, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userId: true,
        organizationId: true,
        user: {
          select: {
            isActive: true,
            deletedAt: true,
            roleId: true,
            organization: { select: { isActive: true, deletedAt: true } },
          },
        },
      },
    });
  }

  async revokeSession(tokenHash: string) {
    return getPrisma().userSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async touchSession(sessionId: string) {
    return getPrisma().userSession.update({
      where: { id: sessionId },
      data: { lastSeenAt: new Date() },
      select: { id: true },
    });
  }

  async recordLastLogin(userId: string) {
    return getPrisma().user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
      select: { id: true },
    });
  }

  async createAuditEvent(input: {
    organizationId: string;
    userId: string | null;
    action: string;
    module: string;
    recordId?: string | null;
    newValue?: Prisma.InputJsonValue;
    meta: RequestMeta;
  }) {
    return getPrisma().auditEvent.create({
      data: {
        organizationId: input.organizationId,
        userId: input.userId,
        action: input.action,
        module: input.module,
        recordId: input.recordId ?? null,
        newValue: input.newValue ?? undefined,
        ipAddress: input.meta.ipAddress,
        userAgent: input.meta.userAgent,
      },
      select: { id: true },
    });
  }
}
