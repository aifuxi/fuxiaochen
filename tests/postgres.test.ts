import "dotenv/config";
import assert from "node:assert/strict";
import { execFile, spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { promisify } from "node:util";
import { Client } from "pg";

const execute = promisify(execFile);
const prefix = `fx_test_${Date.now()}_${randomUUID().slice(0, 8)}`;
const names = [prefix, `${prefix}_restore`, `${prefix}_failed`];
const base = new URL(process.env.DATABASE_URL!);
const admin = new Client({
  host: base.hostname,
  port: Number(base.port || 5432),
  user: "postgres",
  password: process.env.POSTGRES_ADMIN_PASSWORD,
  database: "postgres",
});
const urlFor = (name: string) => {
  const url = new URL(base);
  url.pathname = `/${name}`;
  return url.toString();
};
process.env.DATABASE_URL = urlFor(prefix);
let temporary: string;
let database: typeof import("../prisma/db");
let auth: typeof import("../lib/auth/service");
let actor: { adminId: number; sessionToken: string };
let postId: string;
let categoryId: string;
let content: string;
const password = "postgres-integration-test-password";

before(async () => {
  await admin.connect();
  for (const name of names)
    await admin.query(`CREATE DATABASE "${name}" OWNER "${decodeURIComponent(base.username)}"`);
  temporary = await mkdtemp(join(tmpdir(), "fx-postgres-test-"));
  process.env.BACKUP_DIRECTORY = temporary;
  const migrated = spawnSync(process.execPath, ["--import", "tsx", "scripts/migrate.ts"], {
    env: process.env,
    encoding: "utf8",
    timeout: 30_000,
  });
  assert.equal(migrated.status, 0, "独立测试库迁移成功");
  database = await import("../prisma/db");
  auth = await import("../lib/auth/service");
  const { hashPassword } = await import("../lib/auth/password");
  const now = new Date();
  const passwordHash = await hashPassword(password);
  await database.writeTransaction((tx) =>
    tx.orm.public.Admin.create({
      id: 1,
      username: "test_admin",
      passwordHash,
      createdAt: now,
      updatedAt: now,
    }),
  );
  const token = await auth.login({ username: "test_admin", password }, undefined);
  assert.ok(token);
  actor = { adminId: 1, sessionToken: token };
  const taxonomy = await import("../lib/taxonomy/service");
  const { categorySchema, tagSchema } = await import("../lib/taxonomy/schema");
  const category = await taxonomy.createCategory(
    categorySchema.parse({ name: "数据库", color: "#123456" }),
    actor,
  );
  categoryId = category.id;
  const tag = await taxonomy.createTag(tagSchema.parse({ name: "PostgreSQL" }), actor);
  const { serializeDocument } = await import("../lib/posts/document");
  content = serializeDocument({
    type: "doc",
    content: [{ type: "paragraph", content: [{ type: "text", text: "正文检索 100%_SQL" }] }],
  });
  const posts = await import("../lib/posts/service");
  const { postSchema } = await import("../lib/posts/schema");
  const post = await posts.createPost(
    postSchema.parse({
      title: "数据库文章",
      slug: "postgres-test",
      categoryId,
      tagIds: [tag.id],
      content,
      status: "published",
      scheduledFor: null,
    }),
    actor,
  );
  postId = post.id;
});

after(async () => {
  if (database) await database.getDatabase().close();
  for (const name of names) {
    await admin.query(`DROP DATABASE IF EXISTS "${name}" WITH (FORCE)`);
  }
  await admin.end();
  if (temporary) await rm(temporary, { recursive: true, force: true });
});

void test("普通账号、迁移可重复执行、时间与大整数 round-trip", async () => {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  try {
    await client.connect();
    assert.equal(
      (await client.query("SELECT rolsuper FROM pg_roles WHERE rolname = current_user")).rows[0]
        .rolsuper,
      false,
    );
  } finally {
    await client.end();
  }
  const migration = spawnSync(process.execPath, ["--import", "tsx", "scripts/migrate.ts"], {
    env: process.env,
    encoding: "utf8",
    timeout: 30_000,
  });
  assert.equal(migration.status, 0);
  const date = new Date("2026-10-05T00:00:00.123Z");
  const row = await database.writeTransaction((tx) =>
    tx.orm.public.LoginRateLimit.create({ id: 991, window: 5_000_000_000, count: 0 }),
  );
  assert.equal(row.window, 5_000_000_000);
  const stored = await database.writeTransaction((tx) =>
    tx.orm.public.Post.where({ id: postId }).update({ updatedAt: date }),
  );
  assert.equal(stored?.updatedAt.toISOString(), date.toISOString());
});

void test("SEO 设置兼容旧空值、校验验证码、持久化与版本冲突", async () => {
  const settings = await import("../lib/settings/service");
  const { defaultSettings, settingsSchema } = await import("../lib/settings/schema");
  const seoKeys = [
    "seoDescription",
    "ogImageUrl",
    "googleVerification",
    "bingVerification",
    "baiduVerification",
  ] as const;
  const legacy = Object.fromEntries(
    Object.entries(defaultSettings).filter(([key]) => !seoKeys.some((seoKey) => seoKey === key)),
  );
  const defaults = settingsSchema.parse(legacy);
  for (const key of seoKeys) assert.equal(defaults[key], "");
  assert.equal(
    settingsSchema.safeParse({ ...defaultSettings, seoDescription: "描".repeat(301) }).success,
    false,
  );
  assert.equal(
    settingsSchema.safeParse({ ...defaultSettings, ogImageUrl: "javascript:alert(1)" }).success,
    false,
  );
  for (const key of seoKeys.filter((fieldName) => fieldName.endsWith("Verification"))) {
    assert.equal(
      settingsSchema.safeParse({ ...defaultSettings, [key]: '<meta content="token">' }).success,
      false,
    );
    assert.equal(
      settingsSchema.safeParse({ ...defaultSettings, [key]: "a".repeat(201) }).success,
      false,
    );
  }
  await settings.getSettings(actor);
  await database.writeTransaction((tx) =>
    tx.orm.public.SiteSetting.where({ id: 1 }).update({
      seoDescription: null,
      ogImageUrl: null,
      googleVerification: null,
      bingVerification: null,
      baiduVerification: null,
    }),
  );
  const previous = await settings.getSettings(actor);
  for (const key of seoKeys) assert.equal(previous[key], "");
  const input = settingsSchema.parse({
    ...defaultSettings,
    version: previous.version,
    seoDescription: "  独立站点搜索描述  ",
    ogImageUrl: "/seo-share.png",
    googleVerification: "  google_test-123  ",
    bingVerification: "BING123",
    baiduVerification: "baidu_456",
  });
  const saved = await settings.saveSettings(input, actor);
  assert.equal(saved.version, previous.version + 1);
  const reloaded = await settings.getSettings(actor);
  for (const key of seoKeys) assert.equal(reloaded[key], input[key]);
  await assert.rejects(
    settings.saveSettings(input, actor),
    (error: unknown) =>
      error instanceof Error && "code" in error && error.code === "VERSION_CONFLICT",
  );
  const cleared = await settings.saveSettings(
    settingsSchema.parse({ ...defaultSettings, version: saved.version }),
    actor,
  );
  for (const key of seoKeys) assert.equal(cleared[key], "");
});

void test("JSON 正文与字面关键词搜索、分类关系和乐观锁", async () => {
  const posts = await import("../lib/posts/service");
  const { postQuerySchema, featuredPostSchema } = await import("../lib/posts/schema");
  for (const q of ["100%_SQL", "数据库", "PostgreSQL"]) {
    const result = await posts.listPosts(postQuerySchema.parse({ q, sortBy: "time" }), actor);
    assert.equal(result.total, 1);
    assert.equal(typeof result.total, "number");
  }
  assert.equal(
    (await posts.listPosts(postQuerySchema.parse({ q: "not%_present", sortBy: "status" }), actor))
      .total,
    0,
  );
  const taxonomy = await import("../lib/taxonomy/service");
  assert.equal((await taxonomy.listCategories(actor))[0].posts, 1);
  await assert.rejects(taxonomy.deleteCategory(categoryId, actor));
  // 请求数超过默认池容量，鉴权必须复用持锁事务连接。
  const concurrent = await Promise.all(
    Array.from({ length: 21 }, (_, i) => taxonomy.createTag({ name: `并发标签${i}` }, actor)),
  );
  assert.equal(concurrent.length, 21);
  const changed = await Promise.allSettled(
    [true, false].map((isFeatured) =>
      posts.updatePostFeatured(postId, featuredPostSchema.parse({ isFeatured, version: 1 }), actor),
    ),
  );
  assert.equal(changed.filter((r) => r.status === "fulfilled").length, 1);
  assert.equal(changed.filter((r) => r.status === "rejected").length, 1);
});

void test("评论幂等提交、审核、通知布尔/时间解码与全局搜索", async () => {
  const comments = await import("../lib/public/comments");
  const { publicCommentSchema } = await import("../lib/public/schema");
  const input = publicCommentSchema.parse({
    author: "留言者",
    email: "test@example.com",
    content: "待审核 PostgreSQL",
    submissionId: randomUUID(),
  });
  await comments.submitPublicComment(postId, input);
  await comments.submitPublicComment(postId, input);
  const service = await import("../lib/comments/service");
  const { commentQuerySchema } = await import("../lib/comments/schema");
  const result = await service.listComments(
    commentQuerySchema.parse({ q: "PostgreSQL", sortBy: "status" }),
    actor,
  );
  assert.equal(result.total, 1);
  const notifications = await import("../lib/operations/notifications");
  const { notificationQuerySchema, searchSchema } = await import("../lib/operations/schema");
  const listed = await notifications.getNotifications(notificationQuerySchema.parse({}), actor);
  assert.equal(listed.items.length, 1);
  assert.equal(listed.items[0].read, false);
  assert.ok(Number.isFinite(Date.parse(listed.items[0].createdAt)));
  await notifications.readNotifications([listed.items[0].id], actor);
  assert.equal(
    (await notifications.getNotifications(notificationQuerySchema.parse({}), actor)).items[0].read,
    true,
  );
  const { searchContent } = await import("../lib/operations/search");
  assert.ok((await searchContent(searchSchema.parse({ q: "PostgreSQL" }), actor)).total >= 2);
  await service.moderateComment(result.items[0].id, { status: "approved", version: 1 }, actor);
  assert.equal((await comments.listPublicComments(postId, 1)).total, 1);
});

void test("更新日志 JSON 数组、友链排序、媒体元数据和设置", async () => {
  const { listQuerySchema } = await import("../lib/admin/schema");
  const changelog = await import("../lib/changelog/service");
  await changelog.createRelease(
    { version: "1.0", title: "更新日志", type: "feature", changes: ["数组内关键字 100%_SQL"] },
    actor,
  );
  assert.equal(
    (await changelog.listReleases(listQuerySchema.parse({ q: "100%_SQL" }), actor)).total,
    1,
  );
  const { searchContent } = await import("../lib/operations/search");
  const { searchSchema } = await import("../lib/operations/schema");
  assert.ok(
    (await searchContent(searchSchema.parse({ q: "100%_SQL", kind: "release" }), actor)).items
      .length,
  );
  const friends = await import("../lib/friends-links/service");
  const { friendQuerySchema } = await import("../lib/friends-links/schema");
  await friends.createFriend(
    {
      name: "友链测试",
      url: "https://example.com",
      avatar: "",
      description: "100%_SQL",
      category: "技术博客",
      enabled: true,
    },
    actor,
  );
  assert.equal(
    (await friends.listFriends(friendQuerySchema.parse({ q: "100%_SQL", sortBy: "status" }), actor))
      .total,
    1,
  );
  const id = randomUUID();
  const now = new Date();
  await database.writeTransaction((tx) =>
    tx.orm.public.Media.create({
      id,
      adminId: 1,
      name: "100%_SQL.png",
      kind: "image",
      expectedBytes: 100,
      sha256: "0".repeat(64),
      stagingKey: `staging/${id}`,
      objectKey: `media/${id}`,
      status: "ready",
      createdAt: now,
      expiresAt: now,
      bytes: 100,
      mime: "image/png",
      width: 1,
      height: 1,
      uploadedAt: now,
    }),
  );
  const { listMedia } = await import("../lib/media/service");
  const { mediaQuerySchema } = await import("../lib/media/schema");
  assert.equal((await listMedia(mediaQuerySchema.parse({ q: "100%_SQL" }), actor)).total, 1);
  const { getSettings, saveSettings } = await import("../lib/settings/service");
  const settings = await getSettings(actor);
  assert.ok(settings.version);
  const saved = await saveSettings(
    { ...settings, title: "测试站点", localAnalyticsEnabled: true },
    actor,
  );
  assert.equal(saved.title, "测试站点");
});

void test("统计聚合、访客清理和上海跨日分组", async () => {
  const now = Date.now();
  const { shanghaiMidnight, shanghaiDay, getAnalytics, listVisitors } =
    await import("../lib/analytics/service");
  const { visitorQuerySchema } = await import("../lib/analytics/schema");
  const midnight = shanghaiMidnight(now);
  const at = [midnight - 1, midnight + 1];
  await database.writeTransaction(async (tx) => {
    for (const time of at) {
      const id = randomUUID();
      const date = new Date(time);
      const hash = randomUUID();
      await tx.orm.public.VisitSession.create({
        id,
        visitorHash: hash,
        createdAt: date,
        lastSeenAt: date,
      });
      await tx.orm.public.PageVisit.create({
        id: randomUUID(),
        visitorHash: hash,
        sessionId: id,
        path: "/posts/postgres-test",
        postId,
        article: 1,
        source: "direct",
        referrerHost: "",
        device: "desktop",
        browser: "Test",
        os: "Test",
        ip: "未知",
        location: "未知",
        createdAt: date,
        lastSeenAt: date,
        durationMs: 20_000,
        progress: 100,
      });
    }
  });
  const result = await getAnalytics("7d", actor);
  assert.equal(result.metrics.pv, 2);
  assert.equal(result.metrics.durationMs, 20_000);
  assert.equal(result.trend.find((r) => r.date === shanghaiDay(midnight - 1))?.pv, 1);
  assert.equal(result.trend.find((r) => r.date === shanghaiDay(midnight + 1))?.pv, 1);
  assert.equal(result.articles[0].rate, 100);
  assert.equal((await listVisitors(visitorQuerySchema.parse({ q: "postgres" }), actor)).total, 2);
});

void test("多个 Node 进程共享写锁，不丢失读改写增量", async () => {
  const code = `import {getDatabase,writeTransaction} from './prisma/db.ts'; try {for(let i=0;i<5;i++) await writeTransaction(async tx=>{const row=await tx.orm.public.LoginRateLimit.where({id:991}).first(); await new Promise(resolve=>setTimeout(resolve,10)); await tx.orm.public.LoginRateLimit.where({id:991}).update({count:row.count+1});});}finally{await getDatabase().close();}`;
  await Promise.all(
    Array.from({ length: 3 }, () =>
      execute(
        process.execPath,
        ["--conditions=react-server", "--import", "tsx", "--input-type=module", "-e", code],
        { env: process.env, timeout: 30_000 },
      ),
    ),
  );
  assert.equal(
    (await database.getDatabase().orm.public.LoginRateLimit.where({ id: 991 }).first())?.count,
    15,
  );
});

void test("排期发布幂等、登录限流与登录/退出", async () => {
  const posts = await import("../lib/posts/service");
  const { postSchema } = await import("../lib/posts/schema");
  const scheduled = await posts.createPost(
    postSchema.parse({
      title: "排期测试",
      slug: "scheduled-test",
      content,
      categoryId,
      tagIds: [],
      status: "scheduled",
      scheduledFor: new Date(Date.now() + 60_000).toISOString(),
    }),
    actor,
  );
  await database.writeTransaction((tx) =>
    tx.orm.public.Post.where({ id: scheduled.id }).update({
      scheduledFor: new Date(Date.now() - 1000),
    }),
  );
  const { publishDuePosts } = await import("../lib/operations/scheduler");
  const results = await Promise.all([publishDuePosts(), publishDuePosts()]);
  assert.equal(
    results.reduce((sum, result) => sum + result.published, 0),
    1,
  );
  await database.writeTransaction((tx) =>
    tx.orm.public.LoginRateLimit.where({ id: 1 }).deleteAndCount(),
  );
  const attempts = await Promise.all(Array.from({ length: 21 }, () => auth.consumeLoginAttempt()));
  assert.equal(attempts.filter((a) => a.allowed).length, 20);
  assert.equal(
    await auth.login({ username: "test_admin", password: "wrong-password" }, undefined),
    null,
  );
  const token = await auth.login({ username: "test_admin", password }, undefined);
  assert.ok(token);
  assert.ok(await auth.getSession(token));
  await auth.logout(token);
  assert.equal(await auth.getSession(token), null);
});

void test("真实备份/恢复、会话撤销、非空目标拒绝和事务失败回滚", async () => {
  const operations = await import("../lib/operations/settings");
  const settings = await operations.getOperationSettings(actor);
  await operations.saveOperationSettings({ version: settings.version, autoBackup: true }, actor);
  const { createBackup } = await import("../lib/operations/backups");
  const backup = await createBackup(randomUUID());
  assert.equal(backup.status, "complete");
  const directory = join(temporary, backup.id);
  const restore = (path: string, name: string) =>
    spawnSync(
      process.execPath,
      ["--conditions=react-server", "--import", "tsx", "scripts/restore-backup.ts", path],
      {
        env: { ...process.env, RESTORE_DATABASE_URL: urlFor(name) },
        encoding: "utf8",
        timeout: 30_000,
      },
    );
  const restored = restore(directory, names[1]);
  assert.equal(restored.status, 0, restored.stderr);
  const client = new Client({ connectionString: urlFor(names[1]) });
  try {
    await client.connect();
    assert.equal(
      (await client.query("SELECT count(*)::int AS total FROM public.session")).rows[0].total,
      0,
    );
    assert.equal(
      (
        await client.query(
          'SELECT "autoBackup", "schedulerLastRunAt" FROM public.operation_setting',
        )
      ).rows[0].autoBackup,
      "0",
    );
    assert.equal(
      (await client.query("SELECT count(*)::int AS total FROM public.post")).rows[0].total,
      2,
    );
    const verify = spawnSync(
      process.execPath,
      ["node_modules/prisma/dist/prisma.js", "db", "verify"],
      {
        env: { ...process.env, DATABASE_URL: urlFor(names[1]) },
        encoding: "utf8",
        timeout: 30_000,
      },
    );
    assert.equal(verify.status, 0);
  } finally {
    await client.end();
  }
  assert.equal(restore(directory, names[1]).status, 1);
  assert.equal(restore(directory, names[0]).status, 1);
  const manifestPath = join(directory, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  await writeFile(manifestPath, JSON.stringify({ ...manifest, sha256: "0".repeat(64) }));
  assert.equal(restore(directory, names[2]).status, 1);
  await writeFile(manifestPath, JSON.stringify(manifest));
  const incomplete = join(temporary, "incomplete");
  const { mkdir } = await import("node:fs/promises");
  await mkdir(incomplete);
  const archive = join(incomplete, "database.dump");
  const { runPostgresTool } = await import("../lib/operations/postgres-tools");
  await runPostgresTool(
    "pg_dump",
    [
      "--format=custom",
      "--no-owner",
      "--no-privileges",
      "--exclude-table=public.operation_setting",
      "--file",
      archive,
    ],
    process.env.DATABASE_URL,
  );
  const { fileDigest } = await import("../lib/operations/backup-files");
  await writeFile(
    join(incomplete, "manifest.json"),
    JSON.stringify({
      ...manifest,
      bytes: (await stat(archive)).size,
      sha256: await fileDigest(archive),
    }),
  );
  assert.equal(restore(incomplete, names[2]).status, 1);
  const failed = new Client({ connectionString: urlFor(names[2]) });
  try {
    await failed.connect();
    assert.equal(
      (
        await failed.query(
          "SELECT count(*)::int AS total FROM pg_tables WHERE schemaname = 'public'",
        )
      ).rows[0].total,
      0,
    );
  } finally {
    await failed.end();
  }
});

await test("全局检索精确定位，并绕过列表原筛选条件", async () => {
  const { searchContent } = await import("../lib/operations/search");
  const { searchSchema } = await import("../lib/operations/schema");
  const matches = await searchContent(searchSchema.parse({ q: "100%_SQL" }), actor);
  for (const item of matches.items.filter((match) => match.kind !== "post")) {
    assert.ok(item.href.includes(`record=${item.id}`));
  }
  const friend = matches.items.find((item) => item.kind === "friend");
  assert.ok(friend);
  const { listFriends } = await import("../lib/friends-links/service");
  const { friendQuerySchema } = await import("../lib/friends-links/schema");
  const exact = await listFriends(
    friendQuerySchema.parse({
      record: friend.id,
      q: "不存在",
      status: "rejected",
      enabled: "false",
    }),
    actor,
  );
  assert.equal(exact.total, 1);
  assert.equal(exact.items[0].id, friend.id);
  assert.equal(
    (await listFriends(friendQuerySchema.parse({ record: randomUUID() }), actor)).total,
    0,
  );
});
