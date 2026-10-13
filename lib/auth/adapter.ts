import "server-only";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { APIError } from "better-auth/api";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { getDatabase, writeTransaction } from "@/lib/database";
import { authUser, authSession, authAccount, authVerification } from "@/lib/database/schema";

import { loginWriteContext, sessionTokens, sessionTokenHash } from "./storage-context";

export function authAdapter() {
  const client = getDatabase().$client;
  // 只包裹驱动的同步执行点。官方适配器的异步转换在事务外进行，
  // 每条写 SQL 在项目 IMMEDIATE 事务内执行，绝不把 Promise 交给 SQLite 事务。
  const lockedClient = new Proxy(client, {
    get(target, property) {
      if (property !== "prepare") {
        const value = Reflect.get(target, property, target);
        return typeof value === "function" ? value.bind(target) : value;
      }
      return (sql: string) => {
        const statement = target.prepare(sql);
        const wrapped = new Proxy(statement, {
          get(prepared, key) {
            const value = Reflect.get(prepared, key, prepared);
            if (typeof value !== "function") return value;
            if (prepared.readonly || !["run", "get", "all"].includes(String(key)))
              return (...args: unknown[]) => {
                const result = Reflect.apply(value, prepared, args);
                // raw()/pluck()/bind() 返回同一 Statement，继续保留同步写入边界。
                return result === prepared ? wrapped : result;
              };
            return (...args: unknown[]) =>
              writeTransaction(() => {
                const login = loginWriteContext.getStore();
                if (/^insert into "auth_session"/i.test(sql) && login) {
                  const account = client
                    .prepare<[], { password: string | null }>(
                      "SELECT password FROM auth_account WHERE userId=1 AND providerId='credential'",
                    )
                    .get();
                  if (!login.passwordHash || account?.password !== login.passwordHash)
                    throw new APIError("UNAUTHORIZED", { code: "INVALID_USERNAME_OR_PASSWORD" });
                  client.prepare("DELETE FROM auth_session WHERE expiresAt <= ?").run(Date.now());
                  if (login.previousToken)
                    client
                      .prepare("DELETE FROM auth_session WHERE token = ?")
                      .run(sessionTokenHash(login.previousToken));
                }
                return Reflect.apply(value, prepared, args);
              });
          },
        });
        return wrapped;
      };
    },
  });
  const factory = drizzleAdapter(drizzle(lockedClient), {
    provider: "sqlite",
    schema: {
      user: authUser,
      session: authSession,
      account: authAccount,
      verification: authVerification,
    },
    // better-sqlite3 不支持异步事务回调，写 SQL 由上面的同步边界负责。
    transaction: false,
  });
  return (options: Parameters<typeof factory>[0]) =>
    new Proxy(factory(options), {
      get(target, property) {
        const value = Reflect.get(target, property, target);
        if (typeof value !== "function") return value;
        return (...args: unknown[]) =>
          sessionTokens.run(new Map(), () => Reflect.apply(value, target, args));
      },
    });
}
