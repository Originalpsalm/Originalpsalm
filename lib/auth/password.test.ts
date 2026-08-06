import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing (argon2id, ADR-0002)", () => {
  it("verifies a correct password against its hash", async () => {
    const hash = await hashPassword("Str0ng!pass");

    await expect(verifyPassword(hash, "Str0ng!pass")).resolves.toBe(true);
  });

  it("rejects an incorrect password", async () => {
    const hash = await hashPassword("Str0ng!pass");

    await expect(verifyPassword(hash, "Wr0ng!pass")).resolves.toBe(false);
  });

  it("never stores the plaintext in the hash", async () => {
    const hash = await hashPassword("Str0ng!pass");

    expect(hash).not.toContain("Str0ng!pass");
    expect(hash.startsWith("$argon2id$")).toBe(true);
  });

  it("salts: the same password hashes differently each time", async () => {
    const [first, second] = await Promise.all([
      hashPassword("Str0ng!pass"),
      hashPassword("Str0ng!pass"),
    ]);

    expect(first).not.toBe(second);
  });

  it("treats a malformed hash as a failed verification, not an error", async () => {
    await expect(verifyPassword("not-a-hash", "anything")).resolves.toBe(false);
  });
});
