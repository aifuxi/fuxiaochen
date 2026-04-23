import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";

import { getSafeRedirectPath } from "./auth-redirect";

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export async function requireServerSession() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
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
