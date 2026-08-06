import { describe, expect, it } from "vitest";

import { loginSchema, passwordSchema } from "@/backend/auth/validator";

describe("loginSchema", () => {
  it("normalizes email to lowercase and trims surrounding space", () => {
    const result = loginSchema.parse({
      email: "  Admin@PsalmCreations.com ",
      password: "whatever",
    });

    expect(result.email).toBe("admin@psalmcreations.com");
  });

  it("defaults rememberMe to false when omitted", () => {
    const result = loginSchema.parse({ email: "a@b.com", password: "x" });

    expect(result.rememberMe).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });

    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });

    expect(result.success).toBe(false);
  });
});

describe("passwordSchema (Security spec policy)", () => {
  it("accepts a password meeting every rule", () => {
    expect(passwordSchema.safeParse("Str0ng!pass").success).toBe(true);
  });

  it.each([
    ["too short", "Ab1!c"],
    ["no uppercase", "str0ng!pass"],
    ["no lowercase", "STR0NG!PASS"],
    ["no number", "Strong!pass"],
    ["no special character", "Str0ngpass1"],
  ])("rejects a password with %s", (_label, value) => {
    expect(passwordSchema.safeParse(value).success).toBe(false);
  });
});
