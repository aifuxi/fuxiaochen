import "dotenv/config";
import { input, password } from "@inquirer/prompts";
import { eq } from "drizzle-orm";

import { hashPassword } from "../lib/auth/password";
import { newPasswordSchema, usernameSchema } from "../lib/auth/schema";
import { closeDatabase, getDatabase, writeTransaction } from "../lib/database";
import { admin, session } from "../lib/database/schema";

class AdminCommandError extends Error {}

async function main() {
  const command = process.argv[2];
  if (command !== "init" && command !== "reset-password") {
    throw new AdminCommandError("请选择 init 或 reset-password");
  }
  const db = getDatabase();
  try {
    const existing = db.select().from(admin).where(eq(admin.id, 1)).get();
    if (command === "init" && existing)
      throw new AdminCommandError("管理员已存在，请使用 admin:reset-password");
    if (command === "reset-password" && !existing)
      throw new AdminCommandError("管理员尚未创建，请先使用 admin:init");
    const username =
      existing?.username ??
      (await input({
        message: "管理员用户名：",
        validate: (value) => {
          const result = usernameSchema.safeParse(value);
          return result.success || result.error.issues[0].message;
        },
      }));
    const secret = await password({
      message: "管理员密码（15–128 个字符）：",
      validate: (value) => {
        const result = newPasswordSchema.safeParse(value);
        return result.success || result.error.issues[0].message;
      },
    });
    const confirmation = await password({ message: "再次输入密码：" });
    if (secret !== confirmation) throw new AdminCommandError("两次输入的密码不一致");
    const passwordHash = await hashPassword(newPasswordSchema.parse(secret));
    const now = new Date();
    writeTransaction((tx) => {
      if (command === "init") {
        tx.insert(admin)
          .values({
            id: 1,
            username: usernameSchema.parse(username),
            passwordHash,
            createdAt: now,
            updatedAt: now,
          })
          .run();
      } else {
        const updated = tx
          .update(admin)
          .set({
            passwordHash,
            updatedAt: now,
          })
          .where(eq(admin.id, 1))
          .run();
        if (!updated.changes) throw new AdminCommandError("管理员不存在");
        tx.delete(session).where(eq(session.adminId, 1)).run();
      }
    });
    console.log(command === "init" ? "管理员已创建。" : "密码已重置，全部会话已撤销。");
  } finally {
    closeDatabase();
  }
}

main().catch((error: unknown) => {
  const name = error instanceof Error ? error.name : "UnknownError";
  // 数据库异常可能包含参数，仅显示可安全公开的主动校验错误。
  const message = error instanceof AdminCommandError ? error.message : name;
  console.error(`管理员操作失败：${message}`);
  process.exitCode = 1;
});
