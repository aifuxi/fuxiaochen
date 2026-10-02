import "dotenv/config";
import { MediaError } from "../lib/media/error";
import { cleanupMedia } from "../lib/media/service";
import { closeStorage } from "../lib/media/storage";
import { getDatabase } from "../prisma/db";

async function main() {
  const args = process.argv.slice(2);
  if (args.some((arg) => arg !== "--dry-run")) throw new Error("仅支持 --dry-run 参数");
  try {
    const result = await cleanupMedia(args.includes("--dry-run"));
    console.log(JSON.stringify(result));
    if (result.failed) process.exitCode = 1;
  } finally {
    closeStorage();
    await getDatabase().close();
  }
}
main().catch((error: unknown) => {
  console.error("媒体清理失败", {
    name: error instanceof Error ? error.name : "UnknownError",
    message: error instanceof MediaError ? error.message : "请检查数据库、命令参数及 OSS 配置。",
  });
  process.exitCode = 1;
});
