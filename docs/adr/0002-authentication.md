# ADR-0002 — Authentication: JWT claims + database-backed sessions

**Status:** Accepted · **Date:** 2026-08-05

## Context

The specs require JWT, secure sessions, session expiration, per-session
revocation, and device history. Pure stateless JWT cannot revoke access before
expiry — unacceptable for an ERP where "revoke this person's access now" is
mandatory.

## Decision

- A JWT carried in a secure, HttpOnly, SameSite cookie holds user / organization
  / role claims, signed with `JWT_SECRET`.
- A database session record is the authoritative revocation point, validated on
  each request. It stores IP, user agent, and last-seen (device history).
  Session lookups may be short-cached in memory with immediate invalidation on
  revoke.
- Refresh-token rotation is deferred: revocation comes from the session record,
  not token rotation. Rotation is a later optimization, not a prerequisite.
- Passwords are hashed with argon2id. Password policy per the Security spec
  (min 8, upper, lower, number, special).
- Auth endpoints are rate-limited from day one.
- NextAuth is not used; `NEXTAUTH_SECRET` is dropped from the environment set.
  SSO/SAML/SCIM (future) will slot in behind the same session boundary.

## Consequences

- One session table, login/logout/revoke endpoints, and per-request validation.
- Every login is recorded (audit requirement).
