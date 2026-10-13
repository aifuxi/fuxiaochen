import "server-only";
import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";

import { migrationManifest, verifyDatabase } from "@/lib/database/migrations";

export const backupManifestSchema = z.object({
  format: z.literal("fuxiaochen-sqlite-backup"),
  version: z.literal(1),
  schemaSha256: z.string().regex(/^[a-f0-9]{64}$/),
  migrations: z.array(
    z.object({
      hash: z.string().regex(/^[a-f0-9]{64}$/),
      createdAt: z.number().int().nonnegative(),
    }),
  ),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  bytes: z.number().int().positive(),
});
export function backupDirectory() {
  return resolve(
    /* turbopackIgnore: true */ process.env.BACKUP_DIRECTORY?.trim() || "./data/backups",
  );
}
export async function fileDigest(path: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}
export function verifySqliteArchive(path: string) {
  const database = new Database(path, { readonly: true, fileMustExist: true });
  try {
    verifyDatabase(database);
  } finally {
    database.close();
  }
}
export function verifyBackupVersion(manifest: z.infer<typeof backupManifestSchema>) {
  const expected = migrationManifest();
  if (
    manifest.schemaSha256 !== expected.schemaSha256 ||
    JSON.stringify(manifest.migrations) !== JSON.stringify(expected.migrations)
  )
    throw new Error("备份数据库结构与当前应用不一致，请使用匹配版本恢复。");
}
