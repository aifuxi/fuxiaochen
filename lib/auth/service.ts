import "server-only";
import { and, eq, gt, lte } from "drizzle-orm";
import { createHash, randomBytes } from "node:crypto";

import {
  authTransaction,
  getActiveTransaction,
  getDatabase,
  type Database,
  type DatabaseTransaction,
} from "@/lib/database";
import { admin, session, loginRateLimit } from "@/lib/database/schema";

import type { LoginCredentials } from "./schema";

import { DUMMY_PASSWORD_HASH, verifyPassword } from "./password";

export const SESSION_COOKIE = "fx_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function tokenHash(token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return createHash("sha256").update(token).digest("hex");
}

export function getSession(token: string | undefined, db?: Database | DatabaseTransaction) {
  const id = tokenHash(token);
  if (!id) return null;
  return (
    (db ?? getActiveTransaction() ?? getDatabase())
      .select({ adminId: session.adminId, username: admin.username })
      .from(session)
      .innerJoin(admin, eq(session.adminId, admin.id))
      .where(and(eq(session.id, id), gt(session.expiresAt, new Date())))
      .get() ?? null
  );
}

export async function login(credentials: LoginCredentials, previousToken: string | undefined) {
  const db = getDatabase();
  const account = db
    .select()
    .from(admin)
    .where(and(eq(admin.id, 1), eq(admin.username, credentials.username)))
    .get();
  const matches = await verifyPassword(
    account?.passwordHash ?? DUMMY_PASSWORD_HASH,
    credentials.password,
  );
  if (!account || !matches) return null;

  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE * 1000);
  return authTransaction((tx) => {
    // 重置密码和撤销会话共用事务；拒绝已被重置的密码校验结果。
    const current = tx
      .select({ id: admin.id })
      .from(admin)
      .where(and(eq(admin.id, account.id), eq(admin.passwordHash, account.passwordHash)))
      .get();
    if (!current) return null;
    tx.delete(session).where(lte(session.expiresAt, now)).run();
    const previousId = tokenHash(previousToken);
    if (previousId) tx.delete(session).where(eq(session.id, previousId)).run();
    tx.insert(session)
      .values({
        id: createHash("sha256").update(token).digest("hex"),
        adminId: account.id,
        createdAt: now,
        expiresAt,
      })
      .run();
    return token;
  });
}

export async function logout(token: string | undefined) {
  const id = tokenHash(token);
  if (id) authTransaction((tx) => tx.delete(session).where(eq(session.id, id)).run());
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
