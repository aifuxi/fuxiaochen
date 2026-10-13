import "dotenv/config";
import Database from "better-sqlite3";
import { constants } from "node:fs";
import { chmod, copyFile, lstat, readFile, realpath, rm, stat } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";

import { verifyDatabase } from "../lib/database/migrations";
import { requiredDatabasePath } from "../lib/database/path";
import {
  backupManifestSchema,
  fileDigest,
  verifyBackupVersion,
  verifySqliteArchive,
} from "../lib/operations/backup-files";

async function main() {
  const [directory, ...extra] = process.argv.slice(2);
  if (!directory || extra.length)
    throw new Error(
      "用法：npm run db:restore -- <备份目录>，并配置 RESTORE_DATABASE_PATH 指向独立的新 SQLite 文件。",
    );
  const configured = process.env.RESTORE_DATABASE_PATH?.trim();
  if (!configured || !isAbsolute(configured))
    throw new Error("请配置绝对路径 RESTORE_DATABASE_PATH。");
  const current = requiredDatabasePath();
  const target = join(await realpath(dirname(resolve(configured))), basename(configured));
  const source = await realpath(join(resolve(directory), "database.sqlite"));
  const currentCanonical = await realpath(current).catch(async () =>
    join(await realpath(dirname(current)), basename(current)),
  );
  if (target === currentCanonical || target === source)
    throw new Error("恢复目标必须是独立的新 SQLite 文件。");
  // 拒绝已有文件、符号链接与遗留 WAL 文件，避免覆盖现有数据库或混用日志。
  for (const path of [target, `${target}-wal`, `${target}-shm`, `${target}-journal`]) {
    try {
      await lstat(path);
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") continue;
      throw error;
    }
    throw new Error("恢复目标已存在，已拒绝覆盖。");
  }
  const manifest = backupManifestSchema.parse(
    JSON.parse(await readFile(join(resolve(directory), "manifest.json"), "utf8")),
  );
  if (
    (await stat(source)).size !== manifest.bytes ||
    (await fileDigest(source)) !== manifest.sha256
  )
    throw new Error("备份大小或摘要不匹配。");
  verifyBackupVersion(manifest);
  verifySqliteArchive(source);
  let copied = false;
  let database: Database.Database | undefined;
  try {
    // EXCL 再次防止检查与复制之间出现的新文件被覆盖。
    await copyFile(source, target, constants.COPYFILE_EXCL);
    copied = true;
    await chmod(target, 0o600);
    if (
      (await stat(target)).size !== manifest.bytes ||
      (await fileDigest(target)) !== manifest.sha256
    )
      throw new Error("复制后的备份大小或摘要不匹配。");
    database = new Database(target, { fileMustExist: true });
    database.pragma("foreign_keys = ON");
    database
      .transaction(() => {
        database!.prepare("DELETE FROM session").run();
        database!.prepare("DELETE FROM auth_session").run();
        database!.prepare("DELETE FROM auth_verification").run();
        database!
          .prepare(
            'UPDATE operation_setting SET "autoBackup" = 0, "schedulerLastRunAt" = NULL, version = version + 1',
          )
          .run();
        database!
          .prepare('UPDATE backup_run SET status = ?, "finishedAt" = ? WHERE status = ?')
          .run("failed", Date.now(), "running");
      })
      .immediate();
    verifyDatabase(database);
    database.close();
    database = undefined;
    console.log(
      "恢复完成，登录会话已撤销、自动备份已关闭。切换前请使用目标 DATABASE_PATH 执行 db:verify；OSS 文件需单独保留。",
    );
  } catch (error) {
    database?.close();
    if (copied) {
      for (const path of [target, `${target}-wal`, `${target}-shm`, `${target}-journal`])
        await rm(path, { force: true });
    }
    throw error;
  }
}
main().catch((error: unknown) => {
  // 数据库异常可能含内部值，仅公开主动校验的 Error 消息。
  console.error(
    error instanceof Error && error.constructor === Error
      ? error.message
      : "恢复失败，请检查备份、目标新文件及路径配置。",
  );
  process.exitCode = 1;
});
