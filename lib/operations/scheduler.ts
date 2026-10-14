import "server-only";
import { eq } from "drizzle-orm";

import { writeTransaction } from "@/lib/database";
import { operationSetting as operationSettingTable } from "@/lib/database/schema";

import { createBackup, newBackupId } from "./backups";
import { operationSetting } from "./settings";

export async function runScheduledOperations() {
  const setting = writeTransaction((tx) => {
    operationSetting(tx);
    tx.update(operationSettingTable)
      .set({ schedulerLastRunAt: new Date() })
      .where(eq(operationSettingTable.id, 1))
      .run();
    return operationSetting(tx);
  });
  const date = new Date(Date.now() + 8 * 3_600_000).toISOString().slice(0, 10);
  const backup = setting.autoBackup ? await createBackup(newBackupId(), undefined, date) : null;
  return { backup };
}
