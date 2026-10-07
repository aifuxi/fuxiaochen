import "dotenv/config";
import { open, realpath } from "node:fs/promises";
import { resolve } from "node:path";
import { parseArgs } from "node:util";

import { runSqliteImport, SqliteImportError } from "../lib/operations/sqlite-import";
import { getDatabase } from "../prisma/db";

async function main() {
  const { values } = parseArgs({
    options: {
      source: { type: "string" },
      report: { type: "string" },
      "dry-run": { type: "boolean" },
      apply: { type: "boolean" },
      verify: { type: "boolean" },
    },
    strict: true,
    allowPositionals: false,
  });
  const modes = (["dry-run", "apply", "verify"] as const).filter((mode) => values[mode]);
  if (!values.source || !values.report || modes.length !== 1)
    throw new SqliteImportError(
      "用法：npm run db:import-sqlite -- --source <一致性快照> --dry-run|--apply|--verify --report <新报告路径>。数据库连接仅从 DATABASE_URL 读取。",
    );
  const source = await realpath(resolve(values.source));
  const report = resolve(values.report);
  if (source === report) throw new SqliteImportError("报告路径不能覆盖 SQLite 源快照。");
  // 写入前独占创建报告；拒绝已有文件、符号链接和不可写目录，避免提交后才发现路径问题。
  const output = await open(report, "wx", 0o600);
  let completed = false;
  try {
    const result = await runSqliteImport({ source, mode: modes[0] });
    completed = true;
    try {
      await output.writeFile(`${JSON.stringify(result, null, 2)}\n`);
      await output.sync();
    } catch {
      throw new SqliteImportError(
        "数据库处理已完成，但报告写入失败；请保留快照并以新报告路径运行 --verify，不能重复 --apply。",
      );
    }
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await output.close();
    await getDatabase().close();
    if (!completed) console.error("处理未完成；未提交的数据库事务已回滚，请使用新报告路径重试。");
  }
}

main().catch((error: unknown) => {
  // Zod、SQLite 和 PG 异常可能包含密码哈希、正文或访客信息，不输出内部异常。
  console.error(
    error instanceof SqliteImportError
      ? error.message
      : "SQLite 导入失败，请核对源快照、空目标库、字段与连接配置；内部数据未输出。",
  );
  process.exitCode = 1;
});
