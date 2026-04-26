import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/db/schema";
import { ERROR_CODES } from "@/lib/server/http/error-codes";
import { AppError } from "@/lib/server/http/errors";

import { routes } from "@/constants/routes";

import { getSafeRedirectPath } from "./auth-redirect";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export type AuthenticatedServerSession = NonNullable<
  Awaited<ReturnType<typeof getServerSession>>
>;

const isUserRole = (value: unknown): value is UserRole =>
  value === "admin" || value === "user";

export function getSessionUserId(session: AuthenticatedServerSession) {
  const { user } = session;

  if (!("id" in user) || typeof user.id !== "string" || user.id.length === 0) {
    throw new Error("Authenticated session user is missing an id.");
  }

  return user.id;
}

export function getSessionUserRole(
  session: AuthenticatedServerSession,
): UserRole | undefined {
  const { user } = session;

  if (!("role" in user) || !isUserRole(user.role)) {
    return undefined;
  }

  return user.role;
}

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session) {
    redirect(routes.auth.login);
  }

  return session;
}

export async function requireServerAdminSession() {
  const session = await requireServerSession();

  if (getSessionUserRole(session) !== "admin") {
    throw new AppError(
      ERROR_CODES.AUTH_ADMIN_REQUIRED,
      "Admin access required",
      403,
    );
  }

  return session;
}

export async function getRequestSession(request: Request) {
  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function requireRequestSession(request: Request) {
  const session = await getRequestSession(request);

  if (!session) {
    throw new AppError(
      ERROR_CODES.AUTH_UNAUTHORIZED,
      "Authentication required",
      401,
    );
  }

  return session;
}

export async function requireAdminRequestSession(request: Request) {
  const session = await requireRequestSession(request);

  if (getSessionUserRole(session) !== "admin") {
    throw new AppError(
      ERROR_CODES.AUTH_ADMIN_REQUIRED,
      "Admin access required",
      403,
    );
  }

  return session;
}

export async function requireGuestSession(
  redirectTo?: string | string[] | null,
) {
  const session = await getServerSession();

  if (session) {
    redirect(getSafeRedirectPath(redirectTo));
  }

  return session;
}
