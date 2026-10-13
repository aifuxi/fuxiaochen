import "server-only";
import type { z } from "zod";

import { and, eq } from "drizzle-orm";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin, AdminBusinessError } from "@/lib/admin/service";
import { writeTransaction } from "@/lib/database";
import { operationSetting as operationSettingTable } from "@/lib/database/schema";

import type { OperationTransaction } from "./notifications";
import type { operationSettingsSchema, OperationSettings } from "./schema";

export function operationSetting(tx: OperationTransaction) {
  const existing = tx
    .select()
    .from(operationSettingTable)
    .where(eq(operationSettingTable.id, 1))
    .get();
  if (existing) return existing;
  return tx
    .insert(operationSettingTable)
    .values({ id: 1, autoBackup: 0, version: 1, schedulerLastRunAt: null, updatedAt: new Date() })
    .returning()
    .get();
}
function serialize(row: ReturnType<typeof operationSetting>): OperationSettings {
  return {
    autoBackup: Boolean(row.autoBackup),
    version: row.version,
    schedulerLastRunAt: row.schedulerLastRunAt?.toISOString() ?? null,
  };
}
export async function getOperationSettings(actor: TaxonomyActor) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    return serialize(operationSetting(tx));
  });
}
export async function saveOperationSettings(
  input: z.infer<typeof operationSettingsSchema>,
  actor: TaxonomyActor,
) {
  return writeTransaction((tx) => {
    authorizeAdmin(actor, tx);
    operationSetting(tx);
    if (
      !tx
        .update(operationSettingTable)
        .set({
          autoBackup: Number(input.autoBackup),
          version: input.version + 1,
          updatedAt: new Date(),
        })
        .where(
          and(eq(operationSettingTable.id, 1), eq(operationSettingTable.version, input.version)),
        )
        .run().changes
    )
      throw new AdminBusinessError("VERSION_CONFLICT", "备份设置已变化，请重新载入后再操作。");
    return serialize(operationSetting(tx));
  });
}
