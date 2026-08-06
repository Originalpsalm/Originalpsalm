import { AuthService } from "@/backend/auth/service";
import { AUTH_MESSAGES } from "@/backend/auth/constants";
import { handleRoute, ok } from "@/lib/api/response";
import { clearSessionCookie, readSessionToken, requestMeta } from "@/lib/auth/session";

const service = new AuthService();

/**
 * POST /api/v1/auth/logout — revoke the current session.
 *
 * Always succeeds: signing out must never fail for a caller who already has no
 * valid session.
 */
export const POST = handleRoute(async (request) => {
  const token = await readSessionToken();

  if (token) {
    await service.logout(token, requestMeta(request));
  }

  await clearSessionCookie();

  return ok({ success: true }, AUTH_MESSAGES.LOGOUT_SUCCESS);
});
