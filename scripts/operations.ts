import "dotenv/config";
import { createBackup, newBackupId } from "../lib/operations/backups";
import { publishDuePosts, runScheduledOperations } from "../lib/operations/scheduler";
import { getDatabase } from "../prisma/db";

async function main() {
  const [command, ...extra] = process.argv.slice(2);
  if (extra.length || !["run", "publish", "backup"].includes(command))
    throw new Error("用法：npm run operations:run | posts:publish-due | db:backup");
  try {
    const result =
      command === "run"
        ? await runScheduledOperations()
        : command === "publish"
          ? await publishDuePosts()
          : await createBackup(newBackupId());
    console.log(JSON.stringify(result, null, 2));
    const publication =
      "publication" in result ? result.publication : "skipped" in result ? result : null;
    if (publication?.skipped) process.exitCode = 1;
  } finally {
    await getDatabase().close();
  }
}
main().catch((error: unknown) => {
  console.error("后台任务执行失败", { name: error instanceof Error ? error.name : "UnknownError" });
  process.exitCode = 1;
});
