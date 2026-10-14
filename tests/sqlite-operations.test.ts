import Sqlite from "better-sqlite3";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { after, before, test } from "node:test";

import { writeTransaction } from "../lib/database";
import { verifyDatabase } from "../lib/database/migrations";
import * as tables from "../lib/database/schema";
import { createBackup, listBackups } from "../lib/operations/backups";
import { getNotifications, readNotifications } from "../lib/operations/notifications";
import { runScheduledOperations } from "../lib/operations/scheduler";
import { getOperationSettings, saveOperationSettings } from "../lib/operations/settings";
import { createTestDatabase } from "./helpers/sqlite";

let context: Awaited<ReturnType<typeof createTestDatabase>>;
const now = new Date();
before(async () => {
  context = await createTestDatabase();
  writeTransaction((tx) => {
    tx.insert(tables.category)
      .values({
        id: "category",
        name: "测试分类",
        nameKey: "测试分类",
        color: "#000000",
        createdAt: now,
      })
      .run();
    tx.insert(tables.releaseLog)
      .values({
        id: "release",
        version: "test",
        title: "日志",
        type: "feature",
        changes: JSON.stringify(["Drizzle 变化"]),
        createdAt: now,
      })
      .run();
    tx.insert(tables.friendLink)
      .values({
        id: "friend",
        name: "友链",
        url: "https://example.test",
        avatar: "",
        description: "描述",
        category: "friend",
        status: "pending",
        enabled: 1,
        createdAt: now,
        updatedAt: now,
        version: 1,
      })
      .run();
    tx.insert(tables.siteSetting)
      .values({
        id: 1,
        title: "test",
        subtitle: "",
        authorName: "test",
        authorRole: "",
        avatarUrl: "",
        aboutMe: "",
        postsPerPage: 10,
        icpText: "",
        icpUrl: "",
        policeText: "",
        policeUrl: "",
        googleEnabled: 0,
        googleId: "",
        baiduEnabled: 0,
        baiduId: "",
        version: 1,
        updatedAt: now,
      })
      .run();
  });
});
after(async () => context?.cleanup());

void test("通知同步幂等、已读与来源版本变化自动解决旧通知", async () => {
  const query = { page: 1, pageSize: 100 };
  const initial = await getNotifications(query, context.actor);
  const repeated = await getNotifications(query, context.actor);
  assert.equal(repeated.total, initial.total);
  assert.ok(initial.items.find((item) => item.id === "friend:friend:1"));
  const read = await readNotifications(["friend:friend:1", "friend:friend:1"], context.actor);
  assert.equal(read.unreadCount, initial.unreadCount - 1);
  writeTransaction((tx) => {
    tx.update(tables.friendLink)
      .set({ version: 2 })
      .where(eq(tables.friendLink.id, "friend"))
      .run();
  });
  const changed = await getNotifications(query, context.actor);
  assert.equal(changed.items.find((item) => item.id === "friend:friend:1")?.resolved, true);
  assert.equal(changed.items.find((item) => item.id === "friend:friend:2")?.resolved, false);
  await assert.rejects(
    readNotifications(["missing"], context.actor),
    (error: unknown) => error instanceof Error && "code" in error && error.code === "NOT_FOUND",
  );
});

void test("备份调度关闭时只记录执行时间，不发布文章", async () => {
  const result = await runScheduledOperations();
  assert.deepEqual(result, { backup: null });
  const settings = await getOperationSettings(context.actor);
  assert.ok(settings.schedulerLastRunAt);
});

void test("运维设置初始化及版本冲突保持原有行为", async () => {
  const initial = await getOperationSettings(context.actor);
  assert.equal(initial.autoBackup, false);
  const saved = await saveOperationSettings(
    { version: initial.version, autoBackup: true },
    context.actor,
  );
  assert.equal(saved.autoBackup, true);
  assert.equal(saved.version, initial.version + 1);
  await assert.rejects(
    saveOperationSettings({ version: initial.version, autoBackup: false }, context.actor),
    (error: unknown) =>
      error instanceof Error && "code" in error && error.code === "VERSION_CONFLICT",
  );
});

function restore(directory: string, target: string) {
  return spawnSync(
    process.execPath,
    ["--conditions=react-server", "--import", "tsx", "scripts/restore-backup.ts", directory],
    {
      env: { ...process.env, DATABASE_PATH: context.path, RESTORE_DATABASE_PATH: target },
      encoding: "utf8",
      timeout: 30_000,
    },
  );
}

void test("在线备份包含 WAL 写入，manifest 区分 SQLite，恢复只接受新文件并撤销会话", async () => {
  writeTransaction((tx) => {
    tx.insert(tables.authPasskey)
      .values({
        id: 1,
        userId: 1,
        name: "备份设备",
        publicKey: "backup-test-public-key",
        credentialID: "backup-test-id",
        counter: 2,
        deviceType: "singleDevice",
        backedUp: false,
        createdAt: now,
      })
      .run();
    tx.insert(tables.authVerification)
      .values({
        id: 1,
        identifier: "backup-test-challenge",
        value: "test-only",
        expiresAt: new Date(Date.now() + 60000),
        createdAt: now,
        updatedAt: now,
      })
      .run();
  });
  writeTransaction((tx) =>
    tx
      .insert(tables.tag)
      .values({ id: "latest-wal", name: "刚写入", nameKey: "刚写入", createdAt: new Date() })
      .run(),
  );
  const id = randomUUID();
  const scheduled = await runScheduledOperations();
  assert.equal(scheduled.backup?.status, "complete");
  assert.equal((await runScheduledOperations()).backup?.id, scheduled.backup?.id);
  assert.ok(!Object.hasOwn(scheduled, "publication"));
  const daily = "test-day";
  const backup = await createBackup(id, undefined, daily);
  assert.equal(backup.status, "complete");
  assert.equal((await createBackup(randomUUID(), undefined, daily)).id, id);
  const directory = join(context.directory, "backups", id);
  const path = join(directory, "database.sqlite");
  const manifestPath = join(directory, "manifest.json");
  const manifestText = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(manifestText);
  assert.equal(manifest.format, "fuxiaochen-sqlite-backup");
  assert.equal(manifest.bytes, (await stat(path)).size);
  const snapshot = new Sqlite(path, { readonly: true });
  try {
    verifyDatabase(snapshot);
    assert.ok(snapshot.prepare("SELECT 1 FROM tag WHERE id = ?").get("latest-wal"));
  } finally {
    snapshot.close();
  }
  const target = join(context.directory, "restored.sqlite");
  const restored = restore(directory, target);
  assert.equal(restored.status, 0, restored.stderr);
  const database = new Sqlite(target, { readonly: true });
  try {
    verifyDatabase(database);
    assert.equal(
      database.prepare<[], { total: number }>("SELECT count(*) AS total FROM auth_session").get()
        ?.total,
      0,
    );
    assert.equal(
      database
        .prepare<[], { total: number }>("SELECT count(*) AS total FROM auth_verification")
        .get()?.total,
      0,
    );
    assert.equal(
      database
        .prepare<[], { name: string; counter: number }>("SELECT name,counter FROM auth_passkey")
        .get()?.name,
      "备份设备",
    );
    assert.equal(
      database.prepare<[], { counter: number }>("SELECT counter FROM auth_passkey").get()?.counter,
      2,
    );
    assert.equal(
      database.prepare<[], { autoBackup: number }>("SELECT autoBackup FROM operation_setting").get()
        ?.autoBackup,
      0,
    );
    assert.ok(database.prepare("SELECT 1 FROM tag WHERE id = ?").get("latest-wal"));
    assert.equal(
      database
        .prepare<[string], { status: string }>("SELECT status FROM backup_run WHERE id = ?")
        .get(id)?.status,
      "failed",
    );
  } finally {
    database.close();
  }
  assert.notEqual(restore(directory, target).status, 0, "禁止覆盖已有文件");
  assert.notEqual(restore(directory, context.path).status, 0, "禁止恢复到当前库");
  await writeFile(manifestPath, JSON.stringify({ ...manifest, sha256: "0".repeat(64) }));
  assert.notEqual(restore(directory, join(context.directory, "wrong-digest.sqlite")).status, 0);
  await writeFile(
    manifestPath,
    JSON.stringify({ ...manifest, format: "fuxiaochen-postgresql-backup" }),
  );
  assert.notEqual(restore(directory, join(context.directory, "wrong-format.sqlite")).status, 0);
  await writeFile(manifestPath, manifestText);
  assert.ok(
    (await listBackups({ q: "", page: 1, pageSize: 10 }, context.actor)).items.find(
      (item) => item.id === id,
    ),
  );
});
