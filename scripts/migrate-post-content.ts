import "dotenv/config";
import { randomUUID } from "node:crypto";
import { chmodSync, existsSync } from "node:fs";
import { backup, DatabaseSync } from "node:sqlite";
import { z } from "zod";

import { databasePath } from "../lib/database-path";
import { postContentSchema, serializeDocument } from "../lib/posts/document";
import { markdownDocument } from "../lib/posts/markdown-document";
import { getDatabase } from "../prisma/db";

class MigrationError extends Error {}
const rowsSchema = z.array(
  z.object({ id: z.string(), content: z.string(), version: z.number().int() }),
);
type Row = z.infer<typeof rowsSchema>[number];

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !["--dry-run", "--write"].includes(args[0]))
    throw new MigrationError(
      "用法：npm run posts:migrate-content -- --dry-run 或 --write。写入前必须停止应用及其他数据库写入进程。",
    );
  const path = databasePath();
  if (!existsSync(path)) throw new MigrationError("目标数据库不存在，请检查 DATABASE_PATH。");
  // 预检查使用只读连接，避免 Prisma 的惰性初始化创建或修改数据库。
  const source = new DatabaseSync(path, { readOnly: true });
  let rows: Row[];
  const pending: (Row & { normalized: string })[] = [];
  try {
    rows = rowsSchema.parse(
      source.prepare("SELECT id, content, version FROM post ORDER BY id").all(),
    );
    const issues: string[] = [];
    for (const row of rows) {
      try {
        let value: unknown;
        try {
          value = JSON.parse(row.content);
        } catch {
          /* Markdown 不是 JSON。 */
        }
        const isEnvelope = value && typeof value === "object" && "format" in value;
        if (isEnvelope) {
          postContentSchema.parse(row.content);
          continue;
        }
        const normalized = postContentSchema.parse(
          serializeDocument(markdownDocument(row.content)),
        );
        pending.push({ ...row, normalized });
      } catch {
        issues.push(row.id);
      }
    }
    if (issues.length)
      throw new MigrationError(`正文预检查失败，未写入任何文章。文章 ID：${issues.join("、")}`);
    console.log(
      `文章 ${rows.length} 篇，块文档 ${rows.length - pending.length} 篇，待迁移 ${pending.length} 篇。`,
    );
    if (args[0] === "--dry-run" || !pending.length) return;
    // SQLite backup API 同时读取主文件与 WAL，不能用文件复制替代。
    const backupPath = `${path}.posts-content-${new Date().toISOString().replaceAll(":", "-")}-${randomUUID()}.sqlite`;
    await backup(source, backupPath);
    chmodSync(backupPath, 0o600);
    console.log(`迁移前备份：${backupPath}`);
  } finally {
    source.close();
  }
  const db = getDatabase();
  try {
    await db.transaction(async (tx) => {
      const current = await tx.orm.Post.select("id", "content", "version")
        .orderBy((p) => p.id.asc())
        .all();
      if (
        current.length !== rows.length ||
        current.some(
          (row, index) =>
            row.id !== rows[index].id ||
            row.version !== rows[index].version ||
            row.content !== rows[index].content,
        )
      )
        throw new MigrationError("预检查后文章发生变化，已取消迁移。请停止写入进程后重试。");
      for (const row of pending) {
        const count = await tx.orm.Post.where({
          id: row.id,
          version: row.version,
          content: row.content,
        }).updateAndCount({ content: row.normalized, version: row.version + 1 });
        if (count !== 1) throw new MigrationError(`文章 ${row.id} 已变化，迁移事务已取消。`);
      }
      const migrated = await tx.orm.Post.select("content").all();
      if (migrated.length !== rows.length)
        throw new MigrationError("文章数量变化，迁移事务已取消。");
      for (const row of migrated) postContentSchema.parse(row.content);
    });
    console.log(`已迁移 ${pending.length} 篇文章，全部正文均为块文档。`);
  } finally {
    await db.close();
  }
}

main().catch((error: unknown) => {
  console.error(
    error instanceof MigrationError
      ? error.message
      : "迁移失败，未完成的事务已回滚。请检查数据库及正文格式。",
  );
  process.exitCode = 1;
});
