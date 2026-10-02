#!/usr/bin/env -S node
import { Migration, MigrationCLI, col, foreignKey, primaryKey } from "@prisma/orm-sqlite/migration";

import type { Contract as End } from "../../snapshots/78cc501852b2aad031a8a7247952b4111be432679601d0331ddd3da188145f1c/contract";
import type { Contract as Start } from "../../snapshots/f0b62a75826f509074906baeedbf788bab4bc2a81d71a0b13b0d5e92dd5c44ca/contract";

import endContract from "../../snapshots/78cc501852b2aad031a8a7247952b4111be432679601d0331ddd3da188145f1c/contract.json" with { type: "json" };
import startContract from "../../snapshots/f0b62a75826f509074906baeedbf788bab4bc2a81d71a0b13b0d5e92dd5c44ca/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "post",
        columns: [
          col("categoryId", "TEXT", { notNull: true }),
          col("content", "TEXT", { notNull: true }),
          col("createdAt", "TEXT", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("publishedAt", "TEXT"),
          col("scheduledFor", "TEXT"),
          col("status", "TEXT", { notNull: true }),
          col("title", "TEXT", { notNull: true }),
          col("updatedAt", "TEXT", { notNull: true }),
          col("version", "INTEGER", { notNull: true }),
        ],
        constraints: [
          primaryKey(["id"]),
          foreignKey(["categoryId"], "category", ["id"], { onDelete: "restrict" }),
        ],
      }),
      this.createTable({
        table: "post_tag",
        columns: [
          col("postId", "TEXT", { notNull: true }),
          col("tagId", "TEXT", { notNull: true }),
        ],
        constraints: [
          primaryKey(["postId", "tagId"]),
          foreignKey(["postId"], "post", ["id"], { onDelete: "cascade" }),
          foreignKey(["tagId"], "tag", ["id"], { onDelete: "restrict" }),
        ],
      }),
      this.createIndex({
        table: "post",
        index: "post_categoryId_idx_15c304f2",
        columns: ["categoryId"],
      }),
      this.createIndex({
        table: "post",
        index: "post_createdAt_id_idx_3855cff1",
        columns: ["createdAt", "id"],
      }),
      this.createIndex({
        table: "post",
        index: "post_status_scheduledFor_idx_e20b7d95",
        columns: ["status", "scheduledFor"],
      }),
      this.createIndex({
        table: "post_tag",
        index: "post_tag_postId_idx_a7a72715",
        columns: ["postId"],
      }),
      this.createIndex({
        table: "post_tag",
        index: "post_tag_tagId_idx_86854244",
        columns: ["tagId"],
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
