import "server-only";
import Sqlite from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { AsyncLocalStorage } from "node:async_hooks";

import { verifyDatabase } from "./migrations";
import { requiredDatabasePath } from "./path";
import * as schema from "./schema";

export function openDatabase(path: string) {
  const client = new Sqlite(path, { fileMustExist: true, timeout: 5_000 });
  try {
    client.pragma("foreign_keys = ON");
    client.pragma("journal_mode = WAL");
    client.pragma("synchronous = FULL");
    // SQLite 内置 lower 仅覆盖 ASCII，保留原有非 ASCII 大小写搜索行为。
    client.function("lower", { deterministic: true }, (value: unknown) => {
      if (value === null) return null;
      if (typeof value === "string") return value.toLowerCase();
      if (typeof value === "number" || typeof value === "bigint") return value.toString();
      if (value instanceof Uint8Array) return Buffer.from(value).toString("utf8").toLowerCase();
      throw new Error("搜索字段类型无效。");
    });
    verifyDatabase(client, { fullIntegrity: false });
    return Object.assign(drizzle(client, { schema }), { close: () => client.close() });
  } catch (error) {
    client.close();
    throw error;
  }
}

export type Database = ReturnType<typeof openDatabase>;
export type DatabaseTransaction = Parameters<Parameters<Database["transaction"]>[0]>[0];

const databaseGlobal = globalThis as typeof globalThis & {
  sqliteDatabase?: { path: string; db: Database };
};
const transactionContext = new AsyncLocalStorage<DatabaseTransaction>();

export function getDatabase(): Database {
  const path = requiredDatabasePath();
  const current = databaseGlobal.sqliteDatabase;
  if (current && current.path !== path) {
    throw new Error("数据库路径已变化，请先关闭当前连接。");
  }
  if (!current || !current.db.$client.open) {
    databaseGlobal.sqliteDatabase = { path, db: openDatabase(path) };
  }
  return databaseGlobal.sqliteDatabase!.db;
}

export function closeDatabase() {
  const current = databaseGlobal.sqliteDatabase;
  if (current?.db.$client.open) current.db.close();
  delete databaseGlobal.sqliteDatabase;
}

export function getActiveTransaction() {
  return transactionContext.getStore();
}

export function writeTransaction<T>(
  work: ((tx: DatabaseTransaction) => T) &
    ([T] extends [never] ? unknown : T extends PromiseLike<unknown> ? never : unknown),
): T {
  const current = getActiveTransaction();
  const run = (tx: DatabaseTransaction) =>
    transactionContext.run(tx, () => {
      // 同步驱动不能等待 Promise；拒绝异步回调，确保异常整体回滚。
      if (work.constructor.name === "AsyncFunction") throw new Error("写事务必须使用同步回调。");
      const result = work(tx);
      if (result && typeof (result as { then?: unknown }).then === "function") {
        throw new Error("写事务不能返回 Promise。");
      }
      return result;
    });
  return current
    ? current.transaction(run)
    : getDatabase().transaction(run, { behavior: "immediate" });
}

export const authTransaction = writeTransaction;
