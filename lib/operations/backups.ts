import "server-only";
import { randomUUID, createHash } from "node:crypto";
import { chmod, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

import type { listQuerySchema } from "@/lib/admin/schema";
import type { TaxonomyActor } from "@/lib/taxonomy/service";

import contractJson from "@/generated/prisma/contract.json";
import { authorizeAdmin, AdminBusinessError } from "@/lib/admin/service";
import { requiredDatabaseUrl } from "@/lib/database-url";
import { getDatabase, writeTransaction } from "@/prisma/db";

import type { OperationTransaction } from "./notifications";
import type { BackupItem, BackupPage } from "./schema";

import { backupDirectory, fileDigest, verifyPostgresArchive } from "./backup-files";
import { runPostgresTool } from "./postgres-tools";

type Row = NonNullable<
  Awaited<ReturnType<ReturnType<typeof getDatabase>["orm"]["public"]["BackupRun"]["first"]>>
>;
function serialize(row: Row): BackupItem {
  return {
    id: row.id,
    bytes: row.bytes,
    sha256: row.sha256,
    status: z.enum(["running", "complete", "failed"]).parse(row.status),
    createdAt: row.createdAt.toISOString(),
    finishedAt: row.finishedAt?.toISOString() ?? null,
  };
}
async function expireBackupRuns(tx: OperationTransaction) {
  const now = new Date();
  const expired = await tx.orm.public.BackupRun.where({ status: "running" })
    .where((b) => b.createdAt.lt(new Date(now.getTime() - 15 * 60_000)))
    .all();
  for (const row of expired) {
    await tx.orm.public.BackupRun.where({ id: row.id, status: "running" }).updateAndCount({
      status: "failed",
      finishedAt: now,
    });
    const id = `backup:${row.id}`;
    if (!(await tx.orm.public.Notification.where({ id }).first()))
      await tx.orm.public.Notification.create({
        id,
        kind: "backup",
        sourceId: row.id,
        title: "数据库备份执行中断，请核对备份记录",
        href: "/admin",
        createdAt: now,
        resolvedAt: null,
      });
  }
}
export async function listBackups(
  query: z.infer<typeof listQuerySchema>,
  actor: TaxonomyActor,
): Promise<BackupPage> {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    await expireBackupRuns(tx);
    const { total } = await tx.orm.public.BackupRun.aggregate((a) => ({ total: a.count() }));
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const rows = await tx.orm.public.BackupRun.orderBy([
      (b) => b.createdAt.desc(),
      (b) => b.id.desc(),
    ])
      .limit(query.pageSize)
      .offset((page - 1) * query.pageSize)
      .all();
    return { items: rows.map(serialize), total, page, pageSize: query.pageSize, pageCount };
  });
}
// CLI 与 HTTP 使用同一记录和租约；幂等 ID 在客户端响应丢失后可安全查询/重试。
export async function createBackup(
  id: string,
  actor?: TaxonomyActor,
  dailyKey: string | null = null,
) {
  const started = await writeTransaction(async (tx) => {
    if (actor) await authorizeAdmin(actor);
    const now = new Date();
    await expireBackupRuns(tx);
    const previous = dailyKey
      ? await tx.orm.public.BackupRun.where({ dailyKey }).first()
      : await tx.orm.public.BackupRun.where({ id }).first();
    if (previous && previous.status !== "failed") return { existing: previous };
    if (previous && !dailyKey) return { existing: previous };
    if (await tx.orm.public.BackupRun.where({ status: "running" }).first())
      throw new AdminBusinessError("VERSION_CONFLICT", "已有备份正在执行，请稍后查询记录。");
    if (
      actor &&
      (await tx.orm.public.BackupRun.where((b) =>
        b.createdAt.gte(new Date(now.getTime() - 60_000)),
      ).first())
    )
      throw new AdminBusinessError(
        "INVALID_INPUT",
        "两次手动备份需间隔至少一分钟，请先核对已有记录。",
      );
    if (previous)
      await tx.orm.public.BackupRun.where({ id: previous.id }).updateAndCount({ dailyKey: null });
    const row = await tx.orm.public.BackupRun.create({
      id,
      dailyKey,
      status: "running",
      bytes: null,
      sha256: null,
      createdAt: now,
      finishedAt: null,
    });
    return { row };
  });
  if (started.existing) return serialize(started.existing);
  const directory = join(backupDirectory(), id);
  let created = false;
  try {
    await mkdir(backupDirectory(), { recursive: true, mode: 0o700 });
    await mkdir(directory, { mode: 0o700 });
    created = true;
    const path = join(directory, "database.dump");
    await runPostgresTool(
      "pg_dump",
      ["--format=custom", "--no-owner", "--no-privileges", "--no-password", "--file", path],
      requiredDatabaseUrl(),
    );
    await chmod(path, 0o600);
    await verifyPostgresArchive(path);
    const sha256 = await fileDigest(path);
    const { size: bytes } = await stat(path);
    await writeFile(
      join(directory, "manifest.json"),
      JSON.stringify(
        {
          format: "fuxiaochen-postgresql-backup",
          version: 1,
          postgresMajor: 18,
          id,
          createdAt: started.row.createdAt.toISOString(),
          bytes,
          sha256,
          contractSha256: createHash("sha256").update(JSON.stringify(contractJson)).digest("hex"),
          mediaScope: "metadata-only",
        },
        null,
        2,
      ),
      { mode: 0o600, flag: "wx" },
    );
    return await writeTransaction(async (tx) => {
      if (
        !(await tx.orm.public.BackupRun.where({ id, status: "running" }).updateAndCount({
          status: "complete",
          bytes,
          sha256,
          finishedAt: new Date(),
        }))
      )
        throw new Error("Backup lease expired");
      const row = await tx.orm.public.BackupRun.where({ id }).first();
      if (!row) throw new Error("Missing backup record");
      await tx.orm.public.Notification.create({
        id: `backup:${id}`,
        kind: "backup",
        sourceId: id,
        title: "数据库备份已完成",
        href: "/admin",
        createdAt: new Date(),
        resolvedAt: null,
      });
      return serialize(row);
    });
  } catch (error) {
    // 完整产物即使最终登记失败也保留；只有缺少 manifest 的目录才是未完成产物。
    const complete = await stat(join(directory, "manifest.json")).then(
      () => true,
      () => false,
    );
    if (created && !complete) await rm(directory, { recursive: true, force: true });
    await writeTransaction(async (tx) => {
      await tx.orm.public.BackupRun.where({ id }).updateAndCount({
        status: "failed",
        finishedAt: new Date(),
      });
      if (!(await tx.orm.public.Notification.where({ id: `backup:${id}` }).first()))
        await tx.orm.public.Notification.create({
          id: `backup:${id}`,
          kind: "backup",
          sourceId: id,
          title: "数据库备份失败，请核对备份记录",
          href: "/admin",
          createdAt: new Date(),
          resolvedAt: null,
        });
    });
    console.error("数据库备份失败", { name: error instanceof Error ? error.name : "UnknownError" });
    throw new AdminBusinessError(
      "SERVICE_UNAVAILABLE",
      "备份未完成，请检查服务器存储与备份记录后重试。",
    );
  }
}
export const newBackupId = () => randomUUID();
