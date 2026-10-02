import "server-only";
import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession } from "@/lib/auth/service";

export class AdminBusinessError extends Error {
  constructor(
    public code: "UNAUTHORIZED" | "NOT_FOUND" | "INVALID_INPUT" | "VERSION_CONFLICT",
    message: string,
  ) {
    super(message);
  }
}
export async function authorizeAdmin(actor: TaxonomyActor) {
  const admin = await getSession(actor.sessionToken);
  if (!admin || admin.adminId !== actor.adminId)
    throw new AdminBusinessError("UNAUTHORIZED", "登录已失效，请重新登录。");
  return admin;
}
