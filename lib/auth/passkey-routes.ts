import "server-only";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { getDatabase } from "@/lib/database";
import { authAccount, authPasskey } from "@/lib/database/schema";
import { siteOrigin } from "@/lib/site-origin";

import { getAuth } from "./better-auth";
import { consumeLoginAttempt, readAdminSession } from "./service";
import { passkeyWriteContext } from "./storage-context";

const prefix = "/api/auth/passkey/";
const allowed = new Map([
  ["generate-authenticate-options", "GET"],
  ["verify-authentication", "POST"],
  ["generate-register-options", "GET"],
  ["verify-registration", "POST"],
  ["list-user-passkeys", "GET"],
  ["delete-passkey", "POST"],
]);
const name = z.string().max(64);
const verificationSchema = z.object({
  response: z.object({ id: z.string().min(1).max(2048) }).passthrough(),
  name: name.optional(),
  // 后台注册不创建新会话，避免开放插件的前置注册/自动登录分支。
  createSession: z.literal(false).optional(),
});

function failure(status: number, code: string, message: string, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  headers.set("Cache-Control", "no-store");
  return Response.json(
    { code, message },
    {
      status,
      headers,
    },
  );
}

export const passkeyRoutes = new Hono();
passkeyRoutes.onError((error) => {
  if (error instanceof z.ZodError || error instanceof SyntaxError)
    return failure(400, "INVALID_INPUT", "请求格式无效，请重新操作。");
  console.error("通行密钥接口失败", { name: error.name });
  return failure(503, "SERVICE_UNAVAILABLE", "服务暂时不可用，请稍后重试。");
});
passkeyRoutes.all("/*", async (c) => {
  const operation = c.req.path.slice(prefix.length);
  if (allowed.get(operation) !== c.req.method) return c.notFound();
  // 生成选项虽是 GET，但会保存挑战；拒绝明确的跨站请求。
  const origin = c.req.header("origin");
  if (
    (origin && origin !== siteOrigin()) ||
    ["cross-site", "same-site"].includes(c.req.header("sec-fetch-site") ?? "")
  )
    return failure(403, "FORBIDDEN_ORIGIN", "请求来源不被允许，请刷新页面后重试。");

  const authenticating = ["generate-authenticate-options", "verify-authentication"].includes(
    operation,
  );
  if (authenticating || operation === "generate-register-options") {
    const limit = await consumeLoginAttempt();
    if (!limit.allowed)
      return failure(429, "RATE_LIMITED", "请求过于频繁，请稍后重试。", {
        "Retry-After": String(limit.retryAfter),
      });
  }
  const actor = await readAdminSession(c.req.raw.headers);
  if (!authenticating && !actor) return failure(401, "UNAUTHORIZED", "登录已失效，请重新登录。");

  let body: z.infer<typeof verificationSchema> | undefined;
  if (operation === "verify-registration" || operation === "verify-authentication")
    body = verificationSchema.parse(await c.req.raw.clone().json());
  if (operation === "generate-register-options") name.parse(c.req.query("name") ?? "");
  if (operation === "delete-passkey")
    z.object({
      id: z
        .string()
        .regex(/^[1-9]\d*$/)
        .max(16),
    }).parse(await c.req.raw.clone().json());

  const credential =
    operation === "verify-authentication" && body
      ? getDatabase()
          .select()
          .from(authPasskey)
          .where(eq(authPasskey.credentialID, body.response.id))
          .get()
      : undefined;
  const account =
    operation === "verify-authentication"
      ? getDatabase()
          .select({ password: authAccount.password })
          .from(authAccount)
          .where(and(eq(authAccount.userId, 1), eq(authAccount.providerId, "credential")))
          .get()
      : undefined;

  return passkeyWriteContext.run(
    {
      kind: authenticating
        ? "authentication"
        : operation === "delete-passkey"
          ? "management"
          : "registration",
      actorToken: actor?.sessionToken,
      previousToken: actor?.sessionToken,
      credential,
      passwordHash: account?.password,
    },
    async () => {
      // WebAuthn 挑战、签名、凭据所有权和 Cookie 均由官方插件处理。
      const response = await getAuth().handler(c.req.raw);
      if (response.status >= 500)
        return failure(503, "SERVICE_UNAVAILABLE", "服务暂时不可用，请稍后重试。");
      if (!response.ok) return response;
      const headers = new Headers(response.headers);
      headers.set("Cache-Control", "no-store");
      headers.delete("Content-Length");
      if (operation === "verify-authentication")
        return Response.json({ success: true }, { headers });
      if (operation === "generate-authenticate-options") {
        const data = z
          .object({ challenge: z.string() })
          .passthrough()
          .parse(await response.json());
        // 当前插件验证默认不强制 UV；请求选项与 afterVerification 同时要求设备验证。
        return Response.json({ ...data, userVerification: "required" }, { headers });
      }
      return response;
    },
  );
});
