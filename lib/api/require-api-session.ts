import { ApiError } from "@/lib/api/api-error";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { auth } from "@/lib/auth";
import { isAdminRole, type UserRole } from "@/lib/user/user-role";

type ApiSession = {
  user: {
    role?: UserRole;
  };
};

export async function requireApiSession(request: Request) {
  const session = (await auth.api.getSession({
    headers: request.headers,
  })) as ApiSession | null;

  if (!session) {
    throw new ApiError({
      code: apiErrorCodes.UNAUTHORIZED,
      message: "Authentication required.",
    });
  }

  return session;
}

export async function requireAdminApiSession(request: Request) {
  const session = await requireApiSession(request);

  if (!isAdminRole(session.user.role)) {
    throw new ApiError({
      code: apiErrorCodes.FORBIDDEN,
      message: "Admin access required.",
    });
  }

  return session;
}
