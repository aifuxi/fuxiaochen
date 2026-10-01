import { resolve } from "node:path";
import { z } from "zod";

export function databasePath() {
  const path = z
    .string()
    .min(1)
    .parse(process.env.DATABASE_PATH ?? "./data/admin.sqlite");
  // 数据库由运行环境提供，不应由 Turbopack 将该路径及整个项目打包为资源。
  return resolve(/* turbopackIgnore: true */ process.cwd(), path);
}
