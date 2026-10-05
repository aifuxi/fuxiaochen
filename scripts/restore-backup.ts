import "dotenv/config";
import { createHash } from "node:crypto";
import { appendFile, chmod, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Client } from "pg";
import { z } from "zod";

import contractJson from "../generated/prisma/contract.json";
import { requiredDatabaseUrl } from "../lib/database-url";
import { fileDigest, verifyPostgresArchive } from "../lib/operations/backup-files";
import { runPostgresTool } from "../lib/operations/postgres-tools";

const manifestSchema = z.object({
  format: z.literal("fuxiaochen-postgresql-backup"),
  version: z.literal(1),
  postgresMajor: z.literal(18),
  contractSha256: z.string().regex(/^[a-f0-9]{64}$/),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  bytes: z.number().int().positive(),
});

async function main() {
  const [directory, ...extra] = process.argv.slice(2);
  if (!directory || extra.length)
    throw new Error(
      "用法：npm run db:restore -- <备份目录>，并配置 RESTORE_DATABASE_URL 指向独立空库。",
    );
  if (!process.env.RESTORE_DATABASE_URL) throw new Error("请配置 RESTORE_DATABASE_URL。");
  const target = requiredDatabaseUrl(process.env.RESTORE_DATABASE_URL);
  const current = requiredDatabaseUrl();
  // 即使主机使用别名或不同转发端口，也拒绝恢复到同名的当前数据库。
  if (
    decodeURIComponent(new URL(target).pathname) === decodeURIComponent(new URL(current).pathname)
  )
    throw new Error("恢复目标必须使用与当前应用不同的数据库名。");
  const source = join(resolve(directory), "database.dump");
  const manifest = manifestSchema.parse(
    JSON.parse(await readFile(join(resolve(directory), "manifest.json"), "utf8")),
  );
  if (
    (await stat(source)).size !== manifest.bytes ||
    (await fileDigest(source)) !== manifest.sha256
  )
    throw new Error("备份大小或摘要不匹配。");
  const contractSha256 = createHash("sha256").update(JSON.stringify(contractJson)).digest("hex");
  if (manifest.contractSha256 !== contractSha256)
    throw new Error("备份 contract 与当前应用不一致，请使用匹配版本恢复。");
  await verifyPostgresArchive(source);
  const client = new Client({ connectionString: target, connectionTimeoutMillis: 10_000 });
  let temporary: string | undefined;
  try {
    await client.connect();
    await client.query("SELECT pg_advisory_lock(734825102)");
    const objects = await client.query(`
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema') AND n.nspname NOT LIKE 'pg_toast%' AND n.nspname NOT LIKE 'pg_temp%'
      UNION ALL SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
      UNION ALL SELECT 1 FROM pg_namespace WHERE nspname NOT IN ('public', 'pg_catalog', 'information_schema') AND nspname NOT LIKE 'pg_%'
      UNION ALL SELECT 1 FROM pg_type t JOIN pg_namespace n ON n.oid = t.typnamespace WHERE n.nspname = 'public'
      LIMIT 1`);
    if (objects.rowCount) throw new Error("恢复目标不是空数据库，已拒绝覆盖。");
    // 离线解包后由 psql 在同一事务中恢复并撤销会话；任一步失败全部回滚。
    temporary = await mkdtemp(join(tmpdir(), "fuxiaochen-restore-"));
    const sql = join(temporary, "restore.sql");
    await runPostgresTool("pg_restore", ["--no-owner", "--no-privileges", "--file", sql, source]);
    await chmod(sql, 0o600);
    await appendFile(
      sql,
      `
SELECT pg_advisory_xact_lock(734825101);
DELETE FROM public.session;
UPDATE public.operation_setting SET "autoBackup" = 0, "schedulerLastRunAt" = NULL, version = version + 1;
UPDATE public.backup_run SET status = 'failed', "finishedAt" = CURRENT_TIMESTAMP WHERE status = 'running';
`,
    );
    await runPostgresTool(
      "psql",
      [
        "--no-psqlrc",
        "--no-password",
        "--set=ON_ERROR_STOP=1",
        "--single-transaction",
        "--file",
        sql,
      ],
      target,
    );
    console.log(
      "恢复完成，登录会话已撤销、自动备份已关闭。切换前请使用目标 DATABASE_URL 执行 db:verify；OSS 文件需单独保留。",
    );
  } finally {
    await client.end();
    if (temporary) await rm(temporary, { recursive: true, force: true });
  }
}
main().catch((error: unknown) => {
  // 数据库和校验异常可能含有凭据或内部值，仅公开主动校验的 Error 消息。
  console.error(
    error instanceof Error && error.constructor === Error
      ? error.message
      : "恢复失败，请检查备份、目标空库及连接配置。",
  );
  process.exitCode = 1;
});
