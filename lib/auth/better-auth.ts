import "server-only";
import { passkey } from "@better-auth/passkey";
import { APIError } from "better-auth/api";
import { betterAuth } from "better-auth/minimal";
import { username } from "better-auth/plugins/username";

import { getDatabase } from "@/lib/database";
import { siteOrigin } from "@/lib/site-origin";

import { authAdapter } from "./adapter";
import { hashPassword, verifyPassword } from "./password";
import { passkeyWriteContext } from "./storage-context";

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
      passkey({
        rpID: new URL(origin).hostname,
        rpName: "付小晨",
        origin,
        authenticatorSelection: { residentKey: "required", userVerification: "required" },
        registration: {
          requireSession: true,
          afterVerification: ({ verification }) => {
            if (!verification.registrationInfo?.userVerified)
              throw new APIError("UNAUTHORIZED", { code: "USER_VERIFICATION_REQUIRED" });
          },
        },
        authentication: {
          afterVerification: ({ verification }) => {
            if (!verification.authenticationInfo.userVerified)
              throw new APIError("UNAUTHORIZED", { code: "USER_VERIFICATION_REQUIRED" });
            const context = passkeyWriteContext.getStore();
            if (context) context.verifiedCounter = verification.authenticationInfo.newCounter;
          },
        },
      }),
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
    // 密码入口和 Passkey 白名单入口各自执行持久化限流。
    // 不开放其他通用接口；Passkey 成功响应也只返回明确成功，令牌仅由 Cookie 传递。
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
