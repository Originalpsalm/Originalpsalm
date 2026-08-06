import { AuthService } from "@/backend/auth/service";
import { AUTH_MESSAGES } from "@/backend/auth/constants";
import { loginSchema } from "@/backend/auth/validator";
import { handleRoute, ok } from "@/lib/api/response";
import { setSessionCookie, requestMeta } from "@/lib/auth/session";
import { ValidationError } from "@/lib/errors";

const service = new AuthService();

/**
 * POST /api/v1/auth/login — verify credentials and start a session.
 *
 * Thin adapter: parse, validate, delegate, serialize. No business logic.
 */
export const POST = handleRoute(async (request) => {
  const body: unknown = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    throw new ValidationError(
      "Please correct the highlighted fields.",
      parsed.error.flatten().fieldErrors as Record<string, string[]>,
    );
  }

  const result = await service.login(parsed.data, requestMeta(request));

  await setSessionCookie(result.token, result.expiresAt);

  return ok({ user: result.user }, AUTH_MESSAGES.LOGIN_SUCCESS);
});
