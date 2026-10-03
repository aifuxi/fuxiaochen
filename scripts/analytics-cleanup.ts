import "dotenv/config";
import { cleanupAnalytics } from "../lib/analytics/collection";
import { getDatabase } from "../prisma/db";

try {
  if (process.argv.length > 2) throw new Error("不接受命令参数");
  console.log(JSON.stringify(await cleanupAnalytics(true)));
} catch {
  console.error("访问记录清理失败，请检查数据库及命令参数。");
  process.exitCode = 1;
} finally {
  await getDatabase().close();
}
