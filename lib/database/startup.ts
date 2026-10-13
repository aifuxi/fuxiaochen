import Sqlite from "better-sqlite3";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { chmod, link, lstat, mkdir, mkdtemp, open, realpath, rm, stat } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";

import { migrateDatabase, migrationManifest, verifyDatabase } from "./migrations";
import { requiredDatabasePath } from "./path";

export class DatabaseStartupError extends Error {}

// 资源跟随工具定位，不依赖 Portainer 命令或 CLI 的工作目录。
export const startupMigrationsFolder = resolve(import.meta.dirname, "../../drizzle");
const ledgerSql = `CREATE TABLE IF NOT EXISTS __drizzle_migrations (
  id INTEGER PRIMARY KEY, hash TEXT NOT NULL, created_at INTEGER NOT NULL
)`;
const sidecars = ["-wal", "-shm", "-journal"];

export interface DatabaseStartupOptions {
  databasePath?: string;
  backupDirectory?: string;
  initializeIfMissing?: boolean;
  migrationsFolder?: string;
}
export interface DatabaseStartupResult {
  initialized: boolean;
  backupId: string | null;
  appliedBefore: number;
  appliedAfter: number;
}
type Migration = { hash: string; createdAt: number };

function schemaDescription(client: Sqlite.Database) {
  return client
    .prepare(
      "SELECT type, name, tbl_name, sql FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name",
    )
    .all();
}

// 启动升级要接受已提交迁移的合法前缀，不能先调用只接受最新 schema 的业务连接。
function verifyPrefix(client: Sqlite.Database, migrationsFolder: string): Migration[] {
  const applied = client
    .prepare<[], Migration>(
      "SELECT hash, created_at AS createdAt FROM __drizzle_migrations ORDER BY id",
    )
    .all();
  const expected = migrationManifest(migrationsFolder).migrations;
  if (!applied.length || applied.length > expected.length)
    throw new DatabaseStartupError("已有数据库的迁移版本不受当前镜像支持。");
  for (const [index, migration] of applied.entries()) {
    if (
      migration.hash !== expected[index].hash ||
      migration.createdAt !== expected[index].createdAt
    )
      throw new DatabaseStartupError("已有数据库的迁移历史与镜像不一致。");
  }
  const checks: unknown = client.pragma("foreign_key_check");
  if (
    client.pragma("integrity_check", { simple: true }) !== "ok" ||
    !Array.isArray(checks) ||
    checks.length
  )
    throw new DatabaseStartupError("已有数据库的完整性或外键校验失败。");
  const reference = new Sqlite(":memory:");
  try {
    reference.exec(ledgerSql);
    for (const migration of readMigrationFiles({ migrationsFolder }).slice(0, applied.length)) {
      for (const statement of migration.sql) reference.exec(statement);
    }
    if (JSON.stringify(schemaDescription(client)) !== JSON.stringify(schemaDescription(reference)))
      throw new DatabaseStartupError("已有数据库结构与迁移历史不一致。");
  } finally {
    reference.close();
  }
  return applied;
}

async function exists(path: string) {
  return lstat(path).then(
    () => true,
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return false;
      throw error;
    },
  );
}

async function syncFile(path: string) {
  const handle = await open(path, "r");
  try {
    await handle.sync();
  } finally {
    await handle.close();
  }
}

async function digest(path: string) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

async function privateDirectory(path: string) {
  await mkdir(path, { recursive: true, mode: 0o700 });
  const info = await lstat(path);
  if (!info.isDirectory() || info.isSymbolicLink())
    throw new DatabaseStartupError("启动备份目录必须是普通私有目录。");
  await chmod(path, 0o700);
}

function configure(client: Sqlite.Database) {
  client.pragma("foreign_keys = ON");
  client.pragma("journal_mode = WAL");
  client.pragma("synchronous = FULL");
}

async function initialize(path: string, migrationsFolder: string): Promise<DatabaseStartupResult> {
  for (const suffix of sidecars) {
    if (await exists(path + suffix))
      throw new DatabaseStartupError("目标存在 SQLite 日志，已拒绝首次初始化。");
  }
  const temporary = await mkdtemp(join(dirname(path), ".startup-init-"));
  const temporaryPath = join(temporary, "database.sqlite");
  try {
    const handle = await open(temporaryPath, "wx", 0o600);
    await handle.close();
    const client = new Sqlite(temporaryPath, { fileMustExist: true, timeout: 5_000 });
    try {
      configure(client);
      migrateDatabase(client, { migrationsFolder });
      verifyDatabase(client, { migrationsFolder });
    } finally {
      client.close();
    }
    await syncFile(temporaryPath);
    for (const suffix of sidecars) {
      if (await exists(path + suffix))
        throw new DatabaseStartupError("目标存在 SQLite 日志，已拒绝首次初始化。");
    }
    // 独占发布已完成的新库；失败只清理本次临时文件，不留下半初始化目标。
    await link(temporaryPath, path);
    await syncFile(dirname(path));
    return {
      initialized: true,
      backupId: null,
      appliedBefore: 0,
      appliedAfter: migrationManifest(migrationsFolder).migrations.length,
    };
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

async function backupBeforeMigration(
  client: Sqlite.Database,
  backupDirectory: string,
  migrationsFolder: string,
) {
  const root = join(backupDirectory, "startup");
  await privateDirectory(backupDirectory);
  await privateDirectory(root);
  const id = `${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID()}`;
  const directory = join(root, id);
  await mkdir(directory, { mode: 0o700 });
  const path = join(directory, "database.sqlite");
  let complete = false;
  try {
    // backup API 在同一读事务中保留 WAL 的已提交快照，不能只复制主文件。
    client.exec("BEGIN");
    let applied: Migration[];
    try {
      applied = verifyPrefix(client, migrationsFolder);
      await client.backup(path);
    } finally {
      if (client.inTransaction) client.exec("ROLLBACK");
    }
    await chmod(path, 0o600);
    const snapshot = new Sqlite(path, { fileMustExist: true, timeout: 5_000 });
    try {
      if (JSON.stringify(verifyPrefix(snapshot, migrationsFolder)) !== JSON.stringify(applied))
        throw new DatabaseStartupError("启动备份版本与源快照不一致。");
      // 只改变本次独立快照的 journal header，使恢复证据完整保存在单文件中。
      // 原数据库继续使用 WAL；不能把未 checkpoint 的源库直接改成 DELETE 再复制。
      if (snapshot.pragma("journal_mode = DELETE", { simple: true }) !== "delete")
        throw new DatabaseStartupError("启动备份无法完成独立快照整理。");
    } finally {
      snapshot.close();
    }
    await syncFile(path);
    const { size: bytes } = await stat(path);
    const manifest = {
      format: "fuxiaochen-sqlite-backup",
      version: 1,
      purpose: "before-startup-migration",
      id,
      createdAt: new Date().toISOString(),
      bytes,
      sha256: await digest(path),
      migrations: applied,
      schemaSha256: createHash("sha256").update(JSON.stringify(applied)).digest("hex"),
      targetSchemaSha256: migrationManifest(migrationsFolder).schemaSha256,
      mediaScope: "metadata-only",
    };
    const handle = await open(join(directory, "manifest.json"), "wx", 0o600);
    try {
      await handle.writeFile(JSON.stringify(manifest, null, 2) + "\n");
      await handle.sync();
    } finally {
      await handle.close();
    }
    await syncFile(directory);
    await syncFile(root);
    complete = true;
    return { id, applied };
  } finally {
    // 已完成备份即使迁移随后失败也保留；未完成产物不能被误认为恢复证据。
    if (!complete) await rm(directory, { recursive: true, force: true });
  }
}

export async function prepareDatabase(
  options: DatabaseStartupOptions = {},
): Promise<DatabaseStartupResult> {
  const configured = requiredDatabasePath(options.databasePath);
  const path = join(await realpath(dirname(configured)), basename(configured));
  const backupValue = options.backupDirectory ?? process.env.BACKUP_DIRECTORY;
  if (!backupValue?.trim()) throw new DatabaseStartupError("启动前备份需要显式 BACKUP_DIRECTORY。");
  const backupDirectory = resolve(backupValue);
  const migrationsFolder = options.migrationsFolder ?? startupMigrationsFolder;
  if (!(await exists(path))) {
    if (!options.initializeIfMissing)
      throw new DatabaseStartupError("数据库文件缺失；首次建库必须明确启用初始化。");
    return initialize(path, migrationsFolder);
  }
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.nlink !== 1)
    throw new DatabaseStartupError("数据库必须是独立的普通文件，不能使用符号链接或硬链接别名。");
  const client = new Sqlite(path, { fileMustExist: true, timeout: 5_000 });
  try {
    client.pragma("foreign_keys = ON");
    // 先拒绝历史/损坏结构，再规范日志模式；DELETE→WAL 的自有变化不能误报为外部写入。
    verifyPrefix(client, migrationsFolder);
    configure(client);
    const beforeVersion = client.pragma("data_version", { simple: true });
    const backup = await backupBeforeMigration(client, backupDirectory, migrationsFolder);
    migrateDatabase(client, {
      migrationsFolder,
      beforeMigration: () => {
        if (client.pragma("data_version", { simple: true }) !== beforeVersion)
          throw new DatabaseStartupError("备份期间存在其他数据库写入；请停止所有写入后重试启动。");
      },
    });
    verifyDatabase(client, { migrationsFolder });
    return {
      initialized: false,
      backupId: backup.id,
      appliedBefore: backup.applied.length,
      appliedAfter: migrationManifest(migrationsFolder).migrations.length,
    };
  } finally {
    client.close();
  }
}
