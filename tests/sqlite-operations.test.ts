import Sqlite from "better-sqlite3";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { readFile, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { after, before, test } from "node:test";

import { collectEvent } from "../lib/analytics/collection";
import {
  getAnalytics,
  listVisitors,
  shanghaiDay,
  shanghaiMidnight,
} from "../lib/analytics/service";
import { writeTransaction } from "../lib/database";
import { verifyDatabase } from "../lib/database/migrations";
import * as tables from "../lib/database/schema";
import { createBackup, listBackups } from "../lib/operations/backups";
import { getNotifications, readNotifications } from "../lib/operations/notifications";
import { publishDuePosts } from "../lib/operations/scheduler";
import { searchContent } from "../lib/operations/search";
import { getOperationSettings, saveOperationSettings } from "../lib/operations/settings";
import { serializeDocument } from "../lib/posts/document";
import { createTestDatabase } from "./helpers/sqlite";

let context: Awaited<ReturnType<typeof createTestDatabase>>;
const now = new Date();
const content = serializeDocument({
  type: "doc",
  content: [{ type: "paragraph", content: [{ type: "text", text: "正文 SQLite" }] }],
});
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
    tx.insert(tables.post)
      .values([
        {
          id: "post",
          title: "Äpfel %_ 字面",
          slug: "test-post",
          categoryId: "category",
          content,
          status: "scheduled",
          createdAt: now,
          updatedAt: now,
          scheduledFor: new Date(now.getTime() - 1000),
          version: 1,
        },
        {
          id: "invalid",
          title: "",
          content,
          status: "scheduled",
          createdAt: now,
          updatedAt: now,
          scheduledFor: new Date(now.getTime() - 1000),
          version: 1,
        },
      ])
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
    tx.insert(tables.comment)
      .values({
        id: "comment",
        postId: "post",
        author: "访客",
        authorKind: "visitor",
        content: "测试评论",
        status: "pending",
        createdAt: now,
        updatedAt: now,
        version: 1,
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
        enableComments: 1,
        icpText: "",
        icpUrl: "",
        policeText: "",
        policeUrl: "",
        localAnalyticsEnabled: 1,
        localAnalyticsStartedAt: new Date(now.getTime() - 2 * 86_400_000),
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

const search = (q: string, kind: "post" | "release" = "post") =>
  searchContent({ q, kind, page: 1, pageSize: 10 }, context.actor);

void test("全站搜索保留字面 %_、Unicode 大小写与可见正文/日志数组搜索", async () => {
  assert.equal((await search("%_")).total, 1);
  assert.equal((await search("äPFEL")).items[0]?.id, "post");
  assert.equal((await search("SQLite")).items[0]?.id, "post");
  assert.equal((await search("document")).total, 0, "JSON 属性不属于可见正文");
  assert.equal((await search("Drizzle", "release")).items[0]?.id, "release");
  assert.equal((await search("未匹配")).total, 0);
});

void test("通知同步幂等、已读与来源版本变化自动解决旧通知", async () => {
  const query = { page: 1, pageSize: 100 };
  const initial = await getNotifications(query, context.actor);
  const repeated = await getNotifications(query, context.actor);
  assert.equal(repeated.total, initial.total);
  assert.ok(initial.items.find((item) => item.id === "comment:comment:1"));
  assert.ok(initial.items.find((item) => item.id === "friend:friend:1"));
  const read = await readNotifications(["comment:comment:1", "comment:comment:1"], context.actor);
  assert.equal(read.unreadCount, initial.unreadCount - 1);
  writeTransaction((tx) => {
    tx.update(tables.comment)
      .set({ status: "approved", version: 2 })
      .where(eq(tables.comment.id, "comment"))
      .run();
    tx.update(tables.friendLink)
      .set({ version: 2 })
      .where(eq(tables.friendLink.id, "friend"))
      .run();
  });
  const changed = await getNotifications(query, context.actor);
  assert.equal(changed.items.find((item) => item.id === "comment:comment:1")?.resolved, true);
  assert.equal(changed.items.find((item) => item.id === "friend:friend:1")?.resolved, true);
  assert.equal(changed.items.find((item) => item.id === "friend:friend:2")?.resolved, false);
  await assert.rejects(
    readNotifications(["missing"], context.actor),
    (error: unknown) => error instanceof Error && "code" in error && error.code === "NOT_FOUND",
  );
});

void test("排期发布验证内容、保持重复执行幂等与失败通知幂等", async () => {
  const published = await publishDuePosts(context.actor);
  assert.equal(published.published, 1);
  assert.equal(published.skipped, 1);
  const repeated = await publishDuePosts(context.actor);
  assert.equal(repeated.published, 0);
  assert.equal(repeated.skipped, 1);
  const post = context.db.select().from(tables.post).where(eq(tables.post.id, "post")).get()!;
  assert.equal(post.status, "published");
  assert.equal(post.version, 2);
  assert.equal(post.scheduledFor, null);
  assert.ok(post.publishedAt instanceof Date);
  assert.ok(post.slugLockedAt instanceof Date);
  assert.equal(
    context.db
      .select()
      .from(tables.notification)
      .where(eq(tables.notification.id, "schedule-error:invalid:1"))
      .all().length,
    1,
  );
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

void test("统计按北京时间跨日分组，聚合 PV/UV、阅读完成率和访客字面搜索", async () => {
  const midnight = shanghaiMidnight(Date.now());
  writeTransaction((tx) => {
    tx.insert(tables.visitSession)
      .values({
        id: "stats-session",
        visitorHash: "stats-visitor",
        createdAt: new Date(midnight - 1),
        lastSeenAt: new Date(Date.now() - 31 * 60_000),
      })
      .run();
    const visit = {
      visitorHash: "stats-visitor",
      sessionId: "stats-session",
      postId: "post",
      article: 1,
      source: "直接访问",
      referrerHost: "",
      device: "desktop",
      browser: "测试浏览器",
      os: "测试系统",
      ip: "127.0.0.0/24",
      location: "未知",
      lastSeenAt: new Date(Date.now() - 31 * 60_000),
      durationMs: 10_000,
      progress: 95,
    };
    tx.insert(tables.pageVisit)
      .values([
        {
          ...visit,
          id: "stats-before",
          path: "/posts/test-post",
          createdAt: new Date(midnight - 1),
        },
        { ...visit, id: "stats-after", path: "/%_", createdAt: new Date(midnight + 1) },
      ])
      .run();
  });
  const result = await getAnalytics("7d", context.actor);
  assert.equal(result.metrics.pv, 2);
  assert.equal(result.metrics.uv, 1);
  assert.equal(result.metrics.durationMs, 10_000);
  assert.equal(result.articles[0]?.rate, 100);
  assert.equal(result.trend.find((item) => item.date === shanghaiDay(midnight - 1))?.pv, 1);
  assert.equal(result.trend.find((item) => item.date === shanghaiDay(midnight + 1))?.pv, 1);
  const visitors = await listVisitors(
    { q: "%_", page: 1, pageSize: 10, sortBy: "time", sortDirection: "desc" },
    context.actor,
  );
  assert.equal(visitors.total, 1);
  assert.equal(visitors.items[0]?.id, "stats-after");
  assert.equal(visitors.summary.pv, 1);
  assert.equal(visitors.summary.uv, 1);
});

void test("访问采集幂等更新、会话和每访客限流在真实 SQLite 事务中生效", async (t) => {
  const oldMode = process.env.NODE_ENV;
  Object.assign(process.env, { NODE_ENV: "production" });
  t.mock.timers.enable({ apis: ["Date"], now: Date.now() });
  try {
    const visitorId = randomUUID();
    const event = {
      pageViewId: randomUUID(),
      visitorId,
      path: "/posts/test-post",
      referrer: "",
      durationMs: 0,
      progress: 25,
      visible: true,
    };
    const headers = new Headers({ "user-agent": "Mozilla/5.0" });
    for (let index = 0; index < 30; index++) await collectEvent(event, headers);
    const visits = context.db
      .select()
      .from(tables.pageVisit)
      .where(eq(tables.pageVisit.id, event.pageViewId))
      .all();
    assert.equal(visits.length, 1);
    assert.ok(visits[0]?.createdAt instanceof Date);
    const hash = createHash("sha256").update(visitorId).digest("hex");
    assert.equal(
      context.db
        .select()
        .from(tables.visitSession)
        .where(eq(tables.visitSession.visitorHash, hash))
        .all().length,
      1,
    );
    await assert.rejects(
      collectEvent(event, headers),
      (error: unknown) =>
        error instanceof Error && "code" in error && error.code === "RATE_LIMITED",
    );
    await assert.rejects(
      collectEvent({ ...event, visitorId: randomUUID() }, headers),
      (error: unknown) =>
        error instanceof Error && "code" in error && error.code === "EVENT_CONFLICT",
    );
  } finally {
    t.mock.timers.reset();
    if (oldMode === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.assign(process.env, { NODE_ENV: oldMode });
  }
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
  writeTransaction((tx) =>
    tx
      .insert(tables.tag)
      .values({ id: "latest-wal", name: "刚写入", nameKey: "刚写入", createdAt: new Date() })
      .run(),
  );
  const id = randomUUID();
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
      database.prepare<[], { total: number }>("SELECT count(*) AS total FROM session").get()?.total,
      0,
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
