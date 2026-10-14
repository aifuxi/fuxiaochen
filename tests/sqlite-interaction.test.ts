import {
  CopyObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { and, count, eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { Readable } from "node:stream";
import { after, before, beforeEach, test } from "node:test";

import { resetAdminPassword } from "../lib/auth/accounts";
import { hashPassword } from "../lib/auth/password";
import { consumeLoginAttempt, getSession, logout } from "../lib/auth/service";
import { getDatabase, writeTransaction } from "../lib/database";
import {
  admin,
  friendLink,
  loginRateLimit,
  media,
  mediaUploadLimit,
  post,
  authSession as session,
} from "../lib/database/schema";
import { friendQuerySchema } from "../lib/friends-links/schema";
import * as friends from "../lib/friends-links/service";
import { ensureNewMediaReferences } from "../lib/media/references";
import { mediaQuerySchema } from "../lib/media/schema";
import * as mediaService from "../lib/media/service";
import { closeStorage, publicMediaUrl } from "../lib/media/storage";
import { serializeDocument } from "../lib/posts/document";
import { createTestDatabase, loginToken as login } from "./helpers/sqlite";

let fixture: Awaited<ReturnType<typeof createTestDatabase>>;
let username: string;

before(async () => {
  fixture = await createTestDatabase();
  username = getDatabase()
    .select({ username: admin.username })
    .from(admin)
    .where(eq(admin.id, 1))
    .get()!.username;
  // 所有媒体请求使用虚构配置，并在需要请求的用例中替换 SDK；不读取真实 OSS 凭据。
  Object.assign(process.env, {
    APP_ORIGIN: "https://sqlite-test.example",
    OSS_BUCKET: "sqlite-test-bucket",
    OSS_REGION: "cn-hangzhou",
    OSS_SERVER_ENDPOINT: "https://s3.oss-cn-hangzhou.aliyuncs.com",
    OSS_UPLOAD_ENDPOINT: "https://s3.oss-cn-hangzhou.aliyuncs.com",
    OSS_PUBLIC_ORIGIN: "https://media.sqlite-test.example",
    OSS_CREDENTIAL_MODE: "environment",
    ALIBABA_CLOUD_ACCESS_KEY_ID: "sqlite-test-access-key",
    ALIBABA_CLOUD_ACCESS_KEY_SECRET: "sqlite-test-secret-key",
  });
});

after(async () => {
  closeStorage();
  if (fixture) await fixture.cleanup();
});

beforeEach(() => {
  writeTransaction((tx) => {
    tx.delete(post).run();
    tx.delete(friendLink).run();
    tx.delete(media).run();
    tx.delete(mediaUploadLimit).run();
    tx.delete(loginRateLimit).run();
  });
});

function seedPost(status = "published") {
  const id = randomUUID();
  const now = new Date();
  writeTransaction((tx) =>
    tx
      .insert(post)
      .values({
        id,
        title: "SQLite 100%_Äpfel",
        slug: `sqlite-${id}`,
        content: serializeDocument({ type: "doc", content: [{ type: "paragraph" }] }),
        status,
        createdAt: now,
        updatedAt: now,
        publishedAt: status === "published" ? now : null,
        version: 1,
      })
      .run(),
  );
  return id;
}

function seedMedia(fields: Partial<typeof media.$inferInsert> = {}) {
  const id = randomUUID();
  const now = new Date();
  writeTransaction((tx) =>
    tx
      .insert(media)
      .values({
        id,
        adminId: 1,
        name: "100%_Äpfel.txt",
        kind: "attachment",
        expectedBytes: 10,
        sha256: "0".repeat(64),
        stagingKey: `staging/${id}`,
        objectKey: `media/${id}`,
        status: "ready",
        createdAt: now,
        expiresAt: new Date(now.getTime() - 1),
        bytes: 10,
        mime: "application/octet-stream",
        uploadedAt: now,
        ...fields,
      })
      .run(),
  );
  return id;
}

void test("真实密码认证、令牌哈希、旧会话撤销与退出", async () => {
  assert.equal(getSession("invalid-token"), null);
  assert.equal(await login({ username, password: "incorrect-password" }, undefined), null);
  const token = await login({ username, password: fixture.password }, undefined);
  assert.ok(token);
  assert.deepEqual(getSession(token), { adminId: 1, username });
  const stored = getDatabase().select().from(session).where(eq(session.token, token)).get();
  assert.ok(stored);
  assert.notEqual(stored.token, token);
  const raw = getDatabase()
    .$client.prepare<[number], { token: string }>("SELECT token FROM auth_session WHERE id=?")
    .get(stored.id)!;
  assert.equal(raw.token, createHash("sha256").update(token).digest("hex"));
  assert.equal(stored.expiresAt.getTime() - stored.createdAt.getTime(), 7 * 86_400_000);
  const replacement = await login({ username, password: fixture.password }, token);
  assert.ok(replacement);
  assert.equal(getSession(token), null);
  await logout(replacement);
  assert.equal(getSession(replacement), null);
  assert.ok(getSession(fixture.actor.sessionToken), "退出只撤销指定会话");
});

void test("密码校验期间重置密码会拒绝旧结果，并撤销所有会话", async () => {
  const previous = getDatabase().select().from(admin).where(eq(admin.id, 1)).get()!;
  const changedPassword = "sqlite-reset-password-for-test";
  const changedHash = await hashPassword(changedPassword);
  // login 已读取旧哈希，但 Argon2 校验尚未完成；同步重置先提交。
  const pending = login({ username, password: fixture.password }, undefined);
  resetAdminPassword(changedHash);
  assert.equal(await pending, null);
  assert.equal(getSession(fixture.actor.sessionToken), null);
  assert.equal(await login({ username, password: fixture.password }, undefined), null);
  assert.ok(await login({ username, password: changedPassword }, undefined));
  // 恢复测试账号，后续用例仍使用独立测试库的会话。
  resetAdminPassword(previous.passwordHash);
  const restored = await login({ username, password: fixture.password }, undefined);
  assert.ok(restored);
  fixture.actor.sessionToken = restored;
});

void test("全局登录限流在同一分钟只允许 20 次，并在新窗口恢复", async () => {
  const attempts = await Promise.all(Array.from({ length: 21 }, () => consumeLoginAttempt()));
  assert.equal(attempts.filter((attempt) => attempt.allowed).length, 20);
  assert.ok(attempts[20].retryAfter >= 1 && attempts[20].retryAfter <= 60);
  writeTransaction((tx) =>
    tx
      .update(loginRateLimit)
      .set({ window: Math.floor(Date.now() / 60_000) - 1 })
      .where(eq(loginRateLimit.id, 1))
      .run(),
  );
  assert.equal((await consumeLoginAttempt()).allowed, true);
  assert.equal(
    getDatabase().select().from(loginRateLimit).where(eq(loginRateLimit.id, 1)).get()!.count,
    1,
  );
});

void test("友链字面和 Unicode 搜索、筛选、并发版本冲突", async () => {
  const created = await friends.createFriend(
    {
      name: "Äpfel 100%_",
      url: "https://example.test",
      avatar: "",
      description: "描述",
      category: "技术博客",
      enabled: false,
    },
    fixture.actor,
  );
  assert.equal(created.status, "pending");
  const listed = await friends.listFriends(
    friendQuerySchema.parse({ q: "äPFEL 100%_", enabled: "false", sortBy: "status" }),
    fixture.actor,
  );
  assert.equal(listed.total, 1);
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...input } = created;
  const results = await Promise.allSettled([
    friends.updateFriend(created.id, { ...input, name: "A" }, fixture.actor),
    friends.updateFriend(created.id, { ...input, name: "B" }, fixture.actor),
  ]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
  const latest = await friends.getFriend(created.id, fixture.actor);
  await assert.rejects(friends.deleteFriend(created.id, created.version, fixture.actor), {
    code: "VERSION_CONFLICT",
  });
  await friends.deleteFriend(created.id, latest.version, fixture.actor);
  assert.equal(
    (await friends.listFriends(friendQuerySchema.parse({ record: created.id }), fixture.actor))
      .total,
    0,
  );
});

void test("媒体上传完整核验、处理租约和幂等完成均使用模拟 OSS", async (t) => {
  const bytes = Buffer.from("SQLite attachment test");
  const requests: string[] = [];
  t.mock.method(S3Client.prototype, "send", async (command: unknown) => {
    if (command && typeof command === "object") requests.push(command.constructor.name);
    if (command instanceof HeadObjectCommand)
      return { ContentLength: bytes.length, ETag: '"test-etag"' };
    if (command instanceof GetObjectCommand)
      return { Body: Readable.from([bytes]), ETag: '"test-etag"' };
    return {};
  });
  const ticket = await mediaService.createUpload(
    {
      name: "test.txt",
      kind: "attachment",
      bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    },
    fixture.actor,
  );
  assert.ok(ticket.url.includes("X-Amz-Signature="));
  const completed = await mediaService.completeUpload(ticket.id, fixture.actor);
  assert.equal(completed.status, "ready");
  assert.equal(completed.bytes, bytes.length);
  assert.equal(completed.mime, "application/octet-stream");
  assert.ok(requests.includes(CopyObjectCommand.name));
  const countBeforeRetry = requests.length;
  assert.deepEqual(await mediaService.completeUpload(ticket.id, fixture.actor), completed);
  assert.equal(requests.length, countBeforeRetry, "已完成重试不重复访问 OSS");
  const row = getDatabase().select().from(media).where(eq(media.id, ticket.id)).get()!;
  assert.equal(row.leaseToken, null);
  assert.equal(row.leaseUntil, null);
});

void test("媒体上传限流、未完成数量限制和事务回滚", async (t) => {
  t.mock.method(S3Client.prototype, "send", async () => ({}));
  const input = { name: "test.txt", kind: "attachment" as const, bytes: 1, sha256: "0".repeat(64) };
  await mediaService.createUpload(input, fixture.actor);
  writeTransaction((tx) =>
    tx
      .update(mediaUploadLimit)
      .set({ window: Math.floor(Date.now() / 60_000), count: 20 })
      .where(eq(mediaUploadLimit.adminId, 1))
      .run(),
  );
  await assert.rejects(mediaService.createUpload(input, fixture.actor), { code: "RATE_LIMITED" });
  writeTransaction((tx) => tx.delete(mediaUploadLimit).run());
  for (let index = 0; index < 19; index += 1) seedMedia({ status: "pending", uploadedAt: null });
  await assert.rejects(mediaService.createUpload(input, fixture.actor), { code: "RATE_LIMITED" });
  assert.equal(
    getDatabase().select({ total: count() }).from(media).where(eq(media.status, "pending")).get()!
      .total,
    20,
  );
  assert.equal(
    getDatabase().select({ total: count() }).from(mediaUploadLimit).get()!.total,
    0,
    "被数量限制拒绝不写限流状态",
  );
});

void test("媒体引用指纹复核、强删与新增失效引用保护", async (t) => {
  const send = t.mock.method(S3Client.prototype, "send", async () => ({}));
  const id = seedMedia();
  const url = publicMediaUrl(`media/${id}`);
  const postId = seedPost("draft");
  const content = serializeDocument({
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          { type: "image", attrs: { src: `${url}?size=2#preview`, alt: "图片" } },
          { type: "text", text: url },
        ],
      },
    ],
  });
  writeTransaction((tx) => tx.update(post).set({ content }).where(eq(post.id, postId)).run());
  const snapshot = await mediaService.getMediaReferences(id, fixture.actor);
  assert.equal(snapshot.count, 1, "结构化图片计入；正文 URL 纯文本不计入");
  await assert.rejects(mediaService.deleteMedia(id, fixture.actor), { code: "RESOURCE_IN_USE" });
  await friends.createFriend(
    {
      name: "媒体友链",
      url: "https://example.test",
      avatar: url,
      description: "",
      category: "技术博客",
      enabled: false,
    },
    fixture.actor,
  );
  await assert.rejects(
    mediaService.deleteMedia(id, fixture.actor, {
      force: true,
      referenceFingerprint: snapshot.fingerprint,
    }),
    { code: "REFERENCES_CHANGED" },
  );
  const current = await mediaService.getMediaReferences(id, fixture.actor);
  assert.equal(current.count, 2);
  await mediaService.deleteMedia(id, fixture.actor, {
    force: true,
    referenceFingerprint: current.fingerprint,
  });
  assert.equal(getDatabase().select().from(media).where(eq(media.id, id)).get()!.status, "deleted");
  assert.equal(send.mock.callCount(), 2);
  await assert.rejects(
    friends.createFriend(
      {
        name: "失效引用",
        url: "https://example.test",
        avatar: url,
        description: "",
        category: "技术博客",
        enabled: true,
      },
      fixture.actor,
    ),
    { code: "INVALID_INPUT" },
  );
  assert.doesNotThrow(() =>
    writeTransaction((tx) =>
      ensureNewMediaReferences(tx, [{ field: "avatar", url }], [{ field: "avatar", url }]),
    ),
  );
  assert.throws(
    () =>
      writeTransaction((tx) =>
        ensureNewMediaReferences(
          tx,
          [
            { field: "avatar", url },
            { field: "avatar", url },
          ],
          [{ field: "avatar", url }],
        ),
      ),
    { code: "RESOURCE_IN_USE" },
  );
});

void test("媒体删除失败可重试，租约期间拒绝重复处理和新增引用", async (t) => {
  const id = seedMedia();
  const url = publicMediaUrl(`media/${id}`);
  const send = t.mock.method(S3Client.prototype, "send", async () => {
    throw new Error("模拟 OSS 失败");
  });
  await assert.rejects(mediaService.deleteMedia(id, fixture.actor), {
    code: "STORAGE_UNAVAILABLE",
  });
  const failed = getDatabase().select().from(media).where(eq(media.id, id)).get()!;
  assert.equal(failed.status, "deleting");
  assert.equal(failed.leaseToken, null);
  let release!: () => void;
  let started!: () => void;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  const requested = new Promise<void>((resolve) => {
    started = resolve;
  });
  send.mock.mockImplementation(async () => {
    started();
    await barrier;
    return {};
  });
  const retry = mediaService.deleteMedia(id, fixture.actor);
  await requested;
  try {
    await assert.rejects(mediaService.deleteMedia(id, fixture.actor), { code: "PROCESSING" });
    await assert.rejects(
      friends.createFriend(
        {
          name: "删除中新引用",
          url: "https://example.test",
          avatar: url,
          description: "",
          category: "技术博客",
          enabled: true,
        },
        fixture.actor,
      ),
      { code: "INVALID_INPUT" },
    );
  } finally {
    release();
  }
  await retry;
  assert.equal(getDatabase().select().from(media).where(eq(media.id, id)).get()!.status, "deleted");
});

void test("媒体清理跳过有效租约，dry-run 不请求 OSS，过期租约可回收", async (t) => {
  const send = t.mock.method(S3Client.prototype, "send", async () => ({}));
  const id = seedMedia({
    status: "finalizing",
    uploadedAt: null,
    leaseToken: randomUUID(),
    leaseUntil: new Date(Date.now() + 60_000),
  });
  await assert.rejects(mediaService.completeUpload(id, fixture.actor), { code: "PROCESSING" });
  await assert.rejects(mediaService.deleteMedia(id, fixture.actor), { code: "PROCESSING" });
  assert.equal((await mediaService.cleanupMedia(true)).scanned, 0);
  writeTransaction((tx) =>
    tx
      .update(media)
      .set({ leaseUntil: new Date(Date.now() - 1) })
      .where(eq(media.id, id))
      .run(),
  );
  const preview = await mediaService.cleanupMedia(true);
  assert.equal(preview.scanned, 1);
  assert.equal(send.mock.callCount(), 0);
  assert.equal(
    getDatabase().select().from(media).where(eq(media.id, id)).get()!.status,
    "finalizing",
  );
  const result = await mediaService.cleanupMedia(false);
  assert.equal(result.cleaned, 1);
  assert.equal(result.failed, 0);
  assert.equal(send.mock.callCount(), 2);
  assert.equal(
    getDatabase()
      .select()
      .from(media)
      .where(and(eq(media.id, id), eq(media.status, "deleted")))
      .get()!.leaseToken,
    null,
  );
});

void test("媒体列表字面/Unicode 搜索、删除中状态及缺失鉴权", async () => {
  seedMedia();
  const deletingId = seedMedia({ name: "删除中", status: "deleting" });
  assert.equal(
    (await mediaService.listMedia(mediaQuerySchema.parse({ q: "100%_äPFEL" }), fixture.actor))
      .total,
    1,
  );
  const deleting = await mediaService.listMedia(
    mediaQuerySchema.parse({ record: deletingId }),
    fixture.actor,
  );
  assert.equal(deleting.items[0].status, "deleting");
  assert.equal(deleting.items[0].url, null);
  await assert.rejects(
    mediaService.listMedia(mediaQuerySchema.parse({}), { adminId: 1, sessionToken: "invalid" }),
    { code: "UNAUTHORIZED" },
  );
});
