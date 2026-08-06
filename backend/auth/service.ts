import { AuthenticationError, BusinessRuleError } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { clearLoginAttempts, consumeLoginAttempt } from "@/lib/auth/rate-limit";
import { hashToken, signSessionToken, verifySessionToken } from "@/lib/auth/token";
import { verifyPassword } from "@/lib/auth/password";

import { AUTH_ERRORS, AUTH_MESSAGES, SESSION_REMEMBER_TTL_DAYS, SESSION_TTL_HOURS } from "./constants";
import { AuthMapper, type SessionUserDto } from "./mapper";
import { AuthRepository } from "./repository";
import type { AuthContext, LoginResult, RequestMeta } from "./types";
import type { LoginInput } from "./validator";

/**
 * Auth business rules (ADR-0002).
 *
 * Owns credential verification, session issuing and revocation, rate limiting
 * decisions, and audit recording. Nothing here formats HTTP responses.
 */
export class AuthService {
  private readonly repository = new AuthRepository();

  private expiryFor(rememberMe: boolean): Date {
    const ms = rememberMe
      ? SESSION_REMEMBER_TTL_DAYS * 24 * 60 * 60 * 1000
      : SESSION_TTL_HOURS * 60 * 60 * 1000;

    return new Date(Date.now() + ms);
  }

  async login(input: LoginInput, meta: RequestMeta): Promise<LoginResult> {
    const rateKey = `${input.email}:${meta.ipAddress ?? "unknown"}`;
    const limit = consumeLoginAttempt(rateKey);

    if (!limit.allowed) {
      logger.warn("Login blocked by rate limit", {
        email: input.email,
        ipAddress: meta.ipAddress,
        retryAfterSeconds: limit.retryAfterSeconds,
      });

      throw new BusinessRuleError(
        AUTH_MESSAGES.TOO_MANY_ATTEMPTS,
        AUTH_ERRORS.TOO_MANY_ATTEMPTS,
      );
    }

    const user = await this.repository.findUserForLogin(input.email);

    // Unknown email and wrong password produce the identical error so the
    // response cannot be used to enumerate which accounts exist.
    if (!user) {
      logger.info("Login failed: unknown email", {
        email: input.email,
        ipAddress: meta.ipAddress,
      });

      throw new AuthenticationError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        AUTH_ERRORS.INVALID_CREDENTIALS,
      );
    }

    const passwordMatches = await verifyPassword(user.password, input.password);

    if (!passwordMatches) {
      logger.info("Login failed: wrong password", {
        userId: user.id,
        ipAddress: meta.ipAddress,
      });

      await this.repository.createAuditEvent({
        organizationId: user.organizationId,
        userId: user.id,
        action: "login.failed",
        module: "auth",
        recordId: user.id,
        meta,
      });

      throw new AuthenticationError(
        AUTH_MESSAGES.INVALID_CREDENTIALS,
        AUTH_ERRORS.INVALID_CREDENTIALS,
      );
    }

    // Only after the password is proven correct may the response distinguish
    // between account states — otherwise it leaks which emails are registered.
    if (!user.isActive) {
      throw new AuthenticationError(
        AUTH_MESSAGES.ACCOUNT_INACTIVE,
        AUTH_ERRORS.ACCOUNT_INACTIVE,
      );
    }

    if (!user.organization.isActive || user.organization.deletedAt) {
      throw new AuthenticationError(
        AUTH_MESSAGES.ORGANIZATION_INACTIVE,
        AUTH_ERRORS.ORGANIZATION_INACTIVE,
      );
    }

    const expiresAt = this.expiryFor(input.rememberMe);

    // The session row exists before the token is signed, so a token can never
    // reference a session that was not recorded.
    const session = await this.repository.createSession({
      organizationId: user.organizationId,
      userId: user.id,
      // Placeholder replaced below once the token — which embeds the session
      // id — has been signed.
      tokenHash: `pending:${crypto.randomUUID()}`,
      expiresAt,
      meta,
    });

    const token = await signSessionToken(
      {
        sub: user.id,
        org: user.organizationId,
        role: user.roleId,
        sid: session.id,
      },
      expiresAt,
    );

    await this.repository.attachTokenHash(session.id, hashToken(token));
    await this.repository.recordLastLogin(user.id);

    await this.repository.createAuditEvent({
      organizationId: user.organizationId,
      userId: user.id,
      action: "login.succeeded",
      module: "auth",
      recordId: session.id,
      meta,
    });

    clearLoginAttempts(rateKey);

    logger.info("Login succeeded", { userId: user.id, sessionId: session.id });

    return {
      token,
      expiresAt,
      user: AuthMapper.toSessionUser(user),
    };
  }

  /**
   * Resolves the caller from a session cookie. Returns null rather than
   * throwing so callers can decide between redirecting and erroring.
   */
  async resolveSession(token: string): Promise<AuthContext | null> {
    const claims = await verifySessionToken(token);

    if (!claims) {
      return null;
    }

    const session = await this.repository.findLiveSession(hashToken(token));

    if (!session) {
      return null;
    }

    // A valid signature is not enough: the account or tenant may have been
    // deactivated or deleted since the token was issued.
    if (
      !session.user.isActive ||
      session.user.deletedAt ||
      !session.user.organization.isActive ||
      session.user.organization.deletedAt
    ) {
      return null;
    }

    return {
      userId: session.userId,
      organizationId: session.organizationId,
      roleId: session.user.roleId,
      sessionId: session.id,
    };
  }

  async logout(token: string, meta: RequestMeta): Promise<void> {
    const claims = await verifySessionToken(token);

    await this.repository.revokeSession(hashToken(token));

    if (claims) {
      await this.repository.createAuditEvent({
        organizationId: claims.org,
        userId: claims.sub,
        action: "logout",
        module: "auth",
        recordId: claims.sid,
        meta,
      });

      logger.info("Logout", { userId: claims.sub, sessionId: claims.sid });
    }
  }

  toSessionUser(user: Parameters<typeof AuthMapper.toSessionUser>[0]): SessionUserDto {
    return AuthMapper.toSessionUser(user);
  }
}
