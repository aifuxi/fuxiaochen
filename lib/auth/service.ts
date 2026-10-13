import "server-only";
import { APIError } from "better-auth/api";
import { and, eq } from "drizzle-orm";

import { authTransaction, getDatabase } from "@/lib/database";
import { authSession, authAccount, loginRateLimit } from "@/lib/database/schema";

import type { LoginCredentials } from "./schema";

import { getAuth } from "./better-auth";
import { getSession } from "./session-access";
import { loginWriteContext } from "./storage-context";
export { SESSION_COOKIE, SESSION_MAX_AGE } from "./better-auth";

export { getSession } from "./session-access";

export async function readAdminSession(headers: Headers) {
  const result = await getAuth().api.getSession({ headers, query: { disableCookieCache: true } });
  if (!result || result.user.id !== "1") return null;
  return { adminId: 1, username: result.user.username, sessionToken: result.session.token };
}

export async function login(
  credentials: LoginCredentials,
  previousToken: string | undefined,
  headers?: Headers,
) {
  const account = getDatabase()
    .select({ passwordHash: authAccount.password })
    .from(authAccount)
    .where(and(eq(authAccount.userId, 1), eq(authAccount.providerId, "credential")))
    .get();
  try {
    return await loginWriteContext.run(
      { passwordHash: account?.passwordHash ?? null, previousToken },
      async () => {
        const result = await getAuth().api.signInUsername({
          body: credentials,
          headers,
          returnHeaders: true,
        });
        return { token: result.response.token, headers: result.headers };
      },
    );
  } catch (error) {
    if (error instanceof APIError && error.status === "UNAUTHORIZED") return null;
    throw error;
  }
}

export async function logout(token: string | undefined) {
  if (token)
    authTransaction((tx) => tx.delete(authSession).where(eq(authSession.token, token)).run());
}

export async function signOut(headers: Headers) {
  const previous = await readAdminSession(headers);
  const response = await getAuth().api.signOut({ headers, asResponse: true });
  // 框架退出会清 Cookie；数据库撤销失败时不把失败包装成成功。
  if (!response.ok || (previous && getSession(previous.sessionToken)))
    throw new Error("退出未完成。");
  return response.headers;
}

export async function consumeLoginAttempt() {
  const now = Date.now();
  const window = Math.floor(now / 60_000);
  const allowed = authTransaction((tx) => {
    const current = tx.select().from(loginRateLimit).where(eq(loginRateLimit.id, 1)).get();
    if (!current) {
      tx.insert(loginRateLimit).values({ id: 1, window, count: 1 }).run();
      return true;
    }
    if (current.window === window && current.count >= 20) return false;
    tx.update(loginRateLimit)
      .set({
        window,
        count: current.window === window ? current.count + 1 : 1,
      })
      .where(eq(loginRateLimit.id, 1))
      .run();
    return true;
  });
  return { allowed, retryAfter: Math.ceil(((window + 1) * 60_000 - now) / 1000) };
}
