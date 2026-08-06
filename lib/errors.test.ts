import { describe, expect, it } from "vitest";

import {
  AppError,
  AuthenticationError,
  BusinessRuleError,
  ConflictError,
  NotFoundError,
  PermissionError,
  ValidationError,
} from "@/lib/errors";

describe("AppError taxonomy (ADR-0007)", () => {
  it("maps each error class to its mandated HTTP status", () => {
    expect(new ValidationError().status).toBe(400);
    expect(new AuthenticationError().status).toBe(401);
    expect(new PermissionError().status).toBe(403);
    expect(new NotFoundError().status).toBe(404);
    expect(new ConflictError("Duplicate.").status).toBe(409);
    expect(new BusinessRuleError("Rule broken.", "RULE").status).toBe(422);
  });

  it("carries a stable machine-readable code", () => {
    expect(new ValidationError().code).toBe("VALIDATION_ERROR");
    expect(new AuthenticationError().code).toBe("AUTHENTICATION_REQUIRED");
    expect(new PermissionError().code).toBe("PERMISSION_DENIED");
    expect(new NotFoundError().code).toBe("NOT_FOUND");
    expect(new ConflictError("Duplicate.").code).toBe("CONFLICT");
    expect(new BusinessRuleError("Out of stock.", "INSUFFICIENT_STOCK").code).toBe(
      "INSUFFICIENT_STOCK",
    );
  });

  it("holds field-keyed validation errors for form display", () => {
    const error = new ValidationError("Validation failed.", {
      email: ["Email is invalid."],
    });

    expect(error.errors).toEqual({ email: ["Email is invalid."] });
  });

  it("defaults errors to an empty object, never undefined", () => {
    expect(new NotFoundError().errors).toEqual({});
  });

  it("is an instanceof chain usable for catch-and-convert", () => {
    const error = new ConflictError("SKU already exists.");

    expect(error).toBeInstanceOf(AppError);
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("ConflictError");
  });
});
