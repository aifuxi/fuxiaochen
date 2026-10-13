import { eq } from "drizzle-orm";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { test } from "node:test";

import { api } from "../lib/api";
import { resetAdminPassword } from "../lib/auth/accounts";
import { getAuth } from "../lib/auth/better-auth";
import { hashPassword } from "../lib/auth/password";
import { readAdminSession } from "../lib/auth/service";
import { passkeyWriteContext } from "../lib/auth/storage-context";
import { writeTransaction } from "../lib/database";
import {
  authAccount,
  authPasskey,
  authSession,
  authVerification,
  loginRateLimit,
} from "../lib/database/schema";
import { createTestDatabase } from "./helpers/sqlite";
import { testAuthenticator } from "./helpers/webauthn";

const origin = "https://sqlite-test.example";
type Fixture = Awaited<ReturnType<typeof createTestDatabase>>;
const cookies = (response: Response, previous = "") => {
  const jar = new Map(
    previous
      .split("; ")
      .filter(Boolean)
      .map((cookie) => {
        const separator = cookie.indexOf("=");
        return [cookie.slice(0, separator), cookie.slice(separator + 1)];
      }),
  );
  for (const cookie of response.headers.getSetCookie()) {
    const [pair] = cookie.split(";");
    const separator = pair.indexOf("=");
    jar.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
};
async function passwordLogin(fixture: Fixture) {
  const response = await api.request(`${origin}/api/login`, {
    method: "POST",
    headers: { Origin: origin, Accept: "application/json" },
    body: new URLSearchParams({ username: "test_admin", password: fixture.password }),
  });
  assert.equal(response.status, 200);
  return cookies(response);
}
async function request(
  operation: string,
  cookie = "",
  body?: unknown,
  headers: Record<string, string> = {},
) {
  return api.request(`${origin}/api/auth/passkey/${operation}`, {
    method: body === undefined ? "GET" : "POST",
    headers: {
      Origin: origin,
      Cookie: cookie,
      ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}
async function register(fixture: Fixture, authenticator = testAuthenticator(origin)) {
  const actor = await passwordLogin(fixture);
  const options = await request("generate-register-options", actor);
  assert.equal(options.status, 200, await options.clone().text());
  const data = await options.json();
  assert.equal(data.rp.id, "sqlite-test.example");
  assert.equal(data.authenticatorSelection.userVerification, "required");
  assert.equal(data.authenticatorSelection.residentKey, "required");
  const cookie = cookies(options, actor);
  const response = await request("verify-registration", cookie, {
    response: authenticator.registration(data.challenge),
    name: "测试设备",
  });
  assert.equal(response.status, 200, await response.clone().text());
  const key = await response.json();
  assert.equal(key.userId, "1");
  return { authenticator, cookie, key };
}
async function withDatabase(work: (fixture: Fixture) => Promise<void>) {
  const fixture = await createTestDatabase();
  try {
    await work(fixture);
  } finally {
    await fixture.cleanup();
  }
}

void test("官方插件真实注册、无密码登录、签名 Cookie、哈希存储和密码备用", () =>
  withDatabase(async (fixture) => {
    const { authenticator, cookie, key } = await register(fixture);
    const list = await request("list-user-passkeys", cookie);
    assert.equal(list.status, 200);
    assert.equal((await list.json())[0].name, "测试设备");
    assert.equal(fixture.db.select().from(authPasskey).get()?.credentialID, authenticator.id);
    const options = await request("generate-authenticate-options");
    const data = await options.json();
    assert.equal(data.userVerification, "required");
    assert.equal(data.rpId, "sqlite-test.example");
    const challengeCookie = cookies(options);
    const signed = authenticator.authentication(data.challenge, 1);
    const response = await request("verify-authentication", challengeCookie, { response: signed });
    assert.equal(response.status, 200, await response.clone().text());
    assert.deepEqual(await response.json(), { success: true });
    const loggedIn = cookies(response, challengeCookie);
    const actor = await readAdminSession(new Headers({ Cookie: loggedIn }));
    assert.ok(actor);
    assert.equal(
      fixture.db.select().from(authSession).where(eq(authSession.token, actor.sessionToken)).get()
        ?.token,
      createHash("sha256").update(actor.sessionToken).digest("hex"),
    );
    const stored = fixture.db.$client
      .prepare<[], { token: string }>("SELECT token FROM auth_session ORDER BY id DESC LIMIT 1")
      .get()!;
    assert.equal(stored.token, createHash("sha256").update(actor.sessionToken).digest("hex"));
    assert.equal(
      (await api.request(`${origin}/api/admin/categories`, { headers: { Cookie: loggedIn } }))
        .status,
      200,
    );
    assert.notEqual(
      (await request("verify-authentication", challengeCookie, { response: signed })).status,
      200,
      "挑战只能消费一次",
    );
    const deletion = await request("delete-passkey", cookie, { id: key.id });
    assert.equal(deletion.status, 200);
    assert.equal(fixture.db.select().from(authPasskey).all().length, 0);
    const next = await request("generate-authenticate-options");
    assert.notEqual(
      (
        await request("verify-authentication", cookies(next), {
          response: authenticator.authentication((await next.json()).challenge, 2),
        })
      ).status,
      200,
    );
    assert.ok(await readAdminSession(new Headers({ Cookie: await passwordLogin(fixture) })));
  }));

void test("错误签名、Origin、RP ID、挑战与缺少设备验证均不创建会话", () =>
  withDatabase(async (fixture) => {
    const { authenticator } = await register(fixture);
    const invalid = [
      (challenge: string) => {
        const value = authenticator.authentication(challenge, 1);
        value.response.signature = Buffer.alloc(70).toString("base64url");
        return value;
      },
      (challenge: string) =>
        authenticator.authentication(challenge, 1, { origin: "https://evil.example" }),
      (challenge: string) =>
        authenticator.authentication(challenge, 1, { rpHash: Buffer.alloc(32) }),
      () => authenticator.authentication("wrong-challenge", 1),
      (challenge: string) => authenticator.authentication(challenge, 1, { uv: false }),
    ];
    const sessions = fixture.db.select().from(authSession).all().length;
    for (const build of invalid) {
      const options = await request("generate-authenticate-options");
      assert.equal(options.status, 200);
      const response = await request("verify-authentication", cookies(options), {
        response: build((await options.json()).challenge),
      });
      assert.notEqual(response.status, 200);
      assert.equal(fixture.db.select().from(authSession).all().length, sessions);
    }
  }));

void test("注册要求近期有效登录和设备验证，不开放匿名注册或额外认证接口", () =>
  withDatabase(async (fixture) => {
    assert.equal((await request("generate-register-options")).status, 401);
    assert.equal((await request("list-user-passkeys")).status, 401);
    assert.equal((await request("delete-passkey", "", { id: "1" })).status, 401);
    for (const path of ["update-passkey", "unknown"])
      assert.equal((await request(path)).status, 404);
    const actor = await passwordLogin(fixture);
    const options = await request("generate-register-options", actor);
    const authenticator = testAuthenticator(origin);
    const body = { response: authenticator.registration((await options.json()).challenge, false) };
    assert.notEqual(
      (await request("verify-registration", cookies(options, actor), body)).status,
      200,
    );
    assert.equal(fixture.db.select().from(authPasskey).all().length, 0);
    assert.equal(
      (await request("verify-registration", actor, { ...body, createSession: true })).status,
      400,
    );
    writeTransaction((tx) =>
      tx
        .update(authSession)
        .set({ createdAt: new Date(Date.now() - 86400_001) })
        .run(),
    );
    const stale = await request("generate-register-options", actor);
    assert.equal(stale.status, 403);
    assert.equal((await stale.json()).code, "SESSION_NOT_FRESH");
  }));

void test("过期挑战及并发重放失败，递减签名计数不能登录", () =>
  withDatabase(async (fixture) => {
    const { authenticator } = await register(fixture);
    const expired = await request("generate-authenticate-options");
    const expiredData = await expired.json();
    writeTransaction((tx) =>
      tx
        .update(authVerification)
        .set({ expiresAt: new Date(0) })
        .run(),
    );
    assert.notEqual(
      (
        await request("verify-authentication", cookies(expired), {
          response: authenticator.authentication(expiredData.challenge, 1),
        })
      ).status,
      200,
    );
    const options = await request("generate-authenticate-options");
    const body = { response: authenticator.authentication((await options.json()).challenge, 2) };
    const results = await Promise.all([
      request("verify-authentication", cookies(options), body),
      request("verify-authentication", cookies(options), body),
    ]);
    assert.equal(results.filter((response) => response.status === 200).length, 1);
    const next = await request("generate-authenticate-options");
    assert.notEqual(
      (
        await request("verify-authentication", cookies(next), {
          response: authenticator.authentication((await next.json()).challenge, 1),
        })
      ).status,
      200,
    );
  }));

void test("请求同源、体积与共享持久化限流，密码重置撤销会话且保留公钥", () =>
  withDatabase(async (fixture) => {
    const { cookie } = await register(fixture);
    assert.equal(
      (
        await request("generate-authenticate-options", "", undefined, {
          Origin: "https://evil.example",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request("generate-register-options", cookie, undefined, {
          "Sec-Fetch-Site": "same-site",
        })
      ).status,
      403,
    );
    assert.equal(
      (
        await request("verify-authentication", "", {
          response: { id: "1", large: "x".repeat(17000) },
        })
      ).status,
      413,
    );
    resetAdminPassword(await hashPassword(fixture.password));
    assert.equal(await readAdminSession(new Headers({ Cookie: cookie })), null);
    assert.equal(fixture.db.select().from(authPasskey).all().length, 1);
    assert.equal((await request("generate-register-options", cookie)).status, 401);
    writeTransaction((tx) => tx.delete(loginRateLimit).run());
    for (let attempt = 0; attempt < 20; attempt++)
      assert.equal((await request("generate-authenticate-options")).status, 200);
    const limited = await request("generate-authenticate-options");
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get("retry-after")) > 0);
    assert.equal(
      (
        await api.request(`${origin}/api/login`, {
          method: "POST",
          headers: { Origin: origin, Accept: "application/json" },
          body: new URLSearchParams({ username: "test_admin", password: fixture.password }),
        })
      ).status,
      429,
    );
  }));

void test("官方适配器同步写点拒绝验证期间删除、计数变化及密码重置的结果", () =>
  withDatabase(async (fixture) => {
    await register(fixture);
    const context = await getAuth().$context;
    const original = fixture.db.select().from(authPasskey).get()!;
    const passwordHash = fixture.db.select().from(authAccount).get()?.password;
    const guarded = <T>(work: () => Promise<T>) =>
      passkeyWriteContext.run(
        {
          kind: "authentication",
          credential: original,
          passwordHash,
          verifiedCounter: 1,
        },
        work,
      );
    // 模拟签名已验证之后、官方插件更新计数之前的独立写入。
    writeTransaction((tx) => tx.update(authPasskey).set({ counter: 2 }).run());
    await assert.rejects(
      guarded(() =>
        context.adapter.update({
          model: "passkey",
          where: [{ field: "id", value: String(original.id) }],
          update: { counter: 1 },
        }),
      ),
    );
    assert.equal(fixture.db.select().from(authPasskey).get()?.counter, 2);
    writeTransaction((tx) => tx.update(authPasskey).set({ counter: 0 }).run());
    await guarded(() =>
      context.adapter.update({
        model: "passkey",
        where: [{ field: "id", value: String(original.id) }],
        update: { counter: 1 },
      }),
    );
    // 计数更新成功后、创建会话之前重置密码，也必须拒绝已完成的旧验证。
    resetAdminPassword(await hashPassword(fixture.password));
    await assert.rejects(guarded(() => context.internalAdapter.createSession("1")));
    assert.equal(fixture.db.select().from(authSession).all().length, 0);
    writeTransaction((tx) => tx.delete(authPasskey).run());
    await assert.rejects(guarded(() => context.internalAdapter.createSession("1")));
    assert.equal(fixture.db.select().from(authSession).all().length, 0);
  }));
