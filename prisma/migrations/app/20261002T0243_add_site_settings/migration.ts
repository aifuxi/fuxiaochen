#!/usr/bin/env -S node
import { Migration, MigrationCLI, col, foreignKey, primaryKey } from "@prisma/orm-sqlite/migration";

import type { Contract as End } from "../../snapshots/5bdcabecfa326ccdb9dd1f9ebaef5f81ef7add36a13fe02d0429bbed06ccd090/contract";
import type { Contract as Start } from "../../snapshots/10f95d353ed756c27bb78d81421a5d34bfe83fa1476e59965d7da22a2bb25e69/contract";

import endContract from "../../snapshots/5bdcabecfa326ccdb9dd1f9ebaef5f81ef7add36a13fe02d0429bbed06ccd090/contract.json" with { type: "json" };
import startContract from "../../snapshots/10f95d353ed756c27bb78d81421a5d34bfe83fa1476e59965d7da22a2bb25e69/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "site_setting",
        columns: [
          col("aboutMe", "TEXT", { notNull: true }),
          col("authorName", "TEXT", { notNull: true }),
          col("authorRole", "TEXT", { notNull: true }),
          col("avatarUrl", "TEXT", { notNull: true }),
          col("baiduEnabled", "INTEGER", { notNull: true }),
          col("baiduId", "TEXT", { notNull: true }),
          col("enableComments", "INTEGER", { notNull: true }),
          col("googleEnabled", "INTEGER", { notNull: true }),
          col("googleId", "TEXT", { notNull: true }),
          col("icpText", "TEXT", { notNull: true }),
          col("icpUrl", "TEXT", { notNull: true }),
          col("id", "INTEGER", { notNull: true }),
          col("policeText", "TEXT", { notNull: true }),
          col("policeUrl", "TEXT", { notNull: true }),
          col("postsPerPage", "INTEGER", { notNull: true }),
          col("subtitle", "TEXT", { notNull: true }),
          col("title", "TEXT", { notNull: true }),
          col("updatedAt", "TEXT", { notNull: true }),
          col("version", "INTEGER", { notNull: true }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createTable({
        table: "social_account",
        columns: [
          col("enabled", "INTEGER", { notNull: true }),
          col("icon", "TEXT", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("imageUrl", "TEXT", { notNull: true }),
          col("label", "TEXT", { notNull: true }),
          col("position", "INTEGER", { notNull: true }),
          col("settingId", "INTEGER", { notNull: true }),
          col("url", "TEXT", { notNull: true }),
        ],
        constraints: [
          primaryKey(["id"]),
          foreignKey(["settingId"], "site_setting", ["id"], { onDelete: "cascade" }),
        ],
      }),
      this.createIndex({
        table: "social_account",
        index: "social_account_settingId_idx_c16f9ff8",
        columns: ["settingId"],
      }),
      this.createIndex({
        table: "social_account",
        index: "social_account_settingId_position_idx_e0140a9b",
        columns: ["settingId", "position"],
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
