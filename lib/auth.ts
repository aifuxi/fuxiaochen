import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getSession, SESSION_COOKIE } from "./auth/service";

export const currentSession = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return getSession(token);
});

export async function requireAdmin() {
  const session = await currentSession();
  if (!session) redirect("/login");
  return session;
}
