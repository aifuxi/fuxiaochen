import "server-only";
import postgres from "@prisma/orm-postgres/runtime";
import { AsyncLocalStorage } from "node:async_hooks";

import type { Contract } from "../generated/prisma/contract";

import contractJson from "../generated/prisma/contract.json";
import { databaseUrl } from "../lib/database-url";

function createDatabase() {
  // 无连接配置时仍可加载模块和生成构建；首次数据库操作才要求连接。
  return postgres<Contract>({ contractJson, url: databaseUrl() });
}

const databaseGlobal = globalThis as typeof globalThis & {
  adminDatabase?: ReturnType<typeof createDatabase>;
};

export function getDatabase() {
  databaseGlobal.adminDatabase ??= createDatabase();
  return databaseGlobal.adminDatabase;
}

export type DatabaseTransaction = Parameters<
  Parameters<ReturnType<typeof createDatabase>["transaction"]>[0]
>[0];

const transactionContext = new AsyncLocalStorage<DatabaseTransaction>();

// 鉴权读取复用当前事务，避免并发等待写锁时耗尽池后再申请额外连接。
export function getActiveTransaction() {
  return transactionContext.getStore();
}

export function writeTransaction<T>(work: (tx: DatabaseTransaction) => PromiseLike<T>) {
  return getDatabase().transaction(async (tx) => {
    // 跨 Web、CLI 进程共享写锁；事务结束自动释放，所有业务写入先锁后读。
    await tx.query(
      getDatabase().raw.sql`SELECT 1 AS locked FROM pg_advisory_xact_lock(734825101)`
        .returnsRow({ locked: "pg/int4@1" })
        .build(),
    );
    return transactionContext.run(tx, () => work(tx));
  });
}

export const authTransaction = writeTransaction;
