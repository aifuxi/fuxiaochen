#!/usr/bin/env -S node
import {
  Migration,
  MigrationCLI,
  col,
  foreignKey,
  primaryKey,
  unique,
} from "@prisma/orm-sqlite/migration";

import type { Contract as End } from "../../snapshots/10f95d353ed756c27bb78d81421a5d34bfe83fa1476e59965d7da22a2bb25e69/contract";
import type { Contract as Start } from "../../snapshots/eb92420b39c6e04e583d85aeb4ca7ada37810fc3664aa3b0070160d7e8e93d7b/contract";

import endContract from "../../snapshots/10f95d353ed756c27bb78d81421a5d34bfe83fa1476e59965d7da22a2bb25e69/contract.json" with { type: "json" };
import startContract from "../../snapshots/eb92420b39c6e04e583d85aeb4ca7ada37810fc3664aa3b0070160d7e8e93d7b/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "comment",
        columns: [
          col("adminId", "INTEGER"),
          col("author", "TEXT", { notNull: true }),
          col("content", "TEXT", { notNull: true }),
          col("createdAt", "TEXT", { notNull: true }),
          col("email", "TEXT"),
          col("id", "TEXT", { notNull: true }),
          col("parentId", "TEXT"),
          col("postId", "TEXT", { notNull: true }),
          col("status", "TEXT", { notNull: true }),
          col("updatedAt", "TEXT", { notNull: true }),
          col("version", "INTEGER", { notNull: true }),
        ],
        constraints: [
          primaryKey(["id"]),
          unique(["id", "postId"]),
          foreignKey(["postId"], "post", ["id"], { onDelete: "cascade" }),
          foreignKey(["parentId", "postId"], "comment", ["id", "postId"], { onDelete: "cascade" }),
          foreignKey(["adminId"], "admin", ["id"], { onDelete: "setNull" }),
        ],
      }),
      this.createIndex({
        table: "comment",
        index: "comment_adminId_idx_530179db",
        columns: ["adminId"],
      }),
      this.createIndex({
        table: "comment",
        index: "comment_createdAt_id_idx_3855cff1",
        columns: ["createdAt", "id"],
      }),
      this.createIndex({
        table: "comment",
        index: "comment_parentId_idx_6a68f597",
        columns: ["parentId"],
      }),
      this.createIndex({
        table: "comment",
        index: "comment_parentId_postId_idx_1317b68e",
        columns: ["parentId", "postId"],
      }),
      this.createIndex({
        table: "comment",
        index: "comment_postId_idx_a7a72715",
        columns: ["postId"],
      }),
      this.createIndex({
        table: "comment",
        index: "comment_status_createdAt_id_idx_ffb42ad8",
        columns: ["status", "createdAt", "id"],
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
