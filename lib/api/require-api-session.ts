import { ApiError } from "@/lib/api/api-error";
import { apiErrorCodes } from "@/lib/api/error-codes";
import { auth } from "@/lib/auth";

export async function requireApiSession(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    throw new ApiError({
      code: apiErrorCodes.UNAUTHORIZED,
      message: "Authentication required.",
    });
  }

  return session;
}
