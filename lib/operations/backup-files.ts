import "server-only";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { resolve } from "node:path";

import { runPostgresTool } from "./postgres-tools";

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
export async function verifyPostgresArchive(path: string) {
  await runPostgresTool("pg_restore", ["--list", path]);
}
