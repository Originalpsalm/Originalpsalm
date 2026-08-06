/** Auth module types. */

/** Claims carried inside the session JWT (ADR-0002). */
export interface SessionClaims {
  /** User id. */
  sub: string;
  /** Organization id — every downstream query is scoped by this. */
  org: string;
  /** Role id. */
  role: string;
  /** Session id — the revocation handle. */
  sid: string;
}

/** The authenticated caller, resolved per request from cookie + session row. */
export interface AuthContext {
  userId: string;
  organizationId: string;
  roleId: string;
  sessionId: string;
}

/** Request metadata recorded on sessions and audit events. */
export interface RequestMeta {
  ipAddress: string | null;
  userAgent: string | null;
}

/** What a successful sign-in produces. */
export interface LoginResult {
  token: string;
  expiresAt: Date;
  user: import("./mapper").SessionUserDto;
}
