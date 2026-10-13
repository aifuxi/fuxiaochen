import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { readAdminSession } from "./auth/service";

export const currentSession = cache(async () => {
  return readAdminSession(await headers());
});

export async function requireAdmin() {
  const session = await currentSession();
  if (!session) redirect("/login");
  return session;
}
