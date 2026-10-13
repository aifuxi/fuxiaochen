import Sqlite from "better-sqlite3";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { hashPassword } from "../../lib/auth/password";
import { login } from "../../lib/auth/service";
import { closeDatabase, getDatabase, writeTransaction } from "../../lib/database";
import { migrateDatabase } from "../../lib/database/migrations";
import { admin } from "../../lib/database/schema";

export async function createTestDatabase() {
  const directory = await mkdtemp(join(tmpdir(), "fx-sqlite-business-"));
  const path = join(directory, "independent.sqlite");
  closeDatabase();
  process.env.DATABASE_PATH = path;
  process.env.BACKUP_DIRECTORY = join(directory, "backups");
  process.env.APP_ORIGIN = "https://sqlite-test.example";
  // 确保集成测试无法意外使用已有 PostgreSQL 连接或恢复目标。
  delete process.env.DATABASE_URL;
  delete process.env.RESTORE_DATABASE_URL;
  await writeFile(path, "", { flag: "wx", mode: 0o600 });
  const client = new Sqlite(path);
  try {
    client.pragma("foreign_keys = ON");
    migrateDatabase(client);
  } finally {
    client.close();
  }
  const password = "sqlite-integration-test-password";
  const now = new Date();
  const passwordHash = await hashPassword(password);
  writeTransaction((tx) =>
    tx
      .insert(admin)
      .values({ id: 1, username: "test_admin", passwordHash, createdAt: now, updatedAt: now })
      .run(),
  );
  const sessionToken = await login({ username: "test_admin", password }, undefined);
  if (!sessionToken) throw new Error("独立测试库登录失败。");
  return {
    directory,
    path,
    password,
    actor: { adminId: 1, sessionToken },
    async cleanup() {
      closeDatabase();
      await rm(directory, { recursive: true, force: true });
    },
    db: getDatabase(),
  };
}
