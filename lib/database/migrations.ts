import Sqlite from "better-sqlite3";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const ledgerSql = `CREATE TABLE IF NOT EXISTS __drizzle_migrations (
  id INTEGER PRIMARY KEY, hash TEXT NOT NULL, created_at INTEGER NOT NULL
)`;

function migrationFiles(migrationsFolder = resolve(process.cwd(), "drizzle")) {
  return readMigrationFiles({ migrationsFolder });
}

export function migrationManifest(migrationsFolder?: string) {
  const migrations = migrationFiles(migrationsFolder).map(({ hash, folderMillis }) => ({
    hash,
    createdAt: folderMillis,
  }));
  return {
    schemaSha256: createHash("sha256").update(JSON.stringify(migrations)).digest("hex"),
    migrations,
  };
}

function appliedMigrations(client: Sqlite.Database) {
  const exists = client
    .prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name='__drizzle_migrations'")
    .get();
  if (!exists) return [];
  return client
    .prepare<[], { hash: string; createdAt: number }>(
      "SELECT hash, created_at AS createdAt FROM __drizzle_migrations ORDER BY id",
    )
    .all();
}

function checkHistory(client: Sqlite.Database, complete: boolean, migrationsFolder?: string) {
  const applied = appliedMigrations(client);
  const expected = migrationManifest(migrationsFolder).migrations;
  if (applied.length > expected.length || (complete && applied.length !== expected.length)) {
    throw new Error("数据库迁移版本与当前应用不一致。");
  }
  for (const [index, migration] of applied.entries()) {
    if (
      migration.hash !== expected[index].hash ||
      migration.createdAt !== expected[index].createdAt
    ) {
      throw new Error("数据库迁移记录或已提交 SQL 已变化。");
    }
  }
  return applied.length;
}

function schemaDescription(client: Sqlite.Database) {
  return client
    .prepare(
      "SELECT type, name, tbl_name, sql FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name",
    )
    .all();
}

export function verifyDatabase(
  client: Sqlite.Database,
  options: { fullIntegrity?: boolean; migrationsFolder?: string } = {},
): void {
  checkHistory(client, true, options.migrationsFolder);
  const foreignKeys: unknown = client.pragma("foreign_key_check");
  // 备份、恢复和显式校验必须检查索引内容；quick_check 不检查 UNIQUE 与索引键。
  const integrityPragma = options.fullIntegrity === false ? "quick_check" : "integrity_check";
  if (
    client.pragma(integrityPragma, { simple: true }) !== "ok" ||
    !Array.isArray(foreignKeys) ||
    foreignKeys.length
  ) {
    throw new Error("数据库完整性或外键校验失败。");
  }
  const reference = new Sqlite(":memory:");
  try {
    reference.exec(ledgerSql);
    for (const migration of migrationFiles(options.migrationsFolder)) {
      for (const statement of migration.sql) reference.exec(statement);
    }
    if (
      JSON.stringify(schemaDescription(client)) !== JSON.stringify(schemaDescription(reference))
    ) {
      throw new Error("数据库结构与已提交迁移不一致。");
    }
  } finally {
    reference.close();
  }
}

export function migrateDatabase(
  client: Sqlite.Database,
  options: { migrationsFolder?: string } = {},
): void {
  if (client.inTransaction) throw new Error("数据库迁移不能在已有事务内执行。");
  const foreignKeys = client.pragma("foreign_keys", { simple: true });
  // Drizzle 的重建表迁移包含 DROP 父表；必须在 BEGIN 之前关闭 FK，避免级联删子表。
  // 事务内 PRAGMA foreign_keys=OFF 无效，提交前仍用 foreign_key_check 验证所有关联。
  client.pragma("foreign_keys = OFF");
  // 迁移与版本记录处于同一 IMMEDIATE 事务，跨 Web/CLI 写入由 SQLite 文件锁串行化。
  try {
    client
      .transaction(() => {
        const applied = checkHistory(client, false, options.migrationsFolder);
        if (
          !applied &&
          client.prepare("SELECT 1 FROM sqlite_schema WHERE name NOT LIKE 'sqlite_%'").get()
        ) {
          throw new Error("数据库不是空库且没有迁移记录，已拒绝自动接管。");
        }
        client.exec(ledgerSql);
        const insert = client.prepare(
          "INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)",
        );
        for (const migration of migrationFiles(options.migrationsFolder).slice(applied)) {
          for (const statement of migration.sql) client.exec(statement);
          insert.run(migration.hash, migration.folderMillis);
        }
        verifyDatabase(client, options);
      })
      .immediate();
  } finally {
    client.pragma(`foreign_keys = ${foreignKeys === 1 ? "ON" : "OFF"}`);
  }
}
