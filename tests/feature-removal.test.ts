import Sqlite from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import { syncAdminAccount } from "../lib/auth/accounts";
import {
  removedTables,
  removedSettingFields,
  tableSpecs,
  targetSchemaSha256,
  sourceContractSha256,
} from "../lib/database-transfer/format";
import { importArchive } from "../lib/database-transfer/import";
import { migrateDatabase, verifyDatabase } from "../lib/database/migrations";
import { prepareDatabase } from "../lib/database/startup";
import { postgresTransferRows, quoted } from "./helpers/postgres-transfer";

const digest = (value: string) => createHash("sha256").update(value).digest("hex");
async function legacyRows() {
  const fixture = await postgresTransferRows();
  // 增加旧评论通知及已读关联，覆盖迁移器关闭外键时的显式清理。
  fixture.rows.notification.push({
    id: "comment:old:1",
    kind: "comment",
    sourceId: fixture.ids.parent,
    title: "旧评论",
    href: "/admin/comments",
    createdAt: fixture.later,
    resolvedAt: null,
  });
  fixture.rows.notification_read.push({
    notificationId: "comment:old:1",
    adminId: 1,
    readAt: fixture.later,
  });
  return Object.fromEntries(
    tableSpecs.map((spec) => [
      spec.name,
      fixture.rows[spec.name].map((row) =>
        Object.fromEntries(
          spec.columns.map((column) => [
            column.name,
            column.type === "datetime" && row[column.name] !== null
              ? Date.parse(String(row[column.name]))
              : row[column.name],
          ]),
        ),
      ),
    ]),
  );
}

void test("旧库升级先备份，彻底删除退役数据且逐字段保留其余记录", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fx-feature-removal-upgrade-"));
  try {
    const folder = join(directory, "legacy-migrations");
    await mkdir(join(folder, "meta"), { recursive: true });
    const journal = JSON.parse(await readFile("drizzle/meta/_journal.json", "utf8"));
    journal.entries = journal.entries.slice(0, -1);
    await writeFile(join(folder, "meta/_journal.json"), JSON.stringify(journal));
    for (const entry of journal.entries)
      await writeFile(join(folder, `${entry.tag}.sql`), await readFile(`drizzle/${entry.tag}.sql`));
    const path = join(directory, "old.sqlite");
    let client = new Sqlite(path);
    client.pragma("foreign_keys=ON");
    migrateDatabase(client, { migrationsFolder: folder });
    const rows = await legacyRows();
    client
      .transaction(() => {
        client.pragma("defer_foreign_keys=ON");
        for (const spec of tableSpecs) {
          const insert = client.prepare(
            `INSERT INTO ${quoted(spec.name)} (${spec.columns.map((c) => quoted(c.name)).join(",")}) VALUES (${spec.columns.map(() => "?").join(",")})`,
          );
          for (const row of rows[spec.name]) insert.run(...spec.columns.map((c) => row[c.name]));
        }
        syncAdminAccount(drizzle(client));
        client
          .prepare(
            "INSERT INTO auth_passkey (id,userId,name,publicKey,credentialID,counter,deviceType,backedUp,createdAt) VALUES (1,1,'保留设备','public-key','credential',2,'singleDevice',0,123)",
          )
          .run();
      })
      .immediate();
    verifyDatabase(client, { migrationsFolder: folder });
    const before = Object.fromEntries(
      client
        .prepare<[], { name: string }>(
          "SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '__drizzle_migrations'",
        )
        .all()
        .map(({ name }) => [
          name,
          client
            .prepare<[], Record<string, unknown>>(`SELECT * FROM ${quoted(name)} ORDER BY rowid`)
            .all(),
        ]),
    );
    client.close();
    const result = await prepareDatabase({
      databasePath: path,
      backupDirectory: join(directory, "backups"),
    });
    assert.equal(result.appliedBefore, 3);
    assert.equal(result.appliedAfter, 4);
    assert.ok(result.backupId);
    const backup = new Sqlite(
      join(directory, "backups", "startup", result.backupId, "database.sqlite"),
      { readonly: true },
    );
    assert.equal(
      backup.prepare<[], { count: number }>("SELECT count(*) AS count FROM comment").get()?.count,
      rows.comment.length,
    );
    backup.close();
    client = new Sqlite(path, { readonly: true });
    try {
      verifyDatabase(client);
      for (const [name, records] of Object.entries(before)) {
        if (removedTables.has(name)) {
          assert.equal(
            client.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(name),
            undefined,
          );
          continue;
        }
        const expected = records
          .filter((row) => name !== "notification" || row.kind !== "comment")
          .filter((row) => name !== "notification_read" || row.notificationId !== "comment:old:1")
          .map((row) =>
            Object.fromEntries(
              Object.entries(row).filter(
                ([key]) => name !== "site_setting" || !removedSettingFields.has(key),
              ),
            ),
          );
        assert.deepEqual(
          client.prepare(`SELECT * FROM ${quoted(name)} ORDER BY rowid`).all(),
          expected,
          name,
        );
      }
    } finally {
      client.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

void test("旧源归档 dry-run／apply／verify 跳过退役表、设置字段和评论通知", async () => {
  const directory = await mkdtemp(join(tmpdir(), "fx-feature-removal-import-"));
  try {
    const archive = join(directory, "archive");
    await mkdir(archive);
    const rows = await legacyRows();
    const tables = [];
    for (const spec of tableSpecs) {
      rows[spec.name].sort((a, b) => {
        for (const key of spec.primaryKey) {
          const left = a[key],
            right = b[key];
          const order =
            typeof left === "number" && typeof right === "number"
              ? left - right
              : Buffer.compare(Buffer.from(String(left)), Buffer.from(String(right)));
          if (order) return order;
        }
        return 0;
      });
      const bytes = rows[spec.name].map((row) => JSON.stringify(row) + "\n").join("");
      await writeFile(join(archive, `${spec.name}.jsonl`), bytes);
      tables.push({
        name: spec.name,
        rowCount: rows[spec.name].length,
        bytes: Buffer.byteLength(bytes),
        sha256: digest(bytes),
      });
    }
    await writeFile(
      join(archive, "manifest.json"),
      JSON.stringify({
        format: "fuxiaochen-postgresql-transfer",
        version: 1,
        createdAt: "2026-10-14T00:00:00.000Z",
        sourceContractSha256,
        targetSchemaSha256: targetSchemaSha256(),
        snapshot: "independent-test",
        tables,
      }),
    );
    const target = join(directory, "import.sqlite");
    for (const mode of ["dry-run", "apply", "verify"] as const) {
      const report = await importArchive({
        mode,
        directory: archive,
        targetPath: target,
        reportPath: join(directory, `${mode}.json`),
      });
      for (const table of report.tables.filter((entry) => removedTables.has(entry.name))) {
        assert.equal(table.disposition, "omitted");
        assert.equal(table.planned.rowCount, 0);
        assert.equal(table.target, null);
      }
      assert.ok(
        !Object.hasOwn(
          report.tables.find((table) => table.name === "site_setting")!.planned.fields,
          "enableComments",
        ),
      );
    }
    const client = new Sqlite(target, { readonly: true });
    try {
      verifyDatabase(client);
      assert.equal(
        client.prepare("SELECT 1 FROM notification WHERE kind='comment'").get(),
        undefined,
      );
      assert.equal(
        client
          .prepare("SELECT 1 FROM notification_read WHERE notificationId='comment:old:1'")
          .get(),
        undefined,
      );
      const settings = client
        .prepare<[], Record<string, unknown>>("SELECT * FROM site_setting")
        .get()!;
      for (const name of ["googleId", "googleEnabled", "baiduId", "baiduEnabled"])
        assert.equal(settings[name], rows.site_setting[0][name]);
    } finally {
      client.close();
    }
    // 不接受旧目标 hash，不放宽已有版本一致性限制。
    const manifest = JSON.parse(await readFile(join(archive, "manifest.json"), "utf8"));
    await writeFile(
      join(archive, "manifest.json"),
      JSON.stringify({ ...manifest, targetSchemaSha256: "0".repeat(64) }),
    );
    await assert.rejects(
      importArchive({
        mode: "dry-run",
        directory: archive,
        targetPath: target,
        reportPath: join(directory, "mismatch.json"),
      }),
      /版本/,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
