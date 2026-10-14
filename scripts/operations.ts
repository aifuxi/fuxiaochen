import "dotenv/config";
import { closeDatabase } from "../lib/database";
import { createBackup, newBackupId } from "../lib/operations/backups";
import { runScheduledOperations } from "../lib/operations/scheduler";

async function main() {
  const [command, ...extra] = process.argv.slice(2);
  if (extra.length || !["run", "backup"].includes(command))
    throw new Error("用法：npm run operations:run | db:backup");
  try {
    const result =
      command === "run" ? await runScheduledOperations() : await createBackup(newBackupId());
    console.log(JSON.stringify(result, null, 2));
  } finally {
    closeDatabase();
  }
}
main().catch((error: unknown) => {
  console.error("后台任务执行失败", { name: error instanceof Error ? error.name : "UnknownError" });
  process.exitCode = 1;
});
