#!/usr/bin/env -S node
import {
  Migration,
  MigrationCLI,
  col,
  foreignKey,
  primaryKey,
  unique,
} from "@prisma/orm-sqlite/migration";

import type { Contract as End } from "../../snapshots/19eb13512da6dbea65de7922fe8f1db42daef25e6b072640c35863b01720aa25/contract";

import endContract from "../../snapshots/19eb13512da6dbea65de7922fe8f1db42daef25e6b072640c35863b01720aa25/contract.json" with { type: "json" };

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "admin",
        columns: [
          col("createdAt", "TEXT", { notNull: true }),
          col("id", "INTEGER", { notNull: true }),
          col("passwordHash", "TEXT", { notNull: true }),
          col("updatedAt", "TEXT", { notNull: true }),
          col("username", "TEXT", { notNull: true }),
        ],
        constraints: [primaryKey(["id"]), unique(["username"])],
      }),
      this.createTable({
        table: "login_rate_limit",
        columns: [
          col("count", "INTEGER", { notNull: true }),
          col("id", "INTEGER", { notNull: true }),
          col("window", "INTEGER", { notNull: true }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        table: "session",
        columns: [
          col("adminId", "INTEGER", { notNull: true }),
          col("createdAt", "TEXT", { notNull: true }),
          col("expiresAt", "TEXT", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
        ],
        constraints: [
          primaryKey(["id"]),
          foreignKey(["adminId"], "admin", ["id"], { onDelete: "cascade" }),
        ],
      }),
      this.createIndex({
        table: "session",
        index: "session_adminId_idx_530179db",
        columns: ["adminId"],
      }),
      this.createIndex({
        table: "session",
        index: "session_expiresAt_idx_6b6b8c10",
        columns: ["expiresAt"],
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
