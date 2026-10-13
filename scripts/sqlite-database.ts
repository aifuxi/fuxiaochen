import "dotenv/config";
import Sqlite from "better-sqlite3";
import { closeSync, openSync } from "node:fs";

import { migrateDatabase, verifyDatabase } from "../lib/database/migrations";
import { requiredDatabasePath } from "../lib/database/path";

function main() {
  const [command, ...extra] = process.argv.slice(2);
  if (extra.length || !["init", "migrate", "verify"].includes(command))
    throw new Error("用法：npm run db:init | db:migrate | db:verify");
  const path = requiredDatabasePath();
  // 仅 init 显式创建新文件；迁移和验证绝不因路径错误生成空库。
  if (command === "init") closeSync(openSync(path, "wx", 0o600));
  const client = new Sqlite(path, { fileMustExist: true, timeout: 5_000 });
  try {
    client.pragma("foreign_keys = ON");
    client.pragma("journal_mode = WAL");
    client.pragma("synchronous = FULL");
    if (command === "verify") verifyDatabase(client);
    else migrateDatabase(client);
    console.log(
      command === "init"
        ? "SQLite 初始化完成。"
        : command === "migrate"
          ? "SQLite 迁移与校验完成。"
          : "SQLite 结构与完整性校验通过。",
    );
  } finally {
    client.close();
  }
}

try {
  main();
} catch {
  // 不打印可能包含本地路径、记录值或其他内部数据的驱动异常。
  console.error("数据库操作失败，请检查 DATABASE_PATH、文件权限、迁移版本和空库条件。");
  process.exitCode = 1;
}
