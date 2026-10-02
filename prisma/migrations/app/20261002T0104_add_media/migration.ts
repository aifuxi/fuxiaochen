#!/usr/bin/env -S node
import {
  Migration,
  MigrationCLI,
  col,
  foreignKey,
  primaryKey,
  unique,
} from "@prisma/orm-sqlite/migration";

import type { Contract as Start } from "../../snapshots/78cc501852b2aad031a8a7247952b4111be432679601d0331ddd3da188145f1c/contract";
import type { Contract as End } from "../../snapshots/eb92420b39c6e04e583d85aeb4ca7ada37810fc3664aa3b0070160d7e8e93d7b/contract";

import startContract from "../../snapshots/78cc501852b2aad031a8a7247952b4111be432679601d0331ddd3da188145f1c/contract.json" with { type: "json" };
import endContract from "../../snapshots/eb92420b39c6e04e583d85aeb4ca7ada37810fc3664aa3b0070160d7e8e93d7b/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "media",
        columns: [
          col("adminId", "INTEGER", { notNull: true }),
          col("bytes", "INTEGER"),
          col("createdAt", "TEXT", { notNull: true }),
          col("deletedAt", "TEXT"),
          col("expectedBytes", "INTEGER", { notNull: true }),
          col("expiresAt", "TEXT", { notNull: true }),
          col("height", "INTEGER"),
          col("id", "TEXT", { notNull: true }),
          col("kind", "TEXT", { notNull: true }),
          col("leaseToken", "TEXT"),
          col("leaseUntil", "TEXT"),
          col("mime", "TEXT"),
          col("name", "TEXT", { notNull: true }),
          col("objectKey", "TEXT", { notNull: true }),
          col("sha256", "TEXT", { notNull: true }),
          col("stagingCleanedAt", "TEXT"),
          col("stagingKey", "TEXT", { notNull: true }),
          col("status", "TEXT", { notNull: true }),
          col("uploadedAt", "TEXT"),
          col("width", "INTEGER"),
        ],
        constraints: [
          primaryKey(["id"]),
          unique(["stagingKey"]),
          unique(["objectKey"]),
          foreignKey(["adminId"], "admin", ["id"], { onDelete: "restrict" }),
        ],
      }),
      this.createTable({
        table: "media_upload_limit",
        columns: [
          col("adminId", "INTEGER", { notNull: true }),
          col("count", "INTEGER", { notNull: true }),
          col("window", "INTEGER", { notNull: true }),
        ],
        constraints: [
          primaryKey(["adminId"]),
          foreignKey(["adminId"], "admin", ["id"], { onDelete: "cascade" }),
        ],
      }),
      this.createIndex({
        table: "media",
        index: "media_adminId_idx_530179db",
        columns: ["adminId"],
      }),
      this.createIndex({
        table: "media",
        index: "media_createdAt_id_idx_3855cff1",
        columns: ["createdAt", "id"],
      }),
      this.createIndex({
        table: "media",
        index: "media_status_expiresAt_idx_c206f415",
        columns: ["status", "expiresAt"],
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
