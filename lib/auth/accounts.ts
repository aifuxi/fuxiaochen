import "server-only";
import { eq } from "drizzle-orm";

import { writeTransaction, type DatabaseTransaction } from "@/lib/database";
import { admin, session, authUser, authAccount, authSession } from "@/lib/database/schema";

// CLI 和旧库导入共用映射；网页没有创建用户或重置密码的入口。
export function syncAdminAccount(tx: Pick<DatabaseTransaction, "select" | "insert">) {
  const legacy = tx.select().from(admin).where(eq(admin.id, 1)).get();
  if (!legacy) throw new Error("管理员尚未创建。");
  tx.insert(authUser)
    .values({
      id: 1,
      name: legacy.username,
      username: legacy.username,
      email: "admin@localhost.invalid",
      emailVerified: false,
      createdAt: legacy.createdAt,
      updatedAt: legacy.updatedAt,
    })
    .onConflictDoUpdate({
      target: authUser.id,
      set: { name: legacy.username, username: legacy.username, updatedAt: legacy.updatedAt },
    })
    .run();
  tx.insert(authAccount)
    .values({
      id: 1,
      userId: 1,
      accountId: "1",
      providerId: "credential",
      password: legacy.passwordHash,
      createdAt: legacy.createdAt,
      updatedAt: legacy.updatedAt,
    })
    .onConflictDoUpdate({
      target: authAccount.id,
      set: { password: legacy.passwordHash, updatedAt: legacy.updatedAt },
    })
    .run();
}

export function resetAdminPassword(passwordHash: string) {
  writeTransaction((tx) => {
    const updated = tx
      .update(admin)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(admin.id, 1))
      .run();
    if (!updated.changes) throw new Error("管理员不存在。");
    syncAdminAccount(tx);
    tx.delete(authSession).where(eq(authSession.userId, 1)).run();
    tx.delete(session).where(eq(session.adminId, 1)).run();
  });
}
