import "server-only";
import { and, eq, gt } from "drizzle-orm";

import {
  getActiveTransaction,
  getDatabase,
  type Database,
  type DatabaseTransaction,
} from "@/lib/database";
import { authUser, authSession } from "@/lib/database/schema";

// 仅供业务数据入口在同步事务内复核撤销/过期；外部 Cookie 由 Better Auth 校验。
export function getSession(token: string | undefined, db?: Database | DatabaseTransaction) {
  if (!token || !/^[A-Za-z0-9]{32}$/.test(token)) return null;
  return (
    (db ?? getActiveTransaction() ?? getDatabase())
      .select({ adminId: authSession.userId, username: authUser.username })
      .from(authSession)
      .innerJoin(authUser, eq(authSession.userId, authUser.id))
      .where(
        and(
          eq(authSession.token, token),
          eq(authUser.id, 1),
          gt(authSession.expiresAt, new Date()),
        ),
      )
      .get() ?? null
  );
}
