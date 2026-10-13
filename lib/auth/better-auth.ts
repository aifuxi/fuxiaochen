import "server-only";
import { APIError } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { username } from "better-auth/plugins/username";

import { getDatabase } from "@/lib/database";
import { siteOrigin } from "@/lib/site-origin";

import { authAdapter } from "./adapter";
import { hashPassword, verifyPassword } from "./password";

export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;
export const SESSION_COOKIE = "fx_admin_session";

function createAuth(origin: string, secret: string, secure: boolean) {
  return betterAuth({
    appName: "Fuxiaochen",
    baseURL: origin,
    secret,
    database: authAdapter(),
    trustedOrigins: [origin],
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 15,
      maxPasswordLength: 128,
      password: {
        hash: hashPassword,
        verify: ({ hash, password }) => verifyPassword(hash, password),
      },
    },
    plugins: [
      username({
        minUsernameLength: 1,
        maxUsernameLength: 128,
        usernameValidator: () => true,
        usernameNormalization: false,
        displayUsername: false,
        immutableUsername: true,
      }),
    ],
    databaseHooks: {
      session: {
        create: {
          before: async (session) => {
            if (session.userId !== "1")
              throw new APIError("UNAUTHORIZED", { code: "INVALID_USERNAME_OR_PASSWORD" });
            return { data: session };
          },
        },
      },
    },
    session: {
      expiresIn: SESSION_MAX_AGE,
      disableSessionRefresh: true,
      cookieCache: { enabled: false },
    },
    advanced: {
      database: { generateId: "serial" },
      useSecureCookies: secure,
      cookies: { session_token: { name: SESSION_COOKIE } },
      defaultCookieAttributes: { httpOnly: true, sameSite: "strict", path: "/" },
      ipAddress: { disableIpTracking: true },
    },
    // 所有外部登录只经过项目表单入口，持久化限流在该入口执行。
    // 暂不挂载通用 auth.handler，避免增加注册、账户变更或返回令牌的外部接口。
    rateLimit: { enabled: false },
    logger: { disabled: true },
    telemetry: { enabled: false },
  });
}

let cached:
  | {
      db: ReturnType<typeof getDatabase>;
      origin: string;
      secret: string;
      secure: boolean;
      auth: ReturnType<typeof createAuth>;
    }
  | undefined;

export function getAuth() {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret || secret.length < 32) throw new Error("请配置至少 32 个字符的 BETTER_AUTH_SECRET。");
  const origin = siteOrigin();
  const db = getDatabase();
  const secure = process.env.NODE_ENV === "production";
  if (
    !cached ||
    cached.db !== db ||
    cached.origin !== origin ||
    cached.secret !== secret ||
    cached.secure !== secure
  ) {
    cached = { db, origin, secret, secure, auth: createAuth(origin, secret, secure) };
  }
  return cached.auth;
}
