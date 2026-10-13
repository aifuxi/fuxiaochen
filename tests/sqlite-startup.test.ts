import Sqlite from "better-sqlite3";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import { promisify } from "node:util";

import { migrateDatabase, migrationManifest, verifyDatabase } from "../lib/database/migrations";
import { prepareDatabase } from "../lib/database/startup";

const execute = promisify(execFile);
const tsxLoader = createRequire(import.meta.url).resolve("tsx");
async function independentDatabase() {
  const directory = await mkdtemp(join(tmpdir(), "fx-sqlite-startup-"));
  const databasePath = join(directory, "independent.sqlite");
  const backupDirectory = join(directory, "backups");
  return {
    directory,
    databasePath,
    backupDirectory,
    async cleanup() {
      await rm(directory, { recursive: true, force: true });
    },
  };
}
async function createDatabase(path: string, migrationsFolder?: string) {
  await writeFile(path, "", { flag: "wx", mode: 0o600 });
  const client = new Sqlite(path);
  try {
    client.pragma("journal_mode=WAL");
    client.pragma("foreign_keys=ON");
    migrateDatabase(client, { migrationsFolder });
    client
      .prepare("INSERT INTO category (id,name,nameKey,color,createdAt) VALUES (?,?,?,?,?)")
      .run("startup", "原有分类", "原有分类", "#123456", 1_791_880_000_123);
  } finally {
    client.close();
  }
}
async function backupFiles(directory: string) {
  return readdir(join(directory, "startup")).catch((error: unknown) => {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
    throw error;
  });
}
async function upgradeFolder(directory: string) {
  const folder = join(directory, "migrations");
  await mkdir(join(folder, "meta"), { recursive: true });
  await writeFile(
    join(folder, "0000_initial.sql"),
    await readFile("drizzle/0000_initial_sqlite.sql", "utf8"),
  );
  const entries = [{ idx: 0, version: "6", when: 1, tag: "0000_initial", breakpoints: true }];
  const save = () =>
    writeFile(
      join(folder, "meta/_journal.json"),
      JSON.stringify({ version: "7", dialect: "sqlite", entries }),
    );
  await save();
  return {
    folder,
    async add(sql: string) {
      await writeFile(join(folder, "0001_upgrade.sql"), sql);
      entries.push({ idx: 1, version: "6", when: 2, tag: "0001_upgrade", breakpoints: true });
      await save();
    },
  };
}

void test("缺失文件默认拒绝，只有显式首次初始化才独占发布完整新库", async () => {
  const fixture = await independentDatabase();
  try {
    await assert.rejects(prepareDatabase(fixture), /缺失/);
    await assert.rejects(readFile(fixture.databasePath));
    const result = await prepareDatabase({ ...fixture, initializeIfMissing: true });
    assert.deepEqual(result, {
      initialized: true,
      backupId: null,
      appliedBefore: 0,
      appliedAfter: 1,
    });
    assert.equal((await lstat(fixture.databasePath)).mode & 0o777, 0o600);
    assert.equal((await lstat(fixture.databasePath)).nlink, 1);
    const client = new Sqlite(fixture.databasePath);
    try {
      verifyDatabase(client);
      assert.equal(client.pragma("journal_mode", { simple: true }), "wal");
    } finally {
      client.close();
    }
    const second = await prepareDatabase({ ...fixture, initializeIfMissing: true });
    assert.equal(second.initialized, false);
    assert.ok(second.backupId);
    assert.equal(
      (await readdir(fixture.directory)).some((name) => name.startsWith(".startup-init-")),
      false,
    );
  } finally {
    await fixture.cleanup();
  }
});

void test("已有空文件、历史无 ledger 文件、符号链接与遗留日志均拒绝自动接管", async () => {
  const fixture = await independentDatabase();
  try {
    await writeFile(fixture.databasePath, "", { flag: "wx", mode: 0o600 });
    await assert.rejects(prepareDatabase({ ...fixture, initializeIfMissing: true }));
    assert.equal((await readFile(fixture.databasePath)).length, 0);
    await rm(fixture.databasePath);
    const client = new Sqlite(fixture.databasePath);
    client.exec("CREATE TABLE historical(value TEXT)");
    client.close();
    const before = await readFile(fixture.databasePath);
    await assert.rejects(prepareDatabase(fixture));
    assert.deepEqual(await readFile(fixture.databasePath), before);
    await rm(fixture.databasePath);
    const original = join(fixture.directory, "original.sqlite");
    await createDatabase(original);
    await symlink(original, fixture.databasePath);
    await assert.rejects(prepareDatabase(fixture), /普通文件/);
    await rm(fixture.databasePath);
    await writeFile(fixture.databasePath + "-wal", "orphan", { mode: 0o600 });
    await assert.rejects(prepareDatabase({ ...fixture, initializeIfMissing: true }), /日志/);
    await assert.rejects(readFile(fixture.databasePath));
  } finally {
    await fixture.cleanup();
  }
});

void test("每次启动保留独立私有完整备份，WAL 已提交记录、SHA 与 manifest 一致", async () => {
  const fixture = await independentDatabase();
  let writer: Sqlite.Database | undefined;
  try {
    await createDatabase(fixture.databasePath);
    writer = new Sqlite(fixture.databasePath);
    writer.pragma("wal_autocheckpoint=0");
    writer.prepare("UPDATE category SET name=? WHERE id='startup'").run("WAL 中的已提交分类");
    assert.ok((await lstat(fixture.databasePath + "-wal")).size > 0);
    const result = await prepareDatabase(fixture);
    assert.ok(result.backupId);
    const folder = join(fixture.backupDirectory, "startup", result.backupId);
    const snapshotPath = join(folder, "database.sqlite");
    const manifest = JSON.parse(await readFile(join(folder, "manifest.json"), "utf8"));
    const bytes = await readFile(snapshotPath);
    assert.equal(manifest.format, "fuxiaochen-sqlite-backup");
    assert.equal(manifest.purpose, "before-startup-migration");
    assert.equal(manifest.bytes, bytes.length);
    assert.equal(manifest.sha256, createHash("sha256").update(bytes).digest("hex"));
    assert.deepEqual(manifest.migrations, migrationManifest().migrations);
    assert.equal(manifest.schemaSha256, migrationManifest().schemaSha256);
    assert.equal(manifest.targetSchemaSha256, migrationManifest().schemaSha256);
    assert.equal((await lstat(folder)).mode & 0o777, 0o700);
    assert.equal((await lstat(snapshotPath)).mode & 0o777, 0o600);
    assert.equal((await lstat(join(folder, "manifest.json"))).mode & 0o777, 0o600);
    assert.deepEqual((await readdir(folder)).toSorted(), ["database.sqlite", "manifest.json"]);
    const snapshot = new Sqlite(snapshotPath, { readonly: true });
    try {
      verifyDatabase(snapshot);
      assert.deepEqual(snapshot.prepare("SELECT name, createdAt FROM category").get(), {
        name: "WAL 中的已提交分类",
        createdAt: 1_791_880_000_123,
      });
    } finally {
      snapshot.close();
    }
    assert.notEqual((await prepareDatabase(fixture)).backupId, result.backupId);
    assert.equal((await backupFiles(fixture.backupDirectory)).length, 2);
  } finally {
    writer?.close();
    await fixture.cleanup();
  }
});

void test("已有 DELETE 日志库首次启动成功，自有 WAL 配置不误报并发写入", async () => {
  const fixture = await independentDatabase();
  try {
    await createDatabase(fixture.databasePath);
    const source = new Sqlite(fixture.databasePath);
    source.pragma("journal_mode=DELETE");
    source.close();
    const result = await prepareDatabase(fixture);
    assert.ok(result.backupId);
    assert.equal((await backupFiles(fixture.backupDirectory)).length, 1);
    const database = new Sqlite(fixture.databasePath);
    try {
      verifyDatabase(database);
      assert.equal(database.pragma("journal_mode", { simple: true }), "wal");
      assert.equal(
        database.prepare<[], { name: string }>("SELECT name FROM category").get()?.name,
        "原有分类",
      );
    } finally {
      database.close();
    }
  } finally {
    await fixture.cleanup();
  }
});

void test("合法旧迁移前缀先备份旧结构，再迁移并校验最新结构", async () => {
  const fixture = await independentDatabase();
  try {
    const migrations = await upgradeFolder(fixture.directory);
    await createDatabase(fixture.databasePath, migrations.folder);
    await migrations.add("ALTER TABLE category ADD COLUMN auditFlag integer DEFAULT 0 NOT NULL;");
    const result = await prepareDatabase({ ...fixture, migrationsFolder: migrations.folder });
    assert.equal(result.appliedBefore, 1);
    assert.equal(result.appliedAfter, 2);
    const snapshotPath = join(
      fixture.backupDirectory,
      "startup",
      result.backupId!,
      "database.sqlite",
    );
    const snapshot = new Sqlite(snapshotPath, { readonly: true });
    try {
      assert.equal(
        snapshot
          .prepare<[], { count: number }>("SELECT count(*) AS count FROM __drizzle_migrations")
          .get()?.count,
        1,
      );
      assert.throws(() => snapshot.prepare("SELECT auditFlag FROM category"));
      assert.deepEqual(snapshot.prepare("SELECT name FROM category").get(), { name: "原有分类" });
    } finally {
      snapshot.close();
    }
    const client = new Sqlite(fixture.databasePath);
    try {
      verifyDatabase(client, { migrationsFolder: migrations.folder });
      assert.deepEqual(client.prepare("SELECT name,auditFlag FROM category").get(), {
        name: "原有分类",
        auditFlag: 0,
      });
    } finally {
      client.close();
    }
  } finally {
    await fixture.cleanup();
  }
});

void test("当前版本启动备份可经正式 db:restore 恢复独立新文件并撤销会话", async () => {
  const fixture = await independentDatabase();
  try {
    await createDatabase(fixture.databasePath);
    const client = new Sqlite(fixture.databasePath);
    try {
      client
        .prepare(
          "INSERT INTO admin (id,username,passwordHash,createdAt,updatedAt) VALUES (?,?,?,?,?)",
        )
        .run(1, "restore-test", "independent-test-hash", 0, 0);
      client
        .prepare("INSERT INTO session (id,adminId,createdAt,expiresAt) VALUES (?,?,?,?)")
        .run("test-session-hash", 1, 0, 1_999_999_999_999);
      client
        .prepare(
          "INSERT INTO operation_setting (id,autoBackup,version,schedulerLastRunAt,updatedAt) VALUES (?,?,?,?,?)",
        )
        .run(1, 1, 1, 1000, 1000);
    } finally {
      client.close();
    }
    const result = await prepareDatabase(fixture);
    assert.ok(result.backupId);
    const backup = join(fixture.backupDirectory, "startup", result.backupId);
    const target = join(fixture.directory, "restored.sqlite");
    await execute(
      process.execPath,
      [
        "--conditions=react-server",
        "--import",
        tsxLoader,
        resolve("scripts/restore-backup.ts"),
        backup,
      ],
      {
        env: { ...process.env, DATABASE_PATH: fixture.databasePath, RESTORE_DATABASE_PATH: target },
        timeout: 15_000,
      },
    );
    const restored = new Sqlite(target);
    try {
      verifyDatabase(restored);
      assert.deepEqual(restored.prepare("SELECT name, createdAt FROM category").get(), {
        name: "原有分类",
        createdAt: 1_791_880_000_123,
      });
      assert.deepEqual(restored.prepare("SELECT count(*) AS count FROM session").get(), {
        count: 0,
      });
      assert.deepEqual(
        restored.prepare("SELECT autoBackup,schedulerLastRunAt FROM operation_setting").get(),
        {
          autoBackup: 0,
          schedulerLastRunAt: null,
        },
      );
    } finally {
      restored.close();
    }
  } finally {
    await fixture.cleanup();
  }
});

void test("备份失败、迁移历史篡改、结构漂移与外键损坏都阻止启动升级", async () => {
  const fixture = await independentDatabase();
  try {
    await createDatabase(fixture.databasePath);
    const before = await readFile(fixture.databasePath);
    const blockedDirectory = join(fixture.directory, "blocked-backups");
    await writeFile(blockedDirectory, "blocked", { mode: 0o600 });
    await assert.rejects(prepareDatabase({ ...fixture, backupDirectory: blockedDirectory }));
    assert.deepEqual(await readFile(fixture.databasePath), before);
    const client = new Sqlite(fixture.databasePath);
    client.prepare("UPDATE __drizzle_migrations SET hash=?").run("f".repeat(64));
    client.close();
    await assert.rejects(prepareDatabase(fixture), /迁移历史/);
    const repairs = new Sqlite(fixture.databasePath);
    repairs
      .prepare("UPDATE __drizzle_migrations SET hash=?")
      .run(migrationManifest().migrations[0].hash);
    repairs.exec("DROP INDEX post_createdAt_id_idx");
    repairs.close();
    await assert.rejects(prepareDatabase(fixture), /结构/);
    const foreign = new Sqlite(fixture.databasePath);
    foreign.exec("CREATE INDEX `post_createdAt_id_idx` ON `post` (`createdAt`,`id`)");
    // 测试故意在独立文件制造历史悬空关系，验证启动完整校验会拒绝。
    foreign.pragma("foreign_keys=OFF");
    foreign
      .prepare("INSERT INTO session (id,adminId,createdAt,expiresAt) VALUES (?,?,?,?)")
      .run("orphan", 999, 0, 1);
    foreign.close();
    await assert.rejects(prepareDatabase(fixture), /外键/);
    assert.deepEqual(await backupFiles(fixture.backupDirectory), []);
  } finally {
    await fixture.cleanup();
  }
});

void test("迁移失败整笔回滚，启动前完整备份留存且初始建库失败不发布目标", async () => {
  const fixture = await independentDatabase();
  try {
    const migrations = await upgradeFolder(fixture.directory);
    await createDatabase(fixture.databasePath, migrations.folder);
    await migrations.add(
      "DELETE FROM category;\n--> statement-breakpoint\nSELECT not_a_function();",
    );
    await assert.rejects(prepareDatabase({ ...fixture, migrationsFolder: migrations.folder }));
    const client = new Sqlite(fixture.databasePath);
    try {
      assert.deepEqual(client.prepare("SELECT name FROM category").get(), { name: "原有分类" });
      assert.equal(
        client
          .prepare<[], { count: number }>("SELECT count(*) AS count FROM __drizzle_migrations")
          .get()?.count,
        1,
      );
    } finally {
      client.close();
    }
    const backups = await backupFiles(fixture.backupDirectory);
    assert.equal(backups.length, 1);
    assert.deepEqual(
      (await readdir(join(fixture.backupDirectory, "startup", backups[0]))).toSorted(),
      ["database.sqlite", "manifest.json"],
    );
    await assert.rejects(
      prepareDatabase({
        ...fixture,
        databasePath: join(fixture.directory, "failed-init.sqlite"),
        initializeIfMissing: true,
        migrationsFolder: migrations.folder,
      }),
    );
    await assert.rejects(readFile(join(fixture.directory, "failed-init.sqlite")));
  } finally {
    await fixture.cleanup();
  }
});

void test("备份期间独立写入会阻止迁移，保留完整旧快照与并发提交的数据", async () => {
  const fixture = await independentDatabase();
  // oxlint-disable-next-line typescript/unbound-method -- 测试包装器通过 call 显式绑定原实例。
  const originalBackup = Sqlite.prototype.backup;
  try {
    const migrations = await upgradeFolder(fixture.directory);
    await createDatabase(fixture.databasePath, migrations.folder);
    await migrations.add("ALTER TABLE category ADD COLUMN auditFlag integer DEFAULT 0 NOT NULL;");
    Sqlite.prototype.backup = async function (path, options) {
      const result = await originalBackup.call(this, path, options);
      const writer = new Sqlite(fixture.databasePath);
      try {
        writer.prepare("UPDATE category SET name=? WHERE id='startup'").run("并发提交");
      } finally {
        writer.close();
      }
      return result;
    };
    await assert.rejects(
      prepareDatabase({ ...fixture, migrationsFolder: migrations.folder }),
      /其他数据库写入/,
    );
    const client = new Sqlite(fixture.databasePath);
    try {
      assert.deepEqual(client.prepare("SELECT name FROM category").get(), { name: "并发提交" });
      assert.throws(() => client.prepare("SELECT auditFlag FROM category"));
      assert.equal(
        client
          .prepare<[], { count: number }>("SELECT count(*) AS count FROM __drizzle_migrations")
          .get()?.count,
        1,
      );
    } finally {
      client.close();
    }
    assert.equal((await backupFiles(fixture.backupDirectory)).length, 1);
  } finally {
    Sqlite.prototype.backup = originalBackup;
    await fixture.cleanup();
  }
});

void test("迁移前复核位于 IMMEDIATE 事务内，拒绝 async 与 Promise 并回滚", () => {
  const client = new Sqlite(":memory:");
  try {
    let called = false;
    migrateDatabase(client, {
      beforeMigration: () => {
        called = true;
        assert.equal(client.inTransaction, true);
      },
    });
    assert.equal(called, true);
    assert.throws(() => migrateDatabase(client, { beforeMigration: async () => {} }), /同步/);
    assert.throws(
      () => migrateDatabase(client, { beforeMigration: () => Promise.resolve() }),
      /Promise/,
    );
    assert.equal(client.inTransaction, false);
    verifyDatabase(client);
  } finally {
    client.close();
  }
});

void test("启动 CLI 不加载 cwd 的 .env，成功退出关闭连接且失败日志无路径和凭据", async () => {
  const fixture = await independentDatabase();
  try {
    await writeFile(
      join(fixture.directory, ".env"),
      "DATABASE_PATH=/do-not-open/existing.sqlite\nBACKUP_DIRECTORY=/do-not-open/backups\n",
    );
    const script = resolve("scripts/startup-database.ts");
    const env = {
      ...process.env,
      DATABASE_PATH: fixture.databasePath,
      BACKUP_DIRECTORY: fixture.backupDirectory,
    };
    const run = (args: string[]) =>
      execute(process.execPath, ["--import", tsxLoader, script, ...args], {
        env,
        cwd: fixture.directory,
        timeout: 15_000,
      });
    await assert.rejects(run([]), (error: unknown) => {
      assert.ok(error && typeof error === "object" && "stderr" in error);
      assert.equal(typeof error.stderr, "string");
      const stderr = String(error.stderr);
      assert.match(stderr, /缺失/);
      assert.equal(stderr.includes(fixture.databasePath), false);
      return true;
    });
    await run(["--initialize-if-missing"]);
    await run([]);
    const client = new Sqlite(fixture.databasePath);
    try {
      verifyDatabase(client);
    } finally {
      client.close();
    }
    const noEnv = { ...env };
    delete (noEnv as NodeJS.ProcessEnv).DATABASE_PATH;
    await assert.rejects(
      execute(process.execPath, ["--import", tsxLoader, script], {
        env: noEnv,
        cwd: fixture.directory,
        timeout: 15_000,
      }),
    );
    await chmod(fixture.databasePath, 0o600);
  } finally {
    await fixture.cleanup();
  }
});
