import "server-only";
import type { z } from "zod";

import type { TaxonomyActor } from "@/lib/taxonomy/service";

import { authorizeAdmin, AdminBusinessError } from "@/lib/admin/service";
import { writeTransaction } from "@/prisma/db";

import type { OperationTransaction } from "./notifications";
import type { operationSettingsSchema, OperationSettings } from "./schema";

export async function operationSetting(tx: OperationTransaction) {
  return (
    (await tx.orm.public.OperationSetting.where({ id: 1 }).first()) ??
    tx.orm.public.OperationSetting.create({
      id: 1,
      autoBackup: 0,
      version: 1,
      schedulerLastRunAt: null,
      updatedAt: new Date(),
    })
  );
}
function serialize(row: Awaited<ReturnType<typeof operationSetting>>): OperationSettings {
  return {
    autoBackup: Boolean(row.autoBackup),
    version: row.version,
    schedulerLastRunAt: row.schedulerLastRunAt?.toISOString() ?? null,
  };
}
export async function getOperationSettings(actor: TaxonomyActor) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    return serialize(await operationSetting(tx));
  });
}
export async function saveOperationSettings(
  input: z.infer<typeof operationSettingsSchema>,
  actor: TaxonomyActor,
) {
  return writeTransaction(async (tx) => {
    await authorizeAdmin(actor);
    await operationSetting(tx);
    if (
      !(await tx.orm.public.OperationSetting.where({
        id: 1,
        version: input.version,
      }).updateAndCount({
        autoBackup: Number(input.autoBackup),
        version: input.version + 1,
        updatedAt: new Date(),
      }))
    )
      throw new AdminBusinessError("VERSION_CONFLICT", "备份设置已变化，请重新载入后再操作。");
    return serialize(await operationSetting(tx));
  });
}
