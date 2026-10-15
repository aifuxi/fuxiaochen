import { S3Client } from "@aws-sdk/client-s3";
import { count, eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
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
import { friendQuerySchema, updateFriendSchema } from "../lib/friends-links/schema";
import * as friends from "../lib/friends-links/service";
import * as mediaService from "../lib/media/service";
import { closeStorage, publicMediaUrl } from "../lib/media/storage";
import { serializeDocument } from "../lib/posts/document";
import { postSchema, updatePostSchema } from "../lib/posts/schema";
import { createPost, getPost, updatePost, deletePost } from "../lib/posts/service";
import { settingsSchema } from "../lib/settings/schema";
import { getSettings, saveSettings } from "../lib/settings/service";
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

void test("直传签名不读取 OSS、不创建媒体记录，保留 Content-Type 和永久地址", async (t) => {
  t.mock.method(S3Client.prototype, "send", () => {
    throw new Error("签名不得请求 OSS 文件");
  });
  const first = await mediaService.createUpload({ contentType: "image/png" }, fixture.actor);
  const second = await mediaService.createUpload({ contentType: "image/jpeg" }, fixture.actor);
  assert.notEqual(first.publicUrl, second.publicUrl);
  assert.match(first.publicUrl, /^https:\/\/media.sqlite-test.example\/media\//);
  assert.deepEqual(first.headers, { "Content-Type": "image/png" });
  const signed = new URL(first.url);
  assert.equal(
    signed.pathname.replace(/^\/sqlite-test-bucket/, ""),
    new URL(first.publicUrl).pathname,
  );
  assert.equal(signed.searchParams.get("X-Amz-Expires"), "300");
  assert.match(signed.searchParams.get("X-Amz-SignedHeaders")!, /content-type/);
  assert.ok(!signed.searchParams.get("X-Amz-SignedHeaders")!.includes("content-length"));
  assert.equal(getDatabase().select({ total: count() }).from(media).get()!.total, 0);
});

void test("直传签名保留登录鉴权和每分钟限流，下一分钟恢复", async () => {
  await assert.rejects(
    mediaService.createUpload(
      { contentType: "image/png" },
      { adminId: 1, sessionToken: "invalid" },
    ),
    { code: "UNAUTHORIZED" },
  );
  for (let index = 0; index < 20; index++)
    await mediaService.createUpload({ contentType: "image/png" }, fixture.actor);
  await assert.rejects(mediaService.createUpload({ contentType: "image/png" }, fixture.actor), {
    code: "RATE_LIMITED",
  });
  writeTransaction((tx) =>
    tx
      .update(mediaUploadLimit)
      .set({ window: Math.floor(Date.now() / 60_000) - 1 })
      .run(),
  );
  await mediaService.createUpload({ contentType: "image/png" }, fixture.actor);
  assert.equal(getDatabase().select().from(mediaUploadLimit).get()!.count, 1);
});

void test("无媒体记录的 OSS 和外部图片能保存，删除正文图片或文章不操作 OSS", async (t) => {
  const requests: string[] = [];
  t.mock.method(S3Client.prototype, "send", (command: object) => {
    requests.push(command.constructor.name);
    throw new Error("正文编辑不应访问 OSS");
  });
  const url = publicMediaUrl(`media/${randomUUID()}`);
  const content = serializeDocument({
    type: "doc",
    content: [
      { type: "paragraph", content: [{ type: "image", attrs: { src: url, alt: "直传图片" } }] },
      {
        type: "paragraph",
        content: [
          { type: "image", attrs: { src: "https://external.example/photo.jpg", alt: "外部图片" } },
        ],
      },
    ],
  });
  const input = postSchema.parse({
    title: "直传草稿",
    slug: "",
    categoryId: "",
    tagIds: [],
    status: "draft",
    content,
    isFeatured: false,
  });
  const created = await createPost(input, fixture.actor);
  assert.equal((await getPost(created.id, fixture.actor)).content, input.content);
  const updated = await updatePost(
    created.id,
    updatePostSchema.parse({
      ...input,
      content: serializeDocument({ type: "doc", content: [{ type: "paragraph" }] }),
      version: created.version,
    }),
    fixture.actor,
  );
  await deletePost(updated.id, updated.version, fixture.actor);
  const { updatedAt: _updatedAt, ...setting } = await getSettings(fixture.actor);
  await saveSettings(
    settingsSchema.parse({ ...setting, avatarUrl: url, ogImageUrl: url }),
    fixture.actor,
  );
  assert.equal((await getSettings(fixture.actor)).avatarUrl, url);
  const friend = await friends.createFriend(
    {
      name: "OSS 图片友链",
      url: "https://friend.example",
      avatar: url,
      description: "",
      category: "技术博客",
      enabled: true,
    },
    fixture.actor,
  );
  const { id: _id, createdAt: _createdAt, updatedAt: _friendUpdatedAt, ...friendInput } = friend;
  await friends.updateFriend(
    friend.id,
    updateFriendSchema.parse({ ...friendInput, avatar: publicMediaUrl(`media/${randomUUID()}`) }),
    fixture.actor,
  );
  assert.deepEqual(requests, []);
  assert.equal(getDatabase().select({ total: count() }).from(media).get()!.total, 0);
});
