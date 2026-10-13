import { isAbsolute, resolve } from "node:path";

// 必须显式选择 SQLite 文件，避免沿用 PostgreSQL 配置或误打开历史数据。
export function requiredDatabasePath(value = process.env.DATABASE_PATH): string {
  if (!value?.trim() || value === ":memory:" || /^(?:file|postgres(?:ql)?):/i.test(value)) {
    throw new Error("请配置 DATABASE_PATH 指向独立 SQLite 文件。");
  }
  return isAbsolute(value) ? value : resolve(value);
}
