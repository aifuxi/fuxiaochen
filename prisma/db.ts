import "server-only";
import sqlite from "@prisma/orm-sqlite/runtime";

import type { Contract } from "../generated/prisma/contract";

import contractJson from "../generated/prisma/contract.json";
import { databasePath } from "../lib/database-path";

function createDatabase() {
  return sqlite<Contract>({ contractJson, path: databasePath() });
}

const databaseGlobal = globalThis as typeof globalThis & {
  adminDatabase?: ReturnType<typeof createDatabase>;
  authWriteQueue?: Promise<void>;
};

export function getDatabase() {
  databaseGlobal.adminDatabase ??= createDatabase();
  return databaseGlobal.adminDatabase;
}

type Transaction = Parameters<Parameters<ReturnType<typeof createDatabase>["transaction"]>[0]>[0];

export function writeTransaction<T>(work: (tx: Transaction) => PromiseLike<T>) {
  // node:sqlite 使用同步锁等待；同一进程的写事务排队，避免等待阻塞持锁请求继续执行。
  const result = (databaseGlobal.authWriteQueue ?? Promise.resolve()).then(() =>
    getDatabase().transaction(work),
  );
  databaseGlobal.authWriteQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

// 鉴权和业务写入必须使用同一队列。
export const authTransaction = writeTransaction;
