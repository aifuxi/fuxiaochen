#!/usr/bin/env -S node
import { Migration, MigrationCLI, col, primaryKey } from "@prisma/orm-sqlite/migration";

import type { Contract as Start } from "../../snapshots/5bdcabecfa326ccdb9dd1f9ebaef5f81ef7add36a13fe02d0429bbed06ccd090/contract";
import type { Contract as End } from "../../snapshots/88bc0925deee6180938e34cf81239c08fc9c0b065c176db9833f63600c2dcc3f/contract";

import startContract from "../../snapshots/5bdcabecfa326ccdb9dd1f9ebaef5f81ef7add36a13fe02d0429bbed06ccd090/contract.json" with { type: "json" };
import endContract from "../../snapshots/88bc0925deee6180938e34cf81239c08fc9c0b065c176db9833f63600c2dcc3f/contract.json" with { type: "json" };

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        table: "friend_link",
        columns: [
          col("avatar", "TEXT", { notNull: true }),
          col("category", "TEXT", { notNull: true }),
          col("createdAt", "TEXT", { notNull: true }),
          col("description", "TEXT", { notNull: true }),
          col("enabled", "INTEGER", { notNull: true }),
          col("id", "TEXT", { notNull: true }),
          col("name", "TEXT", { notNull: true }),
          col("status", "TEXT", { notNull: true }),
          col("updatedAt", "TEXT", { notNull: true }),
          col("url", "TEXT", { notNull: true }),
          col("version", "INTEGER", { notNull: true }),
        ],
        constraints: [primaryKey(["id"])],
      }),
      this.createIndex({
        table: "friend_link",
        index: "friend_link_createdAt_id_idx_3855cff1",
        columns: ["createdAt", "id"],
      }),
      this.createIndex({
        table: "friend_link",
        index: "friend_link_status_enabled_idx_d0122654",
        columns: ["status", "enabled"],
      }),
    ];
  }
}

await MigrationCLI.run(import.meta.url, M);
