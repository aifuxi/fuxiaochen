import Sqlite from "better-sqlite3";
import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";

import { api } from "../lib/api";
import { resetAdminPassword } from "../lib/auth/accounts";
import { getAuth } from "../lib/auth/better-auth";
import { hashPassword } from "../lib/auth/password";
import { getSession, login, readAdminSession } from "../lib/auth/service";
import { closeDatabase, getDatabase, writeTransaction } from "../lib/database";
import { migrateDatabase, migrationManifest } from "../lib/database/migrations";
import { authSession } from "../lib/database/schema";
import { createTestDatabase } from "./helpers/sqlite";

let fixture: Awaited<ReturnType<typeof createTestDatabase>>;
const origin = "https://sqlite-test.example";
const protectedPaths = [
  "/api/admin/categories",
  "/api/admin/tags",
  "/api/admin/posts",
  "/api/admin/comments",
  "/api/admin/media",
  "/api/admin/settings",
  "/api/admin/friends-links",
  "/api/admin/changelog",
  "/api/admin/analytics",
  "/api/admin/visitors",
  "/api/admin/search",
  "/api/admin/backups",
  "/api/admin/notifications",
  "/api/admin/operations/settings",
];
before(async () => {
  fixture = await createTestDatabase();
});
after(async () => {
  if (fixture) await fixture.cleanup();
});

function cookieHeader(headers: Headers) {
  return headers
    .getSetCookie()
    .map((cookie) => cookie.split(";")[0])
    .join("; ");
}
async function signIn(cookie?: string, password = fixture.password) {
  return api.request(`${origin}/api/login`, {
    method: "POST",
    headers: { Origin: origin, Accept: "application/json", ...(cookie ? { Cookie: cookie } : {}) },
    body: new URLSearchParams({ username: "test_admin", password }),
  });
}
async function assertProtected(cookie?: string) {
  for (const path of protectedPaths) {
    const response = await api.request(`${origin}${path}`, {
      headers: cookie ? { Cookie: cookie } : {},
    });
    assert.equal(response.status, 401, path);
    assert.equal((await response.json()).error.code, "UNAUTHORIZED", path);
  }
}

void test("真实 Better Auth：签名 Cookie、哈希存储、业务访问和防伪造", async () => {
  await assertProtected();
  const response = await signIn();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true });
  const cookies = response.headers.getSetCookie();
  const sessionCookie = cookies.find((cookie) => cookie.startsWith("fx_admin_session="))!;
  assert.ok(sessionCookie);
  for (const attribute of ["HttpOnly", "SameSite=Strict", "Path=/", "Max-Age=604800"])
    assert.ok(sessionCookie.toLowerCase().includes(attribute.toLowerCase()), attribute);
  assert.ok(!sessionCookie.includes("Secure"));
  const header = cookieHeader(response.headers);
  const actor = await readAdminSession(new Headers({ Cookie: header }));
  assert.ok(actor);
  assert.equal(actor.username, "test_admin");
  assert.deepEqual(getSession(actor.sessionToken), { adminId: 1, username: "test_admin" });
  const stored = getDatabase()
    .$client.prepare<[number], { token: string }>(
      "SELECT token FROM auth_session WHERE userId=? ORDER BY id DESC LIMIT 1",
    )
    .get(1)!;
  assert.equal(stored.token, createHash("sha256").update(actor.sessionToken).digest("hex"));
  assert.notEqual(stored.token, actor.sessionToken);
  assert.equal(getSession(stored.token), null, "数据库哈希不能作为登录凭证");
  assert.equal(
    (await api.request(`${origin}/api/admin/categories`, { headers: { Cookie: header } })).status,
    200,
  );
  await assertProtected(`fx_admin_session=${actor.sessionToken}`);
  await assertProtected(`fx_admin_session=${actor.sessionToken}.invalid-signature`);
  await assertProtected(`fx_admin_session=${stored.token}`);
  const replacement = await signIn(header);
  assert.equal(replacement.status, 200);
  await assertProtected(header);
});

void test("退出、过期和密码重置立即拒绝后台入口，并保留其他有效设备", async () => {
  const first = cookieHeader((await signIn()).headers);
  const second = cookieHeader((await signIn()).headers);
  const logout = await api.request(`${origin}/api/logout`, {
    method: "POST",
    headers: { Origin: origin, Cookie: first },
  });
  assert.equal(logout.status, 303);
  assert.equal(logout.headers.get("location"), "/login");
  assert.ok(logout.headers.getSetCookie().some((cookie) => /max-age=0/i.test(cookie)));
  await assertProtected(first);
  assert.ok(await readAdminSession(new Headers({ Cookie: second })));
  const actor = await readAdminSession(new Headers({ Cookie: second }));
  assert.ok(actor);
  writeTransaction((tx) =>
    tx
      .update(authSession)
      .set({ expiresAt: new Date(0) })
      .where(eq(authSession.token, actor.sessionToken))
      .run(),
  );
  await assertProtected(second);
  const third = cookieHeader((await signIn()).headers);
  resetAdminPassword(await hashPassword("changed-test-password-for-better-auth"));
  await assertProtected(third);
  assert.equal((await signIn()).status, 401);
  assert.equal((await signIn(undefined, "changed-test-password-for-better-auth")).status, 200);
  resetAdminPassword(await hashPassword(fixture.password));
});

void test("生产 Cookie 带 Secure，公开注册和通用认证接口未开放", async () => {
  const previous = process.env.NODE_ENV;
  Object.assign(process.env, { NODE_ENV: "production" });
  try {
    const result = await signIn();
    assert.equal(result.status, 200);
    assert.ok(
      result.headers
        .getSetCookie()
        .some(
          (cookie) => cookie.startsWith("__Secure-fx_admin_session=") && /; Secure/i.test(cookie),
        ),
    );
    for (const path of [
      "/api/auth/sign-up/email",
      "/api/auth/sign-in/username",
      "/api/auth/get-session",
      "/api/auth/change-password",
    ])
      assert.equal(
        (await api.request(`${origin}${path}`, { method: "POST", headers: { Origin: origin } }))
          .status,
        404,
      );
    const signup = await getAuth().handler(
      new Request(`${origin}/api/auth/sign-up/email`, {
        method: "POST",
        headers: { Origin: origin, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "forbidden",
          email: "forbidden@example.test",
          password: "forbidden-test-password",
        }),
      }),
    );
    assert.ok(!signup.ok);
  } finally {
    if (previous === undefined) Reflect.deleteProperty(process.env, "NODE_ENV");
    else Object.assign(process.env, { NODE_ENV: previous });
  }
});

void test("缺少签名密钥拒绝初始化；迁移保留原密码和业务数据并撤销旧会话", async () => {
  const previousSecret = process.env.BETTER_AUTH_SECRET;
  delete process.env.BETTER_AUTH_SECRET;
  assert.throws(getAuth, /BETTER_AUTH_SECRET/);
  process.env.BETTER_AUTH_SECRET = previousSecret;
  const directory = await mkdtemp(join(tmpdir(), "fx-better-auth-upgrade-"));
  const previousPath = process.env.DATABASE_PATH;
  closeDatabase();
  let client: Sqlite.Database | undefined;
  try {
    const folder = join(directory, "old-migrations");
    await mkdir(join(folder, "meta"), { recursive: true });
    const journal = JSON.parse(await readFile("drizzle/meta/_journal.json", "utf8"));
    journal.entries = journal.entries.slice(0, 1);
    await writeFile(join(folder, "meta/_journal.json"), JSON.stringify(journal));
    await writeFile(
      join(folder, "0000_initial_sqlite.sql"),
      await readFile("drizzle/0000_initial_sqlite.sql"),
    );
    process.env.DATABASE_PATH = join(directory, "upgrade.sqlite");
    client = new Sqlite(process.env.DATABASE_PATH);
    migrateDatabase(client, { migrationsFolder: folder });
    const password = "original-upgrade-test-password";
    const hash = await hashPassword(password);
    client
      .prepare(
        "INSERT INTO admin (id,username,passwordHash,createdAt,updatedAt) VALUES (1,?,?,?,?)",
      )
      .run("A", hash, 1, 2);
    client
      .prepare("INSERT INTO session (id,adminId,createdAt,expiresAt) VALUES (?,1,?,?)")
      .run("a".repeat(64), 1, Date.now() + 10000);
    client
      .prepare(
        "INSERT INTO category (id,name,nameKey,color,createdAt) VALUES ('retained','原有分类','原有分类','#123456',1)",
      )
      .run();
    migrateDatabase(client);
    assert.equal(
      client.prepare<[], { total: number }>("SELECT COUNT(*) AS total FROM session").get()?.total,
      0,
    );
    assert.equal(
      client
        .prepare<[], { password: string }>("SELECT password FROM auth_account WHERE userId=1")
        .get()?.password,
      hash,
    );
    assert.equal(
      client.prepare<[], { name: string }>("SELECT name FROM category WHERE id='retained'").get()
        ?.name,
      "原有分类",
    );
    assert.equal(migrationManifest().migrations.length, 2);
    client.close();
    client = undefined;
    const result = await login({ username: "A", password }, undefined);
    assert.ok(result);
    assert.deepEqual(getSession(result.token), { adminId: 1, username: "A" });
  } finally {
    client?.close();
    closeDatabase();
    process.env.DATABASE_PATH = previousPath;
    await rm(directory, { recursive: true, force: true });
  }
});
