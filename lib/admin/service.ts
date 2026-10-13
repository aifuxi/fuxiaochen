import "server-only";
import type { DatabaseTransaction } from "@/lib/database";
import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { getSession } from "@/lib/auth/session-access";

export class AdminBusinessError extends Error {
  constructor(
    public code:
      | "UNAUTHORIZED"
      | "NOT_FOUND"
      | "INVALID_INPUT"
      | "VERSION_CONFLICT"
      | "SERVICE_UNAVAILABLE",
    message: string,
  ) {
    super(message);
  }
}
export function authorizeAdmin(actor: TaxonomyActor, tx?: DatabaseTransaction) {
  const admin = getSession(actor.sessionToken, tx);
  if (!admin || admin.adminId !== actor.adminId)
    throw new AdminBusinessError("UNAUTHORIZED", "登录已失效，请重新登录。");
  return admin;
}
