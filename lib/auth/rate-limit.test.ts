import { describe, expect, it } from "vitest";

import { clearLoginAttempts, consumeLoginAttempt } from "@/lib/auth/rate-limit";
import { LOGIN_MAX_ATTEMPTS } from "@/backend/auth/constants";

describe("login rate limiting (Security spec)", () => {
  it("allows attempts up to the configured maximum", () => {
    const key = "allow@example.com:1.1.1.1";

    for (let attempt = 1; attempt <= LOGIN_MAX_ATTEMPTS; attempt += 1) {
      expect(consumeLoginAttempt(key).allowed).toBe(true);
    }
  });

  it("blocks the attempt after the maximum and reports a retry delay", () => {
    const key = "block@example.com:1.1.1.1";

    for (let attempt = 1; attempt <= LOGIN_MAX_ATTEMPTS; attempt += 1) {
      consumeLoginAttempt(key);
    }

    const blocked = consumeLoginAttempt(key);

    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("isolates windows per key, so one account cannot lock out another", () => {
    const victim = "victim@example.com:1.1.1.1";
    const attacker = "attacker@example.com:9.9.9.9";

    for (let attempt = 1; attempt <= LOGIN_MAX_ATTEMPTS + 1; attempt += 1) {
      consumeLoginAttempt(attacker);
    }

    expect(consumeLoginAttempt(victim).allowed).toBe(true);
  });

  it("clears the window after a successful sign-in", () => {
    const key = "clear@example.com:1.1.1.1";

    for (let attempt = 1; attempt <= LOGIN_MAX_ATTEMPTS; attempt += 1) {
      consumeLoginAttempt(key);
    }

    clearLoginAttempts(key);

    expect(consumeLoginAttempt(key).allowed).toBe(true);
  });
});
