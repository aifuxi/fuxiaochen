import "server-only";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { databasePath } from "@/lib/database-path";

export function backupDirectory() {
  return resolve(
    /* turbopackIgnore: true */ process.env.BACKUP_DIRECTORY?.trim() ||
      join(dirname(databasePath()), "backups"),
  );
}
export async function fileDigest(path: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}
export function verifySqlite(path: string) {
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const rows = db.prepare("PRAGMA quick_check").all();
    if (
      rows.length !== 1 ||
      Object.values(rows[0])[0] !== "ok" ||
      db.prepare("PRAGMA foreign_key_check").all().length
    )
      throw new Error("SQLite integrity verification failed");
  } finally {
    db.close();
  }
}
