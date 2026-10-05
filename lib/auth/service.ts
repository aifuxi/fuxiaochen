import "server-only";
import { createHash, randomBytes } from "node:crypto";

import { authTransaction, getActiveTransaction, getDatabase } from "@/prisma/db";

import type { LoginCredentials } from "./schema";

import { DUMMY_PASSWORD_HASH, verifyPassword } from "./password";

export const SESSION_COOKIE = "fx_admin_session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

function tokenHash(token: string | undefined) {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return null;
  return createHash("sha256").update(token).digest("hex");
}

export async function getSession(token: string | undefined) {
  const id = tokenHash(token);
  if (!id) return null;
  const session = await (getActiveTransaction() ?? getDatabase()).orm.public.Session.where({ id })
    .where((s) => s.expiresAt.gt(new Date()))
    .include("admin")
    .first();
  if (!session?.admin) return null;
  return { adminId: session.adminId, username: session.admin.username };
}

export async function login(credentials: LoginCredentials, previousToken: string | undefined) {
  const db = getDatabase();
  const admin = await db.orm.public.Admin.where({ id: 1, username: credentials.username }).first();
  const matches = await verifyPassword(
    admin?.passwordHash ?? DUMMY_PASSWORD_HASH,
    credentials.password,
  );
  if (!admin || !matches) return null;

  const token = randomBytes(32).toString("hex");
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE * 1000);
  return authTransaction(async (tx) => {
    // 重置密码和撤销会话共用事务；拒绝已被重置的密码校验结果。
    const current = await tx.orm.public.Admin.where({
      id: admin.id,
      passwordHash: admin.passwordHash,
    }).first();
    if (!current) return null;
    await tx.orm.public.Session.where((s) => s.expiresAt.lte(now)).deleteAndCount();
    const previousId = tokenHash(previousToken);
    if (previousId) await tx.orm.public.Session.where({ id: previousId }).deleteAndCount();
    await tx.orm.public.Session.create({
      id: createHash("sha256").update(token).digest("hex"),
      adminId: admin.id,
      createdAt: now,
      expiresAt,
    });
    return token;
  });
}

export async function logout(token: string | undefined) {
  const id = tokenHash(token);
  if (id) await authTransaction((tx) => tx.orm.public.Session.where({ id }).deleteAndCount());
}

export async function consumeLoginAttempt() {
  const now = Date.now();
  const window = Math.floor(now / 60_000);
  const allowed = await authTransaction(async (tx) => {
    const current = await tx.orm.public.LoginRateLimit.where({ id: 1 }).first();
    if (!current) {
      await tx.orm.public.LoginRateLimit.create({ id: 1, window, count: 1 });
      return true;
    }
    if (current.window === window && current.count >= 20) return false;
    await tx.orm.public.LoginRateLimit.where({ id: 1 }).update({
      window,
      count: current.window === window ? current.count + 1 : 1,
    });
    return true;
  });
  return { allowed, retryAfter: Math.ceil(((window + 1) * 60_000 - now) / 1000) };
}
