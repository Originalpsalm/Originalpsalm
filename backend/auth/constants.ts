/** Auth module constants (ADR-0002). */

/** Name of the HttpOnly cookie carrying the session JWT. */
export const SESSION_COOKIE = "pcbs_session";

/** Session lifetime for a normal sign-in. */
export const SESSION_TTL_HOURS = 12;

/** Session lifetime when "remember me" is chosen. */
export const SESSION_REMEMBER_TTL_DAYS = 30;

/**
 * Failed sign-in attempts allowed per email+IP within the window before the
 * endpoint starts refusing (Security spec: rate limit auth from day one).
 */
export const LOGIN_MAX_ATTEMPTS = 5;
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_INACTIVE: "ACCOUNT_INACTIVE",
  ORGANIZATION_INACTIVE: "ORGANIZATION_INACTIVE",
  TOO_MANY_ATTEMPTS: "TOO_MANY_ATTEMPTS",
  SESSION_INVALID: "SESSION_INVALID",
} as const;

export const AUTH_MESSAGES = {
  /** Deliberately identical for unknown email and wrong password: revealing
   *  which one failed lets an attacker enumerate valid accounts. */
  INVALID_CREDENTIALS: "Email or password is incorrect.",
  ACCOUNT_INACTIVE: "This account has been deactivated. Contact an administrator.",
  ORGANIZATION_INACTIVE: "This organization is not active.",
  TOO_MANY_ATTEMPTS: "Too many sign-in attempts. Please try again in a few minutes.",
  SESSION_INVALID: "Your session has expired. Please sign in again.",
  LOGIN_SUCCESS: "Signed in.",
  LOGOUT_SUCCESS: "Signed out.",
} as const;
