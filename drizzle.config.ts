import { defineConfig } from "drizzle-kit";

// 生成 SQL 只依赖 schema，开发工具不读取或连接任何现有数据库。
export default defineConfig({
  dialect: "sqlite",
  schema: "./lib/database/schema.ts",
  out: "./drizzle",
  strict: true,
  verbose: true,
});
