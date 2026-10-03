#!/usr/bin/env -S node
import { Migration, MigrationCLI, col, foreignKey, primaryKey } from "@prisma/orm-sqlite/migration";

import type { Contract as Start } from "../../snapshots/9cc8e9fd5de9ee30a9aa2341ff0f803bcb17c503fc54f11c96cc76747b529cab/contract";
import type { Contract as End } from "../../snapshots/638436acdd37d577097aafa0ec07e215b3f981258dac5ec0d1cdd22695c1a7dd/contract";

import startContract from "../../snapshots/9cc8e9fd5de9ee30a9aa2341ff0f803bcb17c503fc54f11c96cc76747b529cab/contract.json" with { type: "json" };
import endContract from "../../snapshots/638436acdd37d577097aafa0ec07e215b3f981258dac5ec0d1cdd22695c1a7dd/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "analytics_rate_limit",
        columns: [
          col("count", "INTEGER", { notNull: true }),
          col("expiresAt", "TEXT", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("window", "INTEGER", { notNull: true }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        table: "page_visit",
        columns: [
          col("article", "INTEGER", { notNull: true }),
          col("browser", "TEXT", { notNull: true }),
          col("createdAt", "TEXT", { notNull: true }),
          col("device", "TEXT", { notNull: true }),
          col("durationMs", "INTEGER", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("ip", "TEXT", { notNull: true }),
          col("lastSeenAt", "TEXT", { notNull: true }),
          col("location", "TEXT", { notNull: true }),
          col("os", "TEXT", { notNull: true }),
          col("path", "TEXT", { notNull: true }),
          col("postId", "TEXT"),
          col("progress", "INTEGER", { notNull: true }),
          col("referrerHost", "TEXT", { notNull: true }),
          col("sessionId", "TEXT", { notNull: true }),
          col("source", "TEXT", { notNull: true }),
          col("visitorHash", "TEXT", { notNull: true }),
        ],
        constraints: [
          primaryKey(["id"]),
          foreignKey(["sessionId"], "visit_session", ["id"], { onDelete: "cascade" }),
          foreignKey(["postId"], "post", ["id"], { onDelete: "setNull" }),
        ],
      }),
      this.createTable({
        table: "visit_session",
        columns: [
          col("createdAt", "TEXT", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("lastSeenAt", "TEXT", { notNull: true }),
          col("visitorHash", "TEXT", { notNull: true }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.addColumn({
        table: "site_setting",
        column: {
          name: "localAnalyticsEnabled",
          typeSql: "INTEGER",
          defaultSql: "",
          nullable: true,
        },
      }),
      this.addColumn({
        table: "site_setting",
        column: {
          name: "localAnalyticsStartedAt",
          typeSql: "TEXT",
          defaultSql: "",
          nullable: true,
        },
      }),
      this.createIndex({
        table: "analytics_rate_limit",
        index: "analytics_rate_limit_expiresAt_idx_6b6b8c10",
        columns: ["expiresAt"],
      }),
      this.createIndex({
        table: "page_visit",
        index: "page_visit_createdAt_id_idx_3855cff1",
        columns: ["createdAt", "id"],
      }),
      this.createIndex({
        table: "page_visit",
        index: "page_visit_lastSeenAt_idx_b69845da",
        columns: ["lastSeenAt"],
      }),
      this.createIndex({
        table: "page_visit",
        index: "page_visit_postId_createdAt_idx_b244c517",
        columns: ["postId", "createdAt"],
      }),
      this.createIndex({
        table: "page_visit",
        index: "page_visit_postId_idx_a7a72715",
        columns: ["postId"],
      }),
      this.createIndex({
        table: "page_visit",
        index: "page_visit_sessionId_idx_29f415d4",
        columns: ["sessionId"],
      }),
      this.createIndex({
        table: "page_visit",
        index: "page_visit_visitorHash_lastSeenAt_idx_484f4b5e",
        columns: ["visitorHash", "lastSeenAt"],
      }),
      this.createIndex({
        table: "visit_session",
        index: "visit_session_createdAt_idx_9575dbd7",
        columns: ["createdAt"],
      }),
      this.createIndex({
        table: "visit_session",
        index: "visit_session_lastSeenAt_idx_b69845da",
        columns: ["lastSeenAt"],
      }),
      this.createIndex({
        table: "visit_session",
        index: "visit_session_visitorHash_lastSeenAt_idx_484f4b5e",
        columns: ["visitorHash", "lastSeenAt"],
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
