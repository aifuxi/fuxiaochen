#!/usr/bin/env -S node
import {
  Migration,
  MigrationCLI,
  col,
  foreignKey,
  primaryKey,
  unique,
} from "@prisma/orm-sqlite/migration";

import type { Contract as End } from "../../snapshots/22b0ef2ff17a4f0bd9e2ca51b3eb8ae1922613fd6f04424d1fed4e75c0fa38bf/contract";
import type { Contract as Start } from "../../snapshots/638436acdd37d577097aafa0ec07e215b3f981258dac5ec0d1cdd22695c1a7dd/contract";

import endContract from "../../snapshots/22b0ef2ff17a4f0bd9e2ca51b3eb8ae1922613fd6f04424d1fed4e75c0fa38bf/contract.json" with { type: "json" };
import startContract from "../../snapshots/638436acdd37d577097aafa0ec07e215b3f981258dac5ec0d1cdd22695c1a7dd/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "backup_run",
        columns: [
          col("bytes", "INTEGER"),
          col("createdAt", "TEXT", { notNull: true }),
          col("dailyKey", "TEXT"),
          col("finishedAt", "TEXT"),
          col("id", "TEXT", { notNull: true }),
          col("sha256", "TEXT"),
          col("status", "TEXT", { notNull: true }),
        ],
        constraints: [primaryKey(["id"]), unique(["dailyKey"])],
      }),
      this.createTable({
        table: "notification",
        columns: [
          col("createdAt", "TEXT", { notNull: true }),
          col("href", "TEXT", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("kind", "TEXT", { notNull: true }),
          col("resolvedAt", "TEXT"),
          col("sourceId", "TEXT"),
          col("title", "TEXT", { notNull: true }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        table: "notification_read",
        columns: [
          col("adminId", "INTEGER", { notNull: true }),
          col("notificationId", "TEXT", { notNull: true }),
          col("readAt", "TEXT", { notNull: true }),
        ],
        constraints: [
          primaryKey(["notificationId", "adminId"]),
          foreignKey(["notificationId"], "notification", ["id"], { onDelete: "cascade" }),
          foreignKey(["adminId"], "admin", ["id"], { onDelete: "cascade" }),
        ],
      }),
      this.createTable({
        table: "operation_setting",
        columns: [
          col("autoBackup", "INTEGER", { notNull: true }),
          col("id", "INTEGER", { notNull: true }),
          col("schedulerLastRunAt", "TEXT"),
          col("updatedAt", "TEXT", { notNull: true }),
          col("version", "INTEGER", { notNull: true }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createIndex({
        table: "backup_run",
        index: "backup_run_createdAt_id_idx_3855cff1",
        columns: ["createdAt", "id"],
      }),
      this.createIndex({
        table: "notification",
        index: "notification_createdAt_id_idx_3855cff1",
        columns: ["createdAt", "id"],
      }),
      this.createIndex({
        table: "notification_read",
        index: "notification_read_adminId_idx_530179db",
        columns: ["adminId"],
      }),
      this.createIndex({
        table: "notification_read",
        index: "notification_read_notificationId_idx_adfe2654",
        columns: ["notificationId"],
      }),
    ];
  }
}

void MigrationCLI.run(import.meta.url, M);
