import { Hono } from "hono";
import assert from "node:assert/strict";
import { test } from "node:test";

import { registerApiRequestGuards } from "../lib/api-request-guards";
import { submitLogin } from "../lib/auth/login-client";
import { handleLoginError } from "../lib/auth/login-response";
import { createLoginRoutes } from "../lib/auth/login-routes";

const origin = "https://login-test.example";
const cookieName = "fx_admin_session";
const token = "a".repeat(64);
const previousToken = "b".repeat(64);
const credentials = { username: "test-admin", password: "test-password" };

function fixture(
  options: {
    allowed?: boolean;
    token?: string | null;
    secure?: boolean;
    fail?: "limit" | "login" | "origin";
  } = {},
) {
  const calls: string[] = [];
  const received: { credentials?: typeof credentials; previousToken?: string } = {};
  const app = new Hono().basePath("/api");
  registerApiRequestGuards(app, () => {
    if (options.fail === "origin") throw new Error("private-origin-configuration");
    return origin;
  });
  app.onError(handleLoginError);
  app.route(
    "/",
    createLoginRoutes({
      consumeLoginAttempt: async () => {
        calls.push("limit");
        if (options.fail === "limit") throw new Error("private-database-credentials");
        return { allowed: options.allowed ?? true, retryAfter: 23 };
      },
      login: async (input, oldToken) => {
        calls.push("login");
        received.credentials = input;
        received.previousToken = oldToken;
        if (options.fail === "login") throw new Error("private-login-credentials");
        return options.token === undefined ? token : options.token;
      },
      sessionCookie: cookieName,
      sessionMaxAge: 7 * 24 * 60 * 60,
      secureCookie: options.secure ?? true,
    }),
  );
  return { app, calls, received };
}

function request(init: RequestInit = {}, json = true) {
  const headers = new Headers({
    Origin: origin,
    "Content-Type": "application/x-www-form-urlencoded",
    ...(json ? { Accept: "application/json" } : {}),
  });
  new Headers(init.headers).forEach((value, key) => headers.set(key, value));
  return new Request(`${origin}/api/login`, {
    method: "POST",
    body: new URLSearchParams(credentials),
    ...init,
    headers,
  });
}

void test("JSON 成功只返回明确成功，沿用七天安全 Cookie 并传递旧会话", async () => {
  const { app, calls, received } = fixture();
  const response = await app.request(
    request({ headers: { Cookie: `${cookieName}=${previousToken}` } }),
  );
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { success: true });
  const cookie = response.headers.get("set-cookie") ?? "";
  for (const value of [
    `${cookieName}=${token}`,
    "HttpOnly",
    "Secure",
    "SameSite=Strict",
    "Path=/",
    "Max-Age=604800",
  ])
    assert.ok(cookie.includes(value), `Cookie 应包含 ${value}`);
  assert.deepEqual(calls, ["limit", "login"]);
  assert.deepEqual(received, { credentials, previousToken });
});

void test("HTML fallback 保持成功 303 和非生产 Cookie", async () => {
  const { app } = fixture({ secure: false });
  const response = await app.request(request({}, false));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/admin");
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.ok(response.headers.get("set-cookie")?.includes("HttpOnly"));
  assert.ok(!response.headers.get("set-cookie")?.includes("Secure"));
});

void test("凭据错误统一 401；原生提交继续 303 invalid，不设置 Cookie", async () => {
  for (const json of [true, false]) {
    const { app } = fixture({ token: null });
    const response = await app.request(request({}, json));
    assert.equal(response.status, json ? 401 : 303);
    assert.equal(response.headers.get("set-cookie"), null);
    if (json)
      assert.deepEqual(await response.json(), {
        error: { code: "INVALID_CREDENTIALS", message: "用户名或密码不正确，请重试。" },
      });
    else assert.equal(response.headers.get("location"), "/login?error=invalid");
  }
});

void test("Zod 字段错误消耗尝试但不认证，关联字段采用中文消息", async () => {
  for (const body of [
    new URLSearchParams({ username: "", password: "" }),
    new URLSearchParams(),
    new URLSearchParams({ username: "x".repeat(129), password: "x".repeat(129) }),
  ]) {
    const { app, calls } = fixture();
    const response = await app.request(request({ body }));
    assert.equal(response.status, 400);
    assert.equal(response.headers.get("cache-control"), "no-store");
    const data = await response.json();
    assert.equal(data.error.code, "INVALID_INPUT");
    assert.ok(data.error.fieldErrors.username[0].includes("用户名"));
    assert.ok(data.error.fieldErrors.password[0].includes("密码"));
    assert.deepEqual(calls, ["limit"]);
  }
  const { app } = fixture();
  const response = await app.request(request({ body: new URLSearchParams() }, false));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "/login?error=invalid");
});

void test("登录允许既有单字符密码且不裁剪用户名或密码", async () => {
  const { app, received } = fixture();
  const input = { username: " test-admin ", password: "p" };
  const response = await app.request(request({ body: new URLSearchParams(input) }));
  assert.equal(response.status, 200);
  assert.deepEqual(received.credentials, input);
});

void test("正常 multipart 仍可登录；重复字段按既有 schema 拒绝", async () => {
  const valid = new FormData();
  valid.set("username", credentials.username);
  valid.set("password", credentials.password);
  const validRequest = new Request(`${origin}/api/login`, {
    method: "POST",
    headers: { Origin: origin, Accept: "application/json" },
    body: valid,
  });
  assert.equal((await fixture().app.request(validRequest)).status, 200);
  const { app, calls } = fixture();
  const body = new URLSearchParams({ password: credentials.password });
  body.append("username", "first");
  body.append("username", "second");
  const response = await app.request(request({ body }));
  assert.equal(response.status, 400);
  assert.deepEqual(calls, ["limit"]);
});

void test("Origin 必须精确一致并先于正文限制与限流", async () => {
  for (const value of ["https://other.example", `${origin}/`, "null", ""]) {
    const { app, calls } = fixture();
    const response = await app.request(
      request({ headers: { Origin: value }, body: "x".repeat(20_000) }),
    );
    assert.equal(response.status, 403);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal((await response.json()).error.code, "FORBIDDEN_ORIGIN");
    assert.deepEqual(calls, []);
  }
  const { app, calls } = fixture();
  const input = request();
  input.headers.delete("origin");
  const response = await app.request(input);
  assert.equal(response.status, 403);
  assert.deepEqual(calls, []);
});

void test("16 KiB 正文限制覆盖有无 Content-Length，且不消耗尝试", async () => {
  for (const headers of [new Headers(), new Headers({ "Content-Length": "16385" })]) {
    const { app, calls } = fixture();
    const response = await app.request(request({ body: "x".repeat(16_385), headers }));
    assert.equal(response.status, 413);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal((await response.json()).error.code, "PAYLOAD_TOO_LARGE");
    assert.deepEqual(calls, []);
  }
  const { app, calls } = fixture();
  const prefix = "username=a&password=p&padding=";
  const response = await app.request(
    request({ body: prefix + "x".repeat(16_384 - prefix.length) }),
  );
  assert.equal(response.status, 200);
  assert.deepEqual(calls, ["limit", "login"]);
});

void test("原生登录保留 403、413 纯文字响应与 no-store，不创建会话", async () => {
  for (const invalidOrigin of [true, false]) {
    const { app, calls } = fixture();
    const response = await app.request(
      request(
        {
          body: "x".repeat(16_385),
          ...(invalidOrigin ? { headers: { Origin: "https://other.example" } } : {}),
        },
        false,
      ),
    );
    assert.equal(response.status, invalidOrigin ? 403 : 413);
    assert.equal(response.headers.get("cache-control"), "no-store");
    assert.equal(response.headers.get("set-cookie"), null);
    assert.equal(await response.text(), invalidOrigin ? "请求来源不被允许。" : "请求内容过大。");
    assert.deepEqual(calls, []);
  }
});

void test("正文类型错误仍消耗尝试，保持 415 JSON 和纯文字 fallback", async () => {
  for (const json of [true, false]) {
    const { app, calls } = fixture();
    const response = await app.request(
      request({ headers: { "Content-Type": "application/json" }, body: "{}" }, json),
    );
    assert.equal(response.status, 415);
    if (json) assert.equal((await response.json()).error.code, "UNSUPPORTED_MEDIA_TYPE");
    else assert.equal(await response.text(), "请使用表单提交登录凭据。");
    assert.deepEqual(calls, ["limit"]);
  }
});

void test("限流先于类型及字段验证，429 保留 Retry-After 且不进入认证", async () => {
  for (const json of [true, false]) {
    const { app, calls } = fixture({ allowed: false });
    const response = await app.request(
      request({ headers: { "Content-Type": "application/json" }, body: "{}" }, json),
    );
    assert.equal(response.status, 429);
    assert.equal(response.headers.get("retry-after"), "23");
    assert.equal(response.headers.get("cache-control"), "no-store");
    if (json) assert.equal((await response.json()).error.code, "RATE_LIMITED");
    else assert.equal(await response.text(), "登录请求过于频繁，请稍后重试。");
    assert.deepEqual(calls, ["limit"]);
  }
});

void test("损坏 multipart 的 HTTPException 400 覆盖 JSON 和原生 fallback", async () => {
  for (const json of [true, false]) {
    const { app, calls } = fixture();
    const response = await app.request(
      request({ headers: { "Content-Type": "multipart/form-data" }, body: "broken" }, json),
    );
    assert.equal(response.status, json ? 400 : 303);
    if (json) assert.equal((await response.json()).error.code, "INVALID_INPUT");
    else assert.equal(response.headers.get("location"), "/login?error=invalid");
    assert.deepEqual(calls, ["limit"]);
  }
});

void test("Origin 配置、限流和认证依赖失败均拒绝登录；503 不暴露内部消息", async (t) => {
  t.mock.method(console, "error", () => undefined);
  for (const fail of ["origin", "limit", "login"] as const) {
    for (const json of [true, false]) {
      const { app, calls } = fixture({ fail });
      const response = await app.request(request({}, json));
      assert.equal(response.status, 503);
      assert.equal(response.headers.get("cache-control"), "no-store");
      assert.equal(response.headers.get("set-cookie"), null);
      const text = await response.text();
      assert.ok(!text.includes("private-"));
      assert.ok(text.includes("服务暂时不可用"));
      assert.deepEqual(
        calls,
        fail === "origin" ? [] : fail === "limit" ? ["limit"] : ["limit", "login"],
      );
    }
  }
});

void test("仅精确登录路径和明确 JSON Accept 开启增强契约", async () => {
  const { app } = fixture();
  app.post("/logout", (c) => c.text("logout"));
  assert.equal(
    (await app.request(request({ headers: { Accept: "application/json;q=0, text/html" } }))).status,
    303,
  );
  assert.equal(
    (await app.request(request({ headers: { Accept: "text/html, application/json;q=0.9" } })))
      .status,
    200,
  );
  const response = await app.request(
    new Request(`${origin}/api/logout`, {
      method: "POST",
      headers: { Origin: "https://other.example", Accept: "application/json" },
    }),
  );
  assert.equal(response.status, 403);
  assert.equal(await response.text(), "请求来源不被允许。");
});

void test("抽取 guard 后文章、设置及其他 API 保持原有正文限制", async () => {
  const app = new Hono().basePath("/api");
  registerApiRequestGuards(app, () => origin);
  app.post("/admin/posts", (c) => c.json({ success: true }));
  app.put("/admin/posts/:id", (c) => c.json({ success: true }));
  app.put("/admin/settings", (c) => c.json({ success: true }));
  app.post("/public/comments", (c) => c.json({ success: true }));
  for (const [path, method, bytes, status] of [
    ["/admin/posts", "POST", 17_000, 200],
    ["/admin/posts/test-id", "PUT", 17_000, 200],
    ["/admin/posts", "POST", 1024 * 1024 + 1, 413],
    ["/admin/settings", "PUT", 256 * 1024, 200],
    ["/admin/settings", "PUT", 256 * 1024 + 1, 413],
    ["/public/comments", "POST", 17_000, 413],
  ] as const) {
    const response = await app.request(
      new Request(`${origin}/api${path}`, {
        method,
        headers: { Origin: origin },
        body: "x".repeat(bytes),
      }),
    );
    assert.equal(response.status, status, `${method} ${path} / ${bytes}`);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

void test("客户端使用表单正文和显式 JSON，成功必须同时满足状态与 success:true", async () => {
  let count = 0;
  const input = { username: "x +&", password: "p=&+" };
  const result = await submitLogin(input, async (url, init) => {
    count++;
    assert.equal(url, "/api/login");
    assert.equal(init?.method, "POST");
    assert.equal(init?.credentials, "same-origin");
    assert.equal(init?.redirect, "error");
    const headers = new Headers(init?.headers);
    assert.equal(headers.get("accept"), "application/json");
    assert.equal(headers.get("content-type"), "application/x-www-form-urlencoded");
    assert.ok(init?.body instanceof URLSearchParams);
    assert.deepEqual(Object.fromEntries(init.body), input);
    return Response.json({ success: true });
  });
  assert.deepEqual(result, { success: true });
  assert.equal(count, 1);
  for (const response of [
    Response.json({ success: false }),
    Response.json({}),
    new Response("<html>admin</html>"),
    new Response('{"success":true}', { headers: { "Content-Type": "application/jsonp" } }),
    new Response("broken", { headers: { "Content-Type": "application/json" } }),
    Response.json({ success: true }, { status: 401 }),
  ])
    assert.equal((await submitLogin(credentials, async () => response)).success, false);
});

void test("客户端安全处理所有失败状态、字段错误与 Retry-After，不显示内部响应", async () => {
  for (const status of [400, 401, 403, 413, 415, 429, 503]) {
    const result = await submitLogin(credentials, async () =>
      Response.json(
        {
          error: {
            message: "private-error-details",
            fieldErrors: { username: ["请输入用户名", 3], ignored: ["ignored"] },
          },
        },
        { status, headers: { "Retry-After": "23" } },
      ),
    );
    assert.equal(result.success, false);
    if (result.success) continue;
    assert.ok(!result.error.message.includes("private-"));
    assert.ok(result.error.message.length > 0);
    assert.deepEqual(
      result.error.fieldErrors,
      status === 400 ? { username: ["请输入用户名"] } : undefined,
    );
    assert.equal(result.error.retryAfter, status === 429 ? 23 : undefined);
  }
  const unavailable = await submitLogin(
    credentials,
    async () => new Response("private-upstream-error", { status: 503 }),
  );
  assert.deepEqual(unavailable, {
    success: false,
    error: { code: "SERVICE_UNAVAILABLE", message: "服务暂时不可用，请稍后重试。" },
  });
});

void test("客户端网络异常不自动重试，拒绝无效等待时间", async () => {
  let attempts = 0;
  const result = await submitLogin(credentials, async () => {
    attempts++;
    throw new Error("private-network-details");
  });
  assert.equal(attempts, 1);
  assert.deepEqual(result, {
    success: false,
    error: { code: "NETWORK_ERROR", message: "网络连接失败，请检查网络后重试。" },
  });
  for (const retryAfter of ["-1", "0", "NaN", "2.5", "9999999999999999999"]) {
    const retryResult = await submitLogin(credentials, async () =>
      Response.json({ error: {} }, { status: 429, headers: { "Retry-After": retryAfter } }),
    );
    if (retryResult.success) assert.fail("限流不能作为成功");
    assert.equal(retryResult.error.retryAfter, undefined);
  }
});
