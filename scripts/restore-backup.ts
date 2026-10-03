import "dotenv/config";
import { constants } from "node:fs";
import { chmod, copyFile, mkdir, readFile, rm, stat } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { z } from "zod";

import { databasePath } from "../lib/database-path";
import { fileDigest, verifySqlite } from "../lib/operations/backup-files";

const manifestSchema = z.object({
  format: z.literal("fuxiaochen-sqlite-backup"),
  version: z.literal(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  bytes: z.number().int().positive(),
});
async function main() {
  const [directory, target, ...extra] = process.argv.slice(2);
  if (!directory || !target || extra.length)
    throw new Error("用法：npm run db:restore -- <备份目录> <新的数据库路径>；不会覆盖现有文件。");
  const destination = resolve(target);
  if (destination === databasePath())
    throw new Error("请恢复到新路径，核对后再停止服务并切换 DATABASE_PATH。");
  const source = join(resolve(directory), "database.sqlite");
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(join(resolve(directory), "manifest.json"), "utf8")),
  );
  if (
    (await stat(source)).size !== manifest.bytes ||
    (await fileDigest(source)) !== manifest.sha256
  )
    throw new Error("备份大小或摘要不匹配。");
  verifySqlite(source);
  await mkdir(dirname(destination), { recursive: true, mode: 0o700 });
  await copyFile(source, destination, constants.COPYFILE_EXCL);
  try {
    await chmod(destination, 0o600);
    const db = new DatabaseSync(destination);
    try {
      // 恢复不能复活已经撤销的会话，也不能立即重启旧的自动备份配置。
      db.exec(
        "BEGIN; DELETE FROM session; UPDATE operation_setting SET autoBackup = 0, schedulerLastRunAt = NULL, version = version + 1; UPDATE backup_run SET status = 'failed' WHERE status = 'running'; COMMIT;",
      );
    } finally {
      db.close();
    }
    verifySqlite(destination);
  } catch (error) {
    await rm(destination, { force: true });
    throw error;
  }
  console.log(
    `已恢复到 ${destination}。所有登录会话已撤销，自动备份已关闭。OSS 文件须保留原对象或单独恢复。`,
  );
}
main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "恢复失败");
  process.exitCode = 1;
});
