import "server-only";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { APIError } from "better-auth/api";
import { drizzle } from "drizzle-orm/better-sqlite3";

import { getDatabase, writeTransaction } from "@/lib/database";
import {
  authUser,
  authSession,
  authAccount,
  authVerification,
  authPasskey,
} from "@/lib/database/schema";

import { getSession } from "./session-access";
import {
  loginWriteContext,
  passkeyWriteContext,
  sessionTokens,
  sessionTokenHash,
} from "./storage-context";

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
                const passkey = passkeyWriteContext.getStore();
                if (
                  passkey?.actorToken &&
                  passkey.kind !== "authentication" &&
                  !getSession(passkey.actorToken)
                )
                  throw new APIError("UNAUTHORIZED", { code: "UNAUTHORIZED" });
                const insertingSession = /^insert into "auth_session"/i.test(sql);
                // 插件验证签名后会分开更新计数和创建会话；在各同步写点复核，
                // 防止验证期间密钥被删除、计数改变或密码被重置后仍创建会话。
                if (
                  passkey?.kind === "authentication" &&
                  (/^update "auth_passkey"/i.test(sql) || insertingSession)
                ) {
                  const expected = passkey.credential;
                  const current =
                    expected &&
                    client
                      .prepare<
                        [number],
                        { counter: number; publicKey: string; userId: number; credentialID: string }
                      >(
                        "SELECT counter, publicKey, userId, credentialID FROM auth_passkey WHERE id=?",
                      )
                      .get(expected.id);
                  const password = client
                    .prepare<[], { password: string | null }>(
                      "SELECT password FROM auth_account WHERE userId=1 AND providerId='credential'",
                    )
                    .get();
                  const counter = insertingSession ? passkey.verifiedCounter : expected?.counter;
                  if (
                    !expected ||
                    !current ||
                    current.userId !== 1 ||
                    current.publicKey !== expected.publicKey ||
                    current.credentialID !== expected.credentialID ||
                    counter === undefined ||
                    current.counter !== counter ||
                    password?.password !== passkey.passwordHash
                  )
                    throw new APIError("UNAUTHORIZED", { code: "AUTHENTICATION_FAILED" });
                }
                if (/^insert into "auth_session"/i.test(sql) && login) {
                  const account = client
                    .prepare<[], { password: string | null }>(
                      "SELECT password FROM auth_account WHERE userId=1 AND providerId='credential'",
                    )
                    .get();
                  if (!login.passwordHash || account?.password !== login.passwordHash)
                    throw new APIError("UNAUTHORIZED", { code: "INVALID_USERNAME_OR_PASSWORD" });
                }
                if (insertingSession && (login || passkey?.kind === "authentication")) {
                  client.prepare("DELETE FROM auth_session WHERE expiresAt <= ?").run(Date.now());
                  const previousToken = login?.previousToken ?? passkey?.previousToken;
                  if (previousToken)
                    client
                      .prepare("DELETE FROM auth_session WHERE token = ?")
                      .run(sessionTokenHash(previousToken));
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
      passkey: authPasskey,
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
