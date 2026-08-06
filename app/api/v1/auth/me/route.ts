import { getPrisma } from "@/lib/prisma";
import { AuthMapper } from "@/backend/auth/mapper";
import { AUTH_ERRORS, AUTH_MESSAGES } from "@/backend/auth/constants";
import { handleRoute, ok } from "@/lib/api/response";
import { getAuthContext } from "@/lib/auth/session";
import { AuthenticationError } from "@/lib/errors";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/auth/me — the signed-in user, for hydrating the client session.
 */
export const GET = handleRoute(async () => {
  const auth = await getAuthContext();

  if (!auth) {
    throw new AuthenticationError(
      AUTH_MESSAGES.SESSION_INVALID,
      AUTH_ERRORS.SESSION_INVALID,
    );
  }

  const user = await getPrisma().user.findFirst({
    where: { id: auth.userId, organizationId: auth.organizationId, deletedAt: null },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      roleId: true,
      role: { select: { name: true } },
      organization: { select: { name: true } },
    },
  });

  if (!user) {
    throw new AuthenticationError(
      AUTH_MESSAGES.SESSION_INVALID,
      AUTH_ERRORS.SESSION_INVALID,
    );
  }

  return ok(
    {
      user: AuthMapper.toSessionUser(user),
      roleName: user.role.name,
      organizationName: user.organization.name,
    },
    "OK",
  );
});
