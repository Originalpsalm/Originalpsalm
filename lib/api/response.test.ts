import { describe, expect, it } from "vitest";

import { created, handleRoute, ok } from "@/lib/api/response";
import { NotFoundError } from "@/lib/errors";

const request = new Request("http://localhost/api/v1/test");
const context = { params: Promise.resolve({}) };

describe("response envelope (ADR-0007)", () => {
  it("wraps success payloads in the mandated envelope", async () => {
    const response = ok({ id: "1" }, "Fetched.");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true, message: "Fetched.", data: { id: "1" } });
  });

  it("returns 201 for created resources", async () => {
    const response = created({ id: "1" });

    expect(response.status).toBe(201);
  });
});

describe("handleRoute error boundary", () => {
  it("converts an AppError into its envelope and status", async () => {
    const route = handleRoute(async () => {
      throw new NotFoundError("Customer not found.");
    });

    const response = await route(request, context);
    const body = await response.json();

    expect(response.status).toBe(404);
    expect(body).toEqual({
      success: false,
      message: "Customer not found.",
      code: "NOT_FOUND",
      errors: {},
    });
  });

  it("sanitizes unexpected errors into a 500 with a correlation ID", async () => {
    const route = handleRoute(async () => {
      throw new Error("secret internal detail");
    });

    const response = await route(request, context);
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(body.message).not.toContain("secret internal detail");
    expect(body.correlationId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("passes successful responses through untouched", async () => {
    const route = handleRoute(async () => ok({ fine: true }));

    const response = await route(request, context);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual({ fine: true });
  });
});
