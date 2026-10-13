import "server-only";
import { and, count, desc, eq, gte, lt } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import { chmod, mkdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

import type { listQuerySchema } from "@/lib/admin/schema";
import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin, AdminBusinessError } from "@/lib/admin/service";
import { getDatabase, writeTransaction } from "@/lib/database";
import { migrationManifest } from "@/lib/database/migrations";
import { backupRun, notification } from "@/lib/database/schema";

import type { OperationTransaction } from "./notifications";
import type { BackupItem, BackupPage } from "./schema";

import { backupDirectory, fileDigest, verifySqliteArchive } from "./backup-files";

type Row = typeof backupRun.$inferSelect;
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
function expireBackupRuns(tx: OperationTransaction) {
  const now = new Date();
  const expired = tx
    .select()
    .from(backupRun)
    .where(
      and(
        eq(backupRun.status, "running"),
        lt(backupRun.createdAt, new Date(now.getTime() - 15 * 60_000)),
      ),
    )
    .all();
  for (const row of expired) {
    tx.update(backupRun)
      .set({ status: "failed", finishedAt: now })
      .where(and(eq(backupRun.id, row.id), eq(backupRun.status, "running")))
      .run();
    tx.insert(notification)
      .values({
        id: `backup:${row.id}`,
        kind: "backup",
        sourceId: row.id,
        title: "数据库备份执行中断，请核对备份记录",
        href: "/admin",
        createdAt: now,
        resolvedAt: null,
      })
      .onConflictDoNothing()
      .run();
  }
}
export async function listBackups(
  query: z.infer<typeof listQuerySchema>,
  actor: TaxonomyActor,
): Promise<BackupPage> {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    expireBackupRuns(tx);
    const { total } = tx.select({ total: count() }).from(backupRun).get()!;
    const pageCount = Math.max(1, Math.ceil(total / query.pageSize));
    const page = Math.min(query.page, pageCount);
    const rows = tx
      .select()
      .from(backupRun)
      .orderBy(desc(backupRun.createdAt), desc(backupRun.id))
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
  const started = writeTransaction((tx) => {
    if (actor) authorizeAdmin(actor, tx);
    const now = new Date();
    expireBackupRuns(tx);
    const previous = tx
      .select()
      .from(backupRun)
      .where(dailyKey ? eq(backupRun.dailyKey, dailyKey) : eq(backupRun.id, id))
      .get();
    if (previous && (previous.status !== "failed" || !dailyKey)) return { existing: previous };
    if (
      tx.select({ id: backupRun.id }).from(backupRun).where(eq(backupRun.status, "running")).get()
    )
      throw new AdminBusinessError("VERSION_CONFLICT", "已有备份正在执行，请稍后查询记录。");
    if (
      actor &&
      tx
        .select({ id: backupRun.id })
        .from(backupRun)
        .where(gte(backupRun.createdAt, new Date(now.getTime() - 60_000)))
        .get()
    )
      throw new AdminBusinessError(
        "INVALID_INPUT",
        "两次手动备份需间隔至少一分钟，请先核对已有记录。",
      );
    if (previous)
      tx.update(backupRun).set({ dailyKey: null }).where(eq(backupRun.id, previous.id)).run();
    const row = tx
      .insert(backupRun)
      .values({
        id,
        dailyKey,
        status: "running",
        bytes: null,
        sha256: null,
        createdAt: now,
        finishedAt: null,
      })
      .returning()
      .get();
    return { row };
  });
  if (started.existing) return serialize(started.existing);
  const directory = join(backupDirectory(), id);
  let created = false;
  try {
    await mkdir(backupDirectory(), { recursive: true, mode: 0o700 });
    await mkdir(directory, { mode: 0o700 });
    created = true;
    const path = join(directory, "database.sqlite");
    // 在线备份 API 创建一致性快照，不能在 WAL 模式中直接复制主文件。
    await getDatabase().$client.backup(path);
    await chmod(path, 0o600);
    verifySqliteArchive(path);
    const sha256 = await fileDigest(path);
    const { size: bytes } = await stat(path);
    await writeFile(
      join(directory, "manifest.json"),
      JSON.stringify(
        {
          format: "fuxiaochen-sqlite-backup",
          version: 1,
          id,
          createdAt: started.row.createdAt.toISOString(),
          bytes,
          sha256,
          ...migrationManifest(),
          mediaScope: "metadata-only",
        },
        null,
        2,
      ),
      { mode: 0o600, flag: "wx" },
    );
    return writeTransaction((tx) => {
      if (
        !tx
          .update(backupRun)
          .set({ status: "complete", bytes, sha256, finishedAt: new Date() })
          .where(and(eq(backupRun.id, id), eq(backupRun.status, "running")))
          .run().changes
      )
        throw new Error("Backup lease expired");
      const row = tx.select().from(backupRun).where(eq(backupRun.id, id)).get();
      if (!row) throw new Error("Missing backup record");
      tx.insert(notification)
        .values({
          id: `backup:${id}`,
          kind: "backup",
          sourceId: id,
          title: "数据库备份已完成",
          href: "/admin",
          createdAt: new Date(),
          resolvedAt: null,
        })
        .run();
      return serialize(row);
    });
  } catch (error) {
    // 完整产物即使最终登记失败也保留；只有缺少 manifest 的目录才是未完成产物。
    const complete = await stat(join(directory, "manifest.json")).then(
      () => true,
      () => false,
    );
    if (created && !complete) await rm(directory, { recursive: true, force: true });
    writeTransaction((tx) => {
      tx.update(backupRun)
        .set({ status: "failed", finishedAt: new Date() })
        .where(eq(backupRun.id, id))
        .run();
      tx.insert(notification)
        .values({
          id: `backup:${id}`,
          kind: "backup",
          sourceId: id,
          title: "数据库备份失败，请核对备份记录",
          href: "/admin",
          createdAt: new Date(),
          resolvedAt: null,
        })
        .onConflictDoNothing()
        .run();
    });
    console.error("数据库备份失败", { name: error instanceof Error ? error.name : "UnknownError" });
    throw new AdminBusinessError(
      "SERVICE_UNAVAILABLE",
      "备份未完成，请检查服务器存储与备份记录后重试。",
    );
  }
}
export const newBackupId = () => randomUUID();
