// 配置供 Prisma CLI 和服务端共用；错误消息不包含连接凭据。
export function databaseUrl(value = process.env.DATABASE_URL): string | undefined {
  if (value === undefined) return undefined;
  try {
    const url = new URL(value);
    if (
      !["postgres:", "postgresql:"].includes(url.protocol) ||
      !url.hostname ||
      url.pathname.length < 2
    )
      throw new Error();
    return value;
  } catch {
    throw new Error("数据库连接配置无效，请检查 DATABASE_URL。");
  }
}

export function requiredDatabaseUrl(value = process.env.DATABASE_URL): string {
  const url = databaseUrl(value);
  if (!url) throw new Error("请配置 DATABASE_URL 后再执行数据库操作。");
  return url;
}
